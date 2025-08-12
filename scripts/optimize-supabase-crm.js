#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function optimizeSupabaseCRM() {
  console.log('🚀 Otimizando CRM no Supabase...\n');

  try {
    // 1. Criar tabelas de CRM otimizadas
    console.log('📋 Criando tabelas de CRM otimizadas...');
    
    const crmTables = `
      -- Tabela de clientes otimizada
      CREATE TABLE IF NOT EXISTS crm_customers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        company VARCHAR(200),
        source VARCHAR(100) DEFAULT 'website',
        status VARCHAR(50) DEFAULT 'active',
        tags TEXT[],
        notes TEXT,
        total_orders INTEGER DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        last_order_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de leads otimizada
      CREATE TABLE IF NOT EXISTS crm_leads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        company VARCHAR(200),
        source VARCHAR(100) DEFAULT 'website',
        status VARCHAR(50) DEFAULT 'new',
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_to UUID,
        tags TEXT[],
        notes TEXT,
        score INTEGER DEFAULT 0,
        last_contact_date TIMESTAMP WITH TIME ZONE,
        next_follow_up TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de interações
      CREATE TABLE IF NOT EXISTS crm_interactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_id UUID REFERENCES crm_customers(id) ON DELETE CASCADE,
        lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        channel VARCHAR(50),
        subject VARCHAR(200),
        content TEXT,
        status VARCHAR(50) DEFAULT 'completed',
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de campanhas
      CREATE TABLE IF NOT EXISTS crm_campaigns (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'draft',
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE,
        budget DECIMAL(10,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de segmentação
      CREATE TABLE IF NOT EXISTS crm_segments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        criteria JSONB,
        customer_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Tabela de automações
      CREATE TABLE IF NOT EXISTS crm_automations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        trigger_type VARCHAR(50),
        trigger_conditions JSONB,
        actions JSONB,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: tablesError } = await supabase.rpc('exec_sql', { sql: crmTables });
    
    if (tablesError) {
      console.error('❌ Erro ao criar tabelas:', tablesError);
      return;
    }

    console.log('✅ Tabelas de CRM criadas com sucesso!');

    // 2. Criar índices para performance
    console.log('\n🔍 Criando índices para performance...');
    
    const indexes = `
      -- Índices para crm_customers
      CREATE INDEX IF NOT EXISTS idx_crm_customers_email ON crm_customers(email);
      CREATE INDEX IF NOT EXISTS idx_crm_customers_status ON crm_customers(status);
      CREATE INDEX IF NOT EXISTS idx_crm_customers_source ON crm_customers(source);
      CREATE INDEX IF NOT EXISTS idx_crm_customers_created_at ON crm_customers(created_at);
      CREATE INDEX IF NOT EXISTS idx_crm_customers_total_spent ON crm_customers(total_spent);

      -- Índices para crm_leads
      CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email);
      CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(status);
      CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(source);
      CREATE INDEX IF NOT EXISTS idx_crm_leads_priority ON crm_leads(priority);
      CREATE INDEX IF NOT EXISTS idx_crm_leads_next_follow_up ON crm_leads(next_follow_up);

      -- Índices para crm_interactions
      CREATE INDEX IF NOT EXISTS idx_crm_interactions_customer_id ON crm_interactions(customer_id);
      CREATE INDEX IF NOT EXISTS idx_crm_interactions_lead_id ON crm_interactions(lead_id);
      CREATE INDEX IF NOT EXISTS idx_crm_interactions_type ON crm_interactions(type);
      CREATE INDEX IF NOT EXISTS idx_crm_interactions_created_at ON crm_interactions(created_at);

      -- Índices para crm_campaigns
      CREATE INDEX IF NOT EXISTS idx_crm_campaigns_status ON crm_campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_crm_campaigns_start_date ON crm_campaigns(start_date);

      -- Índices para crm_segments
      CREATE INDEX IF NOT EXISTS idx_crm_segments_name ON crm_segments(name);

      -- Índices para crm_automations
      CREATE INDEX IF NOT EXISTS idx_crm_automations_status ON crm_automations(status);
      CREATE INDEX IF NOT EXISTS idx_crm_automations_trigger_type ON crm_automations(trigger_type);
    `;

    const { error: indexesError } = await supabase.rpc('exec_sql', { sql: indexes });
    
    if (indexesError) {
      console.error('❌ Erro ao criar índices:', indexesError);
      return;
    }

    console.log('✅ Índices criados com sucesso!');

    // 3. Criar funções para automação
    console.log('\n⚙️ Criando funções de automação...');
    
    const functions = `
      -- Função para atualizar updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Função para calcular score do lead
      CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
      RETURNS INTEGER AS $$
      DECLARE
          score INTEGER := 0;
          interaction_count INTEGER;
          days_since_creation INTEGER;
      BEGIN
          -- Contar interações
          SELECT COUNT(*) INTO interaction_count
          FROM crm_interactions
          WHERE lead_id = $1;
          
          score := score + (interaction_count * 10);
          
          -- Calcular dias desde criação
          SELECT EXTRACT(DAY FROM NOW() - created_at) INTO days_since_creation
          FROM crm_leads
          WHERE id = $1;
          
          -- Penalizar leads antigos
          IF days_since_creation > 30 THEN
              score := score - 20;
          END IF;
          
          RETURN GREATEST(0, score);
      END;
      $$ LANGUAGE plpgsql;

      -- Função para segmentar clientes automaticamente
      CREATE OR REPLACE FUNCTION auto_segment_customers()
      RETURNS VOID AS $$
      BEGIN
          -- Clientes VIP (gastaram mais de R$ 1000)
          INSERT INTO crm_segments (name, description, criteria, customer_count)
          SELECT 
              'Clientes VIP',
              'Clientes que gastaram mais de R$ 1000',
              jsonb_build_object('min_total_spent', 1000),
              COUNT(*)
          FROM crm_customers
          WHERE total_spent >= 1000
          ON CONFLICT (name) DO UPDATE SET
              customer_count = EXCLUDED.customer_count,
              updated_at = NOW();

          -- Clientes novos (últimos 30 dias)
          INSERT INTO crm_segments (name, description, criteria, customer_count)
          SELECT 
              'Clientes Novos',
              'Clientes dos últimos 30 dias',
              jsonb_build_object('days_since_creation', 30),
              COUNT(*)
          FROM crm_customers
          WHERE created_at >= NOW() - INTERVAL '30 days'
          ON CONFLICT (name) DO UPDATE SET
              customer_count = EXCLUDED.customer_count,
              updated_at = NOW();

          -- Clientes inativos (sem pedidos nos últimos 90 dias)
          INSERT INTO crm_segments (name, description, criteria, customer_count)
          SELECT 
              'Clientes Inativos',
              'Clientes sem pedidos nos últimos 90 dias',
              jsonb_build_object('days_since_last_order', 90),
              COUNT(*)
          FROM crm_customers
          WHERE last_order_date < NOW() - INTERVAL '90 days'
          ON CONFLICT (name) DO UPDATE SET
              customer_count = EXCLUDED.customer_count,
              updated_at = NOW();
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error: functionsError } = await supabase.rpc('exec_sql', { sql: functions });
    
    if (functionsError) {
      console.error('❌ Erro ao criar funções:', functionsError);
      return;
    }

    console.log('✅ Funções criadas com sucesso!');

    // 4. Criar triggers
    console.log('\n🔗 Criando triggers...');
    
    const triggers = `
      -- Triggers para atualizar updated_at
      CREATE TRIGGER update_crm_customers_updated_at 
        BEFORE UPDATE ON crm_customers 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_crm_leads_updated_at 
        BEFORE UPDATE ON crm_leads 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_crm_campaigns_updated_at 
        BEFORE UPDATE ON crm_campaigns 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_crm_segments_updated_at 
        BEFORE UPDATE ON crm_segments 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_crm_automations_updated_at 
        BEFORE UPDATE ON crm_automations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- Trigger para atualizar score do lead
      CREATE OR REPLACE FUNCTION update_lead_score_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.score := calculate_lead_score(NEW.id);
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER update_lead_score
        BEFORE INSERT OR UPDATE ON crm_leads
        FOR EACH ROW EXECUTE FUNCTION update_lead_score_trigger();
    `;

    const { error: triggersError } = await supabase.rpc('exec_sql', { sql: triggers });
    
    if (triggersError) {
      console.error('❌ Erro ao criar triggers:', triggersError);
      return;
    }

    console.log('✅ Triggers criados com sucesso!');

    // 5. Inserir dados de exemplo
    console.log('\n📊 Inserindo dados de exemplo...');
    
    const sampleData = `
      -- Inserir clientes de exemplo
      INSERT INTO crm_customers (email, first_name, last_name, phone, source, total_orders, total_spent, last_order_date) VALUES
        ('joao.silva@email.com', 'João', 'Silva', '(11) 99999-9999', 'website', 3, 1250.00, NOW() - INTERVAL '5 days'),
        ('maria.santos@email.com', 'Maria', 'Santos', '(11) 88888-8888', 'facebook', 1, 379.00, NOW() - INTERVAL '15 days'),
        ('pedro.oliveira@email.com', 'Pedro', 'Oliveira', '(11) 77777-7777', 'google', 5, 2100.00, NOW() - INTERVAL '2 days'),
        ('ana.costa@email.com', 'Ana', 'Costa', '(11) 66666-6666', 'instagram', 2, 598.00, NOW() - INTERVAL '30 days')
      ON CONFLICT (email) DO NOTHING;

      -- Inserir leads de exemplo
      INSERT INTO crm_leads (email, first_name, last_name, phone, source, status, priority) VALUES
        ('carlos.ferreira@email.com', 'Carlos', 'Ferreira', '(11) 55555-5555', 'website', 'new', 'high'),
        ('julia.rodrigues@email.com', 'Júlia', 'Rodrigues', '(11) 44444-4444', 'facebook', 'contacted', 'medium'),
        ('lucas.martins@email.com', 'Lucas', 'Martins', '(11) 33333-3333', 'google', 'qualified', 'high'),
        ('sophia.almeida@email.com', 'Sophia', 'Almeida', '(11) 22222-2222', 'instagram', 'new', 'low')
      ON CONFLICT (email) DO NOTHING;

      -- Inserir campanhas de exemplo
      INSERT INTO crm_campaigns (name, description, type, status, start_date, end_date, budget) VALUES
        ('Black Friday 2024', 'Campanha de Black Friday com descontos especiais', 'promotional', 'active', '2024-11-20', '2024-11-30', 5000.00),
        ('Email Marketing Q1', 'Campanha de email marketing para o primeiro trimestre', 'email', 'draft', '2024-01-01', '2024-03-31', 2000.00),
        ('Redes Sociais', 'Campanha nas redes sociais para aumentar engajamento', 'social', 'active', '2024-01-01', '2024-12-31', 3000.00)
      ON CONFLICT (name) DO NOTHING;

      -- Inserir automações de exemplo
      INSERT INTO crm_automations (name, description, trigger_type, trigger_conditions, actions, status) VALUES
        ('Boas-vindas', 'Enviar email de boas-vindas para novos clientes', 'customer_created', '{"event": "customer_created"}', '{"action": "send_email", "template": "welcome"}', 'active'),
        ('Follow-up Lead', 'Enviar follow-up para leads após 3 dias', 'lead_created', '{"event": "lead_created", "delay_days": 3}', '{"action": "send_email", "template": "follow_up"}', 'active'),
        ('Abandono de Carrinho', 'Recuperar carrinhos abandonados', 'cart_abandoned', '{"event": "cart_abandoned", "delay_hours": 24}', '{"action": "send_email", "template": "cart_recovery"}', 'active')
      ON CONFLICT (name) DO NOTHING;
    `;

    const { error: dataError } = await supabase.rpc('exec_sql', { sql: sampleData });
    
    if (dataError) {
      console.error('❌ Erro ao inserir dados:', dataError);
      return;
    }

    console.log('✅ Dados de exemplo inseridos com sucesso!');

    // 6. Executar segmentação automática
    console.log('\n🎯 Executando segmentação automática...');
    
    const { error: segmentError } = await supabase.rpc('auto_segment_customers');
    
    if (segmentError) {
      console.error('❌ Erro na segmentação:', segmentError);
    } else {
      console.log('✅ Segmentação automática executada!');
    }

    // 7. Verificar resultados
    console.log('\n📈 Verificando resultados...');
    
    const { data: customers, error: customersError } = await supabase
      .from('crm_customers')
      .select('count');
    
    if (customersError) {
      console.log('❌ Erro ao verificar clientes:', customersError.message);
    } else {
      console.log(`✅ ${customers.length} clientes no CRM`);
    }

    const { data: leads, error: leadsError } = await supabase
      .from('crm_leads')
      .select('count');
    
    if (leadsError) {
      console.log('❌ Erro ao verificar leads:', leadsError.message);
    } else {
      console.log(`✅ ${leads.length} leads no CRM`);
    }

    const { data: segments, error: segmentsError } = await supabase
      .from('crm_segments')
      .select('name, customer_count');
    
    if (segmentsError) {
      console.log('❌ Erro ao verificar segmentos:', segmentsError.message);
    } else {
      console.log('✅ Segmentos criados:');
      segments.forEach(segment => {
        console.log(`   - ${segment.name}: ${segment.customer_count} clientes`);
      });
    }

    console.log('\n🎉 CRM otimizado com sucesso!');
    console.log('\n📝 Funcionalidades implementadas:');
    console.log('✅ Tabelas de CRM otimizadas');
    console.log('✅ Índices para performance');
    console.log('✅ Funções de automação');
    console.log('✅ Triggers automáticos');
    console.log('✅ Segmentação automática');
    console.log('✅ Dados de exemplo');
    console.log('✅ Sistema de scoring de leads');
    console.log('✅ Campanhas e automações');

  } catch (error) {
    console.error('❌ Erro durante a otimização:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  optimizeSupabaseCRM();
}

module.exports = { optimizeSupabaseCRM };
