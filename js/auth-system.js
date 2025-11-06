// auth-system.js - Sistema de Autenticação Completo com Supabase
// Versão com múltiplas fontes de configuração

class AuthSystem {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.supabase = null;
        this.currentUser = null;
        this.config = null;
        this.isInitialized = false;
    }

    // ============================================
    // INICIALIZAÇÃO COM MÚLTIPLAS FONTES
    // ============================================
    
    async initialize() {
        try {
            console.log('🔐 Inicializando AuthSystem...');
            
            // MÉTODO 1: Tentar carregar do config.json
            try {
                const configResponse = await fetch('config.json');
                if (configResponse.ok) {
                    this.config = await configResponse.json();
                    this.supabaseUrl = this.config.supabase?.url;
                    this.supabaseKey = this.config.supabase?.anonKey;
                    console.log('✅ Credenciais carregadas de config.json');
                }
            } catch (error) {
                console.log('ℹ️ config.json não encontrado, tentando outras fontes...');
            }

            // MÉTODO 2: Tentar carregar do localStorage
            if (!this.supabaseUrl || !this.supabaseKey) {
                const storedUrl = localStorage.getItem('supabase_url');
                const storedKey = localStorage.getItem('supabase_anon_key');
                
                if (storedUrl && storedKey) {
                    this.supabaseUrl = storedUrl;
                    this.supabaseKey = storedKey;
                    console.log('✅ Credenciais carregadas do localStorage');
                }
            }

            // MÉTODO 3: Tentar carregar de variáveis globais
            if (!this.supabaseUrl || !this.supabaseKey) {
                if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                    this.supabaseUrl = window.SUPABASE_URL;
                    this.supabaseKey = window.SUPABASE_ANON_KEY;
                    console.log('✅ Credenciais carregadas de variáveis globais');
                }
            }

            // MÉTODO 4: Verificar se já estão definidas diretamente
            if (!this.supabaseUrl || !this.supabaseKey) {
                // Você pode definir diretamente aqui se quiser (não recomendado para produção)
                // this.supabaseUrl = 'https://seu-projeto.supabase.co';
                // this.supabaseKey = 'sua-chave-aqui';
            }

            // Verificar se conseguiu carregar de algum lugar
            if (!this.supabaseUrl || !this.supabaseKey) {
                console.error('❌ Credenciais do Supabase não encontradas');
                console.log('💡 Configure em uma destas opções:');
                console.log('   1. Crie arquivo config.json na raiz');
                console.log('   2. Salve no localStorage: localStorage.setItem("supabase_url", "URL")');
                console.log('   3. Defina window.SUPABASE_URL e window.SUPABASE_ANON_KEY');
                
                // Mostrar prompt para configurar
                this.showConfigPrompt();
                throw new Error('Credenciais não configuradas');
            }

            // Salvar no localStorage para próximas vezes (se não estiver lá)
            if (!localStorage.getItem('supabase_url')) {
                localStorage.setItem('supabase_url', this.supabaseUrl);
                localStorage.setItem('supabase_anon_key', this.supabaseKey);
                console.log('💾 Credenciais salvas no localStorage');
            }

            // Inicializar cliente Supabase
            const { createClient } = supabase;
            this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
            
            console.log('✅ Supabase inicializado com sucesso');
            console.log('🔗 URL:', this.supabaseUrl);
            this.isInitialized = true;
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar AuthSystem:', error);
            this.isInitialized = false;
            return false;
        }
    }

    // Mostrar prompt para configurar credenciais
    showConfigPrompt() {
        const url = prompt('Configure o Supabase URL:\n(Exemplo: https://seu-projeto.supabase.co)');
        const key = prompt('Configure o Supabase Anon Key:\n(Começa com eyJ...)');
        
        if (url && key) {
            localStorage.setItem('supabase_url', url);
            localStorage.setItem('supabase_anon_key', key);
            alert('Credenciais salvas! Recarregue a página (F5)');
        }
    }

    // ============================================
    // AUTENTICAÇÃO
    // ============================================
    
    async login(username, password) {
        try {
            console.log('🔑 Tentando login:', username);

            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) {
                    return { success: false, message: 'Erro ao inicializar sistema' };
                }
            }

            // Buscar usuário no banco
            const { data: users, error } = await this.supabase
                .from('usuarios')
                .select('*')
                .eq('username', username)
                .eq('ativo', true)
                .single();

            if (error || !users) {
                console.error('❌ Usuário não encontrado:', error);
                return { success: false, message: 'Usuário não encontrado' };
            }

            // Verificar senha (em produção use bcrypt)
            if (users.password_hash !== password) {
                console.log('❌ Senha incorreta');
                return { success: false, message: 'Senha incorreta' };
            }

            // Login bem-sucedido
            this.currentUser = users;
            sessionStorage.setItem('currentUser', JSON.stringify(users));
            
            console.log('✅ Login realizado:', this.currentUser.nome);
            return { success: true, user: users };

        } catch (error) {
            console.error('❌ Erro no login:', error);
            return { success: false, message: error.message };
        }
    }

    logout() {
        console.log('👋 Logout realizado');
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    requireAuth() {
        const userData = sessionStorage.getItem('currentUser');
        
        if (!userData) {
            console.warn('⚠️ Usuário não autenticado - redirecionando');
            window.location.href = 'index.html';
            return false;
        }

        try {
            this.currentUser = JSON.parse(userData);
            console.log('✅ Usuário autenticado:', this.currentUser.nome);
            return true;
        } catch (error) {
            console.error('❌ Erro ao verificar autenticação:', error);
            window.location.href = 'index.html';
            return false;
        }
    }

    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                return this.currentUser;
            } catch (error) {
                console.error('❌ Erro ao recuperar usuário:', error);
            }
        }

        return null;
    }

    // ============================================
    // UPLOAD DE FOTO - CORRIGIDO
    // ============================================
    
    async uploadUserPhoto(file) {
        try {
            console.log('📸 Iniciando upload de foto...');

            // Verificar inicialização
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Sistema não inicializado');
                }
            }

            // Verificar autenticação
            const user = this.getCurrentUser();
            if (!user || !user.id) {
                throw new Error('Usuário não autenticado');
            }

            // Validar arquivo
            if (!file) {
                throw new Error('Nenhum arquivo selecionado');
            }

            if (!file.type.startsWith('image/')) {
                throw new Error('O arquivo deve ser uma imagem (JPG, PNG, GIF)');
            }

            // Validar tamanho (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('Imagem muito grande. Tamanho máximo: 5MB');
            }

            console.log('📊 Arquivo válido:', {
                nome: file.name,
                tipo: file.type,
                tamanho: `${(file.size / 1024).toFixed(2)} KB`
            });

            // Gerar nome único para o arquivo
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            console.log('📤 Fazendo upload para:', filePath);

            // PASSO 1: Upload para o Storage
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('user-photos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type
                });

            if (uploadError) {
                console.error('❌ Erro no upload:', uploadError);
                
                if (uploadError.message.includes('row-level security')) {
                    throw new Error('Permissão negada. Execute o SQL no Supabase Dashboard.');
                }
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error('Bucket "user-photos" não existe. Execute o SQL no Supabase Dashboard.');
                }
                
                throw new Error(`Erro no upload: ${uploadError.message}`);
            }

            console.log('✅ Upload realizado com sucesso');

            // PASSO 2: Obter URL pública
            const { data: urlData } = this.supabase.storage
                .from('user-photos')
                .getPublicUrl(filePath);

            if (!urlData || !urlData.publicUrl) {
                throw new Error('Erro ao gerar URL pública');
            }

            const photoUrl = urlData.publicUrl;
            console.log('🔗 URL pública gerada:', photoUrl);

            // PASSO 3: Atualizar banco de dados
            const { data: updateData, error: updateError } = await this.supabase
                .from('usuarios')
                .update({ 
                    foto_url: photoUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

            if (updateError) {
                console.error('❌ Erro ao atualizar banco:', updateError);
                throw new Error(`Erro ao salvar no banco: ${updateError.message}`);
            }

            console.log('✅ Banco de dados atualizado');

            // PASSO 4: Atualizar sessão local
            this.currentUser.foto_url = photoUrl;
            this.currentUser.updated_at = updateData.updated_at;
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            console.log('✅ Upload completo!');

            return {
                success: true,
                photoUrl: photoUrl,
                message: 'Foto atualizada com sucesso!'
            };

        } catch (error) {
            console.error('❌ Erro no upload de foto:', error);
            return {
                success: false,
                message: error.message || 'Erro desconhecido ao fazer upload'
            };
        }
    }

    // ============================================
    // PERFIL DO USUÁRIO
    // ============================================
    
    async updateUserProfile(profileData) {
        try {
            console.log('💾 Atualizando perfil...');

            if (!this.isInitialized) {
                await this.initialize();
            }

            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            // Preparar dados para atualização
            const updateData = {
                updated_at: new Date().toISOString()
            };

            if (profileData.nome) updateData.nome = profileData.nome;
            if (profileData.email) updateData.email = profileData.email;
            if (profileData.role) updateData.role = profileData.role;
            
            if (profileData.password_hash && profileData.password_hash.trim() !== '') {
                updateData.password_hash = profileData.password_hash;
            }

            console.log('📝 Atualizando campos:', Object.keys(updateData));

            const { data, error } = await this.supabase
                .from('usuarios')
                .update(updateData)
                .eq('id', user.id)
                .select()
                .single();

            if (error) {
                console.error('❌ Erro ao atualizar:', error);
                throw new Error(`Erro: ${error.message}`);
            }

            console.log('✅ Perfil atualizado no banco');

            this.currentUser = { ...this.currentUser, ...data };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            return {
                success: true,
                user: data,
                message: 'Perfil atualizado com sucesso!'
            };

        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            return {
                success: false,
                message: error.message || 'Erro ao atualizar perfil'
            };
        }
    }

    // ============================================
    // GERENCIAMENTO DE USUÁRIOS
    // ============================================
    
    async createUser(userData) {
        try {
            console.log('👤 Criando novo usuário:', userData.username);

            if (!this.isInitialized) {
                await this.initialize();
            }

            const { data: existing } = await this.supabase
                .from('usuarios')
                .select('username')
                .eq('username', userData.username)
                .single();

            if (existing) {
                throw new Error('Nome de usuário já existe');
            }

            const newUser = {
                username: userData.username,
                password_hash: userData.password,
                nome: userData.nome,
                email: userData.email || null,
                role: userData.role || 'operator',
                ativo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('usuarios')
                .insert([newUser])
                .select()
                .single();

            if (error) {
                throw new Error(`Erro ao criar: ${error.message}`);
            }

            console.log('✅ Usuário criado:', data.username);
            return { success: true, user: data };

        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            return { success: false, message: error.message };
        }
    }

    async listUsers() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const { data, error } = await this.supabase
                .from('usuarios')
                .select('id, username, nome, email, role, ativo, created_at, foto_url')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Erro ao listar: ${error.message}`);
            }

            return { success: true, users: data || [] };

        } catch (error) {
            console.error('❌ Erro ao listar usuários:', error);
            return { success: false, message: error.message };
        }
    }

    async deleteUser(userId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.currentUser && userId === this.currentUser.id) {
                throw new Error('Você não pode deletar seu próprio usuário');
            }

            const { error } = await this.supabase
                .from('usuarios')
                .delete()
                .eq('id', userId);

            if (error) {
                throw new Error(`Erro ao deletar: ${error.message}`);
            }

            console.log('✅ Usuário deletado');
            return { success: true };

        } catch (error) {
            console.error('❌ Erro ao deletar usuário:', error);
            return { success: false, message: error.message };
        }
    }

    // ============================================
    // UTILITÁRIOS
    // ============================================
    
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    canEdit() {
        const user = this.getCurrentUser();
        return user && (user.role === 'admin' || user.role === 'operator');
    }

    canView() {
        return !!this.getCurrentUser();
    }
}

// ============================================
// EXPORTAR E INICIALIZAR
// ============================================

window.AuthSystem = AuthSystem;
window.authSystem = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthSystem);
} else {
    initializeAuthSystem();
}

async function initializeAuthSystem() {
    try {
        console.log('🚀 Inicializando AuthSystem global...');
        window.authSystem = new AuthSystem();
        const success = await window.authSystem.initialize();
        
        if (success) {
            console.log('✅ AuthSystem pronto para uso');
        } else {
            console.warn('⚠️ AuthSystem falhou. Configure as credenciais.');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar AuthSystem:', error);
    }
}

console.log('✅ auth-system.js carregado');