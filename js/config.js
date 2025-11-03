/**
 * Configurações Simplificadas do Sistema Leo's Cake
 * Gerencia apenas: senha do sistema e lista de usuários
 * Credenciais Supabase estão hardcoded no app.js
 */

class ConfigManager {
    constructor() {
        this.config = null;
    }

    /**
     * Inicializa as configurações do sistema
     */
    async init() {
        console.log('🔧 Inicializando ConfigManager...');
        
        // Carregar configurações do arquivo config.json
        await this.loadConfigFile();
        
        // Mesclar com configurações locais (preferências)
        this.mergeLocalPreferences();
        
        console.log('✅ ConfigManager inicializado');
        return this.config;
    }

    /**
     * Carrega configurações do arquivo config.json
     */
    async loadConfigFile() {
        try {
            const response = await fetch('./config.json');
            if (response.ok) {
                const fileConfig = await response.json();
                this.config = fileConfig;
                console.log('📁 Configurações carregadas do arquivo config.json');
            } else {
                console.log('⚠️ Arquivo config.json não encontrado, usando configurações padrão');
                this.config = this.getDefaultConfig();
            }
        } catch (error) {
            console.log('⚠️ Erro ao carregar config.json, usando configurações padrão:', error.message);
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * Configurações padrão do sistema
     */
    getDefaultConfig() {
        return {
            empresa: {
                nome: "Leo's Cake",
                telefone: "",
                endereco: "",
                email: ""
            },
            sistemaSenha: "leoscake2024",
            usuarios: []
        };
    }

    /**
     * Mescla preferências do usuário armazenadas localmente
     */
    mergeLocalPreferences() {
        try {
            // Apenas preferências de interface, não dados sensíveis
            const preferences = JSON.parse(localStorage.getItem('leos_cake_preferences') || '{}');
            
            if (preferences.empresa) {
                this.config.empresa = { ...this.config.empresa, ...preferences.empresa };
            }
            
            console.log('🎨 Preferências locais mescladas');
        } catch (error) {
            console.log('⚠️ Erro ao carregar preferências locais:', error.message);
        }
    }

    /**
     * Salva preferências do usuário localmente
     */
    saveLocalPreferences() {
        try {
            const preferences = {
                empresa: this.config.empresa
            };
            
            localStorage.setItem('leos_cake_preferences', JSON.stringify(preferences));
            console.log('💾 Preferências salvas localmente');
        } catch (error) {
            console.log('⚠️ Erro ao salvar preferências:', error.message);
        }
    }

    /**
     * Atualizar senha do sistema
     */
    updateSistemaSenha(novaSenha) {
        this.config.sistemaSenha = novaSenha;
        this.saveConfig();
    }

    /**
     * Adicionar novo usuário
     */
    addUsuario(usuario) {
        const novoUsuario = {
            id: Date.now().toString(),
            nome: usuario.nome,
            email: usuario.email,
            nivel: usuario.nivel || 'operador', // admin, operador
            ativo: true,
            criadoEm: new Date().toISOString()
        };
        
        this.config.usuarios.push(novoUsuario);
        this.saveConfig();
        return novoUsuario;
    }

    /**
     * Remover usuário
     */
    removeUsuario(usuarioId) {
        this.config.usuarios = this.config.usuarios.filter(u => u.id !== usuarioId);
        this.saveConfig();
    }

    /**
     * Atualizar usuário
     */
    updateUsuario(usuarioId, dadosAtualizados) {
        const index = this.config.usuarios.findIndex(u => u.id === usuarioId);
        if (index >= 0) {
            this.config.usuarios[index] = { ...this.config.usuarios[index], ...dadosAtualizados };
            this.saveConfig();
            return this.config.usuarios[index];
        }
        return null;
    }

    /**
     * Salvar configurações (apenas no localStorage por ora)
     */
    async saveConfig() {
        try {
            // Por ora, salvar no localStorage
            // Em produção, deveria salvar no servidor/Supabase
            localStorage.setItem('leos_cake_config', JSON.stringify(this.config));
            console.log('✅ Configurações salvas');
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            throw new Error('Erro ao salvar configurações');
        }
    }

    /**
     * Verificar senha do sistema
     */
    verificarSenha(senha) {
        return senha === this.config.sistemaSenha;
    }

    /**
     * Obter configurações públicas (sem senha)
     */
    getPublicConfig() {
        const { sistemaSenha, ...publicConfig } = this.config;
        return publicConfig;
    }

    /**
     * Obter configuração específica
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
    }

    /**
     * Definir configuração específica
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this.config);
        target[lastKey] = value;
        this.saveConfig();
    }
}

// Instância global
window.configManager = new ConfigManager();

// Auto-inicializar se DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.configManager.init();
    });
} else {
    window.configManager.init();
}