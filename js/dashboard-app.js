/**
 * Dashboard App - Leo's Cake Sistema
 * Gerencia toda a interface e funcionalidades do dashboard
 */

class DashboardApp {
    constructor() {
        this.auth = null;
        this.dataManager = null;
        this.i18n = null;
        this.receiptSystem = null;
        
        this.currentSection = 'dashboard';
        this.currentData = {
            clientes: [],
            produtos: [],
            pedidos: [],
            estoque: [],
            entregas: []
        };
        
        this.isLoading = false;
        
        console.log('📊 Dashboard App iniciado');
    }

    // Inicializar app
    async init() {
        try {
            // Aguardar sistemas estarem prontos
            await this.waitForSystems();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Carregar dados iniciais
            await this.loadInitialData();
            
            // Configurar interface
            this.setupUI();
            
            console.log('✅ Dashboard App inicializado');
            
        } catch (error) {
            console.error('❌ Erro na inicialização do Dashboard:', error);
            this.showError('Erro ao inicializar dashboard');
        }
    }

    // Aguardar sistemas estarem prontos
    async waitForSystems() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (window.systemInitializer) {
                this.auth = window.systemInitializer.getAuth();
                this.dataManager = window.systemInitializer.getDataManager();
                this.i18n = window.i18n;
                this.receiptSystem = window.receiptSystem;
                
                if (this.auth && this.dataManager) {
                    return;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Sistemas não inicializaram a tempo');
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegação da sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Menu do usuário
        const userMenuButton = document.getElementById('user-menu-button');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', () => {
                userDropdown.classList.toggle('active');
            });
            
            document.addEventListener('click', (e) => {
                if (!userMenuButton.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });
        }

        // Botões de novo item
        this.setupNewItemButtons();
        
        // Modals
        this.setupModals();
        
