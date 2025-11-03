/**
 * Configurações do Sistema Leo's Cake
 * Este arquivo gerencia configurações sensíveis e não-sensíveis de forma segura
 */

class ConfigManager {
    constructor() {
        this.config = null;
        this.isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1';
    }

    /**
     * Inicializa as configurações do sistema
     */
    async init() {
        console.log('🔧 Inicializando ConfigManager...');
        
        // Carregar configurações do arquivo config.json
        await this.loadConfigFile();
        
        // Mesclar com configurações do localStorage (apenas não-sensíveis)
        this.mergeLocalStorageConfig();
        
        // Validar configurações essenciais
        this.validateConfig();
        
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
     * Mescla configurações não-sensíveis do localStorage
     */
    mergeLocalStorageConfig() {
        const localConfig = JSON.parse(localStorage.getItem('leos_cake_config') || '{}');
        
        // Apenas configurações não-sensíveis podem vir do localStorage
        const allowedLocalKeys = [
            'empresa.nome',
            'empresa.telefone', 
            'empresa.endereco',
            'empresa.email',
            'sistemaSenha'
        ];

        allowedLocalKeys.forEach(key => {
            const keys = key.split('.');
            let localValue = localConfig;
            let configValue = this.config;
            
            // Navegar pela estrutura aninhada
            for (let i = 0; i < keys.length - 1; i++) {
                if (!localValue[keys[i]]) return;
                localValue = localValue[keys[i]];
                
                if (!configValue[keys[i]]) configValue[keys[i]] = {};
                configValue = configValue[keys[i]];
            }
            
            // Aplicar valor se existir no localStorage
            const finalKey = keys[keys.length - 1];
            if (localValue[finalKey] !== undefined) {
                configValue[finalKey] = localValue[finalKey];
            }
        });
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
            supabase: {
                url: process.env.SUPABASE_URL || "",
                anonKey: process.env.SUPABASE_ANON_KEY || "",
                realtime: true
            },
            emailjs: {
                serviceId: process.env.EMAILJS_SERVICE_ID || "",
                templateId: process.env.EMAILJS_TEMPLATE_ID || "",
                userId: process.env.EMAILJS_USER_ID || ""
            },
            sistemaSenha: "leoscake2024", // Deve ser alterada pelo usuário
            security: {
                allowConfigEdit: !this.isProduction, // Bloquear edição em produção
                requireHttps: this.isProduction
            }
        };
    }

    /**
     * Valida se as configurações essenciais estão presentes
     */
    validateConfig() {
        const requiredFields = [
            'supabase.url',
            'supabase.anonKey'
        ];

        const missing = [];
        
        requiredFields.forEach(field => {
            const keys = field.split('.');
            let value = this.config;
            
            for (const key of keys) {
                if (!value || !value[key]) {
                    missing.push(field);
                    break;
                }
                value = value[key];
            }
        });

        if (missing.length > 0) {
            console.warn('⚠️ Configurações obrigatórias não encontradas:', missing);
            console.warn('📝 Configure as variáveis de ambiente ou arquivo config.json');
        }
    }

    /**
     * Salva configurações não-sensíveis no localStorage
     */
    saveLocalConfig(updates) {
        const currentLocal = JSON.parse(localStorage.getItem('leos_cake_config') || '{}');
        
        // Apenas permitir alteração de campos não-sensíveis
        const allowedUpdates = {
            empresa: updates.empresa || {},
            sistemaSenha: updates.sistemaSenha
        };

        // Mesclar atualizações
        const newLocal = {
            ...currentLocal,
            ...allowedUpdates
        };

        localStorage.setItem('leos_cake_config', JSON.stringify(newLocal));
        
        // Atualizar configuração atual
        this.mergeLocalStorageConfig();
        
        console.log('💾 Configurações locais salvas');
    }

    /**
     * Obtém uma configuração específica
     */
    get(path) {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (!value || value[key] === undefined) {
                return null;
            }
            value = value[key];
        }
        
        return value;
    }

    /**
     * Verifica se o sistema está configurado corretamente
     */
    isConfigured() {
        return !!(this.get('supabase.url') && this.get('supabase.anonKey'));
    }

    /**
     * Obtém todas as configurações (sem expor dados sensíveis nos logs)
     */
    getConfig() {
        return this.config;
    }

    /**
     * Obtém configurações públicas (sem dados sensíveis)
     */
    getPublicConfig() {
        return {
            empresa: this.config.empresa,
            security: this.config.security,
            isConfigured: this.isConfigured(),
            environment: this.isProduction ? 'production' : 'development'
        };
    }
}

// Instância global do gerenciador de configurações
window.configManager = new ConfigManager();