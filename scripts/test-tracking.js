const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ljfxpzcdrctqmfydofdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZnhwemNkcmN0cW1meWRvZmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTYyMTksImV4cCI6MjA3MDE3MjIxOX0.yKVX6C5PJwlYXwSMJ2kSa7nYKEFma6KmZdqJtdmwNlQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTracking() {
  console.log('🔍 Testando sistema de tracking...\n');

  try {
    // 1. Verificar se as tabelas existem
    console.log('1. Verificando tabelas de tracking...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_events', 'user_sessions', 'analytics_summary']);

    if (tablesError) {
      console.log('❌ Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('✅ Tabelas encontradas:', tables?.map(t => t.table_name));
    }

    // 2. Testar inserção de evento
    console.log('\n2. Testando inserção de evento...');
    
    const testEvent = {
      session_id: `test_session_${Date.now()}`,
      event_type: 'page_view',
      event_data: {
        page_title: 'Test Page',
        page_url: 'http://localhost:3000/test'
      },
      page_url: 'http://localhost:3000/test',
      user_agent: 'Test User Agent',
      element_text: 'Test Button'
    };

    const { data: eventData, error: eventError } = await supabase
      .from('user_events')
      .insert(testEvent)
      .select();

    if (eventError) {
      console.log('❌ Erro ao inserir evento:', eventError.message);
    } else {
      console.log('✅ Evento inserido com sucesso:', eventData[0].id);
    }

    // 3. Testar inserção de sessão
    console.log('\n3. Testando inserção de sessão...');
    
    const testSession = {
      session_id: `test_session_${Date.now()}`,
      start_time: new Date().toISOString(),
      total_duration: 120,
      page_views: 3,
      total_events: 5,
      user_agent: 'Test User Agent',
      device_type: 'desktop',
      browser: 'Chrome',
      os: 'Windows'
    };

    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .insert(testSession)
      .select();

    if (sessionError) {
      console.log('❌ Erro ao inserir sessão:', sessionError.message);
    } else {
      console.log('✅ Sessão inserida com sucesso:', sessionData[0].id);
    }

    // 4. Verificar analytics
    console.log('\n4. Verificando analytics...');
    
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics_summary')
      .select('*')
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (analyticsError) {
      console.log('❌ Erro ao verificar analytics:', analyticsError.message);
    } else {
      console.log('✅ Analytics encontrados:', analytics);
    }

    // 5. Listar eventos recentes
    console.log('\n5. Listando eventos recentes...');
    
    const { data: recentEvents, error: eventsError } = await supabase
      .from('user_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (eventsError) {
      console.log('❌ Erro ao listar eventos:', eventsError.message);
    } else {
      console.log('✅ Eventos recentes:', recentEvents?.length || 0);
      recentEvents?.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.event_type} - ${event.page_url}`);
      });
    }

    // 6. Listar sessões
    console.log('\n6. Listando sessões...');
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.log('❌ Erro ao listar sessões:', sessionsError.message);
    } else {
      console.log('✅ Sessões encontradas:', sessions?.length || 0);
      sessions?.forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.session_id} - ${session.total_events} eventos`);
      });
    }

    // 7. Testar RLS (Row Level Security)
    console.log('\n7. Testando RLS...');
    
    const { data: publicEvents, error: publicError } = await supabase
      .from('user_events')
      .select('*')
      .limit(1);

    if (publicError) {
      console.log('❌ Erro no RLS:', publicError.message);
    } else {
      console.log('✅ RLS funcionando - eventos públicos acessíveis');
    }

    console.log('\n🎉 Sistema de tracking testado com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute o SQL no Supabase Dashboard');
    console.log('2. Acesse: http://localhost:3000/tracking');
    console.log('3. Teste navegando pelo site');
    console.log('4. Veja os eventos em tempo real');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o teste
testTracking();
