// Sistema de Gerenciamento de Pré-Vendas - Leo's Cake
console.log('🚀 SCRIPT app.js CARREGADO!');

class PreVendasApp {
    constructor() {
        // DADOS AGORA VÊM DO SUPABASE - NÃO DO LOCALSTORAGE
        this.produtos = [];
        this.clientes = [];
        this.pedidos = [];
        this.configuracoes = null; // ConfigManager
        this.dataManager = null; // DataManager para Supabase
        
        this.horariosDisponiveis = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        this.currentEditId = null;
        this.currentEditType = null;
        this.currentCalendarDate = new Date();
        this.selectedDeliveryDate = null;
        this.selectedDeliveryTime = null;
        this.currentReciboId = null;
        this.isOnline = navigator.onLine;
        
        // Supabase setup
        this.supabase = null;
        this.isSupabaseEnabled = false;
        this.realtimeChannel = null;
        
        // NÃO chamar checkAuthentication aqui - será chamado no init()
    }

    // SISTEMA DE AUTENTICAÇÃO SIMPLIFICADO
    checkAuthentication() {
        console.log('🔐 Verificando autenticação...');
        const isAuthenticated = localStorage.getItem('leos_cake_auth');
        const authExpiry = localStorage.getItem('leos_cake_auth_expiry');
        
        console.log('📝 Auth status:', { isAuthenticated, authExpiry });
        
        // Verificar se autenticação ainda é válida (24 horas)
        if (isAuthenticated && authExpiry && new Date().getTime() < parseInt(authExpiry)) {
            console.log('✅ Usuário autenticado e token válido');
            return true;
        }
        
        console.log('❌ Usuário não autenticado ou token expirado');
        // Se não autenticado, mostrar tela de login
        this.showLoginScreen();
        return false;
    }

