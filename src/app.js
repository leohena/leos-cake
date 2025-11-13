// Modal de cadastro de novo usuário
window.showUsuariosModal = async function() {
	let modal = document.getElementById('modal-usuarios');
	if (!modal) {
		modal = window.dashboardApp.createModal('modal-usuarios', 'Gerenciar Usuários', true);
		// Aumenta a largura do modal
		const wrapper = modal.querySelector('.modal-content-wrapper');
		if (wrapper) {
			wrapper.style.maxWidth = '1200px';
		}
	}
	const contentWrapper = modal.querySelector('.modal-content-wrapper');
	if (contentWrapper) {
		contentWrapper.innerHTML = `
			<div id="usuarios-table-container"></div>
			<div style="display:flex;align-items:center;gap:8px;margin-top:1rem;justify-content:flex-end;">
				<button id="add-user-btn" class="btn btn-primary">Adicionar Novo Usuário</button>
				<button id="reset-all-btn" class="btn btn-warning">Senha padrão</button>
				<button id="edit-all-btn" class="btn btn-secondary">Editar</button>
				<button id="delete-all-btn" class="btn btn-danger">Excluir</button>
			</div>
		`;
	}
	// Função para atualizar tabela após cada ação
	async function refreshUsuariosTable() {
		closeModal('modal-usuarios');
		await window.showUsuariosModal();
	}
	let modalsContainer = document.getElementById('modals-container');
	if (!modalsContainer) {
		modalsContainer = document.createElement('div');
		modalsContainer.id = 'modals-container';
		document.body.appendChild(modalsContainer);
	}
	modalsContainer.appendChild(modal);
	setTimeout(() => modal.classList.add('show'), 10);

	// Carregar usuários da tabela
	const supabase = window.authSystem?.supabaseClient;
	if (!supabase) return;
	const { data: usuarios, error } = await supabase.from('usuarios').select('*');
	const tableContainer = modal.querySelector('#usuarios-table-container');
	if (error || !usuarios) {
		tableContainer.innerHTML = '<p style="color:#dc3545;">Erro ao carregar usuários.</p>';
		return;
	}
	if (usuarios.length === 0) {
		tableContainer.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
		return;
	}
	tableContainer.innerHTML = `<table style="width:100%;border-collapse:collapse;">
		<thead>
			<tr style="background:#f5f5f5;">
				<th style="padding:8px;border:1px solid #eee;">Foto</th>
				<th style="padding:8px;border:1px solid #eee;">Nome</th>
				<th style="padding:8px;border:1px solid #eee;">Email</th>
				<th style="padding:8px;border:1px solid #eee;">Tipo</th>
				<th style="padding:8px;border:1px solid #eee;">Telefone</th>
				<th style="padding:8px;border:1px solid #eee;">Endereço</th>
			</tr>
		</thead>
		<tbody>
			${usuarios.map(u => `
				<tr>
					<td style="padding:8px;border:1px solid #eee;text-align:center;">
						${u.foto_url ? `<img src="${u.foto_url}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">` : '<span style="color:#aaa;font-size:1.5rem;"><i class="fas fa-user"></i></span>'}
					</td>
					<td style="padding:8px;border:1px solid #eee;">${u.nome}</td>
					<td style="padding:8px;border:1px solid #eee;">${u.email}</td>
					<td style="padding:8px;border:1px solid #eee;">${u.role || u.tipo || ''}</td>
					<td style="padding:8px;border:1px solid #eee;">${u.telefone || ''}</td>
					<td style="padding:8px;border:1px solid #eee;">${u.endereco || ''}</td>
				</tr>
			`).join('')}
		</tbody>
	</table>`;

	// Funções de ação em lote (exemplo: senha padrão para todos)
	modal.querySelector('#reset-all-btn').onclick = async function() {
		const supabase = window.authSystem?.supabaseClient;
		if (!supabase) return alert('Supabase não inicializado');
		const senhaPadrao = '123456';
		const password_hash = btoa(senhaPadrao);
		const { error } = await supabase.from('usuarios').update({ password_hash });
		if (error) {
			alert('Erro ao redefinir senhas: ' + (error.message || error));
		} else {
			alert('Todas as senhas foram redefinidas para padrão: ' + senhaPadrao);
			await refreshUsuariosTable();
		}
	};
	// Funções de editar e excluir em lote (apenas alertas por enquanto)
	modal.querySelector('#edit-all-btn').onclick = async function() {
		alert('Função editar em lote em breve');
		await refreshUsuariosTable();
	};
	modal.querySelector('#delete-all-btn').onclick = async function() {
		alert('Função excluir em lote em breve');
		await refreshUsuariosTable();
	};
	// Botão adicionar novo usuário
	modal.querySelector('#add-user-btn').onclick = function() {
		closeModal('modal-usuarios');
		window.showAddUserModal?.();
	};

	// Botão para adicionar novo usuário
	modal.querySelector('#add-user-btn').onclick = function() {
		closeModal('modal-usuarios');
		window.showAddUserModal?.();
	};
};

