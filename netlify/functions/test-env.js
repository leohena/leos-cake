exports.handler = async (event, context) => {
  console.log('🧪 Teste de variáveis de ambiente');
  console.log('📋 Todas as env vars com SUPABASE:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));

  const result = {
    timestamp: new Date().toISOString(),
    environment: {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'DEFINED' : 'UNDEFINED',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'DEFINED' : 'UNDEFINED',
      BREVO_API_KEY: process.env.BREVO_API_KEY ? 'DEFINED' : 'UNDEFINED'
    },
    values: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.substring(0, 20) + '...' : null,
      BREVO_API_KEY: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 20) + '...' : null
    }
  };

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(result, null, 2)
  };
};