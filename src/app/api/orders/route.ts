import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cjClient } from "@/lib/cj";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      // Buscar pedido específico
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
      return NextResponse.json({ orders: order ? [order] : [] });
    } else {
      // Buscar todos os pedidos
      const orders = await prisma.order.findMany({ 
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ orders });
    }
  } catch (e) {
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    let email = "";
    let items: Array<{ variantId: string; quantity: number; cjVariantId?: string }>; 
    let shippingAddress: any;

    if (req.headers.get("content-type")?.includes("application/json")) {
      const body = await req.json();
      email = body.email;
      items = body.items || [];
      shippingAddress = body.shippingAddress;
    } else {
      const form = await req.formData();
      email = String(form.get("email") || "cliente@example.com");
      items = [
        {
          variantId: String(form.get("variantId") || ""),
          quantity: Number(form.get("quantity") || 1),
        },
      ];
      shippingAddress = {
        country: String(form.get("country") || "BR"),
        state: String(form.get("state") || "SP"),
        city: String(form.get("city") || "São Paulo"),
        address: String(form.get("address") || "Rua Exemplo, 123"),
        zip: String(form.get("zip") || "01000-000"),
        name: String(form.get("name") || "Cliente"),
        phone: String(form.get("phone") || "+55 11 99999-9999"),
      };
    }

    const order = await prisma.order.create({ data: { email, status: "created", totalAmount: 0 } });

    let total = 0;
    for (const it of items as Array<{ variantId: string; quantity: number }>) {
      const variant = await prisma.variant.findUnique({ where: { id: it.variantId } });
      if (!variant) continue;
      total += variant.price * it.quantity;
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          variantId: variant.id,
          quantity: it.quantity,
          unitPrice: variant.price,
        },
      });
    }

    // Tentar criar pedido na CJ, mas não falhar se der erro
    let cjResponse = null;
    try {
      const cjPayload = {
        customerName: email,
        shippingAddress,
        items: await Promise.all(
          (items || []).map(async (it: any) => {
            if (it.cjVariantId) return { vid: it.cjVariantId, quantity: it.quantity };
            const v = await prisma.variant.findUnique({ where: { id: it.variantId } });
            return { vid: v?.cjVariantId, quantity: it.quantity };
          })
        ),
      };

      cjResponse = await cjClient.createOrderV2(cjPayload);
    } catch (cjError) {
      console.error("Erro ao criar pedido na CJ:", cjError);
      // Continuar mesmo se falhar na CJ
    }

    await prisma.order.update({ 
      where: { id: order.id }, 
      data: { 
        totalAmount: total, 
        cjOrderId: cjResponse?.data?.orderId || null, 
        status: cjResponse?.code === 200 ? "submitted" : "created" 
      } 
    });

    return NextResponse.json({ 
      orderId: order.id, 
      cjResponse: cjResponse,
      status: "success",
      checkoutUrl: `/checkout?orderId=${order.id}`
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar pedido" },
      { status: 500 }
    );
  }
}


