/**
 * DataManager Completo - Leo's Cake Sistema
 * Gerencia todos os dados com Supabase: Usuários, Clientes, Produtos, Pedidos, Estoque, Entregas
 */

class DataManager {
    constructor(supabaseClient, isEnabled = true) {
        this.supabase = supabaseClient;
        this.isEnabled = isEnabled;
        this.isOnline = navigator.onLine;
        this.cache = new Map();
        
        console.log('✅ DataManager iniciado:', { enabled: isEnabled });
        this.setupOfflineHandlers();
    }

    setupOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Voltou online');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Ficou offline');
        });
    }

    // ===========================================
    // AUTENTICAÇÃO E USUÁRIOS
    // ===========================================
    
    async authenticateUser(username, password) {
        if (!this.isEnabled) return { success: false, message: 'Database offline' };
        
        try {
            const { data, error } = await this.supabase
                .from('usuarios')
                .select('*')
                .eq('username', username)
                .eq('password_hash', password) // Em produção, usar hash real
                .eq('ativo', true)
                .single();
            
            if (error) {
                console.error('Erro na autenticação:', error);
                return { success: false, message: 'Credenciais inválidas' };
            }
            
            return { success: true, user: data };
            
        } catch (error) {
            console.error('Erro na autenticação:', error);
            return { success: false, message: 'Erro no servidor' };
        }
    }

    async getUsuarios() {
        if (!this.isEnabled) return [];
        
        try {
            const { data, error } = await this.supabase
                .from('usuarios')
                .select('*')
                .eq('ativo', true)
                .order('nome');
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return [];
        }
    }

    async saveUsuario(userData) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { data, error } = await this.supabase
                .from('usuarios')
                .upsert(userData)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            return { success: false, error };
        }
    }

    async updateUserProfile(userId, profileData) {
        if (!this.isEnabled) return { success: false, message: 'Database offline' };
        
        try {
            const { data, error } = await this.supabase
                .from('usuarios')
                .update(profileData)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) {
                console.error('Erro ao atualizar perfil:', error);
                return { success: false, message: 'Erro ao atualizar perfil' };
            }
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            return { success: false, message: 'Erro no servidor' };
        }
    }

    async uploadUserPhoto(userId, file) {
        if (!this.isEnabled) return { success: false, message: 'Database offline' };
        
        try {
            console.log('📤 Iniciando upload para Supabase Storage...');
            console.log('🔍 User ID:', userId);
            console.log('📄 Arquivo:', { name: file.name, size: file.size, type: file.type });
            
            // Criar nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `user-photos/${fileName}`;
            
            console.log('📁 Caminho do arquivo:', filePath);

            // Upload para o storage do Supabase
            console.log('☁️ Fazendo upload para bucket "uploads"...');
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('uploads')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('❌ Erro detalhado no upload:', uploadError);
                
                // Verificar se é erro de bucket não existir
                if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
                    return { 
                        success: false, 
                        message: 'Bucket de storage não configurado. Verifique a configuração do Supabase Storage.' 
                    };
                }
                
                return { 
                    success: false, 
                    message: `Erro no upload: ${uploadError.message}` 
                };
            }

            console.log('✅ Upload concluído:', uploadData);

            // Obter URL pública da foto
            console.log('🔗 Obtendo URL pública...');
            const { data: urlData } = this.supabase.storage
                .from('uploads')
                .getPublicUrl(filePath);

            const photoUrl = urlData.publicUrl;
            console.log('✅ URL pública gerada:', photoUrl);

            return { success: true, photoUrl };
            
        } catch (error) {
            console.error('❌ Erro geral no upload:', error);
            return { 
                success: false, 
                message: `Erro no servidor: ${error.message}` 
            };
        }
    }

    // ===========================================
    // CLIENTES
    // ===========================================
    
    async getClientes() {
        if (!this.isEnabled) return [];
        
        try {
            const { data, error } = await this.supabase
                .from('clientes')
                .select('*')
                .eq('ativo', true)
                .order('nome');
            
            if (error) throw error;
            this.cache.set('clientes', data);
            return data || [];
            
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            return this.cache.get('clientes') || [];
        }
    }

    async saveCliente(clienteData) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { data, error } = await this.supabase
                .from('clientes')
                .upsert(clienteData)
                .select()
                .single();
            
            if (error) throw error;
            
            // Atualizar cache
            const clientes = this.cache.get('clientes') || [];
            const index = clientes.findIndex(c => c.id === data.id);
            if (index >= 0) {
                clientes[index] = data;
            } else {
                clientes.push(data);
            }
            this.cache.set('clientes', clientes);
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            return { success: false, error };
        }
    }

    async deleteCliente(clienteId) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { error } = await this.supabase
                .from('clientes')
                .update({ ativo: false })
                .eq('id', clienteId);
            
            if (error) throw error;
            
            // Atualizar cache
            const clientes = this.cache.get('clientes') || [];
            const filteredClientes = clientes.filter(c => c.id !== clienteId);
            this.cache.set('clientes', filteredClientes);
            
            return { success: true };
            
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            return { success: false, error };
        }
    }

    // ===========================================
    // PRODUTOS
    // ===========================================
    
    async getProdutos() {
        if (!this.isEnabled) return [];
        
        try {
            const { data, error } = await this.supabase
                .from('produtos')
                .select(`
                    *,
                    produto_imagens (
                        id,
                        imagem_url,
                        ordem,
                        titulo,
                        descricao,
                        is_principal
                    )
                `)
                .eq('ativo', true)
                .order('categoria', { ascending: true })
                .order('nome', { ascending: true });
            
            if (error) throw error;
            
            // Processar produtos para organizar imagens
            const produtosProcessados = data?.map(produto => ({
                ...produto,
                imagens: produto.produto_imagens?.sort((a, b) => a.ordem - b.ordem) || [],
                imagem_principal: produto.produto_imagens?.find(img => img.is_principal)?.imagem_url || 
                                 produto.produto_imagens?.[0]?.imagem_url || 
                                 'images/produtos/default.jpg'
            })) || [];
            
            this.cache.set('produtos', produtosProcessados);
            return produtosProcessados;
            
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return this.cache.get('produtos') || [];
        }
    }

    async saveProduto(produtoData) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { data, error } = await this.supabase
                .from('produtos')
                .upsert(produtoData)
                .select()
                .single();
            
            if (error) throw error;
            
            // Atualizar cache
            const produtos = this.cache.get('produtos') || [];
            const index = produtos.findIndex(p => p.id === data.id);
            if (index >= 0) {
                produtos[index] = data;
            } else {
                produtos.push(data);
            }
            this.cache.set('produtos', produtos);
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            return { success: false, error };
        }
    }

    async deleteProduto(produtoId) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { error } = await this.supabase
                .from('produtos')
                .update({ ativo: false })
                .eq('id', produtoId);
            
            if (error) throw error;
            
            // Atualizar cache
            const produtos = this.cache.get('produtos') || [];
            const filteredProdutos = produtos.filter(p => p.id !== produtoId);
            this.cache.set('produtos', filteredProdutos);
            
            return { success: true };
            
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            return { success: false, error };
        }
    }

    // ===========================================
    // IMAGENS DOS PRODUTOS
    // ===========================================
    
    async getProdutoImagens(produtoId) {
        if (!this.isEnabled) return [];
        
        try {
            const { data, error } = await this.supabase
                .from('produto_imagens')
                .select('*')
                .eq('produto_id', produtoId)
                .order('ordem', { ascending: true });
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('Erro ao buscar imagens do produto:', error);
            return [];
        }
    }

    async saveProdutoImagem(imagemData) {
        if (!this.isEnabled) return { success: false };
        
        try {
            // Validar se não excede 5 imagens
            const imagensExistentes = await this.getProdutoImagens(imagemData.produto_id);
            if (!imagemData.id && imagensExistentes.length >= 5) {
                return { success: false, message: 'Máximo de 5 imagens por produto' };
            }
            
            const { data, error } = await this.supabase
                .from('produto_imagens')
                .upsert(imagemData)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao salvar imagem do produto:', error);
            return { success: false, error };
        }
    }

    async deleteProdutoImagem(imagemId) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { error } = await this.supabase
                .from('produto_imagens')
                .delete()
                .eq('id', imagemId);
            
            if (error) throw error;
            return { success: true };
            
        } catch (error) {
            console.error('Erro ao deletar imagem do produto:', error);
            return { success: false, error };
        }
    }

    async reordenarProdutoImagens(produtoId, imagensOrdem) {
        if (!this.isEnabled) return { success: false };
        
        try {
            // imagensOrdem é um array de { id, ordem }
            const updates = imagensOrdem.map(({ id, ordem }) => 
                this.supabase
                    .from('produto_imagens')
                    .update({ ordem })
                    .eq('id', id)
            );
            
            await Promise.all(updates);
            return { success: true };
            
        } catch (error) {
            console.error('Erro ao reordenar imagens:', error);
            return { success: false, error };
        }
    }

    async definirImagemPrincipal(imagemId, produtoId) {
        if (!this.isEnabled) return { success: false };
        
        try {
            // Primeiro, desmarcar todas as imagens como principal
            await this.supabase
                .from('produto_imagens')
                .update({ is_principal: false })
                .eq('produto_id', produtoId);
            
            // Depois, marcar a imagem selecionada como principal
            const { error } = await this.supabase
                .from('produto_imagens')
                .update({ is_principal: true })
                .eq('id', imagemId);
            
            if (error) throw error;
            return { success: true };
            
        } catch (error) {
            console.error('Erro ao definir imagem principal:', error);
            return { success: false, error };
        }
    }

    // ===========================================
    // ESTOQUE
    // ===========================================
    
    async getEstoque(produtoId = null) {
        if (!this.isEnabled) return [];
        
        try {
            let query = this.supabase
                .from('estoque')
                .select(`
                    *,
                    produtos (nome, categoria)
                `)
                .order('data_producao', { ascending: false });
            
            if (produtoId) {
                query = query.eq('produto_id', produtoId);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            
            return data || [];
            
        } catch (error) {
            console.error('Erro ao buscar estoque:', error);
            return [];
        }
    }

    async saveEstoque(estoqueData) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { data, error } = await this.supabase
                .from('estoque')
                .upsert(estoqueData)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao salvar estoque:', error);
            return { success: false, error };
        }
    }

    async updateEstoque(produtoId, quantidade, operacao = 'remover') {
        if (!this.isEnabled) return { success: false };
        
        try {
            // Buscar estoque atual
            const { data: estoqueAtual, error: fetchError } = await this.supabase
                .from('estoque')
                .select('*')
                .eq('produto_id', produtoId)
                .gte('data_producao', new Date().toISOString().split('T')[0])
                .order('data_producao', { ascending: true })
                .limit(1);
            
            if (fetchError) throw fetchError;
            
            if (!estoqueAtual || estoqueAtual.length === 0) {
                return { success: false, message: 'Produto não encontrado no estoque' };
            }
            
            const estoque = estoqueAtual[0];
            let novaQuantidade;
            
            if (operacao === 'remover') {
                novaQuantidade = estoque.quantidade_disponivel - quantidade;
                if (novaQuantidade < 0) {
                    return { success: false, message: 'Estoque insuficiente' };
                }
            } else {
                novaQuantidade = estoque.quantidade_disponivel + quantidade;
            }
            
            const { error: updateError } = await this.supabase
                .from('estoque')
                .update({ quantidade_disponivel: novaQuantidade })
                .eq('id', estoque.id);
            
            if (updateError) throw updateError;
            
            return { success: true, novaQuantidade };
            
        } catch (error) {
            console.error('Erro ao atualizar estoque:', error);
            return { success: false, error };
        }
    }

    // ===========================================
    // PEDIDOS E ITENS
    // ===========================================
    
    async getPedidos(status = null) {
        if (!this.isEnabled) return [];
        
        try {
            let query = this.supabase
                .from('pedidos')
                .select(`
                    *,
                    clientes (nome, telefone, email, idioma),
                    pedido_itens (
                        *,
                        produtos (nome, categoria)
                    )
                `)
                .order('data_pedido', { ascending: false });
            
            if (status) {
                query = query.eq('status', status);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            
            this.cache.set('pedidos', data);
            return data || [];
            
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            return this.cache.get('pedidos') || [];
        }
    }

    async savePedido(pedidoData, itens = []) {
        if (!this.isEnabled) return { success: false };
        
        try {
            // Começar transação
            const { data: pedido, error: pedidoError } = await this.supabase
                .from('pedidos')
                .upsert(pedidoData)
                .select()
                .single();
            
            if (pedidoError) throw pedidoError;
            
            // Se há itens, salvar os itens do pedido
            if (itens.length > 0) {
                // Remover itens existentes se for update
                if (pedidoData.id) {
                    await this.supabase
                        .from('pedido_itens')
                        .delete()
                        .eq('pedido_id', pedido.id);
                }
                
                // Inserir novos itens
                const itensComPedidoId = itens.map(item => ({
                    ...item,
                    pedido_id: pedido.id
                }));
                
                const { error: itensError } = await this.supabase
                    .from('pedido_itens')
                    .insert(itensComPedidoId);
                
                if (itensError) throw itensError;
                
                // Atualizar estoque para cada item
                for (const item of itens) {
                    await this.updateEstoque(item.produto_id, item.quantidade, 'remover');
                }
            }
            
            return { success: true, data: pedido };
            
        } catch (error) {
            console.error('Erro ao salvar pedido:', error);
            return { success: false, error };
        }
    }

    async updatePedidoStatus(pedidoId, novoStatus) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { data, error } = await this.supabase
                .from('pedidos')
                .update({ status: novoStatus })
                .eq('id', pedidoId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            return { success: false, error };
        }
    }

    // ===========================================
    // ENTREGAS
    // ===========================================
    
    async getEntregas(dataInicio = null, dataFim = null) {
        if (!this.isEnabled) return [];
        
        try {
            let query = this.supabase
                .from('entregas')
                .select(`
                    *,
                    pedidos (
                        numero_pedido,
                        valor_total,
                        clientes (nome, telefone)
                    )
                `)
                .order('data_entrega', { ascending: true })
                .order('hora_entrega', { ascending: true });
            
            if (dataInicio) {
                query = query.gte('data_entrega', dataInicio);
            }
            if (dataFim) {
                query = query.lte('data_entrega', dataFim);
            }
            
            const { data, error } = await query;
            if (error) throw error;
            
            return data || [];
            
        } catch (error) {
            console.error('Erro ao buscar entregas:', error);
            return [];
        }
    }

    async saveEntrega(entregaData) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { data, error } = await this.supabase
                .from('entregas')
                .upsert(entregaData)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao salvar entrega:', error);
            return { success: false, error };
        }
    }

    // ===========================================
    // CONFIGURAÇÕES
    // ===========================================
    
    async getConfiguracoes() {
        if (!this.isEnabled) return {};
        
        try {
            const { data, error } = await this.supabase
                .from('configuracoes')
                .select('chave, valor');
            
            if (error) throw error;
            
            const config = {};
            data.forEach(item => {
                config[item.chave] = item.valor;
            });
            
            return config;
            
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            return {};
        }
    }

    async saveConfiguracao(chave, valor) {
        if (!this.isEnabled) return { success: false };
        
        try {
            const { data, error } = await this.supabase
                .from('configuracoes')
                .upsert({ chave, valor })
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            return { success: false, error };
        }
    }

    // ===========================================
    // DASHBOARD E RELATÓRIOS
    // ===========================================
    
    async getDashboardStats() {
        if (!this.isEnabled) return {};
        
        try {
            // Buscar estatísticas em paralelo
            const [
                totalProdutos,
                totalClientes,
                pedidosPendentes,
                receitaMes
            ] = await Promise.all([
                this.supabase.from('produtos').select('*', { count: 'exact' }).eq('ativo', true),
                this.supabase.from('clientes').select('*', { count: 'exact' }).eq('ativo', true),
                this.supabase.from('pedidos').select('*', { count: 'exact' }).in('status', ['pendente', 'confirmado', 'producao']),
                this.supabase.from('pedidos')
                    .select('valor_total')
                    .gte('data_pedido', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
                    .eq('status', 'entregue')
            ]);
            
            const receita = receitaMes.data?.reduce((sum, pedido) => sum + parseFloat(pedido.valor_total), 0) || 0;
            
            return {
                totalProdutos: totalProdutos.count || 0,
                totalClientes: totalClientes.count || 0,
                pedidosPendentes: pedidosPendentes.count || 0,
                receitaMes: receita
            };
            
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                totalProdutos: 0,
                totalClientes: 0,
                pedidosPendentes: 0,
                receitaMes: 0
            };
        }
    }

    // ===========================================
    // UTILITIES
    // ===========================================
    
    async testConnection() {
        if (!this.isEnabled) return false;
        
        try {
            const { data, error } = await this.supabase
                .from('configuracoes')
                .select('chave')
                .limit(1);
            
            return !error;
            
        } catch (error) {
            console.error('Erro no teste de conexão:', error);
            return false;
        }
    }
    
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache do DataManager limpo');
    }
}

// Instância global será criada pelo app principal
window.DataManager = DataManager;