// Removed stray closing bracket at the top of the file
// app.js - Dashboard com Integração Supabase Completa

class DashboardApp {
	constructor() {
		this.currentUser = null;
		this.products = [];
		this.clients = [];
		this.orders = [];
		this.initialized = false;
		this.currentLang = localStorage.getItem('lang') || 'pt-BR';
		this.supabase = null;
	}

	async initialize() {
		try {
			console.log('🚀 Inicializando Dashboard...');

			// Aguardar authSystem
			let attempts = 0;
			while (!window.authSystem?.isInitialized && attempts < 50) {
				await new Promise(resolve => setTimeout(resolve, 100));
				attempts++;
			}

			if (!window.authSystem?.isLoggedIn()) {
				window.location.href = 'index.html';
				return false;
			}

			this.currentUser = window.authSystem.getCurrentUser();
			this.supabase = window.supabaseClient;

			await this.loadData();
			this.setupUI();
			this.setupEventListeners();
			this.setupLanguageSwitcher();
			this.createStatsCards();
			this.createDataCards();
			this.updateEntregasHoje();

			window.addEventListener('languageChanged', () => this.updateAllTranslations());

			this.initialized = true;
			console.log('✅ Dashboard inicializado');
			return true;
		} catch (error) {
			console.error('❌ Erro ao inicializar:', error);
			return false;
		}
	}

	t(key) {
		return typeof window.t === 'function' ? window.t(key) : key;
	}

	formatCurrency(value) {
		return `CAD$ ${parseFloat(value || 0).toFixed(2)}`;
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

	setupUI() {
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
			userType.textContent = this.currentUser.tipo === 'admin' 
				? (this.currentLang === 'pt-BR' ? 'Administrador' : 'Administrator')
				: (this.currentLang === 'pt-BR' ? 'Usuário' : 'User');
		}

		this.updateWelcomeMessage();
		const pageTitle = document.getElementById('page-title');
		if (pageTitle) pageTitle.textContent = this.t('section.dashboard');
	}

	updateWelcomeMessage() {
		const welcomeText = document.querySelector('.welcome-text');
		if (welcomeText) {
			welcomeText.innerHTML = `${this.t('dashboard.bem_vindo')}, <strong>${this.currentUser.nome}</strong>!`;
		}
	}

