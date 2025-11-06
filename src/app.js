// app.js - Lógica principal do Dashboard

class DashboardApp {
	constructor() {
		this.currentUser = null;
		this.products = [];
		this.clients = [];
		this.orders = [];
		this.deliveries = [];
		this.initialized = false;
		this.currentLang = localStorage.getItem('lang') || 'pt-BR';
	}

	async initialize() {
		try {
			console.log('🚀 Inicializando Dashboard...');

			// Aguardar AuthSystem estar pronto
			let attempts = 0;
			while (!window.authSystem?.isInitialized && attempts < 50) {
				await new Promise(resolve => setTimeout(resolve, 100));
				attempts++;
			}

			// Verificar se usuário está autenticado
			if (!window.authSystem?.isLoggedIn()) {
				console.log('⚠️ Usuário não autenticado, redirecionando...');
				window.location.href = 'index.html';
				return false;
			}

			this.currentUser = window.authSystem.getCurrentUser();
			console.log('✅ Usuário autenticado:', this.currentUser.nome);

			// Carregar dados primeiro
			this.loadData();
			
			// Configurar UI
			this.setupUI();
			this.setupEventListeners();
			this.setupLanguageSwitcher();
			
			// Criar cards e atualizar stats
			this.createStatsCards();
			this.createDataCards();
			this.updateEntregasHoje();

			// Ouvir mudanças de idioma
			window.addEventListener('languageChanged', () => {
				console.log('🌐 Idioma mudou, atualizando dashboard...');
				this.updateAllTranslations();
			});

			this.initialized = true;
			console.log('✅ Dashboard inicializado');
			return true;
		} catch (error) {
			console.error('❌ Erro ao inicializar Dashboard:', error);
			return false;
		}
	}

	setupUI() {
		// Atualizar informações do usuário
		const userNameEl = document.getElementById('dropdown-user-name');
		const userAvatarEl = document.getElementById('user-avatar');
		const welcomeName = document.getElementById('welcome-name');
		const userType = document.getElementById('dropdown-user-type');

		if (userNameEl) userNameEl.textContent = this.currentUser.nome;
		if (userAvatarEl) {
			userAvatarEl.src = this.currentUser.foto_url || 
				`https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.nome)}&background=ff6b9d&color=fff&size=32`;
		}
		if (welcomeName) welcomeName.textContent = this.currentUser.nome;
		if (userType) {
			const lang = localStorage.getItem('lang') || 'pt-BR';
			userType.textContent = this.currentUser.tipo === 'admin' 
				? (lang === 'pt-BR' ? 'Administrador' : 'Administrator')
				: (lang === 'pt-BR' ? 'Usuário' : 'User');
		}

		// Atualizar "Bem-vindo" com tradução
		this.updateWelcomeMessage();

		// Setar página título
		const pageTitle = document.getElementById('page-title');
		if (pageTitle) pageTitle.textContent = this.getTranslation('section.dashboard');
	}

	updateWelcomeMessage() {
		const welcomeText = document.querySelector('.welcome-text');
		if (welcomeText) {
			const bemVindo = this.getTranslation('dashboard.bem_vindo');
			welcomeText.innerHTML = `${bemVindo}, <strong>${this.currentUser.nome}</strong>!`;
		}
	}

	updateAllTranslations() {
		console.log('🔄 Atualizando traduções...');
		
		// Atualizar APENAS os labels dos cards de estatísticas (não os valores)
		const labelProdutos = document.getElementById('label-produtos');
		const labelClientes = document.getElementById('label-clientes');
		const labelPedidos = document.getElementById('label-pedidos');
		const labelEstoque = document.getElementById('label-estoque');
		const labelEntregas = document.getElementById('label-entregas');

		if (labelProdutos) labelProdutos.textContent = this.getTranslation('dashboard.produtos');
		if (labelClientes) labelClientes.textContent = this.getTranslation('dashboard.clientes');
		if (labelPedidos) labelPedidos.textContent = this.getTranslation('dashboard.pedidos');
		if (labelEstoque) labelEstoque.textContent = this.getTranslation('dashboard.estoque');
		if (labelEntregas) labelEntregas.textContent = this.getTranslation('dashboard.entregas');
		
		// Atualizar cards de dados
		this.createDataCards();
		
		// Atualizar mensagem de boas-vindas
		this.updateWelcomeMessage();
		
		// Atualizar navegação inferior
		this.updateBottomNav();
		
		// Atualizar título da página
		this.updatePageTitle();
		
		// Atualizar menu dropdown
		this.updateDropdownMenu();
		
		// Atualizar tipo de usuário
		const userType = document.getElementById('dropdown-user-type');
		if (userType) {
			const lang = localStorage.getItem('lang') || 'pt-BR';
			userType.textContent = this.currentUser.tipo === 'admin' 
				? (lang === 'pt-BR' ? 'Administrador' : 'Administrator')
				: (lang === 'pt-BR' ? 'Usuário' : 'User');
		}
		
		// Atualizar seção de entregas hoje
		this.updateEntregasHoje();
		
		console.log('✅ Todas as traduções atualizadas');
	}

	updateDropdownMenu() {
		const lang = localStorage.getItem('lang') || 'pt-BR';
		const profileBtn = document.getElementById('profile-btn');
		const configBtn = document.getElementById('config-btn');
		const logoutBtn = document.getElementById('logout-btn');

		if (profileBtn) {
			const span = profileBtn.querySelector('span');
			if (span) span.textContent = this.getTranslation('btn.profile');
		}

		if (configBtn) {
			const span = configBtn.querySelector('span');
			if (span) span.textContent = lang === 'pt-BR' ? 'Configurações' : 'Settings';
		}

		if (logoutBtn) {
			const span = logoutBtn.querySelector('span');
			if (span) span.textContent = this.getTranslation('btn.logout');
		}
	}