// Modal de cadastro de novo usuário separado
window.showAddUserModal = function() {
	let modal = document.getElementById('modal-add-user');
	if (!modal) {
		modal = window.dashboardApp.createModal('modal-add-user', 'Cadastrar Novo Usuário', true);
	}
	const contentWrapper = modal.querySelector('.modal-content-wrapper');
	if (contentWrapper) {
		contentWrapper.innerHTML = `
			<form id="form-add-user" class="form-modal">
				<div class="form-group">
					<label for="add-nome">Nome *</label>
					<input type="text" id="add-nome" required class="form-control" value="">
				</div>
				<div class="form-group">
					<label for="add-email">Email *</label>
					<input type="email" id="add-email" required class="form-control" value="">
				</div>
				<div class="form-group">
					<label for="add-role">Tipo</label>
					<select id="add-role" class="form-control">
						<option value="user">Usuário</option>
						<option value="admin">Administrador</option>
						<option value="sale">Vendedor</option>
					</select>
				</div>
				<div class="form-group">
					<label for="add-telefone">Telefone</label>
					<input type="tel" id="add-telefone" class="form-control" value="">
				</div>
				<div class="form-group">
					<label for="add-endereco">Endereço</label>
					<textarea id="add-endereco" class="form-control" rows="2"></textarea>
				</div>
				<div class="form-group">
					<label for="add-foto">Foto</label>
					<input type="file" id="add-foto" accept="image/*" class="form-control">
					<img src="" id="add-foto-preview" style="max-width:80px;max-height:80px;margin-top:8px;display:none;">
				</div>
				<div class="form-group">
					<label for="add-password">Senha *</label>
					<input type="password" id="add-password" required class="form-control" autocomplete="new-password">
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-add-user')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Cadastrar</button>
				</div>
			</form>
		`;
	}
	let modalsContainer = document.getElementById('modals-container');
	if (!modalsContainer) {
		modalsContainer = document.createElement('div');
		modalsContainer.id = 'modals-container';
		document.body.appendChild(modalsContainer);
	}
	modalsContainer.appendChild(modal);
	setTimeout(() => modal.classList.add('show'), 10);

	// Preview da foto
	const fotoInput = modal.querySelector('#add-foto');
	const fotoPreview = modal.querySelector('#add-foto-preview');
	if (fotoInput && fotoPreview) {
		fotoInput.onchange = function(e) {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = function(ev) {
					fotoPreview.src = ev.target.result;
					fotoPreview.style.display = '';
				};
				reader.readAsDataURL(file);
			}
		};
	}

	// Submit do formulário
	modal.querySelector('#form-add-user').addEventListener('submit', async (e) => {
		e.preventDefault();
		const nome = modal.querySelector('#add-nome').value.trim();
		const email = modal.querySelector('#add-email').value.trim();
		const role = modal.querySelector('#add-role').value;
		const telefone = modal.querySelector('#add-telefone').value.trim();
		const endereco = modal.querySelector('#add-endereco').value.trim();
		let foto_url = '';
		const fotoFile = fotoInput?.files[0];
		if (fotoFile) {
			const reader = new FileReader();
			foto_url = await new Promise(resolve => {
				reader.onload = e => resolve(e.target.result);
				reader.readAsDataURL(fotoFile);
			});
		}
		const password = modal.querySelector('#add-password').value;
		if (!nome || !email || !password) {
			alert('Preencha todos os campos obrigatórios!');
			return;
		}
		// Cadastrar usuário na tabela 'usuarios' do Supabase
		try {
			const supabase = window.authSystem?.supabaseClient;
			if (!supabase) throw new Error('Supabase não inicializado');
			const username = email;
			const password_hash = btoa(password);
			const basicUser = {
				nome, email, username, role, telefone, endereco, foto_url, ativo: true, password_hash
			};
			console.log('Cadastro usuário:', basicUser);
			const { data, error } = await supabase.from('usuarios').insert([basicUser]);
			if (error) throw error;
			alert('Usuário cadastrado com sucesso!');
			closeModal('modal-add-user');
		} catch (err) {
			alert('Erro ao cadastrar usuário: ' + (err.message || err));
		}
	});
};
// Modal de edição/cadastro de usuário completo
window.showConfigModal = function() {
	const user = window.authSystem?.currentUser || {};
	let modal = document.getElementById('modal-config-user');
	if (!modal) {
		modal = window.dashboardApp.createModal('modal-config-user', 'Editar Perfil', true);
	}
	const contentWrapper = modal.querySelector('.modal-content-wrapper');
	if (contentWrapper) {
		contentWrapper.innerHTML = `
			<form id="form-config-user" class="form-modal">
				<div class="form-group">
					<label for="config-nome">Nome *</label>
					<input type="text" id="config-nome" required class="form-control" value="${user.nome || ''}">
				</div>
				<div class="form-group">
					<label for="config-email">Email *</label>
					<input type="email" id="config-email" required class="form-control" value="${user.email || ''}" disabled>
				</div>
				<div class="form-group">
					<label for="config-role">Tipo</label>
					<select id="config-role" class="form-control">
						<option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuário</option>
						<option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
						<option value="sale" ${user.role === 'sale' || user.role === 'vendedor' ? 'selected' : ''}>Vendedor</option>
					</select>
				</div>
				<div class="form-group">
					<label for="config-telefone">Telefone</label>
					<input type="tel" id="config-telefone" class="form-control" value="${user.telefone || ''}">
				</div>
				<div class="form-group">
					<label for="config-endereco">Endereço</label>
					<textarea id="config-endereco" class="form-control" rows="2">${user.endereco || ''}</textarea>
				</div>
				<div class="form-group">
					<label for="config-foto">Foto</label>
					<input type="file" id="config-foto" accept="image/*" class="form-control">
					<img src="${user.foto_url || ''}" id="config-foto-preview" style="max-width:80px;max-height:80px;margin-top:8px;${user.foto_url ? '' : 'display:none;'}">
				</div>
				<div class="form-group">
					<label for="config-password">Nova Senha</label>
					<input type="password" id="config-password" class="form-control" autocomplete="new-password">
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-config-user')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Salvar</button>
				</div>
			</form>
		`;
	}
	let modalsContainer = document.getElementById('modals-container');
	if (!modalsContainer) {
		modalsContainer = document.createElement('div');
		modalsContainer.id = 'modals-container';
		document.body.appendChild(modalsContainer);
	}
	modalsContainer.appendChild(modal);
	setTimeout(() => modal.classList.add('show'), 10);

	// Preview da foto
	const fotoInput = modal.querySelector('#config-foto');
	const fotoPreview = modal.querySelector('#config-foto-preview');
	if (fotoInput && fotoPreview) {
		fotoInput.onchange = function(e) {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = function(ev) {
					fotoPreview.src = ev.target.result;
					fotoPreview.style.display = '';
				};
				reader.readAsDataURL(file);
			}
		};
	}

	// Submit do formulário
	modal.querySelector('#form-config-user').addEventListener('submit', async (e) => {
		e.preventDefault();
		const nome = modal.querySelector('#config-nome').value.trim();
		const role = modal.querySelector('#config-role').value;
		const telefone = modal.querySelector('#config-telefone').value.trim();
		const endereco = modal.querySelector('#config-endereco').value.trim();
		let foto_url = user.foto_url;
		const fotoFile = fotoInput?.files[0];
		if (fotoFile) {
			const upload = await window.authSystem.uploadUserPhoto(fotoFile);
			if (upload.success) foto_url = upload.photoUrl;
		}
		const password = modal.querySelector('#config-password').value;
		let password_hash = undefined;
		if (password) password_hash = btoa(password); // Simples hash base64
		const profileData = { nome, role, telefone, endereco, foto_url };
		if (password_hash) profileData.password_hash = password_hash;
		// Atualizar no banco diretamente
		const supabase = window.authSystem?.supabaseClient;
		if (supabase && window.authSystem?.currentUser?.id) {
			const updateData = { nome, role, telefone, endereco, foto_url };
			if (password_hash) updateData.password_hash = password_hash;
			await supabase.from('usuarios').update(updateData).eq('id', window.authSystem.currentUser.id);
		}
		const result = await window.authSystem.updateUserProfile(profileData);
		if (result.success) {
			alert('Perfil atualizado com sucesso!');
			closeModal('modal-config-user');
			window.dashboardApp.setupUI();
		} else {
			alert('Erro ao atualizar perfil: ' + (result.message || ''));
		}
	});
};
		// ...existing code...
		// Exibir menus/páginas conforme perfil
		let role = '';
		if (this.currentUser && (this.currentUser.role || this.currentUser.tipo)) {
			role = (this.currentUser.role || this.currentUser.tipo || '').toLowerCase();
		}
		const menuDashboard = document.getElementById('menu-dashboard');
		const menuPedidos = document.getElementById('menu-pedidos');
		const menuEntregas = document.getElementById('menu-entregas');
		const menuEstoque = document.getElementById('menu-estoque');
		const menuClientes = document.getElementById('menu-clientes');
		const menuProdutos = document.getElementById('menu-produtos');
		const menuUsuarios = document.getElementById('menu-usuarios');
		if (role === 'sale' || role === 'vendedor') {
			if (menuDashboard) menuDashboard.style.display = '';
			if (menuPedidos) menuPedidos.style.display = '';
			if (menuEntregas) menuEntregas.style.display = '';
			if (menuEstoque) menuEstoque.style.display = 'none';
			if (menuClientes) menuClientes.style.display = 'none';
			if (menuProdutos) menuProdutos.style.display = 'none';
			if (menuUsuarios) menuUsuarios.style.display = 'none';
		} else {
			// ...para outros perfis, exibe tudo normalmente
			if (menuDashboard) menuDashboard.style.display = '';
			if (menuPedidos) menuPedidos.style.display = '';
			if (menuEntregas) menuEntregas.style.display = '';
			if (menuEstoque) menuEstoque.style.display = '';
			if (menuClientes) menuClientes.style.display = '';
			if (menuProdutos) menuProdutos.style.display = '';
			if (menuUsuarios) menuUsuarios.style.display = '';
		}
		// O código do dropdown e tooltip deve estar dentro do método renderPedidosPage
		// ...existing code...
// app.js - Dashboard com Integração Supabase Completa

