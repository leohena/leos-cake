/**
 * Gerenciador de Dados - Leo's Cake
 * Responsável por toda a persistência de dados no Supabase
 * Elimina a dependência do localStorage para dados de negócio
 */

class DataManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.isOnline = navigator.onLine;
        this.cache = new Map(); // Cache em memória para performance
        this.syncQueue = []; // Fila de sincronização offline
        
        this.setupOfflineHandlers();
    }

    /**
     * Carrega todos os dados do Supabase
     */
    async loadAllData() {
        console.log('📊 Carregando dados do Supabase...');
        
        try {
            const [produtos, clientes, pedidos, empresa] = await Promise.all([
                this.loadProdutos(),
                this.loadClientes(), 
                this.loadPedidos(),
                this.loadEmpresaConfig()
            ]);

            console.log('✅ Dados carregados:', {
                produtos: produtos.length,
                clientes: clientes.length,
                pedidos: pedidos.length,
                empresa: empresa ? 'configurada' : 'padrão'
            });

            return { produtos, clientes, pedidos, empresa };
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            
            // Fallback para dados em cache local se offline
            if (!this.isOnline) {
                return this.loadFromCache();
            }
            
            throw error;
        }
    }

    /**
     * PRODUTOS
     */
    async loadProdutos() {
        const { data, error } = await this.supabase
            .from('produtos')
            .select('*')
            .order('created', { ascending: false });

        if (error) throw error;
        
        this.cache.set('produtos', data || []);
        return data || [];
    }

    async saveProduto(produto) {
        if (!this.isOnline) {
            this.queueForSync('produtos', 'upsert', produto);
            return this.saveProdutoToCache(produto);
        }

        const { data, error } = await this.supabase
            .from('produtos')
            .upsert(produto)
            .select()
            .single();

        if (error) throw error;
        
        // Atualizar cache
        this.updateProductCache(data);
        return data;
    }

    async deleteProduto(id) {
        if (!this.isOnline) {
            this.queueForSync('produtos', 'delete', { id });
            return this.deleteProdutoFromCache(id);
        }

        const { error } = await this.supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        // Remover do cache
        this.removeFromProductCache(id);
        return true;
    }

    /**
     * CLIENTES
     */
    async loadClientes() {
        const { data, error } = await this.supabase
            .from('clientes')
            .select('*')
            .order('nome');

        if (error) throw error;
        
        this.cache.set('clientes', data || []);
        return data || [];
    }

    async saveCliente(cliente) {
        if (!this.isOnline) {
            this.queueForSync('clientes', 'upsert', cliente);
            return this.saveClienteToCache(cliente);
        }

        const { data, error } = await this.supabase
            .from('clientes')
            .upsert(cliente)
            .select()
            .single();

        if (error) throw error;
        
        this.updateClientCache(data);
        return data;
    }

    async deleteCliente(id) {
        if (!this.isOnline) {
            this.queueForSync('clientes', 'delete', { id });
            return this.deleteClienteFromCache(id);
        }

        const { error } = await this.supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        this.removeFromClientCache(id);
        return true;
    }

    /**
     * PEDIDOS
     */
    async loadPedidos() {
        const { data, error } = await this.supabase
            .from('pedidos')
            .select(`
                *,
                cliente:clientes(nome, telefone, endereco)
            `)
            .order('created', { ascending: false });

        if (error) throw error;
        
        this.cache.set('pedidos', data || []);
        return data || [];
    }

    async savePedido(pedido) {
        if (!this.isOnline) {
            this.queueForSync('pedidos', 'upsert', pedido);
            return this.savePedidoToCache(pedido);
        }

        const { data, error } = await this.supabase
            .from('pedidos')
            .upsert(pedido)
            .select()
            .single();

        if (error) throw error;
        
        this.updateOrderCache(data);
        return data;
    }

    async deletePedido(id) {
        if (!this.isOnline) {
            this.queueForSync('pedidos', 'delete', { id });
            return this.deletePedidoFromCache(id);
        }

        const { error } = await this.supabase
            .from('pedidos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        this.removeFromOrderCache(id);
        return true;
    }

    /**
     * CONFIGURAÇÕES DA EMPRESA
     */
    async loadEmpresaConfig() {
        const { data, error } = await this.supabase
            .from('configuracoes')
            .select('*')
            .eq('tipo', 'empresa')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        return data?.config || null;
    }

    async saveEmpresaConfig(config) {
        if (!this.isOnline) {
            this.queueForSync('configuracoes', 'upsert', {
                tipo: 'empresa',
                config: config
            });
            return config;
        }

        const { data, error } = await this.supabase
            .from('configuracoes')
            .upsert({
                tipo: 'empresa',
                config: config,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        
        return data.config;
    }

    /**
     * CACHE MANAGEMENT
     */
    updateProductCache(produto) {
        const produtos = this.cache.get('produtos') || [];
        const index = produtos.findIndex(p => p.id === produto.id);
        
        if (index >= 0) {
            produtos[index] = produto;
        } else {
            produtos.unshift(produto);
        }
        
        this.cache.set('produtos', produtos);
    }

    removeFromProductCache(id) {
        const produtos = this.cache.get('produtos') || [];
        const filtered = produtos.filter(p => p.id !== id);
        this.cache.set('produtos', filtered);
    }

    updateClientCache(cliente) {
        const clientes = this.cache.get('clientes') || [];
        const index = clientes.findIndex(c => c.id === cliente.id);
        
        if (index >= 0) {
            clientes[index] = cliente;
        } else {
            clientes.push(cliente);
        }
        
        this.cache.set('clientes', clientes.sort((a, b) => a.nome.localeCompare(b.nome)));
    }

    removeFromClientCache(id) {
        const clientes = this.cache.get('clientes') || [];
        const filtered = clientes.filter(c => c.id !== id);
        this.cache.set('clientes', filtered);
    }

    updateOrderCache(pedido) {
        const pedidos = this.cache.get('pedidos') || [];
        const index = pedidos.findIndex(p => p.id === pedido.id);
        
        if (index >= 0) {
            pedidos[index] = pedido;
        } else {
            pedidos.unshift(pedido);
        }
        
        this.cache.set('pedidos', pedidos);
    }

    removeFromOrderCache(id) {
        const pedidos = this.cache.get('pedidos') || [];
        const filtered = pedidos.filter(p => p.id !== id);
        this.cache.set('pedidos', filtered);
    }

    /**
     * OFFLINE SUPPORT
     */
    setupOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    queueForSync(table, operation, data) {
        this.syncQueue.push({
            table,
            operation,
            data,
            timestamp: Date.now()
        });
        
        console.log(`📱 Operação adicionada à fila offline: ${operation} em ${table}`);
    }

    async processSyncQueue() {
        if (this.syncQueue.length === 0) return;
        
        console.log(`🔄 Processando ${this.syncQueue.length} operações offline...`);
        
        const successes = [];
        const failures = [];
        
        for (const operation of this.syncQueue) {
            try {
                await this.executeOperation(operation);
                successes.push(operation);
            } catch (error) {
                console.error('❌ Erro na sincronização:', error);
                failures.push(operation);
            }
        }
        
        // Remover operações bem-sucedidas
        this.syncQueue = failures;
        
        console.log(`✅ Sincronizadas: ${successes.length}, Falhas: ${failures.length}`);
    }

    async executeOperation(operation) {
        const { table, operation: op, data } = operation;
        
        switch (op) {
            case 'upsert':
                return await this.supabase.from(table).upsert(data);
            case 'delete':
                return await this.supabase.from(table).delete().eq('id', data.id);
            default:
                throw new Error(`Operação não suportada: ${op}`);
        }
    }

    /**
     * FALLBACK PARA CACHE LOCAL
     */
    loadFromCache() {
        console.log('📱 Carregando dados do cache local...');
        
        return {
            produtos: this.cache.get('produtos') || [],
            clientes: this.cache.get('clientes') || [],
            pedidos: this.cache.get('pedidos') || [],
            empresa: null
        };
    }

    /**
     * GETTER METHODS
     */
    getProdutos() {
        return this.cache.get('produtos') || [];
    }

    getClientes() {
        return this.cache.get('clientes') || [];
    }

    getPedidos() {
        return this.cache.get('pedidos') || [];
    }

    /**
     * CLEANUP
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache limpo');
    }
}

// Disponibilizar globalmente
window.DataManager = DataManager;