	getTranslation(key) {
		// Usar função global de tradução do i18n.js
		if (typeof window.t === 'function') {
			return window.t(key);
		}
		return key;
	}

	createStatsCards() {
		const statsGrid = document.getElementById('stats-grid');
		if (!statsGrid) return;

		const stats = [
			{
				icon: 'fa-cookie-bite',
				label: this.getTranslation('dashboard.produtos'),
				id: 'total-produtos',
				labelId: 'label-produtos',
				value: this.products.length
			},
			{
				icon: 'fa-users',
				label: this.getTranslation('dashboard.clientes'),
				id: 'total-clientes',
				labelId: 'label-clientes',
				value: this.clients.length
			},
			{
				icon: 'fa-hourglass-end',
				label: this.getTranslation('dashboard.pedidos'),
				id: 'total-pedidos',
				labelId: 'label-pedidos',
				value: this.orders.filter(o => o.status === 'pendente').length
			},
			{
				icon: 'fa-warehouse',
				label: this.getTranslation('dashboard.estoque'),
				id: 'total-estoque',
				labelId: 'label-estoque',
				value: this.products.reduce((sum, p) => sum + (p.estoque || 0), 0)
			},
			{
				icon: 'fa-shipping-fast',
				label: this.getTranslation('dashboard.entregas'),
				id: 'total-entregas',
				labelId: 'label-entregas',
				value: this.countDeliveriesToday()
			}
		];

		statsGrid.innerHTML = stats.map(stat => `
			<div class="stat-card-container">
				<div style="background: white; padding: 1.25rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; width: 100%; height: 100%;">
					<div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff6b9d, #ffa726); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; flex-shrink: 0;">
						<i class="fas ${stat.icon}"></i>
					</div>
					<div>
						<h3 style="margin: 0; font-size: 1.75rem; font-weight: 700; color: #333;" id="${stat.id}">${stat.value}</h3>
						<p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.85rem;" id="${stat.labelId}">${stat.label}</p>
					</div>
				</div>
			</div>
		`).join('');

		// Adicionar hover effect
		document.querySelectorAll('.stat-card-container').forEach(card => {
			card.addEventListener('mouseenter', function() {
				this.querySelector('div').style.transform = 'translateY(-4px)';
				this.querySelector('div').style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
			});
			card.addEventListener('mouseleave', function() {
				this.querySelector('div').style.transform = 'translateY(0)';
				this.querySelector('div').style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
			});
		});
	}

	createDataCards() {
		// Cards de Clientes
		this.renderClientesPage();
		
		// Cards de Produtos
		this.renderProdutosPage();
		
		// Cards de Pedidos
		this.renderPedidosPage();
		
		// Cards de Estoque
		this.renderEstoquePage();
		
		// Cards de Entregas
		this.renderEntregasPage();
	}

