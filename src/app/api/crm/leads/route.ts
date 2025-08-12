import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Por enquanto, retornar dados mockados até resolver a tabela
    const mockLeads = [
      {
        id: '1',
        email: 'cliente1@exemplo.com',
        name: 'Cliente Exemplo 1',
        phone: '+55 11 99999-9999',
        source: 'website',
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'cliente2@exemplo.com',
        name: 'Cliente Exemplo 2',
        phone: '+55 11 88888-8888',
        source: 'social',
        status: 'contacted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({ 
      success: true, 
      leads: mockLeads 
    });
  } catch (error) {
    console.error("Erro ao buscar leads:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao buscar leads",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, source = "website", notes } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Por enquanto, simular criação de lead
    const mockLead = {
      id: Date.now().toString(),
      email,
      name,
      phone,
      source,
      notes,
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      lead: mockLead,
      message: "Lead criado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Erro ao criar lead",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
