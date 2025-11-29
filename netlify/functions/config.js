exports.handler = async (event, context) => {
  console.log('🔧 Função config chamada');

  // Detectar se estamos em produção ou desenvolvimento
  const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true';
  console.log('🏭 Ambiente:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

  // Em produção, usar variáveis de ambiente
  if (isProduction) {
    console.log('📋 SUPABASE_URL:', process.env.SUPABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA');
    console.log('📋 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Variáveis de ambiente não encontradas em produção!');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Environment variables not configured in production',
          supabaseUrl: !!supabaseUrl,
          supabaseAnonKey: !!supabaseAnonKey
        })
      };
    }

    const config = {
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey
      }
    };

    console.log('✅ Configuração de produção criada');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    };
  }

  // Em desenvolvimento, usar configurações locais
  console.log('🏠 Usando configurações de desenvolvimento');
  const config = {
    supabase: {
      url: 'https://qzuccgbxddzpbotxvjug.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dWNjZ2J4ZGR6cGJvdHh2anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODE1NTQsImV4cCI6MjA3Nzc1NzU1NH0.jMtCOeyS3rLLanJzeWv0j1cYQFnFUBjZmnwMe5aUNk4'
    }
  };

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  };
};