	setupEventListeners() {
		const userMenuBtn = document.getElementById('user-menu-button');
		const userDropdown = document.getElementById('user-dropdown');
		const logoutBtn = document.getElementById('logout-btn');

		if (userMenuBtn) {
			userMenuBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				userDropdown?.classList.toggle('show');
			});
		}

		if (logoutBtn) {
			logoutBtn.addEventListener('click', () => {
				if (confirm(this.t('btn.logout') + '?')) {
					window.authSystem.logout();
					window.location.href = 'index.html';
				}
			});
		}

		document.addEventListener('click', (e) => {
			if (userDropdown && !userMenuBtn?.contains(e.target) && !userDropdown.contains(e.target)) {
				userDropdown.classList.remove('show');
			}
		});

		document.querySelectorAll('.nav-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const section = e.currentTarget.getAttribute('data-section');
				this.switchSection(section);
			});
		});
	}

	setupLanguageSwitcher() {
		const flagWrappers = document.querySelectorAll('.flag-wrapper');
		flagWrappers.forEach(wrapper => {
			wrapper.addEventListener('click', () => {
				const lang = wrapper.getAttribute('data-lang') === 'pt' ? 'pt-BR' : 'en-US';
				this.currentLang = lang;
				localStorage.setItem('lang', lang);
				
				flagWrappers.forEach(fw => fw.style.opacity = '0.6');
				wrapper.style.opacity = '1';
				
				if (typeof window.setLang === 'function') {
					window.setLang(lang);
				}
			});
		});

		const langCode = this.currentLang === 'pt-BR' ? 'pt' : 'en';
		const currentLangBtn = document.querySelector(`.flag-wrapper[data-lang="${langCode}"]`);
		if (currentLangBtn) currentLangBtn.style.opacity = '1';
	}

	switchSection(section) {
		document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
		document.querySelectorAll('.nav-btn').forEach(b => b.style.color = '#888');

		const targetSection = document.getElementById(`${section}-section`);
		if (targetSection) targetSection.style.display = 'block';

		const activeBtn = document.querySelector(`[data-section="${section}"]`);
		if (activeBtn) activeBtn.style.color = '#ff6b9d';

		const pageTitle = document.getElementById('page-title');
		if (pageTitle) pageTitle.textContent = this.t(`section.${section}`);
	}

	createStatsCards() {
		const statsGrid = document.getElementById('stats-grid');
		if (!statsGrid) return;

		const stats = [
			{ icon: 'fa-cookie-bite', label: this.t('dashboard.produtos'), id: 'total-produtos', labelId: 'label-produtos', value: this.products.length },
			{ icon: 'fa-users', label: this.t('dashboard.clientes'), id: 'total-clientes', labelId: 'label-clientes', value: this.clients.length },
			{ icon: 'fa-hourglass-end', label: this.t('dashboard.pedidos'), id: 'total-pedidos', labelId: 'label-pedidos', value: this.orders.filter(o => o.status === 'pendente').length },
			{ icon: 'fa-warehouse', label: this.t('dashboard.estoque'), id: 'total-estoque', labelId: 'label-estoque', value: this.products.reduce((sum, p) => sum + (p.estoque || 0), 0) },
			{ icon: 'fa-shipping-fast', label: this.t('dashboard.entregas'), id: 'total-entregas', labelId: 'label-entregas', value: this.countDeliveriesToday() }
		];

		statsGrid.innerHTML = stats.map(stat => `
			<div class="stat-card-container">
				<div style="background: white; padding: 1.25rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; transition: transform 0.2s; cursor: pointer;">
					<div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff6b9d, #ffa726); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
						<i class="fas ${stat.icon}"></i>
					</div>
					<div>
						<h3 style="margin: 0; font-size: 1.75rem; font-weight: 700; color: #333;" id="${stat.id}">${stat.value}</h3>
						<p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.85rem;" id="${stat.labelId}">${stat.label}</p>
					</div>
				</div>
			</div>
		`).join('');
	}

	createDataCards() {
		this.renderClientesPage();
		this.renderProdutosPage();
		this.renderPedidosPage();
		this.renderEstoquePage();
		this.renderEntregasPage();
	}

	updateStats() {
		const ids = ['total-produtos', 'total-clientes', 'total-pedidos', 'total-entregas', 'total-estoque'];
		const values = [
			this.products.length,
			this.clients.length,
			this.orders.filter(o => o.status === 'pendente').length,
			this.countDeliveriesToday(),
			this.products.reduce((sum, p) => sum + (p.estoque || 0), 0)
		];

		ids.forEach((id, i) => {
			const el = document.getElementById(id);
			if (el) el.textContent = values[i];
		});
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

		if (entregas.length === 0) {
			entregasHoje.innerHTML = `<div style="text-align: center; color: #888; padding: 2rem;"><i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem;"></i><p>${this.t('msg.nenhuma_entrega')}</p></div>`;
		} else {
			entregasHoje.innerHTML = `
				<div style="display: flex; flex-direction: column; gap: 0.75rem;">
					${entregas.map(order => `
						<div style="background: #f9f9f9; padding: 0.75rem; border-left: 4px solid #ff6b9d; border-radius: 4px;">
							<p style="margin: 0; font-weight: 600; color: #333;">${this.t('detail.pedido')} #${order.id}</p>
							<p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">🕐 ${order.horario_entrega || 'N/A'}</p>
						</div>
					`).join('')}
				</div>
			`;
		}
	}

	updateAllTranslations() {
		['label-produtos', 'label-clientes', 'label-pedidos', 'label-estoque', 'label-entregas'].forEach((id, i) => {
			const el = document.getElementById(id);
			if (el) el.textContent = this.t(['dashboard.produtos', 'dashboard.clientes', 'dashboard.pedidos', 'dashboard.estoque', 'dashboard.entregas'][i]);
		});
		
		this.createDataCards();
		this.updateWelcomeMessage();
		this.updateEntregasHoje();
	}

	// ==================== DADOS SUPABASE ====================

	async loadData() {
		if (!this.supabase) {
			console.warn('⚠️ Supabase não disponível, usando localStorage');
			this.loadFromLocalStorage();
			return;
		}

		try {
			// Carregar clientes
			const { data: clientes, error: clientesError } = await this.supabase
				.from('clientes')
				.select('*')
				.order('created_at', { ascending: false });

			if (!clientesError) this.clients = clientes || [];

			// Carregar produtos
			const { data: produtos, error: produtosError } = await this.supabase
				.from('produtos')
				.select('*')
				.order('created_at', { ascending: false });

			if (!produtosError) this.products = produtos || [];

			// Carregar pedidos
			const { data: pedidos, error: pedidosError } = await this.supabase
				.from('pedidos')
				.select('*')
				.order('created_at', { ascending: false });

			if (!pedidosError) this.orders = pedidos || [];

			console.log('✅ Dados carregados do Supabase:', {
				clientes: this.clients.length,
				produtos: this.products.length,
				pedidos: this.orders.length
			});
		} catch (error) {
			console.error('Erro ao carregar dados:', error);
			this.loadFromLocalStorage();
		}
	}

	loadFromLocalStorage() {
		this.products = JSON.parse(localStorage.getItem('products') || '[]');
		this.clients = JSON.parse(localStorage.getItem('clients') || '[]');
		this.orders = JSON.parse(localStorage.getItem('orders') || '[]');
	}

	async saveToSupabase(table, data, id = null) {
		if (!this.supabase) {
			console.warn('⚠️ Supabase não disponível');
			return null;
		}

		try {
			if (id) {
				const { data: result, error } = await this.supabase
					.from(table)
					.update(data)
					.eq('id', id)
					.select()
					.single();

				if (error) {
					console.error(`Erro Supabase UPDATE [${table}]:`, error, data);
					throw error;
				}
				return result;
			} else {
				const { data: result, error } = await this.supabase
					.from(table)
					.insert([data])
					.select()
					.single();

				if (error) {
					console.error(`Erro Supabase INSERT [${table}]:`, error, data);
					throw error;
				}
				return result;
			}
		} catch (error) {
			alert('Erro ao salvar no banco: ' + (error?.message || error));
			console.error('Erro ao salvar:', error, data);
			return null;
		}
	}

	async deleteFromSupabase(table, id) {
		if (!this.supabase) return false;

		try {
			const { error } = await this.supabase
				.from(table)
				.delete()
				.eq('id', id);

			return !error;
		} catch (error) {
			console.error('Erro ao deletar:', error);
			return false;
		}
	}

	// ==================== CLIENTES ====================

	async openAddClientModal() {
	const modal = this.createModal('modal-add-client', '', false);
	modal.querySelector('.modal-content-wrapper').innerHTML = `
			<div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
				<span style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #6dd5ed); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-user"></i></span>
				<span style="font-size: 1.35rem; font-weight: 700; color: #333;">${this.t('modal.add_client')}</span>
				<button onclick="closeModal('modal-add-client')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
			</div>
			<div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
			<form id="form-add-client" class="form-modal">
				<div class="form-group">
					<label for="client-nome">${this.t('modal.client_name')} *</label>
					<input type="text" id="client-nome" required class="form-control" placeholder="${this.t('placeholder.enter_name')}">
				</div>
				<div class="form-group">
					<label for="client-telefone">${this.t('modal.client_phone')} *</label>
					<input type="tel" id="client-telefone" required class="form-control" placeholder="${this.t('placeholder.enter_phone')}">
				</div>
				<div class="form-group">
					<label for="client-email">${this.t('modal.client_email')}</label>
					<input type="email" id="client-email" class="form-control" placeholder="${this.t('placeholder.enter_email')}">
				</div>
				<div class="form-group">
					<label for="client-endereco">${this.t('modal.client_address')} *</label>
					<textarea id="client-endereco" required class="form-control" rows="3" placeholder="${this.t('placeholder.enter_address')}"></textarea>
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-add-client')" class="btn btn-secondary">${this.t('btn.cancel')}</button>
					<button type="submit" class="btn btn-primary">${this.t('btn.save')}</button>
				</div>
			</form>
		`;
		
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');

		// Event listener para cadastro de cliente
		modal.querySelector('#form-add-client').addEventListener('submit', async (e) => {
			e.preventDefault();
			const nome = modal.querySelector('#client-nome').value.trim();
			const telefone = modal.querySelector('#client-telefone').value.trim();
			const email = modal.querySelector('#client-email').value.trim();
			const endereco = modal.querySelector('#client-endereco').value.trim();
			if (!nome || !telefone || !endereco) {
				alert('Preencha todos os campos obrigatórios');
				return;
			}
			const clientData = { nome, telefone, email, endereco };
			const result = await this.saveToSupabase('clientes', clientData);
			if (result) this.clients.unshift(result);
			await this.loadData();
			this.renderClientesPage();
			this.updateStats();
			closeModal('modal-add-client');
		});
	}

	async deleteProduct(id) {
		if (!confirm('Excluir este produto?')) return;

		const success = await this.deleteFromSupabase('produtos', id);
		if (success) {
			this.products = this.products.filter(p => p.id !== id);
			this.renderProdutosPage();
			this.renderEstoquePage();
			this.updateStats();
		}
	}

	// ==================== PEDIDOS INTUITIVO ====================

	async openAddOrderModal() {
		if (this.clients.length === 0) {
			alert('Cadastre pelo menos um cliente primeiro');
			return;
		}
		if (this.products.length === 0) {
			alert('Cadastre pelo menos um produto primeiro');
			return;
		}

		const modal = this.createModal('modal-add-order', '🛒 ' + this.t('modal.add_order'));
		
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.minHeight = '100vh';
        modal.innerHTML = `
			<style>
				@media (max-width: 600px) {
					.modal-order-card { padding: 1rem 0.5rem !important; max-width: 100vw !important; max-height: 90vh !important; overflow-y: auto !important; }
					.modal-order-form { gap: 0.7rem !important; max-width: 100vw !important; }
				}
				.modal-order-card { max-height: 90vh; overflow-y: auto; }
			</style>
			<div class="modal-order-card" style="background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); padding: 2rem 1rem; max-width: 420px; width: 100%; margin: 2rem auto; box-sizing: border-box; max-height: 90vh; overflow-y: auto;">
				<form id="form-add-order" class="modal-order-form" style="display: flex; flex-direction: column; gap: 1.1rem; width: 100%; max-width: 420px; margin: 0 auto;">
				<!-- Passo 1: Cliente -->
				<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.25rem 1rem; border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(102,126,234,0.08);">
					<h4 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem;">
						<span style="background: white; color: #667eea; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">1</span>
						Selecione o Cliente
					</h4>
					<select id="order-client" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem;">
						<option value="">-- Escolha um cliente --</option>
						${this.clients.map(c => `<option value="${c.id}">${c.nome} - ${c.telefone}</option>`).join('')}
					</select>
				</div>

				<!-- Passo 2: Produto -->
				<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.25rem 1rem; border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(240,147,251,0.08);">
					<h4 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem;">
						<span style="background: white; color: #f5576c; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">2</span>
						Escolha o Produto
					</h4>
					<select id="order-product" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem; margin-bottom: 0.75rem;">
						<option value="">-- Escolha um produto --</option>
						${this.products.map(p => `<option value="${p.id}" data-price="${p.preco}">${p.nome} - ${this.formatCurrency(p.preco)}</option>`).join('')}
					</select>
					<input type="number" id="order-quantity" required min="1" value="1" placeholder="Quantidade" style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem;">
				</div>

				<!-- Passo 3: Entrega -->
				<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.25rem 1rem; border-radius: 10px; color: white; box-shadow: 0 2px 8px rgba(79,172,254,0.08);">
					<h4 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem;">
						<span style="background: white; color: #4facfe; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">3</span>
						Dados de Entrega
					</h4>
					<div style="display: grid; gap: 0.75rem;">
						<input type="date" id="order-date" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem;">
						<input type="time" id="order-time" style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem;">
						<textarea id="order-address" required rows="2" placeholder="Endereço de entrega" style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem; resize: none;"></textarea>
					</div>
				</div>

				<!-- Total -->
				<div style="background: #28a745; padding: 1.25rem 1rem; border-radius: 10px; color: white; text-align: center; box-shadow: 0 2px 8px rgba(40,167,69,0.08);">
					<h3 style="margin: 0; font-size: 0.9rem; font-weight: 400; opacity: 0.9;">VALOR TOTAL</h3>
					<h2 id="order-total" style="margin: 0.5rem 0 0 0; font-size: 2.2rem; font-weight: 700;">CAD$ 0.00</h2>
					<div style="margin-top: 1rem; text-align: left;">
						<label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500; color: #fff;">
							<input type="checkbox" id="order-full-payment" checked style="accent-color: #28a745; width: 18px; height: 18px;"> Pagamento total?
						</label>
						<div id="order-sinal-group" style="display: none; margin-top: 0.5rem;">
							<label for="order-sinal" style="color: #fff; font-weight: 500;">Valor do sinal:</label>
							<input type="number" id="order-sinal" min="0" step="0.01" style="width: 100%; padding: 0.5rem; border-radius: 6px; border: none; margin-top: 0.25rem;">
							<p id="order-restante" style="margin: 0.5rem 0 0 0; color: #fff; font-size: 0.95rem;"></p>
						</div>
					</div>
				</div>

				<!-- Forma de Pagamento -->
				<div style="background: linear-gradient(135deg, #ffb347 0%, #ffcc33 100%); padding: 1.25rem 1rem; border-radius: 10px; color: #333; box-shadow: 0 2px 8px rgba(255,179,71,0.08); margin-top: 0.5rem;">
					<h4 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem;">
						<span style="background: white; color: #ffb347; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">💰</span>
						Forma de Pagamento
					</h4>
					<select id="order-payment" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem;">
						<option value="dinheiro">Dinheiro</option>
						<option value="transferencia">Transferência</option>
					</select>
				</div>

				<div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
					<button type="button" onclick="closeModal('modal-add-order')" class="btn btn-secondary" style="padding: 0.75rem 2rem;">Cancelar</button>
					<button type="submit" class="btn btn-success" style="padding: 0.75rem 2rem; background: #28a745;">✓ Criar Pedido</button>
				</div>
			</form>
			</form>
			</div>
		`;
		
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');

		// Auto-preencher endereço
		document.getElementById('order-client').addEventListener('change', (e) => {
			const clientId = parseInt(e.target.value);
			const client = this.clients.find(c => c.id === clientId);
			if (client) document.getElementById('order-address').value = client.endereco;
		});

		// Calcular total em tempo real
		const updateTotal = () => {
			const productSelect = document.getElementById('order-product');
			const quantity = parseInt(document.getElementById('order-quantity').value) || 0;
			const selectedOption = productSelect.options[productSelect.selectedIndex];
			const price = parseFloat(selectedOption.dataset.price) || 0;
			const total = price * quantity;
			document.getElementById('order-total').textContent = this.formatCurrency(total);
		};

		document.getElementById('order-product').addEventListener('change', updateTotal);
		document.getElementById('order-quantity').addEventListener('input', updateTotal);
		
		// Pagamento total/sinal
		const fullPaymentCheckbox = modal.querySelector('#order-full-payment');
		const sinalGroup = modal.querySelector('#order-sinal-group');
		const sinalInput = modal.querySelector('#order-sinal');
		const restanteLabel = modal.querySelector('#order-restante');
		fullPaymentCheckbox.addEventListener('change', () => {
			if (fullPaymentCheckbox.checked) {
				sinalGroup.style.display = 'none';
			} else {
				sinalGroup.style.display = 'block';
				updateRestante();
			}
		});
		sinalInput.addEventListener('input', updateRestante);
		function updateRestante() {
			const total = parseFloat(document.getElementById('order-total').textContent.replace(/[^\d\.,]/g, '').replace(',', '.')) || 0;
			const sinal = parseFloat(sinalInput.value) || 0;
			const restante = total - sinal;
			restanteLabel.textContent = restante > 0 ? `Valor restante na entrega: ${window.dashboardApp.formatCurrency(restante)}` : '';
		}
		document.getElementById('form-add-order').addEventListener('submit', (e) => {
			e.preventDefault();
			this.saveOrder();
		});
	}

	async saveOrder(editId = null) {
		const clientId = parseInt(document.getElementById('order-client').value);
		const productId = parseInt(document.getElementById('order-product').value);
		const quantidade = parseInt(document.getElementById('order-quantity').value);
		const data_entrega = document.getElementById('order-date').value;
		const horario_entrega = document.getElementById('order-time').value;
		const endereco_entrega = document.getElementById('order-address').value.trim();

		const client = this.clients.find(c => c.id === clientId);
		const product = this.products.find(p => p.id === productId);

		if (!client || !product || !quantidade || !data_entrega || !endereco_entrega) {
			alert('Preencha todos os campos obrigatórios');
			return;
		}

		const valor_unitario = product.preco;
		const valor_total = valor_unitario * quantidade;

		const orderData = {
			cliente_id: clientId,
			cliente_nome: client.nome,
			produto_id: productId,
			produto_nome: product.nome,
			quantidade,
			valor_unitario,
			valor_total,
			data_entrega,
			horario_entrega,
			endereco_entrega,
			status: editId ? document.getElementById('order-status')?.value || 'pendente' : 'pendente'
		};

		if (editId) {
			const result = await this.saveToSupabase('pedidos', orderData, editId);
			if (result) {
				const index = this.orders.findIndex(o => o.id === editId);
				if (index !== -1) this.orders[index] = result;
			}
		} else {
			const result = await this.saveToSupabase('pedidos', orderData);
			if (result) this.orders.unshift(result);
		}

		await this.loadData();
		this.renderPedidosPage();
		this.renderEntregasPage();
		this.updateStats();
		this.updateEntregasHoje();
		closeModal(editId ? 'modal-edit-order' : 'modal-add-order');
	}

	async editOrder(id) {
		const order = this.orders.find(o => o.id === id);
		if (!order) return;

		const modal = this.createModal('modal-edit-order', '✏️ Editar Pedido #' + id);
		
		modal.innerHTML += `
			<form id="form-edit-order" style="display: flex; flex-direction: column; gap: 1rem;">
				<div>
					<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Cliente *</label>
					<select id="order-client" required class="form-control">
						${this.clients.map(c => `<option value="${c.id}" ${c.id === order.cliente_id ? 'selected' : ''}>${c.nome}</option>`).join('')}
					</select>
				</div>
				<div>
					<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Produto *</label>
					<select id="order-product" required class="form-control">
						${this.products.map(p => `<option value="${p.id}" data-price="${p.preco}" ${p.id === order.produto_id ? 'selected' : ''}>${p.nome} - ${this.formatCurrency(p.preco)}</option>`).join('')}
					</select>
				</div>
				<div>
					<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Quantidade *</label>
					<input type="number" id="order-quantity" required class="form-control" min="1" value="${order.quantidade}">
				</div>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
					<div>
						<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Data *</label>
						<input type="date" id="order-date" required class="form-control" value="${order.data_entrega}">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Horário</label>
						<input type="time" id="order-time" class="form-control" value="${order.horario_entrega || ''}">
					</div>
				</div>
				<div>
					<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Endereço *</label>
					<textarea id="order-address" required class="form-control" rows="2">${order.endereco_entrega}</textarea>
				</div>
				<div>
					<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Status *</label>
					<select id="order-status" required class="form-control">
						<option value="pendente" ${order.status === 'pendente' ? 'selected' : ''}>Pendente</option>
						<option value="pago" ${order.status === 'pago' ? 'selected' : ''}>Pago</option>
						<option value="entregue" ${order.status === 'entregue' ? 'selected' : ''}>Entregue</option>
						<option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
					</select>
				</div>
				<div>
					<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Forma de Pagamento *</label>
					<select id="order-payment" required class="form-control">
						<option value="dinheiro" ${order.forma_pagamento === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
						<option value="transferencia" ${order.forma_pagamento === 'transferencia' ? 'selected' : ''}>Transferência</option>
					</select>
				</div>
				<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
					<strong>Total:</strong> <span id="order-total" style="color: #28a745; font-size: 1.2rem; font-weight: 600;">${this.formatCurrency(order.valor_total)}</span>
				</div>
				<div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">
					<button type="button" onclick="closeModal('modal-edit-order')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Salvar</button>
				</div>
			</form>
		`;
		
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');

		const updateTotal = () => {
			const productSelect = document.getElementById('order-product');
			const quantity = parseInt(document.getElementById('order-quantity').value) || 0;
			const selectedOption = productSelect.options[productSelect.selectedIndex];
			const price = parseFloat(selectedOption.dataset.price) || 0;
			document.getElementById('order-total').textContent = this.formatCurrency(price * quantity);
		};

		document.getElementById('order-product').addEventListener('change', updateTotal);
		document.getElementById('order-quantity').addEventListener('input', updateTotal);
		
		document.getElementById('form-edit-order').addEventListener('submit', (e) => {
			e.preventDefault();
			this.saveOrder(id);
		});
	}

	async deleteOrder(id) {
		if (!confirm('Excluir este pedido?')) return;

		const success = await this.deleteFromSupabase('pedidos', id);
		if (success) {
			this.orders = this.orders.filter(o => o.id !== id);
			this.renderPedidosPage();
			this.renderEntregasPage();
			this.updateStats();
			this.updateEntregasHoje();
		}
	}

	viewOrder(id) {
		const order = this.orders.find(o => o.id === id);
		if (!order) return;

		const modal = this.createModal('modal-view-order', `📋 Pedido #${order.id}`, false);
		
		modal.innerHTML += `
			<div style="display: flex; flex-direction: column; gap: 1rem;">
				<div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 1.5rem; border-radius: 8px; color: white;">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<h3 style="margin: 0;">Pedido #${order.id}</h3>
						<span style="background: rgba(255,255,255,0.3); padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600;">${order.status.toUpperCase()}</span>
					</div>
				</div>

				<div style="display: grid; gap: 1rem;">
					<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
						<h4 style="margin: 0 0 0.75rem 0; color: #667eea;">👤 Cliente</h4>
						<p style="margin: 0; color: #333; font-size: 1.1rem; font-weight: 600;">${order.cliente_nome}</p>
					</div>

					<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
						<h4 style="margin: 0 0 0.75rem 0; color: #667eea;">🛍️ Produto</h4>
						<p style="margin: 0; color: #333;"><strong>${order.produto_nome}</strong></p>
						<p style="margin: 0.25rem 0 0 0; color: #666;">Quantidade: ${order.quantidade}</p>
						<p style="margin: 0.25rem 0 0 0; color: #666;">Valor unitário: ${this.formatCurrency(order.valor_unitario)}</p>
					</div>

					<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
						<h4 style="margin: 0 0 0.75rem 0; color: #667eea;">🚚 Entrega</h4>
						<p style="margin: 0; color: #666;">📅 ${this.formatDate(order.data_entrega)}</p>
						<p style="margin: 0.25rem 0 0 0; color: #666;">🕐 ${order.horario_entrega || 'Não informado'}</p>
						<p style="margin: 0.25rem 0 0 0; color: #666;">📍 ${order.endereco_entrega}</p>
					</div>

					<div style="background: #28a745; padding: 1.5rem; border-radius: 8px; text-align: center; color: white;">
						<h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 400; opacity: 0.9;">VALOR TOTAL</h4>
						<h2 style="margin: 0; font-size: 2rem;">${this.formatCurrency(order.valor_total)}</h2>
					</div>
				</div>

				<div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">
					<button type="button" onclick="closeModal('modal-view-order')" class="btn btn-secondary">Fechar</button>
					<button type="button" onclick="closeModal('modal-view-order'); window.dashboardApp.editOrder(${order.id});" class="btn btn-primary">
						✏️ Editar
					</button>
				</div>
			</div>
		`;
		
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
	}

	async markAsDelivered(id) {
		if (!confirm('Marcar como entregue?')) return;

		const order = this.orders.find(o => o.id === id);
		if (order) {
			await this.saveToSupabase('pedidos', { status: 'entregue' }, id);
			order.status = 'entregue';
			this.renderPedidosPage();
			this.renderEntregasPage();
			this.updateStats();
			this.updateEntregasHoje();
		}
	}

	createModal(id, title, showClose = true) {
		const modal = document.createElement('div');
		modal.id = id;
		modal.className = 'modal-overlay';
		modal.onclick = closeModalOverlay;

		modal.innerHTML = `
			<div class="modal-content-wrapper" onclick="event.stopPropagation()" style="max-width: 400px; width: 100%; padding: 1.5rem;">
				<div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #eee;">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<h3 style="margin: 0; color: #333; font-size: 1.25rem;">${title}</h3>
						${showClose ? `<button onclick="closeModal('${id}')" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; line-height: 1;">&times;</button>` : ''}
					</div>
				</div>
		`;

		return modal;
	}

	// ==================== RENDERIZAÇÃO ====================

	renderClientesPage() {
		const container = document.getElementById('clientes-container');
		if (!container) return;
	container.style.display = '';
	container.style.flexDirection = '';
	container.style.gap = '';

		const actionBar = `
			<button onclick="window.dashboardApp.openAddClientModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(255,107,157,0.3);">
				<i class="fas fa-plus"></i> Novo Cliente
			</button>
		`;

		if (this.clients.length === 0) {
			container.innerHTML = actionBar + `<p style="text-align: center; padding: 3rem; color: #888;">Nenhum cliente cadastrado</p>`;
		} else {
			const list = this.clients.map(c => `
				<div style="background: white; padding: 1.25rem; border-radius: 10px; margin-bottom: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #667eea;">
					<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
						<div style="background: linear-gradient(135deg, #667eea, #6dd5ed); border-radius: 8px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
							<i class="fas fa-user" style="color: #fff; font-size: 1.5rem;"></i>
						</div>
						<h4 style="margin: 0; color: #333; font-size: 1.15rem; font-weight: 700;">${c.nome}</h4>
					</div>
					<div style="display: flex; justify-content: space-between; align-items: flex-start;">
						<div style="flex: 1;">
							<p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.9rem;"><i class="fas fa-phone" style="color: #667eea; width: 20px;"></i> ${c.telefone}</p>
							${c.email ? `<p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.9rem;"><i class="fas fa-envelope" style="color: #667eea; width: 20px;"></i> ${c.email}</p>` : ''}
							<p style="margin: 0; color: #666; font-size: 0.9rem;"><i class="fas fa-map-marker-alt" style="color: #667eea; width: 20px;"></i> ${c.endereco}</p>
						</div>
						<div style="display: flex; gap: 0.5rem; align-items: center;">
							<button onclick="window.dashboardApp.editClient(${c.id})" style="padding: 0.5rem 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;" title="Editar">
								<i class="fas fa-edit"></i>
							</button>
							<button onclick="window.dashboardApp.deleteClient(${c.id})" style="padding: 0.5rem 0.75rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;" title="Deletar">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</div>
				</div>
			`).join('');
			container.innerHTML = actionBar + list;
		}
	}
	// ==================== PRODUTOS ====================
	async openAddProductModal() {
	const modal = this.createModal('modal-add-product', '', false);
	modal.querySelector('.modal-content-wrapper').innerHTML = `
			<div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
				<span style="width: 50px; height: 50px; background: linear-gradient(135deg, #f5576c, #ff6b9d); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-cookie-bite"></i></span>
				<span style="font-size: 1.35rem; font-weight: 700; color: #333;">${this.t('modal.add_product')}</span>
				<button onclick="closeModal('modal-add-product')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
			</div>
			<div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
			<form id="form-add-product" class="form-modal">
				<div class="form-group">
					<label for="product-nome">${this.t('modal.product_name')} *</label>
					<input type="text" id="product-nome" required class="form-control" placeholder="${this.t('placeholder.enter_name')}">
				</div>
				<div class="form-group">
					<label for="product-categoria">Categoria *</label>
					<input type="text" id="product-categoria" required class="form-control" placeholder="Ex: Bolo, Torta, Docinho">
				</div>
				<div class="form-group">
					<label for="product-preco">${this.t('modal.product_price')} *</label>
					<input type="text" id="product-preco" required class="form-control" inputmode="decimal" pattern="^\\d+(\\,|\\.)?\\d{0,2}$" placeholder="${this.t('placeholder.enter_price')}">
				</div>
				<div class="form-group">
					<label for="product-estoque">${this.t('modal.product_stock')} *</label>
					<input type="number" id="product-estoque" required class="form-control" min="0" step="1" placeholder="${this.t('placeholder.enter_stock')}">
				</div>
				<div class="form-group">
					<label for="product-ativo">Produto Ativo?</label>
					<select id="product-ativo" class="form-control">
						<option value="true" selected>Sim</option>
						<option value="false">Não</option>
					</select>
				</div>
				<div class="form-group">
					<label for="product-preparo">Status do Produto *</label>
					<select id="product-preparo" class="form-control" required>
						<option value="pronta_entrega">Pronta Entrega</option>
						<option value="sob_encomenda">Sob Encomenda</option>
					</select>
				</div>
				<div class="form-group">
					<label for="product-descricao">${this.t('modal.product_description')}</label>
					<textarea id="product-descricao" class="form-control" rows="2" placeholder="Descrição do produto"></textarea>
				</div>
				<div class="form-group">
					<label for="product-fotos">Fotos do Produto (máx. 5)</label>
					<input type="file" id="product-fotos" class="form-control" accept="image/*" multiple max="5">
					<div id="preview-fotos" style="display: flex; gap: 0.5rem; margin-top: 0.5rem;"></div>
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-add-product')" class="btn btn-secondary">${this.t('btn.cancel')}</button>
					<button type="submit" class="btn btn-primary">${this.t('btn.save')}</button>
				</div>
			</form>
		`;

		// Carrossel de fotos preview
		const fotosInput = modal.querySelector('#product-fotos');
		const previewFotos = modal.querySelector('#preview-fotos');
		fotosInput.addEventListener('change', (e) => {
			previewFotos.innerHTML = '';
			const files = Array.from(e.target.files).slice(0, 5);
			files.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (ev) => {
					const img = document.createElement('img');
					img.src = ev.target.result;
					img.style.width = '60px';
					img.style.height = '60px';
					img.style.objectFit = 'cover';
					img.style.borderRadius = '4px';
					previewFotos.appendChild(img);
				};
				reader.readAsDataURL(file);
			});
		});

		modal.querySelector('#form-add-product').addEventListener('submit', async (e) => {
			e.preventDefault();
			const nome = modal.querySelector('#product-nome').value.trim();
			const categoria = modal.querySelector('#product-categoria').value.trim();
			let precoStr = modal.querySelector('#product-preco').value.trim();
			precoStr = precoStr.replace(',', '.');
			const preco = parseFloat(precoStr);
			const estoque = parseInt(modal.querySelector('#product-estoque').value);
			const ativo = modal.querySelector('#product-ativo').value === 'true';
			const status_produto = modal.querySelector('#product-preparo').value;
			const descricao = modal.querySelector('#product-descricao').value.trim();
			const fotosInput = modal.querySelector('#product-fotos');
			const fotosFiles = fotosInput ? Array.from(fotosInput.files).slice(0, 5) : [];
			if (!nome || !categoria || isNaN(preco) || isNaN(estoque) || !status_produto) {
				alert('Preencha todos os campos obrigatórios');
				return;
			}
			// Salvar fotos como base64 (para exemplo, ideal: upload para storage)
			const fotos = [];
			for (const file of fotosFiles) {
				const reader = new FileReader();
				const base64 = await new Promise(resolve => {
					reader.onload = (ev) => resolve(ev.target.result);
					reader.readAsDataURL(file);
				});
				fotos.push(base64);
			}
			const productData = {
				nome,
				categoria,
				preco,
				estoque,
				ativo,
				status_produto,
				descricao,
				fotos: JSON.stringify(fotos)
			};
			const result = await this.saveToSupabase('produtos', productData);
			if (result) this.products.unshift(result);
			await this.loadData();
			this.renderProdutosPage();
			this.renderEstoquePage();
			this.updateStats();
			closeModal('modal-add-product');
		});
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
	}

	renderProdutosPage() {
		const container = document.getElementById('produtos-container');
		if (!container) return;
		container.style.display = '';
		container.style.flexDirection = '';
		container.style.gap = '';

		const actionBar = `
			<button onclick="window.dashboardApp.openAddProductModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(255,107,157,0.3);">
				<i class="fas fa-plus"></i> Novo Produto
			</button>
		`;

		if (this.products.length === 0) {
			container.innerHTML = actionBar + `<p style="text-align: center; padding: 3rem; color: #888;">Nenhum produto cadastrado</p>`;
		} else {
			const list = this.products.map(p => {
				const fotos = p.fotos ? JSON.parse(p.fotos) : [];
				const carrossel = fotos.length > 0 ? `
					<div style="position: relative; width: 220px; height: 220px; border-radius: 10px; overflow: hidden; margin-bottom: 1rem; background: #f0f0f0;">
						<div id="carousel-${p.id}" style="display: flex; transition: transform 0.3s ease;">
							${fotos.map((foto, i) => `<img src="${foto}" style="min-width: 100%; height: 220px; object-fit: cover;">`).join('')}
						</div>
						${fotos.length > 1 ? `
							<button onclick="window.dashboardApp.prevPhoto(${p.id}, ${fotos.length})" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer;">‹</button>
							<button onclick="window.dashboardApp.nextPhoto(${p.id}, ${fotos.length})" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer;">›</button>
						` : ''}
					</div>
				` : '';

				return `
					<div style="background: white; padding: 1.25rem; border-radius: 10px; margin-bottom: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #f5576c;">
						<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
							<div style="background: linear-gradient(135deg, #f5576c, #ff6b9d); border-radius: 8px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
								<i class="fas fa-cookie-bite" style="color: #fff; font-size: 1.5rem;"></i>
							</div>
							<h4 style="margin: 0; color: #333; font-size: 1.15rem; font-weight: 700;">${p.nome}</h4>
						</div>
						${carrossel}
						<div style="display: flex; justify-content: space-between; align-items: flex-start;">
							<div style="flex: 1;">
								<p style="margin: 0; color: #28a745; font-size: 1.3rem; font-weight: 700;">${this.formatCurrency(p.preco)}</p>
								<p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">📦 Estoque: <strong>${p.estoque}</strong></p>
								${p.descricao ? `<p style="margin: 0.5rem 0 0 0; color: #888; font-size: 0.85rem;">${p.descricao}</p>` : ''}
							</div>
							<div style="display: flex; gap: 0.5rem; align-items: center;">
								<button onclick="window.dashboardApp.editProduct(${p.id})" style="padding: 0.5rem 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
									<i class="fas fa-edit"></i>
								</button>
								<button onclick="window.dashboardApp.deleteProduct(${p.id})" style="padding: 0.5rem 0.75rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
									<i class="fas fa-trash"></i>
								</button>
							</div>
						</div>
					</div>
				`;
			}).join('');
			container.innerHTML = actionBar + list;
		}
	}

	nextPhoto(productId, totalPhotos) {
		const carousel = document.getElementById(`carousel-${productId}`);
		if (!carousel) return;
		
		const current = parseInt(carousel.dataset.current || 0);
		const next = (current + 1) % totalPhotos;
		carousel.style.transform = `translateX(-${next * 100}%)`;
		carousel.dataset.current = next;
	}

	prevPhoto(productId, totalPhotos) {
		const carousel = document.getElementById(`carousel-${productId}`);
		if (!carousel) return;
		
		const current = parseInt(carousel.dataset.current || 0);
		const prev = current === 0 ? totalPhotos - 1 : current - 1;
		carousel.style.transform = `translateX(-${prev * 100}%)`;
		carousel.dataset.current = prev;
	}

	renderPedidosPage() {
		const container = document.getElementById('pedidos-container');
		if (!container) return;

		if (!this.cart) this.cart = {};
		let cartTotal = 0;
		Object.values(this.cart).forEach(item => {
			cartTotal += item.quantidade * item.preco;
		});

		// Cria ou remove carrinho centralizado no header conforme o contador
		const header = document.querySelector('header.header');
	// O contador do carrinho só soma produtos com quantidade > 0 e adicionado: true
	let cartCount = Object.values(this.cart).filter(item => item.quantidade > 0 && item.adicionado).reduce((acc, item) => acc + item.quantidade, 0);
		let headCart = document.getElementById('head-cart');
		if (headCart && cartCount === 0) {
			headCart.remove();
		}
		if (cartCount > 0 && header) {
			if (!headCart) {
				headCart = document.createElement('div');
				headCart.id = 'head-cart';
				headCart.style.position = 'absolute';
				headCart.style.left = '50%';
				headCart.style.top = '50%';
				headCart.style.transform = 'translate(-50%, -50%)';
				headCart.style.background = '#fff';
				headCart.style.borderRadius = '50%';
				headCart.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
				headCart.style.width = '32px';
				headCart.style.height = '32px';
				headCart.style.display = 'flex';
				headCart.style.flexDirection = 'column';
				headCart.style.alignItems = 'center';
				headCart.style.justifyContent = 'center';
				headCart.style.cursor = 'pointer';
				headCart.onclick = () => window.dashboardApp.abrirFinalizarPedidoModal();
				header.appendChild(headCart);
			}
			headCart.innerHTML = `
				<i class='fas fa-shopping-cart' style='font-size: 1rem; color: #ff6b9d; position: relative;'></i>
				<span id="cart-count" style="position: absolute; top: -4px; right: -4px; background: #dc3545; color: #fff; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.10);">${cartCount}</span>
			`;
			headCart.onclick = (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (typeof window.dashboardApp.abrirFinalizarPedidoModal === 'function') {
					window.dashboardApp.abrirFinalizarPedidoModal();
				}
			};
		}

		// Mensagem aparece no marketplace, carrinho flutuante no topo
		const showCart = Object.values(this.cart).some(item => item.quantidade > 0);
		let cartMessageHtml = '';
		if (showCart) {
			cartMessageHtml = `
				<div id="cart-message" style="width: 100%; text-align: center; margin: 1.2rem 0 0 0;">
					<div style="display: inline-flex; align-items: center; gap: 0.7rem; background: #ff6b9d; color: white; border-radius: 16px; padding: 0.7rem 2rem; font-weight: 600; font-size: 1.1rem;">
						Clique no carrinho para fechar o pedido
					</div>
				</div>
			`;
		}

		container.innerHTML = `
			<div id="produtos-marketplace" style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
				${this.products.map(produto => {
					let fotos = [];
					if (produto.fotos) {
						try { fotos = JSON.parse(produto.fotos); } catch {}
					}
					return `
						<div style="background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 1.2rem; max-width: 320px; width: 100%; display: flex; flex-direction: column; align-items: center;">
							<div style="position: relative; width: 220px; height: 220px; border-radius: 10px; overflow: hidden; background: #f0f0f0; margin-bottom: 0.7rem;">
								<div id="market-carousel-${produto.id}" style="display: flex; transition: transform 0.3s ease;">
									${fotos.map((foto, i) => `<img src="${foto}" style="min-width: 100%; height: 220px; object-fit: cover;">`).join('')}
								</div>
								${fotos.length > 1 ? `
									<button data-action="prev-produto-photo" data-id="${produto.id}" data-total="${fotos.length}" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">‹</button>
									<button data-action="next-produto-photo" data-id="${produto.id}" data-total="${fotos.length}" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">›</button>
								` : ''}
							</div>
							<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
								<span style="font-size: 1.2rem; font-weight: 700; color: #ff6b9d;">${this.formatCurrency(produto.preco)}</span>
							</div>
							<div style="display: flex; align-items: center; justify-content: center; gap: 1rem; width: 100%; margin-bottom: 0.5rem;">
								<button data-action="decrement-produto" data-id="${produto.id}" style="background: #eee; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer;">-</button>
								<span id="contador-produto-${produto.id}" style="font-size: 1.2rem; font-weight: 600; min-width: 32px; text-align: center;">${this.cart[produto.id]?.quantidade || 0}</span>
								<button data-action="increment-produto" data-id="${produto.id}" data-preco="${produto.preco}" style="background: #eee; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer;">+</button>
							</div>
							<button data-action="adicionar-carrinho" data-id="${produto.id}" data-preco="${produto.preco}" style="width: 100%; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; padding: 0.8rem 0; font-size: 1.1rem; font-weight: 700; cursor: pointer; margin-bottom: 0.5rem;">Adicionar ao Carrinho</button>
						</div>
					`;
				}).join('')}
			</div>
			${cartMessageHtml}
			<div style="width: 100%; text-align: center; margin: 2rem 0 0 0;">
				<span style="font-size: 1.3rem; font-weight: 700; color: #28a745;">Total do Carrinho: ${this.formatCurrency(cartTotal)}</span>
			</div>
		`;
		this.setupPedidosEventDelegation();
	}

	setupPedidosEventDelegation() {
		const marketContainer = document.getElementById('produtos-marketplace');
		if (!marketContainer) return;
		if (marketContainer._delegationAttached) return;
		marketContainer.addEventListener('click', (e) => {
			const btn = e.target.closest('button[data-action]');
			if (!btn) return;
			const action = btn.getAttribute('data-action');
			const produtoId = btn.getAttribute('data-id');
			const preco = btn.getAttribute('data-preco');
			const total = btn.getAttribute('data-total');
			switch (action) {
				case 'prev-produto-photo':
					this.prevProdutoPhoto(produtoId, parseInt(total));
					break;
				case 'next-produto-photo':
					this.nextProdutoPhoto(produtoId, parseInt(total));
					break;
				case 'increment-produto':
					this.incrementProdutoCarrinho(produtoId, parseFloat(preco));
					break;
				case 'decrement-produto':
					this.decrementProdutoCarrinho(produtoId);
					break;
				case 'adicionar-carrinho':
					this.adicionarAoCarrinho(produtoId, parseFloat(preco));
					break;
			}
		});
		marketContainer._delegationAttached = true;
	}
	abrirFinalizarPedidoModal() {
		// Modal para finalizar pedido com lista de produtos
		const modal = this.createModal('modal-finalizar-pedido', '🛒 Finalizar Pedido');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: '2000'
		});
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		// Produtos do carrinho
		const produtosCarrinho = Object.entries(this.cart)
			.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado)
			.map(([id, item]) => {
				const produto = this.products.find(p => p.id == id);
				return produto ? `<li style="margin-bottom: 0.5rem; font-size: 1rem; color: #333; background: #f8f9fa; border-radius: 8px; padding: 0.5rem 1rem; display: flex; justify-content: space-between; align-items: center;">
					<span>${produto.nome}</span>
					<span style="font-weight: bold; color: #dc3545;">x${item.quantidade}</span>
					<span style="color: #28a745; font-weight: 600;">${this.formatCurrency(item.preco * item.quantidade)}</span>
				</li>` : '';
			}).join('');
		// Modal HTML
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 430px; width: 100%; padding: 2.2rem 1.7rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem;">
				<div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
					<span style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff6b9d, #ffa726); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-shopping-cart"></i></span>
					<span style="font-size: 1.35rem; font-weight: 700; color: #333;">Finalizar Pedido</span>
					<button onclick="closeModal('modal-finalizar-pedido')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
				<form id="form-finalizar-pedido" style="display: flex; flex-direction: column; gap: 1.3rem; width: 100%;">
					<div style="padding: 1.25rem 1rem; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
						<h4 style="margin: 0 0 1rem 0; font-size: 1.08rem; color: #764ba2;">Produtos no Carrinho</h4>
						<ul style="list-style: none; padding: 0; margin: 0;">
							${produtosCarrinho}
						</ul>
					</div>
					<div style="padding: 1.25rem 1rem; border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
						<h4 style="margin: 0 0 1rem 0; font-size: 1.08rem;">Selecione o Cliente</h4>
						<select id="finalizar-cliente" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1.02rem;">
							<option value="">-- Escolha um cliente --</option>
							${this.clients.map(c => `<option value="${c.id}">${c.nome} - ${c.telefone}</option>`).join('')}
						</select>
					</div>
					<div style="padding: 1.25rem 1rem; border-radius: 10px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
						<h4 style="margin: 0 0 1rem 0; font-size: 1.08rem;">Forma de Pagamento</h4>
						<select id="finalizar-pagamento" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1.02rem;">
							<option value="">-- Escolha o pagamento --</option>
							<option value="dinheiro">Dinheiro</option>
							<option value="transferencia">Transferência</option>
						</select>
						<div style="margin-top: 1rem; text-align: left;">
							<label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500; color: #fff;">
								<input type="checkbox" id="finalizar-full-payment" checked style="accent-color: #f5576c; width: 18px; height: 18px;"> Pagamento total?
							</label>
							<div id="finalizar-sinal-group" style="display: none; margin-top: 0.5rem;">
								<label for="finalizar-sinal" style="color: #fff; font-weight: 500;">Valor do sinal:</label>
								<div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
									<span style="color: #fff; font-weight: 600;">CAD$</span>
									<input type="text" id="finalizar-sinal" inputmode="decimal" pattern="^\\d+(\\.|\\,)\\d{0,2}$" style="width: 100%; padding: 0.5rem; border-radius: 6px; border: none;">
								</div>
								<p id="finalizar-restante" style="margin: 0.5rem 0 0 0; color: #fff; font-size: 0.95rem;"></p>
							</div>
						</div>
					</div>
					<div style="padding: 1.25rem 1rem; border-radius: 10px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
						<h4 style="margin: 0 0 1rem 0; font-size: 1.08rem;">Tipo de Entrega</h4>
						<select id="finalizar-entrega" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1.02rem;">
							<option value="">-- Escolha a entrega --</option>
							<option value="retirada">Retirada</option>
							<option value="entrega">Entrega</option>
						</select>
					</div>
					<div style="width: 100%; text-align: center; margin: 1rem 0 0 0;">
						<span style="font-size: 1.35rem; font-weight: 700; color: #28a745;">Total do Carrinho: ${this.formatCurrency(Object.entries(this.cart).filter(([_, item]) => item && item.quantidade > 0 && item.adicionado).reduce((acc, [_, item]) => acc + item.preco * item.quantidade, 0))}</span>
					</div>
					<button type="submit" style="width: 100%; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; padding: 0.8rem 0; font-size: 1.13rem; font-weight: 700; cursor: pointer; margin-bottom: 0.5rem;">Finalizar Pedido</button>
				</form>
			</div>`;
		// Evento de submit
		const finalizarForm = document.getElementById('form-finalizar-pedido');
		if (finalizarForm) {
			// Pagamento total/sinal
			const fullPaymentCheckbox = document.getElementById('finalizar-full-payment');
			const sinalGroup = document.getElementById('finalizar-sinal-group');
			const sinalInput = document.getElementById('finalizar-sinal');
			sinalInput.setAttribute('inputmode', 'decimal');
			sinalInput.setAttribute('pattern', '^\\d+(\\.|\\,)\\d{0,2}$');
			sinalInput.addEventListener('input', function(e) {
				let val = e.target.value.replace(',', '.');
				// Permite apenas números e ponto, e no máximo duas casas decimais
				val = val.replace(/[^\d.]/g, '');
				if ((val.match(/\./g) || []).length > 1) {
					val = val.replace(/\.+$/, '');
				}
				if (val.includes('.')) {
					const [intPart, decPart] = val.split('.');
					val = intPart + '.' + (decPart ? decPart.slice(0,2) : '');
				}
				e.target.value = val;
			});
			const restanteLabel = document.getElementById('finalizar-restante');
			fullPaymentCheckbox.addEventListener('change', () => {
				if (fullPaymentCheckbox.checked) {
					sinalGroup.style.display = 'none';
				} else {
					sinalGroup.style.display = 'block';
					updateRestante();
				}
			});
			sinalInput.addEventListener('input', updateRestante);
			function updateRestante() {
				const total = Object.entries(window.dashboardApp.cart).filter(([_, item]) => item && item.quantidade > 0 && item.adicionado).reduce((acc, [_, item]) => acc + item.preco * item.quantidade, 0);
				const sinal = parseFloat(sinalInput.value) || 0;
				const restante = total - sinal;
				restanteLabel.textContent = restante > 0 ? `Valor restante na entrega: ${window.dashboardApp.formatCurrency(restante)}` : '';
			}
			finalizarForm.addEventListener('submit', (e) => {
				e.preventDefault();
				// Aqui você pode implementar a lógica de salvar o pedido no banco
				closeModal('modal-finalizar-pedido');
				if (document.getElementById('cart-message')) document.getElementById('cart-message').remove();
				this.cart = {};
				this.renderPedidosPage();
			});
		}
	}
	incrementProdutoCarrinho(produtoId, preco) {
		if (!this.cart) this.cart = {};
		if (!this.cart[produtoId]) this.cart[produtoId] = { quantidade: 0, preco };
		this.cart[produtoId].quantidade++;
		this.renderPedidosPage();
	}

	decrementProdutoCarrinho(produtoId) {
		if (!this.cart || !this.cart[produtoId]) return;
		if (this.cart[produtoId].quantidade > 0) this.cart[produtoId].quantidade--;
		this.renderPedidosPage();
	}

	adicionarAoCarrinho(produtoId, preco) {
		if (!this.cart) this.cart = {};
		if (!this.cart[produtoId]) this.cart[produtoId] = { quantidade: 1, preco, adicionado: true };
		else {
			this.cart[produtoId].quantidade = Math.max(1, this.cart[produtoId].quantidade);
			this.cart[produtoId].adicionado = true;
		}
		this.renderPedidosPage();
	}

	prevProdutoPhoto(produtoId, totalPhotos) {
		const carousel = document.getElementById(`market-carousel-${produtoId}`);
		if (!carousel) return;
		const current = parseInt(carousel.dataset.current || 0);
		const prev = current === 0 ? totalPhotos - 1 : current - 1;
	carousel.style.transform = `translateX(-${prev * 100}%)`;
		carousel.dataset.current = prev;
	}

	nextProdutoPhoto(produtoId, totalPhotos) {
		const carousel = document.getElementById(`market-carousel-${produtoId}`);
		if (!carousel) return;
		const current = parseInt(carousel.dataset.current || 0);
		const next = (current + 1) % totalPhotos;
	carousel.style.transform = `translateX(-${next * 100}%)`;
		carousel.dataset.current = next;
	}

	nextPedidoPhoto(orderId, totalPhotos) {
		const carousel = document.getElementById(`pedido-carousel-${orderId}`);
		if (!carousel) return;
		const current = parseInt(carousel.dataset.current || 0);
		const next = (current + 1) % totalPhotos;
	carousel.style.transform = `translateX(-${next * 100}%)`;
		carousel.dataset.current = next;
	}

	prevPedidoPhoto(orderId, totalPhotos) {
		const carousel = document.getElementById(`pedido-carousel-${orderId}`);
		if (!carousel) return;
		const current = parseInt(carousel.dataset.current || 0);
		const prev = current === 0 ? totalPhotos - 1 : current - 1;
	carousel.style.transform = `translateX(-${prev * 100}%)`;
		carousel.dataset.current = prev;
	}

	renderEstoquePage() {
		const container = document.getElementById('estoque-container');
		if (!container) return;

		if (this.products.length === 0) {
			container.innerHTML = `<p style="text-align: center; padding: 3rem; color: #888;">Nenhum produto cadastrado</p>`;
		} else {
			const list = this.products.map(p => {
				const color = p.estoque > 10 ? '#28a745' : p.estoque > 5 ? '#FFC107' : '#dc3545';
				const percentage = Math.min((p.estoque / 50) * 100, 100);
				return `
				<div style="background: white; padding: 1.25rem; border-radius: 10px; margin-bottom: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
						<h4 style="margin: 0; color: #333;">${p.nome}</h4>
						<span style="background: ${color}; color: white; padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${p.estoque}</span>
					</div>
					<div style="background: #e9ecef; border-radius: 10px; height: 14px; overflow: hidden; margin-bottom: 0.75rem;">
						<div style="background: ${color}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
					</div>
					<button onclick="window.dashboardApp.adjustStock(${p.id})" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
						<i class="fas fa-edit"></i> Ajustar Estoque
					</button>
				</div>
			`;
			}).join('');
			container.innerHTML = list;
		}
	}

	async adjustStock(id) {
		const product = this.products.find(p => p.id === id);
		if (!product) return;

		const newStock = prompt(
			`Ajustar estoque de "${product.nome}"\nEstoque atual: ${product.estoque}`,
			product.estoque
		);

		if (newStock !== null && !isNaN(newStock) && parseInt(newStock) >= 0) {
			await this.saveToSupabase('produtos', { estoque: parseInt(newStock) }, id);
			product.estoque = parseInt(newStock);
			this.renderEstoquePage();
			this.renderProdutosPage();
			this.updateStats();
		}
	}

	renderEntregasPage() {
		const container = document.getElementById('entregas-container');
		if (!container) return;

		const today = new Date().toISOString().split('T')[0];
		const entregas = this.orders.filter(o => o.data_entrega && o.status !== 'cancelado');

		if (entregas.length === 0) {
			container.innerHTML = `<p style="text-align: center; padding: 3rem; color: #888;">Nenhuma entrega agendada</p>`;
		} else {
			const list = entregas.map(o => {
				const isToday = o.data_entrega === today;
				const isPast = o.data_entrega < today;
				const bgColor = isToday ? '#fff3cd' : isPast ? '#f8d7da' : 'white';
				const borderColor = isToday ? '#FFC107' : isPast ? '#dc3545' : '#17a2b8';
				
				return `
				<div style="background: ${bgColor}; padding: 1.25rem; border-radius: 10px; margin-bottom: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid ${borderColor};">
					<div style="display: flex; justify-content: space-between; align-items: start;">
						<div style="flex: 1;">
							<h4 style="margin: 0 0 0.75rem 0; color: #333;">
								🚚 Entrega #${o.id} 
								${isToday ? '<span style="background: #FFC107; color: white; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.75rem; margin-left: 0.5rem;">HOJE</span>' : ''}
								${isPast ? '<span style="background: #dc3545; color: white; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.75rem; margin-left: 0.5rem;">ATRASADO</span>' : ''}
							</h4>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>👤</strong> ${o.cliente_nome}</p>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>📦</strong> ${o.produto_nome}</p>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>📅</strong> ${this.formatDate(o.data_entrega)}</p>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>🕐</strong> ${o.horario_entrega || 'Não informado'}</p>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>📍</strong> ${o.endereco_entrega}</p>
							<span style="display: inline-block; margin-top: 0.5rem; background: ${this.getStatusColor(o.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">${o.status.toUpperCase()}</span>
						</div>
						<div style="display: flex; flex-direction: column; gap: 0.5rem;">
							${o.status !== 'entregue' ? `
								<button onclick="window.dashboardApp.markAsDelivered(${o.id})" style="padding: 0.5rem 0.75rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap;">
									<i class="fas fa-check"></i> Entregue
								</button>
							` : ''}
							<button onclick="window.dashboardApp.viewOrder(${o.id})" style="padding: 0.5rem 0.75rem; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer;">
								<i class="fas fa-eye"></i> Ver
							</button>
						</div>
					</div>
				</div>
			`;
			}).join('');
			container.innerHTML = list;
		}
	}
}

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', async () => {
	try {
		const app = new DashboardApp();
		const initialized = await app.initialize();
		if (initialized) {
			window.dashboardApp = app;
		}
	} catch (error) {
		console.error('Erro ao inicializar aplicação:', error);
	}
});