	renderClientesPage() {
		const clientesContainer = document.getElementById('clientes-container');
		if (!clientesContainer) return;

		const actionBar = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap;">
				<input type="text" id="search-clientes" placeholder="${this.currentLang === 'pt-BR' ? '🔍 Buscar cliente...' : '🔍 Search client...'}" style="flex: 1; min-width: 200px; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
				<button onclick="window.dashboardApp.openAddClientModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap;">
					<i class="fas fa-plus"></i> ${this.currentLang === 'pt-BR' ? 'Novo Cliente' : 'New Client'}
				</button>
			</div>
		`;

		if (this.clients.length === 0) {
			clientesContainer.innerHTML = actionBar + `
				<div style="text-align: center; color: #888; padding: 3rem; background: white; border-radius: 8px;">
					<i class="fas fa-users" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
					<p style="font-size: 1.1rem;">${this.getTranslation('msg.nenhum_cliente')}</p>
				</div>
			`;
		} else {
			const clientsList = this.clients.map(client => `
				<div style="background: white; padding: 1.25rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.08)'">
					<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
						<div style="flex: 1;">
							<h4 style="margin: 0; color: #333; font-weight: 600; font-size: 1.1rem;">${client.nome}</h4>
							<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem;">
								<p style="margin: 0; color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
									<i class="fas fa-phone" style="color: #ff6b9d; width: 16px;"></i>
									${client.telefone}
								</p>
								<p style="margin: 0; color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
									<i class="fas fa-envelope" style="color: #ff6b9d; width: 16px;"></i>
									${client.email || (this.currentLang === 'pt-BR' ? 'Não informado' : 'Not provided')}
								</p>
								<p style="margin: 0; color: #666; font-size: 0.9rem; display: flex; align-items: start; gap: 0.5rem;">
									<i class="fas fa-map-marker-alt" style="color: #ff6b9d; width: 16px; margin-top: 2px;"></i>
									${client.endereco}
								</p>
							</div>
						</div>
						<div style="display: flex; gap: 0.5rem;">
							<button onclick="window.dashboardApp.editClient(${client.id})" style="padding: 0.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" title="${this.currentLang === 'pt-BR' ? 'Editar' : 'Edit'}">
								<i class="fas fa-edit"></i>
							</button>
							<button onclick="window.dashboardApp.deleteClient(${client.id})" style="padding: 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" title="${this.currentLang === 'pt-BR' ? 'Excluir' : 'Delete'}">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</div>
				</div>
			`).join('');

			clientesContainer.innerHTML = actionBar + `<div style="display: flex; flex-direction: column; gap: 0.75rem;">${clientsList}</div>`;
		}

		// Adicionar busca
		const searchInput = document.getElementById('search-clientes');
		if (searchInput) {
			searchInput.addEventListener('input', (e) => {
				const term = e.target.value.toLowerCase();
				const filtered = this.clients.filter(c => 
					c.nome.toLowerCase().includes(term) || 
					c.telefone.includes(term) ||
					c.endereco.toLowerCase().includes(term)
				);
				// Renderizar apenas os filtrados (implementar depois)
			});
		}
	}

	renderProdutosPage() {
		const produtosContainer = document.getElementById('produtos-container');
		if (!produtosContainer) return;

		const actionBar = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap;">
				<input type="text" id="search-produtos" placeholder="${this.currentLang === 'pt-BR' ? '🔍 Buscar produto...' : '🔍 Search product...'}" style="flex: 1; min-width: 200px; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
				<button onclick="window.dashboardApp.openAddProductModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap;">
					<i class="fas fa-plus"></i> ${this.currentLang === 'pt-BR' ? 'Novo Produto' : 'New Product'}
				</button>
			</div>
		`;

		if (this.products.length === 0) {
			produtosContainer.innerHTML = actionBar + `
				<div style="text-align: center; color: #888; padding: 3rem; background: white; border-radius: 8px;">
					<i class="fas fa-cookie-bite" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
					<p style="font-size: 1.1rem;">${this.getTranslation('msg.nenhum_produto')}</p>
				</div>
			`;
		} else {
			const productsList = this.products.map(product => `
				<div style="background: white; padding: 1.25rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.08)'">
					<div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
						<div style="flex: 1;">
							<h4 style="margin: 0; color: #333; font-weight: 600; font-size: 1.1rem;">${product.nome}</h4>
							<div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.75rem; flex-wrap: wrap;">
								<span style="color: #28a745; font-size: 1.25rem; font-weight: 700;">R$ ${parseFloat(product.preco).toFixed(2)}</span>
								<span style="background: ${product.estoque > 10 ? '#28a745' : product.estoque > 0 ? '#FFC107' : '#dc3545'}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
									📦 ${product.estoque} ${this.currentLang === 'pt-BR' ? 'unid.' : 'units'}
								</span>
							</div>
							${product.descricao ? `<p style="margin: 0.75rem 0 0 0; color: #666; font-size: 0.9rem;">${product.descricao}</p>` : ''}
						</div>
						<div style="display: flex; gap: 0.5rem;">
							<button onclick="window.dashboardApp.editProduct(${product.id})" style="padding: 0.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" title="${this.currentLang === 'pt-BR' ? 'Editar' : 'Edit'}">
								<i class="fas fa-edit"></i>
							</button>
							<button onclick="window.dashboardApp.deleteProduct(${product.id})" style="padding: 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" title="${this.currentLang === 'pt-BR' ? 'Excluir' : 'Delete'}">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</div>
				</div>
			`).join('');

			produtosContainer.innerHTML = actionBar + `<div style="display: flex; flex-direction: column; gap: 0.75rem;">${productsList}</div>`;
		}
	}

