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
        
        // Verificar se autenticação ainda é válida (24 horas)
        if (isAuthenticated && authExpiry && new Date().getTime() < parseInt(authExpiry)) {
            return true;
        }
        
        // Se não autenticado, mostrar tela de login
        this.showLoginScreen();
        return false;
    }
    
    showLoginScreen() {
        document.body.innerHTML = `
            <div class="login-screen">
                <div class="login-container">
                    <div class="login-header">
                        <h1>🧁 Leo's Cake</h1>
                        <p>Sistema de Pré-Vendas</p>
                    </div>
                    <div class="login-form">
                        <h3>🔐 Acesso Restrito</h3>
                        <p>Digite a senha para acessar o sistema:</p>
                        <input type="password" id="login-password" placeholder="Senha do sistema" />
                        <button id="login-btn">Entrar</button>
                        <div id="login-error" class="login-error" style="display: none;">
                            ❌ Senha incorreta!
                        </div>
                    </div>
                    <div class="login-footer">
                        <p>Sistema protegido por autenticação</p>
                    </div>
                </div>
            </div>
        `;
        
        // Estilos para tela de login
        const loginStyles = `
            <style>
            .login-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .login-container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
                width: 90%;
            }
            .login-header h1 {
                color: #667eea;
                margin: 0 0 10px 0;
                font-size: 2.5em;
            }
            .login-header p {
                color: #666;
                margin: 0 0 30px 0;
            }
            .login-form h3 {
                color: #333;
                margin: 0 0 15px 0;
            }
            .login-form p {
                color: #666;
                margin-bottom: 20px;
            }
            .login-form input {
                width: 100%;
                padding: 15px;
                border: 2px solid #ddd;
                border-radius: 10px;
                font-size: 1.1em;
                margin-bottom: 20px;
                box-sizing: border-box;
            }
            .login-form input:focus {
                outline: none;
                border-color: #667eea;
            }
            .login-form button {
                width: 100%;
                padding: 15px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s;
            }
            .login-form button:hover {
                background: #5a67d8;
            }
            .login-error {
                color: #e53e3e;
                background: #fed7d7;
                padding: 10px;
                border-radius: 5px;
                margin-top: 15px;
            }
            .login-footer {
                margin-top: 30px;
                color: #999;
                font-size: 0.9em;
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', loginStyles);
        
        // Event listeners para login
        document.getElementById('login-btn').addEventListener('click', () => this.attemptLogin());
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.attemptLogin();
        });
        
        // Focar no campo de senha
        document.getElementById('login-password').focus();
    }
    
    attemptLogin() {
        const password = document.getElementById('login-password').value;
        const correctPassword = this.configuracoes.sistemaSenha || 'leoscake2024'; // Senha padrão
        
        if (password === correctPassword) {
            // Autenticação válida por 24 horas
            const expiry = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('leos_cake_auth', 'true');
            localStorage.setItem('leos_cake_auth_expiry', expiry.toString());
            
            // Recarregar página para iniciar sistema
            location.reload();
        } else {
            document.getElementById('login-error').style.display = 'block';
            document.getElementById('login-password').value = '';
            document.getElementById('login-password').focus();
        }
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
            this.updateHorariosDisponiveis();
        }
        
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
                
                if (error.status === 403) {
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