    showLoginScreen() {
        console.log('🔐 Mostrando tela de login...');
        document.body.innerHTML = `
            <div class="login-screen">
                <div class="login-container">
                    <div class="login-form">
                        <div class="login-logo">
                            <img src="images/logo-png.png" alt="Leo's Cake">
                        </div>
                        <h1>Leo's Cake</h1>
                        <p>Sistema de Pré-Vendas</p>
                        <form id="login-form">
                            <input type="password" id="login-password" placeholder="Digite a senha" required>
                            <button type="submit">Entrar</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.authenticate();
            });
            console.log('✅ Tela de login configurada');
        } else {
            console.error('❌ Elemento login-form não encontrado');
        }
    }

    async authenticate() {
        const password = document.getElementById('login-password').value;
        
        // Verificar senha via configurações (carregadas no init)
        const senhaCorreta = this.configuracoes?.sistemaSenha || 
                              (window.ENV_CONFIG ? window.ENV_CONFIG.SYSTEM_PASSWORD : 'leoscake2024');
        
        if (password === senhaCorreta) {
            // Autenticar por 24 horas
            const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('leos_cake_auth', 'true');
            localStorage.setItem('leos_cake_auth_expiry', expiry.toString());
            
            // Recarregar a página para mostrar o sistema
            window.location.reload();
        } else {
            alert('Senha incorreta!');
        }
    }

    setupLoginLogo() {
        // Configurar logo na tela de login se necessário
    }

    async init() {
        console.log('🚀 Iniciando sistema Leo\'s Cake...');
        
        try {
            // 1. Carregar configurações primeiro (precisamos para autenticação)
            console.log('📋 Passo 1: Carregando configurações...');
            await this.initializeConfig();
            console.log('✅ Configurações carregadas');
            
            // 2. Verificar autenticação ANTES de mostrar splash
            console.log('🔐 Passo 2: Verificando autenticação...');
            if (!this.checkAuthentication()) {
                console.log('❌ Usuário não autenticado - mostrando login');
                return; // Se não autenticado, para aqui e mostra login
            }
            console.log('✅ Usuário autenticado');
            
            // 3. Se autenticado, mostrar splash e continuar
            console.log('🎬 Passo 3: Mostrando splash screen...');
            this.showSplashScreen();
            
            // 4. Inicializar Supabase
            this.setupLoginLogo();
            this.initSupabase();
            
            // 5. Carregar dados do banco (substitui localStorage)
            console.log('🔄 Passo 5: Inicializando dados...');
            await this.initializeData();
            console.log('✅ Passo 5: Dados inicializados');
            
            // 6. Verificar e migrar dados antigos do localStorage
            console.log('🔄 Passo 6: Verificando migração...');
            await this.checkAndMigrateLegacyData();
            console.log('✅ Passo 6: Migração verificada');
            
            // 7. Configurar interface
            console.log('🔄 Passo 7: Configurando interface...');
            
            console.log('🔄 7.1: Setup online listeners...');
            this.setupOnlineListeners();
            
            console.log('🔄 7.2: Setup event listeners...');
            try {
                this.setupEventListeners();
                console.log('✅ Event listeners configurados');
            } catch (error) {
                console.error('❌ Erro ao configurar event listeners:', error);
            }
            
            console.log('🔄 7.3: Update dashboard...');
            this.updateDashboard();
            
            console.log('🔄 7.4: Render produtos...');
            this.renderProdutos();
            
            console.log('🔄 7.5: Render clientes...');
            this.renderClientes();
            
            console.log('🔄 7.6: Render pedidos...');
            this.renderPedidos();
            
            console.log('🔄 7.7: Update entregas hoje...');
            this.updateEntregasHoje();
            
            console.log('🔄 7.8: Setup date filter...');
            this.setupDateFilter();
            
            console.log('✅ Passo 7: Interface configurada');
            
            // 8. Esconder splash screen ao final
            console.log('🔄 Passo 8: Escondendo splash screen...');
            this.hideSplashScreen();
            console.log('✅ Passo 8: Sistema totalmente inicializado!');
            
            // 9. Mostrar página inicial
            this.showPage('dashboard');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showToast('Erro na inicialização do sistema', 'error');
            this.hideSplashScreen();
        }

        // Initialize calendar variables
        this.currentCalendarDate = new Date();
        this.selectedDeliveryDate = null;
        this.selectedDeliveryTime = null;
        this.horariosDisponiveis = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
        ];
    }

    /**
     * Inicializa as configurações usando o ConfigManager
     */
    async initializeConfig() {
        console.log('🔧 Carregando configurações...');
        
        try {
            if (!window.configManager) {
                console.log('⚠️ ConfigManager não encontrado, tentando aguardar...');
                // Aguardar um pouco pelo ConfigManager
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (!window.configManager) {
                    console.log('❌ ConfigManager ainda não disponível, usando configurações padrão');
                    this.configuracoes = {
                        empresa: { nome: "Leo's Cake", telefone: "", endereco: "", email: "" },
                        sistemaSenha: window.ENV_CONFIG ? window.ENV_CONFIG.SYSTEM_PASSWORD : "leoscake2024",
                        usuarios: []
                    };
                    return;
                }
            }
            
            this.configuracoes = await window.configManager.init();
            
            // Inicialize EmailJS se configurado
            this.initEmailJS();
            
            console.log('✅ Configurações carregadas:', window.configManager.getPublicConfig());
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            // Usar configurações padrão em caso de erro
            this.configuracoes = {
                empresa: { nome: "Leo's Cake", telefone: "", endereco: "", email: "" },
                sistemaSenha: window.ENV_CONFIG ? window.ENV_CONFIG.SYSTEM_PASSWORD : "leoscake2024",
                usuarios: []
            };
        }
    }

    /**
     * Inicializa o DataManager e carrega dados do Supabase
     */
    async initializeData() {
        console.log('📊 Inicializando DataManager...');
        
        try {
            if (!this.supabase) {
                console.log('⚠️ Supabase não inicializado, usando dados vazios');
                this.initializeEmptyData();
                return;
            }
            
            this.dataManager = new DataManager(this.supabase);
            
            // Carregar todos os dados do banco
            console.log('🔄 Carregando dados do Supabase...');
            const data = await this.dataManager.loadAllData();
            
            this.produtos = data.produtos || [];
            this.clientes = data.clientes || [];
            this.pedidos = data.pedidos || [];
            
            // Configurações da empresa vindas do banco
            if (data.empresa) {
                this.configuracoes.empresa = data.empresa;
            }
            
            console.log('✅ Dados carregados do Supabase:', {
                produtos: this.produtos.length,
                clientes: this.clientes.length,
                pedidos: this.pedidos.length
            });
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do Supabase:', error);
            console.log('🔄 Usando dados vazios como fallback');
            this.initializeEmptyData();
        }
    }
    
    /**
     * Inicializa com dados vazios quando Supabase não funciona
     */
    initializeEmptyData() {
        this.produtos = [];
        this.clientes = [];
        this.pedidos = [];
        console.log('✅ Sistema inicializado com dados vazios (modo local)');
    }

    /**
     * Verifica e migra dados antigos do localStorage
     */
    async checkAndMigrateLegacyData() {
        if (!window.DataMigration) {
            console.log('⚠️ DataMigration não disponível');
            return;
        }

        const migration = new DataMigration(this);
        
        if (migration.hasLegacyData()) {
            console.log('📦 Dados antigos encontrados no localStorage');
            
            try {
                // Criar backup antes da migração
                migration.createBackup();
                
                // Executar migração automática
                const result = await migration.migrateLegacyData();
                
                if (result.migrated) {
                    const stats = migration.showMigrationStats(result.results);
                    this.showToast('Dados migrados para o banco!', 'success');
                    
                    // Recarregar dados após migração
                    await this.initializeData();
                } else {
                    console.log('ℹ️ Migração não executada:', result.message);
                }
                
            } catch (error) {
                console.error('❌ Erro na migração:', error);
                this.showToast('Erro ao migrar dados antigos', 'error');
            }
        }
    }

    showSplashScreen() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.display = 'flex';
        }
    }

    hideSplashScreen() {
        console.log('🔄 Tentando esconder splash screen...');
        const splash = document.getElementById('splash-screen');
        if (splash) {
            console.log('✅ Elemento splash-screen encontrado, escondendo em 1s...');
            setTimeout(() => {
                splash.style.display = 'none';
                console.log('✅ Splash screen escondido!');
            }, 1000);
        } else {
            console.error('❌ Elemento splash-screen não encontrado!');
        }
    }

    setupEventListeners() {
        console.log('🎛️ Configurando event listeners...');
        
        // Event listeners para navegação
        const navItems = document.querySelectorAll('.nav-btn');
        console.log(`📍 Encontrados ${navItems.length} nav-btn`);
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.showPage(page);
            });
        });

        // Event listeners para modais
        const closeButtons = document.querySelectorAll('.close-btn');
        console.log(`📍 Encontrados ${closeButtons.length} close-btn`);
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.classList.remove('active');
            });
        });

        // Event listeners para formulários
        document.getElementById('produto-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduto();
        });

        document.getElementById('cliente-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCliente();
        });

        document.getElementById('pedido-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePedido();
        });

        document.getElementById('config-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfig();
        });

        // Event listeners para pesquisa
        document.getElementById('search-produtos')?.addEventListener('input', (e) => {
            this.searchProdutos(e.target.value);
        });

        document.getElementById('search-clientes')?.addEventListener('input', (e) => {
            this.searchClientes(e.target.value);
        });

        // Event listeners para filtros
        document.getElementById('filter-pedidos')?.addEventListener('change', (e) => {
            this.filterPedidos(e.target.value);
        });

        document.getElementById('date-filter')?.addEventListener('change', (e) => {
            this.filterEntregasByDate(e.target.value);
        });

        // Event listeners para botões
        document.getElementById('add-produto')?.addEventListener('click', () => {
            this.openProdutoModal();
        });

        document.getElementById('add-cliente')?.addEventListener('click', () => {
            this.openClienteModal();
        });

        document.getElementById('add-pedido')?.addEventListener('click', () => {
            this.openPedidoModal();
        });

        document.getElementById('config-btn')?.addEventListener('click', () => {
            this.openConfigModal();
        });

        document.getElementById('add-produto-pedido')?.addEventListener('click', () => {
            this.showProdutoSelector();
        });

        // Event listeners para calendário
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.previousMonth();
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            this.nextMonth();
        });

        // Event listeners para cálculos
        document.getElementById('pedido-valor-pago')?.addEventListener('input', () => {
            this.calculateSaldo();
        });

        document.getElementById('pedido-data-entrega')?.addEventListener('change', () => {
            this.updateHorariosDisponiveis();
        });
    }

    showPage(pageName) {
        // Ocultar todas as páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Mostrar página selecionada
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Atualizar navegação ativa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Atualizar dados específicos da página
        switch (pageName) {
            case 'dashboard':
                this.updateDashboard();
                this.updateEntregasHoje();
                break;
            case 'produtos':
                this.renderProdutos();
                break;
            case 'clientes':
                this.renderClientes();
                break;
            case 'pedidos':
                this.renderPedidos();
                break;
            case 'entregas':
                this.renderEntregas();
                break;
        }
    }

    // MÉTODOS DE INTERFACE BÁSICOS
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    updateSyncStatus(status, text) {
        const indicator = document.getElementById('sync-indicator');
        const statusEl = document.getElementById('sync-status');
        const textEl = document.getElementById('sync-text');
        
        if (!indicator || !statusEl || !textEl) return;
        
        // Remove all status classes
        indicator.className = 'sync-indicator';
        
        // Add new status class
        indicator.classList.add(status);
        
        // Update content
        const statusIcons = {
            local: '💾',
            online: '☁️',
            syncing: '🔄',
            success: '✅',
            error: '❌',
            offline: '📵'
        };
        
        statusEl.textContent = statusIcons[status] || '🔄';
        textEl.textContent = text;
    }

    // INICIALIZAÇÃO DO SUPABASE
    initSupabase() {
        // Obter configuração do ambiente (com fallback para valores hardcoded)
        const SUPABASE_CONFIG = window.ENV_CONFIG ? window.ENV_CONFIG.getSupabaseConfig() : {
            url: 'https://qzuccgbxddzpbotxvjug.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dWNjZ2J4ZGR6cGJvdHh2anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODE1NTQsImV4cCI6MjA3Nzc1NzU1NH0.jMtCOeyS3rLLanJzeWv0j1cYQFnFUBjZmnwMe5aUNk4',
            realtime: true
        };

        // Verificar se Supabase JS está carregado
        if (!window.supabase) {
            console.warn('⚠️ Supabase JS não carregado - funcionando sem banco online');
            this.updateSyncStatus('offline', 'Modo Offline');
            this.isSupabaseEnabled = false;
            return;
        }

        try {
            console.log('🔄 Inicializando Supabase...');
            this.updateSyncStatus('loading', 'Conectando...');

            // Inicializar cliente Supabase com credenciais hardcoded
            this.supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );

            this.isSupabaseEnabled = true;
            console.log('✅ Supabase conectado com sucesso');
            this.updateSyncStatus('online', 'Supabase Online');

            // Configurar real-time se habilitado
            if (SUPABASE_CONFIG.realtime) {
                this.setupRealtimeSync();
            }

            // Testar conexão
            this.testSupabaseConnection();

        } catch (error) {
            console.error('❌ Erro na inicialização do Supabase:', error);
            this.updateSyncStatus('local', 'Modo Local');
            this.isSupabaseEnabled = false;
            this.supabase = null;
        }
    }

    async testSupabaseConnection() {
        if (!this.supabase) {
            this.updateSyncStatus('error', 'Não conectado');
            return false;
        }

        try {
            // Testar com uma query simples
            const { data, error } = await this.supabase
                .from('produtos')
                .select('id')
                .limit(1);

            if (error && error.code !== 'PGRST116') { // PGRST116 = tabela não existe
                throw error;
            }

            this.updateSyncStatus('online', 'Supabase ✓');
            return true;
        } catch (error) {
            console.error('❌ Erro na conexão:', error);
            this.updateSyncStatus('error', 'Falha na conexão');
            return false;
        }
    }

    setupRealtimeSync() {
        if (!this.supabase || this.realtimeChannel) return;

        // Criar canal para real-time
        this.realtimeChannel = this.supabase.channel('leos-cake-sync')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public',
                table: 'produtos' 
            }, (payload) => {
                console.log('🔄 Produto alterado:', payload);
                this.handleRealtimeUpdate('produtos', payload);
            })
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public',
                table: 'clientes' 
            }, (payload) => {
                console.log('🔄 Cliente alterado:', payload);
                this.handleRealtimeUpdate('clientes', payload);
            })
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public',
                table: 'pedidos' 
            }, (payload) => {
                console.log('🔄 Pedido alterado:', payload);
                this.handleRealtimeUpdate('pedidos', payload);
            })
            .subscribe();

        console.log('🔄 Real-time sync ativado');
    }

    handleRealtimeUpdate(table, payload) {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (table) {
            case 'produtos':
                this.handleProductRealtimeUpdate(eventType, newRecord, oldRecord);
                break;
            case 'clientes':
                this.handleClientRealtimeUpdate(eventType, newRecord, oldRecord);
                break;
            case 'pedidos':
                this.handleOrderRealtimeUpdate(eventType, newRecord, oldRecord);
                break;
        }
    }

    handleProductRealtimeUpdate(eventType, newRecord, oldRecord) {
        switch (eventType) {
            case 'INSERT':
                this.produtos.push(newRecord);
                break;
            case 'UPDATE':
                const productIndex = this.produtos.findIndex(p => p.id === newRecord.id);
                if (productIndex >= 0) {
                    this.produtos[productIndex] = newRecord;
                }
                break;
            case 'DELETE':
                this.produtos = this.produtos.filter(p => p.id !== oldRecord.id);
                break;
        }
        this.renderProdutos();
    }

    handleClientRealtimeUpdate(eventType, newRecord, oldRecord) {
        switch (eventType) {
            case 'INSERT':
                this.clientes.push(newRecord);
                break;
            case 'UPDATE':
                const clientIndex = this.clientes.findIndex(c => c.id === newRecord.id);
                if (clientIndex >= 0) {
                    this.clientes[clientIndex] = newRecord;
                }
                break;
            case 'DELETE':
                this.clientes = this.clientes.filter(c => c.id !== oldRecord.id);
                break;
        }
        this.renderClientes();
    }

    handleOrderRealtimeUpdate(eventType, newRecord, oldRecord) {
        switch (eventType) {
            case 'INSERT':
                this.pedidos.push(newRecord);
                break;
            case 'UPDATE':
                const orderIndex = this.pedidos.findIndex(p => p.id === newRecord.id);
                if (orderIndex >= 0) {
                    this.pedidos[orderIndex] = newRecord;
                }
                break;
            case 'DELETE':
                this.pedidos = this.pedidos.filter(p => p.id !== oldRecord.id);
                break;
        }
        this.renderPedidos();
        this.updateDashboard();
    }

    setupOnlineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateSyncStatus('online', 'Online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus('offline', 'Offline');
        });
    }

    initEmailJS() {
        if (window.emailjs && this.configuracoes.emailjs.userId) {
            emailjs.init(this.configuracoes.emailjs.userId);
        }
    }

    // MÉTODOS PLACEHOLDER PARA FUNCIONALIDADES PRINCIPAIS
    // (Serão implementados pelos arquivos específicos ou métodos existentes)
    
    // PRODUTOS
    openProdutoModal(produto = null) { /* TODO: Implementar */ }
    closeProdutoModal() { /* TODO: Implementar */ }
    async saveProduto() { /* TODO: Implementar */ }
    async deleteProduto(id) { /* TODO: Implementar */ }
    renderProdutos(filteredProdutos = null) { 
        console.log('🍰 Produtos renderizados:', this.produtos.length);
        // TODO: Implementar renderização
    }
    searchProdutos(query) { 
        console.log('🔍 Busca produtos:', query);
        // TODO: Implementar busca
    }

    // CLIENTES
    openClienteModal(cliente = null) { 
        console.log('👤 Modal cliente aberto');
        // TODO: Implementar modal
    }
    closeClienteModal() { 
        console.log('❌ Modal cliente fechado');
        // TODO: Implementar fechamento
    }
    async saveCliente() { 
        console.log('💾 Cliente salvo');
        // TODO: Implementar salvamento
    }
    async deleteCliente(id) { 
        console.log('🗑️ Cliente removido:', id);
        // TODO: Implementar remoção
    }
    renderClientes(filteredClientes = null) { 
        console.log('👥 Clientes renderizados:', this.clientes.length);
        // TODO: Implementar renderização
    }
    searchClientes(query) { 
        console.log('🔍 Busca clientes:', query);
        // TODO: Implementar busca
    }

    // PEDIDOS
    openPedidoModal(pedido = null) { 
        console.log('📋 Modal pedido aberto');
        // TODO: Implementar modal
    }
    closePedidoModal() { 
        console.log('❌ Modal pedido fechado');
        // TODO: Implementar fechamento
    }
    async savePedido() { 
        console.log('💾 Pedido salvo');
        // TODO: Implementar salvamento
    }
    async deletePedido(id) { 
        console.log('🗑️ Pedido removido:', id);
        // TODO: Implementar remoção
    }
    renderPedidos(filteredPedidos = null) { 
        console.log('📋 Pedidos renderizados:', this.pedidos.length);
        // TODO: Implementar renderização
    }
    filterPedidos(status) { 
        console.log('🔍 Filtro pedidos:', status);
        // TODO: Implementar filtro
    }

    // DASHBOARD
    updateDashboard() { 
        console.log('📊 Dashboard atualizado');
        // TODO: Implementar estatísticas
    }
    updateEntregasHoje() { 
        console.log('📅 Entregas de hoje atualizadas');
        // TODO: Implementar lista de entregas
    }

    // ENTREGAS
    renderEntregas(selectedDate = null) { 
        console.log('📦 Entregas renderizadas');
        // TODO: Implementar lista de entregas
    }
    setupDateFilter() { 
        console.log('📅 Filtro de data configurado');
        // TODO: Implementar filtro
    }
    filterEntregasByDate(date) { 
        console.log('🔍 Filtro por data aplicado:', date);
        // TODO: Implementar filtro
    }

    // CONFIGURAÇÕES
    openConfigModal() { /* TODO: Implementar */ }
    closeConfigModal() { /* TODO: Implementar */ }
    async saveConfig() { /* TODO: Implementar */ }

    // CALENDÁRIO
    initCalendar() { /* TODO: Implementar */ }
    renderCalendar() { /* TODO: Implementar */ }
    previousMonth() { /* TODO: Implementar */ }
    nextMonth() { /* TODO: Implementar */ }

    // PEDIDOS - PRODUTOS
    showProdutoSelector() { /* TODO: Implementar */ }
    calculateTotal() { /* TODO: Implementar */ }
    calculateSaldo() { /* TODO: Implementar */ }
    updateHorariosDisponiveis() { /* TODO: Implementar */ }

    // RECIBOS
    gerarRecibo(pedidoId) { /* TODO: Implementar */ }
    closeReciboModal() { /* TODO: Implementar */ }
    baixarReciboPDF() { /* TODO: Implementar */ }
    enviarReciboEmail() { /* TODO: Implementar */ }

    // UTILIDADES
    previewImage(input) { /* TODO: Implementar */ }
    formatDate(date) { /* TODO: Implementar */ }
    formatDateDisplay(date) { /* TODO: Implementar */ }
}

// Variável global para a aplicação
let app;

// Aguardar DOM e inicializar aplicação
console.log('🔧 Registrando event listener para DOMContentLoaded...');
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM carregado, iniciando aplicação...');
    console.log('🔍 Verificando se window.supabase existe:', typeof window.supabase);
    
    // Aguardar um pouco para garantir que todos os scripts carregaram
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        // Criar aplicação apenas quando DOM estiver pronto
        console.log('⚡ Criando instância PreVendasApp...');
        app = new PreVendasApp();
        console.log('⚡ Instância criada, chamando init()...');
        await app.init();
        console.log('⚡ Init() completo!');
    } catch (error) {
        console.error('❌ Erro crítico na inicialização:', error);
        console.error('Stack trace:', error.stack);
        
        // Tentar esconder o splash screen mesmo com erro
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.display = 'none';
        }
        
        alert('Erro na inicialização do sistema. Verifique o console para mais detalhes.');
    }
});

// Service Worker para funcionamento offline (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}