// env-config.js - Configuração de variáveis de ambiente
class EnvConfig {
    constructor() {
        // Tentar carregar variáveis de ambiente ou usar fallbacks hardcoded
        this.SUPABASE_URL = this.getEnvVar('VITE_SUPABASE_URL') || 'https://qzuccgbxddzpbotxvjug.supabase.co';
        this.SUPABASE_ANON_KEY = this.getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dWNjZ2J4ZGR6cGJvdHh2anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODE1NTQsImV4cCI6MjA3Nzc1NzU1NH0.jMtCOeyS3rLLanJzeWv0j1cYQFnFUBjZmnwMe5aUNk4';
        this.SYSTEM_PASSWORD = this.getEnvVar('VITE_SYSTEM_PASSWORD') || 'leoscake2024';
        this.REALTIME_ENABLED = this.getEnvVar('VITE_REALTIME_ENABLED') === 'true' || true;
        
        console.log('🔧 Configuração de ambiente carregada:', {
            url: this.SUPABASE_URL ? '✅ Configurado' : '❌ Não encontrado',
            key: this.SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não encontrado',
            password: this.SYSTEM_PASSWORD ? '✅ Configurado' : '❌ Não encontrado',
            realtime: this.REALTIME_ENABLED ? '✅ Habilitado' : '❌ Desabilitado'
        });
    }
    
    getEnvVar(name) {
        // Para ambiente de produção/navegador, usar window.env se disponível
        if (typeof window !== 'undefined' && window.env) {
            return window.env[name];
        }
        
        // Para Node.js/build time
        if (typeof process !== 'undefined' && process.env) {
            return process.env[name];
        }
        
        return null;
    }
    
    getSupabaseConfig() {
        return {
            url: this.SUPABASE_URL,
            anonKey: this.SUPABASE_ANON_KEY,
            realtime: this.REALTIME_ENABLED
        };
    }
    
    getSystemConfig() {
        return {
            password: this.SYSTEM_PASSWORD
        };
    }
}

// Exportar configuração global
window.ENV_CONFIG = new EnvConfig();