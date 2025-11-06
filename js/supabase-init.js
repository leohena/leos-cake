/**
 * supabase-init.js - Inicialização segura do Supabase
 */

const SUPABASE_URL = 'https://qzuccgbxddzpbotxvjug.supabase.co';  // SUBSTITUA
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dWNjZ2J4ZGR6cGJvdHh2anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODE1NTQsImV4cCI6MjA3Nzc1NzU1NH0.jMtCOeyS3rLLanJzeWv0j1cYQFnFUBjZmnwMe5aUNk4';              // SUBSTITUA

log('Inicializando Supabase...');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('ERRO: Configure SUPABASE_URL e SUPABASE_ANON_KEY em supabase-init.js');
    window.supabase = null;
} else {
    const { createClient } = window['@supabase/supabase-js'];
    window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    log('Supabase inicializado com sucesso');
}