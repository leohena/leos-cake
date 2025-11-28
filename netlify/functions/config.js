exports.handler = async (event, context) => {
  console.log('🔧 Função config chamada');
  console.log('📋 SUPABASE_URL:', process.env.SUPABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA');
  console.log('📋 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');

  // Retornar configurações do Supabase de forma segura
  const config = {
    supabase: {
      url: process.env.SUPABASE_URL || 'https://qzuccgbxddzpbotxvjug.supabase.co',
      anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dWNjZ2J4ZGR6cGJvdHh2anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODE1NTQsImV4cCI6MjA3Nzc1NzU1NH0.jMtCOeyS3rLLanJzeWv0j1cYQFnFUBjZmnwMe5aUNk4'
    }
  };

  console.log('📤 Retornando config:', { url: config.supabase.url ? 'OK' : 'ERRO', anonKey: config.supabase.anonKey ? 'OK' : 'ERRO' });

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