import { NextRequest, NextResponse } from 'next/server';

// Sistema de CRM ULTRA MEGA RÁPIDO (100% offline)
interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  category: string;
  source: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  interests: string[];
  createdAt: string;
  lastContacted?: string;
  notes?: string;
}

// Armazenamento em memória para demonstração (em produção seria um banco real)
let leads: Lead[] = [];

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, category = 'Geral', source = 'website', interests = [] } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Verificar se o lead já existe
    const existingLead = leads.find(lead => lead.email === email);
    
    if (existingLead) {
      // Atualizar lead existente
      existingLead.lastContacted = new Date().toISOString();
      existingLead.interests = [...new Set([...existingLead.interests, ...interests])];
      existingLead.status = 'contacted';
      
      return NextResponse.json({ 
        success: true, 
        message: 'Lead atualizado com sucesso',
        lead: existingLead 
      });
    }

    // Criar novo lead
    const newLead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      phone,
      category,
      source,
      status: 'new',
      interests,
      createdAt: new Date().toISOString(),
      notes: `Lead capturado via ${source}`
    };

    leads.push(newLead);

    // Simular integração com sistema de email marketing
    console.log(`🎯 NOVO LEAD CAPTURADO: ${email} - ${category}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Lead registrado com sucesso',
      lead: newLead 
    });

  } catch (error) {
    console.error('Erro ao registrar lead:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let filteredLeads = leads;

    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }

    if (category) {
      filteredLeads = filteredLeads.filter(lead => lead.category === category);
    }

    return NextResponse.json({ 
      leads: filteredLeads,
      total: filteredLeads.length,
      performance: 'ULTRA_MEGA_FAST_CRM'
    });

  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
