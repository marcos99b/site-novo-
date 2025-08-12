import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { monitoring } from "@/lib/monitoring";
import { cjClient } from "@/lib/cj";

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentMethod, paymentData } = await req.json();
    
    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "orderId e paymentMethod são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar o pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o pedido já foi pago
    if (order.status === 'paid') {
      return NextResponse.json(
        { success: false, error: "Pedido já foi pago" },
        { status: 400 }
      );
    }

    // Verificar se há produtos CJ válidos no pedido
    const cjItems = order.items.filter(item => item.variant.cjVariantId);
    if (cjItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Pedido não contém produtos da CJ Dropshipping" },
        { status: 400 }
      );
    }

    // Verificar estoque local antes do pagamento
    try {
      const stockCheck = cjItems.map((item) => {
        return {
          variantId: item.variant.cjVariantId,
          requested: item.quantity,
          available: item.variant.stock || 0,
          name: item.variant.name
        };
      });

      const outOfStock = stockCheck.filter(item => item.requested > item.available);
      if (outOfStock.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Produtos sem estoque suficiente",
            outOfStock 
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
      return NextResponse.json(
        { success: false, error: "Erro ao verificar estoque" },
        { status: 500 }
      );
    }

    // Simular processamento de pagamento
    let paymentStatus = 'pending';
    let paymentId = null;
    let error = null;

    try {
      // Validar e processar diferentes métodos de pagamento
      switch (paymentMethod) {
        case 'pix':
          // PIX sempre funciona (simulação)
          paymentId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          paymentStatus = 'completed';
          break;
          
        case 'credit_card':
          // Validar dados do cartão
          if (!paymentData?.cardNumber || !paymentData?.cardName || !paymentData?.expiry || !paymentData?.cvv) {
            paymentStatus = 'failed';
            error = 'Dados do cartão incompletos';
            break;
          }
          
          // Validar formato do número do cartão (pelo menos 13 dígitos)
          if (paymentData.cardNumber.replace(/\s/g, '').length < 13) {
            paymentStatus = 'failed';
            error = 'Número do cartão inválido';
            break;
          }
          
          // Validar formato da data de validade (MM/AA)
          if (!/^\d{2}\/\d{2}$/.test(paymentData.expiry)) {
            paymentStatus = 'failed';
            error = 'Data de validade inválida (use MM/AA)';
            break;
          }
          
          // Validar CVV (3 ou 4 dígitos)
          if (!/^\d{3,4}$/.test(paymentData.cvv)) {
            paymentStatus = 'failed';
            error = 'CVV inválido';
            break;
          }
          
          // Simular cartão recusado (números terminando em 0000)
          if (paymentData.cardNumber.replace(/\s/g, '').endsWith('0000')) {
            paymentStatus = 'failed';
            error = 'Cartão recusado pela operadora';
            break;
          }
          
          // Simular cartão com limite insuficiente (números terminando em 1111)
          if (paymentData.cardNumber.replace(/\s/g, '').endsWith('1111')) {
            paymentStatus = 'failed';
            error = 'Limite insuficiente';
            break;
          }
          
          // Cartão aprovado
          paymentId = `cc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          paymentStatus = 'completed';
          break;
          
        case 'boleto':
          // Boleto sempre gera código pendente
          paymentId = `boleto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          paymentStatus = 'pending'; // Boleto fica pendente até pagamento
          break;
          
        default:
          paymentStatus = 'failed';
          error = 'Método de pagamento não suportado';
      }

      // Se o pagamento foi aprovado, simular criação do pedido na CJ
      let cjOrderId = null;
      if (paymentStatus === 'completed') {
        try {
          // Simular criação do pedido na CJ (offline)
          cjOrderId = `cj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log('Pedido simulado na CJ:', cjOrderId);
          
          // Em produção, aqui seria a chamada real para a CJ
          // const cjResponse = await cjClient.createOrderV2(cjOrderData);
          // cjOrderId = cjResponse?.data?.orderId;
        } catch (cjError) {
          console.error('Erro ao simular pedido na CJ:', cjError);
          // Continuar mesmo com erro na CJ
        }
      }

      // Atualizar pedido com informações de pagamento
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: paymentStatus === 'completed' ? 'paid' : 'payment_pending',
          cjOrderId: cjOrderId
        }
      });

      monitoring.addMetric('payment_processed', 1, { method: paymentMethod, status: paymentStatus });
      monitoring.addMetric('cj_order_created', cjOrderId ? 1 : 0, { success: cjOrderId ? 'true' : 'false' });

      return NextResponse.json({
        success: true,
        paymentId,
        paymentStatus,
        orderId,
        cjOrderId,
        message: paymentStatus === 'completed' 
          ? 'Pagamento processado com sucesso!' 
          : paymentStatus === 'pending' 
            ? 'Pagamento pendente de confirmação'
            : `Erro no pagamento: ${error}`
      });

    } catch (paymentError) {
      monitoring.logError(paymentError as Error, { endpoint: '/api/payment', orderId });
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'payment_failed'
        }
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao processar pagamento',
          details: paymentError instanceof Error ? paymentError.message : 'Erro desconhecido'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    monitoring.logError(error as Error, { endpoint: '/api/payment' });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId é obrigatório" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        cjOrderId: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        orderId: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        cjOrderId: order.cjOrderId
      }
    });

  } catch (error) {
    monitoring.logError(error as Error, { endpoint: '/api/payment' });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