class DashboardApp {
	async editClient(id) {
		console.log('editClient chamado para id:', id);
		const client = this.clients.find(c => c.id === id);
		if (!client) {
			console.warn('Cliente não encontrado:', id);
			return;
		}
		let modal = document.getElementById('modal-edit-client');
		if (!modal) {
			modal = this.createModal('modal-edit-client', 'Editar Cliente', true);
			console.log('Modal de edição criado');
		}
		const contentWrapper = modal.querySelector('.modal-content-wrapper');
		if (contentWrapper) {
			function escapeHtml(text) {
				if (!text) return '';
				return text.replace(/&/g, '&amp;')
						   .replace(/</g, '&lt;')
						   .replace(/>/g, '&gt;')
						   .replace(/"/g, '&quot;')
						   .replace(/'/g, '&#39;');
			}
			contentWrapper.innerHTML = `
			<div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
				<span style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #6dd5ed); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-user"></i></span>
				<span style="font-size: 1.35rem; font-weight: 700; color: #333;">Editar Cliente</span>
				<button onclick="closeModal('modal-edit-client')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
			</div>
			<div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
			<form id="form-edit-client" class="form-modal">
				<div class="form-group">
					<label for="edit-client-nome">Nome *</label>
					<input type="text" id="edit-client-nome" required class="form-control" value="${escapeHtml(client.nome)}">
				</div>
				<div class="form-group">
					<label for="edit-client-telefone">Telefone *</label>
					<input type="tel" id="edit-client-telefone" required class="form-control" value="${escapeHtml(client.telefone)}">
				</div>
				<div class="form-group">
					<label for="edit-client-email">Email</label>
					<input type="email" id="edit-client-email" class="form-control" value="${escapeHtml(client.email || '')}">
				</div>
				<div class="form-group">
					<label for="edit-client-endereco">Endereço *</label>
					<textarea id="edit-client-endereco" required class="form-control" rows="3">${escapeHtml(client.endereco)}</textarea>
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-edit-client')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Salvar</button>
				</div>
			</form>
		`;
		}
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		setTimeout(() => modal.classList.add('show'), 10);
		modal.querySelector('#form-edit-client').addEventListener('submit', async (e) => {
			e.preventDefault();
			const nome = modal.querySelector('#edit-client-nome').value.trim();
			const telefone = modal.querySelector('#edit-client-telefone').value.trim();
			const email = modal.querySelector('#edit-client-email').value.trim();
			const endereco = modal.querySelector('#edit-client-endereco').value.trim();
			if (!nome || !telefone || !endereco) {
				alert('Preencha todos os campos obrigatórios');
				return;
			}
			const clientData = { nome, telefone, email, endereco };
			await this.saveToSupabase('clientes', clientData, id);
			Object.assign(client, clientData);
			closeModal('modal-edit-client');
			this.renderClientesPage();
	});
	}

	async deleteClient(id) {
		if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
		await this.deleteFromSupabase('clientes', id);
		this.clients = this.clients.filter(c => c.id !== id);
		this.renderClientesPage();
	}
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

			this.currentUser = await window.authSystem.getCurrentUser();
			this.supabase = window.supabaseClient;

			// Controle de acesso: vendedor vê apenas seus pedidos e dashboard
			if (this.currentUser.tipo === 'vendedor') {
				await this.loadData();
				// Filtrar pedidos do vendedor
				this.orders = this.orders.filter(o => o.vendedor_id === this.currentUser.id);
				this.setupUI();
				this.setupEventListeners();
				this.setupLanguageSwitcher();
				this.createStatsCards();
				this.createDataCards();
				this.updateEntregasHoje();
			} else {
				// Admin vê tudo
				await this.loadData();
				this.setupUI();
				this.setupEventListeners();
				this.setupLanguageSwitcher();
				this.createStatsCards();
				this.createDataCards();
				this.updateEntregasHoje();
			}

			window.addEventListener('languageChanged', () => this.updateAllTranslations());

			this.initialized = true;
			console.log('✅ Dashboard inicializado');
			// Remover splash screen
			const splashScreen = document.getElementById('splash-screen');
			if (splashScreen) {
				const spinner = document.getElementById('splash-spinner');
				if (spinner) spinner.style.display = 'none';
				splashScreen.style.transition = 'opacity 0.5s';
				splashScreen.style.opacity = '0';
				setTimeout(() => splashScreen.style.display = 'none', 500);
			}
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
			'confirmado': '#007bff',
			'pago': '#28a745',
			'entregue': '#17a2b8',
			'cancelado': '#dc3545'
		};
		return colors[status] || '#6c757d';
	}