        // Filtros e busca
        this.setupFilters();
    }

    // Configurar botões de novo item
    setupNewItemButtons() {
        const buttons = {
            'novo-pedido-btn': () => this.showOrderModal(),
            'novo-pedido-btn2': () => this.showOrderModal(),
            'novo-cliente-btn': () => this.showClientModal(),
            'novo-produto-btn': () => this.showProductModal(),
            'novo-estoque-btn': () => this.showStockModal(),
            'nova-entrega-btn': () => this.showDeliveryModal()
        };

        Object.entries(buttons).forEach(([id, handler]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
            }
        });
    }

    // Configurar modals
    setupModals() {
        const overlay = document.getElementById('modal-overlay');
        const closeButtons = document.querySelectorAll('[data-modal-close]');
        
        // Fechar modal com overlay
        overlay?.addEventListener('click', () => this.closeModal());
        
        // Fechar modal com botão
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Form de cliente
        const formCliente = document.getElementById('form-cliente');
        if (formCliente) {
            formCliente.addEventListener('submit', (e) => this.handleClientSubmit(e));
        }
    }

    // Configurar filtros
    setupFilters() {
        // Busca em tempo real
        const searchInputs = document.querySelectorAll('.search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        });

        // Filtros de seleção
        const filterSelects = document.querySelectorAll('.filter-select, .filter-date');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => this.applyFilters());
        });
    }

    // Navegar para seção
    navigateToSection(section) {
        // Atualizar nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

        // Mostrar seção
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`)?.classList.add('active');

        this.currentSection = section;
        this.loadSectionData(section);
    }

    // Carregar dados da seção
    async loadSectionData(section) {
        this.showLoading(true);
        
        try {
            switch (section) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'clientes':
                    await this.loadClientes();
                    break;
                case 'produtos':
                    await this.loadProdutos();
                    break;
                case 'pedidos':
                    await this.loadPedidos();
                    break;
                case 'estoque':
                    await this.loadEstoque();
                    break;
                case 'entregas':
                    await this.loadEntregas();
                    break;
            }
        } catch (error) {
            console.error(`Erro ao carregar ${section}:`, error);
            this.showError(`Erro ao carregar dados de ${section}`);
        } finally {
            this.showLoading(false);
        }
    }

    // Carregar dados iniciais
    async loadInitialData() {
        await this.loadDashboardData();
    }

    // Carregar dados do dashboard
    async loadDashboardData() {
        try {
            const stats = await this.dataManager.getDashboardStats();
            
            // Atualizar cards de estatísticas
            document.getElementById('total-produtos').textContent = stats.totalProdutos || 0;
            document.getElementById('total-clientes').textContent = stats.totalClientes || 0;
            document.getElementById('pedidos-pendentes').textContent = stats.pedidosPendentes || 0;
            document.getElementById('receita-mes').textContent = 
                new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                }).format(stats.receitaMes || 0);

            // Carregar pedidos recentes
            await this.loadRecentOrders();
            
            // Carregar entregas de hoje
            await this.loadTodayDeliveries();
            
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    // Carregar pedidos recentes
    async loadRecentOrders() {
        try {
            const pedidos = await this.dataManager.getPedidos();
            const recentOrders = pedidos.slice(0, 5);
            
            const container = document.getElementById('recent-orders-container');
            if (!container || recentOrders.length === 0) {
                container.innerHTML = '<p class="no-data">Nenhum pedido recente</p>';
                return;
            }

            const tableHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentOrders.map(pedido => `
                            <tr>
                                <td>#${pedido.numero_pedido}</td>
                                <td>${pedido.clientes?.nome || 'N/A'}</td>
                                <td>${this.formatCurrency(pedido.valor_total)}</td>
                                <td><span class="status status-${pedido.status}">${this.getStatusText(pedido.status)}</span></td>
                                <td>${this.formatDate(pedido.data_pedido)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            container.innerHTML = tableHTML;
            
        } catch (error) {
            console.error('Erro ao carregar pedidos recentes:', error);
        }
    }

    // Carregar entregas de hoje
    async loadTodayDeliveries() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const entregas = await this.dataManager.getEntregas(today, today);
            
            const container = document.getElementById('today-deliveries-container');
            if (!container || entregas.length === 0) {
                container.innerHTML = '<p class="no-data">Nenhuma entrega para hoje</p>';
                return;
            }

            const listHTML = `
                <div class="delivery-list">
                    ${entregas.map(entrega => `
                        <div class="delivery-item">
                            <div class="delivery-time">${entrega.hora_entrega}</div>
                            <div class="delivery-info">
                                <strong>${entrega.pedidos?.clientes?.nome || 'N/A'}</strong>
                                <p>${entrega.endereco_entrega}</p>
                                <small>Pedido #${entrega.pedidos?.numero_pedido}</small>
                            </div>
                            <div class="delivery-status">
                                <span class="status status-${entrega.status}">${this.getDeliveryStatusText(entrega.status)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.innerHTML = listHTML;
            
        } catch (error) {
            console.error('Erro ao carregar entregas de hoje:', error);
        }
    }

    // Carregar clientes
    async loadClientes() {
        try {
            this.currentData.clientes = await this.dataManager.getClientes();
            this.renderClientes();
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            this.showError('Erro ao carregar clientes');
        }
    }

    // Renderizar clientes
    renderClientes(filteredData = null) {
        const clientes = filteredData || this.currentData.clientes;
        const container = document.getElementById('clientes-container');
        
        if (!container) return;

        if (clientes.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum cliente encontrado</p>';
            return;
        }

        const cardsHTML = clientes.map(cliente => `
            <div class="data-card" data-id="${cliente.id}">
                <div class="card-header">
                    <h3>${cliente.nome}</h3>
                    <div class="card-actions">
                        <button class="btn btn-sm btn-secondary" onclick="dashboardApp.editClient(${cliente.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="dashboardApp.deleteClient(${cliente.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <p><i class="fas fa-phone"></i> ${cliente.telefone}</p>
                    ${cliente.email ? `<p><i class="fas fa-envelope"></i> ${cliente.email}</p>` : ''}
                    <p><i class="fas fa-language"></i> ${cliente.idioma === 'pt' ? 'Português' : 'English'}</p>
                    ${cliente.endereco ? `<p><i class="fas fa-map-marker-alt"></i> ${cliente.endereco}</p>` : ''}
                </div>
                <div class="card-footer">
                    <small>Cadastrado em ${this.formatDate(cliente.created_at)}</small>
                </div>
            </div>
        `).join('');

        container.innerHTML = `<div class="cards-grid">${cardsHTML}</div>`;
    }

    // Mostrar modal de cliente
    showClientModal(clienteId = null) {
        const modal = document.getElementById('modal-cliente');
        const title = document.getElementById('modal-cliente-title');
        const form = document.getElementById('form-cliente');
        
        if (!modal || !form) return;

        // Limpar formulário
        form.reset();
        
        if (clienteId) {
            title.textContent = 'Editar Cliente';
            // Carregar dados do cliente para edição
            const cliente = this.currentData.clientes.find(c => c.id === clienteId);
            if (cliente) {
                this.populateClientForm(cliente);
            }
        } else {
            title.textContent = 'Novo Cliente';
        }

        this.showModal('modal-cliente');
    }

    // Popular formulário de cliente
    populateClientForm(cliente) {
        document.getElementById('cliente-nome').value = cliente.nome || '';
        document.getElementById('cliente-telefone').value = cliente.telefone || '';
        document.getElementById('cliente-email').value = cliente.email || '';
        document.getElementById('cliente-endereco').value = cliente.endereco || '';
        document.getElementById('cliente-idioma').value = cliente.idioma || 'pt';
        document.getElementById('cliente-data-nascimento').value = cliente.data_nascimento || '';
        document.getElementById('cliente-observacoes').value = cliente.observacoes || '';
    }

    // Lidar com submit do cliente
    async handleClientSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const clienteData = {
            nome: document.getElementById('cliente-nome').value,
            telefone: document.getElementById('cliente-telefone').value,
            email: document.getElementById('cliente-email').value || null,
            endereco: document.getElementById('cliente-endereco').value || null,
            idioma: document.getElementById('cliente-idioma').value,
            data_nascimento: document.getElementById('cliente-data-nascimento').value || null,
            observacoes: document.getElementById('cliente-observacoes').value || null
        };

        try {
            this.showLoading(true);
            
            const result = await this.dataManager.saveCliente(clienteData);
            
            if (result.success) {
                this.showSuccess('Cliente salvo com sucesso!');
                this.closeModal();
                await this.loadClientes();
            } else {
                this.showError('Erro ao salvar cliente');
            }
            
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            this.showError('Erro ao salvar cliente');
        } finally {
            this.showLoading(false);
        }
    }

    // Editar cliente
    editClient(clienteId) {
        this.showClientModal(clienteId);
    }

    // Deletar cliente
    async deleteClient(clienteId) {
        if (!confirm('Tem certeza que deseja deletar este cliente?')) return;

        try {
            this.showLoading(true);
            
            const result = await this.dataManager.deleteCliente(clienteId);
            
            if (result.success) {
                this.showSuccess('Cliente deletado com sucesso!');
                await this.loadClientes();
            } else {
                this.showError('Erro ao deletar cliente');
            }
            
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            this.showError('Erro ao deletar cliente');
        } finally {
            this.showLoading(false);
        }
    }

    // Carregar produtos
    async loadProdutos() {
        try {
            this.currentData.produtos = await this.dataManager.getProdutos();
            this.renderProdutos();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.showError('Erro ao carregar produtos');
        }
    }

    // Renderizar produtos com carrossel
    renderProdutos(filteredData = null) {
        const produtos = filteredData || this.currentData.produtos;
        const container = document.getElementById('produtos-container');
        
        if (!container) return;

        if (produtos.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum produto encontrado</p>';
            return;
        }

        const cardsHTML = produtos.map(produto => `
            <div class="data-card produto-card" data-id="${produto.id}">
                <div class="card-carousel-container">
                    <div id="carousel-produto-${produto.id}" class="carousel-compact">
                        <!-- Carrossel será renderizado aqui -->
                    </div>
                </div>
                
                <div class="card-header">
                    <h3>${produto.nome}</h3>
                    <div class="card-badge categoria-${produto.categoria?.toLowerCase().replace(/\s+/g, '-')}">
                        ${produto.categoria || 'Sem categoria'}
                    </div>
                </div>
                
                <div class="card-body">
                    <p class="produto-descricao">${produto.descricao || 'Sem descrição'}</p>
                    <div class="produto-preco">
                        <strong>${this.formatCurrency(produto.preco)}</strong>
                    </div>
                    <div class="produto-tempo">
                        <i class="fas fa-clock"></i>
                        ${produto.tempo_preparo || 24}h de preparo
                    </div>
                </div>
                
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="btn btn-sm btn-primary" onclick="dashboardApp.viewProductDetails(${produto.id})" title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="dashboardApp.editProduct(${produto.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-info" onclick="dashboardApp.manageProductImages(${produto.id})" title="Gerenciar imagens">
                            <i class="fas fa-images"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="dashboardApp.deleteProduct(${produto.id})" title="Deletar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <small>Atualizado em ${this.formatDate(produto.updated_at)}</small>
                </div>
            </div>
        `).join('');

        container.innerHTML = `<div class="cards-grid produtos-grid">${cardsHTML}</div>`;

        // Inicializar carrosséis para cada produto
        produtos.forEach(produto => {
            const carouselId = `carousel-produto-${produto.id}`;
            if (produto.imagens && produto.imagens.length > 0) {
                new ImageCarousel(carouselId, produto.imagens);
            } else {
                // Criar carrossel vazio com imagem padrão
                new ImageCarousel(carouselId, [{
                    imagem_url: 'images/produtos/default.jpg',
                    titulo: 'Imagem não disponível',
                    is_principal: true
                }]);
            }
        });
    }

    async loadPedidos() {
        console.log('Carregando pedidos...');
        // Implementar conforme necessário
    }

    async loadEstoque() {
        console.log('Carregando estoque...');
        // Implementar conforme necessário
    }

    async loadEntregas() {
        console.log('Carregando entregas...');
        // Implementar conforme necessário
    }

    // Ver detalhes do produto
    viewProductDetails(produtoId) {
        const produto = this.currentData.produtos.find(p => p.id === produtoId);
        if (!produto) return;

        // Criar modal de detalhes
        const modalHTML = `
            <div class="modal modal-large" id="modal-produto-detalhes">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${produto.nome}</h3>
                        <button class="modal-close" onclick="dashboardApp.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="produto-detalhes-grid">
                            <div class="produto-imagens">
                                <div id="carousel-detalhes-${produto.id}" class="carousel-modal">
                                    <!-- Carrossel será renderizado aqui -->
                                </div>
                            </div>
                            <div class="produto-info">
                                <div class="info-group">
                                    <label>Categoria:</label>
                                    <span class="badge">${produto.categoria || 'Sem categoria'}</span>
                                </div>
                                <div class="info-group">
                                    <label>Preço:</label>
                                    <span class="price">${this.formatCurrency(produto.preco)}</span>
                                </div>
                                <div class="info-group">
                                    <label>Tempo de Preparo:</label>
                                    <span>${produto.tempo_preparo || 24} horas</span>
                                </div>
                                <div class="info-group">
                                    <label>Descrição:</label>
                                    <p>${produto.descricao || 'Sem descrição'}</p>
                                </div>
                                <div class="info-group">
                                    <label>Imagens:</label>
                                    <span>${produto.imagens?.length || 0} de 5</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="dashboardApp.closeModal()">Fechar</button>
                        <button class="btn btn-primary" onclick="dashboardApp.editProduct(${produto.id})">Editar</button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar modal ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal
        this.showModal('modal-produto-detalhes');

        // Inicializar carrossel
        const images = produto.imagens?.length > 0 ? produto.imagens : [{
            imagem_url: 'images/produtos/default.jpg',
            titulo: 'Imagem não disponível'
        }];
        new ImageCarousel(`carousel-detalhes-${produto.id}`, images);
    }

    // Gerenciar imagens do produto
    manageProductImages(produtoId) {
        const produto = this.currentData.produtos.find(p => p.id === produtoId);
        if (!produto) return;

        const modalHTML = `
            <div class="modal modal-large" id="modal-produto-imagens">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Gerenciar Imagens - ${produto.nome}</h3>
                        <button class="modal-close" onclick="dashboardApp.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="imagens-manager">
                            <div class="current-images">
                                <h4>Imagens Atuais (${produto.imagens?.length || 0}/5)</h4>
                                <div class="images-grid" id="images-grid-${produtoId}">
                                    ${produto.imagens?.map((img, index) => `
                                        <div class="image-item" data-id="${img.id}">
                                            <img src="${img.imagem_url}" alt="${img.titulo || 'Produto'}">
                                            <div class="image-overlay">
                                                <button class="btn btn-sm btn-primary" onclick="dashboardApp.setMainImage('${img.id}', '${produtoId}')" 
                                                        ${img.is_principal ? 'disabled' : ''}>
                                                    <i class="fas fa-star"></i>
                                                    ${img.is_principal ? 'Principal' : 'Tornar Principal'}
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="dashboardApp.removeProductImage('${img.id}', '${produtoId}')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                            <input type="text" class="image-title" value="${img.titulo || ''}" 
                                                   placeholder="Título da imagem"
                                                   onchange="dashboardApp.updateImageTitle('${img.id}', this.value)">
                                        </div>
                                    `).join('') || '<p class="no-images">Nenhuma imagem cadastrada</p>'}
                                </div>
                            </div>
                            
                            ${(produto.imagens?.length || 0) < 5 ? `
                                <div class="add-image-section">
                                    <h4>Adicionar Nova Imagem</h4>
                                    <form id="form-nova-imagem-${produtoId}" class="nova-imagem-form">
                                        <div class="form-group">
                                            <label>URL da Imagem:</label>
                                            <input type="url" id="nova-imagem-url" required placeholder="https://exemplo.com/imagem.jpg">
                                        </div>
                                        <div class="form-group">
                                            <label>Título:</label>
                                            <input type="text" id="nova-imagem-titulo" placeholder="Título da imagem">
                                        </div>
                                        <div class="form-group">
                                            <label>Descrição:</label>
                                            <textarea id="nova-imagem-descricao" rows="2" placeholder="Descrição da imagem"></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-plus"></i> Adicionar Imagem
                                        </button>
                                    </form>
                                </div>
                            ` : '<p class="max-images">Máximo de 5 imagens atingido</p>'}
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="dashboardApp.closeModal()">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        // Adicionar modal ao DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal
        this.showModal('modal-produto-imagens');

        // Configurar form de nova imagem
        const form = document.getElementById(`form-nova-imagem-${produtoId}`);
        if (form) {
            form.addEventListener('submit', (e) => this.handleAddProductImage(e, produtoId));
        }
    }

    // Adicionar nova imagem ao produto
    async handleAddProductImage(e, produtoId) {
        e.preventDefault();
        
        const formData = {
            produto_id: produtoId,
            imagem_url: document.getElementById('nova-imagem-url').value,
            titulo: document.getElementById('nova-imagem-titulo').value || null,
            descricao: document.getElementById('nova-imagem-descricao').value || null,
            ordem: (this.currentData.produtos.find(p => p.id === produtoId)?.imagens?.length || 0) + 1
        };

        try {
            this.showLoading(true);
            
            const result = await this.dataManager.saveProdutoImagem(formData);
            
            if (result.success) {
                this.showSuccess('Imagem adicionada com sucesso!');
                this.closeModal();
                await this.loadProdutos(); // Recarregar produtos
            } else {
                this.showError(result.message || 'Erro ao adicionar imagem');
            }
            
        } catch (error) {
            console.error('Erro ao adicionar imagem:', error);
            this.showError('Erro ao adicionar imagem');
        } finally {
            this.showLoading(false);
        }
    }

    // Definir imagem principal
    async setMainImage(imagemId, produtoId) {
        try {
            this.showLoading(true);
            
            const result = await this.dataManager.definirImagemPrincipal(imagemId, produtoId);
            
            if (result.success) {
                this.showSuccess('Imagem principal definida!');
                await this.loadProdutos();
                this.closeModal();
                this.manageProductImages(produtoId); // Reabrir modal atualizado
            } else {
                this.showError('Erro ao definir imagem principal');
            }
            
        } catch (error) {
            console.error('Erro ao definir imagem principal:', error);
            this.showError('Erro ao definir imagem principal');
        } finally {
            this.showLoading(false);
        }
    }

    // Remover imagem do produto
    async removeProductImage(imagemId, produtoId) {
        if (!confirm('Tem certeza que deseja remover esta imagem?')) return;

        try {
            this.showLoading(true);
            
            const result = await this.dataManager.deleteProdutoImagem(imagemId);
            
            if (result.success) {
                this.showSuccess('Imagem removida com sucesso!');
                await this.loadProdutos();
                this.closeModal();
                this.manageProductImages(produtoId); // Reabrir modal atualizado
            } else {
                this.showError('Erro ao remover imagem');
            }
            
        } catch (error) {
            console.error('Erro ao remover imagem:', error);
            this.showError('Erro ao remover imagem');
        } finally {
            this.showLoading(false);
        }
    }

    // Modals placeholder
    showOrderModal() { console.log('Modal de pedido'); }
    showProductModal() { console.log('Modal de produto'); }
    editProduct(produtoId) { console.log('Editar produto:', produtoId); }
    deleteProduct(produtoId) { console.log('Deletar produto:', produtoId); }
    showStockModal() { console.log('Modal de estoque'); }
    showDeliveryModal() { console.log('Modal de entrega'); }

    // Aplicar filtros
    applyFilters() {
        // Implementar filtros por seção
        switch (this.currentSection) {
            case 'clientes':
                this.filterClientes();
                break;
            // Adicionar outros casos conforme necessário
        }
    }

    // Filtrar clientes
    filterClientes() {
        const searchTerm = document.getElementById('search-clientes')?.value.toLowerCase() || '';
        const idiomaFilter = document.getElementById('filter-cliente-idioma')?.value || '';
        
        let filtered = this.currentData.clientes;
        
        if (searchTerm) {
            filtered = filtered.filter(cliente => 
                cliente.nome.toLowerCase().includes(searchTerm) ||
                cliente.telefone.includes(searchTerm) ||
                (cliente.email && cliente.email.toLowerCase().includes(searchTerm))
            );
        }
        
        if (idiomaFilter) {
            filtered = filtered.filter(cliente => cliente.idioma === idiomaFilter);
        }
        
        this.renderClientes(filtered);
    }

    // Utilitários
    showModal(modalId) {
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById(modalId).classList.add('active');
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
        this.isLoading = show;
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Auto remover após 5 segundos
        setTimeout(() => {
            toast.remove();
        }, 5000);

        // Remover ao clicar no X
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    }

    setupUI() {
        // Configurações adicionais da UI
        this.updateLanguageSelector();
    }

    updateLanguageSelector() {
        const selector = document.getElementById('language-selector');
        if (selector && this.i18n) {
            selector.value = this.i18n.getCurrentLanguage();
        }
    }

    // Formatadores
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
    }

    getStatusText(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'confirmado': 'Confirmado',
            'producao': 'Em Produção',
            'pronto': 'Pronto',
            'entregue': 'Entregue',
            'cancelado': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    getDeliveryStatusText(status) {
        const statusMap = {
            'agendada': 'Agendada',
            'saiu': 'Saiu para Entrega',
            'entregue': 'Entregue',
            'reagendada': 'Reagendada'
        };
        return statusMap[status] || status;
    }
}

