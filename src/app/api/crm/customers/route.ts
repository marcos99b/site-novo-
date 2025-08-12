import { NextRequest, NextResponse } from "next/server";
import { crmService } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (email) {
      const customer = await crmService.getCustomer(email);
      return NextResponse.json({ 
        success: true, 
        customer: customer || null
      });
    }

    // Se não especificar email, retornar erro (implementar paginação depois)
    return NextResponse.json(
      { success: false, error: "Email é obrigatório para buscar cliente" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao buscar cliente",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, address } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se já existe um cliente com este email
    const existingCustomer = await crmService.getCustomer(email);
    
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Cliente já existe com este email" },
        { status: 409 }
      );
    }

    const customer = await crmService.createCustomer({
      email,
      name,
      phone,
      address
    });

    return NextResponse.json({ 
      success: true, 
      customer,
      message: "Cliente criado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao criar cliente",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, phone, address } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID do cliente é obrigatório" },
        { status: 400 }
      );
    }

    const customer = await crmService.updateCustomer(id, {
      email,
      name,
      phone,
      address
    });

    return NextResponse.json({ 
      success: true, 
      customer,
      message: "Cliente atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao atualizar cliente",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
