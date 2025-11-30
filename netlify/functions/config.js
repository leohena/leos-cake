exports.handler = async (event, context) => {
  console.log('🔧 Função config chamada para obter variáveis de ambiente.');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // Valida se as variáveis de ambiente essenciais estão definidas.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidas.');
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Variáveis de ambiente do servidor não configuradas corretamente.',
        details: {
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseAnonKey: !!supabaseAnonKey
        }
      })
    };
  }

  // Monta a configuração segura para o cliente.
  const config = {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey
    }
  };

  console.log('✅ Configuração segura criada a partir das variáveis de ambiente.');
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