/**
 * Componente de Carrossel de Imagens
 */
class ImageCarousel {
    constructor(containerId, images = []) {
        this.container = document.getElementById(containerId);
        this.images = images;
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 4000; // 4 segundos
        
        if (this.container) {
            this.render();
            this.setupEventListeners();
        }
    }

    render() {
        if (!this.images || this.images.length === 0) {
            this.container.innerHTML = `
                <div class="carousel-no-images">
                    <i class="fas fa-image"></i>
                    <p>Nenhuma imagem disponível</p>
                </div>
            `;
            return;
        }

        const carouselHTML = `
            <div class="image-carousel">
                <div class="carousel-container">
                    <div class="carousel-slides" id="carousel-slides-${this.container.id}">
                        ${this.images.map((img, index) => `
                            <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                                <img src="${img.imagem_url}" alt="${img.titulo || 'Produto'}" loading="lazy">
                                ${img.titulo ? `<div class="carousel-caption">${img.titulo}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    ${this.images.length > 1 ? `
                        <button class="carousel-btn carousel-prev" id="prev-${this.container.id}">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="carousel-btn carousel-next" id="next-${this.container.id}">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    ` : ''}
                </div>
                
                ${this.images.length > 1 ? `
                    <div class="carousel-indicators">
                        ${this.images.map((_, index) => `
                            <button class="carousel-indicator ${index === 0 ? 'active' : ''}" 
                                    data-index="${index}"></button>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="carousel-counter">
                    <span class="current">${this.currentIndex + 1}</span> / 
                    <span class="total">${this.images.length}</span>
                </div>
            </div>
        `;

        this.container.innerHTML = carouselHTML;
    }

    setupEventListeners() {
        if (this.images.length <= 1) return;

        const prevBtn = document.getElementById(`prev-${this.container.id}`);
        const nextBtn = document.getElementById(`next-${this.container.id}`);
        const indicators = this.container.querySelectorAll('.carousel-indicator');

        // Botões de navegação
        prevBtn?.addEventListener('click', () => this.prevSlide());
        nextBtn?.addEventListener('click', () => this.nextSlide());

        // Indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Navegação por teclado
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Touch/swipe support
        this.setupTouchEvents();

        // Auto-play
        this.startAutoPlay();

        // Pausar auto-play ao passar o mouse
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    setupTouchEvents() {
        let startX = 0;
        let endX = 0;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) { // Mínimo de 50px para considerar swipe
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });
    }

    goToSlide(index) {
        if (index < 0 || index >= this.images.length) return;

        // Atualizar slide ativo
        const slides = this.container.querySelectorAll('.carousel-slide');
        const indicators = this.container.querySelectorAll('.carousel-indicator');
        const counter = this.container.querySelector('.carousel-counter .current');

        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        slides[index]?.classList.add('active');
        indicators[index]?.classList.add('active');
        
        if (counter) {
            counter.textContent = index + 1;
        }

        this.currentIndex = index;
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        if (this.images.length <= 1) return;
        
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    updateImages(newImages) {
        this.images = newImages || [];
        this.currentIndex = 0;
        this.stopAutoPlay();
        this.render();
        this.setupEventListeners();
    }

    destroy() {
        this.stopAutoPlay();
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Instância global
window.dashboardApp = new DashboardApp();
window.ImageCarousel = ImageCarousel;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    // Aguardar um pouco para garantir que outros sistemas foram inicializados
    setTimeout(async () => {
        await window.dashboardApp.init();
    }, 1500);
});