	setupUI() {
		// Always get role from currentUser
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();

		// Hide/show menu items
		const menuDashboard = document.getElementById('menu-dashboard');
		const menuPedidos = document.getElementById('menu-pedidos');
		const menuEntregas = document.getElementById('menu-entregas');
		const menuEstoque = document.getElementById('menu-estoque');
		const menuClientes = document.getElementById('menu-clientes');
		const menuProdutos = document.getElementById('menu-produtos');
		const menuUsuarios = document.getElementById('menu-usuarios');
		if (role === 'sale' || role === 'vendedor') {
			if (menuDashboard) menuDashboard.style.display = '';
			if (menuPedidos) menuPedidos.style.display = '';
			if (menuEntregas) menuEntregas.style.display = '';
			if (menuEstoque) menuEstoque.style.display = 'none';
			if (menuClientes) menuClientes.style.display = 'none';
			if (menuProdutos) menuProdutos.style.display = 'none';
			if (menuUsuarios) menuUsuarios.style.display = 'none';
		} else {
			if (menuDashboard) menuDashboard.style.display = '';
			if (menuPedidos) menuPedidos.style.display = '';
			if (menuEntregas) menuEntregas.style.display = '';
			if (menuEstoque) menuEstoque.style.display = '';
			if (menuClientes) menuClientes.style.display = '';
			if (menuProdutos) menuProdutos.style.display = '';
			if (menuUsuarios) menuUsuarios.style.display = '';
		}

		// Sempre inicia mostrando apenas o dashboard
		const dashboardSection = document.getElementById('dashboard-section');
		const clientesSection = document.getElementById('clientes-section');
		const produtosSection = document.getElementById('produtos-section');
		const estoqueSection = document.getElementById('estoque-section');
		const usuariosSection = document.getElementById('usuarios-section');
		if (dashboardSection) dashboardSection.style.display = 'block';
		if (clientesSection) clientesSection.style.display = 'none';
		if (produtosSection) produtosSection.style.display = 'none';
		if (estoqueSection) estoqueSection.style.display = 'none';
		if (usuariosSection) usuariosSection.style.display = 'none';

		// Filter dashboard data for vendor
		if (role === 'sale' || role === 'vendedor') {
			if (Array.isArray(this.orders) && this.currentUser?.id) {
				this.orders = this.orders.filter(o => o.vendedor_id === this.currentUser.id);
			}
		}

		// User info and dropdown
		const userNameEl = document.getElementById('dropdown-user-name');
		const userAvatarEl = document.getElementById('user-avatar');
		const welcomeName = document.getElementById('welcome-name');
		const userType = document.getElementById('dropdown-user-type');
		const usuariosBtn = document.getElementById('usuarios-btn');

		if (userNameEl) userNameEl.textContent = this.currentUser.nome;
		if (userAvatarEl) {
			userAvatarEl.src = this.currentUser.foto_url || 
				`https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.nome)}&background=ff6b9d&color=fff&size=32`;
		}
		if (welcomeName) welcomeName.textContent = this.currentUser.nome;
		if (userType) {
			if (role === 'admin') {
				userType.textContent = this.currentLang === 'pt-BR' ? 'Administrador' : 'Administrator';
				if (usuariosBtn) usuariosBtn.style.display = 'flex';
			} else if (role === 'sale' || role === 'vendedor') {
				userType.textContent = this.currentLang === 'pt-BR' ? 'Vendedor' : 'Salesperson';
				if (usuariosBtn) usuariosBtn.style.display = 'none';
			} else {
				userType.textContent = this.currentLang === 'pt-BR' ? 'Usuário' : 'User';
				if (usuariosBtn) usuariosBtn.style.display = 'none';
			}
		}

		// Dropdown events
		const profileBtn = document.getElementById('profile-btn');
		if (profileBtn) profileBtn.onclick = () => window.showConfigModal?.();
		const configBtn = document.getElementById('config-btn');
		if (configBtn) configBtn.onclick = null;
		if (usuariosBtn) usuariosBtn.onclick = () => window.showUsuariosModal?.();
		const logoutBtn = document.getElementById('logout-btn');
		if (logoutBtn) logoutBtn.onclick = () => {
			window.authSystem.logout();
			window.location.href = 'index.html';
		};

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

		// Contagem por status
		const statusCounts = {
			pendente: this.orders.filter(o => o.status === 'pendente').length,
			confirmado: this.orders.filter(o => o.status === 'confirmado').length,
			pago: this.orders.filter(o => o.status === 'pago').length,
			entregue: this.orders.filter(o => o.status === 'entregue').length,
			cancelado: this.orders.filter(o => o.status === 'cancelado').length
		};


		// Novo cálculo dos valores pagos e a receber
		let totalPago = 0;
		let totalAReceber = 0;
		this.orders.forEach(o => {
			const valorTotal = parseFloat(o.valor_total || 0);
			const sinal = parseFloat(o.valor_pago || 0); // valor_pago representa o sinal ou valor já pago
			// Se pedido está pendente e tem sinal, soma o sinal ao totalPago e o restante ao totalAReceber
			if (o.status === 'pendente' && sinal > 0 && sinal < valorTotal) {
				totalPago += sinal;
				totalAReceber += (valorTotal - sinal);
			}
			// Se pedido está pago
			else if (o.status === 'pago') {
				// Se tem pagamento parcial, soma o valor pago ao totalPago e o restante ao totalAReceber
				if (sinal > 0 && sinal < valorTotal) {
					totalPago += sinal;
					totalAReceber += (valorTotal - sinal);
				} else {
					// Pagamento total
					totalPago += valorTotal;
				}
			}
			// Se pedido está entregue, considera como totalmente pago
			else if (o.status === 'entregue') {
				totalPago += valorTotal;
			}
		});

		const stats = [
				{ icon: 'fa-cookie-bite', label: this.t('dashboard.produtos'), id: 'total-produtos', labelId: 'label-produtos', value: this.products.length },
				{ icon: 'fa-users', label: this.t('dashboard.clientes'), id: 'total-clientes', labelId: 'label-clientes', value: this.clients.length },
				{ icon: 'fa-clock', label: this.t('dashboard.pendentes'), id: 'pedidos-pendentes', labelId: 'label-pendentes', value: statusCounts.pendente },
				   { icon: 'fa-user-check', label: this.t('dashboard.confirmados'), id: 'pedidos-confirmados', labelId: 'label-confirmados', value: statusCounts.confirmado },
				   { icon: 'fa-money-bill-wave', label: this.t('dashboard.pagos'), id: 'pedidos-pagos', labelId: 'label-pagos', value: statusCounts.pago },
				   { icon: 'fa-check-circle', label: this.t('dashboard.entregues'), id: 'pedidos-entregues', labelId: 'label-entregues', value: statusCounts.entregue },
				   { icon: 'fa-ban', label: this.t('dashboard.cancelados'), id: 'pedidos-cancelados', labelId: 'label-cancelados', value: statusCounts.cancelado },
				   { icon: 'fa-warehouse', label: this.t('dashboard.estoque'), id: 'total-estoque', labelId: 'label-estoque', value: this.products.reduce((sum, p) => sum + (p.estoque || 0), 0) },
				   { icon: 'fa-shipping-fast', label: this.t('dashboard.entregas'), id: 'total-entregas', labelId: 'label-entregas', value: this.countDeliveriesToday() },
				  { icon: 'fa-hand-holding-usd', label: this.t('dashboard.total_pago'), id: 'total-pago', labelId: 'label-total-pago', value: this.formatCurrency(totalPago) },
			   { icon: 'fa-money-check-alt', label: 'A Receber (parcial)', id: 'total-a-receber', labelId: 'label-total-a-receber', value: this.formatCurrency(totalAReceber) }
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

		// Lista de pedidos e status para gerenciamento
		let pedidosListContainer = document.getElementById('pedidos-list-container');
		if (!pedidosListContainer) {
			pedidosListContainer = document.createElement('div');
			pedidosListContainer.id = 'pedidos-list-container';
			pedidosListContainer.style.marginTop = '2rem';
			pedidosListContainer.innerHTML = `<h2 style="font-size:1.3rem; color:#333; margin-bottom:1rem;">Pedidos e Status</h2>`;
			// Insere acima da lista de entregas do dia
			const entregasHoje = document.getElementById('entregas-hoje');
			if (entregasHoje && entregasHoje.parentElement) {
				entregasHoje.parentElement.insertBefore(pedidosListContainer, entregasHoje);
			} else {
				document.getElementById('stats-grid').parentElement.appendChild(pedidosListContainer);
			}
		} else {
			pedidosListContainer.innerHTML = `<h2 style="font-size:1.3rem; color:#333; margin-bottom:1rem;">Pedidos e Status</h2>`;
		}

		const pedidosList = this.orders.map(order => {
			   return `<div style="background:#fff; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.07); margin-bottom:0.5rem; padding:0.75rem 1rem; display:flex; align-items:center; justify-content:space-between;">
				   <div>
					   <strong>#${order.numero_pedido || order.id}</strong> - ${order.cliente_nome || 'Cliente'}<br>
					   <span style="color:#888; font-size:0.95rem;">${order.data_entrega ? 'Entrega: ' + order.data_entrega : ''}</span>
				   </div>
				   <div style="display: flex; align-items: center; gap: 0.5rem;">
					   <select data-order-id="${order.id}" style="padding:0.3rem 0.7rem; border-radius:6px; border:1px solid #ccc;">
						   <option value="pendente" ${order.status==='pendente'?'selected':''}>Pendente</option>
						   <option value="pago" ${order.status==='pago'?'selected':''}>Pago</option>
						   <option value="entregue" ${order.status==='entregue'?'selected':''}>Entregue</option>
						   <option value="cancelado" ${order.status==='cancelado'?'selected':''}>Cancelado</option>
					   </select>
					   <button class="btn-visualizar-recibo" data-order-id="${order.id}" style="background: none; border: none; cursor: pointer; color: #667eea; font-size: 1.3rem;" aria-label="Visualizar Pedido">
						   <i class="fas fa-file-invoice"></i>
					   </button>
				   </div>
			   </div>`;
		}).join('');

		const pedidosListContainerFinal = document.getElementById('pedidos-list-container');
		if (pedidosListContainerFinal) {
			   pedidosListContainerFinal.innerHTML += pedidosList;
			   // Adiciona evento para atualizar status
			   pedidosListContainerFinal.querySelectorAll('select[data-order-id]').forEach(select => {
				   select.onchange = async (e) => {
					   const orderId = e.target.getAttribute('data-order-id');
					   const newStatus = e.target.value;
					   await this.supabase.from('pedidos').update({ status: newStatus }).eq('id', orderId);
					   const order = this.orders.find(o => o.id == orderId);
					   if (order) order.status = newStatus;
					   this.createStatsCards();
				   };
			   });
			   // Adiciona evento para visualizar recibo
			   pedidosListContainerFinal.querySelectorAll('.btn-visualizar-recibo').forEach(btn => {
				   btn.addEventListener('click', (e) => {
					   const orderId = btn.getAttribute('data-order-id');
					   window.dashboardApp.viewOrder(orderId);
				   });
			   });
		}
	}

	createDataCards() {
		this.renderClientesPage();
		this.renderProdutosPage();
		this.renderPedidosPage();
		this.renderEstoquePage();
		this.renderEntregasPage();
	}

	updateStats() {
		const statusCounts = {
			pendente: this.orders.filter(o => o.status === 'pendente').length,
			pago: this.orders.filter(o => o.status === 'pago').length,
			entregue: this.orders.filter(o => o.status === 'entregue').length,
			cancelado: this.orders.filter(o => o.status === 'cancelado').length
		};

		const ids = [
			'total-produtos',
			'total-clientes',
			'total-pedidos',
			'pedidos-pendentes',
			'pedidos-pagos',
			'pedidos-entregues',
			'pedidos-cancelados',
			'total-entregas',
			'total-estoque'
		];

		const values = [
			this.products.length,
			this.clients.length,
			this.orders.length,
			statusCounts.pendente,
			statusCounts.pago,
			statusCounts.entregue,
			statusCounts.cancelado,
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
	// Só pedidos com data_entrega igual a hoje, status diferente de 'cancelado', e tipo_entrega igual a 'entrega' (não retirada)
	const entregas = this.orders.filter(o =>
		o.data_entrega === today &&
		o.status !== 'cancelado' &&
		o.status !== 'entregue' &&
		(o.tipo_entrega === 'entrega' || !o.tipo_entrega)
	);

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
		const labelIds = [
			'label-produtos',
			'label-clientes',
			'label-pedidos',
			'label-pendentes',
			'label-pagos',
			'label-entregues',
			'label-cancelados',
			'label-entregas',
			'label-estoque'
		];
		const labelKeys = [
			'dashboard.produtos',
			'dashboard.clientes',
			'dashboard.pedidos',
			'dashboard.pendentes',
			'dashboard.pagos',
			'dashboard.entregues',
			'dashboard.cancelados',
			'dashboard.entregas',
			'dashboard.estoque'
		];
		labelIds.forEach((id, i) => {
			const el = document.getElementById(id);
			if (el) el.textContent = this.t(labelKeys[i]);
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
			// Filtra apenas clientes válidos (com id numérico)
			this.clients = Array.isArray(clientes)
				? clientes.filter(c => c && typeof c === 'object' && typeof c.id === 'string' && c.id.length > 0)
				: [];
			console.log('Dados brutos de clientes do Supabase:', clientes);
			console.log('Clientes válidos após filtro:', this.clients);

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
		
		// Corrige submit para ser async
		const form = modal.querySelector('form');
		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				// ...código de coleta dos dados do produto...
				await this.loadData();
				this.renderProdutosPage();
				this.renderEstoquePage();
				this.updateStats();
				closeModal('modal-add-product');
			});
		}
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
		// Removida confirmação daqui, pois já existe na renderProdutosPage
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

		let pedidoSalvo;
		if (editId) {
			pedidoSalvo = await this.saveToSupabase('pedidos', orderData, editId);
			if (pedidoSalvo) {
				const index = this.orders.findIndex(o => o.id === editId);
				if (index !== -1) this.orders[index] = pedidoSalvo;
			}
		} else {
			pedidoSalvo = await this.saveToSupabase('pedidos', orderData);
			if (pedidoSalvo) this.orders.unshift(pedidoSalvo);
		}

		// Envio de recibo ou confirmação após salvar pedido
		if (pedidoSalvo) {
			const cliente = this.clients.find(c => c.id === pedidoSalvo.cliente_id);
			const valorPago = pedidoSalvo.valor_pago || pedidoSalvo.valor_total;
			const isRetirada = pedidoSalvo.tipo_entrega === 'retirada' || pedidoSalvo.endereco_entrega?.toLowerCase().includes('retirada');
			if (cliente && cliente.email) {
				if (valorPago >= pedidoSalvo.valor_total && isRetirada) {
					// Recibo para retirada com pagamento total
					window.gerarEEnviarRecibo({ ...pedidoSalvo, produtos: [{ nome: pedidoSalvo.produto_nome, quantidade: pedidoSalvo.quantidade }] }, cliente.email);
				} else if (valorPago < pedidoSalvo.valor_total) {
					// Confirmação de compra para pagamento parcial
					if (window.gerarEEnviarConfirmacaoCompra) {
						window.gerarEEnviarConfirmacaoCompra({ ...pedidoSalvo, produtos: [{ nome: pedidoSalvo.produto_nome, quantidade: pedidoSalvo.quantidade }] }, cliente.email);
					}
				}
			}
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

		const modal = this.createModal('modal-view-order', '', false);
		
		   const client = this.clients.find(c => c.id == order.cliente_id);
		   modal.querySelector('.modal-content-wrapper').style.maxWidth = '430px';
		   modal.querySelector('.modal-content-wrapper').style.padding = '2.2rem 1.7rem';
		   modal.querySelector('.modal-content-wrapper').innerHTML = `
			   <div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
				   <span style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff6b9d, #ffa726); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-file-invoice"></i></span>
				   <span style="font-size: 1.35rem; font-weight: 700; color: #333;">Pedido Nº ${order.numero_pedido || order.id}</span>
				   <button onclick="closeModal('modal-view-order')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
			   </div>
			   <div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
			   <div style="padding: 1.25rem 1rem; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
				   <h4 style="margin: 0 0 1rem 0; font-size: 1.08rem; color: #764ba2;">Cliente</h4>
				   <input type="text" class="form-control" value="${order.cliente_nome || ''}" readonly style="width: 100%; margin-bottom: 0.2rem;">
			   </div>
			   <div style="padding: 1.25rem 1rem; border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
				   <h4 style="margin: 0 0 1rem 0; font-size: 1.08rem;">Produto</h4>
				   <input type="text" class="form-control" value="${order.produto_nome || ''}" readonly style="width: 100%; margin-bottom: 0.2rem;">
				   <div style="display: flex; gap: 0.5rem;">
					   <input type="text" class="form-control" value="Qtd: ${order.quantidade || ''}" readonly style="width: 50%;">
					   <input type="text" class="form-control" value="${this.formatCurrency(order.valor_unitario)}" readonly style="width: 50%;">
				   </div>
			   </div>
			   <div style="padding: 1.25rem 1rem; border-radius: 10px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
				   <h4 style="margin: 0 0 1rem 0; font-size: 1.08rem;">Entrega</h4>
				   <input type="text" class="form-control" value="${this.formatDate(order.data_entrega)}" readonly style="width: 100%; margin-bottom: 0.2rem;">
				   <input type="text" class="form-control" value="${order.horario_entrega || 'Não informado'}" readonly style="width: 100%; margin-bottom: 0.2rem;">
				   <input type="text" class="form-control" value="${order.endereco_entrega || ''}" readonly style="width: 100%;">
			   </div>
			   <div style="background: #28a745; padding: 1rem; border-radius: 8px; text-align: center; color: white; margin-bottom: 0.5rem;">
				   <h4 style="margin: 0 0 0.3rem 0; font-size: 0.85rem; font-weight: 400; opacity: 0.9;">VALOR TOTAL</h4>
				   <h2 style="margin: 0; font-size: 1.3rem;">${this.formatCurrency(order.valor_total)}</h2>
			   </div>
			   <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.7rem;">
				   <button type="button" onclick="closeModal('modal-view-order')" class="btn btn-secondary" style="font-size: 0.95rem; padding: 0.4rem 0.8rem;">Fechar</button>
				   <button type="button" onclick="closeModal('modal-view-order'); window.dashboardApp.editOrder(${order.id});" class="btn btn-primary" style="font-size: 0.95rem; padding: 0.4rem 0.8rem;">
					   ✏️ Editar
				   </button>
				   <button type="button" onclick="window.gerarEEnviarRecibo(window.dashboardApp.orders.find(o => o.id == ${order.id}), '${client?.email || ''}')" class="btn btn-info" style="font-size: 0.95rem; padding: 0.4rem 0.8rem;">
					   <i class="fas fa-paper-plane"></i> Reenviar Recibo
				   </button>
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
		console.log('IDs dos clientes:', this.clients.map(c => c.id));
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
			function escapeHtml(text) {
				if (!text) return '';
				return String(text)
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&#39;')
					.replace(/`/g, '')
					.replace(/[\r\n]+/g, ' ');
			}
			const list = this.clients.map(c => `
				<div style="background: white; padding: 1.25rem; border-radius: 10px; margin-bottom: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #667eea;">
					<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
						<div style="background: linear-gradient(135deg, #667eea, #6dd5ed); border-radius: 8px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
							<i class="fas fa-user" style="color: #fff; font-size: 1.5rem;"></i>
						</div>
						<h4 style="margin: 0; color: #333; font-size: 1.15rem; font-weight: 700;">${escapeHtml(c.nome)}</h4>
					</div>
					<div style="display: flex; justify-content: space-between; align-items: flex-start;">
						<div style="flex: 1;">
							<p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.9rem;"><i class="fas fa-phone" style="color: #667eea; width: 20px;"></i> ${escapeHtml(c.telefone)}</p>
							${c.email ? `<p style="margin: 0 0 0.25rem 0; color: #666; font-size: 0.9rem;"><i class="fas fa-envelope" style="color: #667eea; width: 20px;"></i> ${escapeHtml(c.email)}</p>` : ''}
							<p style="margin: 0; color: #666; font-size: 0.9rem;"><i class="fas fa-map-marker-alt" style="color: #667eea; width: 20px;"></i> ${escapeHtml(c.endereco)}</p>
						</div>
						<div style="display: flex; gap: 0.5rem; align-items: center;">
							<button onclick="window.dashboardApp.editClient('${escapeHtml(c.id)}')" style="padding: 0.5rem 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;" title="Editar">
								<i class="fas fa-edit"></i>
							</button>
							<button onclick="window.dashboardApp.deleteClient('${escapeHtml(c.id)}')" style="padding: 0.5rem 0.75rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;" title="Deletar">
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
					<select id="product-categoria-select" class="form-control" required>
						<option value="">Selecione...</option>
						${(this.products ? [...new Set(this.products.map(p => p.categoria).filter(Boolean))] : []).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
						<option value="nova">Nova categoria...</option>
					</select>
					<input type="text" id="product-categoria-nova" class="form-control" placeholder="Digite nova categoria" style="display:none; margin-top:0.5rem;">
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

		// Lógica para mostrar/esconder input de nova categoria (fora do template)
		setTimeout(() => {
			const categoriaSelect = modal.querySelector('#product-categoria-select');
			const categoriaNovaInput = modal.querySelector('#product-categoria-nova');
			if (categoriaSelect && categoriaNovaInput) {
				categoriaNovaInput.style.display = 'none'; // Garante que começa escondido
				categoriaSelect.addEventListener('change', function() {
					if (categoriaSelect.value === 'nova') {
						categoriaNovaInput.style.display = 'block';
						categoriaNovaInput.required = true;
					} else {
						categoriaNovaInput.style.display = 'none';
						categoriaNovaInput.required = false;
					}
				});
			}
		}, 0);

		// Carrossel de fotos preview
		const fotosInput = modal.querySelector('#product-fotos');
		const previewFotos = modal.querySelector('#preview-fotos');
		fotosInput.addEventListener('change', (e) => {
			previewFotos.innerHTML = '';
			const files = Array.from(e.target.files).slice(0, 5);
			categorias.forEach(cat => {
				const produtosCat = this.products.filter(p => p.categoria === cat);
				if (produtosCat.length) {
					produtosHtml += `
						<div style="width: 100%; margin-bottom: 2.5rem;">
							<h2 style="font-size: 1.25rem; font-weight: 700; color: #764ba2; margin-bottom: 1.2rem; text-align:left;">${cat}</h2>
							<div class="produtos-marketplace" style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
								${produtosCat.map(produto => {
									let fotos = [];
									if (produto.fotos) {
										try { fotos = JSON.parse(produto.fotos); } catch {}
									}
									return `
																	<div class="card-produto" style="background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 1.2rem; max-width: 320px; width: 100%; display: flex; flex-direction: column; align-items: center; position: relative;" data-descricao="${produto.descricao || ''}">
																		<div class="produto-tooltip hidden">${produto.descricao || ''}</div>
										<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
											<span style="font-size: 1.15rem; font-weight: 700; color: #333;">${produto.nome}</span>
										</div>
											<div style="position: relative; width: 220px; height: 220px; border-radius: 10px; overflow: hidden; background: #f0f0f0; margin-bottom: 0.7rem;">
												<div id="market-carousel-${produto.id}" style="display: flex; transition: transform 0.3s ease;">
													${fotos.map((foto, i) => `<img src=\"${foto}\" style=\"min-width: 100%; height: 220px; object-fit: cover;\">`).join('')}
												</div>
												${fotos.length > 1 ? `
													<button data-action=\"prev-produto-photo\" data-id=\"${produto.id}\" data-total=\"${fotos.length}\" style=\"position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;\">‹</button>
													<button data-action=\"next-produto-photo\" data-id=\"${produto.id}\" data-total=\"${fotos.length}\" style=\"position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;\">›</button>
												` : ''}
											</div>
											<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
												<span style="font-size: 1.2rem; font-weight: 700; color: #ff6b9d;">${this.formatCurrency(produto.preco)}</span>
											</div>
											<div style="display: flex; align-items: center; justify-content: center; gap: 1rem; width: 100%; margin-bottom: 0.5rem;">
												<button data-action=\"decrement-produto\" data-id=\"${produto.id}\" style=\"background: #eee; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer;\">-</button>
												<span id=\"contador-produto-${produto.id}\" style=\"font-size: 1.2rem; font-weight: 600; min-width: 32px; text-align: center;\">${this.cart[produto.id]?.quantidade || 0}</span>
												<button data-action=\"increment-produto\" data-id=\"${produto.id}\" data-preco=\"${produto.preco}\" style=\"background: #eee; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer;\">+</button>
											</div>
											<button data-action=\"adicionar-carrinho\" data-id=\"${produto.id}\" data-preco=\"${produto.preco}\" style=\"width: 100%; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; padding: 0.8rem 0; font-size: 1.1rem; font-weight: 700; cursor: pointer; margin-bottom: 0.5rem;\">Adicionar ao Carrinho</button>
										</div>
									`;
								}).join('')}
							</div>
						</div>
					`;
				}
			});
		});
		// Corrige submit para ser async
		const form = modal.querySelector('#form-add-product');
		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				// Pega categoria escolhida ou nova
				let categoria;
				if (categoriaSelect && categoriaSelect.value === 'nova') {
					categoria = categoriaNovaInput.value.trim();
				} else if (categoriaSelect) {
					categoria = categoriaSelect.value;
				} else {
					categoria = '';
				}
				// Substitua o uso do valor do input antigo pelo valor da variável categoria
				// ...código de coleta dos dados do produto, usando a variável categoria...
				await this.loadData();
				this.renderProdutosPage();
				this.renderEstoquePage();
				this.updateStats();
				closeModal('modal-add-product');
			});
		}
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
	}

	async editProduct(id) {
		const product = this.products.find(p => p.id == id);
		if (!product) return;
		const modal = this.createModal('modal-edit-product', '✏️ Editar Produto');
		modal.classList.add('show');
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		// Corrige: insere o formulário dentro do .modal-content-wrapper
		const wrapper = modal.querySelector('.modal-content-wrapper');
		wrapper.innerHTML += `
			<form id="form-edit-product" class="form-modal">
				<div class="form-group">
					<label for="edit-nome">Nome *</label>
					<input type="text" id="edit-nome" required value="${product.nome}" class="form-control">
				</div>
				<div class="form-group">
					<label for="edit-categoria">Categoria *</label>
					<input type="text" id="edit-categoria" required value="${product.categoria}" class="form-control">
				</div>
				<div class="form-group">
					<label for="edit-preco">Preço *</label>
					<input type="text" id="edit-preco" required value="${product.preco}" class="form-control" inputmode="decimal" pattern="^\\d+(\\.|\\,)?\\d{0,2}$">
				</div>
				<div class="form-group">
					<label for="edit-estoque">Estoque *</label>
					<input type="number" id="edit-estoque" required value="${product.estoque}" class="form-control" min="0" step="1">
				</div>
				<div class="form-group">
					<label for="edit-descricao">Descrição</label>
					<textarea id="edit-descricao" class="form-control" rows="2">${product.descricao || ''}</textarea>
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-edit-product')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Salvar</button>
				</div>
			</form>
		`;
		modal.querySelector('#form-edit-product').addEventListener('submit', async (e) => {
			e.preventDefault();
			const nome = modal.querySelector('#edit-nome').value.trim();
			const categoria = modal.querySelector('#edit-categoria').value.trim();
			let precoStr = modal.querySelector('#edit-preco').value.trim();
			precoStr = precoStr.replace(',', '.');
			const preco = parseFloat(precoStr);
			const estoque = parseInt(modal.querySelector('#edit-estoque').value);
			const descricao = modal.querySelector('#edit-descricao').value.trim();
			if (!nome || !categoria || isNaN(preco) || isNaN(estoque)) {
				alert('Preencha todos os campos obrigatórios');
				return;
			}
			const productData = {
				nome,
				categoria,
				preco,
				estoque,
				descricao
			};
			const result = await this.saveToSupabase('produtos', productData, id);
			if (result) {
				const idx = this.products.findIndex(p => p.id == id);
				if (idx !== -1) this.products[idx] = { ...this.products[idx], ...productData };
				this.renderProdutosPage();
				this.renderEstoquePage();
				this.updateStats();
			}
			closeModal('modal-edit-product');
		});
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
					<div style="position: relative; width: 220px; height: 220px; border-radius: 10px; overflow: hidden; margin-bottom: 0.7rem; background: #f0f0f0;">
						<div id="carousel-${p.id}" data-current="0" style="display: flex; transition: transform 0.3s ease;">
							${fotos.map((foto, i) => `<img src="${foto}" style="min-width: 100%; height: 220px; object-fit: cover;">`).join('')}
						</div>
						${fotos.length > 1 ? `
							<button data-action="prev-photo" data-id="${p.id}" data-total="${fotos.length}" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer;">‹</button>
							<button data-action="next-photo" data-id="${p.id}" data-total="${fotos.length}" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer;">›</button>
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
								<button data-action="edit-product" data-id="${p.id}" style="padding: 0.5rem 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
									<i class="fas fa-edit"></i>
								</button>
								<button data-action="delete-product" data-id="${p.id}" style="padding: 0.5rem 0.75rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
									<i class="fas fa-trash"></i>
								</button>
							</div>
						</div>
					</div>
				`;
			}).join('');
			container.innerHTML = actionBar + `<div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: flex-start;">${list}</div>`;
			// Delegação de eventos para carrossel e botões
			container.onclick = (e) => {
				const btn = e.target.closest('button[data-action]');
				if (!btn) return;
				const action = btn.getAttribute('data-action');
				const id = btn.getAttribute('data-id');
				const total = parseInt(btn.getAttribute('data-total'));
				if (action === 'prev-photo') this.prevPhoto(id, total);
				if (action === 'next-photo') this.nextPhoto(id, total);
				if (action === 'edit-product') {
					this.editProduct(id);
				}
				if (action === 'delete-product') {
					// Apenas uma confirmação
					if (window.confirm('Tem certeza que deseja excluir este produto?')) {
						this.deleteProduct(id);
					}
				}
			};
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
			if (item.adicionado) {
				cartTotal += item.quantidade * item.preco;
			}
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


		// Obter categorias únicas dos produtos
		const categorias = [...new Set(this.products.map(p => p.categoria).filter(Boolean))];
		let categoriaSelecionada = this.selectedCategoria || '';

		// Dropdown de categorias + Total do Carrinho no topo
		const dropdownHtml = `
			<div style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 2rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
				<div style="display: flex; align-items: center; gap: 0.5rem;">
					<label for="dropdown-categoria" style="font-weight: 600; margin-right: 0.5rem;">Filtrar por categoria:</label>
					<select id="dropdown-categoria" style="padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #eee; font-size: 1rem;">
						<option value="">Todas</option>
						${categorias.map(cat => `<option value="${cat}" ${cat === categoriaSelecionada ? 'selected' : ''}>${cat}</option>`).join('')}
					</select>
				</div>
				<div style="font-size: 1.15rem; font-weight: 700; color: #28a745; background: #f8f9fa; border-radius: 8px; padding: 0.5rem 1.2rem;">
					Total do Carrinho: ${this.formatCurrency(cartTotal)}
				</div>
			</div>
		`;


		let produtosHtml = '';
		if (!categoriaSelecionada) {
			// Todas: dividir por categoria
			categorias.forEach(cat => {
				const produtosCat = this.products.filter(p => p.categoria === cat);
				if (produtosCat.length) {
					produtosHtml += `
						<div style="width: 100%; margin-bottom: 2.5rem;">
							<h2 style="font-size: 1.25rem; font-weight: 700; color: #764ba2; margin-bottom: 1.2rem; text-align:left;">${cat}</h2>
							<div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
								${produtosCat.map(produto => {
									let fotos = [];
									if (produto.fotos) {
										try { fotos = JSON.parse(produto.fotos); } catch {}
									}
									return `
																	<div class="card-produto" style="background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 1.2rem; max-width: 320px; width: 100%; display: flex; flex-direction: column; align-items: center; position: relative;" data-descricao="${produto.descricao || ''}">
																		<div class="produto-tooltip hidden">${produto.descricao || ''}</div>
										<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
											<span style="font-size: 1.15rem; font-weight: 700; color: #333;">${produto.nome}</span>
										</div>
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
						</div>
					`;
				}
			});
		} else {
			// Categoria selecionada: mostrar só os produtos filtrados
			const produtosFiltrados = this.products.filter(p => p.categoria === categoriaSelecionada);
			produtosHtml = `
				<div class="produtos-marketplace" style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
					${produtosFiltrados.map(produto => {
						let fotos = [];
						if (produto.fotos) {
							try { fotos = JSON.parse(produto.fotos); } catch {}
						}
						return `
						<div class="card-produto" style="background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 1.2rem; max-width: 320px; width: 100%; display: flex; flex-direction: column; align-items: center;" data-descricao="${produto.descricao || ''}">
							<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
								<span style="font-size: 1.15rem; font-weight: 700; color: #333;">${produto.nome}</span>
							</div>
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
			`;
		}

		container.innerHTML = `
			${dropdownHtml}
			${produtosHtml}
			${cartMessageHtml}
		`;

		// Tooltip flutuante que segue o cursor
		let tooltip = document.getElementById('produto-tooltip-global');
		if (!tooltip) {
			tooltip = document.createElement('div');
			tooltip.id = 'produto-tooltip-global';
			tooltip.className = 'produto-tooltip-global hidden';
			document.body.appendChild(tooltip);
		}

		container.querySelectorAll('.card-produto').forEach(card => {
			card.addEventListener('mouseenter', function(e) {
				const descricao = card.getAttribute('data-descricao');
				if (descricao && descricao.trim()) {
					tooltip.textContent = descricao;
					tooltip.classList.remove('hidden');
					// Remove qualquer font-size inline para garantir o CSS
					tooltip.style.fontSize = '';
				}
			});
			card.addEventListener('mousemove', function(e) {
				if (!tooltip.classList.contains('hidden')) {
					const offset = 18;
					tooltip.style.left = (e.clientX + offset) + 'px';
					tooltip.style.top = (e.clientY + offset) + 'px';
				}
			});
			card.addEventListener('mouseleave', function() {
				tooltip.classList.add('hidden');
				tooltip.textContent = '';
			});
		});

		// Evento do dropdown de categoria
		const dropdown = container.querySelector('#dropdown-categoria');
		if (dropdown) {
			dropdown.onchange = (e) => {
				this.selectedCategoria = e.target.value;
				this.renderPedidosPage();
			};
		}
	this.setupPedidosEventDelegation();
	}

	setupPedidosEventDelegation() {
		const pedidosContainer = document.getElementById('pedidos-container');
		if (!pedidosContainer) return;
		// Remove event listener antigo, se necessário (usando uma flag)
		if (pedidosContainer._delegationAttached) {
			pedidosContainer.removeEventListener('click', pedidosContainer._delegationHandler);
		}
		const handler = (e) => {
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
		};
		pedidosContainer.addEventListener('click', handler);
		pedidosContainer._delegationAttached = true;
		pedidosContainer._delegationHandler = handler;
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
				return produto ? `<tr style="border-bottom:1px solid #eee;">
					<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#222; font-weight:600;">${produto.nome}</td>
					<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#764ba2; text-align:right;">${this.formatCurrency(item.preco)}</td>
					<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#dc3545; text-align:center;">${item.quantidade}</td>
					<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#28a745; text-align:right; font-weight:600;">${this.formatCurrency(item.preco * item.quantidade)}</td>
				</tr>` : '';
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
					<div style="padding: 0.35rem 0.5rem; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
						<h4 style="margin: 0 0 0.08rem 0; font-size: 1.03rem; color: #764ba2;">Produtos no Carrinho</h4>
						<div class="carrinho-lista" style="width:100%; overflow-x:auto;">
							<table style="width:100%; border-collapse:collapse; background:#f8f9fa; border-radius:8px;">
								<thead>
									<tr style="background:#f5f5f5;">
										<th style="padding:0.25rem 0.4rem; font-size:0.93rem; color:#333; text-align:left; font-weight:700;">Produto</th>
										<th style="padding:0.25rem 0.4rem; font-size:0.93rem; color:#333; text-align:right; font-weight:700;">Preço</th>
										<th style="padding:0.25rem 0.4rem; font-size:0.93rem; color:#333; text-align:center; font-weight:700;">Qtd.</th>
										<th style="padding:0.25rem 0.4rem; font-size:0.93rem; color:#333; text-align:right; font-weight:700;">Total</th>
									</tr>
								</thead>
								<tbody>
									${produtosCarrinho}
								</tbody>
							</table>
						</div>
					</div>
					<div style="padding: 0.35rem 0.5rem; border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
						<h4 style="margin: 0 0 0.08rem 0; font-size: 1.03rem;">Selecione o Cliente</h4>
						<select id="finalizar-cliente" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1.02rem;">
							<option value="">-- Escolha um cliente --</option>
							${this.clients.map(c => `<option value="${c.id}">${c.nome} - ${c.telefone}</option>`).join('')}
						</select>
					</div>
					<div style="padding: 0.35rem 0.5rem; border-radius: 10px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
						<h4 style="margin: 0 0 0.08rem 0; font-size: 1.03rem;">Forma de Pagamento</h4>
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
					<div style="padding: 0.35rem 0.5rem; border-radius: 10px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
						<h4 style="margin: 0 0 0.08rem 0; font-size: 1.03rem;">Tipo de Entrega</h4>
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
			finalizarForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				const clienteId = document.getElementById('finalizar-cliente').value;
				const pagamento = document.getElementById('finalizar-pagamento').value;
				const entrega = document.getElementById('finalizar-entrega').value;
				const fullPayment = document.getElementById('finalizar-full-payment').checked;
				const sinal = fullPayment ? null : (parseFloat(document.getElementById('finalizar-sinal').value.replace(',', '.')) || 0);
				const produtos = Object.entries(this.cart)
					.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado)
					.map(([id, item]) => ({ produto_id: id, quantidade: item.quantidade, preco_unitario: item.preco }));
				const valor_total = produtos.reduce((acc, p) => acc + p.preco_unitario * p.quantidade, 0);
				const valor_pago = fullPayment ? valor_total : sinal || 0;
				const valor_pendente = valor_total - valor_pago;
				const cliente = this.clients.find(c => c.id == clienteId);
				// Gerar número de pedido único
				const hoje = new Date();
				const dataStr = hoje.toISOString().slice(0,10).replace(/-/g, '');
				const randomNum = Math.floor(Math.random() * 9000) + 1000;
				const numeroPedido = `PED-${dataStr}-${randomNum}`;

				const pedidoData = {
					numero_pedido: numeroPedido,
					cliente_id: clienteId,
					data_pedido: hoje.toISOString(),
					data_entrega: hoje.toISOString().slice(0,10), // Ajuste conforme campo do formulário
					valor_total,
					valor_pago,
					status: 'pendente',
					forma_pagamento: pagamento,
					observacoes: '',
					idioma: cliente ? cliente.idioma : 'pt',
				};
				// Salvar pedido no Supabase
				const pedidoSalvo = await this.saveToSupabase('pedidos', pedidoData);
				if (pedidoSalvo && pedidoSalvo.id) {
					// Salvar itens do pedido
					for (const item of produtos) {
						const itemData = {
							pedido_id: pedidoSalvo.id,
							produto_id: item.produto_id,
							quantidade: item.quantidade,
							preco_unitario: item.preco_unitario,
							created_at: new Date().toISOString(),
						};
						await this.saveToSupabase('pedido_itens', itemData);
					}
					// Só criar entrega se selecionado
					if (entrega === 'entrega') {
						const entregaData = {
							pedido_id: pedidoSalvo.id,
							data_entrega: pedidoData.data_entrega,
							hora_entrega: null,
							endereco_entrega: cliente ? cliente.endereco : '',
							status: 'agendada',
							created_at: new Date().toISOString(),
						};
						await this.saveToSupabase('entregas', entregaData);
					}
				}
				// Atualizar pedidos pendentes
				await this.loadPedidos();
				this.renderPedidosPage();
				// Atualizar entregas só se foi criada
				if (entrega === 'entrega') {
					await this.loadEntregas();
					this.renderEntregasPage();
				}
				// Gerar recibo e enviar por e-mail
				if (cliente && cliente.email) {
					this.gerarEEnviarRecibo({ ...pedidoData, produtos }, cliente.email);
				}
				closeModal('modal-finalizar-pedido');
				if (document.getElementById('cart-message')) document.getElementById('cart-message').remove();
				this.cart = {};
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
		// Só pedidos do tipo 'entrega' e status 'pendente'
		const entregas = this.orders.filter(o =>
			o.data_entrega &&
			o.tipo_entrega === 'entrega' &&
			o.status === 'pendente'
		);

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
            window.dashboardApp.editClient = app.editClient.bind(app);
            window.dashboardApp.deleteClient = app.deleteClient.bind(app);
		}
	} catch (error) {
		console.error('Erro ao inicializar aplicação:', error);
	}
});
