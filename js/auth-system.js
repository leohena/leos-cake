// auth-system.js - Sistema de Autenticação Completo com Supabase
// Versão corrigida com upload de fotos funcionando

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
    // INICIALIZAÇÃO
    // ============================================
    
    async initialize() {
        try {
            console.log('🔐 Inicializando AuthSystem...');
            
            // Carregar configuração do arquivo config.json
            const configResponse = await fetch('config.json');
            if (!configResponse.ok) {
                throw new Error('Arquivo config.json não encontrado');
            }
            
            this.config = await configResponse.json();
            this.supabaseUrl = this.config.supabase?.url;
            this.supabaseKey = this.config.supabase?.anonKey;

            if (!this.supabaseUrl || !this.supabaseKey) {
                console.error('❌ Credenciais do Supabase não encontradas em config.json');
                throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY no config.json');
            }

            // Inicializar cliente Supabase
            const { createClient } = supabase;
            this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
            
            console.log('✅ Supabase inicializado com sucesso');
            this.isInitialized = true;
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar AuthSystem:', error);
            this.isInitialized = false;
            return false;
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
                    upsert: true, // Permite sobrescrever
                    contentType: file.type
                });

            if (uploadError) {
                console.error('❌ Erro no upload:', uploadError);
                
                // Mensagens de erro específicas
                if (uploadError.message.includes('row-level security')) {
                    throw new Error('Permissão negada. Configure as políticas RLS no Supabase Dashboard.');
                }
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error('Bucket "user-photos" não existe. Crie-o no Supabase Dashboard.');
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

            // Adicionar campos que foram fornecidos
            if (profileData.nome) updateData.nome = profileData.nome;
            if (profileData.email) updateData.email = profileData.email;
            if (profileData.role) updateData.role = profileData.role;
            
            // Se houver nova senha, adicionar
            if (profileData.password_hash && profileData.password_hash.trim() !== '') {
                // EM PRODUÇÃO: use bcrypt para hash
                updateData.password_hash = profileData.password_hash;
            }

            console.log('📝 Atualizando campos:', Object.keys(updateData));

            // Atualizar no banco
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

            // Atualizar sessão local
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

            // Verificar se username já existe
            const { data: existing } = await this.supabase
                .from('usuarios')
                .select('username')
                .eq('username', userData.username)
                .single();

            if (existing) {
                throw new Error('Nome de usuário já existe');
            }

            // Criar novo usuário
            const newUser = {
                username: userData.username,
                password_hash: userData.password, // EM PRODUÇÃO: use bcrypt
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

    async updateUser(userId, userData) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const updateData = {
                ...userData,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('usuarios')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Erro ao atualizar: ${error.message}`);
            }

            return { success: true, user: data };

        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            return { success: false, message: error.message };
        }
    }

    async deleteUser(userId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Não permitir deletar o próprio usuário
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

    async toggleUserStatus(userId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Buscar status atual
            const { data: user } = await this.supabase
                .from('usuarios')
                .select('ativo')
                .eq('id', userId)
                .single();

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Inverter status
            const { data, error } = await this.supabase
                .from('usuarios')
                .update({ 
                    ativo: !user.ativo,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Erro ao alterar status: ${error.message}`);
            }

            return { success: true, user: data };

        } catch (error) {
            console.error('❌ Erro ao alterar status:', error);
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

// Criar instância global
window.AuthSystem = AuthSystem;
window.authSystem = null;

// Inicializar automaticamente quando o documento carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthSystem);
} else {
    initializeAuthSystem();
}

async function initializeAuthSystem() {
    console.log('🚀 Inicializando AuthSystem global...');
    window.authSystem = new AuthSystem();
    const success = await window.authSystem.initialize();
    
    if (success) {
        console.log('✅ AuthSystem pronto para uso');
    } else {
        console.warn('⚠️ AuthSystem falhou ao inicializar. Verifique config.json');
    }
}

console.log('✅ auth-system.js carregado');