	renderPedidosPage() {
		const pedidosContainer = document.getElementById('pedidos-container');
		if (!pedidosContainer) return;

		const actionBar = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap;">
				<input type="text" id="search-pedidos" placeholder="${this.currentLang === 'pt-BR' ? '🔍 Buscar pedido...' : '🔍 Search order...'}" style="flex: 1; min-width: 200px; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
				<button onclick="window.dashboardApp.openAddOrderModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap;">
					<i class="fas fa-plus"></i> ${this.currentLang === 'pt-BR' ? 'Novo Pedido' : 'New Order'}
				</button>
			</div>
		`;

		if (this.orders.length === 0) {
			pedidosContainer.innerHTML = actionBar + `
				<div style="text-align: center; color: #888; padding: 3rem; background: white; border-radius: 8px;">
					<i class="fas fa-receipt" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
					<p style="font-size: 1.1rem;">${this.getTranslation('msg.nenhum_pedido')}</p>
				</div>
			`;
		} else {
			const ordersList = this.orders.map(order => `
				<div style="background: white; padding: 1.25rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.08)'">
					<div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
						<div style="flex: 1;">
							<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
								<h4 style="margin: 0; color: #333; font-weight: 600; font-size: 1.1rem;">${this.getTranslation('detail.pedido')} #${order.id}</h4>
								<span style="background: ${this.getStatusColor(order.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${order.status}</span>
							</div>
							<div style="display: flex; flex-direction: column; gap: 0.5rem;">
								<p style="margin: 0; color: #666; font-size: 0.9rem;">
									<i class="fas fa-user" style="color: #ff6b9d; width: 16px;"></i>
									${order.cliente_nome || 'Cliente não informado'}
								</p>
								<p style="margin: 0; color: #666; font-size: 0.9rem;">
									<i class="fas fa-calendar" style="color: #ff6b9d; width: 16px;"></i>
									${order.data_entrega || (this.currentLang === 'pt-BR' ? 'Sem data' : 'No date')}
								</p>
								<p style="margin: 0; color: #28a745; font-size: 1.1rem; font-weight: 700; margin-top: 0.5rem;">
									💰 R$ ${parseFloat(order.valor_total || 0).toFixed(2)}
								</p>
							</div>
						</div>
						<div style="display: flex; gap: 0.5rem;">
							<button onclick="window.dashboardApp.viewOrder(${order.id})" style="padding: 0.5rem; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" title="${this.currentLang === 'pt-BR' ? 'Ver detalhes' : 'View details'}">
								<i class="fas fa-eye"></i>
							</button>
							<button onclick="window.dashboardApp.editOrder(${order.id})" style="padding: 0.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" title="${this.currentLang === 'pt-BR' ? 'Editar' : 'Edit'}">
								<i class="fas fa-edit"></i>
							</button>
							<button onclick="window.dashboardApp.deleteOrder(${order.id})" style="padding: 0.5rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;" title="${this.currentLang === 'pt-BR' ? 'Excluir' : 'Delete'}">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</div>
				</div>
			`).join('');

			pedidosContainer.innerHTML = actionBar + `<div style="display: flex; flex-direction: column; gap: 0.75rem;">${ordersList}</div>`;
		}
	}

	renderEstoquePage() {
		const estoqueContainer = document.getElementById('estoque-container');
		if (!estoqueContainer) return;

		if (this.products.length === 0) {
			estoqueContainer.innerHTML = `
				<div style="text-align: center; color: #888; padding: 3rem; background: white; border-radius: 8px;">
					<i class="fas fa-box-open" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
					<p style="font-size: 1.1rem;">${this.getTranslation('msg.sem_dados')}</p>
				</div>
			`;
		} else {
			const stockList = this.products.map(product => {
				const percentage = Math.min((product.estoque / 100) * 100, 100);
				const color = product.estoque > 10 ? '#28a745' : product.estoque > 5 ? '#FFC107' : '#dc3545';
				
				return `
				<div style="background: white; padding: 1.25rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
						<h4 style="margin: 0; color: #333; font-weight: 600; font-size: 1.05rem;">${product.nome}</h4>
						<span style="background: ${color}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
							${product.estoque} ${this.currentLang === 'pt-BR' ? 'unid.' : 'units'}
						</span>
					</div>
					<div style="background: #f0f0f0; border-radius: 8px; height: 12px; overflow: hidden;">
						<div style="background: ${color}; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
					</div>
					<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
						<span style="color: #666; font-size: 0.85rem;">${this.currentLang === 'pt-BR' ? 'Nível de estoque' : 'Stock level'}</span>
						<button onclick="window.dashboardApp.adjustStock(${product.id})" style="padding: 0.4rem 0.75rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
							<i class="fas fa-edit"></i> ${this.currentLang === 'pt-BR' ? 'Ajustar' : 'Adjust'}
						</button>
					</div>
				</div>
			`;
			}).join('');

			estoqueContainer.innerHTML = `<div style="display: flex; flex-direction: column; gap: 0.75rem;">${stockList}</div>`;
		}
	}

	renderEntregasPage() {
		const entregasContainer = document.getElementById('entregas-container');
		if (!entregasContainer) return;

		const actionBar = `
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap;">
				<input type="date" id="filter-entregas" style="padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;">
				<button onclick="window.dashboardApp.refreshDeliveries()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; white-space: nowrap;">
					<i class="fas fa-sync-alt"></i> ${this.currentLang === 'pt-BR' ? 'Atualizar' : 'Refresh'}
				</button>
			</div>
		`;

		const deliveriesWithDates = this.orders.filter(o => o.data_entrega);
		
		if (deliveriesWithDates.length === 0) {
			entregasContainer.innerHTML = actionBar + `
				<div style="text-align: center; color: #888; padding: 3rem; background: white; border-radius: 8px;">
					<i class="fas fa-truck" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
					<p style="font-size: 1.1rem;">${this.getTranslation('msg.nenhuma_entrega')}</p>
				</div>
			`;
		} else {
			const today = new Date().toISOString().split('T')[0];
			const deliveriesList = deliveriesWithDates.map(order => {
				const isToday = order.data_entrega === today;
				
				return `
				<div style="background: ${isToday ? '#fff3cd' : 'white'}; padding: 1.25rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); border-left: 4px solid ${isToday ? '#FFC107' : '#ff6b9d'}; transition: transform 0.2s, box-shadow 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.08)'">
					<div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
						<div style="flex: 1;">
							<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
								<h4 style="margin: 0; color: #333; font-weight: 600; font-size: 1.1rem;">${this.currentLang === 'pt-BR' ? 'Entrega' : 'Delivery'} #${order.id}</h4>
								${isToday ? `<span style="background: #FFC107; color: #333; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${this.currentLang === 'pt-BR' ? 'HOJE' : 'TODAY'}</span>` : ''}
							</div>
							<div style="display: flex; flex-direction: column; gap: 0.5rem;">
								<p style="margin: 0; color: #666; font-size: 0.9rem;">
									<i class="fas fa-user" style="color: #ff6b9d; width: 16px;"></i>
									${order.cliente_nome || (this.currentLang === 'pt-BR' ? 'Cliente não informado' : 'Client not informed')}
								</p>
								<p style="margin: 0; color: #666; font-size: 0.9rem;">
									<i class="fas fa-calendar-alt" style="color: #ff6b9d; width: 16px;"></i>
									${this.formatDate(order.data_entrega)}
								</p>
								<p style="margin: 0; color: #666; font-size: 0.9rem;">
									<i class="fas fa-clock" style="color: #ff6b9d; width: 16px;"></i>
									${order.horario_entrega || (this.currentLang === 'pt-BR' ? 'Horário não definido' : 'Time not set')}
								</p>
								<p style="margin: 0; color: #666; font-size: 0.9rem; display: flex; align-items: start; gap: 0.5rem;">
									<i class="fas fa-map-marker-alt" style="color: #ff6b9d; width: 16px; margin-top: 2px;"></i>
									${order.endereco_entrega || (this.currentLang === 'pt-BR' ? 'Endereço não informado' : 'Address not informed')}
								</p>
							</div>
						</div>
						<div style="display: flex; flex-direction: column; gap: 0.5rem;">
							<button onclick="window.dashboardApp.markAsDelivered(${order.id})" style="padding: 0.5rem 0.75rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
								<i class="fas fa-check"></i> ${this.currentLang === 'pt-BR' ? 'Entregue' : 'Delivered'}
							</button>
							<button onclick="window.dashboardApp.viewOrder(${order.id})" style="padding: 0.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
								<i class="fas fa-eye"></i>
							</button>
						</div>
					</div>
				</div>
			`;
			}).join('');

			entregasContainer.innerHTML = actionBar + `<div style="display: flex; flex-direction: column; gap: 0.75rem;">${deliveriesList}</div>`;
		}
	}

	formatDate(dateString) {
		if (!dateString) return '';
		const date = new Date(dateString + 'T00:00:00');
		const lang = this.currentLang === 'pt-BR' ? 'pt-BR' : 'en-US';
		return date.toLocaleDateString(lang, { day: '2-digit', month: 'long', year: 'numeric' });
	}

	getStatusColor(status) {
		const colors = {
			'pendente': '#FFC107',
			'pago': '#28a745',
			'entregue': '#17a2b8',
			'cancelado': '#dc3545'
		};
		return colors[status] || '#6c757d';
	}

	setupEventListeners() {
		// Menu do usuário
		const userMenuBtn = document.getElementById('user-menu-button');
		const userDropdown = document.getElementById('user-dropdown');
		const profileBtn = document.getElementById('profile-btn');
		const configBtn = document.getElementById('config-btn');
		const logoutBtn = document.getElementById('logout-btn');

		if (userMenuBtn) {
			userMenuBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				if (userDropdown) {
					const isVisible = userDropdown.classList.contains('show');
					if (isVisible) {
						userDropdown.classList.remove('show');
					} else {
						userDropdown.classList.add('show');
					}
				}
			});
		}

		if (profileBtn) {
			profileBtn.addEventListener('click', () => {
				if (userDropdown) userDropdown.classList.remove('show');
				this.openProfileModal();
			});
		}

		if (configBtn) {
			configBtn.addEventListener('click', () => {
				if (userDropdown) userDropdown.classList.remove('show');
				this.openConfigModal();
			});
		}

		if (logoutBtn) {
			logoutBtn.addEventListener('click', () => {
				const lang = localStorage.getItem('lang') || 'pt-BR';
				if (confirm(lang === 'pt-BR' ? 'Deseja realmente sair?' : 'Do you really want to logout?')) {
					window.authSystem.logout();
					window.location.href = 'index.html';
				}
			});
		}

		// Fechar dropdown ao clicar fora
		document.addEventListener('click', (e) => {
			if (userDropdown && !userMenuBtn?.contains(e.target) && !userDropdown.contains(e.target)) {
				userDropdown.classList.remove('show');
			}
		});

		// Navegação
		document.querySelectorAll('.nav-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const section = e.currentTarget.getAttribute('data-section');
				this.switchSection(section);
			});
		});
	}

	setupLanguageSwitcher() {
		// Seletores de idioma (bandeiras)
		const flagWrappers = document.querySelectorAll('.flag-wrapper');
		flagWrappers.forEach(wrapper => {
			wrapper.addEventListener('click', () => {
				const lang = wrapper.getAttribute('data-lang') === 'pt' ? 'pt-BR' : 'en-US';
				this.currentLang = lang;
				localStorage.setItem('lang', lang);
				
				// Atualizar visual
				flagWrappers.forEach(fw => fw.style.opacity = '0.6');
				wrapper.style.opacity = '1';
				
				// Mudar idioma via i18n
				if (typeof window.setLang === 'function') {
					window.setLang(lang);
				}
				
				console.log('🌐 Idioma alterado para:', lang);
			});
		});

		// Marcar idioma atual
		const langCode = this.currentLang === 'pt-BR' ? 'pt' : 'en';
		const currentLangBtn = document.querySelector(`.flag-wrapper[data-lang="${langCode}"]`);
		if (currentLangBtn) currentLangBtn.style.opacity = '1';
	}

	updatePageTitle() {
		const pageTitle = document.getElementById('page-title');
		if (pageTitle) {
			// Encontrar qual seção está ativa
			const activeSection = document.querySelector('.content-section[style*="display: block"]');
			if (activeSection) {
				const sectionId = activeSection.id.replace('-section', '');
				pageTitle.textContent = this.getTranslation(`section.${sectionId}`);
			}
		}
	}

	switchSection(section) {
		// Esconder todas as seções
		document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
		document.querySelectorAll('.nav-btn').forEach(b => b.style.color = '#888');

		// Mostrar seção selecionada
		const targetSection = document.getElementById(`${section}-section`);
		if (targetSection) {
			targetSection.style.display = 'block';
		}

		// Marcar botão como ativo
		const activeBtn = document.querySelector(`[data-section="${section}"]`);
		if (activeBtn) activeBtn.style.color = '#ff6b9d';

		// Atualizar título
		const pageTitle = document.getElementById('page-title');
		if (pageTitle) {
			pageTitle.textContent = this.getTranslation(`section.${section}`);
		}
	}

	loadData() {
		// Carregar dados do localStorage
		try {
			const savedProducts = localStorage.getItem('products');
			const savedClients = localStorage.getItem('clients');
			const savedOrders = localStorage.getItem('orders');

			this.products = savedProducts ? JSON.parse(savedProducts) : [];
			this.clients = savedClients ? JSON.parse(savedClients) : [];
			this.orders = savedOrders ? JSON.parse(savedOrders) : [];

			console.log('✅ Dados carregados:', {
				produtos: this.products.length,
				clientes: this.clients.length,
				pedidos: this.orders.length
			});
		} catch (error) {
			console.error('Erro ao carregar dados:', error);
		}
	}

	saveData() {
		try {
			localStorage.setItem('products', JSON.stringify(this.products));
			localStorage.setItem('clients', JSON.stringify(this.clients));
			localStorage.setItem('orders', JSON.stringify(this.orders));
			console.log('✅ Dados salvos com sucesso');
		} catch (error) {
			console.error('Erro ao salvar dados:', error);
		}
	}

	updateStats() {
		// Atualizar APENAS os valores numéricos, não os labels
		const totalProdutos = document.getElementById('total-produtos');
		const totalClientes = document.getElementById('total-clientes');
		const totalPedidos = document.getElementById('total-pedidos');
		const totalEntregas = document.getElementById('total-entregas');
		const totalEstoque = document.getElementById('total-estoque');

		if (totalProdutos) totalProdutos.textContent = this.products.length;
		if (totalClientes) totalClientes.textContent = this.clients.length;
		if (totalPedidos) totalPedidos.textContent = this.orders.filter(o => o.status === 'pendente').length;
		if (totalEntregas) totalEntregas.textContent = this.countDeliveriesToday();
		if (totalEstoque) totalEstoque.textContent = this.products.reduce((sum, p) => sum + (p.estoque || 0), 0);
	}

	countDeliveriesToday() {
		const today = new Date().toISOString().split('T')[0];
		return this.orders.filter(o => o.data_entrega === today).length;
	}

	updateEntregasHoje() {
		const entregasHoje = document.getElementById('entregas-hoje');
		if (!entregasHoje) return;

		const today = new Date().toISOString().split('T')[0];
		const entregas = this.orders.filter(o => o.data_entrega === today);
		
		const msg = this.getTranslation('msg.nenhuma_entrega');

		if (entregas.length === 0) {
			entregasHoje.innerHTML = `<div style="text-align: center; color: #888; padding: 2rem;"><i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem;"></i><p>${msg}</p></div>`;
		} else {
			entregasHoje.innerHTML = `
				<div style="display: flex; flex-direction: column; gap: 0.75rem;">
					${entregas.map(order => `
						<div style="background: #f9f9f9; padding: 0.75rem; border-left: 4px solid #ff6b9d; border-radius: 4px;">
							<p style="margin: 0; font-weight: 600; color: #333;">${this.getTranslation('detail.pedido')} #${order.id}</p>
							<p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">🕐 ${order.horario_entrega || (this.currentLang === 'pt-BR' ? 'Sem horário' : 'No time')}</p>
						</div>
					`).join('')}
				</div>
			`;
		}
		
