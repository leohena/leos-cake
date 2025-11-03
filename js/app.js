// Sistema de Gerenciamento de Pré-Vendas - Leo's Cake
class PreVendasApp {
    constructor() {
        this.produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        this.pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        this.configuracoes = JSON.parse(localStorage.getItem('configuracoes')) || this.getDefaultConfig();
        this.horariosDisponiveis = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        this.currentEditId = null;
        this.currentEditType = null;
        this.currentCalendarDate = new Date();
        this.selectedDeliveryDate = null;
        this.selectedDeliveryTime = null;
        this.currentReciboId = null;
        this.isOnline = navigator.onLine;
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || null;
        this.sheetsAPI = null;
        
        this.checkAuthentication();
        this.init();
        this.initEmailJS();
        this.initGoogleSheets();
        this.setupOnlineListeners();
    }

    // SISTEMA DE AUTENTICAÇÃO
    checkAuthentication() {
        const isAuthenticated = localStorage.getItem('leos_cake_auth');
        const authExpiry = localStorage.getItem('leos_cake_auth_expiry');
        const currentUser = localStorage.getItem('leos_cake_current_user');
        
        // Verificar se autenticação ainda é válida (24 horas) e se há usuário
        if (isAuthenticated && authExpiry && currentUser && new Date().getTime() < parseInt(authExpiry)) {
            this.currentUser = JSON.parse(currentUser);
            return true;
        }
        
        // Se não autenticado, mostrar tela de login
        this.showLoginScreen();
        return false;
    }

    // Método para criar hash simples da senha (não é criptografia real)
    createPasswordHash(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converter para 32 bits
        }
        return Math.abs(hash).toString(36);
    }

    // Carregar usuários do Google Sheets
    async loadUsers() {
        if (!this.sheetsApi || !this.configuracoes.googleSheets.spreadsheetId) {
            console.log('Google Sheets não configurado para usuários');
            return false;
        }

        try {
            const response = await this.sheetsApi.spreadsheets.values.get({
                spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
                range: 'Usuarios!A:H'
            });

            const rows = response.result.values;
            if (!rows || rows.length < 2) {
                // Criar usuário admin padrão se não existir
                await this.createDefaultUser();
                return false;
            }

            // Processar usuários (ignorar cabeçalho)
            this.usuarios = rows.slice(1).map(row => ({
                id: parseInt(row[0]) || 0,
                nome: row[1] || '',
                email: row[2] || '',
                senhaHash: row[3] || '',
                tipo: row[4] || 'user',
                ativo: row[5] === 'true',
                dataCriacao: row[6] || '',
                ultimoLogin: row[7] || ''
            })).filter(user => user.ativo);

            return true;
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            return false;
        }
    }

    // Criar usuário admin padrão
    async createDefaultUser() {
        const defaultUser = [
            ['ID', 'Nome', 'Email', 'Senha_Hash', 'Tipo', 'Ativo', 'Data_Criacao', 'Ultimo_Login'],
            [1, 'Administrador', 'admin@leoscake.com', this.createPasswordHash('leoscake2024'), 'admin', 'true', new Date().toISOString().split('T')[0], '']
        ];

        try {
            await this.sheetsApi.spreadsheets.values.update({
                spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
                range: 'Usuarios!A1:H2',
                valueInputOption: 'RAW',
                resource: { values: defaultUser }
            });
            
            this.showToast('Usuário admin padrão criado! Email: admin@leoscake.com, Senha: leoscake2024', 'success');
        } catch (error) {
            console.error('Erro ao criar usuário padrão:', error);
        }
    }

    // Autenticar usuário via Google Sheets
    async authenticateUser(email, password) {
        if (!await this.loadUsers()) {
            // Fallback para senha local se Google Sheets não estiver disponível
            if (password === 'leoscake2024') {
                return {
                    id: 1,
                    nome: 'Administrador',
                    email: 'admin@leoscake.com',
                    tipo: 'admin',
                    ativo: true
                };
            }
            return null;
        }

        const passwordHash = this.createPasswordHash(password);
        const user = this.usuarios.find(u => 
            (u.email === email || email === 'admin') && 
            u.senhaHash === passwordHash && 
            u.ativo
        );

        if (user) {
            // Atualizar último login
            await this.updateLastLogin(user.id);
            return user;
        }

        return null;
    }

    // Atualizar último login do usuário
    async updateLastLogin(userId) {
        try {
            const userIndex = this.usuarios.findIndex(u => u.id === userId);
            if (userIndex >= 0) {
                const range = `Usuarios!H${userIndex + 2}`; // +2 por causa do cabeçalho e índice base 0
                const today = new Date().toISOString().split('T')[0];
                
                await this.sheetsApi.spreadsheets.values.update({
                    spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
                    range: range,
                    valueInputOption: 'RAW',
                    resource: { values: [[today]] }
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar último login:', error);
        }
    }

    alterarSenhaDoSistema() {
        const senhaAtual = document.getElementById('sistema-senha-atual').value;
        const senhaNova = document.getElementById('sistema-senha-nova').value;
        const senhaConfirmar = document.getElementById('sistema-senha-confirmar').value;

        // Validações
        if (!senhaAtual || !senhaNova || !senhaConfirmar) {
            this.showToast('Preencha todos os campos de senha!', 'error');
            return;
        }

        if (senhaAtual !== this.userPassword) {
            this.showToast('Senha atual incorreta!', 'error');
            return;
        }

        if (senhaNova.length < 6) {
            this.showToast('A nova senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }

        if (senhaNova !== senhaConfirmar) {
            this.showToast('As senhas não conferem!', 'error');
            return;
        }

        if (senhaNova === senhaAtual) {
            this.showToast('A nova senha deve ser diferente da atual!', 'error');
            return;
        }

        // Salvar nova senha
        this.saveUserPassword(senhaNova);
        
        // Limpar campos
        document.getElementById('sistema-senha-atual').value = '';
        document.getElementById('sistema-senha-nova').value = '';
        document.getElementById('sistema-senha-confirmar').value = '';

        // Mostrar alerta de sucesso
        this.showToast('🔒 Senha alterada com sucesso! Ela será mantida mesmo após atualizações do sistema.', 'success');
    }

    // USER MANAGEMENT METHODS
    async loadAndDisplayUsers() {
        const success = await this.loadUsers();
        if (success && this.usuarios) {
            this.displayUsers();
            document.getElementById('users-list').style.display = 'block';
            this.showToast('Usuários carregados do Google Sheets', 'success');
        } else {
            this.showToast('Erro ao carregar usuários ou Google Sheets não configurado', 'error');
        }
    }

    displayUsers() {
        const container = document.getElementById('users-container');
        container.innerHTML = '';

        if (!this.usuarios || this.usuarios.length === 0) {
            container.innerHTML = '<p>Nenhum usuário cadastrado</p>';
            return;
        }

        this.usuarios.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.innerHTML = `
                <div class="user-info">
                    <div class="user-name">${user.nome}</div>
                    <div class="user-email">${user.email}</div>
                    <span class="user-type ${user.tipo}">${user.tipo}</span>
                    <small style="display: block; margin-top: 5px; color: #666;">
                        Último login: ${user.ultimoLogin || 'Never'}
                    </small>
                </div>
                <div class="user-actions">
                    <button class="edit-user" onclick="app.editUser(${user.id})">✏️</button>
                    <button class="toggle-user" onclick="app.toggleUser(${user.id})">
                        ${user.ativo ? '🔒' : '🔓'}
                    </button>
                    <button class="delete-user" onclick="app.deleteUser(${user.id})">🗑️</button>
                </div>
            `;
            container.appendChild(userCard);
        });
    }

    openUserModal(user = null) {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('user-modal-title');

        if (user) {
            title.textContent = 'Editar Usuário';
            document.getElementById('user-nome').value = user.nome;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-senha').value = '';
            document.getElementById('user-tipo').value = user.tipo;
            document.getElementById('user-ativo').checked = user.ativo;
            this.currentEditUserId = user.id;
        } else {
            title.textContent = 'Novo Usuário';
            document.getElementById('user-form').reset();
            document.getElementById('user-ativo').checked = true;
            this.currentEditUserId = null;
        }

        modal.classList.add('active');
    }

    closeUserModal() {
        document.getElementById('user-modal').classList.remove('active');
        document.getElementById('user-form').reset();
        this.currentEditUserId = null;
    }

    async saveUser() {
        const nome = document.getElementById('user-nome').value;
        const email = document.getElementById('user-email').value;
        const senha = document.getElementById('user-senha').value;
        const tipo = document.getElementById('user-tipo').value;
        const ativo = document.getElementById('user-ativo').checked;

        if (!nome || !email || (!senha && !this.currentEditUserId)) {
            this.showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }

        try {
            let user;
            if (this.currentEditUserId) {
                // Editando usuário existente
                user = {
                    id: this.currentEditUserId,
                    nome,
                    email,
                    senhaHash: senha ? this.createPasswordHash(senha) : this.usuarios.find(u => u.id === this.currentEditUserId).senhaHash,
                    tipo,
                    ativo,
                    dataCriacao: this.usuarios.find(u => u.id === this.currentEditUserId).dataCriacao,
                    ultimoLogin: this.usuarios.find(u => u.id === this.currentEditUserId).ultimoLogin
                };
                await this.updateUserInSheets(user);
            } else {
                // Novo usuário
                const newId = Math.max(...(this.usuarios?.map(u => u.id) || [0])) + 1;
                user = {
                    id: newId,
                    nome,
                    email,
                    senhaHash: this.createPasswordHash(senha),
                    tipo,
                    ativo,
                    dataCriacao: new Date().toISOString().split('T')[0],
                    ultimoLogin: ''
                };
                await this.addUserToSheets(user);
            }

            this.closeUserModal();
            this.loadAndDisplayUsers();
            this.showToast('Usuário salvo com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            this.showToast('Erro ao salvar usuário', 'error');
        }
    }

    async addUserToSheets(user) {
        const values = [[
            user.id,
            user.nome,
            user.email,
            user.senhaHash,
            user.tipo,
            user.ativo.toString(),
            user.dataCriacao,
            user.ultimoLogin
        ]];

        await this.sheetsApi.spreadsheets.values.append({
            spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
            range: 'Usuarios!A:H',
            valueInputOption: 'RAW',
            resource: { values }
        });
    }

    async updateUserInSheets(user) {
        const userIndex = this.usuarios.findIndex(u => u.id === user.id);
        if (userIndex >= 0) {
            const range = `Usuarios!A${userIndex + 2}:H${userIndex + 2}`;
            const values = [[
                user.id,
                user.nome,
                user.email,
                user.senhaHash,
                user.tipo,
                user.ativo.toString(),
                user.dataCriacao,
                user.ultimoLogin
            ]];

            await this.sheetsApi.spreadsheets.values.update({
                spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
                range: range,
                valueInputOption: 'RAW',
                resource: { values }
            });
        }
    }

    async editUser(userId) {
        const user = this.usuarios.find(u => u.id === userId);
        if (user) {
            this.openUserModal(user);
        }
    }

    async toggleUser(userId) {
        const user = this.usuarios.find(u => u.id === userId);
        if (user) {
            user.ativo = !user.ativo;
            await this.updateUserInSheets(user);
            this.loadAndDisplayUsers();
            this.showToast(`Usuário ${user.ativo ? 'ativado' : 'desativado'}!`, 'success');
        }
    }

    async deleteUser(userId) {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

        try {
            const userIndex = this.usuarios.findIndex(u => u.id === userId);
            if (userIndex >= 0) {
                // Remover linha do Google Sheets
                await this.sheetsApi.spreadsheets.batchUpdate({
                    spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
                    resource: {
                        requests: [{
                            deleteDimension: {
                                range: {
                                    sheetId: 0, // Assumindo que é a primeira aba
                                    dimension: 'ROWS',
                                    startIndex: userIndex + 1, // +1 por causa do cabeçalho
                                    endIndex: userIndex + 2
                                }
                            }
                        }]
                    }
                });

                this.loadAndDisplayUsers();
                this.showToast('Usuário excluído com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            this.showToast('Erro ao excluir usuário', 'error');
        }
    }
    
    showLoginScreen() {
        document.body.innerHTML = `
            <div class="login-screen">
                <div class="login-container">
                    <div class="login-header">
                        <div class="login-logo">
                            <img id="login-logo-img" src="./images/logo-png.png" alt="Leo's Cake" onerror="tryNextLogo()">
                            <h1 id="login-logo-fallback" style="display: none;">🧁 Leo's Cake</h1>
                        </div>
                        <h2>Leo's Cake</h2>
                        <p>Sistema de Pré-Vendas</p>
                    </div>
                    <div class="login-form">
                        <h3>🔐 Acesso ao Sistema</h3>
                        <p>Digite suas credenciais para acessar:</p>
                        <input type="email" id="login-email" placeholder="Email (opcional: use 'admin')" />
                        <input type="password" id="login-password" placeholder="Senha do sistema" />
                        <button id="login-btn">Entrar</button>
                        <div id="login-error" class="login-error" style="display: none;">
                            ❌ Credenciais incorretas!
                        </div>
                    </div>
                    <div class="login-footer">
                        <p>Sistema protegido por autenticação</p>
                    </div>
                </div>
            </div>
        `;
        
        // Event listeners para login
        document.getElementById('login-btn').addEventListener('click', () => this.attemptLogin());
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.attemptLogin();
        });
        
        // Setup logo com fallback inteligente
        this.setupLoginLogo();
        
        // Focar no campo de senha
        document.getElementById('login-password').focus();
    }
    
    async attemptLogin() {
        const email = document.getElementById('login-email').value || 'admin';
        const password = document.getElementById('login-password').value;
        
        if (!password) {
            this.showLoginError('Digite a senha!');
            return;
        }

        // Mostrar loading
        const loginBtn = document.getElementById('login-btn');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Verificando...';
        loginBtn.disabled = true;

        try {
            const user = await this.authenticateUser(email, password);
            
            if (user) {
                // Autenticação válida por 24 horas
                const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
                localStorage.setItem('leos_cake_auth', 'true');
                localStorage.setItem('leos_cake_auth_expiry', expiry.toString());
                localStorage.setItem('leos_cake_current_user', JSON.stringify(user));
                
                this.currentUser = user;
                
                // Recarregar página para iniciar sistema
                location.reload();
            } else {
                this.showLoginError('Email ou senha incorretos!');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showLoginError('Erro ao conectar. Tente novamente.');
        } finally {
            // Restaurar botão
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        document.getElementById('login-password').value = '';
        document.getElementById('login-password').focus();
    }
    
    setupLoginLogo() {
        const img = document.getElementById('login-logo-img');
        const fallback = document.getElementById('login-logo-fallback');
        const possiblePaths = [
            './images/logo-png.png',
            'images/logo-png.png',
            './images/logo.png',
            'images/logo.png',
            './images/logo.jpg',
            'images/logo.jpg',
            './images/logo.jpeg',
            'images/logo.jpeg'
        ];
        let currentIndex = 0;
        
        // Função para tentar próximo caminho
        window.tryNextLogo = function() {
            currentIndex++;
            if (currentIndex < possiblePaths.length) {
                img.src = possiblePaths[currentIndex];
            } else {
                // Se nenhum logo funcionar, mostrar fallback
                img.style.display = 'none';
                fallback.style.display = 'block';
            }
        };
        
        // Adicionar método ao elemento img
        img.tryNextLogo = window.tryNextLogo;
    }

    init() {
        this.showSplashScreen();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderProdutos();
        this.renderClientes();
        this.renderPedidos();
        this.updateEntregasHoje();
        this.setupDateFilter();
        this.hideSplashScreen();

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

    showSplashScreen() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.display = 'flex';
        }
    }

    hideSplashScreen() {
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add('hidden');
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 500);
            }
        }, 2000); // Mostrar por 2 segundos
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.dataset.page;
                this.showPage(targetPage);
            });
        });

        // Produto Modal
        document.getElementById('add-produto-btn').addEventListener('click', () => {
            this.openProdutoModal();
        });
        
        document.getElementById('produto-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduto();
        });

        document.getElementById('cancel-produto').addEventListener('click', () => {
            this.closeProdutoModal();
        });

        // Cliente Modal
        document.getElementById('add-cliente-btn').addEventListener('click', () => {
            this.openClienteModal();
        });
        
        document.getElementById('cliente-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCliente();
        });

        document.getElementById('cancel-cliente').addEventListener('click', () => {
            this.closeClienteModal();
        });

        // Pedido Modal
        document.getElementById('add-pedido-btn').addEventListener('click', () => {
            this.openPedidoModal();
        });
        
        document.getElementById('pedido-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePedido();
        });

        document.getElementById('cancel-pedido').addEventListener('click', () => {
            this.closePedidoModal();
        });

        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.previousMonth();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.nextMonth();
        });

        // Close modals
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Image preview
        document.getElementById('produto-imagem').addEventListener('change', (e) => {
            this.previewImage(e.target);
        });

        // Search functionality
        document.getElementById('search-produtos').addEventListener('input', (e) => {
            this.searchProdutos(e.target.value);
        });

        document.getElementById('search-clientes').addEventListener('input', (e) => {
            this.searchClientes(e.target.value);
        });

        // Filter pedidos
        document.getElementById('filter-status').addEventListener('change', (e) => {
            this.filterPedidos(e.target.value);
        });

        // Date filter for entregas
        document.getElementById('date-filter').addEventListener('change', (e) => {
            this.filterEntregasByDate(e.target.value);
        });

        // Pedido form calculations
        document.getElementById('pedido-valor-pago').addEventListener('input', () => {
            this.calculateSaldo();
        });

        document.getElementById('pedido-data-entrega').addEventListener('change', () => {
            this.updateHorariosDisponiveis();
        });

        // Add produto to pedido
        document.getElementById('add-produto-pedido').addEventListener('click', () => {
            this.showProdutoSelector();
        });

        // Sync button
        document.getElementById('sync-btn').addEventListener('click', () => {
            this.syncData();
        });

        // Config button
        document.getElementById('config-btn').addEventListener('click', () => {
            this.openConfigModal();
        });

        // Config form
        document.getElementById('config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConfig();
        });

        document.getElementById('cancel-config').addEventListener('click', () => {
            this.closeConfigModal();
        });

        // Alterar senha
        document.getElementById('alterar-senha-btn').addEventListener('click', () => {
            this.alterarSenhaDoSistema();
        });

        // Google Sheets test connection
        document.getElementById('test-sheets-connection').addEventListener('click', () => {
            this.testSheetsConnection();
        });

        // Logout forçado
        document.getElementById('logout-btn').addEventListener('click', () => {
            if (confirm('⚠️ Isso forçará logout em todos os dispositivos. Continuar?')) {
                localStorage.removeItem('leos_cake_auth');
                localStorage.removeItem('leos_cake_auth_expiry');
                this.showToast('Logout forçado executado! Página será recarregada.', 'success');
                setTimeout(() => location.reload(), 2000);
            }
        });

        // Load from sheets
        document.getElementById('load-from-sheets').addEventListener('click', () => {
            this.loadFromSheetsWithConfirmation();
        });

        // User management
        document.getElementById('load-users-btn').addEventListener('click', () => {
            this.loadAndDisplayUsers();
        });

        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.openUserModal();
        });

        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        document.getElementById('cancel-user').addEventListener('click', () => {
            this.closeUserModal();
        });
    }

    loadFromSheetsWithConfirmation() {
        if (confirm('Isso substituirá todos os dados locais pelos dados do Google Sheets. Continuar?')) {
            this.loadFromSheets().then(success => {
                if (success) {
                    this.showToast('Dados carregados do Google Sheets!', 'success');
                } else {
                    this.showToast('Erro ao carregar dados do Google Sheets', 'error');
                }
            });
        }
    }

    showPage(pageName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        // Update pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageName).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            produtos: 'Produtos',
            clientes: 'Clientes',
            pedidos: 'Pedidos',
            entregas: 'Entregas'
        };
        document.getElementById('page-title').textContent = titles[pageName];

        // Update specific page content
        if (pageName === 'dashboard') {
            this.updateDashboard();
            this.updateEntregasHoje();
        } else if (pageName === 'entregas') {
            this.renderEntregas();
        }
    }

    // PRODUTOS
    openProdutoModal(produto = null) {
        const modal = document.getElementById('produto-modal');
        const form = document.getElementById('produto-form');
        const title = document.getElementById('produto-modal-title');
        
        if (produto) {
            this.currentEditId = produto.id;
            this.currentEditType = 'produto';
            title.textContent = 'Editar Produto';
            
            document.getElementById('produto-nome').value = produto.nome;
            document.getElementById('produto-descricao').value = produto.descricao;
            document.getElementById('produto-preco').value = produto.preco;
            document.getElementById('produto-estoque').value = produto.estoque;
            
            if (produto.imagem) {
                document.getElementById('preview-imagem').innerHTML = 
                    `<img src="${produto.imagem}" alt="Preview">`;
            }
        } else {
            this.currentEditId = null;
            this.currentEditType = null;
            title.textContent = 'Adicionar Produto';
            form.reset();
            document.getElementById('preview-imagem').innerHTML = '';
        }
        
        modal.classList.add('active');
    }

    closeProdutoModal() {
        document.getElementById('produto-modal').classList.remove('active');
        document.getElementById('produto-form').reset();
        document.getElementById('preview-imagem').innerHTML = '';
        this.currentEditId = null;
        this.currentEditType = null;
    }

    saveProduto() {
        const nome = document.getElementById('produto-nome').value;
        const descricao = document.getElementById('produto-descricao').value;
        const preco = parseFloat(document.getElementById('produto-preco').value);
        const estoque = parseInt(document.getElementById('produto-estoque').value);
        const imagemFile = document.getElementById('produto-imagem').files[0];

        if (!nome || !preco || estoque < 0) {
            this.showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        const produto = {
            id: this.currentEditId || Date.now(),
            nome,
            descricao,
            preco,
            estoque,
            imagem: null,
            created: this.currentEditId ? 
                this.produtos.find(p => p.id === this.currentEditId)?.created || new Date().toISOString() :
                new Date().toISOString()
        };

        if (imagemFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                produto.imagem = e.target.result;
                this.finalizeSaveProduto(produto);
            };
            reader.readAsDataURL(imagemFile);
        } else if (this.currentEditId) {
            const existingProduto = this.produtos.find(p => p.id === this.currentEditId);
            produto.imagem = existingProduto?.imagem || null;
            this.finalizeSaveProduto(produto);
        } else {
            this.finalizeSaveProduto(produto);
        }
    }

    finalizeSaveProduto(produto) {
        if (this.currentEditId) {
            const index = this.produtos.findIndex(p => p.id === this.currentEditId);
            this.produtos[index] = produto;
        } else {
            this.produtos.push(produto);
        }

        this.saveToStorage('produtos');
        this.renderProdutos();
        this.closeProdutoModal();
        this.updateDashboard();
        this.showToast('Produto salvo com sucesso!', 'success');
    }

    deleteProduto(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.produtos = this.produtos.filter(p => p.id !== id);
            this.saveToStorage('produtos');
            this.renderProdutos();
            this.updateDashboard();
            this.showToast('Produto excluído com sucesso!', 'success');
        }
    }

    renderProdutos(filteredProdutos = null) {
        const container = document.getElementById('produtos-list');
        const produtosToRender = filteredProdutos || this.produtos;

        if (produtosToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <img src="images/logo-png.png" alt="Logo" class="empty-state-logo">
                    <div class="empty-state-text">Nenhum produto cadastrado</div>
                    <div class="empty-state-subtext">Adicione seu primeiro produto clicando no botão acima</div>
                </div>
            `;
            return;
        }

        container.innerHTML = produtosToRender.map(produto => `
            <div class="produto-card">
                <div class="produto-image">
                    ${produto.imagem ? 
                        `<img src="${produto.imagem}" alt="${produto.nome}" style="width: 100%; height: 100%; object-fit: cover;">` :
                        '🧁'
                    }
                </div>
                <div class="produto-info">
                    <div class="produto-nome">${produto.nome}</div>
                    <div class="produto-descricao">${produto.descricao}</div>
                    <div class="produto-preco">R$ ${produto.preco.toFixed(2)}</div>
                    <div class="produto-estoque ${produto.estoque <= 5 ? 'baixo' : ''}">
                        Estoque: ${produto.estoque} unidades
                        ${produto.estoque <= 5 ? ' ⚠️' : ''}
                    </div>
                    <div class="produto-actions">
                        <button class="btn btn-secondary" onclick="app.openProdutoModal(${JSON.stringify(produto).replace(/"/g, '&quot;')})">
                            Editar
                        </button>
                        <button class="btn btn-danger" onclick="app.deleteProduto(${produto.id})">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    searchProdutos(query) {
        const filtered = this.produtos.filter(produto =>
            produto.nome.toLowerCase().includes(query.toLowerCase()) ||
            produto.descricao.toLowerCase().includes(query.toLowerCase())
        );
        this.renderProdutos(filtered);
    }

    // CLIENTES
    openClienteModal(cliente = null) {
        const modal = document.getElementById('cliente-modal');
        const form = document.getElementById('cliente-form');
        const title = document.getElementById('cliente-modal-title');
        
        if (cliente) {
            this.currentEditId = cliente.id;
            this.currentEditType = 'cliente';
            title.textContent = 'Editar Cliente';
            
            document.getElementById('cliente-nome').value = cliente.nome;
            document.getElementById('cliente-telefone').value = cliente.telefone;
            document.getElementById('cliente-endereco').value = cliente.endereco;
            document.getElementById('cliente-email').value = cliente.email || '';
        } else {
            this.currentEditId = null;
            this.currentEditType = null;
            title.textContent = 'Adicionar Cliente';
            form.reset();
        }
        
        modal.classList.add('active');
    }

    closeClienteModal() {
        document.getElementById('cliente-modal').classList.remove('active');
        document.getElementById('cliente-form').reset();
        this.currentEditId = null;
        this.currentEditType = null;
    }

    saveCliente() {
        const nome = document.getElementById('cliente-nome').value;
        const telefone = document.getElementById('cliente-telefone').value;
        const endereco = document.getElementById('cliente-endereco').value;
        const email = document.getElementById('cliente-email').value;

        if (!nome || !telefone || !endereco) {
            this.showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        const cliente = {
            id: this.currentEditId || Date.now(),
            nome,
            telefone,
            endereco,
            email,
            created: this.currentEditId ? 
                this.clientes.find(c => c.id === this.currentEditId)?.created || new Date().toISOString() :
                new Date().toISOString()
        };

        if (this.currentEditId) {
            const index = this.clientes.findIndex(c => c.id === this.currentEditId);
            this.clientes[index] = cliente;
        } else {
            this.clientes.push(cliente);
        }

        this.saveToStorage('clientes');
        this.renderClientes();
        this.closeClienteModal();
        this.updateDashboard();
        this.updateClienteSelect();
        this.showToast('Cliente salvo com sucesso!', 'success');
    }

    deleteCliente(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            this.clientes = this.clientes.filter(c => c.id !== id);
            this.saveToStorage('clientes');
            this.renderClientes();
            this.updateDashboard();
            this.updateClienteSelect();
            this.showToast('Cliente excluído com sucesso!', 'success');
        }
    }

    renderClientes(filteredClientes = null) {
        const container = document.getElementById('clientes-list');
        const clientesToRender = filteredClientes || this.clientes;

        if (clientesToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <img src="images/logo-png.png" alt="Logo" class="empty-state-logo">
                    <div class="empty-state-text">Nenhum cliente cadastrado</div>
                    <div class="empty-state-subtext">Adicione seu primeiro cliente clicando no botão acima</div>
                </div>
            `;
            return;
        }

        container.innerHTML = clientesToRender.map(cliente => `
            <div class="cliente-card">
                <div class="cliente-header">
                    <div class="cliente-nome">${cliente.nome}</div>
                    <div class="cliente-actions">
                        <button class="btn btn-secondary" onclick="app.openClienteModal(${JSON.stringify(cliente).replace(/"/g, '&quot;')})">
                            Editar
                        </button>
                        <button class="btn btn-danger" onclick="app.deleteCliente(${cliente.id})">
                            Excluir
                        </button>
                    </div>
                </div>
                <div class="cliente-info">
                    <div>📞 ${cliente.telefone}</div>
                    <div>📍 ${cliente.endereco}</div>
                    ${cliente.email ? `<div>📧 ${cliente.email}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    searchClientes(query) {
        const filtered = this.clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(query.toLowerCase()) ||
            cliente.telefone.includes(query) ||
            cliente.endereco.toLowerCase().includes(query.toLowerCase())
        );
        this.renderClientes(filtered);
    }

    updateClienteSelect() {
        const select = document.getElementById('pedido-cliente');
        select.innerHTML = '<option value="">Selecione um cliente</option>' +
            this.clientes.map(cliente => 
                `<option value="${cliente.id}">${cliente.nome}</option>`
            ).join('');
    }

    // CALENDAR & DELIVERY SCHEDULER
    initCalendar() {
        this.currentCalendarDate = new Date();
        this.renderCalendar();
    }

    renderCalendar() {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const currentMonth = this.currentCalendarDate.getMonth();
        const currentYear = this.currentCalendarDate.getFullYear();

        // Update header
        document.getElementById('current-month-year').textContent = 
            `${monthNames[currentMonth]} ${currentYear}`;

        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Clear calendar
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';

        // Generate 42 days (6 weeks)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();

            // Add classes based on date
            if (date.getMonth() !== currentMonth) {
                dayElement.classList.add('other-month');
            }

            if (date < today) {
                dayElement.classList.add('past');
            } else {
                // Check if date has deliveries
                const dateString = this.formatDate(date);
                const hasDeliveries = this.pedidos.some(pedido => 
                    pedido.dataEntrega === dateString
                );
                
                if (hasDeliveries) {
                    dayElement.classList.add('has-deliveries');
                }

                // Add click event for future dates
                dayElement.addEventListener('click', () => {
                    if (!dayElement.classList.contains('past')) {
                        this.selectDate(date);
                    }
                });
            }

            calendarDays.appendChild(dayElement);
        }
    }

    selectDate(date) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });

        // Add selection to clicked day
        event.target.classList.add('selected');

        // Store selected date
        this.selectedDeliveryDate = date;
        this.selectedDeliveryTime = null;

        // Update display
        const dateString = this.formatDateDisplay(date);
        document.getElementById('selected-date-display').textContent = dateString;

        // Update hidden field
        document.getElementById('pedido-data-entrega').value = this.formatDate(date);

        // Load available times for this date
        this.loadAvailableTimes(date);
    }

    loadAvailableTimes(date) {
        const dateString = this.formatDate(date);
        const timeSlotsContainer = document.getElementById('available-times');
        timeSlotsContainer.innerHTML = '';

        // Get occupied times for this date
        const occupiedTimes = this.pedidos
            .filter(pedido => pedido.dataEntrega === dateString)
            .map(pedido => pedido.horarioEntrega);

        // Create time slots
        this.horariosDisponiveis.forEach(time => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = time;

            if (occupiedTimes.includes(time)) {
                timeSlot.classList.add('occupied');
            } else {
                timeSlot.addEventListener('click', () => {
                    this.selectTime(time);
                });
            }

            timeSlotsContainer.appendChild(timeSlot);
        });
    }

    selectTime(time) {
        // Remove previous selection
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Add selection to clicked time
        event.target.classList.add('selected');

        // Store selected time
        this.selectedDeliveryTime = time;

        // Update hidden field
        document.getElementById('pedido-horario-entrega').value = time;
    }

    previousMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
        this.renderCalendar();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateDisplay(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('pt-BR', options);
    }

    // PEDIDOS
    openPedidoModal(pedido = null) {
        const modal = document.getElementById('pedido-modal');
        const title = document.getElementById('pedido-modal-title');
        
        this.updateClienteSelect();
        
        if (pedido) {
            this.currentEditId = pedido.id;
            this.currentEditType = 'pedido';
            title.textContent = 'Editar Pedido';
            
            document.getElementById('pedido-cliente').value = pedido.clienteId;
            document.getElementById('pedido-valor-total').value = pedido.valorTotal.toFixed(2);
            document.getElementById('pedido-valor-pago').value = pedido.valorPago.toFixed(2);
            document.getElementById('pedido-saldo').value = pedido.saldo.toFixed(2);
            document.getElementById('pedido-data-entrega').value = pedido.dataEntrega;
            document.getElementById('pedido-observacoes').value = pedido.observacoes || '';
            
            // Set calendar date if editing
            if (pedido.dataEntrega) {
                const date = new Date(pedido.dataEntrega + 'T00:00:00');
                this.currentCalendarDate = new Date(date.getFullYear(), date.getMonth(), 1);
                this.selectedDeliveryDate = date;
                this.selectedDeliveryTime = pedido.horarioEntrega;
            }
            
            // Renderizar produtos do pedido
            this.renderProdutosPedido(pedido.produtos);
            this.updateHorariosDisponiveis();
            document.getElementById('pedido-horario-entrega').value = pedido.horarioEntrega;
        } else {
            this.currentEditId = null;
            this.currentEditType = null;
            title.textContent = 'Novo Pedido';
            document.getElementById('pedido-form').reset();
            document.getElementById('produtos-pedido').innerHTML = '';
            this.selectedDeliveryDate = null;
            this.selectedDeliveryTime = null;
            this.updateHorariosDisponiveis();
        }

        // Initialize calendar
        this.initCalendar();
        
        modal.classList.add('active');
    }

    closePedidoModal() {
        document.getElementById('pedido-modal').classList.remove('active');
        document.getElementById('pedido-form').reset();
        document.getElementById('produtos-pedido').innerHTML = '';
        this.currentEditId = null;
        this.currentEditType = null;
    }

    savePedido() {
        const clienteId = parseInt(document.getElementById('pedido-cliente').value);
        const valorTotal = parseFloat(document.getElementById('pedido-valor-total').value) || 0;
        const valorPago = parseFloat(document.getElementById('pedido-valor-pago').value) || 0;
        const dataEntrega = document.getElementById('pedido-data-entrega').value;
        const horarioEntrega = document.getElementById('pedido-horario-entrega').value;
        const observacoes = document.getElementById('pedido-observacoes').value;

        const produtosPedido = this.getProdutosPedidoFromForm();

        if (!clienteId || produtosPedido.length === 0 || !dataEntrega || !horarioEntrega) {
            this.showToast('Preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (valorPago > valorTotal) {
            this.showToast('Valor pago não pode ser maior que o valor total', 'error');
            return;
        }

        // Verificar estoque
        for (const item of produtosPedido) {
            const produto = this.produtos.find(p => p.id === item.produtoId);
            if (!produto || produto.estoque < item.quantidade) {
                this.showToast(`Estoque insuficiente para ${produto?.nome || 'produto'}`, 'error');
                return;
            }
        }

        const pedido = {
            id: this.currentEditId || Date.now(),
            clienteId,
            produtos: produtosPedido,
            valorTotal,
            valorPago,
            saldo: valorTotal - valorPago,
            dataEntrega,
            horarioEntrega,
            observacoes,
            status: valorPago >= valorTotal ? 'pago' : 'pendente',
            created: this.currentEditId ? 
                this.pedidos.find(p => p.id === this.currentEditId)?.created || new Date().toISOString() :
                new Date().toISOString()
        };

        // Atualizar estoque apenas se for um novo pedido
        if (!this.currentEditId) {
            produtosPedido.forEach(item => {
                const produto = this.produtos.find(p => p.id === item.produtoId);
                produto.estoque -= item.quantidade;
            });
            this.saveToStorage('produtos');
        }

        if (this.currentEditId) {
            const index = this.pedidos.findIndex(p => p.id === this.currentEditId);
            this.pedidos[index] = pedido;
        } else {
            this.pedidos.push(pedido);
        }

        this.saveToStorage('pedidos');
        this.renderPedidos();
        this.closePedidoModal();
        this.updateDashboard();
        this.renderProdutos(); // Atualizar vista de produtos para mostrar novo estoque
        this.showToast('Pedido salvo com sucesso!', 'success');
    }

    deletePedido(id) {
        if (confirm('Tem certeza que deseja excluir este pedido?')) {
            this.pedidos = this.pedidos.filter(p => p.id !== id);
            this.saveToStorage('pedidos');
            this.renderPedidos();
            this.updateDashboard();
            this.showToast('Pedido excluído com sucesso!', 'success');
        }
    }

    marcarComoEntregue(id) {
        const pedido = this.pedidos.find(p => p.id === id);
        if (pedido) {
            pedido.status = 'entregue';
            pedido.dataEntregaRealizada = new Date().toISOString();
            this.saveToStorage('pedidos');
            this.renderPedidos();
            this.updateDashboard();
            this.showToast('Pedido marcado como entregue!', 'success');
        }
    }

    // PRODUTOS DO PEDIDO
    showProdutoSelector() {
        const produtosDisponiveis = this.produtos.filter(p => p.estoque > 0);
        
        if (produtosDisponiveis.length === 0) {
            this.showToast('Não há produtos com estoque disponível', 'error');
            return;
        }

        const options = produtosDisponiveis.map(produto => 
            `<option value="${produto.id}">${produto.nome} - R$ ${produto.preco.toFixed(2)} (Estoque: ${produto.estoque})</option>`
        ).join('');

        const select = document.createElement('select');
        select.innerHTML = '<option value="">Selecione um produto</option>' + options;
        select.style.width = '100%';
        select.style.padding = '0.5rem';
        select.style.marginBottom = '0.5rem';

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.value = '1';
        quantityInput.placeholder = 'Quantidade';
        quantityInput.style.width = '100%';
        quantityInput.style.padding = '0.5rem';
        quantityInput.style.marginBottom = '0.5rem';

        const addButton = document.createElement('button');
        addButton.textContent = 'Adicionar';
        addButton.className = 'btn btn-primary';
        addButton.style.width = '100%';

        const container = document.createElement('div');
        container.appendChild(select);
        container.appendChild(quantityInput);
        container.appendChild(addButton);

        const existingSelector = document.querySelector('.produto-selector');
        if (existingSelector) existingSelector.remove();

        container.className = 'produto-selector';
        document.getElementById('add-produto-pedido').parentNode.insertBefore(container, document.getElementById('add-produto-pedido'));

        addButton.addEventListener('click', () => {
            const produtoId = parseInt(select.value);
            const quantidade = parseInt(quantityInput.value);

            if (!produtoId || !quantidade || quantidade <= 0) {
                this.showToast('Selecione um produto e quantidade válida', 'error');
                return;
            }

            const produto = this.produtos.find(p => p.id === produtoId);
            if (quantidade > produto.estoque) {
                this.showToast('Quantidade maior que o estoque disponível', 'error');
                return;
            }

            this.addProdutoToPedido(produto, quantidade);
            container.remove();
        });
    }

    addProdutoToPedido(produto, quantidade) {
        const container = document.getElementById('produtos-pedido');
        
        // Verificar se o produto já foi adicionado
        const existingItem = container.querySelector(`[data-produto-id="${produto.id}"]`);
        if (existingItem) {
            this.showToast('Produto já adicionado ao pedido', 'error');
            return;
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'produto-pedido-item';
        itemDiv.dataset.produtoId = produto.id;
        itemDiv.innerHTML = `
            <div class="produto-pedido-info">
                <div class="produto-pedido-nome">${produto.nome}</div>
                <div class="produto-pedido-preco">R$ ${produto.preco.toFixed(2)} x ${quantidade} = R$ ${(produto.preco * quantidade).toFixed(2)}</div>
            </div>
            <div class="produto-pedido-actions">
                <input type="number" class="quantidade-input" value="${quantidade}" min="1" max="${produto.estoque}">
                <button class="remove-produto" onclick="this.parentElement.parentElement.remove(); app.calculateTotal();">×</button>
            </div>
        `;

        container.appendChild(itemDiv);

        // Atualizar quantidade quando mudada
        const quantityInput = itemDiv.querySelector('.quantidade-input');
        quantityInput.addEventListener('change', () => {
            const newQuantity = parseInt(quantityInput.value);
            if (newQuantity > produto.estoque) {
                quantityInput.value = produto.estoque;
                this.showToast('Quantidade ajustada para o estoque disponível', 'error');
            }
            const precoDiv = itemDiv.querySelector('.produto-pedido-preco');
            precoDiv.textContent = `R$ ${produto.preco.toFixed(2)} x ${quantityInput.value} = R$ ${(produto.preco * quantityInput.value).toFixed(2)}`;
            this.calculateTotal();
        });

        this.calculateTotal();
    }

    getProdutosPedidoFromForm() {
        const items = document.querySelectorAll('.produto-pedido-item');
        return Array.from(items).map(item => ({
            produtoId: parseInt(item.dataset.produtoId),
            quantidade: parseInt(item.querySelector('.quantidade-input').value)
        }));
    }

    renderProdutosPedido(produtos) {
        const container = document.getElementById('produtos-pedido');
        container.innerHTML = '';

        produtos.forEach(item => {
            const produto = this.produtos.find(p => p.id === item.produtoId);
            if (produto) {
                this.addProdutoToPedido(produto, item.quantidade);
            }
        });
    }

    calculateTotal() {
        const items = document.querySelectorAll('.produto-pedido-item');
        let total = 0;

        items.forEach(item => {
            const produtoId = parseInt(item.dataset.produtoId);
            const quantidade = parseInt(item.querySelector('.quantidade-input').value);
            const produto = this.produtos.find(p => p.id === produtoId);
            
            if (produto) {
                total += produto.preco * quantidade;
            }
        });

        document.getElementById('pedido-valor-total').value = total.toFixed(2);
        this.calculateSaldo();
    }

    calculateSaldo() {
        const valorTotal = parseFloat(document.getElementById('pedido-valor-total').value) || 0;
        const valorPago = parseFloat(document.getElementById('pedido-valor-pago').value) || 0;
        const saldo = valorTotal - valorPago;
        
        document.getElementById('pedido-saldo').value = saldo.toFixed(2);
    }

    renderPedidos(filteredPedidos = null) {
        const container = document.getElementById('pedidos-list');
        const pedidosToRender = filteredPedidos || this.pedidos;

        if (pedidosToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <img src="images/logo-png.png" alt="Logo" class="empty-state-logo">
                    <div class="empty-state-text">Nenhum pedido cadastrado</div>
                    <div class="empty-state-subtext">Adicione seu primeiro pedido clicando no botão acima</div>
                </div>
            `;
            return;
        }

        container.innerHTML = pedidosToRender.map(pedido => {
            const cliente = this.clientes.find(c => c.id === pedido.clienteId);
            const dataEntrega = new Date(pedido.dataEntrega).toLocaleDateString('pt-BR');
            
            return `
                <div class="pedido-card">
                    <div class="pedido-header">
                        <div class="pedido-cliente">${cliente?.nome || 'Cliente não encontrado'}</div>
                        <div class="pedido-actions">
                            <span class="pedido-status ${pedido.status}">${pedido.status.toUpperCase()}</span>
                            <button class="btn btn-primary" onclick="app.gerarRecibo(${pedido.id})">
                                📄 Recibo
                            </button>
                            ${pedido.status !== 'entregue' ? `
                                <button class="btn btn-success" onclick="app.marcarComoEntregue(${pedido.id})">
                                    Entregar
                                </button>
                            ` : ''}
                            <button class="btn btn-secondary" onclick="app.openPedidoModal(${JSON.stringify(pedido).replace(/"/g, '&quot;')})">
                                Editar
                            </button>
                            <button class="btn btn-danger" onclick="app.deletePedido(${pedido.id})">
                                Excluir
                            </button>
                        </div>
                    </div>
                    <div class="pedido-info">
                        <div><strong>Data de Entrega:</strong> ${dataEntrega} às ${pedido.horarioEntrega}</div>
                        <div><strong>Valor Total:</strong> R$ ${pedido.valorTotal.toFixed(2)}</div>
                        <div><strong>Valor Pago:</strong> R$ ${pedido.valorPago.toFixed(2)}</div>
                        ${pedido.saldo > 0 ? `<div><strong>Saldo:</strong> R$ ${pedido.saldo.toFixed(2)}</div>` : ''}
                        <div><strong>Produtos:</strong> ${pedido.produtos.map(item => {
                            const produto = this.produtos.find(p => p.id === item.produtoId);
                            return `${produto?.nome || 'Produto não encontrado'} (${item.quantidade})`;
                        }).join(', ')}</div>
                        ${pedido.observacoes ? `<div><strong>Observações:</strong> ${pedido.observacoes}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    filterPedidos(status) {
        if (!status) {
            this.renderPedidos();
            return;
        }

        const filtered = this.pedidos.filter(pedido => pedido.status === status);
        this.renderPedidos(filtered);
    }

    // ENTREGAS E HORÁRIOS
    updateHorariosDisponiveis() {
        const dataEntrega = document.getElementById('pedido-data-entrega').value;
        const select = document.getElementById('pedido-horario-entrega');
        
        if (!dataEntrega) {
            select.innerHTML = '<option value="">Selecione primeiro uma data</option>';
            return;
        }

        // Encontrar horários já ocupados nesta data
        const horariosOcupados = this.pedidos
            .filter(pedido => pedido.dataEntrega === dataEntrega && pedido.status !== 'entregue')
            .map(pedido => pedido.horarioEntrega);

        // Se estamos editando um pedido, não considerar seu próprio horário como ocupado
        if (this.currentEditId) {
            const pedidoAtual = this.pedidos.find(p => p.id === this.currentEditId);
            if (pedidoAtual && pedidoAtual.dataEntrega === dataEntrega) {
                const index = horariosOcupados.indexOf(pedidoAtual.horarioEntrega);
                if (index > -1) {
                    horariosOcupados.splice(index, 1);
                }
            }
        }

        const horariosDisponiveis = this.horariosDisponiveis.filter(horario => 
            !horariosOcupados.includes(horario)
        );

        if (horariosDisponiveis.length === 0) {
            select.innerHTML = '<option value="">Não há horários disponíveis nesta data</option>';
        } else {
            select.innerHTML = '<option value="">Selecione um horário</option>' +
                horariosDisponiveis.map(horario => 
                    `<option value="${horario}">${horario}</option>`
                ).join('');
        }
    }

    setupDateFilter() {
        const dateInput = document.getElementById('date-filter');
        dateInput.value = new Date().toISOString().split('T')[0];
        this.filterEntregasByDate(dateInput.value);
    }

    filterEntregasByDate(date) {
        this.renderEntregas(date);
    }

    renderEntregas(selectedDate = null) {
        const container = document.getElementById('entregas-list');
        const targetDate = selectedDate || new Date().toISOString().split('T')[0];
        
        // Agrupar entregas por horário
        const entregasPorHorario = {};
        
        this.pedidos
            .filter(pedido => pedido.dataEntrega === targetDate && pedido.status !== 'entregue')
            .forEach(pedido => {
                if (!entregasPorHorario[pedido.horarioEntrega]) {
                    entregasPorHorario[pedido.horarioEntrega] = [];
                }
                entregasPorHorario[pedido.horarioEntrega].push(pedido);
            });

        if (Object.keys(entregasPorHorario).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <img src="images/logo-png.png" alt="Logo" class="empty-state-logo">
                    <div class="empty-state-text">Nenhuma entrega agendada</div>
                    <div class="empty-state-subtext">para ${new Date(targetDate).toLocaleDateString('pt-BR')}</div>
                </div>
            `;
            return;
        }

        // Ordenar horários
        const horariosOrdenados = Object.keys(entregasPorHorario).sort();

        container.innerHTML = horariosOrdenados.map(horario => {
            const entregas = entregasPorHorario[horario];
            
            return `
                <div class="entrega-horario">
                    <h4>${horario}</h4>
                    <div class="entregas-list">
                        ${entregas.map(pedido => {
                            const cliente = this.clientes.find(c => c.id === pedido.clienteId);
                            return `
                                <div class="entrega-item">
                                    <strong>${cliente?.nome || 'Cliente não encontrado'}</strong><br>
                                    📍 ${cliente?.endereco || 'Endereço não disponível'}<br>
                                    📞 ${cliente?.telefone || 'Telefone não disponível'}<br>
                                    💰 Total: R$ ${pedido.valorTotal.toFixed(2)} | 
                                    ${pedido.saldo > 0 ? `Saldo: R$ ${pedido.saldo.toFixed(2)}` : 'Pago'}
                                    ${pedido.observacoes ? `<br>📝 ${pedido.observacoes}` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateEntregasHoje() {
        const hoje = new Date().toISOString().split('T')[0];
        const entregasHoje = this.pedidos.filter(pedido => 
            pedido.dataEntrega === hoje && pedido.status !== 'entregue'
        ).length;

        document.getElementById('total-entregas').textContent = entregasHoje;
        
        // Atualizar lista no dashboard
        const container = document.getElementById('entregas-hoje');
        const entregas = this.pedidos
            .filter(pedido => pedido.dataEntrega === hoje && pedido.status !== 'entregue')
            .sort((a, b) => a.horarioEntrega.localeCompare(b.horarioEntrega));

        if (entregas.length === 0) {
            container.innerHTML = '<div class="empty-state-text">Nenhuma entrega agendada para hoje</div>';
            return;
        }

        container.innerHTML = entregas.map(pedido => {
            const cliente = this.clientes.find(c => c.id === pedido.clienteId);
            return `
                <div class="entrega-item">
                    <strong>${pedido.horarioEntrega}</strong> - ${cliente?.nome || 'Cliente não encontrado'}
                    <br>📍 ${cliente?.endereco || 'Endereço não disponível'}
                </div>
            `;
        }).join('');
    }

    // DASHBOARD
    updateDashboard() {
        document.getElementById('total-produtos').textContent = this.produtos.length;
        document.getElementById('total-clientes').textContent = this.clientes.length;
        document.getElementById('total-pedidos').textContent = this.pedidos.length;
        
        const hoje = new Date().toISOString().split('T')[0];
        const entregasHoje = this.pedidos.filter(pedido => 
            pedido.dataEntrega === hoje && pedido.status !== 'entregue'
        ).length;
        document.getElementById('total-entregas').textContent = entregasHoje;
    }

    // CONFIGURAÇÕES
    getDefaultConfig() {
        return {
            empresa: {
                nome: "Leo's Cake",
                telefone: "",
                endereco: "",
                email: ""
            },
            emailjs: {
                serviceId: "",
                templateId: "",
                userId: ""
            },
            googleSheets: {
                apiKey: "",
                clientId: "",
                spreadsheetId: "",
                autoSync: false
            },
            sistemaSenha: "leoscake2024" // Senha padrão - DEVE ser alterada!
        };
    }

    initEmailJS() {
        if (window.emailjs && this.configuracoes.emailjs.userId) {
            emailjs.init(this.configuracoes.emailjs.userId);
        }
    }

    openConfigModal() {
        const modal = document.getElementById('config-modal');
        
        // Preencher formulário com dados atuais
        document.getElementById('empresa-nome').value = this.configuracoes.empresa.nome;
        document.getElementById('empresa-telefone').value = this.configuracoes.empresa.telefone;
        document.getElementById('empresa-endereco').value = this.configuracoes.empresa.endereco;
        document.getElementById('empresa-email').value = this.configuracoes.empresa.email;
        
        document.getElementById('emailjs-service').value = this.configuracoes.emailjs.serviceId;
        document.getElementById('emailjs-template').value = this.configuracoes.emailjs.templateId;
        document.getElementById('emailjs-user').value = this.configuracoes.emailjs.userId;
        
        document.getElementById('sheets-api-key').value = this.configuracoes.googleSheets.apiKey;
        document.getElementById('sheets-client-id').value = this.configuracoes.googleSheets.clientId;
        document.getElementById('sheets-spreadsheet-id').value = this.configuracoes.googleSheets.spreadsheetId;
        document.getElementById('sheets-auto-sync').checked = this.configuracoes.googleSheets.autoSync;
        
        document.getElementById('sistema-senha').value = this.configuracoes.sistemaSenha;
        
        modal.classList.add('active');
    }

    closeConfigModal() {
        document.getElementById('config-modal').classList.remove('active');
    }

    saveConfig() {
        this.configuracoes.empresa.nome = document.getElementById('empresa-nome').value;
        this.configuracoes.empresa.telefone = document.getElementById('empresa-telefone').value;
        this.configuracoes.empresa.endereco = document.getElementById('empresa-endereco').value;
        this.configuracoes.empresa.email = document.getElementById('empresa-email').value;
        
        this.configuracoes.emailjs.serviceId = document.getElementById('emailjs-service').value;
        this.configuracoes.emailjs.templateId = document.getElementById('emailjs-template').value;
        this.configuracoes.emailjs.userId = document.getElementById('emailjs-user').value;
        
        this.configuracoes.googleSheets.apiKey = document.getElementById('sheets-api-key').value;
        this.configuracoes.googleSheets.clientId = document.getElementById('sheets-client-id').value;
        this.configuracoes.googleSheets.spreadsheetId = document.getElementById('sheets-spreadsheet-id').value;
        this.configuracoes.googleSheets.autoSync = document.getElementById('sheets-auto-sync').checked;
        
        // Salvar nova senha se foi alterada
        const novaSenha = document.getElementById('sistema-senha').value;
        if (novaSenha && novaSenha !== this.configuracoes.sistemaSenha) {
            this.configuracoes.sistemaSenha = novaSenha;
            // Forçar novo login com nova senha
            localStorage.removeItem('leos_cake_auth');
            localStorage.removeItem('leos_cake_auth_expiry');
        }
        
        localStorage.setItem('configuracoes', JSON.stringify(this.configuracoes));
        this.initEmailJS();
        this.initGoogleSheets();
        this.closeConfigModal();
        this.showToast('Configurações salvas com sucesso!', 'success');
    }

    // RECIBOS
    gerarRecibo(pedidoId) {
        this.currentReciboId = pedidoId;
        const pedido = this.pedidos.find(p => p.id === pedidoId);
        const cliente = this.clientes.find(c => c.id === pedido.clienteId);
        
        if (!pedido || !cliente) {
            this.showToast('Pedido ou cliente não encontrado', 'error');
            return;
        }

        const modal = document.getElementById('recibo-modal');
        const preview = document.getElementById('recibo-preview');
        
        preview.innerHTML = this.generateReciboHTML(pedido, cliente);
        modal.classList.add('active');
    }

    generateReciboHTML(pedido, cliente) {
        const dataEmissao = new Date().toLocaleDateString('pt-BR');
        const dataEntrega = new Date(pedido.dataEntrega).toLocaleDateString('pt-BR');
        
        let produtosHTML = '';
        let valorTotal = 0;
        
        pedido.produtos.forEach(item => {
            const produto = this.produtos.find(p => p.id === item.produtoId);
            if (produto) {
                const subtotal = produto.preco * item.quantidade;
                valorTotal += subtotal;
                produtosHTML += `
                    <div class="recibo-item">
                        <span>${item.quantidade}x ${produto.nome}</span>
                        <span>R$ ${subtotal.toFixed(2)}</span>
                    </div>
                `;
            }
        });

        return `
            <div class="recibo-header">
                <img src="images/logo-png.png" alt="Logo" class="recibo-logo">
                <div class="recibo-empresa">${this.configuracoes.empresa.nome}</div>
                ${this.configuracoes.empresa.telefone ? `<div>${this.configuracoes.empresa.telefone}</div>` : ''}
                ${this.configuracoes.empresa.endereco ? `<div>${this.configuracoes.empresa.endereco}</div>` : ''}
                ${this.configuracoes.empresa.email ? `<div>${this.configuracoes.empresa.email}</div>` : ''}
            </div>
            
            <div class="recibo-section">
                <h4>RECIBO DE PEDIDO #${pedido.id}</h4>
                <div class="recibo-item">
                    <span>Data de Emissão:</span>
                    <span>${dataEmissao}</span>
                </div>
            </div>
            
            <div class="recibo-section">
                <h4>DADOS DO CLIENTE</h4>
                <div class="recibo-item">
                    <span>Nome:</span>
                    <span>${cliente.nome}</span>
                </div>
                <div class="recibo-item">
                    <span>Telefone:</span>
                    <span>${cliente.telefone}</span>
                </div>
                <div class="recibo-item">
                    <span>Endereço:</span>
                    <span>${cliente.endereco}</span>
                </div>
                ${cliente.email ? `
                <div class="recibo-item">
                    <span>Email:</span>
                    <span>${cliente.email}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="recibo-section">
                <h4>PRODUTOS</h4>
                ${produtosHTML}
            </div>
            
            <div class="recibo-section">
                <h4>ENTREGA</h4>
                <div class="recibo-item">
                    <span>Data:</span>
                    <span>${dataEntrega}</span>
                </div>
                <div class="recibo-item">
                    <span>Horário:</span>
                    <span>${pedido.horarioEntrega}</span>
                </div>
                ${pedido.observacoes ? `
                <div class="recibo-item">
                    <span>Observações:</span>
                    <span>${pedido.observacoes}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="recibo-total">
                <div class="recibo-item">
                    <span>VALOR TOTAL:</span>
                    <span>R$ ${pedido.valorTotal.toFixed(2)}</span>
                </div>
                <div class="recibo-item">
                    <span>VALOR PAGO:</span>
                    <span>R$ ${pedido.valorPago.toFixed(2)}</span>
                </div>
                ${pedido.saldo > 0 ? `
                <div class="recibo-item">
                    <span>SALDO RESTANTE:</span>
                    <span>R$ ${pedido.saldo.toFixed(2)}</span>
                </div>
                ` : ''}
            </div>
        `;
    }

    closeReciboModal() {
        document.getElementById('recibo-modal').classList.remove('active');
        this.currentReciboId = null;
    }

    baixarReciboPDF() {
        if (!window.jsPDF) {
            this.showToast('Biblioteca PDF não carregada', 'error');
            return;
        }

        try {
            const pedido = this.pedidos.find(p => p.id === this.currentReciboId);
            const cliente = this.clientes.find(c => c.id === pedido.clienteId);
            
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            // Configurações
            doc.setFont("helvetica");
            let yPosition = 20;
            
            // Cabeçalho
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(this.configuracoes.empresa.nome, 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            if (this.configuracoes.empresa.telefone) {
                doc.text(this.configuracoes.empresa.telefone, 20, yPosition);
                yPosition += 5;
            }
            if (this.configuracoes.empresa.endereco) {
                doc.text(this.configuracoes.empresa.endereco, 20, yPosition);
                yPosition += 5;
            }
            if (this.configuracoes.empresa.email) {
                doc.text(this.configuracoes.empresa.email, 20, yPosition);
                yPosition += 5;
            }
            
            yPosition += 10;
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 10;
            
            // Título
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(`RECIBO DE PEDIDO #${pedido.id}`, 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
            yPosition += 15;
            
            // Cliente
            doc.setFont("helvetica", "bold");
            doc.text("DADOS DO CLIENTE", 20, yPosition);
            yPosition += 8;
            
            doc.setFont("helvetica", "normal");
            doc.text(`Nome: ${cliente.nome}`, 20, yPosition);
            yPosition += 5;
            doc.text(`Telefone: ${cliente.telefone}`, 20, yPosition);
            yPosition += 5;
            doc.text(`Endereço: ${cliente.endereco}`, 20, yPosition);
            yPosition += 5;
            if (cliente.email) {
                doc.text(`Email: ${cliente.email}`, 20, yPosition);
                yPosition += 5;
            }
            yPosition += 10;
            
            // Produtos
            doc.setFont("helvetica", "bold");
            doc.text("PRODUTOS", 20, yPosition);
            yPosition += 8;
            
            doc.setFont("helvetica", "normal");
            pedido.produtos.forEach(item => {
                const produto = this.produtos.find(p => p.id === item.produtoId);
                if (produto) {
                    const subtotal = produto.preco * item.quantidade;
                    doc.text(`${item.quantidade}x ${produto.nome}`, 20, yPosition);
                    doc.text(`R$ ${subtotal.toFixed(2)}`, 150, yPosition);
                    yPosition += 5;
                }
            });
            yPosition += 10;
            
            // Entrega
            doc.setFont("helvetica", "bold");
            doc.text("ENTREGA", 20, yPosition);
            yPosition += 8;
            
            doc.setFont("helvetica", "normal");
            doc.text(`Data: ${new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}`, 20, yPosition);
            yPosition += 5;
            doc.text(`Horário: ${pedido.horarioEntrega}`, 20, yPosition);
            yPosition += 5;
            if (pedido.observacoes) {
                doc.text(`Observações: ${pedido.observacoes}`, 20, yPosition);
                yPosition += 5;
            }
            yPosition += 10;
            
            // Total
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 8;
            
            doc.setFont("helvetica", "bold");
            doc.text(`VALOR TOTAL: R$ ${pedido.valorTotal.toFixed(2)}`, 20, yPosition);
            yPosition += 5;
            doc.text(`VALOR PAGO: R$ ${pedido.valorPago.toFixed(2)}`, 20, yPosition);
            yPosition += 5;
            if (pedido.saldo > 0) {
                doc.text(`SALDO RESTANTE: R$ ${pedido.saldo.toFixed(2)}`, 20, yPosition);
            }
            
            // Salvar
            doc.save(`recibo-pedido-${pedido.id}.pdf`);
            this.showToast('PDF gerado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showToast('Erro ao gerar PDF', 'error');
        }
    }

    enviarReciboEmail() {
        if (!window.emailjs) {
            this.showToast('Serviço de email não carregado', 'error');
            return;
        }

        if (!this.configuracoes.emailjs.serviceId || !this.configuracoes.emailjs.templateId) {
            this.showToast('Configure o EmailJS nas configurações', 'error');
            return;
        }

        const pedido = this.pedidos.find(p => p.id === this.currentReciboId);
        const cliente = this.clientes.find(c => c.id === pedido.clienteId);
        
        if (!cliente.email) {
            this.showToast('Cliente não possui email cadastrado', 'error');
            return;
        }

        const templateParams = {
            to_email: cliente.email,
            to_name: cliente.nome,
            from_name: this.configuracoes.empresa.nome,
            pedido_id: pedido.id,
            data_entrega: new Date(pedido.dataEntrega).toLocaleDateString('pt-BR'),
            horario_entrega: pedido.horarioEntrega,
            valor_total: pedido.valorTotal.toFixed(2),
            valor_pago: pedido.valorPago.toFixed(2),
            saldo: pedido.saldo.toFixed(2),
            recibo_html: this.generateReciboHTML(pedido, cliente)
        };

        this.showToast('Enviando email...', 'success');

        emailjs.send(
            this.configuracoes.emailjs.serviceId,
            this.configuracoes.emailjs.templateId,
            templateParams
        ).then(() => {
            this.showToast('Email enviado com sucesso!', 'success');
        }).catch((error) => {
            console.error('Erro ao enviar email:', error);
            this.showToast('Erro ao enviar email', 'error');
        });
    }

    // GOOGLE SHEETS INTEGRATION
    initGoogleSheets() {
        // Verificar se Google Sheets está configurado
        if (!this.configuracoes.googleSheets.apiKey || !this.configuracoes.googleSheets.clientId || !this.configuracoes.googleSheets.spreadsheetId) {
            console.log('⚠️ Google Sheets não configurado');
            this.updateSyncStatus('local', 'Local');
            return;
        }

        // Verificar se Google API está carregada
        if (!window.gapi) {
            console.error('❌ Google API não carregada - recarregue a página');
            this.updateSyncStatus('error', 'API não carregada');
            return;
        }

        console.log('🔄 Inicializando Google Sheets...');
        this.updateSyncStatus('loading', 'Conectando...');

        window.gapi.load('client:auth2', () => {
            console.log('📡 Carregando cliente Google API...');
            
            window.gapi.client.init({
                apiKey: this.configuracoes.googleSheets.apiKey,
                clientId: this.configuracoes.googleSheets.clientId,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: 'https://www.googleapis.com/auth/spreadsheets'
            }).then(() => {
                console.log('✅ Google Sheets conectado com sucesso');
                this.sheetsAPI = window.gapi.client.sheets;
                this.updateSyncStatus('online', 'Online');
                
                if (this.configuracoes.googleSheets.autoSync) {
                    this.syncWithSheets();
                }
            }).catch(error => {
                console.error('❌ Erro detalhado na inicialização:', error);
                
                let errorMsg = 'Erro';
                if (error.details?.includes('API_KEY_INVALID')) {
                    errorMsg = 'API Key inválida';
                } else if (error.details?.includes('CLIENT_ID')) {
                    errorMsg = 'Client ID inválido';
                } else if (error.status === 403) {
                    errorMsg = 'Sem permissão';
                } else if (error.status === 400) {
                    errorMsg = 'Config. inválida';
                }
                
                this.updateSyncStatus('error', errorMsg);
            });
        });
    }

    setupOnlineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            if (this.configuracoes.googleSheets.autoSync && this.sheetsAPI) {
                this.syncWithSheets();
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateSyncStatus('offline', 'Offline');
        });
    }

    updateSyncStatus(status, text) {
        const indicator = document.getElementById('sync-indicator');
        const statusEl = document.getElementById('sync-status');
        const textEl = document.getElementById('sync-text');
        
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

    testSheetsConnection() {
        const statusEl = document.getElementById('sheets-status');
        statusEl.textContent = 'Testando...';
        statusEl.className = 'sheets-status loading';

        // Temporariamente salvar configurações para teste
        const tempConfig = {
            apiKey: document.getElementById('sheets-api-key').value.trim(),
            clientId: document.getElementById('sheets-client-id').value.trim(),
            spreadsheetId: document.getElementById('sheets-spreadsheet-id').value.trim()
        };

        // Validações básicas
        if (!tempConfig.apiKey) {
            statusEl.textContent = '❌ API Key não preenchida';
            statusEl.className = 'sheets-status error';
            return;
        }
        
        if (!tempConfig.apiKey.startsWith('AIza')) {
            statusEl.textContent = '❌ API Key deve começar com "AIza"';
            statusEl.className = 'sheets-status error';
            return;
        }

        if (!tempConfig.clientId) {
            statusEl.textContent = '❌ Client ID não preenchido';
            statusEl.className = 'sheets-status error';
            return;
        }

        if (!tempConfig.clientId.includes('googleusercontent.com')) {
            statusEl.textContent = '❌ Client ID deve terminar com "googleusercontent.com"';
            statusEl.className = 'sheets-status error';
            return;
        }

        if (!tempConfig.spreadsheetId) {
            statusEl.textContent = '❌ Spreadsheet ID não preenchido';
            statusEl.className = 'sheets-status error';
            return;
        }

        if (tempConfig.spreadsheetId.length < 40) {
            statusEl.textContent = '❌ Spreadsheet ID muito curto (deve ter ~44 caracteres)';
            statusEl.className = 'sheets-status error';
            return;
        }

        // Verificar se gapi está disponível
        if (!window.gapi) {
            statusEl.textContent = '❌ Google API não carregada - recarregue a página';
            statusEl.className = 'sheets-status error';
            return;
        }

        console.log('🔍 Testando conexão com:', {
            apiKey: tempConfig.apiKey.substring(0, 10) + '...',
            clientId: tempConfig.clientId.substring(0, 20) + '...',
            spreadsheetId: tempConfig.spreadsheetId
        });

        // Inicializar API com configurações temporárias
        window.gapi.load('client:auth2', () => {
            console.log('📡 Inicializando Google API Client...');
            
            window.gapi.client.init({
                apiKey: tempConfig.apiKey,
                clientId: tempConfig.clientId,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: 'https://www.googleapis.com/auth/spreadsheets'
            }).then(() => {
                console.log('✅ Google API Client inicializado');
                statusEl.textContent = 'Testando acesso à planilha...';
                
                // Testar acesso à planilha
                return window.gapi.client.sheets.spreadsheets.get({
                    spreadsheetId: tempConfig.spreadsheetId
                });
            }).then(response => {
                console.log('✅ Planilha acessada:', response.result);
                statusEl.textContent = `✅ Conectado: ${response.result.properties.title}`;
                statusEl.className = 'sheets-status success';
            }).catch(error => {
                console.error('❌ Erro detalhado:', error);
                
                let errorMsg = '❌ Erro: ';
                
                // Tratar erros específicos de cookies/origem
                if (error.message?.includes('cookies') || error.message?.includes('cookiePolicy')) {
                    errorMsg += 'Problema de cookies - use HTTPS ou localhost';
                } else if (error.message?.includes('origin')) {
                    errorMsg += 'URL não autorizada no Google Cloud';
                } else if (error.status === 403) {
                    if (error.result?.error?.message?.includes('API key')) {
                        errorMsg += 'API Key inválida ou sem permissões';
                    } else if (error.result?.error?.message?.includes('permission')) {
                        errorMsg += 'Planilha sem permissão de acesso';
                    } else {
                        errorMsg += 'Sem permissão (verifique APIs ativadas)';
                    }
                } else if (error.status === 404) {
                    errorMsg += 'Planilha não encontrada (verifique ID)';
                } else if (error.status === 400) {
                    errorMsg += 'Configuração inválida (verifique credenciais)';
                } else if (error.result?.error?.message) {
                    errorMsg += error.result.error.message;
                } else {
                    errorMsg += 'Conexão falhou (veja console F12)';
                }
                
                statusEl.textContent = errorMsg;
                statusEl.className = 'sheets-status error';
            });
        });
    }

    async syncWithSheets() {
        if (!this.sheetsAPI || !this.isOnline || !this.configuracoes.googleSheets.spreadsheetId) {
            return;
        }

        this.updateSyncStatus('syncing', 'Sincronizando...');

        try {
            // Sincronizar cada tipo de dados
            await this.syncProdutosToSheets();
            await this.syncClientesToSheets();
            await this.syncPedidosToSheets();
            
            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('lastSyncTime', this.lastSyncTime);
            
            this.updateSyncStatus('success', 'Sincronizado');
            
            setTimeout(() => {
                this.updateSyncStatus('online', 'Online');
            }, 2000);
            
        } catch (error) {
            console.error('Erro na sincronização:', error);
            this.updateSyncStatus('error', 'Erro Sync');
            
            setTimeout(() => {
                this.updateSyncStatus('online', 'Online');
            }, 3000);
        }
    }

    async syncProdutosToSheets() {
        const values = [['id', 'nome', 'descricao', 'preco', 'estoque', 'imagem', 'created']];
        
        this.produtos.forEach(produto => {
            values.push([
                produto.id,
                produto.nome,
                produto.descricao,
                produto.preco,
                produto.estoque,
                produto.imagem || '',
                produto.created
            ]);
        });

        await this.sheetsAPI.spreadsheets.values.update({
            spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
            range: 'Produtos!A:G',
            valueInputOption: 'RAW',
            resource: { values }
        });
    }

    async syncClientesToSheets() {
        const values = [['id', 'nome', 'telefone', 'endereco', 'email', 'created']];
        
        this.clientes.forEach(cliente => {
            values.push([
                cliente.id,
                cliente.nome,
                cliente.telefone,
                cliente.endereco,
                cliente.email || '',
                cliente.created
            ]);
        });

        await this.sheetsAPI.spreadsheets.values.update({
            spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
            range: 'Clientes!A:F',
            valueInputOption: 'RAW',
            resource: { values }
        });
    }

    async syncPedidosToSheets() {
        const values = [['id', 'clienteId', 'produtos', 'valorTotal', 'valorPago', 'saldo', 'dataEntrega', 'horarioEntrega', 'observacoes', 'status', 'created']];
        
        this.pedidos.forEach(pedido => {
            values.push([
                pedido.id,
                pedido.clienteId,
                JSON.stringify(pedido.produtos),
                pedido.valorTotal,
                pedido.valorPago,
                pedido.saldo,
                pedido.dataEntrega,
                pedido.horarioEntrega,
                pedido.observacoes || '',
                pedido.status,
                pedido.created
            ]);
        });

        await this.sheetsAPI.spreadsheets.values.update({
            spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
            range: 'Pedidos!A:K',
            valueInputOption: 'RAW',
            resource: { values }
        });
    }

    async loadFromSheets() {
        if (!this.sheetsAPI || !this.isOnline || !this.configuracoes.googleSheets.spreadsheetId) {
            return false;
        }

        try {
            this.updateSyncStatus('syncing', 'Carregando...');

            // Carregar produtos
            const produtosResponse = await this.sheetsAPI.spreadsheets.values.get({
                spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
                range: 'Produtos!A2:G'
            });

            if (produtosResponse.result.values) {
                this.produtos = produtosResponse.result.values.map(row => ({
                    id: parseInt(row[0]) || 0,
                    nome: row[1] || '',
                    descricao: row[2] || '',
                    preco: parseFloat(row[3]) || 0,
                    estoque: parseInt(row[4]) || 0,
                    imagem: row[5] || null,
                    created: row[6] || new Date().toISOString()
                }));
            }

            // Carregar clientes
            const clientesResponse = await this.sheetsAPI.spreadsheets.values.get({
                spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
                range: 'Clientes!A2:F'
            });

            if (clientesResponse.result.values) {
                this.clientes = clientesResponse.result.values.map(row => ({
                    id: parseInt(row[0]) || 0,
                    nome: row[1] || '',
                    telefone: row[2] || '',
                    endereco: row[3] || '',
                    email: row[4] || '',
                    created: row[5] || new Date().toISOString()
                }));
            }

            // Carregar pedidos
            const pedidosResponse = await this.sheetsAPI.spreadsheets.values.get({
                spreadsheetId: this.configuracoes.googleSheets.spreadsheetId,
                range: 'Pedidos!A2:K'
            });

            if (pedidosResponse.result.values) {
                this.pedidos = pedidosResponse.result.values.map(row => ({
                    id: parseInt(row[0]) || 0,
                    clienteId: parseInt(row[1]) || 0,
                    produtos: JSON.parse(row[2] || '[]'),
                    valorTotal: parseFloat(row[3]) || 0,
                    valorPago: parseFloat(row[4]) || 0,
                    saldo: parseFloat(row[5]) || 0,
                    dataEntrega: row[6] || '',
                    horarioEntrega: row[7] || '',
                    observacoes: row[8] || '',
                    status: row[9] || 'pendente',
                    created: row[10] || new Date().toISOString()
                }));
            }

            // Salvar no localStorage também
            this.saveToStorage('produtos');
            this.saveToStorage('clientes');
            this.saveToStorage('pedidos');

            // Atualizar interface
            this.renderProdutos();
            this.renderClientes();
            this.renderPedidos();
            this.updateDashboard();

            this.updateSyncStatus('success', 'Carregado');
            return true;

        } catch (error) {
            console.error('Erro ao carregar do Sheets:', error);
            this.updateSyncStatus('error', 'Erro Load');
            return false;
        }
    }

    // Override do método saveToStorage para incluir sincronização
    saveToStorage(key) {
        localStorage.setItem(key, JSON.stringify(this[key]));
        
        // Auto sincronizar se configurado
        if (this.configuracoes.googleSheets.autoSync && this.sheetsAPI && this.isOnline) {
            setTimeout(() => {
                this.syncWithSheets();
            }, 1000); // Aguardar 1 segundo para evitar múltiplas sincronizações
        }
    }

    // Override do método syncData para incluir Google Sheets
    syncData() {
        if (this.sheetsAPI && this.isOnline && this.configuracoes.googleSheets.spreadsheetId) {
            this.syncWithSheets();
        } else {
            this.showToast('Dados sincronizados localmente!', 'success');
        }
    }

    // UTILITIES
    previewImage(input) {
        const preview = document.getElementById('preview-imagem');
        
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            
            reader.readAsDataURL(input.files[0]);
        } else {
            preview.innerHTML = '';
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveToStorage(key) {
        localStorage.setItem(key, JSON.stringify(this[key]));
    }

    syncData() {
        // Simular sincronização
        this.showToast('Dados sincronizados com sucesso!', 'success');
        
        // Aqui você poderia implementar sincronização com servidor
        // Por exemplo, enviar dados para uma API
    }

    // Método para exportar dados (útil para backup)
    exportData() {
        const data = {
            produtos: this.produtos,
            clientes: this.clientes,
            pedidos: this.pedidos,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `leos-cake-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Método para importar dados
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.produtos) this.produtos = data.produtos;
                if (data.clientes) this.clientes = data.clientes;
                if (data.pedidos) this.pedidos = data.pedidos;
                
                this.saveToStorage('produtos');
                this.saveToStorage('clientes');
                this.saveToStorage('pedidos');
                
                this.init();
                this.showToast('Dados importados com sucesso!', 'success');
            } catch (error) {
                this.showToast('Erro ao importar dados', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Inicializar aplicação
const app = new PreVendasApp();

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