		// Atualizar também o título da seção
		const entregasHojeTitleWrapper = document.querySelector('#dashboard-section > div:last-child');
		if (entregasHojeTitleWrapper) {
			const titleElement = entregasHojeTitleWrapper.querySelector('h3');
			if (titleElement) {
				titleElement.textContent = '📦 ' + this.getTranslation('dashboard.entregas_hoje');
			}
		}
	}

	updateBottomNav() {
		const navBtns = document.querySelectorAll('.nav-btn');
		navBtns.forEach(btn => {
			const section = btn.getAttribute('data-section');
			const textSpan = btn.querySelector('span:last-child');
			
			if (textSpan) {
				textSpan.textContent = this.getTranslation(`nav.${section}`);
			}
		});
	}

	// Modal de Perfil
	openProfileModal() {
		const modal = document.getElementById('profile-modal');
		if (modal) {
			modal.style.display = 'flex';
			this.loadProfileData();
		}
	}

	loadProfileData() {
		const nameInput = document.getElementById('profile-name');
		const emailInput = document.getElementById('profile-email');
		const avatarPreview = document.getElementById('avatar-preview');
		const labels = document.querySelectorAll('#profile-modal label');
		const modalTitle = document.querySelector('#profile-modal h2');
		const btnChangePhoto = document.querySelector('#profile-modal button[onclick*="triggerAvatarUpload"]');

		if (nameInput) nameInput.value = this.currentUser.nome || '';
		if (emailInput) emailInput.value = this.currentUser.email || '';

		if (avatarPreview) {
			const avatarUrl = this.currentUser.foto_url || 
				`https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.nome)}&background=ff6b9d&color=fff&size=80`;
			avatarPreview.style.backgroundImage = `url('${avatarUrl}')`;
			avatarPreview.style.backgroundSize = 'cover';
			avatarPreview.style.backgroundPosition = 'center';
		}

		// Traduzir elementos do modal
		if (modalTitle) modalTitle.textContent = '👤 ' + this.getTranslation('modal.perfil');
		if (labels[0]) labels[0].textContent = this.getTranslation('modal.nome');
		if (labels[1]) labels[1].textContent = this.getTranslation('modal.email');
		if (btnChangePhoto) btnChangePhoto.textContent = this.getTranslation('modal.alterar_foto');

		// Traduzir botões
		const btnCancel = document.querySelector('.btn-cancel');
		const btnSave = document.querySelector('.btn-save');
		if (btnCancel) btnCancel.textContent = this.getTranslation('modal.cancelar');
		if (btnSave) btnSave.textContent = this.getTranslation('modal.salvar');
	}

	async saveProfile() {
		const name = document.getElementById('profile-name').value.trim();
		const lang = localStorage.getItem('lang') || 'pt-BR';

		if (!name) {
			alert(lang === 'pt-BR' ? 'Preencha o nome' : 'Fill in the name');
			return;
		}

		try {
			const result = await window.authSystem.updateUserProfile({ nome: name, foto_url: this.currentUser.foto_url });
			if (result.success) {
				alert(lang === 'pt-BR' ? 'Perfil atualizado com sucesso!' : 'Profile updated successfully!');
				this.currentUser = result.user;
				this.setupUI();
				document.getElementById('profile-modal').style.display = 'none';
			} else {
				alert(lang === 'pt-BR' ? 'Erro ao salvar perfil' : 'Error saving profile');
			}
		} catch (error) {
			alert(lang === 'pt-BR' ? 'Erro ao salvar perfil' : 'Error saving profile');
		}
	}

	handleAvatarUpload(event) {
		const file = event.target.files[0];
		if (!file) return;

		const lang = localStorage.getItem('lang') || 'pt-BR';

		if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
			alert(lang === 'pt-BR' ? 'Selecione uma imagem válida' : 'Select a valid image');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			alert(lang === 'pt-BR' ? 'Imagem deve ter no máximo 5MB' : 'Image must be at most 5MB');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const dataURL = e.target.result;
			const avatarPreview = document.getElementById('avatar-preview');
			if (avatarPreview) {
				avatarPreview.style.backgroundImage = `url('${dataURL}')`;
				avatarPreview.style.backgroundSize = 'cover';
				avatarPreview.style.backgroundPosition = 'center';
			}
			this.currentUser.foto_url = dataURL;
			sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
			this.setupUI();
		};
		reader.readAsDataURL(file);
	}

	// Modal de Configurações
	openConfigModal() {
		const lang = this.currentLang === 'pt-BR';
		const modalHTML = `
			<div id="config-modal" style="display: flex; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); justify-content: center; align-items: center; padding: 1rem;">
				<div style="background: white; border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
					<div style="padding: 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
						<h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">⚙️ ${lang ? 'Configurações' : 'Settings'}</h2>
						<button onclick="closeModal('config-modal')" style="background: none; border: none; color: white; font-size: 28px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;">&times;</button>
					</div>
					<div style="padding: 24px;">
						<div style="margin-bottom: 1.5rem;">
							<h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem;">${lang ? '🌐 Idioma' : '🌐 Language'}</h3>
							<div style="display: flex; gap: 1rem;">
								<button onclick="window.dashboardApp.changeLanguage('pt-BR')" style="flex: 1; padding: 1rem; border: 2px solid ${this.currentLang === 'pt-BR' ? '#ff6b9d' : '#ddd'}; border-radius: 8px; background: ${this.currentLang === 'pt-BR' ? '#fff0f5' : 'white'}; cursor: pointer; font-weight: 600; color: #333;">
									🇧🇷 Português (BR)
								</button>
								<button onclick="window.dashboardApp.changeLanguage('en-US')" style="flex: 1; padding: 1rem; border: 2px solid ${this.currentLang === 'en-US' ? '#ff6b9d' : '#ddd'}; border-radius: 8px; background: ${this.currentLang === 'en-US' ? '#fff0f5' : 'white'}; cursor: pointer; font-weight: 600; color: #333;">
									🇨🇦 English (CA)
								</button>
							</div>
						</div>
						<div style="margin-bottom: 1.5rem;">
							<h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem;">${lang ? '📊 Dados' : '📊 Data'}</h3>
							<button onclick="window.dashboardApp.exportData()" style="width: 100%; padding: 0.75rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-bottom: 0.5rem;">
								<i class="fas fa-download"></i> ${lang ? 'Exportar Dados' : 'Export Data'}
							</button>
							<button onclick="window.dashboardApp.clearData()" style="width: 100%; padding: 0.75rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
								<i class="fas fa-trash"></i> ${lang ? 'Limpar Todos os Dados' : 'Clear All Data'}
							</button>
						</div>
						<div>
							<h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem;">${lang ? 'ℹ️ Sobre' : 'ℹ️ About'}</h3>
							<p style="margin: 0; color: #666; font-size: 0.95rem;">
								<strong>Leo's Cake</strong><br>
								${lang ? 'Versão' : 'Version'}: 1.0.0<br>
								${lang ? 'Sistema de Pré-Vendas' : 'Pre-Sales System'}
							</p>
						</div>
					</div>
				</div>
			</div>
		`;
		
		// Remover modal existente se houver
		const existingModal = document.getElementById('config-modal');
		if (existingModal) existingModal.remove();
		
		// Adicionar novo modal
		document.body.insertAdjacentHTML('beforeend', modalHTML);
	}

	changeLanguage(lang) {
		this.currentLang = lang;
		localStorage.setItem('lang', lang);
		
		// Atualizar bandeiras
		const flagWrappers = document.querySelectorAll('.flag-wrapper');
		flagWrappers.forEach(fw => fw.style.opacity = '0.6');
		const langCode = lang === 'pt-BR' ? 'pt' : 'en';
		const currentFlag = document.querySelector(`.flag-wrapper[data-lang="${langCode}"]`);
		if (currentFlag) currentFlag.style.opacity = '1';
		
		// Mudar idioma via i18n
		if (typeof window.setLang === 'function') {
			window.setLang(lang);
		}
		
		// Fechar e reabrir modal para atualizar textos
		closeModal('config-modal');
		setTimeout(() => this.openConfigModal(), 100);
	}

	exportData() {
		const data = {
			products: this.products,
			clients: this.clients,
			orders: this.orders,
			exportDate: new Date().toISOString()
		};
		
		const dataStr = JSON.stringify(data, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `leos-cake-backup-${new Date().toISOString().split('T')[0]}.json`;
		link.click();
		URL.revokeObjectURL(url);
		
		const lang = this.currentLang === 'pt-BR';
		alert(lang ? 'Dados exportados com sucesso!' : 'Data exported successfully!');
	}

	clearData() {
		const lang = this.currentLang === 'pt-BR';
		if (confirm(lang ? 'Tem certeza? Todos os dados serão perdidos!' : 'Are you sure? All data will be lost!')) {
			localStorage.removeItem('products');
			localStorage.removeItem('clients');
			localStorage.removeItem('orders');
			this.products = [];
			this.clients = [];
			this.orders = [];
			this.createStatsCards();
			this.createDataCards();
			this.updateStats();
			alert(lang ? 'Dados limpos com sucesso!' : 'Data cleared successfully!');
			closeModal('config-modal');
		}
	}

	// Funções de CRUD (placeholders)
	openAddClientModal() {
		alert(this.currentLang === 'pt-BR' ? 'Funcionalidade em desenvolvimento' : 'Feature under development');
	}

	editClient(id) {
		alert(`Edit client ${id}`);
	}

	deleteClient(id) {
		const lang = this.currentLang === 'pt-BR';
		if (confirm(lang ? 'Excluir este cliente?' : 'Delete this client?')) {
			this.clients = this.clients.filter(c => c.id !== id);
			this.saveData();
			this.renderClientesPage();
			this.updateStats();
			alert(lang ? 'Cliente excluído!' : 'Client deleted!');
		}
	}

	openAddProductModal() {
		alert(this.currentLang === 'pt-BR' ? 'Funcionalidade em desenvolvimento' : 'Feature under development');
	}

	editProduct(id) {
		alert(`Edit product ${id}`);
	}

	deleteProduct(id) {
		const lang = this.currentLang === 'pt-BR';
		if (confirm(lang ? 'Excluir este produto?' : 'Delete this product?')) {
			this.products = this.products.filter(p => p.id !== id);
			this.saveData();
			this.renderProdutosPage();
			this.renderEstoquePage();
			this.updateStats();
			alert(lang ? 'Produto excluído!' : 'Product deleted!');
		}
	}

	adjustStock(id) {
		const lang = this.currentLang === 'pt-BR';
		const product = this.products.find(p => p.id === id);
		if (!product) return;

		const newStock = prompt(
			lang ? `Ajustar estoque de "${product.nome}"\nEstoque atual: ${product.estoque}\n\nNovo valor:` : `Adjust stock for "${product.nome}"\nCurrent stock: ${product.estoque}\n\nNew value:`,
			product.estoque
		);

		if (newStock !== null && !isNaN(newStock) && parseInt(newStock) >= 0) {
			product.estoque = parseInt(newStock);
			this.saveData();
			this.renderEstoquePage();
			this.updateStats();
			alert(lang ? 'Estoque atualizado!' : 'Stock updated!');
		}
	}

	openAddOrderModal() {
		alert(this.currentLang === 'pt-BR' ? 'Funcionalidade em desenvolvimento' : 'Feature under development');
	}

	viewOrder(id) {
		const order = this.orders.find(o => o.id === id);
		if (!order) return;

		const lang = this.currentLang === 'pt-BR';
		alert(`${lang ? 'Pedido' : 'Order'} #${id}\n\n${lang ? 'Cliente' : 'Client'}: ${order.cliente_nome}\n${lang ? 'Valor' : 'Value'}: R$ ${parseFloat(order.valor_total || 0).toFixed(2)}\n${lang ? 'Status' : 'Status'}: ${order.status}`);
	}

	editOrder(id) {
		alert(`Edit order ${id}`);
	}

	deleteOrder(id) {
		const lang = this.currentLang === 'pt-BR';
		if (confirm(lang ? 'Excluir este pedido?' : 'Delete this order?')) {
			this.orders = this.orders.filter(o => o.id !== id);
			this.saveData();
			this.renderPedidosPage();
			this.renderEntregasPage();
			this.updateStats();
			this.updateEntregasHoje();
			alert(lang ? 'Pedido excluído!' : 'Order deleted!');
		}
	}

	markAsDelivered(id) {
		const lang = this.currentLang === 'pt-BR';
		const order = this.orders.find(o => o.id === id);
		if (!order) return;

		if (confirm(lang ? 'Marcar como entregue?' : 'Mark as delivered?')) {
			order.status = 'entregue';
			this.saveData();
			this.renderPedidosPage();
			this.renderEntregasPage();
			this.updateStats();
			this.updateEntregasHoje();
			alert(lang ? 'Pedido marcado como entregue!' : 'Order marked as delivered!');
		}
	}

	refreshDeliveries() {
		this.renderEntregasPage();
		const lang = this.currentLang === 'pt-BR';
		alert(lang ? 'Entregas atualizadas!' : 'Deliveries refreshed!');
	}
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
	try {
		const app = new DashboardApp();
		const initialized = await app.initialize();
		
		if (initialized) {
			window.dashboardApp = app;

			// Expor funções globais para HTML
			window.openProfileModal = () => app.openProfileModal();
			window.closeModal = (modalId) => {
				const modal = document.getElementById(modalId);
				if (modal) modal.remove();
			};
			window.saveProfile = () => app.saveProfile();
			window.triggerAvatarUpload = () => {
				const input = document.getElementById('avatar-upload');
				if (input) input.click();
			};
			window.handleAvatarUpload = (event) => app.handleAvatarUpload(event);
		}
	} catch (error) {
		console.error('❌ Erro crítico na inicialização:', error);
	}
});