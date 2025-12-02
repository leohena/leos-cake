// Função de sanitização para prevenir XSS
function sanitizeHTML(str) {
	if (!str) return '';
	const temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
}

// Modal de edição do usuário logado
// Modal de edição do usuário logado (dados reais)
window.showEditUserModal = async function() {
	const modalsContainer = document.getElementById('modals-container');
	if (!modalsContainer) return;
	modalsContainer.innerHTML = '';
	const modalId = 'edit-user-modal';
	const currentUser = await window.authSystem.getCurrentUser();
	const modal = document.createElement('div');
	modal.id = modalId;
	modal.className = 'modal-overlay show';
	modal.onclick = closeModalOverlay;
	modal.innerHTML = `
		<div class="modal-content-wrapper" style="padding:2rem;max-width:400px;">
			<h2 style="margin-bottom:1rem;">Editar Perfil</h2>
			<label>Nome</label>
			<input type="text" id="edit-user-nome" value="${currentUser?.nome || ''}" style="width:100%;margin-bottom:1rem;">
			<label>Email</label>
			<input type="email" id="edit-user-email" value="${currentUser?.email || ''}" style="width:100%;margin-bottom:1rem;">
			<div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem;">
				<button onclick="closeModal('${modalId}')" style="background:#eee;border:none;padding:0.5rem 1.2rem;border-radius:6px;">Cancelar</button>
				<button onclick="window.saveEditUser('${currentUser.id}')" style="background:#ff6b9d;color:white;border:none;padding:0.5rem 1.2rem;border-radius:6px;">Salvar</button>
			</div>
		</div>
	`;
	modalsContainer.appendChild(modal);
};
// Salvar edição do usuário logado no banco
window.saveEditUser = async function(userId) {
	const nome = document.getElementById('edit-user-nome').value;
	const email = document.getElementById('edit-user-email').value;
	const { error } = await window.supabase
		.from('usuarios')
		.update({ nome, email })
		.eq('id', userId);
	if (error) {
		alert('Erro ao salvar: ' + error.message);
	} else {
		alert('Dados salvos com sucesso!');
		closeModal('edit-user-modal');
	}
};
// Modal de tabela de usuários (dados reais)
window.showUsuariosModal = async function() {
	const modalsContainer = document.getElementById('modals-container');
	if (!modalsContainer) return;
	modalsContainer.innerHTML = '';
	const modalId = 'usuarios-modal';
	const { data: usuarios, error } = await window.supabase
		.from('usuarios')
		.select('*')
		.order('created_at', { ascending: false });
	let rows = '';
	if (usuarios && usuarios.length) {
		rows = usuarios.map(u => `
			<tr>
				<td style="padding:0.5rem;">${u.nome}</td>
				<td style="padding:0.5rem;">${u.email}</td>
				<td style="padding:0.5rem;">
					<button style="background:#eee;border:none;padding:0.3rem 0.7rem;border-radius:4px;margin-right:0.3rem;" onclick="window.editUsuario('${u.id}')">Editar</button>
					<button style="background:#eee;border:none;padding:0.3rem 0.7rem;border-radius:4px;margin-right:0.3rem;" onclick="window.showResetPasswordModal('${u.id}')">Senha Padrão</button>
					<button style="background:#ff6b9d;color:white;border:none;padding:0.3rem 0.7rem;border-radius:4px;" onclick="window.excluirUsuario('${u.id}')">Excluir</button>
				</td>
			</tr>
		`).join('');
	} else {
		rows = '<tr><td colspan="3" style="text-align:center;padding:1rem;">Nenhum usuário encontrado</td></tr>';
	}
	const modal = document.createElement('div');
	modal.id = modalId;
	modal.className = 'modal-overlay show';
	modal.onclick = closeModalOverlay;
	modal.innerHTML = `
		<div class="modal-content-wrapper" style="padding:2rem;max-width:600px;">
			<h2 style="margin-bottom:1rem;">Usuários</h2>
			<div id="usuarios-table" style="margin-bottom:2rem;">
				<table style="width:100%;border-collapse:collapse;">
					<thead>
						<tr style="background:#f5f5f5;">
							<th style="padding:0.5rem;border-bottom:1px solid #eee;">Nome</th>
							<th style="padding:0.5rem;border-bottom:1px solid #eee;">Email</th>
							<th style="padding:0.5rem;border-bottom:1px solid #eee;">Ações</th>
						</tr>
					</thead>
					<tbody>
						${rows}
					</tbody>
				</table>
			</div>
			<div style="display:flex;justify-content:flex-end;gap:1rem;">
				<button style="background:#eee;border:none;padding:0.5rem 1.2rem;border-radius:6px;" onclick="closeModal('${modalId}')">Fechar</button>
				<button style="background:#667eea;color:white;border:none;padding:0.5rem 1.2rem;border-radius:6px;" onclick="window.adicionarUsuario()">Adicionar Usuário</button>
			</div>
		</div>
	`;
	modalsContainer.appendChild(modal);
};
// Funções de ação dos usuários
window.editUsuario = function(id) { alert('Editar usuário: ' + id); };
window.showResetPasswordModal = async function(id) {
	console.log('resetSenhaUsuario called with id:', id);
	// Buscar dados do usuário
	const { data: usuario, error } = await window.supabase
		.from('usuarios')
		.select('nome, email')
		.eq('id', id)
		.single();
	console.log('Usuario data:', usuario, 'error:', error);
	if (error || !usuario) {
		alert('Erro ao buscar dados do usuário.');
		return;
	}
	// Criar modal de confirmação
	const modalsContainer = document.getElementById('modals-container');
	if (!modalsContainer) {
		console.log('modals-container not found');
		return;
	}
	modalsContainer.innerHTML = '';
	const modalId = 'reset-senha-modal';
	const modal = document.createElement('div');
	modal.id = modalId;
	modal.className = 'modal-overlay show';
	modal.onclick = (e) => {
		if (e.target === modal) closeModalOverlay(e);
	};
	modal.innerHTML = `
		<div class="modal-content-wrapper" style="padding:2rem;max-width:400px;">
			<h2 style="margin-bottom:1rem;color:#ffc107;"><i class="fas fa-key"></i> Resetar Senha</h2>
			<div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:6px;padding:1rem;margin-bottom:1rem;">
				<p style="margin:0;font-size:0.9rem;color:#856404;">
					<strong>Usuário:</strong> ${usuario.nome}<br>
					<strong>Email:</strong> ${usuario.email}
				</p>
			</div>
			<div style="background:#d1ecf1;border:1px solid #bee5eb;border-radius:6px;padding:1rem;margin-bottom:1rem;">
				<p style="margin:0;font-size:0.9rem;color:#0c5460;">
					A senha será resetada para <strong>"123456"</strong>.
				</p>
			</div>
			<div style="display:flex;justify-content:flex-end;gap:1rem;">
				<button onclick="closeModal('${modalId}')" style="background:#6c757d;color:white;border:none;padding:0.5rem 1.2rem;border-radius:6px;">Cancelar</button>
				<button onclick="window.confirmResetSenha('${id}')" style="background:#ffc107;color:#333;border:none;padding:0.5rem 1.2rem;border-radius:6px;font-weight:600;">
					<i class="fas fa-key"></i> Resetar Senha
				</button>
			</div>
		</div>
	`;
	modalsContainer.appendChild(modal);
	console.log('Modal appended');
};
window.confirmResetSenha = async function(id) {
	try {
		const hashedPassword = btoa('123456');
		const { error } = await window.supabase
			.from('usuarios')
			.update({ password_hash: hashedPassword })
			.eq('id', id);
		if (error) throw error;
		alert('Senha resetada com sucesso para "123456"!');
		closeModal('reset-senha-modal');
	} catch (error) {
		console.error('Erro ao resetar senha:', error);
		alert('Erro ao resetar senha: ' + error.message);
	}
};
window.excluirUsuario = async function(id) {
	if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
	try {
		const { error } = await window.supabase
			.from('usuarios')
			.delete()
			.eq('id', id);
		if (error) throw error;
		alert('Usuário excluído com sucesso!');
		// Recarregar a lista
		if (window.dashboardApp && window.dashboardApp.showUsuariosModal) {
			window.dashboardApp.showUsuariosModal();
		}
	} catch (error) {
		console.error('Erro ao excluir usuário:', error);
		alert('Erro ao excluir usuário: ' + error.message);
	}
};
window.adicionarUsuario = function() {
	if (window.dashboardApp && window.dashboardApp.showAddUserModal) {
		window.dashboardApp.showAddUserModal();
	} else {
		console.error('showAddUserModal não encontrada');
	}
};
// app.js - Dashboard com Fluxo de Vendedor Atualizado
class DashboardApp {
	constructor() {
		// Importar configurações de email
		this.emailConfig = null;
		try {
			// Tentar importar configurações de email (fallback se não conseguir)
			import('./email-config.js').then(module => {
				this.emailConfig = module.default;
				console.log('✅ Configurações de email carregadas');
			}).catch(error => {
				console.warn('⚠️ Arquivo email-config.js não encontrado, usando configurações padrão');
				this.emailConfig = {
					smtp: { host: 'smtp.gmail.com', port: 587, secure: false, auth: { user: '', pass: '' } },
					empresa: { nome: 'Leo\'s Cake', email: 'contato@leoscake.com', telefone: '(11) 99999-9999' }
				};
			});
		} catch (error) {
			console.warn('Erro ao carregar configurações de email:', error);
		}
		// Modal de banner profissional do status
		DashboardApp.prototype.abrirBannerStatus = async function(orderId, statusKey) {
		    const order = this.orders.find(o => o.id == orderId);
		    if (!order) return;
			const empresa = this.emailConfig?.empresa || {
				nome: "Leo's Cake",
				email: 'contato@leoscake.com',
				telefone: '(11) 99999-9999',
				endereco: 'Endereço não informado',
				website: 'https://leohena.github.io/leos-cake/vendas-online.html',
				logo: 'images/logo-png.png'
			};
		    // Banner visual profissional para cada status
		    const statusLabels = {
		        recebido: 'Pedido Recebido',
		        confirmado: 'Pedido Confirmado',
		        producao: 'Em Produção',
		        pago: 'Pagamento Confirmado',
		        saiu_entrega: 'Saiu para Entrega',
		        entregue: 'Pedido Entregue'
		    };
		    const statusColors = {
		        recebido: '#ffb347',
		        confirmado: '#6bc6ff',
		        producao: '#ffe58f',
		        pago: '#a3e635',
		        saiu_entrega: '#17a2b8',
		        entregue: '#28a745'
		    };
		    const statusEmojis = {
		        recebido: '📥',
		        confirmado: '✅',
		        producao: '👩‍🍳',
		        pago: '💰',
		        saiu_entrega: '🚚',
		        entregue: '🎁'
		    };
		    const label = statusLabels[statusKey] || 'Atualização';
		    const color = statusColors[statusKey] || '#ffe58f';
		    const emoji = statusEmojis[statusKey] || '🔔';
		    // Mensagem personalizada
		    const mensagem = window.getStatusMessage(order, statusKey);
		    // Banner visual
		    const bannerText = `
		        <div style='background: ${color}; border-radius: 12px; padding: 1.2rem 1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center; font-family: Segoe UI, Arial, sans-serif;'>
		            <img src='${empresa.logo}' alt='Logo Leo\'s Cake' style='width: 60px; height: 60px; object-fit: contain; margin-bottom: 0.5rem;'/>
		            <h2 style='margin: 0; color: #ff6b9d; font-size: 1.3rem; font-weight: bold;'>${empresa.nome}</h2>
		            <div style='font-size: 1.1rem; color: #333; margin: 0.5rem 0;'>${emoji} <strong>${label}</strong></div>
		            <div style='font-size: 0.98rem; color: #333; margin-bottom: 0.7rem;'>${mensagem}</div>
		            <div style='font-size: 0.9rem; color: #555; margin-bottom: 0.5rem;'>${empresa.endereco}<br>${empresa.telefone}<br>${empresa.email}<br><a href='${empresa.website}' target='_blank' style='color:#007bff;text-decoration:none;'>${empresa.website}</a></div>
		            <div style='margin-top: 0.7rem; color: #ff6b9d; font-size: 0.95rem;'>🍰 Doces feitos com carinho especialmente para você! 🍰</div>
		        </div>
		    `;
		    const hasBannerSent = order.email_sent_steps && order.email_sent_steps.includes(statusKey);
		    // Cria modal
		    const modalId = 'modal-banner-' + orderId + '-' + statusKey;
		    let modal = document.getElementById(modalId);
		    if (modal) modal.remove();
		    modal = document.createElement('div');
		    modal.id = modalId;
		    modal.className = 'modal-banner-status';
		    modal.style = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.18); z-index: 9999; display: flex; align-items: center; justify-content: center;';
		    modal.innerHTML = `
				<div style="background: white; border-radius: 18px; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; align-items: center; justify-content: flex-start;">
		            <img src='${empresa.logo}' alt='Logo Leo\'s Cake' style='width: 90px; height: 90px; object-fit: contain; margin-bottom: 0.5rem;'/>
		            <h2 style='margin: 0; color: #ff6b9d; font-family: "Segoe UI",sans-serif; font-size: 1.5rem; font-weight: bold;'>${empresa.nome}</h2>
		            <div style='font-size: 0.95rem; color: #333; margin-bottom: 0.5rem;'>${empresa.endereco}<br>${empresa.telefone}<br>${empresa.email}<br><a href='${empresa.website}' target='_blank' style='color:#007bff;text-decoration:none;'>${empresa.website}</a></div>
		            <div style='width: 100%;'>
		                <div id='banner-visual' style='margin: 0;'>${bannerText}</div>
		            </div>
					<div style='display: flex; align-items: center; gap: 0.7rem; margin-top: 0.5rem;'>
						<button onclick='navigator.clipboard.writeText("${bannerText.replace(/'/g,"&#39;")}"); this.innerText="Copiado!"; setTimeout(()=>this.innerText="Copiar texto",1200);' style='background: #007bff; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.7rem; font-size: 0.9rem; cursor: pointer;'>Copiar texto</button>
						<button onclick='window.dashboardApp.copiarBannerComoImagem("${orderId}", "${statusKey}")' style='background: #ff6b9d; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.7rem; font-size: 0.9rem; cursor: pointer;'>Copiar como imagem</button>
						<button onclick='window.dashboardApp.copiarBannerEmailHTML("${orderId}", "${statusKey}")' style='background: #28a745; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.7rem; font-size: 0.9rem; cursor: pointer;'>Copiar para e-mail</button>
						<label style='display: flex; align-items: center; gap: 0.3rem; font-size: 0.9rem;'>
							<input type='checkbox' ${hasBannerSent ? 'checked disabled' : ''} onchange='window.dashboardApp.confirmarEnvioBanner("${order.id}", "${statusKey}", this)' style='width: 16px; height: 16px;'> Confirmar envio
						</label>
						${hasBannerSent ? '<span style="color: #28a745; font-weight: 600;">✔️ Enviado</span>' : ''}
					</div>
		            <button onclick='document.getElementById("${modalId}").remove()' style='background: #6c757d; color: white; border: none; border-radius: 8px; padding: 0.75rem 2rem; font-size: 1rem; cursor: pointer; margin-top: 1rem;'>Fechar</button>
		        </div>
		    `;
		    document.body.appendChild(modal);
		};

		this.currentUser = null;
		this.products = [];
		this.clients = [];
		this.orders = [];
		this.despesas = [];
		this.receitas = [];
		this.stock = [];
		this.configuracoes = [];
		this.entregas = []; // Adicionado para evitar erro de undefined
		this.initialized = false;
		const storedLang = sessionStorage.getItem('lang');
		if (storedLang === 'pt-BR' || storedLang === 'en-US') {
			this.currentLang = storedLang;
		} else if (storedLang === 'pt') {
			this.currentLang = 'pt-BR';
			sessionStorage.setItem('lang', 'pt-BR');
		} else {
			this.currentLang = 'en-US';
			sessionStorage.setItem('lang', 'en-US');
		}
		const activeLang = typeof window.getCurrentLang === 'function' ? window.getCurrentLang() : null;
		if (typeof window.setLang === 'function' && activeLang !== this.currentLang) {
			window.setLang(this.currentLang);
		}
		if (document.documentElement) {
			document.documentElement.setAttribute('lang', this.currentLang);
		}
		this.supabase = null;
		this.cart = {};
		this.isVendasOnline = window.location.pathname.includes('vendas-online.html') || document.body.classList.contains('vendas-online');
		this.automatedEmailTimers = {};
	}
	async initialize() {
		try {
			console.log('🚀 Inicializando Dashboard...', this.isVendasOnline ? '(Modo Vendas Online)' : '(Modo Dashboard)');
			// Aguardar authSystem
			let attempts = 0;
			while (!window.authSystem?.isInitialized && attempts < 50) {
				await new Promise(resolve => setTimeout(resolve, 100));
				attempts++;
			}
			// No modo vendas online, não requer login
			if (!this.isVendasOnline && !window.authSystem?.isLoggedIn()) {
				window.location.href = 'index.html';
				return false;
			}
			// No modo vendas online, não carrega dados do usuário logado
			if (!this.isVendasOnline) {
				this.currentUser = await window.authSystem.getCurrentUser();
			}
			// Aguardar inicialização do Supabase
			let supabaseAttempts = 0;
			while (!window.supabaseClient && supabaseAttempts < 50) {
				console.log('⏳ Aguardando inicialização do Supabase...');
				// Tentar inicializar se ainda não foi feito
				if (window.initializeSupabase && !window.supabaseClient) {
					try {
						await window.initializeSupabase();
					} catch (error) {
						console.warn('⚠️ Erro ao inicializar Supabase:', error);
					}
				}
				await new Promise(resolve => setTimeout(resolve, 100));
				supabaseAttempts++;
			}
			if (!window.supabaseClient) {
				console.warn('⚠️ Supabase não inicializado, pulando real-time updates');
				this.supabase = null;
			} else {
				this.supabase = window.supabaseClient;
			}
			// Carregar dados
			await this.loadData();
			// Configurar UI baseado no tipo de usuário e modo
			this.setupUI();
			this.setupEventListeners();
			this.setupLanguageSwitcher();
			if (!this.isVendasOnline) {
				this.createStatsCards();
				this.createDataCards();
				// Removida chamada precoce de updateFollowUpEntregas() - será chamada após carregamento dos dados
				// Subscribe to real-time updates (apenas se Supabase estiver disponível)
				if (this.supabase) {
					let lastPedidoUpdate = 0;
					this.supabase
						.channel('pedidos_changes')
						.on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, async (payload) => {
							const now = Date.now();
							if (now - lastPedidoUpdate < 1000) {
								console.log('⏳ Ignorando atualização de pedido muito próxima');
								return;
							}
							lastPedidoUpdate = now;
							console.log('Pedido changed:', payload);
						await this.loadData(); // Reload all data
						this.loadPedidosStatusList(); // Update orders list
						if (document.getElementById('entregas-hoje')) {
							this.updateFollowUpEntregas(); // Update deliveries
						}
						this.updateStats(); // Update stats
						if (this.activeSection === 'entregas') {
							this.renderEntregasPage(); // Update deliveries page if active
						}
					})
					.subscribe();
				// Subscribe to real-time updates for entregas
				let lastEntregaUpdate = 0;
				this.supabase
					.channel('entregas_changes')
					.on('postgres_changes', { event: '*', schema: 'public', table: 'entregas' }, async (payload) => {
						const now = Date.now();
						if (now - lastEntregaUpdate < 1000) {
							console.log('⏳ Ignorando atualização de entrega muito próxima');
							return;
						}
						lastEntregaUpdate = now;
						console.log('Entrega changed:', payload);
						await this.loadData(); // Reload all data
						this.loadPedidosStatusList(); // Update orders list
						if (document.getElementById('entregas-hoje')) {
							this.updateFollowUpEntregas(); // Update deliveries
						}
						this.updateStats(); // Update stats
						if (this.activeSection === 'entregas') {
							this.renderEntregasPage(); // Update deliveries page if active
						}
					})
					.subscribe();
			}
			}
			if (this.supabase) {
				let lastConfiguracaoUpdate = 0;
				this.supabase
					.channel('configuracoes_changes')
					.on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes' }, async (payload) => {
						const now = Date.now();
						if (now - lastConfiguracaoUpdate < 500) {
							return;
						}
						lastConfiguracaoUpdate = now;
						await this.loadConfiguracoes();
						this.applyConfiguracoesRealtime(payload);
					})
					.subscribe();
			}
			window.addEventListener('languageChanged', () => this.updateAllTranslations());
			this.initialized = true;
			// Remover splash screen
			const splashScreen = document.getElementById('splash-screen');
			if (splashScreen) {
				const spinner = document.getElementById('splash-spinner');
				if (spinner) spinner.style.display = 'none';
				splashScreen.style.transition = 'opacity 0.5s';
				splashScreen.style.opacity = '0';
				setTimeout(() => splashScreen.style.display = 'none', 500);
			}
			// Renderizar página de vendas online se necessário
			if (this.isVendasOnline) {
				console.log('🛒 Renderizando página de vendas online...');
				setTimeout(() => this.renderVendasOnlinePage(), 1000);
			}
			return true;
		} catch (error) {
			console.error('❌ Erro ao inicializar:', error);
			return false;
		}
	}
	async loadData() {
		if (!this.supabase) {
			console.warn('⚠️ Supabase não disponível - sistema funcionando sem dados (modo offline)');
			// Inicializar arrays vazios para modo offline
			this.clients = [];
			this.products = [];
			this.orders = [];
			this.despesas = [];
			this.receitas = [];
			this.stock = [];
			this.configuracoes = [];
			this.entregas = [];
			this.initialized = false;
			console.log('✅ Sistema inicializado sem dados (modo offline)');
			return;
		}
		try {
			const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
			const isVendedor = role === 'sale' || role === 'vendedor';
			const isAdmin = role === 'admin';
			// Carregar clientes
			const { data: clientes, error: clientesError } = await this.supabase
				.from('clientes')
				.select('id, nome, telefone, email, endereco, canal, created_at')
				.order('created_at', { ascending: false })
				.limit(200); // Limitar para performance
			if (clientesError) {
				console.error('❌ Erro ao carregar clientes:', clientesError);
				this.clients = [];
			} else {
				this.clients = Array.isArray(clientes) ? clientes.filter(c => c && c.id) : [];
			}
			// Carregar produtos
			try {
				// Primeiro verificar se conseguimos listar as tabelas disponíveis
				const { data: tables, error: tablesError } = await this.supabase
					.from('produtos')
					.select('id, nome, preco, status_produto')
					.limit(1);
				if (tablesError) {
					console.error('❌ Erro na tabela produtos:', tablesError);
					console.log('❌ Código do erro:', tablesError.code);
					console.log('❌ Mensagem do erro:', tablesError.message);
					console.log('❌ Detalhes do erro:', tablesError.details);
					// Tentar uma query ainda mais simples
					const { data: simpleData, error: simpleError } = await this.supabase
						.from('produtos')
						.select('count')
						.limit(1);
					if (simpleError) {
						console.error('❌ Mesmo query simples falhou:', simpleError);
					}
					this.products = [];
				} else {
					// Carregar apenas campos essenciais primeiro para evitar timeout
					const selectFields = 'id, nome, preco, status_produto, categoria, descricao, estoque, custo, created_at';
					const { data: produtosBasicos, error: basicosError } = await this.supabase
						.from('produtos')
						.select(selectFields)
						.order('created_at', { ascending: false })
						.limit(50); // Reduzir limite para evitar timeout
					if (basicosError) {
						console.error('❌ Erro ao carregar produtos básicos:', basicosError);
						console.error('❌ Detalhes do erro:', JSON.stringify(basicosError, null, 2));
						this.products = [];
					} else {
						console.log('📦 Produtos básicos carregados:', produtosBasicos?.length || 0);
						console.log('📦 Primeiro produto:', produtosBasicos?.[0]);
						this.products = produtosBasicos || [];
						// Carregar fotos separadamente apenas se houver produtos
						if (this.products.length > 0) {
							// Carregar fotos com atraso maior
							const delay = this.isVendasOnline ? 2000 : 3000; // Delay ainda maior
							setTimeout(async () => {
								try {
									// Carregar fotos em lotes de 1 produto por vez para evitar timeout
									const loteSize = 1; // Apenas 1 por vez para máxima segurança
									for (let i = 0; i < this.products.length; i += loteSize) {
										const lote = this.products.slice(i, i + loteSize);
										const { data: fotosData, error: fotosError } = await this.supabase
											.from('produtos')
											.select('id, fotos')
											.in('id', lote.map(p => p.id))
											.single(); // Usar .single() para lote de 1
										if (fotosError) {
											console.error('❌ Erro ao carregar fotos do lote:', lote.map(p => p.id), fotosError);
											// Continuar sem as fotos ao invés de parar tudo
											continue;
										}
										if (fotosData) {
											const produto = this.products.find(p => p.id === fotosData.id);
											if (produto) {
												produto.fotos = fotosData.fotos;
												console.log(`✅ Foto carregada para produto: ${produto.nome}`);
											}
										}
										// Pausa maior entre lotes para evitar sobrecarga do servidor
										await new Promise(resolve => setTimeout(resolve, 500)); // 500ms entre cada foto
									}
									console.log('📦 Fotos carregadas em lotes menores');
									// Atualizar apenas a seção ativa se ela mostrar produtos
									if (this.activeSection === 'produtos' || this.activeSection === 'pedidos' || this.isVendasOnline) {
										// Em vez de re-renderizar completamente, apenas atualizar as imagens
										this.updateProductImages();
										// Para vendas online, também re-renderizar a página para garantir que tudo apareça
										if (this.isVendasOnline) {
											console.log('🔄 Re-renderizando página de vendas online após carregamento de fotos');
											await this.renderVendasOnlinePage();
										}
									}
								} catch (error) {
									console.warn('⚠️ Erro ao carregar fotos:', error);
								}
							}, delay); // Atraso maior para garantir que produtos básicos já carregaram
						}
					}
				}
			} catch (prodError) {
				console.error('❌ Exceção ao carregar produtos:', prodError);
				this.products = [];
			}
			// Carregar promoções ativas para vendas online
			if (this.isVendasOnline) {
				this.loadActivePromocoes();
			}
			// Carregar pedidos - NOTA: Campo vendedor_id não existe no schema atual
			// Todos os pedidos são carregados e a filtragem é feita nas entregas
			let pedidosQuery = this.supabase
				.from('pedidos')
				.select('id, numero_pedido, cliente_id, vendedor_id, data_pedido, data_entrega, hora_entrega, valor_total, valor_pago, valor_pendente, status, forma_pagamento, observacoes, idioma, email_sent_steps, created_at')
				.order('created_at', { ascending: false })
				.limit(100); // Limitar para performance
			// Filtragem por vendedor logado
			if (isVendedor && this.currentUser?.id) {
				pedidosQuery = pedidosQuery.eq('vendedor_id', this.currentUser.id);
				console.log('👤 Filtrando pedidos para vendedor:', this.currentUser.id);
			} else {
				console.log('🔎 Carregando pedidos sem filtro de vendedor.');
			}
			// Executar query dos pedidos
			const { data: pedidos, error: pedidosError } = await pedidosQuery;
			if (pedidosError) {
				console.error('❌ Erro ao carregar pedidos:', pedidosError);
				this.orders = [];
			} else {
				console.log('📋 Pedidos carregados:', pedidos?.length || 0);
				if (pedidos && pedidos.length) {
					pedidos.forEach(p => {
						console.log(`Pedido: id=${p.id}, vendedor_id=${p.vendedor_id}, cliente_id=${p.cliente_id}`);
					});
					console.log('Usuário logado:', this.currentUser?.id);
				}
				// Processar pedidos para incluir cliente_nome e vendedor_nome
				this.orders = await Promise.all((pedidos || []).map(async (pedido) => {
					let vendedorNome = 'Vendedor';
					if (pedido.vendedor_id) {
						const vendedor = this.users?.find(u => u.id == pedido.vendedor_id);
						if (vendedor) {
							vendedorNome = vendedor.nome;
						} else {
							// Buscar nome do vendedor no banco se não estiver em cache
							try {
								const { data: vendedorData, error: vendedorError } = await this.supabase
									.from('usuarios')
									.select('nome')
									.eq('id', pedido.vendedor_id)
									.single();
								if (!vendedorError && vendedorData) {
									vendedorNome = vendedorData.nome;
								}
							} catch (e) {
								console.warn('Erro ao buscar nome do vendedor:', e);
							}
						}
					}
					let clienteNome = t('vendas_online.cliente_default');
					let clienteEmail = '';
					if (pedido.cliente_id) {
						const cliente = this.clients?.find(c => c.id == pedido.cliente_id);
						if (cliente) {
							clienteNome = cliente.nome;
							clienteEmail = cliente.email || '';
						} else {
							// Buscar nome e email do cliente no banco se não estiver em cache
							try {
								const { data: clienteData, error: clienteError } = await this.supabase
									.from('clientes')
									.select('nome, email')
									.eq('id', pedido.cliente_id)
									.single();
								if (!clienteError && clienteData) {
									clienteNome = clienteData.nome;
									clienteEmail = clienteData.email || '';
								}
							} catch (e) {
								console.warn('Erro ao buscar dados do cliente:', e);
							}
						}
					}
					return {
						...pedido,
						vendedor_nome: vendedorNome,
						cliente_nome: clienteNome,
						email: clienteEmail
					};
				}));
			}
			// Carregar entregas - filtrar apenas entregas dos pedidos do usuário
			let entregasQuery = this.supabase
				.from('entregas')
				.select(`
					*,
					pedidos (
						id,
						numero_pedido,
						cliente_id,
						valor_total,
						status,
						data_entrega,
						hora_entrega,
						clientes (
							nome,
							telefone,
							endereco
						)
					)
				`)
				.order('data_entrega', { ascending: true })
				.limit(200);
			// Se for vendedor, filtrar apenas entregas dos seus pedidos
			// NOTA: Filtragem por vendedor será implementada quando o schema for atualizado
			// if (isVendedor && this.currentUser?.id) {
			//     const vendedorPedidosIds = this.orders.map(o => o.id);
			//     console.log('👤 Vendedor logado:', this.currentUser.id, '- Pedidos encontrados:', vendedorPedidosIds.length);
			//     if (vendedorPedidosIds.length > 0) {
			//         entregasQuery = entregasQuery.in('pedido_id', vendedorPedidosIds);
			//         console.log('🚚 Filtrando entregas para pedidos do vendedor:', vendedorPedidosIds);
			//     } else {
			//         // Se não há pedidos, não carregar entregas
			//         console.log('🚚 Vendedor sem pedidos, pulando carregamento de entregas');
			//         this.entregas = [];
			//     }
			// } else {
			//     console.log('👑 Admin logado - carregando todas as entregas');
			// }
			console.log('🚚 Carregando todas as entregas (filtragem por vendedor desabilitada temporariamente)');
			const { data: entregas, error: entregasError } = await entregasQuery;
			if (entregasError) {
				console.error('❌ Erro ao carregar entregas:', entregasError);
				this.entregas = [];
			} else {
				this.entregas = Array.isArray(entregas) ? entregas : [];
				console.log('🚚 Entregas carregadas:', this.entregas.length);
				// Log dos status das entregas para debug
				const statusCount = this.entregas.reduce((acc, entrega) => {
					acc[entrega.status] = (acc[entrega.status] || 0) + 1;
					return acc;
				}, {});
				console.log('📊 Status das entregas:', statusCount);
				// Log das entregas com status 'entregue' para verificar se estão sendo carregadas
				const entregues = this.entregas.filter(e => e.status === 'entregue');
				console.log('✅ Entregas marcadas como entregues:', entregues.length);
				if (entregues.length > 0) {
					console.log('📋 Detalhes das entregas entregues:', entregues.map(e => ({ id: e.id, pedido_id: e.pedido_id, status: e.status })));
				}
			}
			// Carregar despesas
			const { data: despesas, error: despesasError } = await this.supabase
				.from('despesas')
				.select('id, descricao, valor, data_despesa, categoria, created_at')
				.order('data_despesa', { ascending: false })
				.limit(100); // Limitar para performance
			if (despesasError) {
				console.error('❌ Erro ao carregar despesas:', despesasError);
				this.despesas = [];
			} else {
				this.despesas = despesas || [];
			}
			// Carregar receitas
			// Carregar receitas
			const { data: receitas, error: receitasError } = await this.supabase
				.from('receitas')
				.select('id, descricao, valor, data_recebimento, created_at')
				.order('data_recebimento', { ascending: false })
				.limit(100); // Limitar para performance
			if (receitasError) {
				console.error('❌ Erro ao carregar receitas:', receitasError);
				this.receitas = [];
			} else {
				this.receitas = receitas || [];
			}
			// Atualizar entregas após carregamento dos dados
			if (document.getElementById('entregas-hoje')) {
				this.updateFollowUpEntregas();
			}
			// Carregar estoque
			const { data: estoque, error: estoqueError } = await this.supabase
				.from('estoque')
				.select('*')
				.order('created_at', { ascending: false });
			if (estoqueError) {
				console.error('❌ Erro ao carregar estoque:', estoqueError);
				this.stock = [];
			} else {
				this.stock = estoque || [];
				console.log('📦 Estoque carregado:', this.stock.length);
			}
			// Carregar configurações
			const { data: configuracoes, error: configError } = await this.supabase
				.from('configuracoes')
				.select('*');
			if (configError) {
				console.error('❌ Erro ao carregar configurações:', configError);
				this.configuracoes = [];
			} else {
				this.configuracoes = configuracoes || [];
			}
		} catch (error) {
			console.error('Erro ao carregar dados:', error);
		}
	}
	updateProductImages() {
		console.log('🖼️ Iniciando updateProductImages() com', this.products?.length || 0, 'produtos');
		const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
		const buildImage = (foto, nome) => `<img loading="lazy" decoding="async" fetchpriority="low" data-src="${foto}" src="${placeholder}" style="min-width: 100%; height: 220px; object-fit: contain; background: #f8f9fa;" alt="${translateProductName(nome)}">`;
		const renderInto = (id, fotos, nome) => {
			const el = document.getElementById(id);
			if (!el) {
				return null;
			}
			el.innerHTML = fotos.map(foto => buildImage(foto, nome)).join('');
			return el;
		};
		this.products.forEach(produto => {
			if (!produto.fotos) {
				return;
			}
			let fotos = [];
			try { fotos = JSON.parse(produto.fotos); } catch {}
			if (!Array.isArray(fotos) || fotos.length === 0) {
				return;
			}
			renderInto(`carousel-${produto.id}`, fotos, produto.nome);
			const pedidosCarousel = renderInto(`market-carousel-${produto.id}`, fotos, produto.nome);
			if (pedidosCarousel) {
				this.ensureCarouselControls(pedidosCarousel.parentElement, 'produto', produto.id, fotos.length);
			}
			const onlineCarousel = renderInto(`online-carousel-${produto.id}`, fotos, produto.nome);
			if (onlineCarousel) {
				onlineCarousel.style.width = `${fotos.length * 100}%`;
				this.ensureCarouselControls(onlineCarousel.parentElement, 'online', produto.id, fotos.length);
			}
		});
		this.lazyLoadProductImages();
	}
	ensureCarouselControls(container, context, produtoId, total) {
		if (!container || total <= 1) {
			return;
		}
		const prevAction = context === 'online' ? 'prev-online-photo' : 'prev-produto-photo';
		const nextAction = context === 'online' ? 'next-online-photo' : 'next-produto-photo';
		if (container.querySelector(`button[data-action="${prevAction}"][data-id="${produtoId}"]`)) {
			return;
		}
		container.insertAdjacentHTML('beforeend', `
			<button data-action="${prevAction}" data-id="${produtoId}" data-total="${total}" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">‹</button>
			<button data-action="${nextAction}" data-id="${produtoId}" data-total="${total}" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">›</button>
		`);
	}
	lazyLoadProductImages() {
		const images = document.querySelectorAll('img[data-src]');
		if (images.length === 0) {
			return;
		}
		if (!('IntersectionObserver' in window)) {
			images.forEach(img => {
				const dataSrc = img.getAttribute('data-src');
				if (dataSrc) {
					img.src = dataSrc;
					img.removeAttribute('data-src');
				}
			});
			return;
		}
		if (!this.productImageObserver) {
			this.productImageObserver = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const target = entry.target;
						const dataSrc = target.getAttribute('data-src');
						if (dataSrc) {
							target.src = dataSrc;
							target.removeAttribute('data-src');
						}
						observer.unobserve(target);
					}
				});
			}, { rootMargin: '500px' });
		}
		const observer = this.productImageObserver;
		images.forEach(img => observer.observe(img));
	}
	setupUI() {
		// Modo vendas online: mostrar apenas produtos
		if (this.isVendasOnline) {
			// Não precisamos chamar setupUI para vendas online, pois a página já renderiza diretamente
			return;
		}
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isVendedor = role === 'sale' || role === 'vendedor';
		// Controlar visibilidade dos menus na navbar
		const navBtns = {
			dashboard: document.querySelector('[data-section="dashboard"]'),
			clientes: document.querySelector('[data-section="clientes"]'),
			produtos: document.querySelector('[data-section="produtos"]'),
			pedidos: document.querySelector('[data-section="pedidos"]'),
			estoque: document.querySelector('[data-section="estoque"]'),
			entregas: document.querySelector('[data-section="entregas"]')
		};
		if (isVendedor) {
			// Vendedor: Dashboard, Pedidos e Entregas
			if (navBtns.dashboard) navBtns.dashboard.style.display = 'flex';
			if (navBtns.pedidos) navBtns.pedidos.style.display = 'flex';
			if (navBtns.entregas) navBtns.entregas.style.display = 'flex';
			if (navBtns.clientes) navBtns.clientes.style.display = 'none';
			if (navBtns.produtos) navBtns.produtos.style.display = 'none';
			if (navBtns.estoque) navBtns.estoque.style.display = 'none';
		} else {
			// Admin: Todos os menus
			Object.values(navBtns).forEach(btn => {
				if (btn) btn.style.display = 'flex';
			});
		}
		// Configurar dropdown de usuário
		const userNameEl = document.getElementById('dropdown-user-name');
		const userAvatarEl = document.getElementById('user-avatar');
		const welcomeName = document.getElementById('welcome-name');
		const userType = document.getElementById('dropdown-user-type');
		const configBtn = document.getElementById('config-btn');
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
				// Removido: usuariosBtn.classList.add('show') - será controlado pelo botão configurações
			} else if (isVendedor) {
				userType.textContent = this.currentLang === 'pt-BR' ? 'Vendedor' : 'Salesperson';
			} else {
				userType.textContent = this.currentLang === 'pt-BR' ? 'Usuário' : 'User';
			}
		}
		// Ocultar botão de configurações para vendedores
		if (configBtn) {
			if (isVendedor) {
				configBtn.style.display = 'none';
			} else {
				configBtn.style.display = 'flex';
			}
		}
		// Configurar eventos do dropdown
		const profileBtn = document.getElementById('profile-btn');
		if (profileBtn) {
			profileBtn.onclick = () => {
				window.dashboardApp.showEditUserModal();
			};
		}
		// Configurações só são visíveis para admins (já controlado no display acima)
		if (configBtn && !isVendedor) {
			// Event listener movido para dashboard.html para evitar conflitos
		}
		if (usuariosBtn) {
			// Event listener movido para dashboard.html para evitar conflitos
		}
		const logoutBtn = document.getElementById('logout-btn');
		if (logoutBtn) logoutBtn.onclick = () => {
			window.authSystem.logout();
			window.location.href = 'index.html';
		};
		this.updateWelcomeMessage();
		const pageTitle = document.getElementById('page-title');
		if (pageTitle) pageTitle.textContent = this.t('section.dashboard');
		// Verificar se o usuário tem senha padrão e mostrar aviso
		if (this.currentUser?.senha_padrao) {
			this.showPasswordChangeWarning();
		}
	}
	updateWelcomeMessage() {
		const welcomeText = document.querySelector('.welcome-text');
		if (welcomeText) {
			const safeName = sanitizeHTML(this.currentUser.nome || 'Usuário');
			welcomeText.innerHTML = `${this.t('dashboard.bem_vindo')}, <strong>${safeName}</strong>!`;
		}
	}
	setupEventListeners() {
		console.log('🎧 Configurando event listeners...');
		// Pular configuração de elementos que não existem no modo vendas online
		if (!this.isVendasOnline) {
			const userMenuBtn = document.getElementById('user-menu-button');
			const userDropdown = document.getElementById('user-dropdown');
			if (userMenuBtn) {
				userMenuBtn.addEventListener('click', (e) => {
					e.stopPropagation();
					userDropdown?.classList.toggle('show');
				});
			}
			document.addEventListener('click', (e) => {
				if (userDropdown && !userMenuBtn?.contains(e.target) && !userDropdown.contains(e.target)) {
					userDropdown.classList.remove('show');
				}
			});
			// Event listeners para botões de navegação
			console.log('🔘 Configurando botões de navegação...');
			document.querySelectorAll('.nav-btn').forEach(btn => {
				const section = btn.getAttribute('data-section');
				console.log('🔘 Botão encontrado:', section);
				btn.addEventListener('click', (e) => {
					const sectionName = e.currentTarget.getAttribute('data-section');
					this.switchSection(sectionName);
				});
			});
			// Event listener específico para acompanhar pedidos
			const acompanharBtn = document.getElementById('acompanhar-pedidos-btn');
			if (acompanharBtn) {
				acompanharBtn.addEventListener('click', () => {
					window.open('acompanhar-pedido.html', '_blank');
				});
			}
		}
	}
	setupLanguageSwitcher() {
		const flagWrappers = document.querySelectorAll('.flag-wrapper');
		flagWrappers.forEach(wrapper => {
			wrapper.addEventListener('click', () => {
				const lang = wrapper.getAttribute('data-lang') === 'pt' ? 'pt-BR' : 'en-US';
				this.currentLang = lang;
				sessionStorage.setItem('lang', lang);
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
		if (targetSection) {
			targetSection.style.display = 'block';
		}
		const activeBtn = document.querySelector(`[data-section="${section}"]`);
		if (activeBtn) activeBtn.style.color = '#ff6b9d';
		const pageTitle = document.getElementById('page-title');
		if (pageTitle) pageTitle.textContent = this.t(`section.${section}`);
		// Definir seção ativa
		this.activeSection = section;
		// Renderizar página específica
		setTimeout(() => {
			if (section === 'produtos') {
				this.renderProdutosPage();
			}
			if (section === 'clientes') {
				this.renderClientesPage();
			}
			if (section === 'pedidos') {
				this.renderPedidosPage();
			}
			if (section === 'entregas') {
				this.renderEntregasPage();
			}
		}, 0);
	}
	t(key) {
		return typeof window.t === 'function' ? window.t(key) : key;
	}
	showAlert(key, replacements = {}) {
		let message = this.t(key);
		// Substituir placeholders {variavel} na mensagem
		Object.keys(replacements).forEach(placeholder => {
			message = message.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacements[placeholder]);
		});
		alert(message);
	}
	formatCurrency(value) {
		return `CAD$ ${parseFloat(value || 0).toFixed(2)}`;
	}
	formatDate(dateString) {
		if (!dateString) return '';
		const dateStr = dateString.includes('T') ? dateString.split('T')[0] : dateString;
		const date = new Date(dateStr + 'T00:00:00');
		const lang = this.currentLang === 'pt-BR' ? 'pt-BR' : 'en-US';
		return date.toLocaleDateString(lang, { day: '2-digit', month: 'long', year: 'numeric' });
	}
	normalizeOrderStatus(status) {
		if (!status) return 'pendente';
		const normalized = status.toString().toLowerCase();
		if (normalized === 'pago') {
			return 'producao';
		}
		return normalized;
	}
	getStatusOptions() {
		const primaryStatuses = this.getTimelineStatuses().map(step => ({
			value: step.key,
			label: step.label,
			color: step.color
		}));
		return [
			...primaryStatuses,
			{ value: 'cancelado', label: 'Pedido Cancelado', color: '#dc3545' }
		];
	}
	getTimelineStatuses() {
		return [
			{ key: 'pendente', label: 'Pedido Recebido', emoji: '📥', color: '#ffc107', description: 'Pedido recebido e aguardando validação do time.' },
			{ key: 'confirmado', label: 'Pedido Confirmado', emoji: '✅', color: '#28a745', description: 'Detalhes e agenda confirmados. Cliente deve finalizar o pagamento.' },
			{ key: 'producao', label: 'Em Produção', emoji: '👩‍🍳', color: '#fd7e14', description: 'Pagamento validado e pedido em preparação.' },
			{ key: 'saiu_entrega', label: 'Saiu para Entrega', emoji: '🚚', color: '#17a2b8', description: 'Pedido saiu para entrega ao cliente.' },
			{ key: 'entregue', label: 'Pedido Entregue', emoji: '🎁', color: '#20c997', description: 'Pedido finalizado e entregue ao cliente.' }
		];
	}
	getPaymentStatus(order) {
		const total = Math.max(0, parseFloat(order?.valor_total || 0));
		const paid = Math.max(0, parseFloat(order?.valor_pago || 0));
		const remaining = Math.max(0, total - paid);
		if (!total) {
			return {
				key: 'no_total',
				label: 'Defina o valor total',
				shortLabel: 'Sem valor',
				color: '#6c757d',
				textColor: '#ffffff',
				progress: 0,
				remaining,
				totalAmount: total,
				paidAmount: paid,
				hint: 'Informe o valor para acompanhar pagamentos'
			};
		}
		if (paid <= 0) {
			return {
				key: 'pending',
				label: 'Pagamento Pendente',
				shortLabel: '0%',
				color: '#dc3545',
				textColor: '#ffffff',
				progress: 0,
				remaining,
				totalAmount: total,
				paidAmount: paid,
				hint: 'Aguardando confirmação do pagamento'
			};
		}
		if (paid < total) {
			const progress = Math.min(100, Math.round((paid / total) * 100));
			return {
				key: 'partial',
				label: 'Pagamento Parcial',
				shortLabel: `${progress}%`,
				color: '#ffc107',
				textColor: '#212529',
				progress,
				remaining,
				totalAmount: total,
				paidAmount: paid,
				hint: `Faltam R$ ${remaining.toFixed(2)}`
			};
		}
		return {
			key: 'paid',
			label: 'Pagamento Confirmado',
			shortLabel: '100%',
			color: '#28a745',
			textColor: '#ffffff',
			progress: 100,
			remaining: 0,
			totalAmount: total,
			paidAmount: paid,
			hint: 'Pagamento concluído'
		};
	}
	getPaymentMethodLabel(method) {
		const normalized = (method || '').toLowerCase();
		const labels = {
			dinheiro: this.t('finalizar.dinheiro') || 'Dinheiro',
			transferencia: this.t('finalizar.transferencia') || 'Transferência',
			cartao: this.t('finalizar.cartao') || 'Cartão'
		};
		return labels[normalized] || method || this.t('finalizar.forma_pagamento');
	}
	determineInitialStatus({ formaPagamento, tipoEntrega, fullPayment, sinal }) {
		const metodo = (formaPagamento || '').toLowerCase();
		const aceitaRegras = ['dinheiro', 'transferencia', 'cartao'].includes(metodo);
		const hasPagamento = fullPayment || (parseFloat(sinal || 0) > 0);
		if (!aceitaRegras) {
			return 'pendente';
		}
		if (tipoEntrega === 'retirada' && fullPayment) {
			return 'entregue';
		}
		if (tipoEntrega === 'entrega' && hasPagamento) {
			return 'confirmado';
		}
		return 'pendente';
	}
	scheduleStatusEmail(orderId, statusKey, delayMs = 0) {
		console.log(`📧 scheduleStatusEmail chamado: orderId=${orderId}, statusKey=${statusKey}, delayMs=${delayMs}`);
		if (!orderId || !statusKey) {
			console.log(`📧 scheduleStatusEmail: orderId ou statusKey inválidos`);
			return;
		}
		if (!this.automatedEmailTimers) {
			this.automatedEmailTimers = {};
		}
		const timerKey = `${orderId}-${statusKey}`;
		if (this.automatedEmailTimers[timerKey]) {
			clearTimeout(this.automatedEmailTimers[timerKey]);
		}
		const trigger = async () => {
			console.log(`📧 Executando trigger para ${timerKey}`);
			delete this.automatedEmailTimers[timerKey];
			try {
				await this.enviarEmailStatus(orderId, statusKey, true);
			} catch (error) {
				console.warn('Erro ao enviar email automático:', error);
			}
		};
		if (delayMs <= 0) {
			console.log(`📧 Executando trigger imediatamente`);
			trigger();
			return;
		}
		this.automatedEmailTimers[timerKey] = setTimeout(trigger, delayMs);
	}
	async triggerRecebimentoEmail(orderId) {
		console.log(`📧 triggerRecebimentoEmail chamado: orderId=${orderId}`);
		if (!orderId) {
			console.log(`📧 triggerRecebimentoEmail: orderId inválido`);
			return;
		}

		// Aguardar um pouco para garantir que os scripts sejam carregados
		await new Promise(resolve => setTimeout(resolve, 100));

		try {
			await this.enviarEmailStatus(orderId, 'recebido');
		} catch (error) {
			console.warn('Erro ao enviar email de recebimento:', error);
		}
	}
	async handleStatusEmailTriggers(orderId, newStatus) {
		console.log(`📧 handleStatusEmailTriggers chamado: orderId=${orderId}, newStatus=${newStatus}`);
		const normalized = this.normalizeOrderStatus(newStatus);
		console.log(`📧 Status normalizado: ${normalized}`);
		const fifteenMinutes = 15 * 60 * 1000;

		// Buscar o pedido para verificar emails já enviados
		let order;
		try {
			// Tentar buscar com email_sent_steps, se falhar, buscar sem
			let query = this.supabase
				.from('pedidos')
				.select('id, email_sent_steps')
				.eq('id', orderId);

			let { data, error } = await query.single();

			// Se a coluna não existir, buscar apenas o id
			if (error && error.code === '42703') {
				console.log('📧 Coluna email_sent_steps não existe, buscando apenas id');
				const fallbackQuery = await this.supabase
					.from('pedidos')
					.select('id')
					.eq('id', orderId)
					.single();

				if (fallbackQuery.error) {
					console.error('Erro ao buscar pedido:', fallbackQuery.error);
					return;
				}

				order = { ...fallbackQuery.data, email_sent_steps: [] };
			} else if (error && error.code !== 'PGRST116') {
				console.error('Erro ao buscar pedido para verificação de emails:', error);
				return;
			} else {
				order = data || { email_sent_steps: [] };
			}

			console.log(`📧 Pedido encontrado:`, order);
		} catch (error) {
			console.error('Erro ao verificar emails enviados:', error);
			return;
		}

		const emailAlreadySent = order.email_sent_steps && order.email_sent_steps.includes(normalized);
		console.log(`📧 Email já enviado para ${normalized}? ${emailAlreadySent}`);

		console.log(`📧 Verificando se status requer email: ${normalized}`);
		const statusRequerEmail = ['confirmado', 'producao', 'saiu_entrega', 'entregue'].includes(normalized);
		console.log(`📧 Status requer email? ${statusRequerEmail}`);

		if (normalized === 'confirmado') {
			console.log(`📧 Processando status confirmado`);
			console.log(`📧 Email já enviado? ${emailAlreadySent}`);
			if (emailAlreadySent) {
				console.log(`📧 Mostrando notificação: email já enviado para confirmado`);
				this.showEmailAlreadySentNotification('confirmado');
			} else {
				console.log(`📧 Agendando email para confirmado com delay 0`);
				this.scheduleStatusEmail(orderId, 'confirmado', 0);
			}
		}
		if (normalized === 'producao') {
			if (emailAlreadySent) {
				this.showEmailAlreadySentNotification('producao');
			} else {
				this.scheduleStatusEmail(orderId, 'producao', 0);
			}
		}
		if (normalized === 'saiu_entrega') {
			if (emailAlreadySent) {
				this.showEmailAlreadySentNotification('saiu_entrega');
			} else {
				this.scheduleStatusEmail(orderId, 'saiu_entrega', 0);
			}
		}
		if (normalized === 'entregue') {
			if (emailAlreadySent) {
				this.showEmailAlreadySentNotification('entregue');
			} else {
				// Temporariamente reduzido para 0ms para testes - depois voltar para fifteenMinutes
				this.scheduleStatusEmail(orderId, 'entregue', 0); // Mudar de volta para fifteenMinutes após testes
			}
			// Email de agradecimento sempre é enviado após entrega, independente se já foi enviado
			this.scheduleStatusEmail(orderId, 'agradecimento', 48 * 60 * 60 * 1000);
		}
	}
	showEmailAlreadySentNotification(status) {
		const statusLabels = {
			'confirmado': 'Pedido Confirmado',
			'producao': 'Em Produção',
			'saiu_entrega': 'Saiu para Entrega',
			'entregue': 'Entregue'
		};

		const statusLabel = statusLabels[status] || status;

		// Criar notificação temporária
		const notification = document.createElement('div');
		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: linear-gradient(135deg, #ffc107, #ff8c00);
			color: #000;
			padding: 15px 20px;
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0,0,0,0.3);
			z-index: 10000;
			font-family: 'Segoe UI', Arial, sans-serif;
			font-size: 14px;
			max-width: 350px;
			border-left: 4px solid #ff6b00;
		`;

		notification.innerHTML = `
			<div style="display: flex; align-items: center; gap: 10px;">
				<span style="font-size: 18px;">📧</span>
				<div>
					<strong>Email já enviado!</strong><br>
					O email de "${statusLabel}" já foi enviado ao cliente anteriormente.
				</div>
			</div>
		`;

		document.body.appendChild(notification);

		// Remover automaticamente após 5 segundos
		setTimeout(() => {
			if (notification.parentNode) {
				notification.style.transition = 'opacity 0.5s ease-out';
				notification.style.opacity = '0';
				setTimeout(() => {
					if (notification.parentNode) {
						notification.parentNode.removeChild(notification);
					}
				}, 500);
			}
		}, 5000);

		// Também mostrar no console
		console.log(`📧 Email de "${statusLabel}" já foi enviado anteriormente para este pedido`);
	}
	getStockSummary() {
		const minStock = parseInt(this.configuracoes.find(c => c.chave === 'estoque_minimo_warning')?.valor || 5);
		const totalStock = this.products.reduce((sum, p) => sum + (p.estoque || 0), 0);
		const lowStock = this.products.filter(p => (p.estoque || 0) < minStock).length;
		if (lowStock > 0) {
			return `${totalStock} ⚠️ ${lowStock} baixo`;
		} else {
			return totalStock.toString();
		}
	}
	getStatusColor(status) {
		const colors = {
			'pendente': '#FFC107',
			'confirmado': '#007bff',
			'pago': '#28a745',
			'producao': '#FF9800',
			'saiu_entrega': '#17a2b8',
			'entregue': '#20c997',
			'cancelado': '#dc3545'
		};
		return colors[status] || '#6c757d';
	}
	createStatsCards() {
		const statsGrid = document.getElementById('stats-grid');
		if (!statsGrid) return;
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isVendedor = role === 'sale' || role === 'vendedor';
		const isAdmin = role === 'admin';
		// Filtrar dados baseado no role do usuário
		let ordersToUse = this.orders;
		if (isVendedor && this.currentUser?.id) {
			// Filtrar apenas pedidos do vendedor logado
			ordersToUse = this.orders.filter(order =>
				order.vendedor_id && order.vendedor_id == this.currentUser.id
			);
			console.log(`👤 Vendedor logado - calculando estatísticas com ${ordersToUse.length} pedidos próprios`);
		} else if (isAdmin) {
			console.log('👑 Admin logado - mostrando todas as estatísticas');
			ordersToUse = this.orders;
		}
		const despesasToUse = isVendedor ? [] : this.despesas; // Vendedores não veem despesas gerais
		const receitasToUse = isVendedor ? [] : this.receitas; // Vendedores não veem receitas gerais
		// Contagem por status
		const statusCounts = {
			pendente: 0,
			confirmado: 0,
			producao: 0,
			entregue: 0,
			cancelado: 0
		};
		let legacyPago = 0;
		ordersToUse.forEach(order => {
			const normalized = this.normalizeOrderStatus(order.status);
			if (statusCounts[normalized] !== undefined) {
				statusCounts[normalized]++;
			}
			if (order.status === 'pago') {
				legacyPago++;
			}
		});
		// Cálculo valores
		let totalPago = 0;
		let totalAReceber = 0;
		let totalCustos = 0;
		let totalDespesas = 0;
		let totalReceitas = 0;
		const currentMonth = new Date().toISOString().slice(0, 7);
		// Calcular receitas dos pedidos
		ordersToUse.forEach(o => {
			const valorTotal = parseFloat(o.valor_total || 0);
			const valorPago = parseFloat(o.valor_pago || 0);
			const statusAtual = this.normalizeOrderStatus(o.status);
			if (statusAtual === 'cancelado' || statusAtual === 'pendente') {
				return;
			}
			if (statusAtual === 'entregue') {
				totalPago += valorPago;
				totalReceitas += valorTotal;
				if (valorPago < valorTotal) {
					totalAReceber += (valorTotal - valorPago);
				}
			} else if (statusAtual === 'producao') {
				totalReceitas += valorTotal;
				if (valorPago > 0) {
					totalPago += valorPago;
					if (valorPago < valorTotal) {
						totalAReceber += (valorTotal - valorPago);
					}
				} else {
					totalAReceber += valorTotal;
				}
			} else if (statusAtual === 'confirmado') {
				if (valorPago > 0) {
					totalPago += valorPago;
					totalAReceber += (valorTotal - valorPago);
				} else {
					totalAReceber += valorTotal;
				}
			}
		});
		// Calcular custos dos produtos vendidos baseado nos custos dos produtos
		// Para cada pedido pago/entregue/producao, calcular o custo dos produtos
		ordersToUse.forEach(order => {
			const statusAtual = this.normalizeOrderStatus(order.status);
			if (statusAtual === 'entregue' || statusAtual === 'producao') {
				// Aqui precisaríamos dos itens do pedido para calcular custos
				// Por enquanto, vamos estimar baseado nos produtos
				const produtosDoPedido = order.produtos || [];
				produtosDoPedido.forEach(item => {
					const produto = this.products.find(p => p.id === item.produto_id);
					if (produto && produto.custo) {
						totalCustos += parseFloat(produto.custo) * (item.quantidade || 1);
					}
				});
			}
		});
		// Se não conseguiu calcular custos dos produtos, usar despesas com categoria 'produtos' como fallback
		if (totalCustos === 0) {
			despesasToUse.forEach(despesa => {
				const despesaMonth = despesa.data_despesa.slice(0, 7);
				if (despesaMonth === currentMonth && despesa.categoria === 'produtos') {
					totalCustos += parseFloat(despesa.valor || 0);
				}
			});
		}
		// Somar despesas do mês atual
		despesasToUse.forEach(despesa => {
			const despesaMonth = despesa.data_despesa.slice(0, 7);
			if (despesaMonth === currentMonth && despesa.categoria !== 'produtos') {
				totalDespesas += parseFloat(despesa.valor || 0);
			}
		});
		// Somar receitas adicionais
		receitasToUse.forEach(receita => {
			const receitaMonth = receita.data_recebimento.slice(0, 7);
			if (receitaMonth === currentMonth) {
				totalReceitas += parseFloat(receita.valor || 0);
			}
		});
		// Cards Monetários - filtrar baseado no role
		let monetaryCards = [];
		if (isVendedor) {
			// Vendedores veem apenas: Total Pago, A Receber
			monetaryCards = [
				{ icon: 'fa-hand-holding-usd', label: 'Total Pago', value: this.formatCurrency(totalPago) },
				{ icon: 'fa-money-check-alt', label: 'A Receber', value: this.formatCurrency(totalAReceber) }
			];
		} else {
			// Admins veem todos os cards monetários
			monetaryCards = [
				{ icon: 'fa-hand-holding-usd', label: 'Total Pago', value: this.formatCurrency(totalPago) },
				{ icon: 'fa-money-check-alt', label: 'A Receber', value: this.formatCurrency(totalAReceber) },
				{ icon: 'fa-money-bill-wave', label: 'Custos', value: this.formatCurrency(totalCustos) },
				{ icon: 'fa-chart-line', label: 'Receitas', value: this.formatCurrency(totalReceitas), id: 'card-receitas' },
				{ icon: 'fa-file-invoice-dollar', label: 'Despesas', value: this.formatCurrency(totalDespesas), id: 'card-despesas' },
				{ icon: 'fa-coins', label: 'Lucro', value: this.formatCurrency(totalReceitas - totalCustos - totalDespesas) },
				{ icon: 'fa-boxes', label: 'Estoque', value: this.getStockSummary(), id: 'card-estoque' }
			];
		}
		// Cards Operacionais - filtrar baseado no role
		let operationalCards = [];
		if (isVendedor) {
			// Vendedores veem apenas cards relacionados aos seus pedidos
			operationalCards = [
				{ icon: 'fa-truck', label: 'Entregas Hoje', value: this.getDeliveriesToday() },
				{ icon: 'fa-clock', label: 'Pendentes', value: statusCounts.pendente },
				{ icon: 'fa-user-check', label: 'Confirmados', value: statusCounts.confirmado },
				{ icon: 'fa-cog', label: 'Em Produção', value: this.getOrdersInProduction() },
				{ icon: 'fa-money-bill-wave', label: 'Em Produção', value: statusCounts.producao || legacyPago },
				{ icon: 'fa-check-circle', label: 'Entregue', value: statusCounts.entregue },
				{ icon: 'fa-times-circle', label: 'Cancelados', value: statusCounts.cancelado }
			];
		} else {
			// Admins veem todos os cards operacionais
			operationalCards = [
				{ icon: 'fa-users', label: 'Clientes', value: this.clients.length },
				{ icon: 'fa-cookie-bite', label: 'Produtos', value: this.products.length },
				{ icon: 'fa-truck', label: 'Entregas Hoje', value: this.getDeliveriesToday() },
				{ icon: 'fa-clock', label: 'Pendentes', value: statusCounts.pendente },
				{ icon: 'fa-user-check', label: 'Confirmados', value: statusCounts.confirmado },
				{ icon: 'fa-cog', label: 'Em Produção', value: this.getOrdersInProduction() },
				{ icon: 'fa-money-bill-wave', label: 'Em Produção', value: statusCounts.producao || legacyPago },
				{ icon: 'fa-check-circle', label: 'Entregue', value: statusCounts.entregue },
				{ icon: 'fa-times-circle', label: 'Cancelados', value: statusCounts.cancelado }
			];
		}
		// Renderizar os 4 cards principais
		statsGrid.innerHTML = `
			<!-- Card 1: Indicadores Financeiros -->
			<div class="main-dashboard-card">
				<div class="card-header">
					<h3><i class="fas fa-chart-line"></i> Indicadores Financeiros</h3>
				</div>
				<div class="card-content">
					<div class="sub-cards-grid">
						${monetaryCards.map(card => `
							<div class="sub-card sub-card-financial ${card.id ? 'clickable-card' : ''}" ${card.id ? `data-card-id="${card.id}"` : ''}>
								<div class="sub-card-icon">
									<i class="fas ${card.icon}"></i>
								</div>
								<div class="sub-card-value">${card.value}</div>
								<div class="sub-card-label">${card.label}</div>
							</div>
						`).join('')}
					</div>
				</div>
			</div>
			<!-- Card 2: Indicadores Operacionais -->
			<div class="main-dashboard-card">
				<div class="card-header">
					<h3><i class="fas fa-cogs"></i> Indicadores Operacionais</h3>
				</div>
				<div class="card-content">
					<div class="sub-cards-grid">
						${operationalCards.map(card => `
							<div class="sub-card sub-card-operational">
								<div class="sub-card-icon">
									<i class="fas ${card.icon}"></i>
								</div>
								<div class="sub-card-value">${card.value}</div>
								<div class="sub-card-label">${card.label}</div>
							</div>
						`).join('')}
					</div>
				</div>
			</div>
			<!-- Card 3: Lista Pedidos e Status -->
			<div class="main-dashboard-card">
				<div class="card-header">
					<h3><i class="fas fa-list"></i> Lista Pedidos e Status</h3>
				</div>
				<div class="card-content">
					<div id="pedidos-status-list">
						<!-- Lista de pedidos será carregada aqui -->
					</div>
				</div>
			</div>
			<!-- Card 4: Follow-up de Entregas -->
			<div class="main-dashboard-card">
				<div class="card-header">
					<h3><i class="fas fa-truck"></i> Follow-up de Entregas</h3>
				</div>
				<div class="card-content">
					<div id="entregas-hoje">
						<!-- Conteúdo será carregado pela updateFollowUpEntregas() -->
					</div>
				</div>
			</div>
		`;
		// Carregar conteúdo dos cards
		this.loadPedidosStatusList();
		// Adicionar event listeners para cards clicáveis
		this.setupCardClickListeners();
	}
	setupCardClickListeners() {
		// Remover listeners anteriores
		document.querySelectorAll('.clickable-card').forEach(card => {
			const newCard = card.cloneNode(true);
			card.parentNode.replaceChild(newCard, card);
		});
		// Adicionar novos listeners
		const self = this; // Referência à instância
		document.querySelectorAll('.clickable-card').forEach(card => {
			card.addEventListener('click', (e) => {
				const cardId = card.getAttribute('data-card-id');
				if (cardId === 'card-receitas') {
					self.showReceitasModal();
				} else if (cardId === 'card-despesas') {
					self.showDespesasModal();
				} else if (cardId === 'card-estoque') {
					self.showEstoqueModal();
				}
			});
			// Cursor pointer para indicar que é clicável
			card.style.cursor = 'pointer';
		});
	}
	showReceitasModal() {
		// Verificar se o usuário é admin
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isAdmin = role === 'admin';
		if (!isAdmin) {
			alert('Acesso negado. Apenas administradores podem gerenciar receitas.');
			return;
		}
		const modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) return;
		modalsContainer.innerHTML = '';
		const modalId = 'receitas-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.onclick = (e) => {
			if (e.target === modal) closeModalOverlay(e);
		};
		// Obter meses disponíveis
		const mesesDisponiveis = [...new Set(this.receitas.map(r => r.data_recebimento.slice(0, 7)))].sort().reverse();
		const currentMonth = new Date().toISOString().slice(0, 7);
		if (!mesesDisponiveis.includes(currentMonth)) mesesDisponiveis.unshift(currentMonth);
		const mesOptions = mesesDisponiveis.map(mes => {
			const [ano, mesNum] = mes.split('-');
			const data = new Date(ano, mesNum - 1);
			const label = data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
			return `<option value="${mes}" ${mes === currentMonth ? 'selected' : ''}>${label}</option>`;
		}).join('');
		// Função para renderizar tabela
		const renderTable = (mesSelecionado) => {
			const receitasFiltradas = mesSelecionado === 'todos' ? this.receitas : this.receitas.filter(r => r.data_recebimento.slice(0, 7) === mesSelecionado);
			const total = receitasFiltradas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
			let rows = '';
			if (receitasFiltradas.length) {
				rows = receitasFiltradas.map(r => `
					<tr>
						<td style="padding:0.5rem;">${r.descricao}</td>
						<td style="padding:0.5rem;">${this.formatCurrency(r.valor)}</td>
						<td style="padding:0.5rem;">${new Date(r.data_recebimento).toLocaleDateString('pt-BR')}</td>
						<td style="padding:0.5rem;">${r.categoria || 'N/A'}</td>
					</tr>
				`).join('');
			} else {
				rows = '<tr><td colspan="4" style="text-align:center;padding:1rem;">Nenhuma receita encontrada</td></tr>';
			}
			return { rows, total };
		};
		const { rows, total } = renderTable(currentMonth);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:700px;">
				<h2 style="margin-bottom:1rem;color:#28a745;"><i class="fas fa-chart-line"></i> Receitas</h2>
				<div style="margin-bottom:1rem;display:flex;gap:1rem;align-items:center;">
					<label style="font-weight:600;">Filtrar por mês:</label>
					<select id="receitas-mes-filter" style="padding:0.5rem;border:2px solid #e9ecef;border-radius:8px;">
						<option value="todos">Todos os meses</option>
						${mesOptions}
					</select>
				</div>
				<div style="margin-bottom:1rem;font-size:1.2rem;font-weight:600;">
					Total: <span id="receitas-total">${this.formatCurrency(total)}</span>
				</div>
				<div style="margin-bottom:2rem;max-height:400px;overflow-y:auto;">
					<table style="width:100%;border-collapse:collapse;">
						<thead>
							<tr style="background:#f5f5f5;">
								<th style="padding:0.5rem;border-bottom:1px solid #eee;">Descrição</th>
								<th style="padding:0.5rem;border-bottom:1px solid #eee;">Valor</th>
								<th style="padding:0.5rem;border-bottom:1px solid #eee;">Data</th>
								<th style="padding:0.5rem;border-bottom:1px solid #eee;">Categoria</th>
							</tr>
						</thead>
						<tbody id="receitas-table-body">
							${rows}
						</tbody>
					</table>
				</div>
				<div style="display:flex;justify-content:flex-end;gap:1rem;">
					<button onclick="window.dashboardApp.showAddReceitaModal()" 
							style="background:#28a745;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">
						<i class="fas fa-plus"></i> Adicionar Receita
					</button>
					<button onclick="closeModal('${modalId}')" 
							style="background:#6c757d;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">Fechar</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
		// Event listener para o filtro
		document.getElementById('receitas-mes-filter').addEventListener('change', (e) => {
			const mesSelecionado = e.target.value;
			const { rows, total } = renderTable(mesSelecionado);
			document.getElementById('receitas-table-body').innerHTML = rows;
			document.getElementById('receitas-total').textContent = this.formatCurrency(total);
		});
	}
	showAddReceitaModal() {
		const modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) return;
		modalsContainer.innerHTML = '';
		const modalId = 'add-receita-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.onclick = (e) => {
			if (e.target === modal) closeModalOverlay(e);
		};
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:500px;">
				<h2 style="margin-bottom:1.5rem;color:#28a745;"><i class="fas fa-plus"></i> Adicionar Receita</h2>
				<div style="margin-bottom:1rem;">
					<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Descrição</label>
					<input type="text" id="receita-descricao" placeholder="Ex: Venda adicional, Comissão, etc." 
						   style="width:100%;padding:0.75rem;border:2px solid #e9ecef;border-radius:8px;font-size:1rem;">
				</div>
				<div style="margin-bottom:1rem;">
					<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Valor (R$)</label>
					<input type="text" id="receita-valor" placeholder="0,00" 
						   style="width:100%;padding:0.75rem;border:2px solid #e9ecef;border-radius:8px;font-size:1rem;">
				</div>
				<div style="margin-bottom:1rem;">
					<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Data</label>
					<input type="date" id="receita-data" value="${new Date().toISOString().split('T')[0]}"
						   style="width:100%;padding:0.75rem;border:2px solid #e9ecef;border-radius:8px;font-size:1rem;">
				</div>
				<div style="margin-bottom:2rem;">
					<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Categoria</label>
					<select id="receita-categoria" style="width:100%;padding:0.75rem;border:2px solid #e9ecef;border-radius:8px;font-size:1rem;">
						<option value="vendas">Vendas</option>
						<option value="servicos">Serviços</option>
						<option value="comissoes">Comissões</option>
						<option value="outros">Outros</option>
					</select>
				</div>
				<div style="display:flex;justify-content:flex-end;gap:1rem;">
					<button onclick="closeModal('${modalId}')" 
							style="background:#6c757d;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">Cancelar</button>
					<button onclick="window.dashboardApp.saveReceita('${modalId}')" 
							style="background:#28a745;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">
						<i class="fas fa-save"></i> Salvar Receita
					</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
	}
	showDespesasModal() {
		// Verificar se o usuário é admin
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isAdmin = role === 'admin';
		if (!isAdmin) {
			alert('Acesso negado. Apenas administradores podem gerenciar despesas.');
			return;
		}
		const modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) return;
		modalsContainer.innerHTML = '';
		const modalId = 'despesas-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.onclick = (e) => {
			if (e.target === modal) closeModalOverlay(e);
		};
		// Obter meses disponíveis
		const mesesDisponiveis = [...new Set(this.despesas.map(d => d.data_despesa.slice(0, 7)))].sort().reverse();
		const currentMonth = new Date().toISOString().slice(0, 7);
		if (!mesesDisponiveis.includes(currentMonth)) mesesDisponiveis.unshift(currentMonth);
		const mesOptions = mesesDisponiveis.map(mes => {
			const [ano, mesNum] = mes.split('-');
			const data = new Date(ano, mesNum - 1);
			const label = data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
			return `<option value="${mes}" ${mes === currentMonth ? 'selected' : ''}>${label}</option>`;
		}).join('');
		// Função para renderizar tabela
		const renderTable = (mesSelecionado) => {
			const despesasFiltradas = mesSelecionado === 'todos' ? this.despesas : this.despesas.filter(d => d.data_despesa.slice(0, 7) === mesSelecionado);
			const total = despesasFiltradas.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
			let rows = '';
			if (despesasFiltradas.length) {
				rows = despesasFiltradas.map(d => `
					<tr>
						<td style="padding:0.5rem;">${d.descricao}</td>
						<td style="padding:0.5rem;">${this.formatCurrency(d.valor)}</td>
						<td style="padding:0.5rem;">${new Date(d.data_despesa).toLocaleDateString('pt-BR')}</td>
						<td style="padding:0.5rem;">${d.categoria || 'N/A'}</td>
					</tr>
				`).join('');
			} else {
				rows = '<tr><td colspan="4" style="text-align:center;padding:1rem;">Nenhuma despesa encontrada</td></tr>';
			}
			return { rows, total };
		};
		const { rows, total } = renderTable(currentMonth);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:700px;">
				<h2 style="margin-bottom:1rem;color:#dc3545;"><i class="fas fa-file-invoice-dollar"></i> Despesas</h2>
				<div style="margin-bottom:1rem;display:flex;gap:1rem;align-items:center;">
					<label style="font-weight:600;">Filtrar por mês:</label>
					<select id="despesas-mes-filter" style="padding:0.5rem;border:2px solid #e9ecef;border-radius:8px;">
						<option value="todos">Todos os meses</option>
						${mesOptions}
					</select>
				</div>
				<div style="margin-bottom:1rem;font-size:1.2rem;font-weight:600;">
					Total: <span id="despesas-total">${this.formatCurrency(total)}</span>
				</div>
				<div style="margin-bottom:2rem;max-height:400px;overflow-y:auto;">
					<table style="width:100%;border-collapse:collapse;">
						<thead>
							<tr style="background:#f5f5f5;">
								<th style="padding:0.5rem;border-bottom:1px solid #eee;">Descrição</th>
								<th style="padding:0.5rem;border-bottom:1px solid #eee;">Valor</th>
								<th style="padding:0.5rem;border-bottom:1px solid #eee;">Data</th>
								<th style="padding:0.5rem;border-bottom:1px solid #eee;">Categoria</th>
							</tr>
						</thead>
						<tbody id="despesas-table-body">
							${rows}
						</tbody>
					</table>
				</div>
				<div style="display:flex;justify-content:flex-end;gap:1rem;">
					<button onclick="window.dashboardApp.showAddDespesaModal()" 
							style="background:#dc3545;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">
						<i class="fas fa-plus"></i> Adicionar Despesa
					</button>
					<button onclick="closeModal('${modalId}')" 
							style="background:#6c757d;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">Fechar</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
		// Event listener para o filtro
		document.getElementById('despesas-mes-filter').addEventListener('change', (e) => {
			const mesSelecionado = e.target.value;
			const { rows, total } = renderTable(mesSelecionado);
			document.getElementById('despesas-table-body').innerHTML = rows;
			document.getElementById('despesas-total').textContent = this.formatCurrency(total);
		});
	}
	showAddDespesaModal() {
		const modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) return;
		modalsContainer.innerHTML = '';
		const modalId = 'add-despesa-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.onclick = (e) => {
			if (e.target === modal) closeModalOverlay(e);
		};
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:500px;">
				<h2 style="margin-bottom:1.5rem;color:#dc3545;"><i class="fas fa-plus"></i> Adicionar Despesa</h2>
				<div style="margin-bottom:1rem;">
					<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Descrição</label>
					<input type="text" id="despesa-descricao" placeholder="Ex: Aluguel, Energia, Ingredientes, etc." 
						   style="width:100%;padding:0.75rem;border:2px solid #e9ecef;border-radius:8px;font-size:1rem;">
				</div>
				<div style="margin-bottom:1rem;">
					<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Valor (R$)</label>
					<input type="text" id="despesa-valor" placeholder="0,00" 
						   style="width:100%;padding:0.75rem;border:2px solid #e9ecef;border-radius:8px;font-size:1rem;">
				</div>
				<div style="margin-bottom:1rem;">
					<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Data</label>
					<input type="date" id="despesa-data" value="${new Date().toISOString().split('T')[0]}"
						   style="width:100%;padding:0.75rem;border:2px solid #e9ecef;border-radius:8px;font-size:1rem;">
				</div>
				<div style="margin-bottom:2rem;">
					<label style="display:block;margin-bottom:0.5rem;font-weight:600;">Categoria</label>
					<select id="despesa-categoria" style="width:100%;padding:0.75rem;border:2px solid #e9ecef;border-radius:8px;font-size:1rem;">
						<option value="produtos-ingredientes">Produtos/Ingredientes</option>
						<option value="aluguel">Aluguel</option>
						<option value="energia-luz">Energia/Luz</option>
						<option value="agua">Água</option>
						<option value="telefone-internet">Telefone/Internet</option>
						<option value="marketing">Marketing</option>
						<option value="equipamentos">Equipamentos</option>
						<option value="comissao">Comissão</option>
						<option value="imposto">Imposto</option>
						<option value="produtos">Produtos</option>
						<option value="outros">Outros</option>
					</select>
				</div>
				<div style="display:flex;justify-content:flex-end;gap:1rem;">
					<button onclick="closeModal('${modalId}')" 
							style="background:#6c757d;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">Cancelar</button>
					<button onclick="window.dashboardApp.saveDespesa('${modalId}')" 
							style="background:#dc3545;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;">
						<i class="fas fa-save"></i> Salvar Despesa
					</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
	}
	async saveReceita(modalId) {
		const descricao = document.getElementById('receita-descricao').value.trim();
		const valorStr = document.getElementById('receita-valor').value.trim();
		const data = document.getElementById('receita-data').value;
		const categoria = document.getElementById('receita-categoria').value;
		// Converter vírgula para ponto
		const valor = parseFloat(valorStr.replace(',', '.'));
		if (!descricao || isNaN(valor) || !data) {
			alert('Por favor, preencha todos os campos obrigatórios com valores válidos.');
			return;
		}
		try {
			const { data: result, error } = await this.supabase
				.from('receitas')
				.insert([{
					descricao,
					valor,
					data_recebimento: data,
					categoria,
					created_at: new Date().toISOString()
				}]);
			if (error) throw error;
			alert('Receita cadastrada com sucesso!');
			closeModal(modalId);
			await this.loadData(); // Recarregar dados
			this.createStatsCards(); // Atualizar estatísticas
			this.showReceitasModal(); // Reabrir modal de receitas
		} catch (error) {
			console.error('Erro ao salvar receita:', error);
			alert('Erro ao salvar receita: ' + error.message);
		}
	}
	async saveDespesa(modalId) {
		const descricao = document.getElementById('despesa-descricao').value.trim();
		const valorStr = document.getElementById('despesa-valor').value.trim();
		const data = document.getElementById('despesa-data').value;
		const categoria = document.getElementById('despesa-categoria').value;
		// Converter vírgula para ponto
		const valor = parseFloat(valorStr.replace(',', '.'));
		if (!descricao || isNaN(valor) || !data) {
			alert('Por favor, preencha todos os campos obrigatórios com valores válidos.');
			return;
		}
		try {
			const { data: result, error } = await this.supabase
				.from('despesas')
				.insert([{
					descricao,
					valor,
					data_despesa: data,
					categoria,
					created_at: new Date().toISOString()
				}]);
			if (error) throw error;
			alert('Despesa cadastrada com sucesso!');
			closeModal(modalId);
			await this.loadData(); // Recarregar dados
			this.createStatsCards(); // Atualizar estatísticas
			this.showDespesasModal(); // Reabrir modal de despesas
		} catch (error) {
			console.error('Erro ao salvar despesa:', error);
			alert('Erro ao salvar despesa: ' + error.message);
		}
	}
	showEstoqueModal() {
		const modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) return;
		modalsContainer.innerHTML = '';
		const modalId = 'estoque-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.onclick = (e) => {
			if (e.target === modal) closeModal(modalId);
		};
		const minStock = parseInt(this.configuracoes.find(c => c.chave === 'estoque_minimo_warning')?.valor || 5);
		let tableRows = '';
		this.products.forEach(p => {
			const stockEntries = this.stock.filter(s => s.produto_id === p.id);
			const totalStock = stockEntries.reduce((sum, s) => sum + (s.quantidade_disponivel || 0), 0);
			const lastCost = stockEntries.length > 0 ? stockEntries[0].preco_custo : p.custo || 0;
			const low = totalStock < minStock ? '⚠️' : '';
			tableRows += `
				<tr>
					<td>${p.nome}</td>
					<td>${totalStock} ${low}</td>
					<td>${this.formatCurrency(lastCost)}</td>
					<td><button onclick="window.dashboardApp.addStock('${p.id}')">Adicionar</button></td>
				</tr>
			`;
		});
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:800px;">
				<h2>Gerenciamento de Estoque</h2>
				<div style="margin-bottom:2rem; padding:1rem; background:#f9f9f9; border-radius:8px;">
					<h3>Configurações</h3>
					<label>Limite Mínimo de Estoque para Warning:</label>
					<input type="number" id="estoque-minimo" value="${minStock}" min="0" style="margin-left:1rem; width:80px;">
					<button onclick="window.dashboardApp.saveEstoqueConfig()" style="margin-left:1rem; background:#667eea; color:white; border:none; padding:0.5rem 1rem; border-radius:6px;">Salvar Config</button>
				</div>
				<table style="width:100%;border-collapse:collapse;">
					<thead>
						<tr style="background:#f5f5f5;">
							<th style="padding:0.5rem;">Produto</th>
							<th style="padding:0.5rem;">Quantidade</th>
							<th style="padding:0.5rem;">Custo</th>
							<th style="padding:0.5rem;">Ações</th>
						</tr>
					</thead>
					<tbody>
						${tableRows}
					</tbody>
				</table>
				<div style="margin-top:2rem;">
					<button onclick="window.dashboardApp.addNewProduct()">Adicionar Novo Produto</button>
				</div>
				<div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem;">
					<button onclick="closeModal('${modalId}')">Fechar</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
	}
	addStock(productId) {
		const product = this.products.find(p => p.id === productId);
		if (!product) return;
		const modalsContainer = document.getElementById('modals-container');
		const modalId = 'add-stock-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		// Adicionar event listener após o modal ser inserido no DOM
		const handleModalClick = (e) => {
			if (e.target === modal) {
				closeModal(modalId);
			}
		};
		modal.addEventListener('click', handleModalClick);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:400px;">
				<h2>Adicionar Estoque - ${product.nome}</h2>
				<label>Quantidade</label>
				<input type="number" id="add-quantity" min="1" required>
				<label>Custo Unitário</label>
				<input type="number" id="add-cost" step="0.01" min="0" required>
				<div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem;">
					<button onclick="closeModal('${modalId}')">Cancelar</button>
					<button onclick="window.dashboardApp.saveStock('${productId}')">Salvar</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
	}
	async saveStock(productId) {
		const quantity = parseInt(document.getElementById('add-quantity').value);
		const cost = parseFloat(document.getElementById('add-cost').value);
		if (!quantity || !cost) return;
		const { error } = await this.supabase
			.from('estoque')
			.insert({
				produto_id: productId,
				quantidade_disponivel: quantity,
				preco_custo: cost,
				quantidade_vendida: 0,
				data_producao: new Date().toISOString().split('T')[0]
			});
		if (error) {
			alert('Erro: ' + error.message);
		} else {
			alert('Estoque adicionado!');
			closeModal('add-stock-modal');
			await this.loadData();
			this.showEstoqueModal();
		}
	}
	async saveEstoqueConfig() {
		const minStock = parseInt(document.getElementById('estoque-minimo').value);
		if (isNaN(minStock) || minStock < 0) {
			alert('Valor inválido');
			return;
		}
		const config = this.configuracoes.find(c => c.chave === 'estoque_minimo_warning');
		try {
			if (config) {
				const { error } = await this.supabase
					.from('configuracoes')
					.update({ valor: minStock.toString() })
					.eq('id', config.id);
				if (error) throw error;
			} else {
				const { error } = await this.supabase
					.from('configuracoes')
					.insert({
						chave: 'estoque_minimo_warning',
						valor: minStock.toString(),
						descricao: 'Limite mínimo de estoque para warning'
					});
				if (error) throw error;
			}
			alert('Configuração salva!');
			await this.loadData();
			this.showEstoqueModal();
		} catch (error) {
			console.error('Erro ao salvar configuração:', error);
			alert('Erro ao salvar: ' + error.message);
		}
	}
	addNewProduct() {
		const modalsContainer = document.getElementById('modals-container');
		const modalId = 'add-product-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		// Adicionar event listener após o modal ser inserido no DOM
		const handleModalClick = (e) => {
			if (e.target === modal) {
				closeModal(modalId);
			}
		};
		modal.addEventListener('click', handleModalClick);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:400px;">
				<h2>Adicionar Novo Produto</h2>
				<label>Nome</label>
				<input type="text" id="new-nome" required>
				<label>Quantidade Inicial</label>
				<input type="number" id="new-quantity" min="0" required>
				<label>Custo Unitário</label>
				<input type="number" id="new-cost" step="0.01" min="0" required>
				<label>Preço de Venda</label>
				<input type="number" id="new-preco" step="0.01" min="0" required>
				<div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem;">
					<button onclick="closeModal('${modalId}')">Cancelar</button>
					<button onclick="window.dashboardApp.saveNewProduct()">Salvar</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
	}
	async saveNewProduct() {
		const nome = document.getElementById('new-nome').value;
		const quantity = parseInt(document.getElementById('new-quantity').value);
		const cost = parseFloat(document.getElementById('new-cost').value);
		const preco = parseFloat(document.getElementById('new-preco').value);
		if (!nome || !quantity || !cost || !preco) return;
		const { error: productError } = await this.supabase
			.from('produtos')
			.insert({
				nome,
				preco,
				custo: cost,
				estoque: quantity,
				categoria: 'Geral',
				status_produto: 'ativo'
			});
		if (productError) {
			alert('Erro ao criar produto: ' + productError.message);
			return;
		}
		// Estoque será criado automaticamente pelo trigger no banco
		alert('Produto adicionado com sucesso!');
		closeModal('add-product-modal');
		// REABILITADO - necessário para manter a lista atualizada
		await this.loadData();
		console.log('✅ Dados recarregados após criação de produto');
		this.showEstoqueModal();
	}
	showConfigModal() {
		const modalsContainer = document.getElementById('modals-container');
		const modalId = 'config-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		// Adicionar event listener após o modal ser inserido no DOM
		const handleModalClick = (e) => {
			if (e.target === modal) {
				closeModal(modalId);
			}
		};
		modal.addEventListener('click', handleModalClick);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:800px;">
				<h2>Configurações</h2>
				<div style="display:flex;gap:1rem;margin-bottom:2rem;">
					<button id="config-estoque-btn" class="btn btn-secondary">Estoque</button>
					<button id="config-promocoes-btn" class="btn btn-primary">Promoções</button>
					<button id="config-usuarios-btn" class="btn btn-secondary">Usuários</button>
				</div>
				<div id="config-content">
					<!-- Conteúdo será carregado aqui -->
				</div>
				<div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem;">
					<button onclick="closeModal('${modalId}')">Fechar</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
		// Eventos
		document.getElementById('config-estoque-btn').onclick = () => this.loadConfigEstoque();
		document.getElementById('config-promocoes-btn').onclick = () => this.loadConfigPromocoes();
		document.getElementById('config-usuarios-btn').onclick = () => this.loadConfigUsuarios();
		// Carregar promoções por padrão
		this.loadConfigPromocoes();
	}
	showPromocoesModal() {
		const modalsContainer = document.getElementById('modals-container');
		const modalId = 'promocoes-modal';
		// Remover modal existente se já estiver aberto (importante para evitar camadas)
		const existingModal = document.getElementById(modalId);
		if (existingModal) {
			console.log('🧹 Removendo modal existente:', modalId);
			existingModal.remove();
		}
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:800px;">
				<h2 data-i18n="modal.promocoes">Promoções</h2>
				<div id="promocoes-content">
					<!-- Conteúdo será carregado aqui -->
				</div>
				<div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem;">
					<button id="close-promocoes-btn" data-i18n="btn.fechar">Fechar</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
		// Adicionar event listeners após o modal ser inserido no DOM
		modal.onclick = (e) => {
			if (e.target === modal) {
				closeModal(modalId);
			}
		};
		const closeBtn = modal.querySelector('#close-promocoes-btn');
		if (closeBtn) {
			closeBtn.onclick = () => {
				closeModal(modalId);
			};
		}
		this.loadPromocoesContent();
	}
	async loadPromocoesContent() {
		const content = document.getElementById('promocoes-content');
		const { data: promocoes, error } = await this.supabase
			.from('promocoes')
			.select('*')
			.order('data_inicio', { ascending: false });
		let tableRows = '';
		if (promocoes && promocoes.length) {
			tableRows = promocoes.map(p => `
				<tr>
					<td>${p.nome}</td>
					<td>${new Date(p.data_inicio).toLocaleDateString('pt-BR')} - ${new Date(p.data_fim).toLocaleDateString('pt-BR')}</td>
					<td>${p.status}</td>
					<td>
						<button onclick="window.dashboardApp.editPromocao('${p.id}')">Editar</button>
						<button onclick="window.dashboardApp.deletePromocao('${p.id}')">Excluir</button>
					</td>
				</tr>
			`).join('');
		} else {
			tableRows = '<tr><td colspan="4" style="text-align:center;">Nenhuma promoção encontrada</td></tr>';
		}
		content.innerHTML = `
			<table style="width:100%;border-collapse:collapse;margin-bottom:2rem;">
				<thead>
					<tr style="background:#f5f5f5;">
						<th style="padding:0.5rem;">Nome</th>
						<th style="padding:0.5rem;">Período</th>
						<th style="padding:0.5rem;">Status</th>
						<th style="padding:0.5rem;">Ações</th>
					</tr>
				</thead>
				<tbody>
					${tableRows}
				</tbody>
			</table>
			<button onclick="window.dashboardApp.addPromocao()">Adicionar Promoção</button>
		`;
	}
	loadConfigEstoque() {
		const content = document.getElementById('config-content');
		content.innerHTML = `
			<h3>Configurações de Estoque</h3>
			<label>Limite Mínimo de Estoque para Warning:</label>
			<input type="number" id="estoque-minimo" value="${this.estoqueMinimo || 5}" min="0" style="margin-left:1rem; width:80px;">
			<button onclick="window.dashboardApp.saveEstoqueConfig()" style="margin-left:1rem; background:#667eea; color:white; border:none; padding:0.5rem 1rem; border-radius:6px;">Salvar Config</button>
		`;
	}
	async loadConfigUsuarios() {
		const content = document.getElementById('config-content');
		const { data: usuarios, error } = await this.supabase
			.from('usuarios')
			.select('*')
			.order('created_at', { ascending: false });
		let rows = '';
		if (usuarios && usuarios.length) {
			rows = usuarios.map(u => `
				<tr>
					<td style="padding:0.5rem;">${u.nome}</td>
					<td style="padding:0.5rem;">${u.email}</td>
					<td style="padding:0.5rem;">${u.tipo}</td>
					<td style="padding:0.5rem;">
						<button style="background:#eee;border:none;padding:0.3rem 0.7rem;border-radius:4px;margin-right:0.3rem;" onclick="window.dashboardApp.editUsuario('${u.id}')">Editar</button>
						<button style="background:#eee;border:none;padding:0.3rem 0.7rem;border-radius:4px;margin-right:0.3rem;" onclick="window.dashboardApp.showResetPasswordModal('${u.id}')">Senha Padrão</button>
						<button style="background:#ff6b9d;color:white;border:none;padding:0.3rem 0.7rem;border-radius:4px;" onclick="window.dashboardApp.excluirUsuario('${u.id}')">Excluir</button>
					</td>
				</tr>
			`).join('');
		} else {
			rows = '<tr><td colspan="4" style="text-align:center;padding:1rem;">Nenhum usuário encontrado</td></tr>';
		}
		content.innerHTML = `
			<h3>Usuários</h3>
			<div style="margin-bottom:2rem;">
				<table style="width:100%;border-collapse:collapse;">
					<thead>
						<tr style="background:#f5f5f5;">
							<th style="padding:0.5rem;border-bottom:1px solid #eee;">Nome</th>
							<th style="padding:0.5rem;border-bottom:1px solid #eee;">Email</th>
							<th style="padding:0.5rem;border-bottom:1px solid #eee;">Tipo</th>
							<th style="padding:0.5rem;border-bottom:1px solid #eee;">Ações</th>
						</tr>
					</thead>
					<tbody>
						${rows}
					</tbody>
				</table>
			</div>
			<button onclick="window.dashboardApp.adicionarUsuario()">Adicionar Usuário</button>
		`;
	}
	async loadConfigPromocoes() {
		const content = document.getElementById('config-content');
		if (!content) {
			console.warn('Elemento config-content não encontrado');
			return;
		}
		const { data: promocoes, error } = await this.supabase
			.from('promocoes')
			.select('*')
			.order('data_inicio', { ascending: false });
		let tableRows = '';
		if (promocoes && promocoes.length) {
			tableRows = promocoes.map(p => `
				<tr>
					<td>${p.nome}</td>
					<td>${new Date(p.data_inicio).toLocaleDateString('pt-BR')} - ${new Date(p.data_fim).toLocaleDateString('pt-BR')}</td>
					<td>${p.canal || 'Todos'}</td>
					<td>${p.status}</td>
					<td>
						<button onclick="window.dashboardApp.editPromocao('${p.id}')">Editar</button>
						<button onclick="window.dashboardApp.deletePromocao('${p.id}')">Excluir</button>
					</td>
				</tr>
			`).join('');
		} else {
			tableRows = '<tr><td colspan="5" style="text-align:center;">Nenhuma promoção encontrada</td></tr>';
		}
		content.innerHTML = `
			<h3>Promoções</h3>
			<table style="width:100%;border-collapse:collapse;margin-bottom:2rem;">
				<thead>
					<tr style="background:#f5f5f5;">
						<th style="padding:0.5rem;">Nome</th>
						<th style="padding:0.5rem;">Período</th>
						<th style="padding:0.5rem;">Canal</th>
						<th style="padding:0.5rem;">Status</th>
						<th style="padding:0.5rem;">Ações</th>
					</tr>
				</thead>
				<tbody>
					${tableRows}
				</tbody>
			</table>
			<button onclick="window.dashboardApp.addPromocao()">Adicionar Promoção</button>
		`;
	}
	addPromocao() {
		// Fechar modal de configurações antes de abrir modal de promoção
		closeModal('config-modal');
		this.showPromocaoModal();
	}
	editPromocao(id) {
		// Fechar modal de configurações antes de abrir modal de promoção
		closeModal('config-modal');
		this.showPromocaoModal(id);
	}
	async deletePromocao(id) {
		if (confirm('Tem certeza que deseja excluir esta promoção?')) {
			const { error } = await this.supabase
				.from('promocoes')
				.delete()
				.eq('id', id);
			if (error) {
				alert('Erro ao excluir promoção: ' + error.message);
			} else {
				alert('Promoção excluída!');
				this.loadConfigPromocoes();
			}
		}
	}
	async showPromocaoModal(id = null) {
		let promocao = null;
		if (id) {
			const { data, error } = await this.supabase
				.from('promocoes')
				.select('*')
				.eq('id', id)
				.single();
			if (error) {
				alert('Erro ao carregar promoção: ' + error.message);
				return;
			}
			promocao = data;
		}
		const modalsContainer = document.getElementById('modals-container');
		const modalId = 'promocao-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		// Adicionar event listeners após o modal ser inserido no DOM
		// Usar uma função nomeada para poder removê-la depois se necessário
		const handleModalClick = (e) => {
			if (e.target === modal) {
				closeModal(modalId);
			}
		};
		modal.addEventListener('click', handleModalClick);
		// Opções de produtos
		let produtoOptions = `<option value="" ${!promocao || !promocao.produto_id ? 'selected' : ''}>Todos os produtos</option>`;
		if (this.products) {
			this.products.forEach(p => {
				produtoOptions += `<option value="${p.id}" ${promocao && promocao.produto_id === p.id ? 'selected' : ''}>${p.nome}</option>`;
			});
		}
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:900px;max-height:90vh;overflow-y:auto;">
				<h2>${id ? 'Editar' : 'Adicionar'} Promoção</h2>
				<div style="display:flex;gap:2rem;">
					<!-- Formulário -->
					<div style="flex:1;">
						<h3>Configurações da Promoção</h3>
						<label>Nome da Promoção <span style="color:red;">*</span></label>
						<input type="text" id="promocao-nome" value="${promocao ? promocao.nome : ''}" required style="width:100%;margin-bottom:1rem;">
						<div style="display:flex;gap:1rem;margin-bottom:1rem;">
							<div style="flex:1;">
								<label>Data Início <span style="color:red;">*</span></label>
								<input type="date" id="promocao-data-inicio" value="${promocao ? promocao.data_inicio.split('T')[0] : ''}" required style="width:100%;">
							</div>
							<div style="flex:1;">
								<label>Data Fim <span style="color:red;">*</span></label>
								<input type="date" id="promocao-data-fim" value="${promocao ? promocao.data_fim.split('T')[0] : ''}" required style="width:100%;">
							</div>
						</div>
						<label>Status</label>
						<select id="promocao-status" style="width:100%;margin-bottom:1rem;">
							<option value="ativo" ${promocao && promocao.status === 'ativo' ? 'selected' : ''}>Ativo</option>
							<option value="inativo" ${promocao && promocao.status === 'inativo' ? 'selected' : ''}>Inativo</option>
						</select>
						<label>Canal de Venda</label>
						<select id="promocao-canal" style="width:100%;margin-bottom:1rem;">
							<option value="ambos" ${promocao && (!promocao.canal || promocao.canal === 'ambos') ? 'selected' : ''}>Ambos (Físico e Online)</option>
							<option value="fisico" ${promocao && promocao.canal === 'fisico' ? 'selected' : ''}>Apenas Vendas Físicas</option>
							<option value="online" ${promocao && promocao.canal === 'online' ? 'selected' : ''}>Apenas Vendas Online</option>
						</select>
						<hr style="margin:1.5rem 0;border:none;border-top:1px solid #eee;">
						<h4>Condições da Promoção <small style="color:#666;">(pelo menos uma)</small></h4>
						<label>Produto Específico (opcional)</label>
						<select id="promocao-produto" style="width:100%;margin-bottom:1rem;">${produtoOptions}</select>
						<div style="display:flex;gap:1rem;margin-bottom:1rem;">
							<div style="flex:1;">
								<label>Quantidade Mínima</label>
								<input type="number" id="promocao-quantidade" min="1" value="${promocao ? promocao.quantidade_minima || '' : ''}" placeholder="Ex: 3" style="width:100;">
								<small style="color:#666;">Deixe vazio se usar Valor Mínimo</small>
							</div>
							<div style="flex:1;">
								<label>Valor Mínimo (R$)</label>
								<input type="number" id="promocao-valor" step="0.01" min="0.01" value="${promocao ? promocao.valor_minimo || '' : ''}" placeholder="Ex: 50.00" style="width:100;">
								<small style="color:#666;">Deixe vazio se usar Quantidade Mínima</small>
							</div>
						</div>
						<label>Regiões (separadas por vírgula, opcional)</label>
						<input type="text" id="promocao-regioes" value="${promocao ? promocao.regioes || '' : ''}" placeholder="Ex: São Paulo, Rio de Janeiro" style="width:100%;margin-bottom:1rem;">
						<hr style="margin:1.5rem 0;border:none;border-top:1px solid #eee;">
						<h4>Benefícios da Promoção <small style="color:#666;">(pelo menos um)</small></h4>
						<div style="display:flex;gap:1rem;margin-bottom:1rem;">
							<div style="flex:1;">
								<label>Tipo de Desconto</label>
								<select id="promocao-desconto-tipo" style="width:100%;">
									<option value="percentual" ${promocao && promocao.desconto_tipo === 'percentual' ? 'selected' : ''}>Percentual (%)</option>
									<option value="valor" ${promocao && promocao.desconto_tipo === 'valor' ? 'selected' : ''}>Valor Fixo (R$)</option>
								</select>
							</div>
							<div style="flex:1;">
								<label>Valor do Desconto</label>
								<input type="number" id="promocao-desconto-valor" step="0.01" min="0.01" value="${promocao ? promocao.desconto_valor || '' : ''}" style="width:100;">
								<small style="color:#666;">Deixe vazio se usar apenas Frete Grátis</small>
							</div>
						</div>
						<label style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
							<input type="checkbox" id="promocao-frete" ${promocao && promocao.frete_gratis ? 'checked' : ''}>
							Frete Grátis
							<small style="color:#666;">(pode ser usado junto com desconto)</small>
						</label>
					</div>
					<!-- Visualizador -->
					<div style="flex:1;">
						<h3>Visualização do Banner</h3>
						<div id="promocao-preview" style="border:2px dashed #ddd;border-radius:8px;padding:1rem;background:#f9f9f9;min-height:300px;">
							<div style="text-align:center;color:#888;margin-top:100px;">
								<i class="fas fa-eye" style="font-size:2rem;margin-bottom:0.5rem;"></i>
								<p>Preencha os campos para ver a prévia</p>
							</div>
						</div>
					</div>
				</div>
				<hr style="margin:1.5rem 0;border:none;border-top:1px solid #eee;">
				<label>Informações Adicionais (opcional)</label>
				<textarea id="promocao-observacoes" rows="3" placeholder="Adicione informações adicionais sobre a promoção..." style="width:100%;margin-bottom:1rem;padding:0.5rem;border:1px solid #ddd;border-radius:4px;resize:vertical;">${promocao ? promocao.observacoes || '' : ''}</textarea>
				<div style="display:flex;justify-content:flex-end;gap:1rem;margin-top:2rem;border-top:1px solid #eee;padding-top:1rem;">
					<button onclick="closeModal('${modalId}')">Cancelar</button>
					<button onclick="window.dashboardApp.savePromocao(${id ? `'${id}'` : 'null'})" style="background:#28a745;color:white;">Salvar Promoção</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
		// Adicionar event listeners para atualizar preview em tempo real
		this.setupPromocaoPreview();
	}
	setupPromocaoPreview() {
		const fields = [
			'promocao-nome', 'promocao-data-inicio', 'promocao-data-fim',
			'promocao-produto', 'promocao-quantidade', 'promocao-valor',
			'promocao-desconto-tipo', 'promocao-desconto-valor',
			'promocao-frete', 'promocao-regioes', 'promocao-status',
			'promocao-observacoes'
		];
		fields.forEach(fieldId => {
			const element = document.getElementById(fieldId);
			if (element) {
				element.addEventListener('input', () => this.updatePromocaoPreview());
				element.addEventListener('change', () => this.updatePromocaoPreview());
			}
		});
		// Atualizar preview inicial
		this.updatePromocaoPreview();
	}
	updatePromocaoPreview() {
		const nome = document.getElementById('promocao-nome')?.value || '';
		const dataInicio = document.getElementById('promocao-data-inicio')?.value || '';
		const dataFim = document.getElementById('promocao-data-fim')?.value || '';
		const produtoId = document.getElementById('promocao-produto')?.value || '';
		const quantidade = document.getElementById('promocao-quantidade')?.value || '';
		const valor = document.getElementById('promocao-valor')?.value || '';
		const descontoTipo = document.getElementById('promocao-desconto-tipo')?.value || 'percentual';
		const descontoValor = document.getElementById('promocao-desconto-valor')?.value || '';
		const freteGratis = document.getElementById('promocao-frete')?.checked || false;
		const regioes = document.getElementById('promocao-regioes')?.value || '';
		const status = document.getElementById('promocao-status')?.value || 'ativo';
		const observacoes = document.getElementById('promocao-observacoes')?.value || '';
		const preview = document.getElementById('promocao-preview');
		if (!nome && !dataInicio && !dataFim) {
			preview.innerHTML = `
				<div style="text-align:center;color:#888;margin-top:100px;">
					<i class="fas fa-eye" style="font-size:2rem;margin-bottom:0.5rem;"></i>
					<p>Preencha os campos para ver a prévia</p>
				</div>
			`;
			return;
		}
		// Construir descrição da promoção
		let titulo = nome || 'Nome da Promoção';
		let descricao = '';
		// Condições (apenas as que foram preenchidas)
		let condicoes = [];
		if (produtoId) {
			const produto = this.products?.find(p => p.id === produtoId);
			if (produto) condicoes.push(`Produto: ${produto.nome}`);
		}
		if (quantidade && parseInt(quantidade) > 0) condicoes.push(`Quantidade mínima: ${quantidade}`);
		if (valor && parseFloat(valor) > 0) condicoes.push(`Valor mínimo: R$ ${this.formatCurrency(parseFloat(valor))}`);
		if (regioes.trim()) condicoes.push(`Regiões: ${regioes.trim()}`);
		// Benefícios (apenas os que foram preenchidos)
		let beneficios = [];
		if (descontoValor && parseFloat(descontoValor) > 0) {
			if (descontoTipo === 'percentual') {
				beneficios.push(`${descontoValor}% de desconto`);
			} else {
				beneficios.push(`R$ ${this.formatCurrency(parseFloat(descontoValor))} de desconto`);
			}
		}
		if (freteGratis) beneficios.push('Frete grátis');
		// Status
		const statusColor = status === 'ativo' ? '#28a745' : '#6c757d';
		const statusText = status === 'ativo' ? 'ATIVA' : 'INATIVA';
		// Datas
		let periodo = '';
		if (dataInicio && dataFim) {
			const inicio = new Date(dataInicio).toLocaleDateString('pt-BR');
			const fim = new Date(dataFim).toLocaleDateString('pt-BR');
			periodo = `${inicio} até ${fim}`;
		}
		preview.innerHTML = `
			<div style="background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
				<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
					<div>
						<h3 style="margin: 0 0 0.5rem 0; font-size: 1.4rem; font-weight: 700;">🎉 ${titulo}</h3>
						${periodo ? `<div style="font-size: 0.9rem; opacity: 0.9;">📅 ${periodo}</div>` : ''}
					</div>
					<div style="background: ${statusColor}; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
						${statusText}
					</div>
				</div>
				${condicoes.length > 0 ? `
					<div style="margin-bottom: 1rem;">
						<h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; opacity: 0.9;">📋 Condições:</h4>
						<ul style="margin: 0; padding-left: 1.2rem; font-size: 0.9rem;">
							${condicoes.map(c => `<li>${c}</li>`).join('')}
						</ul>
					</div>
				` : ''}
				${beneficios.length > 0 ? `
					<div style="margin-bottom: 1rem;">
						<h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; opacity: 0.9;">🎁 Benefícios:</h4>
						<ul style="margin: 0; padding-left: 1.2rem; font-size: 0.9rem;">
							${beneficios.map(b => `<li style="color: #fff3cd; font-weight: 600;">${b}</li>`).join('')}
						</ul>
					</div>
				` : ''}
				${observacoes.trim() ? `
					<div style="margin-bottom: 1rem;">
						<h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; opacity: 0.9;">ℹ️ Informações:</h4>
						<p style="margin: 0; font-size: 0.9rem; font-style: italic; opacity: 0.9;">${observacoes.trim()}</p>
					</div>
				` : ''}
				<div style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.3);">
					<button style="background: white; color: #ff6b9d; border: none; padding: 0.8rem 2rem; border-radius: 25px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
						🛒 APROVEITAR OFERTA
					</button>
				</div>
			</div>
		`;
	}
	async savePromocao(id) {
		const nome = document.getElementById('promocao-nome').value;
		const dataInicio = document.getElementById('promocao-data-inicio').value;
		const dataFim = document.getElementById('promocao-data-fim').value;
		const produtoId = document.getElementById('promocao-produto').value || null;
		const quantidadeMinima = parseInt(document.getElementById('promocao-quantidade').value) || null;
		const valorMinimo = parseFloat(document.getElementById('promocao-valor').value) || null;
		const descontoTipo = document.getElementById('promocao-desconto-tipo').value;
		const descontoValor = parseFloat(document.getElementById('promocao-desconto-valor').value) || null;
		const freteGratis = document.getElementById('promocao-frete').checked;
		const regioes = document.getElementById('promocao-regioes').value.trim() || null;
		const status = document.getElementById('promocao-status').value;
		const canal = document.getElementById('promocao-canal').value;
		const observacoes = document.getElementById('promocao-observacoes').value.trim() || null;
		// Validações inteligentes
		const erros = [];
		// Campos obrigatórios básicos
		if (!nome.trim()) erros.push('Nome da promoção é obrigatório');
		if (!dataInicio) erros.push('Data de início é obrigatória');
		if (!dataFim) erros.push('Data de fim é obrigatória');
		// Pelo menos uma condição deve ser especificada
		if (!quantidadeMinima && !valorMinimo) {
			erros.push('Especifique pelo menos uma condição: Quantidade Mínima OU Valor Mínimo');
		}
		// Pelo menos um benefício deve ser especificado
		if (!descontoValor && !freteGratis) {
			erros.push('Especifique pelo menos um benefício: Desconto OU Frete Grátis');
		}
		// Se especificou desconto, o valor deve ser válido
		if (descontoValor !== null && descontoValor <= 0) {
			erros.push('Valor do desconto deve ser maior que zero');
		}
		// Se especificou quantidade, deve ser válida
		if (quantidadeMinima !== null && quantidadeMinima <= 0) {
			erros.push('Quantidade mínima deve ser maior que zero');
		}
		// Se especificou valor mínimo, deve ser válido
		if (valorMinimo !== null && valorMinimo <= 0) {
			erros.push('Valor mínimo deve ser maior que zero');
		}
		// Validar período
		if (dataInicio && dataFim && new Date(dataInicio) > new Date(dataFim)) {
			erros.push('Data de início deve ser anterior à data de fim');
		}
		if (erros.length > 0) {
			alert('Erros encontrados:\n\n' + erros.join('\n'));
			return;
		}
		// Preparar dados para salvar
		const data = {
			nome: nome.trim(),
			data_inicio: dataInicio,
			data_fim: dataFim,
			quantidade_minima: quantidadeMinima,
			valor_minimo: valorMinimo,
			desconto_tipo: descontoTipo,
			desconto_valor: descontoValor !== null ? descontoValor : 0, // Sempre definir valor, nunca null
			frete_gratis: freteGratis,
			regioes: regioes,
			status,
			canal: canal,
			observacoes: observacoes
		};
		// Adicionar produto_id apenas se foi selecionado
		if (produtoId && produtoId !== '' && produtoId !== 'null') {
			data.produto_id = produtoId;
		}
		let result;
		try {
			if (id) {
				result = await this.saveToSupabase('promocoes', data, id);
			} else {
				result = await this.saveToSupabase('promocoes', data);
			}
			if (result) {
				alert('Promoção salva com sucesso!');
				closeModal('promocao-modal');
				this.loadConfigPromocoes();
			} else {
				alert('Erro ao salvar promoção. Verifique os dados e tente novamente.');
			}
		} catch (error) {
			console.error('Erro ao salvar promoção:', error);
			alert('Erro ao salvar promoção: ' + (error.message || 'Erro desconhecido'));
		}
	}
	async loadActivePromocoes() {
		const today = new Date().toISOString().split('T')[0];
		let query = this.supabase
			.from('promocoes')
			.select('*')
			.eq('status', 'ativo')
			.lte('data_inicio', today)
			.gte('data_fim', today);
		// Filtrar por canal se não for admin (no dashboard)
		if (!this.isVendasOnline && !this.isAdmin) {
			query = query.or('canal.eq.ambos,canal.eq.fisico');
		} else if (this.isVendasOnline) {
			query = query.or('canal.eq.ambos,canal.eq.online');
		}
		const { data: promocoes, error } = await query;
		if (error) {
			console.error('Erro ao carregar promoções ativas:', error);
			return;
		}
		if (promocoes && promocoes.length > 0) {
			this.activePromocoes = promocoes; // Armazenar promoções ativas
			this.showPromocoesPopup(promocoes);
		} else {
			this.activePromocoes = [];
		}
	}
	// Verificar se o carrinho atual é elegível a promoções
	checkCartPromocoes(cartTotal, cartItems) {
		if (!this.activePromocoes || this.activePromocoes.length === 0) {
			return null;
		}
		// Calcular informações do carrinho
		const produtosNoCarrinho = new Set(Object.keys(cartItems));
		const totalItens = Object.values(cartItems).reduce((sum, item) => sum + (item.quantidade || 0), 0);
		const totalValor = cartTotal;
		// Verificar cada promoção
		for (const promocao of this.activePromocoes) {
			// Verificar se a promoção é aplicável ao canal atual
			const canalAtual = this.isVendasOnline ? 'online' : 'fisico';
			if (promocao.canal && promocao.canal !== 'ambos' && promocao.canal !== canalAtual) {
				continue; // Pular promoções que não são para este canal
			}
			let elegivel = false;
			// Verificar condições da promoção
			if (promocao.produto_id) {
				// Promoção específica para um produto
				elegivel = produtosNoCarrinho.has(promocao.produto_id);
			} else {
				// Promoção geral - verificar quantidade ou valor mínimo
				if (promocao.quantidade_minima && totalItens >= promocao.quantidade_minima) {
					elegivel = true;
				} else if (promocao.valor_minimo && cartTotal >= promocao.valor_minimo) {
					elegivel = true;
				}
			}
			if (elegivel) {
				// Retornar os benefícios da promoção
				let beneficios = [];
				if (promocao.desconto_valor) {
					if (promocao.desconto_tipo === 'percentual') {
						beneficios.push(`${promocao.desconto_valor}% de desconto`);
					} else {
						beneficios.push(`R$ ${this.formatCurrency(promocao.desconto_valor)} de desconto`);
					}
				}
				if (promocao.frete_gratis) {
					beneficios.push('Frete grátis');
				}
				return {
					nome: promocao.nome,
					beneficios: beneficios,
					tipo: promocao.produto_id ? 'produto' : 'geral'
				};
			}
		}
		return null;
	}
	showPromocoesPopup(promocoes) {
		const modalsContainer = document.getElementById('modals-container');
		const modalId = 'promocoes-popup';
		const existing = document.getElementById(modalId);
		if (existing) {
			existing.remove();
		}
		if (!modalsContainer) {
			return;
		}
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.style.cssText = `
			position: fixed;
			z-index: 99999;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background: rgba(0,0,0,0.7);
			display: flex;
			justify-content: center;
			align-items: center;
			pointer-events: auto;
		`;

		let promocoesHtml = '';
		promocoes.forEach(p => {
			let condicoes = [];
			if (p.produto_id) {
				const produto = this.products?.find(prod => prod.id === p.produto_id);
				if (produto) condicoes.push(`${t('promocoes.produto')}: ${translateProductName(produto.nome)}`);
			}
			if (p.quantidade_minima) condicoes.push(`${t('promocoes.quantidade_minima')}: ${p.quantidade_minima}`);
			if (p.valor_minimo) condicoes.push(`${t('promocoes.valor_minimo')}: R$ ${this.formatCurrency(p.valor_minimo)}`);
			if (p.regioes) condicoes.push(`${t('promocoes.regioes')}: ${p.regioes}`);
			let beneficios = [];
			if (p.desconto_valor) {
				if (p.desconto_tipo === 'percentual') {
					beneficios.push(`${p.desconto_valor}${t('promocoes.desconto_percentual')}`);
				} else {
					beneficios.push(`R$ ${this.formatCurrency(p.desconto_valor)} ${t('promocoes.desconto_valor')}`);
				}
			}
			if (p.frete_gratis) beneficios.push(t('promocoes.frete_gratis'));
			promocoesHtml += `
				<div style="background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 1rem; position: relative; overflow: hidden;">
					${p.produto_id ? (() => {
						try {
							const produto = this.products?.find(prod => prod.id === p.produto_id);
							if (produto && produto.fotos && produto.fotos.length > 0) {
								let fotosArray;
								try {
									fotosArray = JSON.parse(produto.fotos);
								} catch (e) {
									console.warn('Erro ao fazer parse das fotos do produto:', produto.fotos);
									return '';
								}
								if (fotosArray && fotosArray.length > 0) {
									return `<div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; border-radius: 0 12px 0 50px; overflow: hidden; opacity: 0.8;">
										<img src="${fotosArray[0]}" alt="${produto.nome}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
									</div>`;
								}
							}
						} catch (error) {
							console.warn('Erro ao processar foto do produto:', error);
						}
						return '';
					})() : ''}
					<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; ${p.produto_id ? 'margin-right: 80px;' : ''}">
						<div>
							<h3 style="margin: 0 0 0.5rem 0; font-size: 1.3rem; font-weight: 700;">🎉 ${p.nome}</h3>
							${p.produto_id ? (() => {
								const produto = this.products?.find(prod => prod.id === p.produto_id);
								return produto ? `<div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">🍰 ${translateProductName(produto.nome)}</div>` : '';
							})() : ''}
						</div>
						<div style="background: #28a745; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
							${t('promocoes.ativa')}
						</div>
					</div>
					${condicoes.length > 0 ? `
						<div style="margin-bottom: 1rem;">
							<h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; opacity: 0.9;">📋 ${t('promocoes.condicoes')}</h4>
							<ul style="margin: 0; padding-left: 1.2rem; font-size: 0.9rem;">
								${condicoes.map(c => `<li>${c}</li>`).join('')}
							</ul>
						</div>
					` : ''}
					${beneficios.length > 0 ? `
						<div style="margin-bottom: 1rem;">
							<h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; opacity: 0.9;">🎁 ${t('promocoes.beneficios')}</h4>
							<ul style="margin: 0; padding-left: 1.2rem; font-size: 0.9rem;">
								${beneficios.map(b => `<li style="color: #fff3cd; font-weight: 600;">${b}</li>`).join('')}
							</ul>
						</div>
					` : ''}
					${p.observacoes && p.observacoes.trim() ? `
						<div style="margin-bottom: 1rem;">
							<h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; opacity: 0.9;">📝 ${t('promocoes.observacoes')}</h4>
							<p style="margin: 0; font-size: 0.9rem; font-style: italic; opacity: 0.9;">${p.observacoes.trim()}</p>
						</div>
					` : ''}
				</div>
			`;
		});
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding:2rem;max-width:600px;max-height:80vh;overflow-y:auto;border-radius:16px;">
				<div style="text-align: center; margin-bottom: 2rem;">
					<h2 style="margin: 0; color: #ff6b9d; font-size: 2rem;">🎉 ${t('promocoes.titulo')}</h2>
					<p style="margin: 0.5rem 0 0 0; color: #666;">${t('promocoes.descricao')}</p>
				</div>
				${promocoesHtml}
				<div style="display:flex;justify-content:center;margin-top:2rem;">
					<button onclick="closeModal('${modalId}')" style="background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; padding: 1rem 3rem; border-radius: 25px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(255,107,157,0.3);" data-i18n="promocoes.fechar"></button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
		modal.onclick = closeModalOverlay;
	}
	async updateStockForOrder(action, orderId) {
		const { data: itens, error } = await this.supabase
			.from('pedido_itens')
			.select('produto_id, quantidade')
			.eq('pedido_id', orderId);
		if (error) {
			console.error('Erro ao carregar itens do pedido:', error);
			return;
		}
		for (const item of itens) {
			const produtoId = item.produto_id;
			const quantidade = item.quantidade;
			// Get stock entries for this product, ordered by created_at (FIFO)
			const { data: stockEntries, error: stockError } = await this.supabase
				.from('estoque')
				.select('id, quantidade_disponivel, quantidade_reservada, quantidade_vendida')
				.eq('produto_id', produtoId)
				.order('created_at', { ascending: true });
			if (stockError) {
				console.error('Erro ao carregar estoque:', stockError);
				continue;
			}
			let remaining = quantidade;
			for (const entry of stockEntries) {
				if (remaining <= 0) break;
				let available;
				if (action === 'reserve') {
					available = entry.quantidade_disponivel;
				} else if (action === 'sell') {
					available = entry.quantidade_reservada;
				}
				const deduct = Math.min(remaining, available);
				if (action === 'reserve') {
					const newDisponivel = entry.quantidade_disponivel - deduct;
					const newReservada = (entry.quantidade_reservada || 0) + deduct;
					await this.supabase
						.from('estoque')
						.update({ quantidade_disponivel: newDisponivel, quantidade_reservada: newReservada })
						.eq('id', entry.id);
				} else if (action === 'sell') {
					const newReservada = entry.quantidade_reservada - deduct;
					const newVendida = (entry.quantidade_vendida || 0) + deduct;
					await this.supabase
						.from('estoque')
						.update({ quantidade_reservada: newReservada, quantidade_vendida: newVendida })
						.eq('id', entry.id);
				}
				remaining -= deduct;
			}
			// Update produtos.estoque to available stock
			const totalAvailable = stockEntries.reduce((sum, e) => sum + (e.quantidade_disponivel - (e.quantidade_reservada || 0)), 0);
			await this.supabase
				.from('produtos')
				.update({ estoque: Math.max(0, totalAvailable) })
				.eq('id', produtoId);
		}
	}
	loadPedidosStatusList() {
		const container = document.getElementById('pedidos-status-list');
		if (!container) return;
		// Verificar role do usuário atual
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isVendedor = role === 'sale' || role === 'vendedor';
		const isAdmin = role === 'admin';
		// Filtrar pedidos baseado no role do usuário
		let pedidosFiltrados = this.orders;
		if (isVendedor && this.currentUser?.id) {
			// Filtrar apenas pedidos do vendedor logado
			pedidosFiltrados = this.orders.filter(order =>
				order.vendedor_id && order.vendedor_id == this.currentUser.id
			);
			console.log(`👤 Vendedor logado - mostrando ${pedidosFiltrados.length} pedidos próprios (apenas com vendedor_id)`);
		} else if (isAdmin) {
			console.log('👑 Admin logado - mostrando todos os pedidos');
			pedidosFiltrados = this.orders;
		}
		// Status disponíveis para os pedidos
		const statusOptions = this.getStatusOptions();
		// Mostrar lista resumida de pedidos com status editável
		const pedidosList = pedidosFiltrados.slice(0, 10).map(order => {
			// Verificar se o pedido tem entrega associada
			const temEntrega = this.entregas.some(entrega => entrega.pedido_id == order.id);
			const tipoIcon = temEntrega ? '🚚' : '🏪';
			const tipoLabel = temEntrega ? 'Entrega' : 'Retirada';

			// Timeline horizontal com status
			const statusSteps = this.getTimelineStatuses();
			const orderStatus = this.normalizeOrderStatus(order.status);
			const paymentStatus = this.getPaymentStatus(order);
			const valorPago = order.valor_pago ? parseFloat(order.valor_pago).toFixed(2) : '0.00';
			const valorTotal = order.valor_total ? parseFloat(order.valor_total).toFixed(2) : '0.00';
			const paymentProgressColor = paymentStatus.textColor === '#212529' ? '#212529' : 'rgba(255,255,255,0.95)';
			const formaPagamentoLabel = order.forma_pagamento ? this.getPaymentMethodLabel(order.forma_pagamento) : '';
			const isPendingOrPartial = paymentStatus.key === 'pending' || paymentStatus.key === 'partial';
			const paymentSummary = `
				<div class="payment-status-card" 
					onclick="${isPendingOrPartial ? `event.stopPropagation(); window.dashboardApp.abrirModalPagamento('${order.id}')` : ''}"
					style="width: 100%; background: ${paymentStatus.color}; color: ${paymentStatus.textColor}; border-radius: 10px; padding: 0.55rem 0.65rem; display: flex; flex-direction: column; gap: 0.4rem; box-shadow: 0 2px 6px rgba(0,0,0,0.08); ${isPendingOrPartial ? 'cursor: pointer; transition: transform 0.2s;' : ''}"
					${isPendingOrPartial ? 'onmouseover="this.style.transform=\'scale(1.02)\'" onmouseout="this.style.transform=\'scale(1)\'"' : ''}>
					<div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.75rem; font-weight: 600;">
						<span>${paymentStatus.label}${isPendingOrPartial ? ' 💳' : ''}</span>
						<span>R$ ${valorPago} / R$ ${valorTotal}</span>
					</div>
					<div style="width: 100%; height: 6px; background: rgba(255,255,255,0.25); border-radius: 4px;">
						<div style="height: 100%; width: ${paymentStatus.progress}%; background: ${paymentProgressColor}; border-radius: 4px; transition: width 0.3s ease;"></div>
					</div>
					<div style="font-size: 0.65rem; font-weight: 500; color: ${paymentStatus.textColor === '#212529' ? '#212529' : 'rgba(255,255,255,0.9)'};">
						${paymentStatus.hint}${isPendingOrPartial ? ' (Clique para adicionar)' : ''}
					</div>
				</div>
				${formaPagamentoLabel ? `<div style="font-size: 0.7rem; color: #6c757d; text-transform: capitalize;">${formaPagamentoLabel}</div>` : ''}
			`;

			const currentStatusIndex = statusSteps.findIndex(s => s.key === orderStatus);
			const timelineHtml = statusSteps.map((step, index) => {
				   const isCompleted = index <= currentStatusIndex;
				   const isCurrent = index === currentStatusIndex;
				   const canAdvance = index === currentStatusIndex + 1;
				   const hasBannerSent = order.email_sent_steps && order.email_sent_steps.includes(step.key);

				   return `
					   <div class="timeline-step" style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; position: relative; flex: 1; min-width: 60px;">
						   ${hasBannerSent ? `<div style="position: absolute; top: -6px; left: 50%; transform: translateX(-50%); color: #28a745; font-size: 0.7rem; font-weight: bold;">${step.emoji}</div>` : ''}
						   <div class="timeline-icon" style="
							   width: 32px; height: 32px; border-radius: 50%;
							   background: ${isCompleted ? step.color : '#e9ecef'};
							   color: ${isCompleted ? 'white' : '#6c757d'};
							   display: flex; align-items: center; justify-content: center;
							   font-size: 0.9rem; border: 2px solid ${isCurrent ? step.color : 'transparent'};
							   cursor: ${canAdvance ? 'pointer' : 'default'};
							   transition: all 0.3s ease;
							   position: relative;
							   box-shadow: ${isCompleted ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'};
						   "
						   onclick="${canAdvance ? `window.dashboardApp.avancarStatusPedido('${order.id}', '${step.key}')` : ''}"
						   onmouseover="${canAdvance ? `this.style.transform='scale(1.1)'; this.style.boxShadow='0 3px 8px rgba(0,0,0,0.15)'` : ''}"
						   onmouseout="${canAdvance ? `this.style.transform='scale(1)'; this.style.boxShadow='${isCompleted ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'}'` : ''}"
						   title="${canAdvance ? `Avançar para: ${step.label}` : step.label}"
						   >
							   ${step.emoji}
						   </div>
						   <div class="timeline-label" style="
							   font-size: 0.65rem; text-align: center; color: ${isCompleted ? step.color : '#6c757d'};
							   font-weight: ${isCurrent ? '700' : isCompleted ? '600' : '400'}; max-width: 50px;
							   line-height: 1.1;
						   ">
							   ${step.label}
						   </div>
						   ${canAdvance ? `<button class="banner-btn" style="background: #007bff; color: white; border: none; border-radius: 3px; padding: 0.15rem 0.3rem; font-size: 0.55rem; cursor: pointer; margin-top: 0.05rem; opacity: 0.9; font-weight: 600; transition: all 0.2s ease;" onclick="event.stopPropagation(); window.dashboardApp.abrirBannerStatus('${order.id}', '${step.key}')" title="Abrir banner profissional">🎫 Banner</button>` : ''}
					   </div>
				`;
			}).join('');

			return `
			<div class="pedido-item" data-order-id="${order.id}" style="cursor: pointer; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #e9ecef; border-radius: 8px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
				<div class="pedido-info" style="display: grid; grid-template-columns: 1fr 3fr 1fr; gap: 0.75rem; align-items: start; margin-bottom: 0.1rem;">
					<!-- Coluna 1: Informações do pedido -->
					<div style="display: flex; flex-direction: column;">
						<strong style="font-size: 1.1rem; color: #333;">#${order.numero_pedido || order.id}</strong>
						<span class="tipo-entrega" style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">${tipoIcon} ${tipoLabel}</span>
						<div style="margin-top: 0.25rem; color: #666;">${order.cliente_nome || 'Cliente'}</div>
					</div>

					<!-- Coluna 2: Timeline -->
					<div class="pedido-timeline" style="
						display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
						padding: 0.6rem; background: #f8f9fa; border-radius: 6px;
						border: 1px solid #e9ecef; flex-wrap: wrap; width: 100%;
					">
						${timelineHtml}
					</div>

					<!-- Coluna 3: Status e valor -->
					<div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem;">
						${paymentSummary}
						<div class="pedido-valor" style="font-size: 1.2rem; font-weight: 600; color: #28a745;">R$ ${order.valor_total ? parseFloat(order.valor_total).toFixed(2) : '0.00'}</div>
						<select class="status-dropdown" data-order-id="${order.id}" onchange="window.dashboardApp.updateOrderStatus(this)" style="padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #dee2e6; font-size: 0.8rem; background: white; min-width: 120px;">
							${statusOptions.map(option => `
								<option value="${option.value}" ${orderStatus === option.value ? 'selected' : ''}>
									${option.label}
								</option>
							`).join('')}
						</select>
					</div>
				</div>
			</div>
		`}).join('');
		container.innerHTML = pedidosList || '<p style="text-align: center; color: #666; padding: 2rem;">Nenhum pedido encontrado</p>';
		// Usar event delegation para evitar múltiplos listeners
		// Remover listener anterior se existir
		const existingListener = container._pedidoClickListener;
		if (existingListener) {
			container.removeEventListener('click', existingListener);
		}
		// Adicionar listener único ao container
		container._pedidoClickListener = (e) => {
			// Não abrir modal se clicar no select de status
			if (e.target.closest('.status-dropdown')) {
				return;
			}
			const pedidoItem = e.target.closest('.pedido-item');
			if (pedidoItem) {
				const orderId = pedidoItem.getAttribute('data-order-id');
				if (orderId) {
					this.showOrderDetails(orderId);
				}
			}
		};
		container.addEventListener('click', container._pedidoClickListener);
	}
	getStatusLabel(status) {
		const normalized = this.normalizeOrderStatus(status);
		const statusLabels = {
			'pendente': 'Pedido Recebido',
			'confirmado': 'Pedido Confirmado',
			'producao': 'Em Produção',
			'saiu_entrega': 'Saiu para Entrega',
			'entregue': 'Pedido Entregue',
			'cancelado': 'Pedido Cancelado',
			'recebido': 'Pedido Recebido',
			'agradecimento': 'Agradecimento'
		};
		return statusLabels[normalized] || status;
	}
	
	abrirModalPagamento(orderId) {
		const order = this.orders.find(o => o.id === orderId);
		if (!order) {
			alert('Pedido não encontrado');
			return;
		}

		const valorTotal = parseFloat(order.valor_total || 0);
		const valorPago = parseFloat(order.valor_pago || 0);
		const valorRestante = Math.max(0, valorTotal - valorPago);

		const modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) return;

		const modalId = 'modal-pagamento-' + orderId;
		
		const existingModal = document.getElementById(modalId);
		if (existingModal) {
			existingModal.remove();
		}

		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.onclick = (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		};

		modal.innerHTML = `
			<div class="modal-content-wrapper" style="padding: 2rem; max-width: 500px;" onclick="event.stopPropagation()">
				<h2 style="margin-bottom: 1.5rem; color: #333;">💳 Adicionar Pagamento</h2>
				
				<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #ff6b9d;">
					<p style="margin: 0.5rem 0; font-size: 0.95rem;">
						<strong>Pedido:</strong> #${order.numero_pedido || order.id}
					</p>
					<p style="margin: 0.5rem 0; font-size: 0.95rem;">
						<strong>Cliente:</strong> ${order.cliente_nome || 'N/A'}
					</p>
					<p style="margin: 0.5rem 0; font-size: 0.95rem;">
						<strong>Valor Total:</strong> <span style="color: #28a745; font-weight: bold;">R$ ${valorTotal.toFixed(2)}</span>
					</p>
					<p style="margin: 0.5rem 0; font-size: 0.95rem;">
						<strong>Valor Pago:</strong> R$ ${valorPago.toFixed(2)}
					</p>
					<p style="margin: 0.5rem 0; font-size: 1.1rem; color: #dc3545; font-weight: bold;">
						<strong>Valor Restante:</strong> R$ ${valorRestante.toFixed(2)}
					</p>
				</div>

				<div style="margin-bottom: 1.5rem;">
					<label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">
						Valor do Pagamento:
					</label>
					<input 
						type="number" 
						id="valor-pagamento-${orderId}" 
						step="0.01" 
						min="0.01" 
						max="${valorRestante}"
						value="${valorRestante.toFixed(2)}"
						style="width: 100%; padding: 0.75rem; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1.1rem; font-weight: bold;"
						placeholder="0.00"
					>
					<small style="color: #6c757d; display: block; margin-top: 0.5rem;">
						Valor máximo: R$ ${valorRestante.toFixed(2)}
					</small>
				</div>

				<div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
					<button 
						onclick="document.getElementById('${modalId}').remove()" 
						style="background: #eee; color: #333; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s;"
						onmouseover="this.style.background='#ddd'"
						onmouseout="this.style.background='#eee'">
						Cancelar
					</button>
					<button 
						onclick="window.dashboardApp.confirmarPagamento('${orderId}')" 
						style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s;"
						onmouseover="this.style.background='#218838'"
						onmouseout="this.style.background='#28a745'">
						💰 Confirmar Pagamento
					</button>
				</div>
			</div>
		`;

		modalsContainer.appendChild(modal);

		const input = document.getElementById(`valor-pagamento-${orderId}`);
		if (input) {
			input.focus();
			input.select();
		}
	}

	async confirmarPagamento(orderId) {
		const input = document.getElementById(`valor-pagamento-${orderId}`);
		const valorPagamento = parseFloat(input?.value || 0);

		if (!valorPagamento || valorPagamento <= 0) {
			alert('Por favor, informe um valor válido para o pagamento.');
			return;
		}

		const order = this.orders.find(o => o.id === orderId);
		if (!order) {
			alert('Pedido não encontrado');
			return;
		}

		const valorTotal = parseFloat(order.valor_total || 0);
		const valorPagoAtual = parseFloat(order.valor_pago || 0);
		const valorRestante = valorTotal - valorPagoAtual;

		if (valorPagamento > valorRestante) {
			alert(`O valor informado (R$ ${valorPagamento.toFixed(2)}) é maior que o valor restante (R$ ${valorRestante.toFixed(2)}).`);
			return;
		}

		const novoValorPago = valorPagoAtual + valorPagamento;

		try {
			const { error } = await this.supabase
				.from('pedidos')
				.update({ 
					valor_pago: novoValorPago,
					updated_at: new Date().toISOString()
				})
				.eq('id', orderId);

			if (error) {
				console.error('Erro ao atualizar pagamento:', error);
				alert('Erro ao atualizar pagamento: ' + error.message);
				return;
			}

			order.valor_pago = novoValorPago;

			const modal = document.getElementById(`modal-pagamento-${orderId}`);
			if (modal) {
				modal.remove();
			}

			alert(`✅ Pagamento de R$ ${valorPagamento.toFixed(2)} adicionado com sucesso!\n\nNovo valor pago: R$ ${novoValorPago.toFixed(2)}\nValor total: R$ ${valorTotal.toFixed(2)}`);

			await this.loadData();

		} catch (error) {
			console.error('Erro ao confirmar pagamento:', error);
			alert('Erro ao confirmar pagamento. Tente novamente.');
		}
	}

	async showOrderDetails(orderId) {
		// Verificar se já há um modal de detalhes aberto
		const existingDetailsModal = document.getElementById('order-details-modal');
		if (existingDetailsModal) {
			console.log('⚠️ Modal de detalhes já está aberto, ignorando clique');
			return;
		}
		const order = this.orders.find(o => o.id === orderId);
		if (!order) {
			console.error('❌ Pedido não encontrado:', orderId);
			alert('Pedido não encontrado');
			return;
		}
		console.log('✅ Pedido encontrado:', order);
		// Verificar permissões de acesso
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isAdmin = role === 'admin';
		const isVendedor = role === 'sale' || role === 'vendedor';
		// Vendedores só podem ver pedidos próprios
		if (isVendedor && order.vendedor_id && order.vendedor_id != this.currentUser.id) {
			alert('Você só pode visualizar detalhes dos seus próprios pedidos.');
			return;
		}
		// Pedidos sem vendedor_id (antigos) só podem ser vistos por admins
		if (!isAdmin && !order.vendedor_id) {
			alert('Este pedido não pode ser visualizado. Contate o administrador.');
			return;
		}
		// Criar modal
		const modalId = 'order-details-modal';
		// Remover TODOS os modais existentes para evitar sobreposição
		document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
		// Remover modal específico se ainda existir
		const existingModal = document.getElementById(modalId);
		if (existingModal) {
			existingModal.remove();
		}
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.style.zIndex = '2000'; // Garantir z-index alto
		// Event listener para fechar modal
		modal.addEventListener('click', (e) => {
			if (e.target === modal || e.target.classList.contains('modal-overlay')) {
				closeModal(modalId);
			}
		});
		// Buscar itens do pedido se disponíveis
		let orderItems = [];
		try {
			const { data: items, error } = await this.supabase
				.from('pedido_itens')
				.select('*, produtos(id, nome, fotos)')
				.eq('pedido_id', orderId);
			if (!error && items) {
				orderItems = items;
				console.log('📦 Itens do pedido:', items.map(item => ({
					produto: item.produtos?.nome,
					fotos_raw: item.produtos?.fotos,
					foto_parsed: item.produtos?.fotos ? (() => {
						try {
							const fotos = JSON.parse(item.produtos.fotos);
							return Array.isArray(fotos) ? fotos[0] : null;
						} catch (e) {
							return 'ERRO_PARSE';
						}
					})() : null
				})));
			}
		} catch (e) {
			console.warn('Erro ao buscar itens do pedido:', e);
		}
		// Buscar cliente completo se necessário
		let clienteCompleto = null;
		if (order.cliente_id) {
			clienteCompleto = this.clients.find(c => c.id == order.cliente_id);
			if (!clienteCompleto) {
				try {
					const { data: clienteData, error } = await this.supabase
						.from('clientes')
						.select('*')
						.eq('id', order.cliente_id)
						.single();
					if (!error && clienteData) {
						clienteCompleto = clienteData;
					}
				} catch (e) {
					console.warn('Erro ao buscar dados completos do cliente:', e);
				}
			}
		}
		// Formatar data
		const dataCriacao = order.created_at ? new Date(order.created_at).toLocaleString('pt-BR') : 'N/A';
		const dataEntrega = this.formatDate(order.data_entrega);
		// Conteúdo do modal
		modal.innerHTML = `
			<div class="modal-content-wrapper" onclick="event.stopPropagation()" style="max-width: 800px; width: 100%; padding: 1.5rem;">
				<div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #eee;">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<h3 style="margin: 0; color: #333; font-size: 1.25rem;">📋 Detalhes do Pedido #${order.numero_pedido || order.id}</h3>
						<button onclick="closeModal('${modalId}')" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; line-height: 1;">&times;</button>
					</div>
				</div>
				<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
					<!-- Informações do Pedido -->
					<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
						<h4 style="margin: 0 0 1rem 0; color: #333;">📋 Informações do Pedido</h4>
						<div style="display: flex; flex-direction: column; gap: 0.5rem;">
							<div><strong>Número:</strong> #${order.numero_pedido || order.id}</div>
							<div><strong>Status:</strong> <span class="status-badge status-${order.status}">${this.getStatusLabel(order.status)}</span></div>
							<div><strong>Data de Criação:</strong> ${dataCriacao}</div>
							<div><strong>Data de Entrega:</strong> ${dataEntrega}</div>
							<div><strong>Valor Total:</strong> R$ ${order.valor_total ? parseFloat(order.valor_total).toFixed(2) : '0.00'}</div>
							<div><strong>Valor Pago:</strong> R$ ${order.valor_pago ? parseFloat(order.valor_pago).toFixed(2) : '0.00'}</div>
						</div>
					</div>
					<!-- Informações do Cliente -->
					<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
						<h4 style="margin: 0 0 1rem 0; color: #333;">👤 Informações do Cliente</h4>
						<div style="display: flex; flex-direction: column; gap: 0.5rem;">
							<div><strong>Nome:</strong> ${clienteCompleto?.nome || order.cliente_nome || 'Cliente não informado'}</div>
							${clienteCompleto?.telefone ? `<div><strong>Telefone:</strong> ${clienteCompleto.telefone}</div>` : ''}
							${clienteCompleto?.email ? `<div><strong>Email:</strong> ${clienteCompleto.email}</div>` : ''}
							${clienteCompleto?.endereco ? `<div><strong>Endereço:</strong> ${clienteCompleto.endereco}</div>` : ''}
						</div>
					</div>
				</div>
				<!-- Itens do Pedido -->
				${orderItems.length > 0 ? `
					<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
						<h4 style="margin: 0 0 1rem 0; color: #333;">🛒 Itens do Pedido</h4>
						<div style="display: flex; flex-direction: column; gap: 0.5rem;">
							${orderItems.map(item => {
								const produto = item.produtos || {};
								let fotoUrl = null;
								if (produto.fotos) {
									try {
										const fotos = JSON.parse(produto.fotos);
										if (Array.isArray(fotos) && fotos.length > 0) {
											fotoUrl = fotos[0];
										}
									} catch (e) {
										console.warn('Erro ao parsear fotos do produto:', produto.nome, e);
									}
								}
								return `
									<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: white; border-radius: 4px;">
										<div style="display: flex; align-items: center; gap: 0.75rem;">
											<div style="width: 40px; height: 40px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
												${fotoUrl ? `<img src="${fotoUrl}" alt="${produto.nome || 'Produto'}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='📷'; this.parentElement.style.background='#f0f0f0';">` : '📷'}
											</div>
											<div>
												<strong>${produto.nome || 'Produto'}</strong>
												<span style="color: #666; margin-left: 1rem;">Quantidade: ${item.quantidade || 1}</span>
											</div>
										</div>
										<div style="font-weight: 600; color: #28a745;">
											R$ ${(item.preco_unitario ? parseFloat(item.preco_unitario) * (item.quantidade || 1) : 0).toFixed(2)}
										</div>
									</div>
								`;
							}).join('')}
						</div>
					</div>
				` : '<p style="color: #666; font-style: italic;">Itens do pedido não disponíveis</p>'}
				<!-- Ações -->
				<div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #eee;">
					<button onclick="closeModal('${modalId}')" style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Fechar</button>
				</div>
			</div>
		`;
		// Adicionar ao container de modais
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
	}
	async updateOrderStatus(selectElement) {
		const orderId = selectElement.getAttribute('data-order-id');
		const newStatus = selectElement.value;
		console.log(`🔄 updateOrderStatus chamado - Pedido: ${orderId}, Novo status: ${newStatus}`);
		const statusOptions = this.getStatusOptions();
		// Encontrar o pedido
		const order = this.orders.find(o => o.id == orderId);
		if (!order) {
			alert('Pedido não encontrado');
			return;
		}
		console.log(`📋 Pedido encontrado: ${order.numero_pedido || order.id}, Status atual: ${order.status}`);
		// Verificar se o usuário é administrador
		const isAdmin = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase() === 'admin';
		const isVendedor = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase() === 'sale' || (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase() === 'vendedor';
		// Se for vendedor, verificar se o pedido é dele
		if (isVendedor && order.user_id && order.user_id != this.currentUser.id) {
			alert('Você só pode atualizar pedidos criados por você.');
			// Reverter o select para o valor anterior
			selectElement.value = order.status;
			return;
		}
		// Validação de pagamento para status 'entregue'
		const normalizedNew = this.normalizeOrderStatus(newStatus);
		if (normalizedNew === 'entregue') {
			const valorTotal = parseFloat(order.valor_total || 0);
			const valorPago = parseFloat(order.valor_pago || 0);
			
			if (valorPago < valorTotal) {
				const valorRestante = (valorTotal - valorPago).toFixed(2);
				alert(`❌ Não é possível marcar como entregue!\n\nO pagamento não está completo.\n\nValor Total: R$ ${valorTotal.toFixed(2)}\nValor Pago: R$ ${valorPago.toFixed(2)}\nValor Restante: R$ ${valorRestante}\n\nPor favor, registre o pagamento restante antes de marcar como entregue.`);
				selectElement.value = order.status;
				return;
			}
		}

		// Se não for admin, aplicar validações de ordem cronológica
		if (!isAdmin) {
			// Validações de ordem cronológica dos status
			const statusOrder = ['pendente', 'confirmado', 'producao', 'saiu_entrega', 'entregue', 'cancelado'];
			const normalizedCurrent = this.normalizeOrderStatus(order.status);
			const currentIndex = statusOrder.indexOf(normalizedCurrent);
			const newIndex = statusOrder.indexOf(normalizedNew);
			// Cancelado pode ser aplicado a qualquer status
			if (normalizedNew === 'cancelado') {
				// Permitir cancelamento de qualquer status
			}
			// Não permitir voltar para status anteriores (exceto cancelado)
			else if (newIndex !== -1 && currentIndex !== -1 && newIndex < currentIndex) {
				const optionLabel = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
				alert(`Não é possível voltar para "${optionLabel}". O pedido deve seguir a ordem cronológica.`);
				selectElement.value = normalizedCurrent;
				return;
			}
			// Permitir progressões na ordem cronológica (pode pular etapas para frente)
			else {
				// Todas as progressões para frente são permitidas, desde que sigam a ordem
			}
		}
		// Se for admin, permitir qualquer transição de status sem validações
		try {
			// Preparar dados para atualização
			const updateData = {
				status: newStatus,
				updated_at: new Date().toISOString()
			};
			const { data, error } = await this.supabase
				.from('pedidos')
				.update(updateData)
				.eq('id', orderId);
			if (error) {
				console.error('Erro do Supabase:', error);
				throw error;
			}			// Atualizar o pedido na memória
			const oldStatus = order.status;
			order.status = newStatus;
			this.handleStatusEmailTriggers(orderId, newStatus);
			// Atualizar status das entregas relacionadas se necessário
			if (newStatus === 'entregue' || newStatus === 'cancelado') {
				console.log(`🔄 CONDIÇÃO ATENDIDA: Atualizando status da entrega para pedido #${orderId} - newStatus: ${newStatus}`);
				try {
					const entregaStatus = newStatus === 'entregue' ? 'entregue' : 'cancelada';
					// Verificar se existe entrega para este pedido
					const { data: existingEntrega, error: checkError } = await this.supabase
						.from('entregas')
						.select('id, status')
						.eq('pedido_id', orderId)
						.single();
					if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
						console.warn('⚠️ Erro ao verificar entrega existente:', checkError);
					} else if (existingEntrega) {
						console.log(`📦 Entrega encontrada: ${existingEntrega.id}, status atual: ${existingEntrega.status}`);
						// Atualizar entrega no banco
						const { data: entregaData, error: entregaError } = await this.supabase
							.from('entregas')
							.update({
								status: entregaStatus,
								updated_at: new Date().toISOString()
							})
							.eq('pedido_id', orderId)
							.select();
						if (entregaError) {
							console.warn('⚠️ Erro ao atualizar status da entrega:', entregaError);
						} else {
							console.log(`✅ Status da entrega atualizado para: ${entregaStatus}`, entregaData);
							// Atualizar entrega na memória local imediatamente
							const entregaIndex = this.entregas.findIndex(e => e.pedido_id == orderId);
							if (entregaIndex !== -1) {
								this.entregas[entregaIndex].status = entregaStatus;
								this.entregas[entregaIndex].updated_at = new Date().toISOString();
								console.log(`💾 Entrega atualizada na memória: ${entregaStatus}`);
								console.log(`📊 Array de entregas após atualização:`, this.entregas.filter(e => e.pedido_id == orderId));
							} else {
								console.warn(`⚠️ Entrega não encontrada na memória para pedido #${orderId}`);
								console.log(`📊 Todas as entregas na memória:`, this.entregas.map(e => ({id: e.id, pedido_id: e.pedido_id, status: e.status})));
							}
						}
					} else {
						console.log(`ℹ️ Não há entrega associada ao pedido #${orderId} (pedido sem entrega ou retirada)`);
					}
				} catch (entregaUpdateError) {
					console.warn('⚠️ Erro ao atualizar entrega:', entregaUpdateError);
				}
			} else {
				console.log(`ℹ️ Status ${newStatus} não requer atualização de entrega`);
			}
			// Update stock if confirmed (reserve)
			if (newStatus === 'confirmado') {
				await this.updateStockForOrder('reserve', orderId);
			}
			// Update stock if delivered
			if (newStatus === 'entregue') {
				await this.updateStockForOrder('sell', orderId);
				await this.loadData(); // Recarregar dados imediatamente após atualizar estoque
			}
			// Mostrar feedback visual
			selectElement.style.backgroundColor = '#d4edda';
			selectElement.style.borderColor = '#c3e6cb';
			setTimeout(() => {
				selectElement.style.backgroundColor = '';
				selectElement.style.borderColor = '';
			}, 1000);
			// Atualizar telas imediatamente (antes do loadData para evitar conflitos)
			this.createStatsCards();
			this.loadPedidosStatusList(); // Atualizar lista de pedidos no dashboard
			if (document.getElementById('entregas-hoje')) {
				this.updateFollowUpEntregas(); // Atualizar follow-up de entregas
			}
			if (this.activeSection === 'entregas') {
				this.renderEntregasPage(); // Update deliveries page if active
			}
			// Recarregar dados em background para manter sincronização
			this.loadData().then(() => {
				console.log('🔄 Dados recarregados após atualização de status');
				// Atualizar telas novamente após recarregar dados
				this.createStatsCards();
				this.loadPedidosStatusList();
				if (document.getElementById('entregas-hoje')) {
					this.updateFollowUpEntregas();
				}
				if (this.activeSection === 'entregas') {
					this.renderEntregasPage();
				}
			}).catch(error => {
				console.warn('⚠️ Erro ao recarregar dados:', error);
			});
			console.log(`✅ Status do pedido #${orderId} atualizado para: ${newStatus}`);
		} catch (error) {
			console.error('❌ Erro ao atualizar status do pedido:', error);
			alert('Erro ao atualizar status do pedido: ' + error.message);
			// Reverter visual em caso de erro
			selectElement.style.backgroundColor = '#f8d7da';
			selectElement.style.borderColor = '#f5c6cb';
			setTimeout(() => {
				selectElement.style.backgroundColor = '';
				selectElement.style.borderColor = '';
			}, 2000);
		}
	}
	loadEntregasHojeContent() {
		if (!container) return;
		// Verificar role do usuário atual
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isVendedor = role === 'sale' || role === 'vendedor';
		const isAdmin = role === 'admin';
		// Filtrar pedidos baseado no role do usuário
		let pedidosFiltrados = this.orders;
		if (isVendedor && this.currentUser?.id) {
			// Filtrar apenas pedidos do vendedor logado
			pedidosFiltrados = this.orders.filter(order =>
				order.vendedor_id && order.vendedor_id == this.currentUser.id
			);
			console.log(`👤 Vendedor logado - mostrando ${pedidosFiltrados.length} entregas de hoje de pedidos próprios`);
		} else if (isAdmin) {
			console.log('👑 Admin logado - mostrando todas as entregas de hoje');
			pedidosFiltrados = this.orders;
		}
		const hoje = new Date().toISOString().split('T')[0];
		const entregasHoje = pedidosFiltrados.filter(order => 
			order.data_entrega && order.data_entrega.startsWith(hoje) && order.status !== 'cancelado'
		);
		if (entregasHoje.length === 0) {
			container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Nenhuma entrega agendada para hoje</p>';
			return;
		}
		const entregasList = entregasHoje.map(order => `
			<div class="entrega-item">
				<div class="entrega-info">
					<strong>#${order.numero_pedido || order.id}</strong>
					<span>${order.cliente_nome || 'Cliente'}</span>
				</div>
				<div class="entrega-status">
					<span class="status-badge status-${order.status}">${this.getStatusLabel(order.status)}</span>
				</div>
			</div>
		`).join('');
		container.innerHTML = entregasList;
	}
	createDataCards() {
		// Só renderizar páginas se elas estiverem ativas ou forem necessárias para o dashboard
		// Não renderizar seções individuais aqui, pois switchSection cuida disso
		if (this.activeSection === 'dashboard') {
			this.renderClientesPage();
			this.renderProdutosPage();
			this.renderPedidosPage();
			this.renderEntregasPage();
		}
		// Para seções individuais, deixar que switchSection cuide da renderização
	}
	updateStats() {
		this.createStatsCards();
	}
	countDeliveriesToday() {
		const today = new Date().toISOString().split('T')[0];
		return this.orders.filter(o => o.data_entrega === today).length;
	}
	updateFollowUpEntregas() {
		console.log('🔄 updateFollowUpEntregas() chamada');
		const entregasHoje = document.getElementById('entregas-hoje');
		if (!entregasHoje) {
			console.log('ℹ️ Elemento entregas-hoje ainda não existe, pulando atualização');
			return;
		}
		// Verificar role do usuário atual
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isVendedor = role === 'sale' || role === 'vendedor';
		const isAdmin = role === 'admin';
		console.log('🔍 Atualizando follow-up de entregas. Total de entregas:', this.entregas?.length || 0);
		console.log('🔍 Status das entregas:', this.entregas?.map(e => ({id: e.id, pedido_id: e.pedido_id, status: e.status, data_entrega: e.data_entrega})));
		// Filtrar entregas baseado no role do usuário
		let entregasFiltradas = this.entregas;
		if (isVendedor && this.currentUser?.id) {
			// Filtrar apenas entregas de pedidos do vendedor logado
			entregasFiltradas = this.entregas.filter(entrega => {
				// Encontrar o pedido relacionado e verificar se é do vendedor
				const pedido = this.orders.find(o => o.id == entrega.pedido_id);
				return pedido && pedido.vendedor_id && pedido.vendedor_id == this.currentUser.id;
			});
			console.log(`👤 Vendedor logado - mostrando ${entregasFiltradas.length} entregas de pedidos próprios`);
		} else if (isAdmin) {
			console.log('👑 Admin logado - mostrando todas as entregas');
			entregasFiltradas = this.entregas;
		}
		// Filtrar apenas entregas não canceladas e não entregues antigas
		const hoje = new Date();
		hoje.setHours(0, 0, 0, 0);
		const seteDiasAtras = new Date(hoje);
		seteDiasAtras.setDate(hoje.getDate() - 7);
		const entregasAtivas = entregasFiltradas
			.filter(entrega => {
				// Incluir entregas não canceladas
				if (entrega.status === 'cancelada') return false;
				// Incluir todas as entregas não entregues
				if (entrega.status !== 'entregue') return true;
				// Para entregas já entregues, não incluir na lista (removidas imediatamente)
				return false;
			})
			.sort((a, b) => {
				// Primeiro critério: status (priorizar "saiu_entrega" e "agendada" sobre "entregue")
				const statusPriority = { 'saiu_entrega': 1, 'agendada': 2, 'entregue': 3 };
				const aPriority = statusPriority[a.status] || 4;
				const bPriority = statusPriority[b.status] || 4;
				if (aPriority !== bPriority) return aPriority - bPriority;
				// Segundo critério: data (mais próximas primeiro)
				return new Date(a.data_entrega) - new Date(b.data_entrega);
			})
			.slice(0, 10); // Limitar a 10 entregas
		console.log('📅 Entregas no follow-up encontradas:', entregasAtivas.length);
		if (entregasAtivas.length === 0) {
			entregasHoje.innerHTML = `<div style="text-align: center; color: #888; padding: 2rem;"><i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem;"></i><p>${this.t('msg.nenhuma_entrega')}</p></div>`;
		} else {
			entregasHoje.innerHTML = `
				<div style="display: flex; flex-direction: column; gap: 0.5rem;">
					${entregasAtivas.map(entrega => {
						// Encontrar o pedido relacionado
						const pedido = this.orders.find(o => o.id == entrega.pedido_id) || {};
						// Encontrar o cliente relacionado
						const cliente = this.clients.find(c => c.id == pedido.cliente_id) || {};
						const dataEntrega = new Date(entrega.data_entrega);
						const hoje = new Date();
						hoje.setHours(0, 0, 0, 0);
						const dataEntregaNorm = new Date(dataEntrega);
						dataEntregaNorm.setHours(0, 0, 0, 0);
						const diffTime = dataEntregaNorm.getTime() - hoje.getTime();
						const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
						// Lógica de cores baseada na urgência
						let cardColor = '#f9f9f9'; // padrão (cinza claro)
						let borderColor = '#6c757d'; // padrão
						if (diffDays > 5) {
							// Verde: acima de 5 dias
							borderColor = '#28a745';
							cardColor = '#f8fff8'; // fundo verde muito claro
						} else if (diffDays > 2 && diffDays <= 5) {
							// Amarelo: acima de 2 dias e <= 5 dias
							borderColor = '#ffc107';
							cardColor = '#fffef8'; // fundo amarelo muito claro
						} else if (diffDays <= 2) {
							// Vermelho: <= 2 dias
							borderColor = '#dc3545';
							cardColor = '#fff8f8'; // fundo vermelho muito claro
							if (diffDays < 0) {
								// Atrasado - manter vermelho
								borderColor = '#dc3545';
								cardColor = '#fff8f8';
							}
						}
						const isHoje = dataEntregaNorm.getTime() === hoje.getTime();
						const isAmanha = dataEntregaNorm.getTime() === (hoje.getTime() + 24 * 60 * 60 * 1000);
						let dataLabel = dataEntrega.toLocaleDateString('pt-BR');
						if (isHoje) dataLabel = 'HOJE';
						else if (isAmanha) dataLabel = 'AMANHÃ';
						const statusColors = {
							'agendada': '#17a2b8',
							'saiu_entrega': '#ffc107',
							'entregue': '#28a745',
							'cancelada': '#dc3545'
						};
						return `
							<div style="background: ${cardColor}; padding: 0.6rem; border-left: 4px solid ${borderColor}; border-radius: 4px; cursor: pointer;" onclick="window.dashboardApp.showOrderDetails(${pedido.id})">
								<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.2rem;">
									<p style="margin: 0; font-weight: 600; color: #222;">${this.t('detail.pedido')} #${pedido.numero_pedido || pedido.id}</p>
									<span style="background: ${statusColors[entrega.status] || '#6c757d'}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">
										${entrega.status === 'agendada' ? 'Agendada' : 
										  entrega.status === 'saiu_entrega' ? 'Em Trânsito' : 
										  entrega.status === 'entregue' ? 'Entregue' : 
										  entrega.status === 'cancelada' ? 'Cancelada' : entrega.status}
									</span>
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
									<span style="color: #444; font-size: 0.9rem; font-weight: 500;">👤 ${cliente.nome || 'Cliente'}</span>
									<span style="color: #444; font-size: 0.9rem;">📍 ${entrega.endereco_entrega || cliente.endereco || 'Endereço não informado'}</span>
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center;">
									<span style="color: #444; font-size: 0.85rem;">📅 ${dataLabel} ${entrega.hora_entrega ? `• 🕐 ${entrega.hora_entrega}` : ''}</span>
									<span style="color: #222; font-size: 0.85rem; font-weight: 500;">💰 R$ ${pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2) : '0.00'}</span>
								</div>
								${entrega.observacoes ? `<p style="margin: 0.2rem 0 0 0; color: #666; font-size: 0.8rem; font-style: italic;">📝 ${entrega.observacoes}</p>` : ''}
							</div>
						`;
					}).join('')}
				</div>
			`;
		}
	}
	getDeliveriesToday() {
		const today = new Date().toISOString().split('T')[0];
		// Verificar role do usuário atual
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isVendedor = role === 'sale' || role === 'vendedor';
		const isAdmin = role === 'admin';
		// Filtrar pedidos baseado no role do usuário
		let pedidosFiltrados = this.orders;
		if (isVendedor && this.currentUser?.id) {
			// Filtrar apenas pedidos criados pelo usuário logado
			pedidosFiltrados = this.orders.filter(order =>
				order.user_id && order.user_id == this.currentUser.id
			);
		} else if (isAdmin) {
			pedidosFiltrados = this.orders;
		}
		return pedidosFiltrados.filter(o => 
			o.data_entrega === today && 
			o.status !== 'cancelado' && 
			o.status !== 'entregue'
			// TODO: Filtrar por tipo_entrega quando campo for adicionado ao schema
		).length;
	}
	getOrdersInProduction() {
		return this.orders.filter(o => 
			this.normalizeOrderStatus(o.status) === 'producao'
		).length;
	}
	updateAllTranslations() {
		this.createStatsCards();
		this.createDataCards();
		this.updateWelcomeMessage();
		if (document.getElementById('entregas-hoje')) {
			this.updateFollowUpEntregas();
		}
		// Re-renderizar produtos para atualizar traduções
		if (this.activeSection === 'pedidos') {
			this.renderPedidosPage();
		}
		if (this.isVendasOnline) {
			this.renderVendasOnlinePage();
		}
		// Atualizar lista de pedidos se estiver visível
		if (document.getElementById('pedidos-status-list')) {
			this.loadPedidosStatusList();
		}
		// Fechar modais abertos para forçar reabertura com novo idioma
		const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
		openModals.forEach(modal => {
			if (modal.id !== 'modal-loading') { // Não fechar modal de loading
				closeModal(modal.id);
			}
		});
	}
	// PÁGINA DE PEDIDOS - VENDA PRESENCIAL
	renderPedidosPage() {
		const container = document.getElementById('pedidos-container');
		if (!container) return;
		if (!this.cart) this.cart = {};
		// Calcular total do carrinho
		let cartTotal = 0;
		Object.values(this.cart).forEach(item => {
			if (item.adicionado) {
				cartTotal += item.quantidade * item.preco;
			}
		});
		// Não carregar promoções na página de pedidos (apenas vendas online)
		let promocoesBanner = '';
		// Dropdown de categorias + Botão Cliente + Total Carrinho
		const categorias = [...new Set(this.products.map(p => p.categoria).filter(Boolean))];
		let categoriaSelecionada = this.selectedCategoria || '';
		const topBar = `
			<div style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
				<button onclick="window.dashboardApp.openQuickAddClientModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(102,126,234,0.3); display: flex; align-items: center; gap: 0.5rem;">
					<i class="fas fa-user-plus"></i> <span data-i18n="vendas_online.adicionar_cliente"></span>
				</button>
				<div style="display: flex; align-items: center; gap: 0.5rem;">
					<label for="dropdown-categoria" style="font-weight: 600;" data-i18n="vendas_online.filtrar"></label>
					<select id="dropdown-categoria" style="padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #eee; font-size: 1rem;">
						<option value="" data-i18n="vendas_online.todas_categorias"></option>
						${categorias.map(cat => `<option value="${cat}" ${cat === categoriaSelecionada ? 'selected' : ''}>${cat}</option>`).join('')}
					</select>
				</div>
				<div style="font-size: 1.15rem; font-weight: 700; color: #28a745; background: #f8f9fa; border-radius: 8px; padding: 0.5rem 1.2rem;">
					<span data-i18n="vendas_online.total"></span> <span class="pedidos-cart-total">${this.formatCurrency(cartTotal)}</span>
				</div>
			</div>
		`;
		// Produtos
		let produtosHtml = '';
		const produtosFiltrados = categoriaSelecionada 
			? this.products.filter(p => p.categoria === categoriaSelecionada)
			: this.products;
		if (produtosFiltrados.length === 0) {
			produtosHtml = `<div style="text-align: center; padding: 3rem; color: #888;"><i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i><p data-i18n="vendas_online.nenhum_produto"></p></div>`;
		} else {
			produtosHtml = `
				<div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
					${produtosFiltrados.map((produto, index) => {
						let fotos = [];
						if (produto.fotos) {
							try { fotos = JSON.parse(produto.fotos); } catch {}
						}
						const id = produto.id || `produto-${index}`;
						return `
							<div class="card-produto" style="background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 1.2rem; max-width: 320px; width: 100%; display: flex; flex-direction: column; align-items: center;" data-descricao="${produto.descricao || ''}">
								<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
									<span style="font-size: 1.0rem; font-weight: 700; color: #333;">${translateProductName(produto.nome)}</span>
									<div style="margin-top: 0.5rem;">
										<span style="background: ${produto.status_produto === 'pronta_entrega' ? '#28a745' : '#ff6b9d'}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">${produto.status_produto === 'pronta_entrega' ? t('vendas_online.pronta_entrega') : t('vendas_online.sob_encomenda')}</span>
									</div>
								</div>
								<div style="position: relative; width: 220px; height: 220px; border-radius: 10px; overflow: hidden; background: #f0f0f0; margin-bottom: 0.7rem;">
									<div id="market-carousel-${id}" data-current="0" style="display: flex; transition: transform 0.3s ease;">
										${fotos.length > 0 ? fotos.map(foto => `<img loading="lazy" data-src="${foto}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" style="min-width: 100%; height: 220px; object-fit: contain; background: #f8f9fa;" alt="${translateProductName(produto.nome)}">`).join('') : `<div style="width: 100%; height: 100%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #666;">${t('vendas_online.sem_imagem')}</div>`}
									</div>
									${fotos.length > 1 ? `
										<button data-action="prev-produto-photo" data-id="${id}" data-total="${fotos.length}" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">‹</button>
										<button data-action="next-produto-photo" data-id="${id}" data-total="${fotos.length}" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">›</button>
									` : ''}
								</div>
								<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
									<span style="font-size: 1.1rem; font-weight: 700; color: #ff6b9d;">${this.formatCurrency(produto.preco)}</span>
								</div>
								<div style="display: flex; align-items: center; justify-content: center; gap: 1rem; width: 100%; margin-bottom: 0.5rem;">
									<button data-action="decrement-produto" data-id="${id}" style="background: #eee; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.1rem; cursor: pointer;">-</button>
									<span id="contador-produto-${id}" style="font-size: 1.1rem; font-weight: 600; min-width: 32px; text-align: center;">${this.cart[id]?.quantidade || 0}</span>
									<button data-action="increment-produto" data-id="${id}" data-preco="${produto.preco}" style="background: #eee; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.1rem; cursor: pointer;">+</button>
								</div>
								<button data-action="adicionar-carrinho" data-id="${id}" data-preco="${produto.preco}" style="width: 100%; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; padding: 0.8rem 0; font-size: 1.1rem; font-weight: 700; cursor: pointer;" data-i18n="vendas_online.adicionar_carrinho"></button>
							</div>
						`;
					}).join('')}
				</div>
			`;
		}
		container.innerHTML = topBar + produtosHtml;
		this.lazyLoadProductImages();
		// Tooltip
		this.setupProductTooltip();
		// Dropdown evento
		const dropdown = container.querySelector('#dropdown-categoria');
		if (dropdown) {
			dropdown.onchange = (e) => {
				this.selectedCategoria = e.target.value;
				this.renderPedidosPage();
			};
		}
		// Eventos dos produtos
		this.setupPedidosEventDelegation();
		// Atualizar valor total do carrinho no topo
		this.updatePedidosCartTotal();
		// Aplicar traduções aos elementos recém-criados
		setTimeout(() => applyTranslations(), 100);
	}
	// PÁGINA DE VENDAS ONLINE
	async renderVendasOnlinePage() {
		console.log('🎨 Iniciando renderVendasOnlinePage()');
		console.log('📊 Produtos disponíveis:', this.products?.length || 0);
		console.log('📊 Primeiro produto:', this.products?.[0]);
		const container = document.getElementById('vendas-online-container');
		console.log('📦 Container encontrado:', !!container);
		if (!container) {
			console.error('❌ Container vendas-online-container não encontrado!');
			return;
		}
		if (!this.cart) this.cart = {};
		// Calcular total do carrinho
		let cartTotal = 0;
		Object.values(this.cart).forEach(item => {
			if (item.adicionado) {
				cartTotal += item.quantidade * item.preco;
			}
		});
		// Carregar promoções ativas para banner
		let promocoesBanner = '';
		try {
			const today = new Date().toISOString().split('T')[0];
			const { data: promocoesAtivas, error } = await this.supabase
				.from('promocoes')
				.select('id, nome, data_inicio, data_fim, status, produto_id, quantidade_minima, valor_minimo, desconto_valor, desconto_tipo, frete_gratis, regioes, canal, observacoes')
				.eq('status', 'ativo')
				.lte('data_inicio', today)
				.gte('data_fim', today)
				.limit(3); // Limitar a 3 promoções no banner
			if (!error && promocoesAtivas && promocoesAtivas.length > 0) {
				// Filtrar promoções por canal (Vendas Online ou Todos ou sem canal definido)
				const promocoesFiltradas = promocoesAtivas.filter(p =>
					!p.canal || p.canal === 'Vendas Online' || p.canal === 'Todos'
				);
				if (promocoesFiltradas.length > 0) {
					// Criar pop-up flutuante para promoções
					setTimeout(() => {
						this.showPromocoesPopup(promocoesFiltradas.slice(0, 3));
					}, 2000); // Aparecer após 2 segundos
				}
			}
		} catch (error) {
			console.warn('Erro ao carregar promoções para pop-up:', error);
		}
		// Dropdown de categorias + Total Carrinho (mesmo layout da página de pedidos)
		const categorias = [...new Set(this.products.map(p => p.categoria).filter(Boolean))];
		let categoriaSelecionada = this.selectedCategoria || '';
		const topBar = `
			<div style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
				<div style="display: flex; align-items: center; gap: 0.5rem;">
					<label for="dropdown-categoria-online" style="font-weight: 600;">${t('vendas_online.filtrar_label')}</label>
					<select id="dropdown-categoria-online" style="padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #eee; font-size: 1rem;">
						<option value="">${t('vendas_online.todas_categorias')}</option>
						${categorias.map(cat => `<option value="${cat}" ${cat === categoriaSelecionada ? 'selected' : ''}>${cat}</option>`).join('')}
					</select>
				</div>
				<div style="font-size: 1.15rem; font-weight: 700; color: #28a745; background: #f8f9fa; border-radius: 8px; padding: 0.5rem 1.2rem;">
					${t('vendas_online.total_label')} <span class="vendas-online-cart-total">${this.formatCurrency(cartTotal)}</span>
				</div>
			</div>
		`;
		// Produtos (mesmo layout da página de pedidos)
		let produtosHtml = '';
		const produtosFiltrados = categoriaSelecionada
			? this.products.filter(p => p.categoria === categoriaSelecionada)
			: this.products;
		console.log('🔍 Produtos filtrados:', produtosFiltrados.length, 'de', this.products.length);
		console.log('🔍 Categoria selecionada:', categoriaSelecionada);
		if (produtosFiltrados.length === 0) {
			produtosHtml = `<div style="text-align: center; padding: 3rem; color: #888;"><i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem;"></i><p>${t('vendas_online.nenhum_produto')}</p></div>`;
		} else {
			produtosHtml = `
				<div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
					${produtosFiltrados.map(produto => {
						let fotos = [];
						if (produto.fotos) {
							try { fotos = JSON.parse(produto.fotos); } catch {}
						}
						console.log('📸 Produto vendas online', produto.id, '(', produto.nome, ') tem', fotos.length, 'fotos');
						return `
							<div class="card-produto" style="background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 1.2rem; max-width: 320px; width: 100%; display: flex; flex-direction: column; align-items: center;" data-descricao="${produto.descricao || ''}">
								<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
									<span style="font-size: 1.0rem; font-weight: 700; color: #333;">${translateProductName(produto.nome)}</span>
									<div style="margin-top: 0.5rem;">
										<span style="background: ${produto.status_produto === 'pronta_entrega' ? '#28a745' : '#ff6b9d'}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">${produto.status_produto === 'pronta_entrega' ? t('vendas_online.pronta_entrega') : t('vendas_online.sob_encomenda')}</span>
									</div>
								</div>
								<div style="position: relative; width: 220px; height: 220px; border-radius: 10px; overflow: hidden; background: #f0f0f0; margin-bottom: 0.7rem;">
									<div id="online-carousel-${produto.id}" data-current="0" style="display: flex; width: 100%; height: 100%; transition: transform 0.3s ease;">
										${fotos.length > 0 ? 
											fotos.map(foto => `<img loading="lazy" data-src="${foto}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" style="min-width: 100%; height: 220px; object-fit: contain; background: #f8f9fa;" alt="${translateProductName(produto.nome)}">`).join('') :
											`<div style="width: 100%; height: 100%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #666;">${t('vendas_online.sem_imagem')}</div>`
										}
									</div>
									${fotos.length > 1 ? `
										<button data-action="prev-online-photo" data-id="${produto.id}" data-total="${fotos.length}" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; z-index: 10;">‹</button>
										<button data-action="next-online-photo" data-id="${produto.id}" data-total="${fotos.length}" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; z-index: 10;">›</button>
									` : ''}
								</div>
								<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
									<span style="font-size: 1.1rem; font-weight: 700; color: #ff6b9d;">${this.formatCurrency(produto.preco)}</span>
								</div>
								<div style="display: flex; align-items: center; justify-content: center; gap: 1rem; width: 100%; margin-bottom: 0.5rem;">
									<button type="button" data-action="decrement-produto" data-id="${produto.id}" style="background: #eee; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.1rem; cursor: pointer;">-</button>
									<span id="contador-produto-${produto.id}" style="font-size: 1.1rem; font-weight: 600; min-width: 32px; text-align: center;">${this.cart[produto.id]?.quantidade || 0}</span>
									<button type="button" data-action="increment-produto" data-id="${produto.id}" data-preco="${produto.preco}" style="background: #eee; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.1rem; cursor: pointer;">+</button>
								</div>
								<button type="button" data-action="adicionar-carrinho" data-id="${produto.id}" data-preco="${produto.preco}" style="width: 100%; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; padding: 0.8rem 0; font-size: 1.1rem; font-weight: 700; cursor: pointer;" data-i18n="vendas_online.adicionar_carrinho"></button>
							</div>
						`;
					}).join('')}
				</div>
			`;
		}
		container.innerHTML = topBar + produtosHtml;
		this.lazyLoadProductImages();
		// Tooltip (mesmo da página de pedidos)
		this.setupProductTooltip();
		// Eventos do dropdown de categoria
		const dropdown = document.getElementById('dropdown-categoria-online');
		if (dropdown) {
			dropdown.onchange = (e) => {
				this.selectedCategoria = e.target.value;
				this.renderVendasOnlinePage();
			};
		}
		// Eventos dos produtos
		this.setupVendasOnlineEventDelegation();
		// Atualizar valor total do carrinho no topo
		this.updatePedidosCartTotal();
		// Aplicar traduções aos elementos recém-criados
		setTimeout(() => applyTranslations(), 100);
		console.log('✅ renderVendasOnlinePage() concluído');
	}
	setupVendasOnlineEventDelegation() {
		const container = document.getElementById('vendas-online-container');
		if (!container) return;
		if (container._delegationAttached) {
			container.removeEventListener('click', container._delegationHandler);
		}
		const handler = (e) => {
			// Não processar eventos que vêm de dentro de modais
			if (e.target.closest('.modal-overlay') || e.target.closest('.modal-content-wrapper')) {
				return;
			}
			// Só processar se o target for um botão ou estiver dentro de um botão
			if (!e.target.matches('button[data-action]') && !e.target.closest('button[data-action]')) {
				return;
			}
			const btn = e.target.closest('button[data-action]');
			const action = btn.getAttribute('data-action');
			
			// Prevenir comportamento padrão e propagação
			e.preventDefault();
			e.stopPropagation();
			
			console.log('🎬 Ação executada (Vendas Online):', action);
			const produtoId = btn.getAttribute('data-id');
			const preco = parseFloat(btn.getAttribute('data-preco'));
			const total = parseInt(btn.getAttribute('data-total'));
			switch (action) {
				case 'prev-produto-photo':
				case 'prev-online-photo':
					this.prevProdutoPhoto(produtoId, total);
					break;
				case 'next-produto-photo':
				case 'next-online-photo':
					this.nextProdutoPhoto(produtoId, total);
					break;
				case 'increment-produto':
					console.log('➕ INCREMENTANDO produto (Vendas Online):', produtoId);
					this.incrementProdutoCarrinho(produtoId, preco);
					break;
				case 'decrement-produto':
					console.log('➖ DECREMENTANDO produto (Vendas Online):', produtoId);
					this.decrementProdutoCarrinho(produtoId);
					break;
				case 'adicionar-carrinho':
					console.log('🛒 ADICIONANDO AO CARRINHO (Vendas Online):', produtoId, preco);
					this.adicionarAoCarrinho(produtoId, preco);
					break;
			}
		};
		container.addEventListener('click', handler);
		container._delegationAttached = true;
		container._delegationHandler = handler;
	}
	incrementVendasProdutoCarrinho(produtoId, preco) {
		this.incrementProdutoCarrinho(produtoId, preco);
		this.updateVendasContadores();
	}
	decrementVendasProdutoCarrinho(produtoId) {
		this.decrementProdutoCarrinho(produtoId);
		this.updateVendasContadores();
	}
	adicionarVendasAoCarrinho(produtoId, preco) {
		this.adicionarAoCarrinho(produtoId, preco);
		this.updateVendasContadores();
	}
	updateVendasContadores() {
		// Atualizar contadores visuais na página de vendas online
		Object.keys(this.cart).forEach(produtoId => {
			const contadorEl = document.getElementById(`vendas-contador-produto-${produtoId}`);
			if (contadorEl) {
				contadorEl.textContent = this.cart[produtoId].quantidade || 0;
			}
		});
	}
	prevVendasProdutoPhoto(produtoId, totalPhotos) {
		this.prevProdutoPhoto(produtoId, totalPhotos);
	}
	nextVendasProdutoPhoto(produtoId, totalPhotos) {
		this.nextProdutoPhoto(produtoId, totalPhotos);
	}
	setupProductTooltip() {
		let tooltip = document.getElementById('produto-tooltip-global');
		if (!tooltip) {
			tooltip = document.createElement('div');
			tooltip.id = 'produto-tooltip-global';
			tooltip.className = 'produto-tooltip-global hidden';
			document.body.appendChild(tooltip);
		}
		document.querySelectorAll('.card-produto').forEach(card => {
			// Click para abrir modal detalhado
			card.addEventListener('click', (e) => {
				// Evitar se clicou em botão
				if (e.target.closest('button')) return;
				const produtoId = card.querySelector('button[data-action="adicionar-carrinho"]')?.getAttribute('data-id');
				if (produtoId) {
					this.openProductDetailModal(produtoId);
				}
			});
		});
	}
	openProductDetailModal(produtoId) {
		const produto = this.products.find(p => p.id == produtoId);
		if (!produto) return;
		let fotos = [];
		if (produto.fotos) {
			try { fotos = JSON.parse(produto.fotos); } catch {}
		}
		const modal = this.createModal('modal-produto-detalhe', '', false);
		// Aumentar a largura do modal para caber melhor o conteúdo
		modal.querySelector('.modal-content-wrapper').style.maxWidth = '900px';
		modal.querySelector('.modal-content-wrapper').style.width = '120vw';
		modal.querySelector('.modal-content-wrapper').innerHTML = `
			<div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
				<span style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-cookie-bite"></i></span>
				<span style="font-size: 1.35rem; font-weight: 700; color: #333;">${translateProductName(produto.nome)}</span>
				<button onclick="closeModal('modal-produto-detalhe')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
			</div>
			<div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
			<div style="display: flex; flex-direction: column; gap: 1rem;">
				<!-- Carrossel de Fotos -->
				<div style="position: relative; width: 100%; height: 300px; border-radius: 10px; overflow: hidden; background: #f0f0f0;">
					<div id="produto-detalhe-carousel" data-current="0" style="display: flex; width: 100%; height: 100%; transition: transform 0.3s ease;">
						${fotos.length > 0 ? 
							fotos.map(foto => `<img src="${foto}" style="min-width: 100%; height: 100%; object-fit: contain; background: #f8f9fa;">`).join('') :
							`<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #666;">${t('vendas_online.sem_imagem')}</div>`
						}
					</div>
					${fotos.length > 1 ? `
						<button onclick="window.dashboardApp.prevProdutoPhotoDetalhe()" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">‹</button>
						<button onclick="window.dashboardApp.nextProdutoPhotoDetalhe()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">›</button>
					` : ''}
				</div>
				<!-- Descrição -->
				<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
					<h4 style="margin: 0 0 0.5rem 0; color: #333;">${t('vendas_online.descricao')}</h4>
					<p style="margin: 0; color: #666; line-height: 1.5;">${translateProductDescription(produto.descricao || t('vendas_online.sem_descricao'))}</p>
				</div>
				<!-- Preço e Status -->
				<div style="display: flex; justify-content: space-between; align-items: center;">
					<div>
						<span style="font-size: 1.5rem; font-weight: 700; color: #ff6b9d;">${this.formatCurrency(produto.preco)}</span>
						<div style="margin-top: 0.25rem;">
							<span style="background: ${produto.status_produto === 'pronta_entrega' ? '#28a745' : '#ff6b9d'}; color: white; padding: 0.3rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${produto.status_produto === 'pronta_entrega' ? t('vendas_online.pronta_entrega') : t('vendas_online.sob_encomenda')}</span>
						</div>
					</div>
					<button onclick="window.dashboardApp.adicionarVendasAoCarrinho('${produto.id}', ${produto.preco}); closeModal('modal-produto-detalhe');" style="background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; padding: 0.8rem 1.5rem; font-size: 1rem; font-weight: 700; cursor: pointer;">${t('vendas_online.adicionar_carrinho')}</button>
				</div>
			</div>
		`;
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
	}
	setupPedidosEventDelegation() {
		const container = document.getElementById('pedidos-container');
		if (!container) return;
		if (container._delegationAttached) {
			container.removeEventListener('click', container._delegationHandler);
		}
		const handler = (e) => {
			// Não processar eventos que vêm de dentro de modais
			if (e.target.closest('.modal-overlay') || e.target.closest('.modal-content-wrapper')) {
				return;
			}
			// Só processar se o target for um botão ou estiver dentro de um botão
			if (!e.target.matches('button[data-action]') && !e.target.closest('button[data-action]')) {
				return;
			}
			const btn = e.target.closest('button[data-action]');
			const action = btn.getAttribute('data-action');
			console.log('🎬 Ação executada:', action);
			const produtoId = btn.getAttribute('data-id');
			const preco = parseFloat(btn.getAttribute('data-preco'));
			const total = parseInt(btn.getAttribute('data-total'));
			switch (action) {
				case 'prev-produto-photo':
				case 'prev-online-photo':
					this.prevProdutoPhoto(produtoId, total);
					break;
				case 'next-produto-photo':
				case 'next-online-photo':
					this.nextProdutoPhoto(produtoId, total);
					break;
				case 'increment-produto':
					console.log('➕ INCREMENTANDO produto:', produtoId);
					this.incrementProdutoCarrinho(produtoId, preco);
					break;
				case 'decrement-produto':
					console.log('➖ DECREMENTANDO produto:', produtoId);
					this.decrementProdutoCarrinho(produtoId);
					break;
				case 'adicionar-carrinho':
					console.log('🛒 ADICIONANDO AO CARRINHO:', produtoId, preco);
					this.adicionarAoCarrinho(produtoId, preco);
					break;
			}
		};
		container.addEventListener('click', handler);
		container._delegationAttached = true;
		container._delegationHandler = handler;
	}
	incrementProdutoCarrinho(produtoId, preco) {
		// Esta função serve para:
		// 1. Contador visual no mercado (produtos não adicionados)
		// 2. Editar quantidade de produtos já no carrinho
		// Incrementa o contador visual
		const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
		let quantidadeAtual = 0;
		if (contadorEl) {
			quantidadeAtual = parseInt(contadorEl.textContent) || 0;
			quantidadeAtual++;
			contadorEl.textContent = quantidadeAtual;
		}
		// Se o produto já está no carrinho, atualiza a quantidade
		if (this.cart[produtoId] && this.cart[produtoId].adicionado) {
			this.cart[produtoId].quantidade = quantidadeAtual;
			this.updateCartHeader();
			if (this.activeSection === 'pedidos' || this.isVendasOnline) {
				this.updatePedidosCartTotal();
			}
		}
		this.updateCartBadge();
	}
	decrementProdutoCarrinho(produtoId) {
		// Decrementa o contador visual
		const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
		let quantidadeAtual = 0;
		if (contadorEl) {
			quantidadeAtual = parseInt(contadorEl.textContent) || 0;
			if (quantidadeAtual > 0) {
				quantidadeAtual--;
				contadorEl.textContent = quantidadeAtual;
			}
		}
		// Se o produto já está no carrinho, atualiza a quantidade ou remove se chegar a zero
		if (this.cart[produtoId] && this.cart[produtoId].adicionado) {
			if (quantidadeAtual > 0) {
				this.cart[produtoId].quantidade = quantidadeAtual;
			} else {
				delete this.cart[produtoId];
			}
			this.updateCartHeader();
			if (this.activeSection === 'pedidos' || this.isVendasOnline) {
				this.updatePedidosCartTotal();
			}
		}
		this.updateCartBadge();
	}
	adicionarAoCarrinho(produtoId, preco) {
		console.log('Adicionando ao carrinho:', produtoId, preco);
		// Se o produto já está no carrinho, apenas incrementa a quantidade
		if (this.cart[produtoId] && this.cart[produtoId].adicionado) {
			this.cart[produtoId].quantidade++;
		} else {
			// Se não está no carrinho, adiciona com a quantidade do contador visual (mínimo 1)
			const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
			let quantidadeAtual = 1;
			if (contadorEl) {
				quantidadeAtual = parseInt(contadorEl.textContent) || 1;
			}
			this.cart[produtoId] = { 
				quantidade: quantidadeAtual, 
				preco, 
				adicionado: true 
			};
		}
		// Atualizar contador visual
		const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
		if (contadorEl) {
			contadorEl.textContent = this.cart[produtoId].quantidade;
		}
		// Atualizar carrinho no topo
		this.updateCartHeader();
		// Atualizar total do carrinho na página de pedidos
		if (this.activeSection === 'pedidos' || this.isVendasOnline) {
			this.updatePedidosCartTotal();
		}
		this.updateCartBadge();
	}
	updatePedidosCartTotal() {
		// Atualiza apenas o valor total do carrinho no topo da página de pedidos ou vendas online
		let cartTotal = 0;
		Object.values(this.cart).forEach(item => {
			if (item.adicionado) {
				cartTotal += item.quantidade * item.preco;
			}
		});
		// Atualizar tanto pedidos quanto vendas online
		const pedidosEl = document.querySelector('.pedidos-cart-total');
		const vendasOnlineEl = document.querySelector('.vendas-online-cart-total');
		if (pedidosEl) {
			pedidosEl.textContent = this.formatCurrency(cartTotal);
		}
		if (vendasOnlineEl) {
			vendasOnlineEl.textContent = this.formatCurrency(cartTotal);
		}
	}
	async updateCartHeader() {
		const header = document.querySelector('header.header');
		if (!header) return;
		// Calcular total de itens no carrinho
		let cartCount = Object.values(this.cart).filter(item => item.quantidade > 0 && item.adicionado).reduce((acc, item) => acc + item.quantidade, 0);
		let headCart = document.getElementById('head-cart');
		// Remover se carrinho vazio
		if (cartCount === 0 && headCart) {
			headCart.remove();
			return;
		}
		// Criar/atualizar carrinho no header
		if (cartCount > 0) {
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
				headCart.style.width = '48px';
				headCart.style.height = '48px';
				headCart.style.display = 'flex';
				headCart.style.alignItems = 'center';
				headCart.style.justifyContent = 'center';
				headCart.style.cursor = 'pointer';
				headCart.style.zIndex = '1000';
				header.appendChild(headCart);
			}
			headCart.innerHTML = `
				<div style="position: relative;">
					<i class='fas fa-shopping-cart' style='font-size: 1.5rem; color: #ff6b9d;'></i>
					<span style="position: absolute; top: -8px; right: -8px; background: #dc3545; color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${cartCount}</span>
				</div>
			`;
			headCart.onclick = async (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (this.isVendasOnline) {
					await this.abrirVerificacaoClienteModal();
				} else {
					await this.abrirFinalizarPedidoModal();
				}
			};
		}
	}
	removerProdutoCarrinho(produtoId) {
		if (this.cart[produtoId]) {
			delete this.cart[produtoId];
			// Resetar contador visual quando remover do carrinho
			const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
			if (contadorEl) {
				contadorEl.textContent = '0';
			}
		}
		this.updateCartHeader();
		if (this.activeSection === 'pedidos' || this.isVendasOnline) {
			this.updatePedidosCartTotal();
		}
		// Em vez de recriar o modal, apenas atualizar o conteúdo
		this.atualizarConteudoModalPedido();
	}
	incrementProdutoCarrinhoModal(produtoId) {
		// Esta função é para editar produtos JÁ adicionados ao carrinho (no modal)
		if (this.cart[produtoId] && this.cart[produtoId].adicionado) {
			this.cart[produtoId].quantidade++;
			// Sincronizar contador visual na página de produtos
			const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
			if (contadorEl) {
				contadorEl.textContent = this.cart[produtoId].quantidade;
			}
			this.updateCartHeader();
			if (this.activeSection === 'pedidos' || this.isVendasOnline) {
				this.updatePedidosCartTotal();
			}
			// Atualizar apenas o conteúdo do modal sem recriá-lo
			this.atualizarConteudoModalPedido();
		}
	}
	decrementProdutoCarrinhoModal(produtoId) {
		// Esta função é para editar produtos JÁ adicionados ao carrinho (no modal)
		if (this.cart[produtoId] && this.cart[produtoId].adicionado && this.cart[produtoId].quantidade > 0) {
			this.cart[produtoId].quantidade--;
			if (this.cart[produtoId].quantidade > 0) {
				// Ainda há quantidade, apenas atualizar
				// Sincronizar contador visual na página de produtos
				const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
				if (contadorEl) {
					contadorEl.textContent = this.cart[produtoId].quantidade;
				}
				this.updateCartHeader();
				if (this.activeSection === 'pedidos' || this.isVendasOnline) {
					this.updatePedidosCartTotal();
				}
				// Atualizar apenas o conteúdo do modal sem recriá-lo
				this.atualizarConteudoModalPedido();
			} else {
				// Quantidade chegou a 0, remover completamente do carrinho
				delete this.cart[produtoId];
				// Resetar contador visual quando remover do carrinho
				const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
				if (contadorEl) {
					contadorEl.textContent = '0';
				}
				this.updateCartHeader();
				if (this.activeSection === 'pedidos' || this.isVendasOnline) {
					this.updatePedidosCartTotal();
				}
				// Atualizar apenas o conteúdo do modal sem recriá-lo
				this.atualizarConteudoModalPedido();
			}
		}
	}
	atualizarConteudoModalPedido() {
		// Atualiza apenas o conteúdo dinâmico do modal sem recriá-lo completamente
		const modal = document.getElementById('modal-finalizar-pedido');
		if (!modal) return;
		// Verificar se ainda há produtos no carrinho
		const produtosNoCarrinho = Object.entries(this.cart)
			.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado);
		if (produtosNoCarrinho.length === 0) {
			// Se não há produtos, fechar o modal
			closeModal('modal-finalizar-pedido');
			return;
		}
		// Recriar a tabela de produtos
		const produtosCarrinho = produtosNoCarrinho
			.map(([id, item]) => {
				const produto = this.products.find(p => p.id == id);
				return produto ? `
					<tr style="border-bottom:1px solid #eee;" data-produto-id="${id}">
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#222; font-weight:600;">${translateProductName(produto.nome)}</td>
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#764ba2; text-align:right;">${this.formatCurrency(item.preco)}</td>
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; text-align:center;">
							<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
								<button type="button" class="btn-decrement-modal" data-produto-id="${id}" style="background: #eee; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
								<span class="produto-quantidade-${id}" style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantidade}</span>
								<button type="button" class="btn-increment-modal" data-produto-id="${id}" style="background: #eee; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
							</div>
						</td>
						<td class="produto-subtotal-${id}" style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#28a745; text-align:right; font-weight:600;">${this.formatCurrency(item.preco * item.quantidade)}</td>
						<td style="padding:0.35rem 0.5rem; text-align:center;">
							<button type="button" class="btn-remover-modal" data-produto-id="${id}" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.8rem; cursor: pointer;">×</button>
						</td>
					</tr>
				` : '';
			}).join('');
		// Encontrar e substituir apenas a tabela de produtos
		const tabelaContainer = modal.querySelector('.produtos-tabela-container');
		if (tabelaContainer) {
			tabelaContainer.innerHTML = `
				<table style="width:100%; border-collapse:collapse;">
					<thead>
						<tr style="background:#e9ecef;">
							<th style="padding:0.4rem; font-size:0.85rem; text-align:left;">Produto</th>
							<th style="padding:0.4rem; font-size:0.85rem; text-align:right;">Preço</th>
							<th style="padding:0.4rem; font-size:0.85rem; text-align:center;">Qtd</th>
							<th style="padding:0.4rem; font-size:0.85rem; text-align:right;">Total</th>
							<th style="padding:0.4rem; font-size:0.85rem; text-align:center;">Ações</th>
						</tr>
					</thead>
					<tbody>
						${produtosCarrinho}
					</tbody>
				</table>
			`;
			
			// Adicionar event listeners aos novos botões
			this.attachModalButtonListeners(tabelaContainer);
		}
		// Atualizar total geral
		const totalCarrinho = produtosNoCarrinho
			.reduce((acc, [_, item]) => acc + item.preco * item.quantidade, 0);
		const totalElement = modal.querySelector('.modal-total-valor');
		if (totalElement) {
			totalElement.textContent = this.formatCurrency(totalCarrinho);
		}
	}
	attachModalButtonListeners(container) {
		// Incrementar
		container.querySelectorAll('.btn-increment-modal').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				const produtoId = btn.getAttribute('data-produto-id');
				this.incrementProdutoCarrinhoModal(produtoId);
			});
		});
		// Decrementar
		container.querySelectorAll('.btn-decrement-modal').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				const produtoId = btn.getAttribute('data-produto-id');
				this.decrementProdutoCarrinhoModal(produtoId);
			});
		});
		// Remover
		container.querySelectorAll('.btn-remover-modal').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				const produtoId = btn.getAttribute('data-produto-id');
				this.removerProdutoCarrinho(produtoId);
			});
		});
	}
	limparCarrinho() {
		// Resetar todos os contadores visuais quando limpar o carrinho
		Object.keys(this.cart).forEach(produtoId => {
			const contadorEl = document.getElementById(`contador-produto-${produtoId}`);
			if (contadorEl) {
				contadorEl.textContent = '0';
			}
		});
		this.cart = {};
		this.updateCartHeader();
		this.updateCartBadge(); // Atualizar badge flutuante também
		if (this.activeSection === 'pedidos' || this.isVendasOnline) {
			this.updatePedidosCartTotal();
		}
		// Atualizar o modal atual se estiver aberto, em vez de abrir um novo
		this.atualizarConteudoModalPedido();
	}
	atualizarModalFinalizarPedido() {
		const modal = document.getElementById('modal-finalizar-pedido');
		if (!modal) return; // Modal não está aberto, não faz nada
		// Produtos do carrinho
		const produtosCarrinho = Object.entries(this.cart)
			.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado)
			.map(([id, item]) => {
				const produto = this.products.find(p => p.id == id);
				return produto ? `
					<tr style="border-bottom:1px solid #eee;" data-produto-id="${id}">
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#222; font-weight:600;">${translateProductName(produto.nome)}</td>
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#764ba2; text-align:right;">${this.formatCurrency(item.preco)}</td>
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; text-align:center;">
							<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
								<button type="button" class="btn-decrement-modal" data-produto-id="${id}" style="background: #eee; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
								<span class="produto-quantidade-${id}" style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantidade}</span>
								<button type="button" class="btn-increment-modal" data-produto-id="${id}" style="background: #eee; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
							</div>
						</td>
						<td class="produto-subtotal-${id}" style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#28a745; text-align:right; font-weight:600;">${this.formatCurrency(item.preco * item.quantidade)}</td>
						<td style="padding:0.35rem 0.5rem; text-align:center;">
							<button type="button" class="btn-remover-modal" data-produto-id="${id}" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.8rem; cursor: pointer;">×</button>
						</td>
					</tr>
				` : '';
			}).join('');
		const totalCarrinho = Object.entries(this.cart)
			.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado)
			.reduce((acc, [_, item]) => acc + item.preco * item.quantidade, 0);
		// Atualiza o valor do topo da página de pedidos para refletir o total do carrinho
		const pedidosCartTotalEl = document.querySelector('.pedidos-cart-total');
		if (pedidosCartTotalEl) {
			pedidosCartTotalEl.textContent = this.formatCurrency(totalCarrinho);
		}
		// Atualizar apenas a tabela de produtos e o total no modal existente
		const produtosTbody = modal.querySelector('.produtos-tabela-container tbody');
		const modalTotalValor = modal.querySelector('.modal-total-valor');
		if (produtosTbody) {
			produtosTbody.innerHTML = produtosCarrinho;
			// Adicionar event listeners aos novos botões
			this.attachModalButtonListeners(produtosTbody.parentElement);
		}
		if (modalTotalValor) {
			modalTotalValor.textContent = this.formatCurrency(totalCarrinho);
		}
		// Se o carrinho estiver vazio, mostrar mensagem
		if (Object.keys(this.cart).length === 0 || Object.values(this.cart).every(item => !item.adicionado || item.quantidade === 0)) {
			const produtosContainer = modal.querySelector('.produtos-tabela-container');
			if (produtosContainer) {
				produtosContainer.innerHTML = `
					<div style="text-align: center; padding: 2rem; color: #888;">
						<i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem;"></i>
						<p>Carrinho vazio</p>
						<p style="font-size: 0.9rem;">Adicione produtos para continuar</p>
					</div>
				`;
			}
		}
	}
	prevProdutoPhoto(produtoId, totalPhotos) {
		const carousel = document.getElementById(`market-carousel-${produtoId}`) || document.getElementById(`online-carousel-${produtoId}`);
		if (!carousel) {
			console.error('Carousel não encontrado para produto:', produtoId);
			return;
		}
		const current = parseInt(carousel.dataset.current || 0);
		const prev = current === 0 ? totalPhotos - 1 : current - 1;
		carousel.style.transform = `translateX(-${prev * 100}%)`;
		carousel.dataset.current = prev;
		console.log('Navegando para foto anterior:', prev, 'de', totalPhotos);
	}
	nextProdutoPhoto(produtoId, totalPhotos) {
		const carousel = document.getElementById(`market-carousel-${produtoId}`) || document.getElementById(`online-carousel-${produtoId}`);
		if (!carousel) {
			console.error('Carousel não encontrado para produto:', produtoId);
			return;
		}
		const current = parseInt(carousel.dataset.current || 0);
		const next = (current + 1) % totalPhotos;
		carousel.style.transform = `translateX(-${next * 100}%)`;
		carousel.dataset.current = next;
		console.log('Navegando para próxima foto:', next, 'de', totalPhotos);
	}
	// MODAL RÁPIDO ADICIONAR CLIENTE
	openQuickAddClientModal() {
		const modal = this.createModal('modal-quick-add-client', 'Adicionar Cliente Rápido', true);
		modal.querySelector('.modal-content-wrapper').innerHTML += `
			<form id="form-quick-add-client" style="display: flex; flex-direction: column; gap: 1rem;">
				<div class="form-group">
					<label for="quick-client-nome">Nome *</label>
					<input type="text" id="quick-client-nome" required class="form-control">
				</div>
				<div class="form-group">
					<label for="quick-client-telefone">Telefone *</label>
					<input type="tel" id="quick-client-telefone" required class="form-control">
				</div>
				<div class="form-group">
					<label for="quick-client-email">Email</label>
					<input type="email" id="quick-client-email" class="form-control">
				</div>
				<div class="form-group">
					<label for="quick-client-endereco">Endereço *</label>
					<textarea id="quick-client-endereco" required class="form-control" rows="2"></textarea>
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-quick-add-client')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Salvar</button>
				</div>
			</form>
		`;
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
		modal.querySelector('#form-quick-add-client').addEventListener('submit', async (e) => {
			e.preventDefault();
			const nome = modal.querySelector('#quick-client-nome').value.trim();
			const telefone = modal.querySelector('#quick-client-telefone').value.trim();
			const email = modal.querySelector('#quick-client-email').value.trim();
			const endereco = modal.querySelector('#quick-client-endereco').value.trim();
			if (!nome || !telefone || !endereco) {
				alert('Preencha todos os campos obrigatórios');
				return;
			}
			const clientData = { nome, telefone, email, endereco };
			const result = await this.saveToSupabaseInsert('clientes', clientData);
			if (result) {
				this.clients.unshift(result);
				alert('Cliente adicionado com sucesso!');
				closeModal('modal-quick-add-client');
			}
		});
	}
	// MODAL FINALIZAR PEDIDO - VENDA PRESENCIAL
	abrirFinalizarPedidoModal(clienteIdPreSelecionado = null) {
		console.log('🛒 Abrindo modal de finalização');
		try {
			// Verificar se já existe um modal aberto e removê-lo
			const existingModal = document.getElementById('modal-finalizar-pedido');
			if (existingModal) {
				existingModal.remove();
			}
			const modalId = 'modal-finalizar-pedido';
			document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
			const modal = document.createElement('div');
			modal.id = modalId;
			modal.className = 'modal-overlay show';
			modal.onclick = closeModalOverlay;
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
				return produto ? `
					<tr style="border-bottom:1px solid #eee;" data-produto-id="${id}">
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#222; font-weight:600;">${translateProductName(produto.nome)}</td>
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#764ba2; text-align:right;">${this.formatCurrency(item.preco)}</td>
						<td style="padding:0.35rem 0.5rem; font-size:0.92rem; text-align:center;">
							<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
								<button type="button" class="btn-decrement-modal" data-produto-id="${id}" style="background: #eee; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
								<span class="produto-quantidade-${id}" style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantidade}</span>
								<button type="button" class="btn-increment-modal" data-produto-id="${id}" style="background: #eee; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
							</div>
						</td>
						<td class="produto-subtotal-${id}" style="padding:0.35rem 0.5rem; font-size:0.92rem; color:#28a745; text-align:right; font-weight:600;">${this.formatCurrency(item.preco * item.quantidade)}</td>
						<td style="padding:0.35rem 0.5rem; text-align:center;">
							<button type="button" class="btn-remover-modal" data-produto-id="${id}" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.8rem; cursor: pointer;">×</button>
						</td>
					</tr>
				` : '';
			}).join('');
		const totalCarrinho = Object.entries(this.cart)
			.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado)
			.reduce((acc, [_, item]) => acc + item.preco * item.quantidade, 0);
		// Atualiza o valor do topo da página de pedidos para refletir o total do carrinho
		const pedidosCartTotalEl = document.querySelector('.pedidos-cart-total');
		if (pedidosCartTotalEl) {
			pedidosCartTotalEl.textContent = this.formatCurrency(totalCarrinho);
		}
		// Determinar se é vendas online
		const isVendasOnline = this.isVendasOnline;
		let clienteHTML = '';
		let clienteSelecionado = null;
		let clienteSelecionadoData = null;
		if (isVendasOnline) {
			// Para vendas online, usar o cliente recém-cadastrado ou logado
			if (typeof clienteIdPreSelecionado === 'object' && clienteIdPreSelecionado?.id) {
				clienteSelecionado = clienteIdPreSelecionado;
			} else if (clienteSelecionadoData) {
				clienteSelecionado = clienteSelecionadoData;
			} else if (clienteIdPreSelecionado) {
				clienteSelecionado = this.clients.find(c => c.id == clienteIdPreSelecionado);
		}
			if (clienteSelecionado) {
				clienteHTML = `
					<div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 1rem; border-radius: 10px; color: white;">
						<h4 style="margin: 0 0 0.75rem 0; font-size: 1.05rem;">${t('finalizar.cliente')}</h4>
						<div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 6px;">
							<p style="margin: 0 0 0.25rem 0; font-weight: 600;">${clienteSelecionado.nome}</p>
							<p style="margin: 0 0 0.25rem 0; font-size: 0.9rem;">${clienteSelecionado.telefone}</p>
							${clienteSelecionado.email ? `<p style="margin: 0; font-size: 0.9rem;">${clienteSelecionado.email}</p>` : ''}
						</div>
					</div>
				`;
			}
		} else {
			// Para vendas presenciais, mostrar select de clientes
			let clienteIdParaSelecionar = null;
			let clienteSelecionadoData = null;
			if (typeof clienteIdPreSelecionado === 'object' && clienteIdPreSelecionado?.id) {
				clienteIdParaSelecionar = clienteIdPreSelecionado.id;
				clienteSelecionadoData = clienteIdPreSelecionado;
			} else {
				clienteIdParaSelecionar = clienteIdPreSelecionado;
				clienteSelecionadoData = this.clients.find(c => c.id == clienteIdPreSelecionado);
			}
			clienteHTML = `
				<div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 1rem; border-radius: 10px; color: white;">
					<h4 style="margin: 0 0 0.75rem 0; font-size: 1.05rem;">${t('finalizar.cliente')}</h4>
					<select id="finalizar-cliente" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem;">
						<option value="">${t('finalizar.selecione_cliente')}</option>
						${this.clients.map(c => `<option value="${c.id}" ${clienteIdParaSelecionar == c.id ? 'selected' : ''}>${c.nome} - ${c.telefone}</option>`).join('')}
					</select>
				</div>
			`;
		}
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; max-height: 90vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #333;">🛒 ${isVendasOnline ? t('finalizar.finalizar_venda') : t('finalizar.finalizar_pedido')}</h3>
					<button id="close-finalizar-pedido" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<form id="form-finalizar-pedido" style="display: flex; flex-direction: column; gap: 1.2rem;">
					<!-- Produtos -->
					<div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
						<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
							<h4 style="margin: 0; font-size: 1.05rem; color: #764ba2;">${t('finalizar.produtos')}</h4>
							<button type="button" class="btn-limpar-carrinho" style="background: #dc3545; color: white; border: none; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.8rem; cursor: pointer;">${t('finalizar.limpar_carrinho')}</button>
						</div>
						${(() => {
							// Verificar promoções elegíveis
							const promocaoElegivel = this.checkCartPromocoes(totalCarrinho, this.cart);
							if (promocaoElegivel) {
								return `
									<div style="background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
										<div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.3rem;">🎉 ${promocaoElegivel.nome}</div>
										<div style="font-size: 0.8rem; opacity: 0.9;">
											Promoção: ${promocaoElegivel.beneficios.join(' + ')}
										</div>
									</div>
								`;
							}
							return '';
						})()}
						<div class="produtos-tabela-container" style="overflow-x: auto;">
							<table style="width:100%; border-collapse:collapse;">
								<thead>
									<tr style="background:#e9ecef;">
										<th style="padding:0.4rem; font-size:0.85rem; text-align:left;">${t('finalizar.tabela_produto')}</th>
										<th style="padding:0.4rem; font-size:0.85rem; text-align:right;">${t('finalizar.tabela_preco')}</th>
										<th style="padding:0.4rem; font-size:0.85rem; text-align:center;">${t('finalizar.tabela_qtd')}</th>
										<th style="padding:0.4rem; font-size:0.85rem; text-align:right;">${t('finalizar.tabela_total')}</th>
										<th style="padding:0.4rem; font-size:0.85rem; text-align:center;">${t('finalizar.tabela_acoes')}</th>
									</tr>
								</thead>
								<tbody>${produtosCarrinho}</tbody>
							</table>
						</div>
					</div>
					<!-- Cliente -->
					${clienteHTML}
					<!-- Idioma para E-mails -->
					<div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 1rem; border-radius: 10px; color: white;">
						<h4 style="margin: 0 0 0.75rem 0; font-size: 1.05rem;">Which language do you prefer for emails? / Qual idioma você prefere para os e-mails?</h4>
						<select id="finalizar-idioma" style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem;">
							<option value="pt" selected>Português</option>
							<option value="en">English</option>
						</select>
					</div>
					<!-- Pagamento -->
					<div style="background: linear-gradient(135deg, #f093fb, #f5576c); padding: 1rem; border-radius: 10px; color: white;">
						<h4 style="margin: 0 0 0.75rem 0; font-size: 1.05rem;">${t('finalizar.forma_pagamento')}</h4>
						<select id="finalizar-pagamento" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem; margin-bottom: 0.75rem;">
							<option value="dinheiro">${t('finalizar.dinheiro')}</option>
							<option value="transferencia">${t('finalizar.transferencia')}</option>
							<option value="cartao">${t('finalizar.cartao')}</option>
						</select>
						<label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500;">
							<input type="checkbox" id="finalizar-full-payment" checked style="width: 18px; height: 18px;"> 
							${t('finalizar.pagamento_total')}
						</label>
						<div id="finalizar-sinal-group" style="display: none; margin-top: 0.75rem;">
							<label style="display: block; margin-bottom: 0.25rem;">${t('finalizar.valor_sinal')}</label>
							<input type="text" id="finalizar-sinal" placeholder="0.00" style="width: 100%; padding: 0.5rem; border-radius: 6px; border: none;">
							<p id="finalizar-restante" style="margin: 0.5rem 0 0 0; font-size: 0.9rem;"></p>
						</div>
					</div>
					<!-- Tipo de Entrega -->
					<div style="background: linear-gradient(135deg, #4facfe, #00f2fe); padding: 1rem; border-radius: 10px; color: white;">
						<h4 style="margin: 0 0 0.75rem 0; font-size: 1.05rem;">${t('finalizar.tipo_entrega')}</h4>
						<select id="finalizar-entrega" required style="width: 100%; padding: 0.6rem; border: none; border-radius: 6px; font-size: 1rem;">
							<option value="retirada">${t('finalizar.retirada_loja')}</option>
							<option value="entrega">${t('finalizar.entrega')}</option>
						</select>
						<div id="entrega-detalhes" style="display: none; margin-top: 0.75rem;">
							<label style="display: block; margin-bottom: 0.25rem;">${t('finalizar.data_entrega')}</label>
							<input type="date" id="finalizar-data-entrega" onchange="window.dashboardApp.updateHorariosDisponiveis(this.value)" style="width: 100%; padding: 0.5rem; border-radius: 6px; border: none; margin-bottom: 0.5rem;" min="${new Date().toISOString().split('T')[0]}" value="${new Date().toISOString().split('T')[0]}">
							<label style="display: block; margin-bottom: 0.25rem;">${t('finalizar.horario')}</label>
							<select id="finalizar-horario-entrega" style="width: 100%; padding: 0.5rem; border-radius: 6px; border: none; margin-bottom: 0.5rem;">
								<option value="">${t('finalizar.selecione_horario')}</option>
								<!-- Opções serão carregadas dinamicamente baseada na data selecionada -->
							</select>
							<!-- Opções de endereço -->
							<div id="endereco-options" style="margin-top: 0.75rem;">
								<label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">${t('finalizar.endereco_entrega')}</label>
								<div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
									<label style="display: flex; align-items: center; gap: 0.25rem; flex: 1;">
										<input type="radio" name="endereco-opcao" value="cadastro" checked style="width: 16px; height: 16px;">
										<span style="font-size: 0.9rem;">${t('finalizar.usar_endereco_cadastro')}</span>
									</label>
									<label style="display: flex; align-items: center; gap: 0.25rem; flex: 1;">
										<input type="radio" name="endereco-opcao" value="novo" style="width: 16px; height: 16px;">
										<span style="font-size: 0.9rem;">${t('finalizar.novo_endereco')}</span>
									</label>
								</div>
								<div id="endereco-cadastro-display" style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; font-size: 0.85rem;">
									<!-- Endereço do cadastro será inserido aqui -->
								</div>
								<div id="endereco-novo-input" style="display: none;">
									<label style="display: block; margin-bottom: 0.25rem; font-size: 0.9rem;">${t('finalizar.novo_endereco_label')}</label>
									<textarea id="finalizar-endereco-novo" placeholder="${t('finalizar.digite_novo_endereco')}" style="width: 100%; padding: 0.5rem; border-radius: 6px; border: none; resize: vertical; min-height: 60px;" rows="3"></textarea>
								</div>
							</div>
						</div>
					</div>
					<!-- Total -->
					<div style="background: #28a745; padding: 1rem; border-radius: 10px; text-align: center; color: white;">
						<h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 400; opacity: 0.9;">${t('finalizar.valor_total')}</h4>
						<h2 class="modal-total-valor" style="margin: 0; font-size: 2rem; font-weight: 700;">${this.formatCurrency(totalCarrinho)}</h2>
					</div>
					<!-- Observações -->
					<div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 1rem; border-radius: 10px; color: white;">
						<h4 style="margin: 0 0 0.75rem 0; font-size: 1.05rem;">📝 ${t('finalizar.observacao')}</h4>
						<textarea id="finalizar-observacoes" placeholder="${t('finalizar.observacao_placeholder')}" style="width: 100%; padding: 0.75rem; border: none; border-radius: 6px; resize: vertical; min-height: 80px; font-family: inherit; font-size: 1rem;" rows="3"></textarea>
					</div>
					<button type="submit" style="width: 100%; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; padding: 1rem; font-size: 1.2rem; font-weight: 700; cursor: pointer;">
						✓ ${t('finalizar.finalizar_venda')}
					</button>
				</form>
			</div>
		`;
		// Adicionar event listeners aos botões do carrinho
		const tabelaContainer = modal.querySelector('.produtos-tabela-container');
		if (tabelaContainer) {
			this.attachModalButtonListeners(tabelaContainer);
		}
		// Event listener para o botão de limpar carrinho
		const btnLimparCarrinho = modal.querySelector('.btn-limpar-carrinho');
		if (btnLimparCarrinho) {
			btnLimparCarrinho.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.limparCarrinho();
			});
		}
		// Inicializar horários disponíveis para a data padrão
		setTimeout(() => {
			const dataInput = document.getElementById('finalizar-data-entrega');
			if (dataInput && dataInput.value) {
				this.updateHorariosDisponiveis(dataInput.value);
			}
		}, 100);
		// Event listener para o botão de fechar
		setTimeout(() => {
			const closeButton = document.getElementById('close-finalizar-pedido');
			if (closeButton) {
				// Remove event listeners anteriores
				const newCloseButton = closeButton.cloneNode(true);
				closeButton.parentNode.replaceChild(newCloseButton, closeButton);
				// Adiciona novo event listener
				newCloseButton.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					closeModal('modal-finalizar-pedido');
				});
			}
		}, 100);
		// Eventos do formulário
		const fullPaymentCheckbox = modal.querySelector('#finalizar-full-payment');
		const sinalGroup = modal.querySelector('#finalizar-sinal-group');
		const sinalInput = modal.querySelector('#finalizar-sinal');
		const restanteLabel = modal.querySelector('#finalizar-restante');
		const entregaSelect = modal.querySelector('#finalizar-entrega');
		const entregaDetalhes = modal.querySelector('#entrega-detalhes');
		const clienteSelect = modal.querySelector('#finalizar-cliente');
		const enderecoCadastroDisplay = modal.querySelector('#endereco-cadastro-display');
		const enderecoNovoInput = modal.querySelector('#endereco-novo-input');
		const enderecoOptions = modal.querySelector('#endereco-options');
		// Função para atualizar endereço do cliente selecionado
		function atualizarEnderecoCliente() {
			let clienteId;
			if (isVendasOnline) {
				clienteId = clienteSelecionado ? clienteSelecionado.id : null;
			} else {
				clienteId = clienteSelect ? clienteSelect.value : null;
			}
			if (clienteId) {
				let cliente;
				if (isVendasOnline && clienteSelecionado) {
					cliente = clienteSelecionado;
				} else {
					cliente = window.dashboardApp.clients.find(c => c.id == clienteId);
				}
				if (cliente && cliente.endereco) {
					const safeEndereco = sanitizeHTML(cliente.endereco);
					enderecoCadastroDisplay.innerHTML = `<strong>Endereço cadastrado:</strong><br>${safeEndereco}`;
					enderecoCadastroDisplay.style.display = 'block';
				} else {
					enderecoCadastroDisplay.innerHTML = '<em>Cliente sem endereço cadastrado</em>';
					enderecoCadastroDisplay.style.display = 'block';
				}
			} else {
				enderecoCadastroDisplay.innerHTML = '';
				enderecoCadastroDisplay.style.display = 'none';
			}
		}
		// Event listener para mudança de cliente (apenas para vendas presenciais)
		if (!isVendasOnline && clienteSelect) {
			clienteSelect.addEventListener('change', atualizarEnderecoCliente);
		}
		// Inicializar endereço
		if ((clienteIdPreSelecionado && (typeof clienteIdPreSelecionado === 'object' || clienteSelecionado)) || (isVendasOnline && clienteSelecionado)) {
			atualizarEnderecoCliente();
		}
		fullPaymentCheckbox.addEventListener('change', () => {
			sinalGroup.style.display = fullPaymentCheckbox.checked ? 'none' : 'block';
			updateRestante();
		});
		sinalInput.addEventListener('input', (e) => {
			// Formatar valor enquanto digita
			let value = e.target.value.replace(/[^0-9.,]/g, ''); // Permitir apenas números, ponto e vírgula
			// Substituir vírgula por ponto para cálculo
			value = value.replace(',', '.');
			// Limitar a 2 casas decimais
			const parts = value.split('.');
			if (parts.length > 1) {
				parts[1] = parts[1].substring(0, 2);
				value = parts.join('.');
			}
			// Atualizar o valor no campo
			e.target.value = value;
			// Atualizar cálculo do restante
			updateRestante();
		});
		function updateRestante() {
			const sinal = parseFloat(sinalInput.value) || 0;
			const restante = totalCarrinho - sinal;
			restanteLabel.textContent = restante > 0 ? `Restante: ${window.dashboardApp.formatCurrency(restante)}` : '';
		}
		entregaSelect.addEventListener('change', async () => {
			const isEntrega = entregaSelect.value === 'entrega';
			entregaDetalhes.style.display = isEntrega ? 'block' : 'none';
			enderecoOptions.style.display = isEntrega ? 'block' : 'none';
			if (isEntrega) {
				const dataInput = document.getElementById('finalizar-data-entrega');
				if (dataInput && dataInput.value) {
					await this.updateHorariosDisponiveis(dataInput.value);
				}
			}
		});
		// Event listeners para opções de endereço
		modal.querySelectorAll('input[name="endereco-opcao"]').forEach(radio => {
			radio.addEventListener('change', (e) => {
				const isNovoEndereco = e.target.value === 'novo';
				enderecoNovoInput.style.display = isNovoEndereco ? 'block' : 'none';
			});
		});
		// Submit
		modal.querySelector('#form-finalizar-pedido').addEventListener('submit', async (e) => {
			e.preventDefault();
			if (isVendasOnline) {
				// Coletar dados do formulário para vendas online
				const formaPagamento = document.getElementById('finalizar-pagamento').value;
				const tipoEntrega = entregaSelect.value;
				let enderecoEntrega = null;
				let dataEntrega = null;
				if (tipoEntrega === 'entrega') {
					const enderecoOpcao = document.querySelector('input[name="endereco-opcao"]:checked').value;
					if (enderecoOpcao === 'cadastro') {
						enderecoEntrega = clienteSelecionado?.endereco || null;
					} else {
						enderecoEntrega = document.getElementById('finalizar-endereco-novo').value.trim() || null;
					}
					dataEntrega = document.getElementById('finalizar-data-entrega').value;
				}
				console.log('📦 Finalizando pedido online - Tipo entrega:', tipoEntrega, 'Data entrega:', dataEntrega);
				await this.finalizarPedidoOnline(clienteSelecionado, tipoEntrega, dataEntrega, enderecoEntrega, formaPagamento);
			} else {
				await this.finalizarVendaPresencial();
			}
		});
		console.log('✅ Modal de finalização criado com sucesso');
		// Aplicar traduções aos elementos dinâmicos do modal
		setTimeout(() => applyTranslations(), 100);
		} catch (error) {
			console.error('Erro ao abrir modal finalizar pedido:', error);
		}
	}
	async finalizarVendaPresencial() {
		const clienteId = document.getElementById('finalizar-cliente').value;
		const formaPagamento = document.getElementById('finalizar-pagamento').value;
		const tipoEntrega = document.getElementById('finalizar-entrega').value;
		const fullPayment = document.getElementById('finalizar-full-payment').checked;
		const sinal = fullPayment ? 0 : (parseFloat(document.getElementById('finalizar-sinal').value) || 0);
		if (!clienteId) {
			this.showAlert('alert.selecione_cliente');
			return;
		}
		// Determinar endereço de entrega
		let enderecoEntrega = null;
		if (tipoEntrega === 'entrega') {
			const enderecoOpcao = document.querySelector('input[name="endereco-opcao"]:checked').value;
			if (enderecoOpcao === 'cadastro') {
				const cliente = this.clients.find(c => c.id == clienteId);
				enderecoEntrega = cliente?.endereco || null;
			} else {
				enderecoEntrega = document.getElementById('finalizar-endereco-novo').value.trim() || null;
			}
			if (!enderecoEntrega) {
				this.showAlert('alert.endereco_entrega');
				return;
			}
		}
		const produtos = Object.entries(this.cart)
			.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado)
			.map(([id, item]) => ({ produto_id: id, quantidade: item.quantidade, preco_unitario: item.preco }));
		const valor_total = produtos.reduce((acc, p) => acc + p.preco_unitario * p.quantidade, 0);
		const valor_pago = fullPayment ? valor_total : sinal;
		const status = this.determineInitialStatus({
			formaPagamento,
			tipoEntrega,
			fullPayment,
			sinal
		});
		const cliente = this.clients.find(c => c.id == clienteId);
		const hoje = new Date();
		const dataStr = hoje.toISOString().slice(0,10).replace(/-/g, '');
		const randomNum = Math.floor(Math.random() * 9000) + 1000;
		const numeroPedido = `PED-${dataStr}-${randomNum}`;
		// Capturar idioma selecionado
		const idiomaSelecionado = document.getElementById('finalizar-idioma')?.value || 'pt';
		// Data de entrega
		let dataEntrega = hoje.toISOString().slice(0,10);
		let horarioEntrega = null;
		if (tipoEntrega === 'entrega') {
			const dataSelecionada = document.getElementById('finalizar-data-entrega').value;
			dataEntrega = dataSelecionada ? dataSelecionada + 'T00:00:00' : dataEntrega + 'T00:00:00';
			horarioEntrega = document.getElementById('finalizar-horario-entrega').value || null;
			if (!horarioEntrega) {
				alert('Selecione um horário de entrega.');
				return;
			}
		} else {
			dataEntrega = dataEntrega + 'T00:00:00';
		}
		const pedidoData = {
			numero_pedido: numeroPedido,
			cliente_id: clienteId,
			vendedor_id: this.currentUser?.id || null,
			data_pedido: hoje.toISOString(),
			data_entrega: dataEntrega,
			hora_entrega: horarioEntrega,
			valor_total,
			valor_pago,
			status,
			forma_pagamento: formaPagamento,
			observacoes: '',
			idioma: idiomaSelecionado
		};
		// Salvar pedido
		const pedidoSalvo = await this.saveToSupabaseInsert('pedidos', pedidoData);
		if (pedidoSalvo && pedidoSalvo.id) {
			// Salvar itens do pedido
			for (const item of produtos) {
				const itemData = {
					pedido_id: pedidoSalvo.id,
					produto_id: item.produto_id,
					quantidade: item.quantidade,
					preco_unitario: item.preco_unitario,
					created_at: new Date().toISOString()
				};
				await this.saveToSupabaseInsert('pedido_itens', itemData);
			}
			// Criar entrega se necessário
			if (tipoEntrega === 'entrega') {
				const entregaData = {
					pedido_id: pedidoSalvo.id,
					data_entrega: dataEntrega,
					hora_entrega: horarioEntrega,
					endereco_entrega: enderecoEntrega,
					status: 'agendada',
					created_at: new Date().toISOString()
				};
				await this.saveToSupabaseInsert('entregas', entregaData);
			}
			// Atualizar idioma do cliente se diferente
			if (cliente && idiomaSelecionado !== (cliente.idioma || 'pt')) {
				await this.supabase.from('clientes').update({ idioma: idiomaSelecionado }).eq('id', cliente.id);
			}
			// Registrar custos automaticamente dos produtos vendidos
			await this.registrarCustosProdutosVendidos(pedidoSalvo.id, produtos);
			// Limpar carrinho
			this.cart = {};
			this.updateCartBadge(); // Atualizar badge do carrinho
			closeModal('modal-finalizar-pedido'); // Fechar modal ANTES das atualizações
			// Recarregar dados
			await this.loadData();
			this.triggerRecebimentoEmail(pedidoSalvo.id);
			// Atualizar seções do dashboard ANTES de renderizar a página
			this.loadPedidosStatusList(); // Atualizar lista de pedidos no dashboard
			if (document.getElementById('entregas-hoje')) {
				this.updateFollowUpEntregas(); // Atualizar follow-up de entregas
			}
			this.updateStats(); // Atualizar estatísticas
			this.renderPedidosPage(); // Mostrar página de pedidos após venda
			this.showAlert('alert.venda_finalizada');
		}
		console.log('✅ Modal de finalização criado');
		// Forçar atualização de horários se já houver uma data selecionada
		const dataInput = document.getElementById('finalizar-data-entrega');
		if (dataInput && dataInput.value) {
			console.log('📅 Data já selecionada, atualizando horários:', dataInput.value);
			this.updateHorariosDisponiveis(dataInput.value);
		}
	}
	async abrirVerificacaoClienteModal() {
		// Verificar se há validação em cache válida (10 minutos)
		const validacaoCache = this.getValidacaoClienteCache();
		if (validacaoCache) {
			console.log('✅ Validação em cache encontrada, pulando verificação');
			await this.abrirFinalizarPedidoModal(validacaoCache.cliente);
			return;
		}
		// Verificar se há produtos no carrinho
		const produtosNoCarrinho = Object.entries(this.cart)
			.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado);
		if (produtosNoCarrinho.length === 0) {
			this.showAlert('alert.carrinho_vazio');
			return;
		}
		const modalId = 'modal-verificacao-cliente';
		document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
		const existingModal = document.getElementById(modalId);
		if (existingModal) existingModal.remove();
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.style.zIndex = '2000';
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="max-width: 500px;">
				<div class="modal-content">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
						<h3 style="margin: 0; color: #333;">🔍 ${t('verificacao.titulo')}</h3>
						<button onclick="closeModal('${modalId}')" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; line-height: 1;">&times;</button>
					</div>
					<p style="margin-bottom: 1rem; color: #666;">${t('verificacao.descricao')}</p>
					<form id="form-verificacao-cliente">
						<div class="form-group">
							<label for="cliente-contato">${t('verificacao.email_telefone')}</label>
							<input type="text" id="cliente-contato" required placeholder="${t('verificacao.placeholder_email_telefone')}" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
						</div>
						<div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
							<button type="submit" class="btn btn-primary" style="flex: 1;">${t('verificacao.verificar')}</button>
							<button type="button" onclick="closeModal('${modalId}'); window.dashboardApp.abrirCadastroClienteModal();" class="btn btn-secondary" style="flex: 1;">${t('verificacao.novo_cliente')}</button>
						</div>
					</form>
				</div>
			</div>
		`;
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
		document.getElementById('form-verificacao-cliente').addEventListener('submit', async (e) => {
			e.preventDefault();
			let contato = document.getElementById('cliente-contato').value.trim();
			if (!contato) return;
			// Normalizar contato: remover espaços, hífens, parênteses
			contato = contato.replace(/[\s\-\(\)]/g, '');
			// Determinar se é e-mail ou telefone
			const isEmail = contato.includes('@');
			// Se for telefone e tiver 10 dígitos, formatar
			if (!isEmail && contato.length === 10) {
				contato = this.formatarTelefone(contato);
			}
			const searchField = isEmail ? 'email' : 'telefone';
			// Buscar cliente
			const { data: cliente, error } = await this.supabase
				.from('clientes')
				.select('*')
				.eq(searchField, contato)
				.single();
			if (error || !cliente) {
				alert(t('verificacao.cliente_nao_encontrado_alert'));
				closeModal(modalId);
				this.abrirCadastroClienteModal();
				return;
			}
			// Cliente encontrado, iniciar verificação
			closeModal(modalId);
			this.iniciarVerificacaoCliente(cliente, isEmail);
		});
	}
	iniciarVerificacaoCliente(cliente, inputFoiEmail) {
		let tentativas = 0;
		const maxTentativas = 2;
		// Se input foi e-mail, verificar telefone primeiro; senão, verificar e-mail primeiro
		const verificarTelefonePrimeiro = inputFoiEmail;
		const self = this;
		function mostrarVerificacaoEmail() {
			const emails = self.gerarOpcoesEmail(cliente.email);
			// Encontrar o índice da opção correta após embaralhamento
			const indiceCorreto = emails.findIndex(email => 
				email.trim().toLowerCase() === cliente.email.trim().toLowerCase()
			);
			const modalId = 'modal-verificacao-email';
			document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
			const modal = document.createElement('div');
			modal.id = modalId;
			modal.className = 'modal-overlay show';
			modal.style.zIndex = '2000';
			modal.innerHTML = `
				<div class="modal-content-wrapper" style="max-width: 500px;">
					<div class="modal-content">
						<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
							<h3 style="margin: 0; color: #333;">📧 ${t('verificacao.verificacao_seguranca')}</h3>
							<button onclick="closeModal('${modalId}')" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; line-height: 1;">&times;</button>
						</div>
						<p style="margin-bottom: 1rem; color: #666;">${t('verificacao.selecione_email')}</p>
						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
							${emails.map((email, index) => `
								<button class="opcao-verificacao" data-index="${index}" style="padding: 1rem; border: 2px solid #ddd; border-radius: 8px; background: white; cursor: pointer; text-align: center; font-size: 1rem; transition: all 0.2s;">
									${email}
								</button>
							`).join('')}
						</div>
						<p style="font-size: 0.9rem; color: #888;">${t('verificacao.tentativa_de')} ${tentativas + 1} ${t('verificacao.de')} ${maxTentativas}</p>
					</div>
				</div>
			`;
			document.getElementById('modals-container').appendChild(modal);
			modal.classList.add('show');
			document.querySelectorAll('.opcao-verificacao').forEach(btn => {
				btn.addEventListener('click', (e) => {
					const index = parseInt(e.target.dataset.index);
					if (index === indiceCorreto) {
						// Correto, próxima verificação
						closeModal(modalId);
						mostrarVerificacaoEndereco();
					} else {
						tentativas++;
						if (tentativas >= maxTentativas) {
							alert(t('verificacao.email_incorreto_limite'));
							closeModal(modalId);
							self.abrirCadastroClienteModal();
						} else {
							alert(t('verificacao.email_incorreto_tente'));
							closeModal(modalId);
							mostrarVerificacaoEmail();
						}
					}
				});
			});
		}
		function mostrarVerificacaoTelefone() {
			const telefones = self.gerarOpcoesTelefone(self.formatarTelefone(cliente.telefone));
			// Encontrar o índice da opção correta após embaralhamento
			const indiceCorreto = telefones.findIndex(tel => 
				tel.trim() === self.formatarTelefone(cliente.telefone).trim()
			);
			const modalId = 'modal-verificacao-telefone';
			document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
			const modal = document.createElement('div');
			modal.id = modalId;
			modal.className = 'modal-overlay show';
			modal.style.zIndex = '2000';
			modal.innerHTML = `
				<div class="modal-content-wrapper" style="max-width: 500px;">
					<div class="modal-content">
						<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
							<h3 style="margin: 0; color: #333;">📱 ${t('verificacao.verificacao_seguranca')}</h3>
							<button onclick="closeModal('${modalId}')" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; line-height: 1;">&times;</button>
						</div>
						<p style="margin-bottom: 1rem; color: #666;">${t('verificacao.selecione_telefone')}</p>
						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
							${telefones.map((tel, index) => `
								<button class="opcao-verificacao" data-index="${index}" style="padding: 1rem; border: 2px solid #ddd; border-radius: 8px; background: white; cursor: pointer; text-align: center; font-size: 1rem; transition: all 0.2s;">
									${tel}
								</button>
							`).join('')}
						</div>
						<p style="font-size: 0.9rem; color: #888;">${t('verificacao.tentativa_de')} ${tentativas + 1} ${t('verificacao.de')} ${maxTentativas}</p>
					</div>
				</div>
			`;
			document.getElementById('modals-container').appendChild(modal);
			modal.classList.add('show');
			document.querySelectorAll('.opcao-verificacao').forEach(btn => {
				btn.addEventListener('click', (e) => {
					const index = parseInt(e.target.dataset.index);
					if (index === indiceCorreto) {
						// Correto, próxima verificação
						closeModal(modalId);
						mostrarVerificacaoEndereco();
					} else {
						tentativas++;
						if (tentativas >= maxTentativas) {
							alert(t('verificacao.telefone_incorreto_limite'));
							closeModal(modalId);
							self.abrirCadastroClienteModal();
						} else {
							alert(t('verificacao.telefone_incorreto_tente'));
							closeModal(modalId);
							mostrarVerificacaoTelefone();
						}
					}
				});
			});
		}
		function mostrarVerificacaoEndereco() {
			console.log('🏠 Iniciando verificação de endereço para cliente:', cliente);
			console.log('📍 Endereço do cliente:', cliente.endereco);
			if (!cliente.endereco || cliente.endereco.trim() === '') {
				console.error('❌ Cliente não tem endereço cadastrado!');
				this.showAlert('alert.cliente_sem_endereco');
				closeModal(modalId);
				self.abrirCadastroClienteModal(cliente);
				return;
			}
			const enderecos = self.gerarOpcoesEndereco(cliente.endereco);
			// Encontrar o índice da opção correta após embaralhamento (comparação flexível)
			const indiceCorreto = enderecos.findIndex(end => 
				end.trim().toLowerCase() === cliente.endereco.trim().toLowerCase()
			);
			console.log('🔍 Debug endereço:');
			console.log('  Cliente:', cliente.endereco);
			console.log('  Opções:', enderecos);
			console.log('  Índice correto:', indiceCorreto);
			const modalId = 'modal-verificacao-endereco';
			document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
			const modal = document.createElement('div');
			modal.id = modalId;
			modal.className = 'modal-overlay show';
			modal.style.zIndex = '2000';
			modal.innerHTML = `
				<div class="modal-content-wrapper" style="max-width: 500px;">
					<div class="modal-content">
						<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
							<h3 style="margin: 0; color: #333;">🏠 ${t('verificacao.verificacao_final')}</h3>
							<button onclick="closeModal('${modalId}')" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; line-height: 1;">&times;</button>
						</div>
						<p style="margin-bottom: 1rem; color: #666;">${t('verificacao.selecione_endereco')}</p>
						<div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
							${enderecos.map((end, index) => `
								<button class="opcao-verificacao" data-index="${index}" data-correct="${index === indiceCorreto ? 'true' : 'false'}" style="padding: 1rem; border: 2px solid #ddd; border-radius: 8px; background: white; cursor: pointer; text-align: left; font-size: 1rem; transition: all 0.2s;">
									${end}
								</button>
							`).join('')}
						</div>
						<p style="font-size: 0.9rem; color: #888;">${t('verificacao.tentativa_de')} ${tentativas + 1} de ${maxTentativas}</p>
					</div>
				</div>
			`;
			document.getElementById('modals-container').appendChild(modal);
			modal.classList.add('show');
			document.querySelectorAll('.opcao-verificacao').forEach(btn => {
				btn.addEventListener('click', async (e) => {
					const isCorrect = e.target.dataset.correct === 'true';
					const textoClicado = e.target.textContent.trim();
					console.log(`🖱️ Clicou: "${textoClicado}" - Correto: ${isCorrect}`);
					if (isCorrect) {
						console.log('✅ Opção correta selecionada!');
						// Cliente verificado com sucesso - armazenar em cache e ir direto para finalização
						self.setValidacaoClienteCache(cliente);
						closeModal(modalId);
						await self.abrirFinalizarPedidoModal(cliente);
					} else {
						console.log('❌ Opção errada selecionada');
						tentativas++;
						tentativas++;
						if (tentativas >= maxTentativas) {
							alert(t('verificacao.endereco_incorreto_limite'));
							closeModal(modalId);
							self.abrirCadastroClienteModal();
						} else {
							alert(t('verificacao.endereco_incorreto_tente'));
							closeModal(modalId);
							if (verificarTelefonePrimeiro) {
								mostrarVerificacaoTelefone();
							} else {
								mostrarVerificacaoEmail();
							}
						}
					}
				});
			});
		};
		// Iniciar verificação baseada no input
		if (verificarTelefonePrimeiro) {
			mostrarVerificacaoTelefone();
		} else {
			mostrarVerificacaoEmail();
		}
	}
	formatarTelefone(telefoneNumerico) {
		// Remove qualquer formatação existente
		const numeroLimpo = telefoneNumerico.toString().replace(/[\s\-\(\)]/g, '');
		if (numeroLimpo.length !== 10) {
			return numeroLimpo; // Retorna como está se não for 10 dígitos
		}
		return `${numeroLimpo.slice(0, 3)} ${numeroLimpo.slice(3, 6)} ${numeroLimpo.slice(6)}`;
	}
	gerarOpcoesTelefone(telefoneCorreto) {
		const opcoes = [telefoneCorreto];
		while (opcoes.length < 4) {
			const area = Math.floor(Math.random() * 800) + 200; // 200-999
			const prefixo = Math.floor(Math.random() * 800) + 200; // 200-999
			const linha = Math.floor(Math.random() * 10000); // 0000-9999
			const telefoneFalso = `${area} ${prefixo} ${linha.toString().padStart(4, '0')}`;
			if (!opcoes.includes(telefoneFalso)) {
				opcoes.push(telefoneFalso);
			}
		}
		// Embaralhar
		for (let i = opcoes.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]];
		}
		return opcoes;
	}
	gerarOpcoesEmail(emailCorreto) {
		const opcoes = [emailCorreto];
		const dominios = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
		const nomes = ['usuario', 'cliente', 'comprador', 'visitante'];
		while (opcoes.length < 4) {
			const nome = nomes[Math.floor(Math.random() * nomes.length)];
			const numero = Math.floor(Math.random() * 999) + 1;
			const dominio = dominios[Math.floor(Math.random() * dominios.length)];
			const emailFalso = `${nome}${numero}@${dominio}`;
			if (!opcoes.includes(emailFalso)) {
				opcoes.push(emailFalso);
			}
		}
		// Embaralhar
		for (let i = opcoes.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]];
		}
		return opcoes;
	}
	gerarOpcoesEndereco(enderecoCorreto) {
		const opcoes = [enderecoCorreto];
		const ruas = ['Main Street', 'King Street', 'Queen Street', 'Yonge Street', 'Bay Street', 'Bloor Street', 'Dundas Street', 'Richmond Street'];
		const cidades = ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City'];
		const provincias = ['ON', 'BC', 'QC', 'AB', 'MB', 'SK', 'NS', 'NB'];
		while (opcoes.length < 4) {
			const rua = ruas[Math.floor(Math.random() * ruas.length)];
			const numero = Math.floor(Math.random() * 9999) + 1;
			const cidade = cidades[Math.floor(Math.random() * cidades.length)];
			const provincia = provincias[Math.floor(Math.random() * provincias.length)];
			const enderecoFalso = `${numero} ${rua}, ${cidade}, ${provincia}`;
			if (!opcoes.includes(enderecoFalso)) {
				opcoes.push(enderecoFalso);
			}
		}
		// Embaralhar
		for (let i = opcoes.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]];
		}
		return opcoes;
	}
	async abrirCadastroClienteModal(clienteExistente = null) {
		// Verificar se há produtos no carrinho
		const produtosNoCarrinho = Object.entries(this.cart)
			.filter(([_, item]) => item && item.quantidade > 0 && item.adicionado);
		if (produtosNoCarrinho.length === 0) {
			this.showAlert('alert.carrinho_vazio');
			return;
		}
		// Criar modal
		const modalId = 'modal-cadastro-cliente';
		// Remover TODOS os modais existentes para evitar sobreposição
		document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
		// Remover modal específico se ainda existir
		const existingModal = document.getElementById(modalId);
		if (existingModal) {
			existingModal.remove();
		}
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.style.zIndex = '2000';
		// Contador de 5 minutos (300 segundos)
		let tempoRestante = 300;
		let countdownInterval;
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="max-width: 500px;">
				<div class="modal-content">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
						<h3 style="margin: 0; color: #333;">${clienteExistente ? '✅ Dados do Cliente Carregados' : '📝 Cadastro para Finalizar Compra'}</h3>
						<button onclick="closeModal('${modalId}')" style="background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; line-height: 1;">&times;</button>
					</div>
					<div id="countdown-warning" style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: center;">
						<div style="color: #856404; font-weight: 600; margin-bottom: 0.5rem;">⏰ Tempo para finalizar cadastro</div>
						<div id="countdown-timer" style="font-size: 1.5rem; font-weight: bold; color: #dc3545;">05:00</div>
						<div style="color: #856404; font-size: 0.9rem; margin-top: 0.5rem;">
							Caso não complete o cadastro, seu carrinho será esvaziado automaticamente
						</div>
					</div>
					<form id="cadastro-cliente-form" style="display: flex; flex-direction: column; gap: 1rem;">
						<div>
							<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Nome Completo *</label>
							<input type="text" id="cliente-nome" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
						</div>
						<div>
							<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Telefone *</label>
							<input type="tel" id="cliente-telefone" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
						</div>
						<div>
							<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Email</label>
							<input type="email" id="cliente-email" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
						</div>
						<div>
							<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Endereço Completo *</label>
							<textarea id="cliente-endereco" required rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box; resize: vertical;"></textarea>
						</div>
						<div style="display: flex; gap: 1rem; margin-top: 1rem;">
							<button type="button" onclick="closeModal('${modalId}')" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
								Cancelar
							</button>
							<button type="submit" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
								Cadastrar e Continuar
							</button>
						</div>
					</form>
				</div>
			</div>
		`;
		// Adicionar modal ao DOM
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		// Event listener para fechar modal
		modal.addEventListener('click', (e) => {
			if (e.target === modal || e.target.classList.contains('modal-overlay')) {
				closeModal(modalId);
			}
		});
		// Iniciar contador
		function atualizarContador() {
			const minutos = Math.floor(tempoRestante / 60);
			const segundos = tempoRestante % 60;
			const timerEl = document.getElementById('countdown-timer');
			if (timerEl) {
				timerEl.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
			}
			if (tempoRestante <= 0) {
				clearInterval(countdownInterval);
				// Esvaziar carrinho
				window.dashboardApp.cart = {};
				window.dashboardApp.updateCartHeader();
				window.dashboardApp.updateCartBadge();
				if (window.dashboardApp.isVendasOnline) {
					window.dashboardApp.updatePedidosCartTotal();
				}
				closeModal(modalId);
				this.showAlert('alert.tempo_esgotado');
				return;
			}
			tempoRestante--;
		}
		atualizarContador();
		countdownInterval = setInterval(atualizarContador, 1000);
		// Preencher campos se cliente existente
		if (clienteExistente) {
			setTimeout(() => {
				document.getElementById('cliente-nome').value = clienteExistente.nome || '';
				document.getElementById('cliente-telefone').value = clienteExistente.telefone || '';
				document.getElementById('cliente-email').value = clienteExistente.email || '';
				document.getElementById('cliente-endereco').value = clienteExistente.endereco || '';
			}, 100);
		}
		// Event listener para o formulário
		const form = document.getElementById('cadastro-cliente-form');
		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				const nome = document.getElementById('cliente-nome').value.trim();
				const telefone = document.getElementById('cliente-telefone').value.trim();
				const email = document.getElementById('cliente-email').value.trim();
				const endereco = document.getElementById('cliente-endereco').value.trim();
				if (!nome || !telefone || !endereco) {
					alert('Preencha todos os campos obrigatórios!');
					return;
				}
				try {
					// Salvar cliente
					const clienteData = {
						nome: nome,
						telefone: telefone,
						email: email || null,
						endereco: endereco,
						created_at: new Date().toISOString()
					};
					const clienteSalvo = await this.saveToSupabaseInsert('clientes', clienteData);
					if (!clienteSalvo || !clienteSalvo.id) {
						alert('Erro ao salvar cliente. Verifique sua conexão com a internet e tente novamente.');
						return;
					}
					// Parar contador
					clearInterval(countdownInterval);
					// Fechar modal de cadastro
					closeModal(modalId);
					// Abrir modal de finalização de pedido com cliente selecionado
					await this.abrirFinalizarPedidoModal(clienteSalvo);
				} catch (error) {
					console.error('Erro ao cadastrar cliente:', error);
					alert('Erro ao cadastrar cliente. Tente novamente.');
				}
			});
		}
		// Limpar contador quando modal for fechado
		const originalCloseModal = window.closeModal;
		window.closeModal = function(modalIdToClose) {
			if (modalIdToClose === modalId) {
				clearInterval(countdownInterval);
			}
			originalCloseModal(modalIdToClose);
		};
	}
	// ENVIAR RECIBO POR EMAIL
	enviarReciboPorEmail(pedido, produtos, emailCliente) {
		// URL do backend - ALTERE PARA SUA URL HOSPEDADA
		const BACKEND_URL = 'http://localhost:3001'; // Para desenvolvimento local
		// const BACKEND_URL = 'https://sua-url-railway.com'; // Para produção

		const produtosHtml = produtos.map(p => {
			const prod = this.products.find(pr => pr.id == p.produto_id);
			return `${prod?.nome || 'Produto'} - ${p.quantidade}x ${this.formatCurrency(p.preco_unitario)}`;
		}).join('<br>');

		const emailData = {
			to_email: emailCliente,
			cliente_nome: pedido.cliente_nome,
			pedido_numero: pedido.numero_pedido,
			produtos: produtosHtml,
			valor_total: this.formatCurrency(pedido.valor_total),
			data_pedido: this.formatDate(pedido.data_pedido.slice(0,10)),
			forma_pagamento: pedido.forma_pagamento,
			assunto: `Recibo - Pedido ${pedido.numero_pedido}`,
			mensagem_status: `Aqui está o recibo do seu pedido ${pedido.numero_pedido}.\n\nProdutos:\n${produtos.map(p => {
				const prod = this.products.find(pr => pr.id == p.produto_id);
				return `- ${prod?.nome || 'Produto'} (${p.quantidade}x)`;
			}).join('\n')}\n\nValor Total: ${this.formatCurrency(pedido.valor_total)}\n\nObrigado por escolher a Leo's Cake!`
		};

		fetch(`${BACKEND_URL}/api/send-status-email`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(emailData)
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				console.log('✅ Recibo enviado com sucesso');
			} else {
				console.error('❌ Erro ao enviar recibo:', data.message);
			}
		})
		.catch(error => {
			console.error('❌ Erro na requisição do recibo:', error);
		});
	}
	// PÁGINA DE ESTOQUE
	renderEstoquePage() {
		const container = document.getElementById('estoque-container');
		if (!container) return;
		container.innerHTML = '<p>Estoque gerenciado via card no dashboard.</p>';
	}
	// PÁGINA DE ENTREGAS
	renderEntregasPage() {
		const container = document.getElementById('entregas-container');
		if (!container) return;
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isVendedor = role === 'sale' || role === 'vendedor';
		const isAdmin = role === 'admin';
		// Cabeçalho com botão de configuração (apenas para admin)
		let headerHtml = '';
		if (isAdmin) {
			headerHtml = `
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">
					<div>
						<h3 style="margin: 0; font-size: 1.25rem; font-weight: 700;">🚚 ${t('entregas.gerenciamento')}</h3>
						<p style="margin: 0.25rem 0 0 0; opacity: 0.9; font-size: 0.9rem;">Configure horários e gerencie entregas</p>
					</div>
					<button onclick="window.dashboardApp.openHorariosConfigModal()" style="padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; font-weight: 600; backdrop-filter: blur(10px); transition: all 0.2s;">
						<i class="fas fa-clock"></i> ${t('entregas.configure_horarios')}
					</button>
				</div>
			`;
		}
		// Filtrar entregas baseado no papel do usuário
		let entregas = [...this.entregas];
		if (isVendedor && this.currentUser?.id) {
			// Filtrar apenas entregas de pedidos criados pelo usuário logado
			entregas = this.entregas.filter(entrega => {
				// Encontrar o pedido relacionado e verificar se é do vendedor logado
				const pedido = this.orders.find(o => o.id == entrega.pedido_id);
				return pedido && pedido.vendedor_id && pedido.vendedor_id == this.currentUser.id;
			});
			console.log(`👤 Vendedor logado - mostrando ${entregas.length} entregas de pedidos próprios (apenas com vendedor_id)`);
		} else if (isAdmin) {
			console.log('👑 Admin logado - mostrando todas as entregas');
			entregas = [...this.entregas];
		}
		// Ordenar por data (mais próximas primeiro)
		entregas.sort((a, b) => new Date(a.data_entrega) - new Date(b.data_entrega));
		if (entregas.length === 0) {
			container.innerHTML = headerHtml + `<p style="text-align: center; padding: 3rem; color: #888;">${this.t('msg.nenhuma_entrega')}</p>`;
			return;
		}
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const list = entregas.map(entrega => {
			// Encontrar o pedido relacionado
			const pedido = this.orders.find(o => o.id == entrega.pedido_id) || {};
			// Encontrar o cliente relacionado
			const cliente = this.clients.find(c => c.id == pedido.cliente_id) || {};
			const dataEntrega = new Date(entrega.data_entrega);
			dataEntrega.setHours(0, 0, 0, 0);
			const isToday = dataEntrega.getTime() === today.getTime();
			const isPast = dataEntrega < today;
			const isTomorrow = dataEntrega.getTime() === (today.getTime() + 24 * 60 * 60 * 1000);
			let bgColor = 'white';
			let borderColor = '#17a2b8';
			if (isToday) {
				bgColor = '#fff3cd';
				borderColor = '#FFC107';
			} else if (isPast) {
				bgColor = '#f8d7da';
				borderColor = '#dc3545';
			} else if (isTomorrow) {
				bgColor = '#d1ecf1';
				borderColor = '#17a2b8';
			}
			const statusColors = {
				'agendada': '#17a2b8',
				'saiu_entrega': '#ffc107',
				'entregue': '#28a745',
				'cancelada': '#dc3545'
			};
			return `
				<div style="background: ${bgColor}; padding: 1.25rem; border-radius: 10px; margin-bottom: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid ${borderColor}; cursor: pointer;" onclick="window.dashboardApp.showOrderDetails(${pedido.id})">
					<div style="display: flex; justify-content: space-between; align-items: start;">
						<div style="flex: 1;">
							<h4 style="margin: 0 0 0.75rem 0; color: #333;">
								🚚 Pedido #${pedido.numero_pedido || pedido.id}
								${isToday ? '<span style="background: #FFC107; color: white; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.75rem; margin-left: 0.5rem;">HOJE</span>' : ''}
								${isTomorrow ? '<span style="background: #17a2b8; color: white; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.75rem; margin-left: 0.5rem;">AMANHÃ</span>' : ''}
								${isPast ? '<span style="background: #dc3545; color: white; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.75rem; margin-left: 0.5rem;">ATRASADO</span>' : ''}
							</h4>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>👤</strong> ${cliente.nome || 'Cliente não informado'}</p>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>📅</strong> ${dataEntrega.toLocaleDateString('pt-BR')}</p>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>🕐</strong> ${entrega.hora_entrega || 'Não informado'}</p>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>📍</strong> ${entrega.endereco_entrega || cliente.endereco || 'Endereço não informado'}</p>
							<p style="margin: 0 0 0.25rem 0; color: #666;"><strong>💰</strong> R$ ${pedido.valor_total ? parseFloat(pedido.valor_total).toFixed(2) : '0.00'}</p>
							${entrega.observacoes ? `<p style="margin: 0.5rem 0 0 0; color: #888; font-size: 0.8rem; font-style: italic;">📝 ${entrega.observacoes}</p>` : ''}
							<span style="display: inline-block; margin-top: 0.5rem; background: ${statusColors[entrega.status] || '#6c757d'}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">
								${entrega.status === 'agendada' ? 'Agendada' : 
								  entrega.status === 'saiu_entrega' ? 'Em Trânsito' : 
								  entrega.status === 'entregue' ? 'Entregue' : 
								  entrega.status === 'cancelada' ? 'Cancelada' : entrega.status}
							</span>
						</div>
					</div>
				</div>
			`;
		}).join('');
		container.innerHTML = headerHtml + list;
	}
	// PÁGINA DE CLIENTES
	renderClientesPage() {
		const container = document.getElementById('clientes-container');
		if (!container) return;
		container.style.display = 'flex';
		container.style.flexDirection = 'column';
		container.style.gap = '0.75rem';
		const actionBar = `
			<button onclick="window.dashboardApp.openAddClientModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(255,107,157,0.3);">
				<i class="fas fa-plus"></i> ${t('verificacao.novo_cliente')}
			</button>
		`;
		if (this.clients.length === 0) {
			container.innerHTML = actionBar + `<p style="text-align: center; padding: 3rem; color: #888;">Nenhum cliente cadastrado</p>`;
			return;
		}
		function escapeHtml(text) {
			if (!text) return '';
			return String(text)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;');
		}
		const list = this.clients.map(c => `
			<div style="background: white; padding: 1.25rem; border-radius: 10px; margin-bottom: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #667eea;">
				<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
					<div style="background: linear-gradient(135deg, #667eea, #6dd5ed); border-radius: 8px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
						<i class="fas fa-user" style="color: #fff; font-size: 1.5rem;"></i>
					</div>
					<h4 style="margin: 0; color: #333; font-size: 1.15rem; font-weight: 700;">${escapeHtml(c.nome)} <span style="font-size: 0.8rem; font-weight: 400; color: #666; background: ${c.canal === 'online' ? '#e8f5e8' : c.canal === 'fisico' ? '#fff3cd' : '#f8f9fa'}; padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: 0.5rem;">${c.canal === 'online' ? 'Online' : c.canal === 'fisico' ? 'Loja Física' : 'Não informado'}</span></h4>
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
	async editClient(id) {
		const client = this.clients.find(c => c.id === id);
		if (!client) return;
		const modal = this.createModal('modal-edit-client', 'Editar Cliente', true);
		function escapeHtml(text) {
			if (!text) return '';
			return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
		}
		modal.querySelector('.modal-content-wrapper').innerHTML += `
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
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
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
	async deleteFromSupabase(table, id) {
		if (!this.supabase) return false;
		try {
			const { error } = await this.supabase.from(table).delete().eq('id', id);
			return !error;
		} catch (error) {
			console.error('Erro ao deletar:', error);
			return false;
		}
	}
	openAddClientModal() {
		const modal = this.createModal('modal-add-client', '', false);
		modal.querySelector('.modal-content-wrapper').innerHTML = `
			<div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
				<span style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #6dd5ed); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-user"></i></span>
				<span style="font-size: 1.35rem; font-weight: 700; color: #333;">${t('verificacao.novo_cliente')}</span>
				<button onclick="closeModal('modal-add-client')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
			</div>
			<div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
			<form id="form-add-client" class="form-modal">
				<div class="form-group">
					<label for="client-nome">Nome *</label>
					<input type="text" id="client-nome" required class="form-control">
				</div>
				<div class="form-group">
					<label for="client-telefone">Telefone *</label>
					<input type="tel" id="client-telefone" required class="form-control">
				</div>
				<div class="form-group">
					<label for="client-email">Email</label>
					<input type="email" id="client-email" class="form-control">
				</div>
				<div class="form-group">
					<label for="client-endereco">Endereço *</label>
					<textarea id="client-endereco" required class="form-control" rows="3"></textarea>
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-add-client')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Salvar</button>
				</div>
			</form>
		`;
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
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
			const clientData = { nome, telefone, email, endereco, canal: 'fisico' };
			const result = await this.saveToSupabaseInsert('clientes', clientData);
			if (result) this.clients.unshift(result);
			await this.loadData();
			this.renderClientesPage();
			this.updateStats();
			closeModal('modal-add-client');
		});
	}
	// PÁGINA DE PRODUTOS
	renderProdutosPage() {
		const container = document.getElementById('produtos-container');
		if (!container) {
			console.error('❌ Container produtos não encontrado');
			return;
		}
		// Verificar se o usuário é admin para mostrar botão de adicionar produto
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isAdmin = role === 'admin';
		// Limpar completamente o container
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
		container.style.display = 'flex';
		container.style.flexDirection = 'column';
		container.style.gap = '1rem';
		const actionBar = isAdmin ? `
			<button onclick="window.dashboardApp.openAddProductModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(255,107,157,0.3);">
				<i class="fas fa-plus"></i> Novo Produto
			</button>
		` : '';
		if (this.products.length === 0) {
			container.innerHTML = actionBar + `<p style="text-align: center; padding: 3rem; color: #888;">Nenhum produto cadastrado</p>`;
			return;
		}
		const produtosHtml = `
			<div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
				${this.products.map(p => {
					let fotos = [];
					if (p.fotos) {
						try { 
							fotos = JSON.parse(p.fotos);
							console.log('📸 Produto', p.id, 'tem', fotos.length, 'fotos');
							if (fotos.length > 0) {
								console.log('📸 Primeira foto:', fotos[0].substring(0, 100) + '...');
							}
						} catch (e) {
							console.error('❌ Erro ao parsear fotos do produto', p.id, ':', e);
						}
					} else {
						console.log('📸 Produto', p.id, 'não tem fotos (p.fotos é null/undefined)');
					}
					return `
						<div class="card-produto" style="background: #fff; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 1.2rem; max-width: 320px; width: 100%; display: flex; flex-direction: column; align-items: center;" data-descricao="${p.descricao || ''}">
							<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
								<span style="font-size: 1.0rem; font-weight: 700; color: #333;">${p.nome}</span>
								<div style="margin-top: 0.5rem;">
									<span style="background: ${p.status_produto === 'pronta_entrega' ? '#28a745' : '#ff6b9d'}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">${p.status_produto === 'pronta_entrega' ? t('vendas_online.pronta_entrega') : t('vendas_online.sob_encomenda')}</span>
								</div>
							</div>
							<div style="position: relative; width: 220px; height: 220px; border-radius: 10px; overflow: hidden; background: #f0f0f0; margin-bottom: 0.7rem;">
								<div id="carousel-${p.id}" data-current="0" style="display: flex; transition: transform 0.3s ease;">
									${fotos.map(foto => `<img loading="lazy" src="${foto}" style="min-width: 100%; height: 220px; object-fit: contain; background: #f8f9fa;">`).join('')}
								</div>
								${fotos.length > 1 ? `
									<button data-action="prev-photo" data-id="${p.id}" data-total="${fotos.length}" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">‹</button>
									<button data-action="next-photo" data-id="${p.id}" data-total="${fotos.length}" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer;">›</button>
								` : ''}
							</div>
							<div style="width: 100%; text-align: center; margin-bottom: 0.5rem;">
								<span style="font-size: 1.1rem; font-weight: 700; color: #ff6b9d;">${this.formatCurrency(p.preco)}</span>
								<p style="margin: 0.3rem 0 0 0; color: #666; font-size: 0.8rem;">💰 Custo: <strong>${p.custo ? this.formatCurrency(p.custo) : 'Não informado'}</strong></p>
								<p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">📦 Estoque: <strong>${p.estoque}</strong></p>
								${p.descricao ? `<p style="margin: 0.5rem 0 0 0; color: #888; font-size: 0.8rem; line-height: 1.3; text-align: center;">${p.descricao}</p>` : ''}
							</div>
							<div style="display: flex; gap: 0.5rem; align-items: center; width: 100%; justify-content: center;">
								${(() => {
									console.log('🎨 Renderizando botões para produto:', p.id, p.nome, 'tipo:', typeof p.id);
									return isAdmin ? `
										<button data-action="edit-product" data-id="${p.id}" style="padding: 0.5rem 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
											<i class="fas fa-edit"></i>
										</button>
										<button data-action="delete-product" data-id="${p.id}" style="padding: 0.5rem 0.75rem; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
											<i class="fas fa-trash"></i>
										</button>
									` : '';
								})()}
							</div>
						</div>
					`;
				}).join('')}
			</div>
		`;
		container.innerHTML = actionBar + produtosHtml;
		// Eventos do carrossel e botões
		container.onclick = (e) => {
			const btn = e.target.closest('button[data-action]');
			if (!btn) return;
			const action = btn.getAttribute('data-action');
			const id = btn.getAttribute('data-id');
			const preco = parseFloat(btn.getAttribute('data-preco'));
			const total = parseInt(btn.getAttribute('data-total'));
			console.log('🎯 Botão clicado:', action, 'id:', id, 'id length:', id ? id.length : 'null', 'id type:', typeof id);
			console.log('🎯 Elemento botão:', btn);
			console.log('🎯 data-id attribute:', btn.getAttribute('data-id'));
			switch (action) {
				case 'prev-photo':
					this.prevPhoto(id, total);
					break;
				case 'next-photo':
					this.nextPhoto(id, total);
					break;
				case 'edit-product':
					console.log('📝 Chamando editProduct com id:', id);
					console.log('📝 ID antes de chamar editProduct:', id, 'tipo:', typeof id);
					this.editProduct(id);
					break;
				case 'delete-product':
					if (confirm('Tem certeza que deseja excluir este produto?')) {
						this.deleteProduct(id);
					}
					break;
				case 'increment-produto':
					this.incrementProdutoCarrinho(id, preco);
					break;
				case 'decrement-produto':
					this.decrementProdutoCarrinho(id);
					break;
				case 'adicionar-carrinho':
					this.adicionarAoCarrinho(id, preco);
					break;
			}
		};
	}
	async editProduct(id) {
		console.log('🎯 editProduct chamado com id:', id, typeof id);
		// Não converter para number, manter como string (UUID)
		// id = parseInt(id, 10);
		console.log('🎯 ID mantido como string:', id, typeof id);
		// Log de todos os produtos para debug
		console.log('📋 Lista de produtos disponíveis:', this.products.map(p => ({id: p.id, nome: p.nome, tipo: typeof p.id})));
		// Verificar se o usuário é admin
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isAdmin = role === 'admin';
		if (!isAdmin) {
			alert('Acesso negado. Apenas administradores podem editar produtos.');
			return;
		}
		const product = this.products.find(p => {
			const pId = String(p.id);
			const searchId = String(id);
			const match = pId === searchId;
			console.log(`🔍 Comparando produto ${pId} (tipo: ${typeof p.id}) com ${searchId} (tipo: ${typeof id}) - match: ${match}`);
			return match;
		});
		console.log('📦 Produto encontrado:', product);
		if (!product) {
			console.error('❌ Produto não encontrado com id:', id, 'em produtos:', this.products.map(p => ({id: p.id, nome: p.nome, tipo: typeof p.id})));
			alert('Produto não encontrado.');
			return;
		}
		console.log('Produto encontrado:', product);
		console.log('Custo do produto:', product.custo, typeof product.custo);
		console.log('📝 Nome do produto no modal:', product.nome);
		const modal = this.createModal('modal-edit-product', '✏️ Editar Produto');
		modal.classList.add('show');
		const wrapper = modal.querySelector('.modal-content-wrapper');
		wrapper.innerHTML += `
			<form id="form-edit-product" class="form-modal">
				<div class="form-group">
					<label for="edit-nome">Nome *</label>
					<input type="text" id="edit-nome" required value="${product.nome.replace(/"/g, '&quot;')}" class="form-control">
				</div>
				<div class="form-group">
					<label for="edit-categoria">Categoria *</label>
					<input type="text" id="edit-categoria" required value="${product.categoria.replace(/"/g, '&quot;')}" class="form-control">
				</div>
				<div class="form-group">
					<label for="edit-preco">Preço *</label>
					<input type="text" id="edit-preco" required value="${product.preco}" class="form-control" inputmode="decimal">
				</div>
				<div class="form-group">
					<label for="edit-custo">Custo de Produção</label>
					<input type="text" id="edit-custo" value="${product.custo || ''}" class="form-control" inputmode="decimal" placeholder="0,00">
				</div>
				<div class="form-group">
					<label for="edit-estoque">Estoque *</label>
					<input type="number" id="edit-estoque" required value="${product.estoque}" class="form-control" min="0" step="1">
				</div>
				<div class="form-group">
					<label for="edit-status">Disponibilidade *</label>
					<select id="edit-status" required class="form-control">
						<option value="pronta_entrega" ${product.status_produto === 'pronta_entrega' ? 'selected' : ''}>Pronta Entrega</option>
						<option value="sob_encomenda" ${product.status_produto === 'sob_encomenda' ? 'selected' : ''}>Sob Encomenda</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-descricao">Descrição</label>
					<textarea id="edit-descricao" class="form-control" rows="2">${product.descricao || ''}</textarea>
				</div>
				<div class="form-group">
					<label for="edit-fotos">Fotos do Produto</label>
					<div id="edit-fotos-preview" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
						${(() => {
							let fotos = [];
							if (product.fotos) {
								try { fotos = JSON.parse(product.fotos); } catch {}
							}
							return fotos.map((foto, index) => `
								<div style="position: relative; display: inline-block;">
									<img src="${foto}" data-existing="true" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
									<button type="button" onclick="this.parentElement.remove()" data-foto-index="${index}" style="position: absolute; top: -5px; right: -5px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;">×</button>
								</div>
							`).join('');
						})()}
					</div>
					<input type="file" id="edit-fotos-upload" multiple accept="image/*" style="margin-bottom: 0.5rem;">
					<small style="color: #666; font-size: 0.8rem;">Selecione uma ou mais imagens para adicionar (PNG, JPG, JPEG) - Máximo 10MB cada (serão comprimidas automaticamente para ≤5MB)</small>
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-edit-product')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Salvar</button>
				</div>
			</form>
		`;
		document.getElementById('modals-container').appendChild(modal);
		// Verificar se o campo nome foi preenchido corretamente
		setTimeout(() => {
			const nomeField = modal.querySelector('#edit-nome');
			console.log('🔍 Campo nome após modal aberto:', nomeField.value);
			console.log('🔍 Campo nome esperado:', product.nome);
		}, 100);
		// Preview de novas imagens no upload
		const fileInput = modal.querySelector('#edit-fotos-upload');
		const previewContainer = modal.querySelector('#edit-fotos-preview');
		fileInput.addEventListener('change', function(e) {
			// Limpar previews anteriores das novas imagens
			const existingPreviews = previewContainer.querySelectorAll('img:not([data-existing])');
			existingPreviews.forEach(img => img.remove());
			// Adicionar preview das novas imagens (apenas as que serão processadas)
			const maxPreviewImages = 5;
			if (this.files && this.files.length > 0) {
				const filesToPreview = Array.from(this.files).slice(0, maxPreviewImages);
				filesToPreview.forEach(file => {
					const reader = new FileReader();
					reader.onload = function(e) {
						const img = document.createElement('img');
						img.src = e.target.result;
						img.style.width = '80px';
						img.style.height = '80px';
						img.style.objectFit = 'cover';
						img.style.borderRadius = '8px';
						img.style.border = '1px solid #ddd';
						previewContainer.appendChild(img);
					};
					reader.readAsDataURL(file);
				});
			}
		});
		modal.querySelector('#form-edit-product').addEventListener('submit', async (e) => {
			e.preventDefault();
			const nome = modal.querySelector('#edit-nome').value.trim();
			console.log('📝 Nome capturado do formulário:', nome);
			console.log('📝 Nome original do produto:', product.nome);
			const categoria = modal.querySelector('#edit-categoria').value.trim();
			let precoStr = modal.querySelector('#edit-preco').value.trim().replace(',', '.');
			const preco = parseFloat(precoStr);
			let custoStr = modal.querySelector('#edit-custo').value.trim().replace(',', '.');
			const custo = custoStr && !isNaN(parseFloat(custoStr)) && parseFloat(custoStr) > 0 ? parseFloat(custoStr) : null;
			const estoque = parseInt(modal.querySelector('#edit-estoque').value);
			const status_produto = modal.querySelector('#edit-status').value;
			const descricao = modal.querySelector('#edit-descricao').value.trim();
			if (!nome || !categoria || isNaN(preco) || isNaN(estoque) || !status_produto) {
				alert('Preencha todos os campos obrigatórios');
				return;
			}
			// Processar fotos existentes (remover as que foram deletadas)
			let fotos = [];
			if (product.fotos) {
				try { fotos = JSON.parse(product.fotos); } catch {}
			}
			// Remover fotos que foram clicadas para deletar
			const previewContainer = modal.querySelector('#edit-fotos-preview');
			const remainingImages = previewContainer.querySelectorAll('img[data-existing="true"]');
			const allPreviewImages = previewContainer.querySelectorAll('img');
			console.log('📸 Total de imagens no preview:', allPreviewImages.length, '(existentes + novas)');
			console.log('📸 Imagens existentes mantidas:', remainingImages.length);
			fotos = Array.from(remainingImages).map(img => img.src);
			console.log('📸 Fotos existentes após remoção:', fotos.length, 'fotos');
			// Adicionar novas fotos do upload
			const fileInput = modal.querySelector('#edit-fotos-upload');
			if (fileInput.files && fileInput.files.length > 0) {
				console.log(`📸 Processando ${fileInput.files.length} novas imagens...`);
				console.log(`📸 Fotos no array antes do processamento: ${fotos.length}`);
				// Limitar número de imagens para evitar timeout (aumentado para 5)
				const maxImages = 5;
				const filesToProcess = Array.from(fileInput.files);
				const totalFotosAposProcessamento = fotos.length + filesToProcess.length;
				if (totalFotosAposProcessamento > maxImages) {
					const fotosPermitidas = maxImages - fotos.length;
					alert(`Produto já tem ${fotos.length} fotos. Apenas ${fotosPermitidas} novas imagens serão processadas (máximo total: ${maxImages}).`);
					filesToProcess.splice(fotosPermitidas);
				}
				const filesToProcessFinal = filesToProcess.slice(0, maxImages - fotos.length);
				if (fileInput.files.length > maxImages - fotos.length) {
					alert(`Apenas as primeiras ${maxImages - fotos.length} imagens serão processadas para evitar timeout.`);
				}
				for (let i = 0; i < filesToProcessFinal.length; i++) {
					const file = filesToProcessFinal[i];
					console.log(`📸 Processando imagem ${i + 1}/${filesToProcessFinal.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
					// Verificar tamanho do arquivo (máximo 10MB na entrada, será comprimido)
					if (file.size > 10 * 1024 * 1024) {
						alert(`Imagem ${file.name} é muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 10MB (será comprimida automaticamente).`);
						continue;
					}
					try {
						const base64 = await this.fileToBase64(file);
						// Comprimir base64 com limite máximo de 5MB
						const compressed = await this.compressBase64Image(base64, 5, 800); // Máximo 5MB, resolução máxima 800px
						fotos.push(compressed);
						console.log(`✅ Imagem ${i + 1} comprimida: ${(base64.length / 1024 / 1024).toFixed(2)}MB → ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
					} catch (error) {
						console.error(`❌ Erro ao processar imagem ${file.name}:`, error);
						alert(`Erro ao processar imagem ${file.name}`);
					}
				}
			}
			const productData = { nome, categoria, preco, custo, estoque, status_produto, fotos: JSON.stringify(fotos), descricao };
			console.log('📦 Dados preparados para salvar:', productData);
			console.log('🖼️ Total de fotos a salvar:', fotos.length);
			console.log('🖼️ Detalhes das fotos:', fotos.map((f, i) => `Foto ${i+1}: ${f.substring(0, 50)}... (${f.length} chars)`));
			// Verificar se há duplicatas
			const uniqueFotos = [...new Set(fotos)];
			if (uniqueFotos.length !== fotos.length) {
				console.warn('⚠️ Detectadas fotos duplicadas!', {
					original: fotos.length,
					unicas: uniqueFotos.length,
					duplicadas: fotos.length - uniqueFotos.length
				});
			}
			console.log('🆔 ID do produto sendo editado (antes do save):', id, 'tipo:', typeof id);
			console.log('🔍 ID é válido? (antes do save)', id !== null && id !== undefined && id !== '');
			const result = await this.saveToSupabase('produtos', productData, id);
			if (result) {
				console.log('✅ Produto salvo com sucesso, atualizando dados locais...');
				const idx = this.products.findIndex(p => p.id == id);
				if (idx !== -1) {
					const produtoAntes = this.products[idx];
					console.log('📦 Produto antes da atualização:', { id: produtoAntes.id, fotosCount: produtoAntes.fotos ? JSON.parse(produtoAntes.fotos).length : 0 });
					// Atualizar apenas os campos que foram modificados, mantendo a estrutura original
					this.products[idx] = { 
						...this.products[idx], 
						nome: productData.nome,
						categoria: productData.categoria,
						preco: productData.preco,
						custo: productData.custo,
						estoque: productData.estoque,
						status_produto: productData.status_produto,
						fotos: productData.fotos, // Já vem como JSON string
						descricao: productData.descricao
					};
					const produtoDepois = this.products[idx];
					console.log('📦 Produto após atualização:', { id: produtoDepois.id, fotosCount: produtoDepois.fotos ? JSON.parse(produtoDepois.fotos).length : 0 });
				}
				// REABILITADO - necessário para manter a lista atualizada
				this.renderProdutosPage();
				this.updateStats();
				console.log('✅ Interface atualizada após edição');
				alert('Produto atualizado com sucesso!');
			} else {
				alert('Erro ao atualizar produto');
			}
			closeModal('modal-edit-product');
		});
	}
	async deleteProduct(id) {
		// Verificar se o usuário é admin
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isAdmin = role === 'admin';
		if (!isAdmin) {
			alert('Acesso negado. Apenas administradores podem excluir produtos.');
			return;
		}
		const success = await this.deleteFromSupabase('produtos', id);
		if (success) {
			this.products = this.products.filter(p => p.id !== id);
			this.renderProdutosPage();
			this.updateStats();
		}
	}
	openAddProductModal() {
		// Verificar se o usuário é admin
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isAdmin = role === 'admin';
		if (!isAdmin) {
			alert('Acesso negado. Apenas administradores podem adicionar produtos.');
			return;
		}
		const modal = this.createModal('modal-add-product', '', false);
		modal.querySelector('.modal-content-wrapper').innerHTML = `
			<div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
				<span style="width: 50px; height: 50px; background: linear-gradient(135deg, #f5576c, #ff6b9d); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-cookie-bite"></i></span>
				<span style="font-size: 1.35rem; font-weight: 700; color: #333;">Novo Produto</span>
				<button onclick="closeModal('modal-add-product')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
			</div>
			<div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
			<form id="form-add-product" class="form-modal">
				<div class="form-group">
					<label for="product-nome">Nome *</label>
					<input type="text" id="product-nome" required class="form-control">
				</div>
				<div class="form-group">
					<label for="product-categoria">Categoria *</label>
					<input type="text" id="product-categoria" required class="form-control">
				</div>
				<div class="form-group">
					<label for="product-preco">Preço *</label>
					<input type="text" id="product-preco" required class="form-control" inputmode="decimal">
				</div>
				<div class="form-group">
					<label for="product-custo">Custo de Produção</label>
					<input type="text" id="product-custo" class="form-control" inputmode="decimal" placeholder="0,00">
				</div>
				<div class="form-group">
					<label for="product-estoque">Estoque *</label>
					<input type="number" id="product-estoque" required class="form-control" min="0" step="1">
				</div>
				<div class="form-group">
					<label for="product-status">Disponibilidade *</label>
					<select id="product-status" required class="form-control">
						<option value="pronta_entrega">Pronta Entrega</option>
						<option value="sob_encomenda">Sob Encomenda</option>
					</select>
				</div>
				<div class="form-group">
					<label for="product-descricao">Descrição</label>
					<textarea id="product-descricao" class="form-control" rows="2"></textarea>
				</div>
				<div class="form-group">
					<label for="product-fotos">Fotos do Produto</label>
					<div id="product-fotos-preview" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;"></div>
					<input type="file" id="product-fotos-upload" multiple accept="image/*" style="margin-bottom: 0.5rem;">
					<small style="color: #666; font-size: 0.8rem;">Selecione até 5 imagens (PNG, JPG, JPEG) - Máximo 10MB cada (serão comprimidas automaticamente para ≤5MB)</small>
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-add-product')" class="btn btn-secondary">Cancelar</button>
					<button type="submit" class="btn btn-primary">Salvar</button>
				</div>
			</form>
		`;
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
		// Preview de imagens no upload
		const fileInput = modal.querySelector('#product-fotos-upload');
		const previewContainer = modal.querySelector('#product-fotos-preview');
		fileInput.addEventListener('change', function(e) {
			previewContainer.innerHTML = '';
			if (this.files && this.files.length > 0) {
				const maxPreviewImages = 5;
				const filesToPreview = Array.from(this.files).slice(0, maxPreviewImages);
				filesToPreview.forEach(file => {
					const reader = new FileReader();
					reader.onload = function(e) {
						const img = document.createElement('img');
						img.src = e.target.result;
						img.style.width = '80px';
						img.style.height = '80px';
						img.style.objectFit = 'cover';
						img.style.borderRadius = '8px';
						img.style.border = '1px solid #ddd';
						previewContainer.appendChild(img);
					};
					reader.readAsDataURL(file);
				});
			}
		});
		modal.querySelector('#form-add-product').addEventListener('submit', async (e) => {
			e.preventDefault();
			const nome = modal.querySelector('#product-nome').value.trim();
			const categoria = modal.querySelector('#product-categoria').value.trim();
			let precoStr = modal.querySelector('#product-preco').value.trim().replace(',', '.');
			const preco = parseFloat(precoStr);
			let custoStr = modal.querySelector('#product-custo').value.trim().replace(',', '.');
			const custo = custoStr && !isNaN(parseFloat(custoStr)) && parseFloat(custoStr) > 0 ? parseFloat(custoStr) : null;
			const estoque = parseInt(modal.querySelector('#product-estoque').value);
			const status_produto = modal.querySelector('#product-status').value;
			const descricao = modal.querySelector('#product-descricao').value.trim();
			if (!nome || !categoria || isNaN(preco) || isNaN(estoque) || !status_produto) {
				alert('Preencha todos os campos obrigatórios');
				return;
			}
			// Processar fotos
			let fotos = [];
			const fileInput = modal.querySelector('#product-fotos-upload');
			if (fileInput.files && fileInput.files.length > 0) {
				console.log(`📸 Processando ${fileInput.files.length} novas imagens para novo produto...`);
				// Limitar número de imagens para evitar timeout (máximo 5)
				const maxImages = 5;
				const filesToProcess = Array.from(fileInput.files).slice(0, maxImages);
				if (fileInput.files.length > maxImages) {
					alert(`Apenas as primeiras ${maxImages} imagens serão processadas para evitar timeout.`);
				}
				for (let i = 0; i < filesToProcess.length; i++) {
					const file = filesToProcess[i];
					console.log(`📸 Processando imagem ${i + 1}/${filesToProcess.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
					// Verificar tamanho do arquivo (máximo 10MB na entrada, será comprimido)
					if (file.size > 10 * 1024 * 1024) {
						alert(`Imagem ${file.name} é muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 10MB (será comprimida automaticamente).`);
						continue;
					}
					try {
						const base64 = await this.fileToBase64(file);
						// Comprimir base64 com limite máximo de 5MB
						const compressed = await this.compressBase64Image(base64, 5, 800); // Máximo 5MB, resolução máxima 800px
						fotos.push(compressed);
						console.log(`✅ Imagem ${i + 1} comprimida: ${(base64.length / 1024 / 1024).toFixed(2)}MB → ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
					} catch (error) {
						console.error(`❌ Erro ao processar imagem ${file.name}:`, error);
						alert(`Erro ao processar imagem ${file.name}`);
					}
				}
			}
			const productData = { nome, categoria, preco, custo, estoque, status_produto, fotos: JSON.stringify(fotos), descricao };
			const result = await this.saveToSupabaseInsert('produtos', productData);
			if (result) this.products.unshift(result);
			await this.loadData();
			this.renderProdutosPage();
			closeModal('modal-add-product');
		});
	}
	prevPhoto(productId, totalPhotos) {
		const carousel = document.getElementById(`carousel-${productId}`);
		if (!carousel) return;
		const current = parseInt(carousel.dataset.current || 0);
		const prev = current === 0 ? totalPhotos - 1 : current - 1;
		carousel.style.transform = `translateX(-${prev * 100}%)`;
		carousel.dataset.current = prev;
	}
	nextPhoto(productId, totalPhotos) {
		const carousel = document.getElementById(`carousel-${productId}`);
		if (!carousel) return;
		const current = parseInt(carousel.dataset.current || 0);
		const next = (current + 1) % totalPhotos;
		carousel.style.transform = `translateX(-${next * 100}%)`;
		carousel.dataset.current = next;
	}
	// Função auxiliar para converter arquivo para base64
	fileToBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = error => reject(error);
		});
	}
	// Função para comprimir imagens base64 com limite de tamanho
	async compressBase64Image(base64, maxSizeMB = 5, maxWidth = 800) {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				try {
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					// Calcular novas dimensões mantendo proporção
					let { width, height } = img;
					if (width > maxWidth) {
						height = (height * maxWidth) / width;
						width = maxWidth;
					}
					canvas.width = width;
					canvas.height = height;
					// Desenhar a imagem no canvas
					ctx.drawImage(img, 0, 0, width, height);
					// Tentar diferentes qualidades até ficar abaixo do limite
					let quality = 0.8; // Começar com 80%
					let compressed = canvas.toDataURL('image/jpeg', quality);
					// Se ainda for muito grande, reduzir qualidade gradualmente
					while (compressed.length > maxSizeMB * 1024 * 1024 && quality > 0.1) {
						quality -= 0.1;
						compressed = canvas.toDataURL('image/jpeg', quality);
						console.log(`🔄 Reduzindo qualidade para ${quality.toFixed(1)} - tamanho: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`);
					}
					// Se ainda for muito grande, reduzir resolução
					if (compressed.length > maxSizeMB * 1024 * 1024) {
						console.log('🔄 Reduzindo resolução adicional...');
						const newMaxWidth = maxWidth * 0.7; // 70% da resolução anterior
						const newHeight = (height * newMaxWidth) / width;
						canvas.width = newMaxWidth;
						canvas.height = newHeight;
						ctx.drawImage(img, 0, 0, newMaxWidth, newHeight);
						compressed = canvas.toDataURL('image/jpeg', 0.5); // 50% qualidade
					}
					// Garantir que sempre retornamos uma imagem válida
					if (compressed && compressed.length > 100) {
						resolve(compressed);
					} else {
						console.warn('⚠️ Compressão falhou, retornando imagem original');
						resolve(base64); // Fallback para imagem original
					}
				} catch (error) {
					console.error('❌ Erro na compressão:', error);
					resolve(base64); // Fallback para imagem original
				}
			};
			img.onerror = () => {
				console.error('❌ Erro ao carregar imagem para compressão');
				resolve(base64); // Fallback para imagem original
			};
			img.src = base64;
		});
	}
	// VISUALIZAR PEDIDO
	viewOrder(id) {
		const order = this.orders.find(o => o.id == id);
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
				<p style="margin: 0; color: #333;"><strong>${order.cliente_nome || ''}</strong></p>
			</div>
			<div style="padding: 1.25rem 1rem; border-radius: 10px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; margin-top: 1rem;">
				<h4 style="margin: 0 0 1rem 0; font-size: 1.08rem;">Entrega</h4>
				<p style="margin: 0 0 0.5rem 0;">${this.formatDate(order.data_entrega)}</p>
				<p style="margin: 0 0 0.5rem 0;">${order.horario_entrega || 'Não informado'}</p>
				<p style="margin: 0;">${order.observacoes || 'Sem observações'}</p>
			</div>
			<div style="background: #28a745; padding: 1rem; border-radius: 8px; text-align: center; color: white; margin-top: 1rem;">
				<h4 style="margin: 0 0 0.3rem 0; font-size: 0.85rem; font-weight: 400; opacity: 0.9;">VALOR TOTAL</h4>
				<h2 style="margin: 0; font-size: 1.3rem;">${this.formatCurrency(order.valor_total)}</h2>
			</div>
			<div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem;">
				<button type="button" onclick="closeModal('modal-view-order')" class="btn btn-secondary" style="font-size: 0.95rem; padding: 0.5rem 1rem;">Fechar</button>
			</div>
		`;
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
	}
	async loadConfiguracoes() {
		try {
			const { data: configuracoes, error: configError } = await this.supabase
				.from('configuracoes')
				.select('*');
			if (configError) {
				console.error('❌ Erro ao carregar configurações:', configError);
				this.configuracoes = [];
			} else {
				this.configuracoes = configuracoes || [];
				console.log('✅ Configurações carregadas com sucesso:', this.configuracoes);
			}
		} catch (error) {
			console.error('Erro ao carregar configurações:', error);
			this.configuracoes = [];
		}
	}
	async refreshConfiguracoes(chaves = []) {
		if (!this.supabase) {
			return;
		}
		const keys = Array.isArray(chaves) && chaves.length > 0 ? chaves : ['horarios_entrega', 'feriados_personalizados'];
		const { data, error } = await this.supabase
			.from('configuracoes')
			.select('*')
			.in('chave', keys);
		if (error || !Array.isArray(data)) {
			if (error) {
				console.warn('Erro ao atualizar configurações em tempo real:', error);
			}
			return;
		}
		keys.forEach(chave => {
			const entry = data.find(item => item.chave === chave);
			if (!entry) {
				return;
			}
			const existingIndex = this.configuracoes.findIndex(c => c.chave === chave);
			if (existingIndex >= 0) {
				this.configuracoes[existingIndex] = entry;
			} else {
				this.configuracoes.push(entry);
			}
		});
	}
	applyConfiguracoesRealtime(payload) {
		const chave = payload?.new?.chave || payload?.old?.chave;
		if (!['horarios_entrega', 'feriados_personalizados'].includes(chave)) {
			return;
		}
		this.atualizarListaFeriados();
		const dataInput = document.getElementById('finalizar-data-entrega');
		if (dataInput && dataInput.value) {
			this.updateHorariosDisponiveis(dataInput.value);
		}
	}
	openHorariosConfigModal() {
		// Carregar configurações atuais de horários
		let horariosConfig = this.configuracoes.find(c => c.chave === 'horarios_entrega');
		// Se não existir configuração, criar uma padrão
		if (!horariosConfig) {
			horariosConfig = {
				dias_semana: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
				sabado: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
				domingo: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
				feriados: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
			};
			console.log('⚠️ Usando configuração padrão de horários');
		} else {
			horariosConfig = horariosConfig.valor;
			// Se o valor for string, fazer parse JSON
			if (typeof horariosConfig === 'string') {
				try {
					horariosConfig = JSON.parse(horariosConfig);
				} catch (e) {
					console.error('Erro ao fazer parse da configuração de horários:', e);
					horariosConfig = null;
				}
			}
			// Garantir que seja um objeto e tenha todas as propriedades
			if (!horariosConfig || typeof horariosConfig !== 'object') {
				horariosConfig = {
					dias_semana: [],
					sabado: [],
					domingo: [],
					feriados: []
				};
			} else {
				// Garantir que todas as propriedades existam
				if (!horariosConfig.dias_semana) horariosConfig.dias_semana = [];
				if (!horariosConfig.sabado) horariosConfig.sabado = [];
				if (!horariosConfig.domingo) horariosConfig.domingo = [];
				if (!horariosConfig.feriados) horariosConfig.feriados = [];
			}
		}
		const modal = this.createModal('modal-horarios-config', '🕐 Configurar Horários de Entrega', true);
		modal.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: white;
			border-radius: 12px;
			box-shadow: 0 20px 60px rgba(0,0,0,0.3);
			z-index: 1000;
			max-width: 90vw;
			max-height: 85vh;
			width: 750px;
			overflow-y: auto;
		`;
		modal.innerHTML = `
			<div style="display: flex; flex-direction: column; width: 100%;">
				<div style="padding: 0.75rem; border-bottom: 1px solid #eee; background: #f8f9fa; width: 100%; box-sizing: border-box;">
					<h4 style="margin: 0 0 0.75rem 0; color: #333; font-size: 0.9rem;">📅 ${t('feriados.selecionar_feriados')}</h4>
					<div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;">
						<input type="date" id="novo-feriado" style="padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px; background: white; font-size: 0.8rem;" placeholder="YYYY-MM-DD">
						<button onclick="window.dashboardApp.adicionarFeriado()" style="padding: 0.4rem 0.8rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">${t('feriados.adicionar')}</button>
					</div>
					<div id="lista-feriados" style="display: flex; flex-wrap: wrap; gap: 0.25rem; max-height: 80px; overflow-y: auto; padding: 0.25rem; background: white; border: 1px solid #eee; border-radius: 4px;">
						<!-- Lista de feriados será preenchida dinamicamente -->
					</div>
					<div style="margin-top: 0.5rem; font-size: 0.75rem; color: #666;">
						${t('feriados.instrucao_lista')}
					</div>
				</div>
				<div style="padding: 1rem; width: 100%; box-sizing: border-box;">
				<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
					<div>
						<h4 style="margin: 0 0 0.75rem 0; color: #333; font-size: 1rem;">📅 ${t('horarios.dias_semana')}</h4>
						<div id="dias-semana-container" style="display: grid; grid-template-columns: 1fr; gap: 0.25rem; margin-bottom: 0.5rem; max-height: 150px; overflow-y: auto;">
							${this.generateHorariosCheckboxes('dias_semana', horariosConfig.dias_semana)}
						</div>
						<div style="display: flex; gap: 0.25rem; margin-top: 0.25rem;">
							<button onclick="window.dashboardApp.selectAllHorarios('dias_semana')" style="padding: 0.2rem 0.4rem; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">${t('horarios.selecionar_todos')}</button>
							<button onclick="window.dashboardApp.deselectAllHorarios('dias_semana')" style="padding: 0.2rem 0.4rem; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">${t('horarios.desmarcar_todos')}</button>
						</div>
					</div>
					<div>
						<h4 style="margin: 0 0 0.75rem 0; color: #333; font-size: 1rem;">🎉 ${t('horarios.sabado')}</h4>
						<div id="sabado-container" style="display: grid; grid-template-columns: 1fr; gap: 0.25rem; margin-bottom: 0.5rem; max-height: 150px; overflow-y: auto;">
							${this.generateHorariosCheckboxes('sabado', horariosConfig.sabado)}
						</div>
						<div style="display: flex; gap: 0.25rem; margin-top: 0.25rem;">
							<button onclick="window.dashboardApp.selectAllHorarios('sabado')" style="padding: 0.2rem 0.4rem; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">${t('horarios.selecionar_todos')}</button>
							<button onclick="window.dashboardApp.deselectAllHorarios('sabado')" style="padding: 0.2rem 0.4rem; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">${t('horarios.desmarcar_todos')}</button>
						</div>
					</div>
					<div>
						<h4 style="margin: 0 0 0.75rem 0; color: #333; font-size: 1rem;">⛪ ${t('horarios.domingo')}</h4>
						<div id="domingo-container" style="display: grid; grid-template-columns: 1fr; gap: 0.25rem; margin-bottom: 0.5rem; max-height: 150px; overflow-y: auto;">
							${this.generateHorariosCheckboxes('domingo', horariosConfig.domingo)}
						</div>
						<div style="display: flex; gap: 0.25rem; margin-top: 0.25rem;">
							<button onclick="window.dashboardApp.selectAllHorarios('domingo')" style="padding: 0.2rem 0.4rem; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">${t('horarios.selecionar_todos')}</button>
							<button onclick="window.dashboardApp.deselectAllHorarios('domingo')" style="padding: 0.2rem 0.4rem; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">${t('horarios.desmarcar_todos')}</button>
						</div>
					</div>
					<div>
						<h4 style="margin: 0 0 0.75rem 0; color: #333; font-size: 1rem;">🏖️ ${t('horarios.feriados')}</h4>
						<div id="feriados-container" style="display: grid; grid-template-columns: 1fr; gap: 0.25rem; margin-bottom: 0.5rem; max-height: 150px; overflow-y: auto;">
							${this.generateHorariosCheckboxes('feriados', horariosConfig.feriados)}
						</div>
						<div style="display: flex; gap: 0.25rem; margin-top: 0.25rem;">
							<button onclick="window.dashboardApp.selectAllHorarios('feriados')" style="padding: 0.2rem 0.4rem; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">${t('horarios.selecionar_todos')}</button>
							<button onclick="window.dashboardApp.deselectAllHorarios('feriados')" style="padding: 0.2rem 0.4rem; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.7rem;">${t('horarios.desmarcar_todos')}</button>
						</div>
					</div>
				</div>
				<div style="display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid #eee;">
					<button onclick="closeModal('modal-horarios-config')" style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">${t('btn.cancel')}</button>
					<button onclick="window.dashboardApp.saveHorariosConfig()" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(102,126,234,0.3); font-size: 0.9rem;">${t('horarios.salvar_config')}</button>
				</div>
			</div>
		`;
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
		
		// Carregar feriados salvos
		this.atualizarListaFeriados();
	}
	generateHorariosCheckboxes(tipo, horariosSelecionados) {
		const allHorarios = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
		// Garantir que horariosSelecionados seja um array
		if (!Array.isArray(horariosSelecionados)) {
			horariosSelecionados = [];
		}
		return allHorarios.map(horario => {
			const isChecked = horariosSelecionados.includes(horario);
			const periodo = parseInt(horario.split(':')[0]) < 12 ? 'AM' : 'PM';
			return `
				<label style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem; background: ${isChecked ? '#e8f5e8' : '#f8f9fa'}; border-radius: 6px; cursor: pointer; border: 1px solid ${isChecked ? '#28a745' : '#dee2e6'};">
					<input type="checkbox" value="${horario}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px;" data-tipo="${tipo}">
					<span style="font-size: 0.9rem; font-weight: 500;">${horario} - ${periodo}</span>
				</label>
			`;
		}).join('');
	}
	selectAllHorarios(tipo) {
		const checkboxes = document.querySelectorAll(`input[data-tipo="${tipo}"]`);
		checkboxes.forEach(cb => cb.checked = true);
	}
	deselectAllHorarios(tipo) {
		const checkboxes = document.querySelectorAll(`input[data-tipo="${tipo}"]`);
		checkboxes.forEach(cb => cb.checked = false);
	}
	adicionarFeriado() {
		const input = document.getElementById('novo-feriado');
		const data = input.value;
		
		if (!data) {
			alert('Selecione uma data primeiro');
			return;
		}
		
		// Carregar feriados salvos
		let feriadosConfig = this.configuracoes.find(c => c.chave === 'feriados_personalizados');
		let feriadosSalvos = [];
		if (feriadosConfig && feriadosConfig.valor) {
			if (typeof feriadosConfig.valor === 'string') {
				try {
					feriadosSalvos = JSON.parse(feriadosConfig.valor);
				} catch (e) {
					feriadosSalvos = [];
				}
			} else {
				feriadosSalvos = feriadosConfig.valor;
			}
		}
		
		// Adicionar se não existir
		if (!feriadosSalvos.includes(data)) {
			feriadosSalvos.push(data);
			
			// Atualizar configuração local IMEDIATAMENTE
			const existingIndex = this.configuracoes.findIndex(c => c.chave === 'feriados_personalizados');
			if (existingIndex >= 0) {
				this.configuracoes[existingIndex].valor = feriadosSalvos;
			} else {
				this.configuracoes.push({ chave: 'feriados_personalizados', valor: feriadosSalvos });
			}
			
			// Salvar no Supabase
			this.supabase
				.from('configuracoes')
				.upsert({
					chave: 'feriados_personalizados',
					valor: feriadosSalvos,
					updated_at: new Date().toISOString()
				}, { onConflict: 'chave' })
				.then(async ({ error }) => {
					if (error) {
						console.error('Erro ao salvar feriados:', error);
						alert('❌ Erro ao salvar feriado. Tente novamente.');
						return;
					}
					console.log('✅ Feriado salvo com sucesso');
					
					// Recarregar configurações para garantir sincronização
					const { data: configuracoes, error: configError } = await this.supabase
						.from('configuracoes')
						.select('*');
					if (!configError && configuracoes) {
						this.configuracoes = configuracoes;
					}
					
					// Atualizar interface APÓS recarregar configurações
					const dataInput = document.getElementById('finalizar-data-entrega');
					if (dataInput && dataInput.value) {
						this.updateHorariosDisponiveis(dataInput.value);
					} else {
						// Se não há data selecionada, tentar atualizar com a data atual
						const hoje = new Date().toISOString().split('T')[0];
						if (dataInput) {
							dataInput.value = hoje;
							this.updateHorariosDisponiveis(hoje);
						}
					}
				});
			
			this.atualizarListaFeriados();
			input.value = '';
		} else {
			alert('Esta data já está na lista de feriados');
		}
	}
	removerFeriado(data) {
		let feriadosConfig = this.configuracoes.find(c => c.chave === 'feriados_personalizados');
		let feriadosSalvos = [];
		if (feriadosConfig && feriadosConfig.valor) {
			if (typeof feriadosConfig.valor === 'string') {
				try {
					feriadosSalvos = JSON.parse(feriadosConfig.valor);
				} catch (e) {
					feriadosSalvos = [];
				}
			} else {
				feriadosSalvos = feriadosConfig.valor;
			}
		}
		
		feriadosSalvos = feriadosSalvos.filter(f => f !== data);
		
		// Atualizar configuração local
		const existingIndex = this.configuracoes.findIndex(c => c.chave === 'feriados_personalizados');
		if (existingIndex >= 0) {
			if (feriadosSalvos.length === 0) {
				// Remover configuração se não há feriados
				this.configuracoes.splice(existingIndex, 1);
			} else {
				this.configuracoes[existingIndex].valor = feriadosSalvos;
			}
		} else if (feriadosSalvos.length > 0) {
			this.configuracoes.push({ chave: 'feriados_personalizados', valor: feriadosSalvos });
		}
		
		// Salvar ou remover no Supabase
		if (feriadosSalvos.length === 0) {
			// Remover configuração do banco se não há feriados
			this.supabase
				.from('configuracoes')
				.delete()
				.eq('chave', 'feriados_personalizados')
				.then(({ error }) => {
					if (error) {
						console.error('Erro ao remover configuração de feriados:', error);
						alert('❌ Erro ao remover feriado. Tente novamente.');
						return;
					}
					console.log('✅ Configuração de feriados removida com sucesso');
					
					// Recarregar configurações para garantir sincronização
					this.supabase
						.from('configuracoes')
						.select('*')
						.then(({ data: configuracoes, error: configError }) => {
							if (!configError && configuracoes) {
								this.configuracoes = configuracoes;
							}
							
							// Atualizar interface APÓS recarregar configurações
							const dataInput = document.getElementById('finalizar-data-entrega');
							if (dataInput && dataInput.value) {
								this.updateHorariosDisponiveis(dataInput.value);
							} else {
								// Se não há data selecionada, tentar atualizar com a data atual
								const hoje = new Date().toISOString().split('T')[0];
								if (dataInput) {
									dataInput.value = hoje;
									this.updateHorariosDisponiveis(hoje);
								}
							}
						});
				});
		} else {
			// Salvar configuração se há feriados
			this.supabase
				.from('configuracoes')
				.upsert({
					chave: 'feriados_personalizados',
					valor: feriadosSalvos,
					updated_at: new Date().toISOString()
				}, { onConflict: 'chave' })
				.then(({ error }) => {
					if (error) {
						console.error('Erro ao salvar feriados:', error);
						alert('❌ Erro ao remover feriado. Tente novamente.');
						return;
					}
					console.log('✅ Feriado removido com sucesso');
					
					// Recarregar configurações para garantir sincronização
					this.supabase
						.from('configuracoes')
						.select('*')
						.then(({ data: configuracoes, error: configError }) => {
							if (!configError && configuracoes) {
								this.configuracoes = configuracoes;
							}
							
							// Atualizar interface APÓS recarregar configurações
							const dataInput = document.getElementById('finalizar-data-entrega');
							if (dataInput && dataInput.value) {
								this.updateHorariosDisponiveis(dataInput.value);
							} else {
								// Se não há data selecionada, tentar atualizar com a data atual
								const hoje = new Date().toISOString().split('T')[0];
								if (dataInput) {
									dataInput.value = hoje;
									this.updateHorariosDisponiveis(hoje);
								}
							}
						});
				});
		}
		
		this.atualizarListaFeriados();
	}
	atualizarListaFeriados() {
		const container = document.getElementById('lista-feriados');
		if (!container) return;
		
		// Carregar feriados salvos
		let feriadosConfig = this.configuracoes.find(c => c.chave === 'feriados_personalizados');
		let feriadosSalvos = [];
		if (feriadosConfig && feriadosConfig.valor) {
			if (typeof feriadosConfig.valor === 'string') {
				try {
					feriadosSalvos = JSON.parse(feriadosConfig.valor);
				} catch (e) {
					feriadosSalvos = [];
				}
			} else {
				feriadosSalvos = feriadosConfig.valor;
			}
		}
		
		// Ordenar as datas
		feriadosSalvos.sort();
		
		container.innerHTML = feriadosSalvos.length === 0 
			? '<span style="color: #999; font-style: italic; font-size: 0.8rem;">Nenhum feriado cadastrado</span>'
			: feriadosSalvos.map(data => `
				<span style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0.4rem; background: #ffeaa7; border: 1px solid #d63031; border-radius: 3px; font-size: 0.75rem; color: #d63031;">
					${data}
					<button onclick="window.dashboardApp.removerFeriado('${data}')" style="background: none; border: none; color: #d63031; cursor: pointer; font-size: 0.8rem; padding: 0; margin-left: 0.25rem;">×</button>
				</span>
			`).join('');
	}
	async updateHorariosDisponiveis(dataSelecionada) {
		console.log('🔄 updateHorariosDisponiveis chamada com:', dataSelecionada);
		const select = document.getElementById('finalizar-horario-entrega');
		console.log('📋 Select encontrado:', !!select);
		if (!select) return;
		while (select.options.length > 1) {
			select.remove(1);
		}
		if (!dataSelecionada) {
			console.log('⚠️ Nenhuma data selecionada');
			return;
		}
		await this.refreshConfiguracoes(['horarios_entrega', 'feriados_personalizados']);
		const data = new Date(dataSelecionada + 'T12:00:00'); // Forçar meio-dia para evitar problemas de timezone
		const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
		
		// Carregar feriados personalizados
		let feriadosConfig = this.configuracoes.find(c => c.chave === 'feriados_personalizados');
		let feriadosPersonalizados = [];
		if (feriadosConfig && feriadosConfig.valor) {
			if (typeof feriadosConfig.valor === 'string') {
				try {
					feriadosPersonalizados = JSON.parse(feriadosConfig.valor);
				} catch (e) {
					feriadosPersonalizados = [];
				}
			} else {
				feriadosPersonalizados = feriadosConfig.valor;
			}
		}
		
		const dataString = dataSelecionada;
		const isFeriado = feriadosPersonalizados.includes(dataString);
		
		let tipoDia = 'dias_semana';
		if (isFeriado) {
			tipoDia = 'feriados';
		} else if (diaSemana === 0) {
			tipoDia = 'domingo'; // Domingo
		} else if (diaSemana === 6) {
			tipoDia = 'sabado'; // Sábado
		} else {
			tipoDia = 'dias_semana'; // Dias de semana (segunda a sexta)
		}
		
		console.log('📅 Data:', dataSelecionada, 'Dia da semana:', diaSemana, 'Tipo de dia:', tipoDia, 'Feriado:', isFeriado);
		// Carregar configuração de horários
		let horariosConfig = this.configuracoes.find(c => c.chave === 'horarios_entrega');
		console.log('⚙️ Configuração encontrada:', horariosConfig);
		let horariosDisponiveis = [];
		if (horariosConfig && horariosConfig.valor) {
			let configValue = horariosConfig.valor;
			// Se o valor for string, tentar parsear como JSON
			if (typeof configValue === 'string') {
				try {
					configValue = JSON.parse(configValue);
					console.log('📄 Valor parseado como JSON:', configValue);
				} catch (e) {
					console.error('❌ Erro ao parsear configuração JSON:', e);
					configValue = null;
				}
			}
			if (configValue && configValue.dias_semana && configValue.sabado && configValue.domingo && configValue.feriados) {
				horariosDisponiveis = configValue[tipoDia];
				console.log('✅ Usando configuração salva:', horariosDisponiveis);
			} else {
				console.log('⚠️ Configuração encontrada mas formato inválido');
			}
		}
		// Fallback para horários padrão se não conseguiu carregar configuração válida
		if (horariosDisponiveis.length === 0) {
			const fallbacks = {
				dias_semana: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
				sabado: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
				domingo: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
				feriados: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
			};
			horariosDisponiveis = fallbacks[tipoDia] || fallbacks.dias_semana;
			console.log('⚠️ Usando fallback - configuração não encontrada ou inválida:', horariosDisponiveis);
		}
		// Filtrar horários passados se for hoje
		const hoje = new Date().toISOString().split('T')[0];
		if (dataSelecionada === hoje) {
			const agora = new Date();
			const horaAtual = agora.getHours() * 100 + agora.getMinutes();
			horariosDisponiveis = horariosDisponiveis.filter(h => {
				const [hora, min] = h.split(':').map(Number);
				const horaHorario = hora * 100 + min;
				return horaHorario > horaAtual;
			});
			console.log('⏰ Filtrados horários passados para hoje:', horariosDisponiveis);
		}
		// Adicionar opções, mas filtrar horários já agendados
		const horariosFiltrados = [];
		for (const horario of horariosDisponiveis) {
			// Verificar se já existe entrega agendada para esta data e horário
			const { data: entregasExistentes, error } = await this.supabase
				.from('entregas')
				.select('id')
				.eq('data_entrega', dataSelecionada)
				.eq('hora_entrega', horario)
				.eq('status', 'agendada'); // Apenas agendadas contam como ocupadas
			if (error) {
				console.error('Erro ao verificar entregas existentes:', error);
				// Em caso de erro, assumir disponível
				horariosFiltrados.push(horario);
			} else if (!entregasExistentes || entregasExistentes.length < 3) {
				// Horário disponível (até 3 entregas permitidas)
				horariosFiltrados.push(horario);
			} else {
				console.log(`⏰ Horário ${horario} já ocupado (3+ entregas) para ${dataSelecionada}`);
			}
		}
		// Adicionar opções disponíveis
		horariosFiltrados.forEach(horario => {
			const option = document.createElement('option');
			option.value = horario;
			const periodo = parseInt(horario.split(':')[0]) < 12 ? 'AM' : 'PM';
			option.textContent = `${horario} - ${periodo}`;
			select.appendChild(option);
		});
		// Verificar se há horários disponíveis
		if (horariosFiltrados.length === 0) {
			// Nenhum horário disponível, mostrar aviso
			const option = document.createElement('option');
			option.value = '';
			option.textContent = 'Nenhum horário disponível para esta data';
			option.disabled = true;
			select.appendChild(option);
			alert('⚠️ Nenhum horário disponível para a data selecionada. Escolha outra data.');
			// Resetar para amanhã
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			document.getElementById('finalizar-data-entrega').value = tomorrow.toISOString().split('T')[0];
			// Recarregar horários para amanhã
			this.updateHorariosDisponiveis(tomorrow.toISOString().split('T')[0]);
		}
		console.log('✅ Opções adicionadas, total:', select.options.length);
	}
	async saveHorariosConfig() {
		try {
			// Coletar horários selecionados
			const diasSemanaCheckboxes = document.querySelectorAll('input[data-tipo="dias_semana"]:checked');
			const sabadoCheckboxes = document.querySelectorAll('input[data-tipo="sabado"]:checked');
			const domingoCheckboxes = document.querySelectorAll('input[data-tipo="domingo"]:checked');
			const feriadosCheckboxes = document.querySelectorAll('input[data-tipo="feriados"]:checked');
			
			const dias_semana = Array.from(diasSemanaCheckboxes).map(cb => cb.value);
			const sabado = Array.from(sabadoCheckboxes).map(cb => cb.value);
			const domingo = Array.from(domingoCheckboxes).map(cb => cb.value);
			const feriados = Array.from(feriadosCheckboxes).map(cb => cb.value);
			
			// Verificar se pelo menos um horário foi selecionado para cada tipo
			if (dias_semana.length === 0 || sabado.length === 0 || domingo.length === 0 || feriados.length === 0) {
				alert(`⚠️ ${t('horarios.erro_minimo')}`);
				return;
			}
			
			// Salvar no Supabase
			const { data, error } = await this.supabase
				.from('configuracoes')
				.upsert({
					chave: 'horarios_entrega',
					valor: { dias_semana, sabado, domingo, feriados },
					updated_at: new Date().toISOString()
				}, { onConflict: 'chave' });
				
			if (error) {
				console.error('Erro ao salvar configuração de horários:', error);
				alert('❌ Erro ao salvar configuração. Tente novamente.');
				return;
			}
			
			// Atualizar configurações locais
			const existingIndex = this.configuracoes.findIndex(c => c.chave === 'horarios_entrega');
			if (existingIndex >= 0) {
				this.configuracoes[existingIndex] = { chave: 'horarios_entrega', valor: { dias_semana, sabado, domingo, feriados } };
			} else {
				this.configuracoes.push({ chave: 'horarios_entrega', valor: { dias_semana, sabado, domingo, feriados } });
			}
			
			// Salvar feriados personalizados
			let feriadosConfig = this.configuracoes.find(c => c.chave === 'feriados_personalizados');
			let feriadosPersonalizados = [];
			if (feriadosConfig && feriadosConfig.valor) {
				if (typeof feriadosConfig.valor === 'string') {
					try {
						feriadosPersonalizados = JSON.parse(feriadosConfig.valor);
					} catch (e) {
						feriadosPersonalizados = [];
					}
				} else {
					feriadosPersonalizados = feriadosConfig.valor;
				}
			}
			
			const { data: feriadosData, error: feriadosError } = await this.supabase
				.from('configuracoes')
				.upsert({
					chave: 'feriados_personalizados',
					valor: feriadosPersonalizados,
					updated_at: new Date().toISOString()
				}, { onConflict: 'chave' });
				
			if (feriadosError) {
				console.error('Erro ao salvar feriados personalizados:', feriadosError);
				alert('❌ Erro ao salvar feriados personalizados. Tente novamente.');
				return;
			}
			
			alert(`✅ ${t('horarios.sucesso')}`);
			closeModal('modal-horarios-config');
			
			// Atualizar interface de horários se houver data selecionada
			const dataInput = document.getElementById('finalizar-data-entrega');
			if (dataInput && dataInput.value) {
				this.updateHorariosDisponiveis(dataInput.value);
			}
			
			// Opcional: recarregar a página de entregas para refletir mudanças
			this.renderEntregasPage();
		} catch (error) {
			console.error('Erro ao salvar horários:', error);
			alert('❌ Erro inesperado. Tente novamente.');
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
	async saveToSupabase(table, data, id = null) {
		if (!this.supabase) return null;
		try {
			if (id !== null && id !== undefined) {
				const { error } = await this.supabase
					.from(table)
					.update(data)
					.eq('id', id);
				if (error) {
					console.error('❌ Erro no UPDATE:', error);
					throw error;
				}
				console.log(`✅ UPDATE realizado com sucesso na tabela ${table}`);
				return true;
			} else {
				const { error } = await this.supabase
					.from(table)
					.insert([data]);
				if (error) {
					console.error('❌ Erro no INSERT:', error);
					throw error;
				}
				console.log(`✅ INSERT realizado com sucesso na tabela ${table}`);
				return true;
			}
		} catch (error) {
			console.error('💥 Erro geral ao salvar:', error);
			alert('Erro ao salvar no banco: ' + (error?.message || error));
			return null;
		}
	}
	async editUser(userId) {
		try {
			const { data: user, error } = await this.supabase
				.from('usuarios')
				.select('*')
				.eq('id', userId)
				.single();
			if (error) throw error;
			this.showEditUserModal(user);
		} catch (error) {
			console.error('Erro ao carregar usuário:', error);
			alert('Erro ao carregar dados do usuário.');
		}
	}
	showEditUserModal(user = null) {
		// Verificar se já existe um modal aberto e removê-lo
		const existingModal = document.getElementById('modal-edit-user');
		if (existingModal) {
			existingModal.remove();
		}
		const targetUser = user || this.currentUser;
		const isOwnProfile = !user || user.id === this.currentUser.id;
		const modal = this.createModal('modal-edit-user', `👤 ${isOwnProfile ? 'Editar Perfil' : 'Editar Usuário'}`);
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.4)',
			zIndex: '2000'
		});
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; max-height: 90vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #333;">👤 ${isOwnProfile ? 'Editar Perfil' : 'Editar Usuário'}</h3>
					<button onclick="closeModal('modal-edit-user')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<form id="form-edit-user" style="display: flex; flex-direction: column; gap: 1.2rem;">
					<div style="text-align: center; margin-bottom: 1rem;">
						<div style="position: relative; display: inline-block;">
							<img id="edit-user-avatar" src="${targetUser.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.nome)}&background=ff6b9d&color=fff&size=80`}" 
								 style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #ff6b9d; margin-bottom: 0.5rem; object-fit: cover; cursor: pointer; transition: opacity 0.2s;">
							<div id="avatar-overlay" style="position: absolute; top: 0; left: 0; width: 80px; height: 80px; border-radius: 50%; background: rgba(0,0,0,0.6); display: ${targetUser.foto_url ? 'flex' : 'none'}; align-items: center; justify-content: center; color: white; font-size: 0.8rem; cursor: pointer; opacity: 0; transition: opacity 0.2s;">
								<i class="fas fa-camera"></i>
							</div>
							${!targetUser.foto_url ? `
							<div style="position: absolute; bottom: 5px; right: 5px; background: #ff6b9d; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer;" onclick="document.getElementById('edit-user-foto-file').click()">
								<i class="fas fa-plus"></i>
							</div>
							` : ''}
						</div>
						<p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666;">Foto de perfil</p>
						<button type="button" onclick="document.getElementById('edit-user-foto-file').click()" style="background: none; border: none; color: #ff6b9d; text-decoration: underline; cursor: pointer; font-size: 0.9rem;">
							${targetUser.foto_url ? 'Alterar foto' : 'Adicionar foto'}
						</button>
						<input type="file" id="edit-user-foto-file" accept="image/*" style="display: none;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Nome Completo</label>
						<input type="text" id="edit-user-nome" value="${targetUser.nome}" required 
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Email</label>
						<input type="email" id="edit-user-email" value="${targetUser.email}" required 
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Telefone</label>
						<input type="tel" id="edit-user-telefone" value="${targetUser.telefone || ''}" 
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Endereço</label>
						<textarea id="edit-user-endereco" rows="3" placeholder="Digite seu endereço completo"
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box; resize: vertical;">${targetUser.endereco || ''}</textarea>
					</div>
					<div style="border-top: 1px solid #eee; padding-top: 1rem; margin-top: 0.5rem;">
						<h4 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem;">🔒 Alterar Senha</h4>
						<div style="margin-bottom: 1rem;">
							<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Nova Senha</label>
							<input type="password" id="edit-user-nova-senha" placeholder="Digite a nova senha (mínimo 6 caracteres)"
								   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
						</div>
					</div>
					<div style="display: flex; gap: 1rem; margin-top: 1rem;">
						<button type="submit" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							💾 Salvar Alterações
						</button>
						<button type="button" onclick="closeModal('modal-edit-user')" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							Cancelar
						</button>
					</div>
				</form>
			</div>
		`;
		// Eventos do formulário
		const form = modal.querySelector('#form-edit-user');
		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				await this.saveUserProfile(targetUser);
			});
		}
		// Eventos da foto/avatar
		const avatarImg = modal.querySelector('#edit-user-avatar');
		const avatarOverlay = modal.querySelector('#avatar-overlay');
		const fotoFileInput = modal.querySelector('#edit-user-foto-file');
		if (avatarImg && fotoFileInput) {
			// Atualizar preview quando arquivo selecionado
			fotoFileInput.addEventListener('change', (e) => {
				const file = e.target.files[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = (e) => {
						avatarImg.src = e.target.result;
						if (avatarOverlay) avatarOverlay.style.display = 'flex';
					};
					reader.readAsDataURL(file);
				}
			});
		}
	}
	async saveUserProfile(targetUser = null) {
		const user = targetUser || this.currentUser;
		const isOwnProfile = !targetUser || targetUser.id === this.currentUser.id;
		const nome = document.getElementById('edit-user-nome').value.trim();
		const email = document.getElementById('edit-user-email').value.trim();
		const telefone = document.getElementById('edit-user-telefone').value.trim();
		const endereco = document.getElementById('edit-user-endereco').value.trim();
		const fotoFile = document.getElementById('edit-user-foto-file')?.files[0];
		// Campo de senha
		const novaSenha = document.getElementById('edit-user-nova-senha').value;
		if (!nome || !email) {
			alert('Nome e email são obrigatórios!');
			return;
		}
		// Validação de senha se foi preenchida
		if (novaSenha && novaSenha.length < 6) {
			alert('A nova senha deve ter pelo menos 6 caracteres!');
			return;
		}
		try {
			let fotoUrl = user.foto_url;
			// Se uma nova foto foi selecionada, fazer upload
			if (fotoFile) {
				// Validar arquivo
				if (fotoFile.size > 5 * 1024 * 1024) { // 5MB
					throw new Error('A imagem deve ter no máximo 5MB');
				}
				const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
				if (!allowedTypes.includes(fotoFile.type)) {
					throw new Error('Formato de imagem não suportado. Use JPEG, PNG, GIF ou WebP');
				}
				try {
					// Verificar buckets disponíveis (priorizando os que já existem)
					const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
					if (listError) {
						console.warn('Não foi possível listar buckets, usando fallback base64:', listError.message);
						// Fallback direto para base64
						const reader = new FileReader();
						fotoUrl = await new Promise((resolve, reject) => {
							reader.onload = () => resolve(reader.result);
							reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
							reader.readAsDataURL(fotoFile);
						});
					} else {
						// Priorizar buckets conhecidos que podem já existir
						const preferredBuckets = ['user-photos', 'uploads', 'fotos-perfil'];
						let bucketToUse = null;
						for (const bucketName of preferredBuckets) {
							if (buckets.some(bucket => bucket.name === bucketName)) {
								bucketToUse = bucketName;
								console.log(`✅ Usando bucket existente: ${bucketName}`);
								break;
							}
						}
						if (!bucketToUse) {
							console.warn('Nenhum bucket conhecido encontrado, usando fallback base64');
							// Fallback para base64 se nenhum bucket conhecido existir
							const reader = new FileReader();
							fotoUrl = await new Promise((resolve, reject) => {
								reader.onload = () => resolve(reader.result);
								reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
								reader.readAsDataURL(fotoFile);
							});
						} else {
							// Bucket existe, tentar upload
							const fileExt = fotoFile.name.split('.').pop();
							const fileName = `${user.id}_${Date.now()}.${fileExt}`;
							const { data: uploadData, error: uploadError } = await this.supabase.storage
								.from(bucketToUse)
								.upload(fileName, fotoFile, {
									cacheControl: '3600',
									upsert: false
								});
							if (uploadError) {
								console.warn(`Upload falhou no bucket ${bucketToUse}, usando fallback base64:`, uploadError.message);
								// Fallback para base64 se upload falhar
								const reader = new FileReader();
								fotoUrl = await new Promise((resolve, reject) => {
									reader.onload = () => resolve(reader.result);
									reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
									reader.readAsDataURL(fotoFile);
								});
							} else {
								const { data: { publicUrl } } = this.supabase.storage
									.from(bucketToUse)
									.getPublicUrl(fileName);
								fotoUrl = publicUrl;
								console.log(`Upload realizado com sucesso no bucket ${bucketToUse}:`, fotoUrl);
							}
						}
					}
				} catch (uploadError) {
					console.error('Erro completo no upload:', uploadError);
					// Fallback final para base64
					try {
						const reader = new FileReader();
						fotoUrl = await new Promise((resolve, reject) => {
							reader.onload = () => resolve(reader.result);
							reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
							reader.readAsDataURL(fotoFile);
						});
						console.log('Usando fallback base64 devido a erro no upload');
					} catch (fallbackError) {
						console.error('Erro no fallback base64:', fallbackError);
						alert(`Erro ao processar a foto: ${fallbackError.message}`);
						throw fallbackError;
					}
				}
			}			// Salvar dados do usuário no banco (independente do upload da foto)
			const updateData = {
				nome,
				email,
				telefone: telefone || null,
				endereco: endereco || null,
				foto_url: fotoUrl,
				updated_at: new Date().toISOString()
			};
			// Se uma nova senha foi definida, incluir no update
			if (novaSenha) {
				updateData.password_hash = btoa(novaSenha);
			}
			const { data, error } = await this.supabase
				.from('usuarios')
				.update(updateData)
				.eq('id', user.id);
			if (error) throw error;
			console.log('Dados salvos no banco. Foto URL:', fotoUrl ? (fotoUrl.length > 50 ? fotoUrl.substring(0, 50) + '...' : fotoUrl) : 'null');
			// Se editou o próprio perfil, atualizar dados locais e interface
			if (isOwnProfile) {
				const updatedUser = { ...this.currentUser, nome, email, telefone, endereco, foto_url: fotoUrl };
				// Se a senha foi alterada, incluir no objeto local
				if (novaSenha) {
					updatedUser.senha = btoa(novaSenha);
				}
				this.currentUser = updatedUser;
				// Atualizar interface do usuário
				const userNameEl = document.getElementById('dropdown-user-name');
				const userAvatarEl = document.getElementById('user-avatar');
				const welcomeName = document.getElementById('welcome-name');
				if (userNameEl) userNameEl.textContent = this.currentUser.nome;
				if (userAvatarEl) {
					userAvatarEl.src = this.currentUser.foto_url || 
						`https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.nome)}&background=ff6b9d&color=fff&size=32`;
				}
				if (welcomeName) welcomeName.textContent = this.currentUser.nome;
			}
			// Verificar se os dados foram realmente salvos consultando o banco
			const { data: verifyData, error: verifyError } = await this.supabase
				.from('usuarios')
				.select('nome, email, foto_url')
				.eq('id', user.id)
				.single();
			if (verifyError) {
				console.warn('Não foi possível verificar os dados salvos:', verifyError.message);
			} else {
				console.log('✅ Verificação: Dados salvos corretamente no banco:', verifyData);
				if (verifyData.foto_url !== fotoUrl) {
					console.warn('⚠️ Aviso: URL da foto no banco difere da esperada');
				}
			}
			alert(`${isOwnProfile ? 'Perfil' : 'Usuário'} atualizado com sucesso!${novaSenha ? ' Sua senha foi alterada.' : ''}`);
			closeModal('modal-edit-user');
			// Limpar campo de senha se foi preenchido
			if (novaSenha) {
				document.getElementById('edit-user-nova-senha').value = '';
			}
			// Recarregar tabela de usuários se estiver aberta
			const usuariosModal = document.getElementById('modal-usuarios');
			if (usuariosModal) {
				this.loadUsuariosTable(usuariosModal);
			}
		} catch (error) {
			console.error('Erro completo ao salvar perfil:', error);
			console.error('Stack trace:', error.stack);
			alert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
		}
	}
	showUsuariosModal() {
		// Verificar se o usuário é admin
		const role = (this.currentUser?.role || this.currentUser?.tipo || '').toLowerCase();
		const isAdmin = role === 'admin';
		if (!isAdmin) {
			alert('Acesso negado. Apenas administradores podem gerenciar usuários.');
			return;
		}
		// Verificar se já existe um modal aberto e removê-lo
		const existingModal = document.getElementById('modal-usuarios');
		if (existingModal) {
			existingModal.remove();
		}
		const modal = this.createModal('modal-usuarios', '👥 Gerenciar Usuários');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.4)',
			zIndex: '2000'
		});
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		// Carregar usuários
		this.loadUsuariosTable(modal);
	}
	showAddUserModal() {
		console.log('🔧 showAddUserModal: Iniciando criação do modal');
		// Verificar se há modais abertos e fechar o modal de usuários se existir
		const usuariosModal = document.getElementById('modal-usuarios');
		if (usuariosModal) {
			console.log('🧹 Fechando modal de usuários antes de abrir modal de adicionar');
			usuariosModal.remove();
		}
		// Verificar se já existe um modal aberto
		const existingModal = document.getElementById('modal-add-user');
		if (existingModal) {
			console.log('🧹 Removendo modal existente');
			existingModal.remove();
		}
		// Criar modal usando createModal se disponível, senão criar diretamente
		let modal;
		if (this.createModal) {
			modal = this.createModal('modal-add-user', '➕ Adicionar Usuário');
			modal.classList.add('show');
			// IMPORTANTE: Adicionar o modal ao container quando usar createModal
			let modalsContainer = document.getElementById('modals-container');
			if (!modalsContainer) {
				modalsContainer = document.createElement('div');
				modalsContainer.id = 'modals-container';
				document.body.appendChild(modalsContainer);
			}
			modalsContainer.appendChild(modal);
		} else {
			// Fallback: criar modal diretamente
			modal = document.createElement('div');
			modal.id = 'modal-add-user';
			modal.className = 'modal-overlay show';
			modal.onclick = closeModalOverlay;
			Object.assign(modal.style, {
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				position: 'fixed',
				top: '0',
				left: '0',
				width: '100vw',
				height: '100vh',
				background: 'rgba(0,0,0,0.4)',
				zIndex: '2000'
			});
			let modalsContainer = document.getElementById('modals-container');
			if (!modalsContainer) {
				modalsContainer = document.createElement('div');
				modalsContainer.id = 'modals-container';
				document.body.appendChild(modalsContainer);
			}
			modalsContainer.appendChild(modal);
		}
		console.log('✅ Modal criado, verificando DOM...');
		console.log('Modal no DOM:', document.getElementById('modal-add-user'));
		console.log('Modal style.display:', modal.style.display);
		console.log('Modal className:', modal.className);
		console.log('Modals container exists:', !!document.getElementById('modals-container'));
		console.log('Body children count:', document.body.children.length);
		console.log('All modals in DOM:', Array.from(document.querySelectorAll('[id^="modal-"]')).map(m => m.id));
		// Verificar se há modais sobrepostos
		const allModals = document.querySelectorAll('.modal-overlay');
		console.log('All modal overlays:', allModals.length);
		allModals.forEach((m, i) => {
			console.log(`Modal ${i}: id=${m.id}, class=${m.className}, display=${m.style.display}`);
		});
		// Verificar imediatamente se o modal ainda existe
		setTimeout(() => {
			const modalStillExists = document.getElementById('modal-add-user');
			console.log('⚠️ Modal ainda existe após 1ms:', !!modalStillExists);
			if (!modalStillExists) {
				console.log('❌ Modal foi removido! Verificando possíveis causas...');
				// Verificar se há event listeners que podem estar removendo o modal
				console.log('Event listeners no body:', window.getEventListeners?.(document.body) || 'N/A');
			}
		}, 1);
		// Definir conteúdo HTML
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18);">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #333;">👤 Adicionar Novo Usuário</h3>
					<button onclick="closeModal('modal-add-user')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<form id="form-add-user" style="display: flex; flex-direction: column; gap: 1.2rem;">
					<div style="text-align: center; margin-bottom: 1rem;">
						<div style="position: relative; display: inline-block;">
							<img id="add-user-avatar" src="https://ui-avatars.com/api/?name=Novo%20Usuário&background=ff6b9d&color=fff&size=80"
								 style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #ff6b9d; margin-bottom: 0.5rem;">
							<div style="position: absolute; bottom: 5px; right: 5px; background: #ff6b9d; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer;" onclick="document.getElementById('add-user-foto-file').click()">
								<i class="fas fa-plus"></i>
							</div>
						</div>
						<p style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #666;">Foto de perfil</p>
						<div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
							<label for="add-user-foto-file" style="background: #ff6b9d; color: white; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500;">
								📁 Escolher arquivo
							</label>
							<input type="file" id="add-user-foto-file" accept="image/*" style="display: none;">
							<span id="file-name-display" style="font-size: 0.8rem; color: #666;">Nenhum arquivo selecionado</span>
						</div>
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Nome Completo *</label>
						<input type="text" id="add-user-nome" placeholder="Digite o nome completo" required
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Email *</label>
						<input type="email" id="add-user-email" placeholder="Digite o email" required
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Telefone</label>
						<input type="tel" id="add-user-telefone" placeholder="Digite o telefone"
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Endereço</label>
						<input type="text" id="add-user-endereco" placeholder="Digite o endereço"
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Senha *</label>
						<input type="password" id="add-user-senha" placeholder="Digite a senha" required
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div style="display: flex; gap: 1rem; margin-top: 1rem;">
						<button type="submit" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							👤 Criar Usuário
						</button>
						<button type="button" onclick="closeModal('modal-add-user')" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							Cancelar
						</button>
					</div>
				</form>
			</div>
		`;
		console.log('📄 innerHTML definido');
		// Forçar exibição do modal
		modal.style.display = 'flex';
		modal.style.visibility = 'visible';
		modal.style.opacity = '1';
		console.log('👁️ Modal forçado a ser visível');
		console.log('Modal final style:', {
			display: modal.style.display,
			visibility: modal.style.visibility,
			opacity: modal.style.opacity,
			zIndex: modal.style.zIndex,
			position: modal.style.position
		});
		// Verificar novamente se o modal está no DOM após forçar visibilidade
		const modalAfterForce = document.getElementById('modal-add-user');
		console.log('🔍 Modal após forçar visibilidade:', !!modalAfterForce);
		if (modalAfterForce) {
			console.log('Modal parent:', modalAfterForce.parentElement?.id || 'no parent');
			console.log('Modal position in parent:', Array.from(modalAfterForce.parentElement?.children || []).indexOf(modalAfterForce));
		}
		// Aguardar um pouco para garantir que o DOM seja processado
		setTimeout(() => {
			console.log('⏳ Configurando event listeners');
			// Configurar event listeners
			const form = modal.querySelector('#form-add-user');
			const avatarImg = modal.querySelector('#add-user-avatar');
			const fotoFileInput = modal.querySelector('#add-user-foto-file');
			const fileNameDisplay = modal.querySelector('#file-name-display');
			console.log('🔍 Elementos encontrados:', {
				form: !!form,
				avatarImg: !!avatarImg,
				fotoFileInput: !!fotoFileInput,
				fileNameDisplay: !!fileNameDisplay
			});
			if (form) {
				form.addEventListener('submit', async (e) => {
					e.preventDefault();
					console.log('📝 Formulário submetido');
					await this.saveNewUser();
				});
			}
			if (avatarImg && fotoFileInput) {
				console.log('✅ Configurando event listener do arquivo');
				fotoFileInput.addEventListener('change', (e) => {
					console.log('📁 Arquivo selecionado:', e.target.files[0]?.name);
					const file = e.target.files[0];
					if (file && fileNameDisplay) {
						const fileName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
						fileNameDisplay.textContent = `Arquivo: ${fileName}`;
						fileNameDisplay.style.color = '#28a745';
						const reader = new FileReader();
						reader.onload = (e) => {
							avatarImg.src = e.target.result;
							console.log('🖼️ Preview da imagem atualizado');
						};
						reader.readAsDataURL(file);
					}
				});
			} else {
				console.error('❌ Elementos necessários não encontrados');
			}
		}, 100);
	}	async saveNewUser() {
		const nome = document.getElementById('add-user-nome').value.trim();
		const email = document.getElementById('add-user-email').value.trim();
		const senha = document.getElementById('add-user-senha').value;
		const telefone = document.getElementById('add-user-telefone').value.trim();
		const endereco = document.getElementById('add-user-endereco').value.trim();
		const role = document.getElementById('add-user-role').value;
		const fotoFile = document.getElementById('add-user-foto-file')?.files[0];
		if (!nome || !email || !senha) {
			alert('Nome, email e senha são obrigatórios!');
			return;
		}
		try {
			let fotoUrl = null;
			// Se uma foto foi selecionada, fazer upload
			if (fotoFile) {
				// Validar arquivo
				if (fotoFile.size > 5 * 1024 * 1024) { // 5MB
					throw new Error('A imagem deve ter no máximo 5MB');
				}
				const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
				if (!allowedTypes.includes(fotoFile.type)) {
					throw new Error('Formato de imagem não suportado. Use JPEG, PNG, GIF ou WebP');
				}
				try {
					// Verificar buckets disponíveis (priorizando os que já existem)
					const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
					if (listError) {
						console.warn('Não foi possível listar buckets, usando fallback base64:', listError.message);
						// Fallback direto para base64
						const reader = new FileReader();
						fotoUrl = await new Promise((resolve, reject) => {
							reader.onload = () => resolve(reader.result);
							reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
							reader.readAsDataURL(fotoFile);
						});
					} else {
						// Priorizar buckets conhecidos que podem já existir
						const preferredBuckets = ['user-photos', 'uploads', 'fotos-perfil'];
						let bucketToUse = null;
						for (const bucketName of preferredBuckets) {
							if (buckets.some(bucket => bucket.name === bucketName)) {
								bucketToUse = bucketName;
								console.log(`✅ Usando bucket existente: ${bucketName}`);
								break;
							}
						}
						if (!bucketToUse) {
							console.warn('Nenhum bucket conhecido encontrado, usando fallback base64');
							// Fallback para base64 se nenhum bucket conhecido existir
							const reader = new FileReader();
							fotoUrl = await new Promise((resolve, reject) => {
								reader.onload = () => resolve(reader.result);
								reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
								reader.readAsDataURL(fotoFile);
							});
						} else {
							// Bucket existe, tentar upload
							const fileExt = fotoFile.name.split('.').pop();
							const fileName = `new_user_${Date.now()}.${fileExt}`;
							const { data: uploadData, error: uploadError } = await this.supabase.storage
								.from(bucketToUse)
								.upload(fileName, fotoFile, {
									cacheControl: '3600',
									upsert: false
								});
							if (uploadError) {
								console.warn(`Upload falhou no bucket ${bucketToUse}, usando fallback base64:`, uploadError.message);
								// Fallback para base64 se upload falhar
								const reader = new FileReader();
								fotoUrl = await new Promise((resolve, reject) => {
									reader.onload = () => resolve(reader.result);
									reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
									reader.readAsDataURL(fotoFile);
								});
							} else {
								const { data: { publicUrl } } = this.supabase.storage
									.from(bucketToUse)
									.getPublicUrl(fileName);
								fotoUrl = publicUrl;
								console.log(`Upload realizado com sucesso no bucket ${bucketToUse}:`, fotoUrl);
							}
						}
					}
				} catch (uploadError) {
					console.error('Erro completo no upload:', uploadError);
					// Fallback final para base64
					try {
						const reader = new FileReader();
						fotoUrl = await new Promise((resolve, reject) => {
							reader.onload = () => resolve(reader.result);
							reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
							reader.readAsDataURL(fotoFile);
						});
						console.log('Usando fallback base64 devido a erro no upload');
					} catch (fallbackError) {
						console.error('Erro no fallback base64:', fallbackError);
						alert(`Erro ao processar a foto: ${fallbackError.message}`);
						throw fallbackError;
					}
				}
			}
			// Criar o usuário no banco
			const { data, error } = await this.supabase.auth.signUp({
				email: email,
				password: senha,
				options: {
					data: {
						nome: nome,
						telefone: telefone || null,
						endereco: endereco || null,
						foto_url: fotoUrl,
						role: role
					}
				}
			});
			if (error) throw error;
			console.log('Novo usuário criado:', data);
			alert('Usuário criado com sucesso!');
			closeModal('modal-add-user');
			// Recarregar tabela de usuários se estiver aberta
			const usuariosModal = document.getElementById('modal-usuarios');
			if (usuariosModal) {
				this.loadUsuariosTable(usuariosModal);
			}
		} catch (error) {
			console.error('Erro completo ao criar usuário:', error);
			console.error('Stack trace:', error.stack);
			alert(`Erro ao criar usuário: ${error.message || 'Erro desconhecido'}`);
		}
	}
	async loadUsuariosTable(modal) {
		try {
			const { data: usuarios, error } = await this.supabase
				.from('usuarios')
				.select('*')
				.order('nome');
			if (error) throw error;
			const usuariosHtml = usuarios.map(user => `
				<tr style="border-bottom: 1px solid #eee;">
					<td style="padding: 0.75rem; text-align: center;">
						<img src="${user.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=ff6b9d&color=fff&size=32`}" 
							 style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #ff6b9d;">
					</td>
					<td style="padding: 0.75rem; font-weight: 600; color: #333;">${user.nome}</td>
					<td style="padding: 0.75rem; color: #666;">${user.email}</td>
					<td style="padding: 0.75rem; color: #666;">${user.telefone || '-'}</td>
					<td style="padding: 0.75rem; text-align: center;">
						<span style="background: ${user.role === 'admin' ? '#28a745' : user.role === 'vendedor' ? '#ffc107' : '#6c757d'}; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
							${user.role === 'admin' ? 'Admin' : user.role === 'vendedor' ? 'Vendedor' : 'Usuário'}
						</span>
					</td>
					<td style="padding: 0.75rem; text-align: center; color: #666; font-size: 0.9rem;">
						${user.created_at ? new Date(user.created_at).toLocaleString('pt-BR', { 
							day: '2-digit', 
							month: '2-digit', 
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						}) : '-'}
					</td>
					<td style="padding: 0.75rem; text-align: center; color: #666; font-size: 0.9rem;">
						${user.updated_at ? new Date(user.updated_at).toLocaleString('pt-BR', { 
							day: '2-digit', 
							month: '2-digit', 
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						}) : (user.created_at ? new Date(user.created_at).toLocaleString('pt-BR', { 
							day: '2-digit', 
							month: '2-digit', 
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						}) : '-')}
					</td>
					<td style="padding: 0.75rem; text-align: center;">
						<button onclick="window.dashboardApp.editUser('${user.id}')" style="padding: 0.4rem 0.6rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;" title="Editar usuário">
							✏️ Editar
						</button>
					</td>
				</tr>
			`).join('');
			modal.innerHTML = `
				<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 1200px; width: 95%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; max-height: 90vh;">
					<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
						<h3 style="margin: 0; font-size: 1.5rem; color: #333;">👥 Gerenciar Usuários</h3>
						<button onclick="closeModal('modal-usuarios')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
					</div>
					<div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
						<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
							<h4 style="margin: 0; font-size: 1.1rem; color: #333;">Lista de Usuários (${usuarios.length})</h4>
							<div style="display: flex; gap: 0.5rem;">
								<button onclick="window.dashboardApp.showAddUserModal()" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer;">
									➕ Adicionar
								</button>
								<button onclick="window.dashboardApp.showResetPasswordUserModal()" style="padding: 0.5rem 1rem; background: #ffc107; color: white; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer;">
									🔑 Senha Padrão
								</button>
								<button onclick="window.dashboardApp.showDeleteUserModal()" style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer;">
									🗑️ Excluir
								</button>
							</div>
						</div>
						<div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
							<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
								<thead style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
									<tr>
										<th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem;">Foto</th>
										<th style="padding: 1rem 0.75rem; text-align: left; font-weight: 600; font-size: 0.9rem;">Nome</th>
										<th style="padding: 1rem 0.75rem; text-align: left; font-weight: 600; font-size: 0.9rem;">Email</th>
										<th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem;">Telefone</th>
										<th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem;">Função</th>
										<th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem;">Criado em</th>
										<th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem;">Última Atualização</th>
										<th style="padding: 1rem 0.75rem; text-align: center; font-weight: 600; font-size: 0.9rem;">Ações</th>
									</tr>
								</thead>
								<tbody>
									${usuariosHtml}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			`;
		} catch (error) {
			console.error('Erro ao carregar usuários:', error);
			modal.innerHTML = `
				<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem;">
					<div style="text-align: center;">
						<h3 style="color: #dc3545; margin-bottom: 1rem;">Erro ao carregar usuários</h3>
						<p style="color: #666; margin-bottom: 1.5rem;">${error.message}</p>
						<button onclick="closeModal('modal-usuarios')" style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Fechar</button>
					</div>
				</div>
			`;
		}
	}
	async resetUserPasswords() {
		if (!confirm('ATENÇÃO: Esta ação irá resetar a senha de TODOS os usuários (exceto administradores) para "123456".\n\nDeseja continuar?')) {
			return;
		}
		try {
			// Buscar todos os usuários não-admin
			const { data: usuarios, error: fetchError } = await this.supabase
				.from('usuarios')
				.select('id, nome, email')
				.neq('role', 'admin');
			if (fetchError) throw fetchError;
			let successCount = 0;
			let errorCount = 0;
			for (const user of usuarios) {
				try {
					// Resetar senha diretamente na tabela usuarios (usando hash base64)
					const hashedPassword = btoa('123456');
					const { error } = await this.supabase
						.from('usuarios')
						.update({ 
							senha: hashedPassword,
							updated_at: new Date().toISOString()
						})
						.eq('id', user.id);
					if (!error) {
						successCount++;
					} else {
						errorCount++;
					}
				} catch (err) {
					console.error(`Erro ao resetar senha de ${user.nome}:`, err);
					errorCount++;
				}
			}
			alert(`Reset de senhas concluído!\n\n✅ Sucesso: ${successCount} usuários\n❌ Erros: ${errorCount} usuários\n\nNova senha: 123456`);
		} catch (error) {
			console.error('Erro no reset de senhas:', error);
			alert('Erro ao resetar senhas: ' + error.message);
		}
	}
	showDeleteUserModal() {
		// Verificar se já existe um modal aberto e removê-lo
		const existingModal = document.getElementById('modal-delete-user');
		if (existingModal) {
			existingModal.remove();
		}
		const modal = this.createModal('modal-delete-user', '🗑️ Excluir Usuário');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.4)',
			zIndex: '2001'
		});
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; max-height: 90vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #dc3545;">🗑️ Excluir Usuário</h3>
					<button onclick="closeModal('modal-delete-user')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
					<h4 style="margin: 0 0 0.5rem 0; color: #721c24; font-size: 1rem;">⚠️ ATENÇÃO</h4>
					<p style="margin: 0; color: #721c24; font-size: 0.9rem;">
						Esta ação irá excluir permanentemente o usuário selecionado. Todos os dados associados serão perdidos.
					</p>
				</div>
				<form id="form-delete-user" style="display: flex; flex-direction: column; gap: 1.2rem;">
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Selecione o usuário *</label>
						<select id="delete-user-select" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
							<option value="">Selecione um usuário</option>
						</select>
					</div>
					<div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 1rem;">
						<p style="margin: 0; font-size: 0.9rem; color: #856404;">
							<strong>Nota:</strong> Você não pode excluir sua própria conta ou contas de administradores.
						</p>
					</div>
					<div style="display: flex; gap: 1rem; margin-top: 1rem;">
						<button type="submit" style="flex: 1; padding: 0.75rem; background: #dc3545; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							🗑️ Excluir Usuário
						</button>
						<button type="button" onclick="closeModal('modal-delete-user')" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							Cancelar
						</button>
					</div>
				</form>
			</div>
		`;
		// Carregar lista de usuários
		this.loadUsersForDeletion();
		// Eventos do formulário
		const form = modal.querySelector('#form-delete-user');
		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				await this.deleteSelectedUser();
			});
		}
	}
	showResetPasswordUserModal() {
		// Verificar se já existe um modal aberto e removê-lo
		const existingModal = document.getElementById('modal-reset-password-user');
		if (existingModal) {
			existingModal.remove();
		}
		const modal = this.createModal('modal-reset-password-user', '🔑 Resetar Senha');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.4)',
			zIndex: '2001'
		});
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; max-height: 90vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #ffc107;">🔑 Resetar Senha</h3>
					<button onclick="closeModal('modal-reset-password-user')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
					<h4 style="margin: 0 0 0.5rem 0; color: #856404; font-size: 1rem;">⚠️ ATENÇÃO</h4>
					<p style="margin: 0; color: #856404; font-size: 0.9rem;">
						Esta ação irá resetar a senha do usuário selecionado para "123456". A senha será alterada imediatamente.
					</p>
				</div>
				<form id="form-reset-password-user" style="display: flex; flex-direction: column; gap: 1.2rem;">
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Selecione o usuário *</label>
						<select id="reset-password-user-select" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
							<option value="">Selecione um usuário</option>
						</select>
					</div>
					<div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 1rem;">
						<p style="margin: 0; font-size: 0.9rem; color: #0c5460;">
							<strong>Nota:</strong> Você não pode resetar a senha de administradores.
						</p>
					</div>
					<div style="display: flex; gap: 1rem; margin-top: 1rem;">
						<button type="submit" style="flex: 1; padding: 0.75rem; background: #ffc107; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							🔑 Resetar Senha
						</button>
						<button type="button" onclick="closeModal('modal-reset-password-user')" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							Cancelar
						</button>
					</div>
				</form>
			</div>
		`;
		// Carregar lista de usuários
		this.loadUsersForPasswordReset();
		// Eventos do formulário
		const form = modal.querySelector('#form-reset-password-user');
		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				await this.resetSelectedUserPassword();
			});
		}
	}
	async loadUsersForPasswordReset() {
		try {
			const { data: usuarios, error } = await this.supabase
				.from('usuarios')
				.select('id, nome, email, role')
				.neq('role', 'admin'); // Não permitir resetar senha de admins
			if (error) throw error;
			const select = document.getElementById('reset-password-user-select');
			if (select) {
				select.innerHTML = '<option value="">Selecione um usuário</option>' +
					usuarios.map(user => `<option value="${user.id}">${user.nome} (${user.email})</option>`).join('');
			}
		} catch (error) {
			console.error('Erro ao carregar usuários para reset de senha:', error);
		}
	}
	async resetSelectedUserPassword() {
		const userId = document.getElementById('reset-password-user-select').value;
		const select = document.getElementById('reset-password-user-select');
		const userName = select.options[select.selectedIndex].text.split(' (')[0];
		if (!userId) {
			alert('Selecione um usuário para resetar a senha!');
			return;
		}
		if (!confirm(`Tem certeza que deseja resetar a senha do usuário "${userName}" para "123456"?\n\nA senha será alterada imediatamente.`)) {
			return;
		}
		try {
			// Resetar senha diretamente na tabela usuarios (usando hash base64)
			const hashedPassword = btoa('123456');
			const { error } = await this.supabase
				.from('usuarios')
				.update({ password_hash: hashedPassword })
				.eq('id', userId);
			if (error) throw error;
			alert(`✅ Senha do usuário "${userName}" foi resetada com sucesso!\n\nNova senha: 123456\n\nO usuário deve alterar a senha no próximo login.`);
			// Fechar modal
			closeModal('modal-reset-password-user');
			// Recarregar tabela de usuários
			const usuariosModal = document.getElementById('modal-usuarios');
			if (usuariosModal) {
				this.loadUsuariosTable(usuariosModal);
			}
		} catch (error) {
			console.error('Erro ao resetar senha:', error);
			alert('Erro ao resetar senha: ' + error.message);
		}
	}
	async loadUsersForDeletion() {
		try {
			const { data: usuarios, error } = await this.supabase
				.from('usuarios')
				.select('id, nome, email, role')
				.neq('id', this.currentUser.id) // Não permitir excluir si mesmo
				.neq('role', 'admin'); // Não permitir excluir outros admins
			if (error) throw error;
			const select = document.getElementById('delete-user-select');
			if (select) {
				select.innerHTML = '<option value="">Selecione um usuário</option>' +
					usuarios.map(user => `<option value="${user.id}">${user.nome} (${user.email})</option>`).join('');
			}
		} catch (error) {
			console.error('Erro ao carregar usuários para exclusão:', error);
		}
	}
	async deleteSelectedUser() {
		const userId = document.getElementById('delete-user-select').value;
		const select = document.getElementById('delete-user-select');
		const userName = select.options[select.selectedIndex].text.split(' (')[0];
		if (!userId) {
			alert('Selecione um usuário para excluir!');
			return;
		}
		if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?\n\nEsta ação não pode ser desfeita!`)) {
			return;
		}
		try {
			// Excluir do banco de dados
			const { error: dbError } = await this.supabase
				.from('usuarios')
				.delete()
				.eq('id', userId);
			if (dbError) throw dbError;
			// Excluir da autenticação (se possível)
			try {
				await this.supabase.auth.admin.deleteUser(userId);
			} catch (authError) {
				console.warn('Não foi possível excluir da autenticação:', authError);
			}
			alert(`Usuário "${userName}" excluído com sucesso!`);
			closeModal('modal-delete-user');
			// Recarregar tabela de usuários
			const usuariosModal = document.getElementById('modal-usuarios');
			if (usuariosModal) {
				this.loadUsuariosTable(usuariosModal);
			}
		} catch (error) {
			console.error('Erro ao excluir usuário:', error);
			alert('Erro ao excluir usuário: ' + error.message);
		}
	}
	openDespesasModal() {
		// Verificar se já existe um modal aberto e removê-lo
		const existingModal = document.getElementById('modal-despesas');
		if (existingModal) {
			existingModal.remove();
		}
		const modal = this.createModal('modal-despesas', '💰 Gerenciar Despesas');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.4)',
			zIndex: '2000'
		});
		// Agrupar despesas por categoria
		const despesasPorCategoria = {};
		this.despesas.forEach(despesa => {
			const categoria = despesa.categoria || 'outros';
			if (!despesasPorCategoria[categoria]) {
				despesasPorCategoria[categoria] = [];
			}
			despesasPorCategoria[categoria].push(despesa);
		});
		const categorias = Object.keys(despesasPorCategoria);
		const totalDespesas = this.despesas.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 800px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); max-height: 80vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #333;">💰 Gerenciar Despesas</h3>
					<button onclick="closeModal('modal-despesas')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
					<div style="font-size: 1.2rem; font-weight: 600; color: #dc3545;">
						Total de Despesas: ${this.formatCurrency(totalDespesas)}
					</div>
					<button onclick="window.dashboardApp.openAddDespesaModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
						<i class="fas fa-plus"></i> Adicionar Despesa
					</button>
				</div>
				<div style="display: flex; flex-direction: column; gap: 1rem;">
					${categorias.length === 0 ? 
						`<div style="text-align: center; padding: 3rem; color: #888;">
							<i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem;"></i>
							<p>Nenhuma despesa cadastrada</p>
						</div>` :
						categorias.map(categoria => {
							const despesas = despesasPorCategoria[categoria];
							const totalCategoria = despesas.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
							return `
								<div style="border: 1px solid #eee; border-radius: 8px; padding: 1rem;">
									<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
										<h4 style="margin: 0; color: #333; text-transform: capitalize;">${categoria}</h4>
										<span style="font-weight: 600; color: #dc3545;">${this.formatCurrency(totalCategoria)}</span>
									</div>
									<div style="display: flex; flex-direction: column; gap: 0.5rem;">
										${despesas.map(despesa => `
											<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
												<div>
													<strong>${despesa.descricao}</strong>
													<div style="font-size: 0.8rem; color: #666;">
														${new Date(despesa.data_despesa).toLocaleDateString('pt-BR')}
														${despesa.produto_id ? ' (Produto específico)' : ''}
													</div>
												</div>
												<div style="display: flex; align-items: center; gap: 0.5rem;">
													<span style="font-weight: 600;">${this.formatCurrency(despesa.valor)}</span>
													<button onclick="window.dashboardApp.deleteDespesa('${despesa.id}')" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem;">
														<i class="fas fa-trash"></i>
													</button>
												</div>
											</div>
										`).join('')}
									</div>
								</div>
							`;
						}).join('')
					}
				</div>
			</div>
		`;
		document.getElementById('modals-container').appendChild(modal);
	}
	openReceitasModal() {
		// Verificar se já existe um modal aberto e removê-lo
		const existingModal = document.getElementById('modal-receitas');
		if (existingModal) {
			existingModal.remove();
		}
		const modal = this.createModal('modal-receitas', '💰 Gerenciar Receitas');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.4)',
			zIndex: '2000'
		});
		// Agrupar receitas por categoria
		const receitasPorCategoria = {};
		this.receitas.forEach(receita => {
			const categoria = receita.categoria || 'vendas';
			if (!receitasPorCategoria[categoria]) {
				receitasPorCategoria[categoria] = [];
			}
			receitasPorCategoria[categoria].push(receita);
		});
		const categorias = Object.keys(receitasPorCategoria);
		const totalReceitas = this.receitas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 800px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); max-height: 80vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #333;">💰 Gerenciar Receitas</h3>
					<button onclick="closeModal('modal-receitas')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
					<div style="font-size: 1.2rem; font-weight: 600; color: #28a745;">
						Total de Receitas: ${this.formatCurrency(totalReceitas)}
					</div>
					<button onclick="window.dashboardApp.openAddReceitaModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
						<i class="fas fa-plus"></i> Adicionar Receita
					</button>
				</div>
				<div style="display: flex; flex-direction: column; gap: 1rem;">
					${categorias.length === 0 ? 
						`<div style="text-align: center; padding: 3rem; color: #888;">
							<i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem;"></i>
							<p>Nenhuma receita adicional cadastrada</p>
							<small>As receitas de vendas são calculadas automaticamente</small>
						</div>` :
						categorias.map(categoria => {
							const receitas = receitasPorCategoria[categoria];
							const totalCategoria = receitas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
							return `
								<div style="border: 1px solid #eee; border-radius: 8px; padding: 1rem;">
									<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
										<h4 style="margin: 0; color: #333; text-transform: capitalize;">${categoria}</h4>
										<span style="font-weight: 600; color: #28a745;">${this.formatCurrency(totalCategoria)}</span>
									</div>
									<div style="display: flex; flex-direction: column; gap: 0.5rem;">
										${receitas.map(receita => `
											<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
												<div>
													<strong>${receita.descricao}</strong>
													<div style="font-size: 0.8rem; color: #666;">
														${new Date(receita.data_recebimento).toLocaleDateString('pt-BR')}
													</div>
												</div>
												<div style="display: flex; align-items: center; gap: 0.5rem;">
													<span style="font-weight: 600;">${this.formatCurrency(receita.valor)}</span>
													<button onclick="window.dashboardApp.deleteReceita('${receita.id}')" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer; font-size: 0.8rem;">
														<i class="fas fa-trash"></i>
													</button>
												</div>
											</div>
										`).join('')}
									</div>
								</div>
							`;
						}).join('')
					}
				</div>
			</div>
		`;
		document.getElementById('modals-container').appendChild(modal);
	}
openAddDespesaModal() {
		// Verificar se já existe um modal aberto e removê-lo
		const existingModal = document.getElementById('modal-add-despesa');
		if (existingModal) {
			existingModal.remove();
		}
		const modal = this.createModal('modal-add-despesa', '➕ Adicionar Despesa');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.4)',
			zIndex: '2000'
		});
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18);">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #333;">➕ Adicionar Despesa</h3>
					<button onclick="closeModal('modal-add-despesa')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<form id="form-add-despesa" style="display: flex; flex-direction: column; gap: 1.2rem;">
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Descrição *</label>
						<input type="text" id="despesa-descricao" placeholder="Ex: Transporte, Comissão, etc." required
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Valor *</label>
						<input type="text" id="despesa-valor" placeholder="0.00" required inputmode="decimal"
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Categoria *</label>
						<select id="despesa-categoria" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
							<option value="produtos-ingredientes">Produtos/Ingredientes</option>
							<option value="aluguel">Aluguel</option>
							<option value="energia-luz">Energia/Luz</option>
							<option value="agua">Água</option>
							<option value="telefone-internet">Telefone/Internet</option>
							<option value="marketing">Marketing</option>
							<option value="equipamentos">Equipamentos</option>
							<option value="comissao">Comissão</option>
							<option value="imposto">Imposto</option>
							<option value="produtos">Produtos</option>
							<option value="outros">Outros</option>
						</select>
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Tipo *</label>
						<select id="despesa-tipo" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
							<option value="fixa">Fixa (recorrente)</option>
							<option value="variavel">Variável (eventual)</option>
						</select>
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Data *</label>
						<input type="date" id="despesa-data" required value="${new Date().toISOString().split('T')[0]}"
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div style="display: flex; gap: 1rem; margin-top: 1rem;">
						<button type="submit" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #ff6b9d, #ffa726); color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							💰 Salvar Despesa
						</button>
						<button type="button" onclick="closeModal('modal-add-despesa')" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							Cancelar
						</button>
					</div>
				</form>
			</div>
		`;
		document.getElementById('modals-container').appendChild(modal);
		// Event listener para o formulário
		const form = modal.querySelector('#form-add-despesa');
		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				await this.saveNewDespesa();
			});
		}
		// Event listener para formatação do campo valor (mesma lógica do product-preco)
		const valorInput = modal.querySelector('#despesa-valor');
		if (valorInput) {
			valorInput.addEventListener('input', function(e) {
				let value = e.target.value;
				// Remove tudo exceto números, vírgula e ponto
				value = value.replace(/[^\d.,]/g, '');
				// Substitui vírgula por ponto para padronização
				value = value.replace(',', '.');
				// Garante apenas um ponto decimal
				const parts = value.split('.');
				if (parts.length > 2) {
					value = parts[0] + '.' + parts.slice(1).join('');
				}
				// Limita a 2 casas decimais
				if (parts.length === 2 && parts[1].length > 2) {
					value = parts[0] + '.' + parts[1].substring(0, 2);
				}
				e.target.value = value;
			});
		}
	}
	openAddReceitaModal() {
		// Verificar se já existe um modal aberto e removê-lo
		const existingModal = document.getElementById('modal-add-receita');
		if (existingModal) {
			existingModal.remove();
		}
		const modal = this.createModal('modal-add-receita', '➕ Adicionar Receita');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.4)',
			zIndex: '2000'
		});
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18);">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #333;">➕ Adicionar Receita</h3>
					<button onclick="closeModal('modal-add-receita')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<form id="form-add-receita" style="display: flex; flex-direction: column; gap: 1.2rem;">
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Descrição *</label>
						<input type="text" id="receita-descricao" placeholder="Ex: Venda de produto avulso, Serviço, etc." required
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Valor *</label>
						<input type="text" id="receita-valor" placeholder="0,00" required inputmode="decimal"
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Categoria *</label>
						<select id="receita-categoria" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
							<option value="">Selecione uma categoria</option>
							<option value="servicos">Serviços</option>
							<option value="produtos_avulsos">Produtos Avulsos</option>
							<option value="consultoria">Consultoria</option>
							<option value="parcerias">Parcerias</option>
							<option value="outros">Outros</option>
						</select>
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Tipo *</label>
						<select id="receita-tipo" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
							<option value="fixa">Fixa (recorrente)</option>
							<option value="variavel">Variável (eventual)</option>
						</select>
					</div>
					<div>
						<label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">Data *</label>
						<input type="date" id="receita-data" required value="${new Date().toISOString().split('T')[0]}"
							   style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box;">
					</div>
					<div style="display: flex; gap: 1rem; margin-top: 1rem;">
						<button type="submit" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							💰 Salvar Receita
						</button>
						<button type="button" onclick="closeModal('modal-add-receita')" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer;">
							Cancelar
						</button>
					</div>
				</form>
			</div>
		`;
		document.getElementById('modals-container').appendChild(modal);
		// Event listener para o formulário
		const form = modal.querySelector('#form-add-receita');
		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				await this.saveNewReceita();
			});
		}
		// Event listener para formatação do campo valor
		const valorInput = modal.querySelector('#receita-valor');
		if (valorInput) {
			valorInput.addEventListener('input', function(e) {
				let value = e.target.value;
				// Permite apenas números, pontos e vírgulas
				value = value.replace(/[^0-9.,]/g, '');
				// Trata separadores decimais
				const parts = value.split(/[.,]/);
				if (parts.length > 2) {
					// Se há múltiplos separadores, mantém apenas o primeiro
					value = parts[0] + '.' + parts.slice(1).join('');
				} else if (parts.length === 2) {
					// Formata com ponto como separador
					value = parts[0] + '.' + parts[1];
				}
				// Limita a 2 casas decimais
				if (value.includes('.') && value.split('.')[1].length > 2) {
					const [inteiro, decimal] = value.split('.');
					value = inteiro + '.' + decimal.substring(0, 2);
				}
				e.target.value = value;
			});
		}
	}
	async saveNewDespesa() {
		const descricao = document.getElementById('despesa-descricao').value.trim();
		const valorStr = document.getElementById('despesa-valor').value.trim().replace(',', '.');
		const valor = parseFloat(valorStr);
		const categoria = document.getElementById('despesa-categoria').value;
		const tipo = document.getElementById('despesa-tipo').value;
		const data = document.getElementById('despesa-data').value;
		if (!descricao || !valorStr || !categoria || !tipo || !data) {
			alert('Preencha todos os campos obrigatórios!');
			return;
		}
		if (isNaN(valor) || valor <= 0) {
			alert('Valor deve ser um número positivo válido!');
			return;
		}
		try {
			const despesaData = {
				descricao,
				valor,
				categoria,
				tipo,
				data_despesa: data
			};
			const result = await this.saveToSupabaseInsert('despesas', despesaData);
			if (result) {
				this.despesas.unshift(result);
				await this.loadData(); // Recarregar dados para atualizar estatísticas
				this.createStatsCards();
				alert('Despesa salva com sucesso!');
				closeModal('modal-add-despesa');
				// Reabrir modal de despesas para mostrar a nova despesa
				this.openDespesasModal();
			}
		} catch (error) {
			console.error('Erro ao salvar despesa:', error);
			alert('Erro ao salvar despesa: ' + error.message);
		}
	}
	async saveNewReceita() {
		const descricao = document.getElementById('receita-descricao').value.trim();
		const valorStr = document.getElementById('receita-valor').value.trim().replace(',', '.');
		const valor = parseFloat(valorStr);
		const categoria = document.getElementById('receita-categoria').value;
		const tipo = document.getElementById('receita-tipo').value;
		const data = document.getElementById('receita-data').value;
		if (!descricao || !valorStr || !categoria || !tipo || !data) {
			alert('Preencha todos os campos obrigatórios!');
			return;
		}
		if (isNaN(valor) || valor <= 0) {
			alert('Valor deve ser um número positivo válido!');
			return;
		}
		try {
			const { data: novaReceita, error } = await this.supabase
				.from('receitas')
				.insert([{
					descricao: descricao,
					valor: valor,
					categoria: categoria,
					tipo: tipo,
					data_recebimento: data,
					created_at: new Date().toISOString()
				}])
				.select()
				.single();
			if (error) throw error;
			// Adicionar à lista local
			this.receitas.push(novaReceita);
			// Fechar modal de adicionar
			closeModal('modal-add-receita');
			// Reabrir modal de receitas para mostrar a nova receita
			this.openReceitasModal();
		} catch (error) {
			console.error('Erro ao salvar receita:', error);
			alert('Erro ao salvar receita: ' + error.message);
		}
	}
	async deleteDespesa(despesaId) {
		if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
		const success = await this.deleteFromSupabase('despesas', despesaId);
		if (success) {
			this.despesas = this.despesas.filter(d => d.id !== despesaId);
			this.createStatsCards(); // Atualizar estatísticas
			this.openDespesasModal(); // Reabrir modal atualizado
		}
	}
	async deleteReceita(receitaId) {
		if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
		const success = await this.deleteFromSupabase('receitas', receitaId);
		if (success) {
			this.receitas = this.receitas.filter(r => r.id !== receitaId);
			this.createStatsCards(); // Atualizar estatísticas
			this.openReceitasModal(); // Reabrir modal atualizado
		}
	}
	async registrarCustosProdutosVendidos(pedidoId, produtos) {
		try {
			for (const item of produtos) {
				const produto = this.products.find(p => p.id == item.produto_id);
				if (produto && produto.custo && parseFloat(produto.custo) > 0) {
					const custoTotal = parseFloat(produto.custo) * item.quantidade;
					const despesaData = {
						descricao: `Custo de produção - ${produto.nome} (Pedido #${pedidoId})`,
						valor: custoTotal,
						categoria: 'produtos',
						tipo: 'variavel',
						data_despesa: new Date().toISOString().split('T')[0],
						produto_id: produto.id,
						pedido_id: pedidoId
					};
					await this.saveToSupabaseInsert('despesas', despesaData);
					console.log(`✅ Custo registrado: ${produto.nome} - ${this.formatCurrency(custoTotal)}`);
				}
			}
		} catch (error) {
			console.error('Erro ao registrar custos dos produtos:', error);
		}
	}
	async saveToSupabaseInsert(table, data) {
		try {
			if (!this.supabase) {
				console.error('Supabase não inicializado - tentando inicializar...');
				this.supabase = window.supabaseClient;
			}
			if (!this.supabase) {
				alert('Erro: Sistema de banco de dados não inicializado. Recarregue a página.');
				return null;
			}
			const { data: result, error } = await this.supabase
				.from(table)
				.insert(data)
				.select()
				.single();
			if (error) {
				console.error(`❌ Erro ao salvar em ${table}:`, error);
				console.error('📋 Dados que estavam sendo salvos:', data);
				alert(`Erro ao salvar em ${table}: ${error.message}`);
				return null;
			}
			console.log(`✅ Dados salvos com sucesso em ${table}:`, result);
			return result;
		} catch (error) {
			console.error(`Erro ao salvar em ${table}:`, error);
			alert(`Erro ao salvar: ${error.message}`);
			return null;
		}
	}
	async deleteFromSupabase(table, id) {
		try {
			const { error } = await this.supabase
				.from(table)
				.delete()
				.eq('id', id);
			if (error) {
				console.error(`Erro ao excluir de ${table}:`, error);
				alert(`Erro ao excluir: ${error.message}`);
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Erro ao excluir de ${table}:`, error);
			alert(`Erro ao excluir: ${error.message}`);
			return false;
		}
	}
	updateCartBadge() {
		const totalItems = Object.values(this.cart).reduce((sum, item) => sum + (item.quantidade || 0), 0);
		// Atualizar badge no header (head-cart)
		const headCart = document.getElementById('head-cart');
		if (headCart) {
			const badgeSpan = headCart.querySelector('span');
			if (badgeSpan) {
				if (totalItems > 0) {
					badgeSpan.textContent = totalItems;
					badgeSpan.style.display = 'flex';
					headCart.style.display = 'flex';
				} else {
					headCart.style.display = 'none';
				}
			}
		}
		// Atualizar badge flutuante (cart-float) se existir
		const cartFloat = document.getElementById('cart-float');
		if (cartFloat) {
			const badge = cartFloat.querySelector('#cart-badge');
			if (badge) {
				if (totalItems > 0) {
					badge.textContent = totalItems;
					badge.style.display = 'flex';
					cartFloat.classList.add('cart-has-items');
				} else {
					badge.style.display = 'none';
					cartFloat.classList.remove('cart-has-items');
				}
			}
		}
	}
// MODAIS PARA VENDAS ONLINE
	openOnlineClientModal() {
		const modal = this.createModal('modal-online-client', '', false);
		modal.querySelector('.modal-content-wrapper').innerHTML = `
			<div style="display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem;">
				<span style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea, #6dd5ed); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.7rem;"><i class="fas fa-user"></i></span>
				<span style="font-size: 1.35rem; font-weight: 700; color: #333;">${t('vendas_online.cadastro_pedido')}</span>
				<button onclick="closeModal('modal-online-client')" style="margin-left:auto; background:none; border:none; font-size:1.3rem; color:#888; cursor:pointer;">&times;</button>
			</div>
			<div style="border-bottom:1px solid #eee; margin-bottom:1rem;"></div>
			<p style="color: #666; margin-bottom: 1rem; font-size: 0.9rem;">${t('vendas_online.descricao_cadastro')}</p>
			<form id="form-online-client" class="form-modal">
				<div class="form-group">
					<label for="online-nome">${t('vendas_online.nome_completo')}</label>
					<input type="text" id="online-nome" required class="form-control" placeholder="${t('vendas_online.placeholder_nome')}">
				</div>
				<div class="form-group">
					<label for="online-telefone">${t('vendas_online.telefone_whatsapp')}</label>
					<input type="tel" id="online-telefone" required class="form-control" placeholder="(11) 99999-9999">
				</div>
				<div class="form-group">
					<label for="online-email">${t('vendas_online.email')}</label>
					<input type="email" id="online-email" class="form-control" placeholder="seu@email.com">
				</div>
				<div class="form-group">
					<label for="online-endereco">${t('vendas_online.endereco_entrega')}</label>
					<textarea id="online-endereco" required class="form-control" rows="3" placeholder="Rua, número, bairro, cidade"></textarea>
				</div>
				<div class="form-group">
					<label for="online-entrega">${t('vendas_online.tipo_entrega')}</label>
					<select id="online-entrega" required class="form-control">
						<option value="">${t('vendas_online.selecione')}</option>
						<option value="retirada">${t('vendas_online.retirada_local')}</option>
						<option value="entrega">${t('finalizar.entrega_domicilio')}</option>
					</select>
				</div>
				<div class="form-group" id="data-entrega-group" style="display: none;">
					<label for="online-data-entrega">${t('vendas_online.data_entrega')}</label>
					<input type="date" id="online-data-entrega" class="form-control">
				</div>
				<div class="modal-actions">
					<button type="button" onclick="closeModal('modal-online-client')" class="btn btn-secondary">${t('vendas_online.cancelar')}</button>
					<button type="submit" class="btn btn-primary">${t('vendas_online.finalizar_pedido')}</button>
				</div>
			</form>
		`;
		document.getElementById('modals-container').appendChild(modal);
		modal.classList.add('show');
		// Event listener para mostrar/ocultar campo de data
		const entregaSelect = modal.querySelector('#online-entrega');
		const dataGroup = modal.querySelector('#data-entrega-group');
		const dataInput = modal.querySelector('#online-data-entrega');
		entregaSelect.addEventListener('change', (e) => {
			if (e.target.value === 'entrega') {
				dataGroup.style.display = 'block';
				dataInput.required = true;
				// Set min date to tomorrow
				const tomorrow = new Date();
				tomorrow.setDate(tomorrow.getDate() + 1);
				dataInput.min = tomorrow.toISOString().split('T')[0];
			} else {
				dataGroup.style.display = 'none';
				dataInput.required = false;
			}
		});
		modal.querySelector('#form-online-client').addEventListener('submit', async (e) => {
			e.preventDefault();
			const nome = modal.querySelector('#online-nome').value.trim();
			const telefone = modal.querySelector('#online-telefone').value.trim();
			const email = modal.querySelector('#online-email').value.trim();
			const endereco = modal.querySelector('#online-endereco').value.trim();
			const tipoEntrega = modal.querySelector('#online-entrega').value;
			const dataEntrega = modal.querySelector('#online-data-entrega').value;
			if (!nome || !telefone || !endereco || !tipoEntrega) {
				alert('Preencha todos os campos obrigatórios');
				return;
			}
			if (tipoEntrega === 'entrega' && !dataEntrega) {
				alert('Selecione a data de entrega');
				return;
			}
			// Salvar cliente
			const clientData = { nome, telefone, email, endereco };
			const cliente = await this.saveToSupabaseInsert('clientes', clientData);
			if (cliente) {
				// Criar pedido
				await this.finalizarPedidoOnline(cliente, tipoEntrega, dataEntrega);
				closeModal('modal-online-client');
			}
		});
	}
	async finalizarPedidoOnline(cliente, tipoEntrega, dataEntrega, enderecoEntrega, formaPagamento) {
		try {
			console.log('🛒 Iniciando finalização de pedido online...');
			console.log('👤 Cliente:', cliente);
			console.log('🛍️ Carrinho:', this.cart);
			console.log('📦 Produtos carregados:', this.products?.length);

			if (!cliente) {
				alert('Erro: Cliente não informado. Tente novamente.');
				console.error('❌ Cliente não informado');
				return;
			}

			if (!this.cart || Object.keys(this.cart).length === 0) {
				alert('Erro: Carrinho vazio. Adicione produtos antes de finalizar.');
				console.error('❌ Carrinho vazio');
				return;
			}
			// Se cliente é um objeto mas não tem ID, tentar salvar novamente
			let clienteId = cliente.id;
			if (!clienteId && typeof cliente === 'object') {
				const clienteSalvo = await this.saveToSupabaseInsert('clientes', {
					nome: cliente.nome,
					telefone: cliente.telefone,
					email: cliente.email,
					endereco: cliente.endereco,
					canal: 'online'
				});
				if (clienteSalvo && clienteSalvo.id) {
					clienteId = clienteSalvo.id;
				} else {
					alert('Erro ao salvar cliente. Tente novamente.');
					return;
				}
			}
			const itens = Object.entries(this.cart).map(([productId, quantidade]) => ({
				produto_id: productId,
				quantidade: quantidade.quantidade,
				preco_unitario: this.products.find(p => p.id == productId)?.preco || 0
			}));
			const total = itens.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
			// Processar sinal e status de pagamento
			const fullPayment = document.getElementById('finalizar-full-payment').checked;
			const sinal = fullPayment ? 0 : (parseFloat(document.getElementById('finalizar-sinal').value) || 0);
			const valor_pago = fullPayment ? total : sinal;
			const status = 'pendente';
			// Gerar número do pedido
			const hoje = new Date();
			const dataStr = hoje.toISOString().slice(0, 10).replace(/-/g, '');
			const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
			const numeroPedido = `PED-${dataStr}-${randomNum}`;
			let observacoes = `Pedido online - ${tipoEntrega}`;
			if (enderecoEntrega) {
				observacoes += ` - Endereço: ${enderecoEntrega}`;
			}
			// Adicionar observações do cliente se houver
			const observacoesCliente = document.getElementById('finalizar-observacoes')?.value?.trim();
			if (observacoesCliente) {
				observacoes += `\n\nObservações do cliente: ${observacoesCliente}`;
			}
			// Capturar idioma selecionado no modal ANTES de criar o pedido
			const idiomaSelecionado = document.getElementById('finalizar-idioma')?.value || cliente?.idioma || 'pt';
			console.log(`📧 Idioma selecionado no modal: ${idiomaSelecionado}`);
			
			// Capturar horário de entrega
			const horarioEntrega = document.getElementById('finalizar-horario-entrega').value;
			if (!horarioEntrega) {
				alert('Selecione um horário de entrega.');
				return;
			}
			
			const pedidoData = {
				numero_pedido: numeroPedido,
				cliente_id: clienteId,
				vendedor_id: null,
				valor_total: total,
				valor_pago: valor_pago,
				status: status,
				data_entrega: dataEntrega ? dataEntrega + 'T00:00:00' : new Date().toISOString().split('T')[0] + 'T00:00:00',
				hora_entrega: horarioEntrega,
				observacoes: observacoes,
				idioma: idiomaSelecionado
			};
			const pedido = await this.saveToSupabaseInsert('pedidos', pedidoData);
			if (!pedido || !pedido.id) {
				throw new Error('Falha ao salvar o pedido principal');
			}
			// Atualizar idioma do cliente se diferente
			if (cliente && idiomaSelecionado !== (cliente.idioma || 'pt')) {
				console.log(`📧 Atualizando idioma do cliente de "${cliente.idioma}" para "${idiomaSelecionado}"`);
				await this.supabase.from('clientes').update({ idioma: idiomaSelecionado }).eq('id', cliente.id);
			}
			// Enviar email de confirmação
			this.triggerRecebimentoEmail(pedido.id);
			// Salvar itens do pedido
			let itensSalvos = 0;
			for (const item of itens) {
				try {
					const itemData = {
						pedido_id: pedido.id,
						produto_id: item.produto_id,
						quantidade: item.quantidade,
						preco_unitario: item.preco_unitario,
						created_at: new Date().toISOString()
					};
					const itemSalvo = await this.saveToSupabaseInsert('pedido_itens', itemData);
					if (itemSalvo) {
						itensSalvos++;
					}
				} catch (itemError) {
					console.error('Erro ao salvar item do pedido:', itemError);
				}
			}
			// Reservar estoque se o pedido foi confirmado ou pago
			if (status === 'confirmado' || status === 'pago') {
				await this.updateStockForOrder('reserve', pedido.id);
			}
			// Criar entrega se necessário (apenas para entregas, não para retirada)
			if (tipoEntrega === 'entrega') {
				try {
					console.log('📦 Criando entrega para pedido online:', pedido.id);
					const entregaData = {
						pedido_id: pedido.id,
						data_entrega: dataEntrega || (new Date().toISOString().split('T')[0] + 'T00:00:00'),
						hora_entrega: horarioEntrega,
						endereco_entrega: enderecoEntrega,
						status: 'agendada',
						created_at: new Date().toISOString()
					};
					const entregaSalva = await this.saveToSupabaseInsert('entregas', entregaData);
					if (entregaSalva) {
						console.log('✅ Entrega criada com sucesso:', entregaSalva.id);
					} else {
						console.warn('⚠️ Falha ao criar entrega para pedido online');
					}
				} catch (entregaError) {
					console.error('❌ Erro ao criar entrega:', entregaError);
				}
			} else {
				console.log('ℹ️ Pedido online sem entrega (retirada no local)');
			}
			if (itensSalvos === itens.length) {
				alert('Pedido realizado com sucesso! Você receberá um email de confirmação em breve.');
				await this.loadData(); // Recarregar dados para atualizar listas
				try {
					if (typeof closeModal === 'function') {
						closeModal('modal-finalizar-pedido'); // Fechar modal
					}
					this.cart = {}; // Limpar carrinho
					this.updateCartBadge();
					await this.renderVendasOnlinePage(); // Voltar para produtos e resetar contadores
				} catch (uiError) {
					console.error('Erro na interface após salvar pedido:', uiError);
				}
			} else {
				alert('Pedido salvo, mas houve erro ao salvar alguns itens. Entre em contato conosco.');
				await this.loadData(); // Recarregar dados
				try {
					if (typeof closeModal === 'function') {
						closeModal('modal-finalizar-pedido');
					}
					this.cart = {};
					this.updateCartBadge();
					await this.renderVendasOnlinePage();
				} catch (uiError) {
					console.error('Erro na interface após salvar pedido parcial:', uiError);
				}
			}
		} catch (error) {
			console.error('Erro ao finalizar pedido:', error);
			alert('Erro ao finalizar pedido. Tente novamente.');
		}
	}
	showPasswordChangeWarning() {
		// Criar modal de aviso de senha padrão
		const modal = this.createModal('modal-password-warning', '🔐 Segurança da Conta');
		modal.classList.add('show');
		Object.assign(modal.style, {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			position: 'fixed',
			top: '0',
			left: '0',
			width: '100vw',
			height: '100vh',
			background: 'rgba(0,0,0,0.6)',
			zIndex: '3000'
		});
		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}
		modalsContainer.appendChild(modal);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; max-height: 90vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #dc3545;">🔐 Segurança da Conta</h3>
					<button onclick="closeModal('modal-password-warning')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
					<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
						<span style="font-size: 2rem;">⚠️</span>
						<h4 style="margin: 0; color: #721c24; font-size: 1.1rem;">ATENÇÃO: Senha Padrão Detectada</h4>
					</div>
					<p style="margin: 0 0 1rem 0; color: #721c24; font-size: 0.95rem; line-height: 1.5;">
						<strong>${this.currentUser.nome}</strong>, sua conta ainda está usando a senha padrão do sistema (<strong>"123456"</strong>).
					</p>
					<p style="margin: 0; color: #721c24; font-size: 0.95rem; line-height: 1.5;">
						Por questões de segurança, você deve alterar sua senha imediatamente para proteger sua conta e os dados do sistema.
					</p>
				</div>
				<div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
					<h5 style="margin: 0 0 0.5rem 0; color: #0c5460; font-size: 0.9rem;">💡 Dicas para uma senha segura:</h5>
					<ul style="margin: 0; padding-left: 1.2rem; color: #0c5460; font-size: 0.85rem; line-height: 1.4;">
						<li>Use pelo menos 8 caracteres</li>
						<li>Combine letras maiúsculas e minúsculas</li>
						<li>Inclua números e símbolos</li>
						<li>Evite usar informações pessoais óbvias</li>
					</ul>
				</div>
				<div style="display: flex; gap: 1rem; margin-top: 1rem;">
					<button onclick="window.dashboardApp.showEditUserModal(); closeModal('modal-password-warning');" style="flex: 1; padding: 0.875rem; background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(40,167,69,0.3);">
						🔑 Alterar Senha Agora
					</button>
					<button onclick="closeModal('modal-password-warning')" style="flex: 1; padding: 0.875rem; background: #6c757d; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">
						Lembrar Depois
					</button>
				</div>
				<p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #666; text-align: center;">
					Este aviso aparecerá toda vez que você fizer login até alterar sua senha.
				</p>
			</div>
		`;
	}
	// CACHE DE VALIDAÇÃO DE CLIENTE (10 minutos)
	getValidacaoClienteCache() {
		try {
			const cache = sessionStorage.getItem('cliente_validacao_cache');
			if (!cache) return null;
			const data = JSON.parse(cache);
			const agora = Date.now();
			const tempoDecorrido = agora - data.timestamp;
			// Verificar se não passou 10 minutos (600000 ms)
			if (tempoDecorrido > 600000) {
				console.log('⏰ Cache de validação expirado, removendo');
				sessionStorage.removeItem('cliente_validacao_cache');
				return null;
			}
			console.log(`✅ Cache válido: ${Math.round(tempoDecorrido / 1000)}s restantes`);
			return data;
		} catch (error) {
			console.error('Erro ao ler cache de validação:', error);
			sessionStorage.removeItem('cliente_validacao_cache');
			return null;
		}
	}
	setValidacaoClienteCache(cliente) {
		try {
			const data = {
				cliente: cliente,
				timestamp: Date.now()
			};
			sessionStorage.setItem('cliente_validacao_cache', JSON.stringify(data));
			console.log('💾 Validação de cliente armazenada em cache (10 min)');
		} catch (error) {
			console.error('Erro ao salvar cache de validação:', error);
		}
	}
	clearValidacaoClienteCache() {
		try {
			sessionStorage.removeItem('cliente_validacao_cache');
			console.log('🗑️ Cache de validação removido');
		} catch (error) {
			console.error('Erro ao remover cache de validação:', error);
		}
	}

	// ===== TIMELINE DE STATUS DO PEDIDO =====
	// Função para abrir timeline de status com ícones clicáveis
	abrirTimelineStatus(orderId) {
		const order = this.orders.find(o => o.id == orderId);
		if (!order) {
			alert('Pedido não encontrado');
			return;
		}

		const statusOptions = this.getTimelineStatuses();
		const orderStatus = this.normalizeOrderStatus(order.status);

		const currentStatusIndex = statusOptions.findIndex(s => s.key === orderStatus);

		let modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) {
			modalsContainer = document.createElement('div');
			modalsContainer.id = 'modals-container';
			document.body.appendChild(modalsContainer);
		}

		const modal = document.createElement('div');
		modal.className = 'modal-overlay';
		modal.id = `modal-timeline-${orderId}`;
		modalsContainer.appendChild(modal);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 500px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; max-height: 90vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #dc3545;">🔐 Segurança da Conta</h3>
					<button onclick="closeModal('modal-timeline-${orderId}')" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d; padding: 0.2rem; border-radius: 4px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='transparent'">×</button>
				</div>

				<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
					<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
						<span style="font-weight: 500; color: #495057;">👤 Cliente:</span>
						<span style="color: #2c3e50;">${order.cliente_nome}</span>
					</div>
					<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
						<span style="font-weight: 500; color: #495057;">💰 Total:</span>
						<span style="color: #28a745; font-weight: 600;">R$ ${this.formatCurrency(order.valor_total)}</span>
					</div>
					<div style="display: flex; align-items: center; gap: 0.5rem;">
						<span style="font-weight: 500; color: #495057;">📅 Data:</span>
						<span style="color: #2c3e50;">${order.data_entrega ? new Date(order.data_entrega).toLocaleDateString('pt-BR') : 'Data não definida'}</span>
					</div>
				</div>

				<div style="display: flex; flex-direction: column; gap: 1rem;">
					${statusOptions.map((status, index) => {
						const isCompleted = index <= currentStatusIndex;
						const isCurrent = index === currentStatusIndex;
						const canAdvance = index === currentStatusIndex + 1;

						return `
							<div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 12px; background: ${isCompleted ? '#e8f5e8' : isCurrent ? '#fff3cd' : '#f8f9fa'}; border: 2px solid ${isCompleted ? '#28a745' : isCurrent ? '#ffc107' : '#dee2e6'}; transition: all 0.3s ease;">
								<div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
									<div style="width: 50px; height: 50px; border-radius: 50%; background: ${status.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; cursor: ${canAdvance ? 'pointer' : 'default'}; transition: transform 0.2s ease;" 
										 onclick="${canAdvance ? `window.dashboardApp.avancarStatusPedido('${order.id}', '${status.key}')` : ''}"
										 onmouseover="${canAdvance ? `this.style.transform='scale(1.1)'` : ''}"
										 onmouseout="${canAdvance ? `this.style.transform='scale(1)'` : ''}">
										${status.emoji}
									</div>
									${canAdvance ? `<button style="background: ${status.color}; color: white; border: none; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.8rem; cursor: pointer;" onclick="window.dashboardApp.avancarStatusPedido('${order.id}', '${status.key}')">Avançar</button>` : ''}
								</div>
								<div style="flex: 1;">
									<h4 style="margin: 0 0 0.25rem 0; color: ${isCompleted ? '#28a745' : isCurrent ? '#856404' : '#6c757d'};">
										${status.label} ${isCompleted ? '✓' : isCurrent ? '🔄' : ''}
									</h4>
									<p style="margin: 0; color: #666; font-size: 0.9rem;">${status.description}</p>
									${isCompleted ? `<small style="color: #28a745; font-weight: 600;">Concluído</small>` : isCurrent ? `<small style="color: #856404; font-weight: 600;">Em andamento</small>` : `<small style="color: #6c757d;">Pendente</small>`}
								</div>
								${canAdvance ? `
									<button style="background: #007bff; color: white; border: none; border-radius: 6px; padding: 0.4rem 0.8rem; font-size: 0.8rem; cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#0056b3'" onmouseout="this.style.backgroundColor='#007bff'" onclick="event.stopPropagation(); window.dashboardApp.enviarEmailStatus('${order.id}', '${status.key}')">
										📧 Enviar Email
									</button>
								` : ''}
							</div>
						`;
					}).join('')}
				</div>

				<div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
					<div style="display: flex; align-items: flex-start; gap: 0.5rem;">
						<span style="color: #856404; font-size: 1.2rem;">💡</span>
						<div>
							<div style="font-weight: 500; color: #856404; margin-bottom: 0.25rem;">Como usar:</div>
							<ul style="margin: 0; padding-left: 1rem; color: #856404; font-size: 0.9rem; line-height: 1.4;">
								<li>Clique no ícone do próximo status para avançar</li>
								<li>Use o botão "Avançar" para mudar o status</li>
								<li>Clique em "📧 Enviar Email" para notificar o cliente</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
	}

	// Função para avançar o status do pedido
	async avancarStatusPedido(orderId, novoStatus) {
		try {
			const { error } = await this.supabase
				.from('pedidos')
				.update({ status: novoStatus })
				.eq('id', orderId);

			if (error) {
				console.error('Erro ao atualizar status:', error);
				alert('Erro ao atualizar status do pedido');
				return;
			}

			// Atualizar lista local
			const order = this.orders.find(o => o.id == orderId);
			if (order) {
				order.status = novoStatus;
			}
			this.handleStatusEmailTriggers(orderId, novoStatus);
			// Recarregar dados
			await this.loadData();
			alert(`Status atualizado para: ${novoStatus}`);
		} catch (error) {
			console.error('Erro ao avançar status:', error);
			alert('Erro ao avançar status do pedido');
		}
	}

	// Função para mostrar notificação quando email já foi enviado
	showEmailAlreadySentNotification(status) {
		const statusLabels = {
			'confirmado': 'Pedido Confirmado',
			'producao': 'Em Produção',
			'saiu_entrega': 'Saiu para Entrega',
			'entregue': 'Pedido Entregue',
			'agradecimento': 'Agradecimento'
		};
		const statusLabel = statusLabels[status] || status;
		console.log(`ℹ️ Email de "${statusLabel}" já foi enviado anteriormente para este pedido`);
		this.showAlert('alert.email_ja_enviado', { status: statusLabel });
	}

	// Função para enviar email via Gmail
	async enviarEmailStatus(orderId, status) {
		console.log(`📧 enviarEmailStatus chamado: orderId=${orderId}, status=${status}`);
		
		// SEMPRE buscar do banco para garantir email_sent_steps atualizado
		console.log(`📧 Buscando pedido atualizado no Supabase...`);
		
		const { data, error } = await this.supabase
			.from('pedidos')
			.select(`
				*,
				idioma,
				email_sent_steps,
				clientes(nome, email, telefone, idioma),
				pedido_itens(
					id,
					quantidade,
					preco_unitario,
					produtos(nome)
				)
			`)
			.eq('id', orderId)
			.single();
		
		if (error || !data) {
			console.error('Pedido não encontrado:', error);
			return;
		}
		
		const order = {
			...data,
			cliente_nome: data.clientes?.nome,
			email: data.clientes?.email,
			telefone: data.clientes?.telefone,
			idioma: data.idioma || data.clientes?.idioma,
			itens: data.pedido_itens || []
		};
		console.log(`📧 Pedido encontrado no Supabase com email_sent_steps:`, order.email_sent_steps);
		
		if (!order.email) {
			console.warn('Cliente não tem email cadastrado para o pedido:', orderId);
			return;
		}

		// Verificar se o email já foi enviado para este status
		const normalizedStatus = this.normalizeOrderStatus(status);
		console.log(`📧 Status original: "${status}", normalizado: "${normalizedStatus}"`);
		console.log(`📧 email_sent_steps do pedido:`, order.email_sent_steps);
		console.log(`📧 Tipo de email_sent_steps:`, typeof order.email_sent_steps);
		console.log(`📧 É array?`, Array.isArray(order.email_sent_steps));
		
		const emailAlreadySent = order.email_sent_steps && Array.isArray(order.email_sent_steps) && order.email_sent_steps.includes(normalizedStatus);
		console.log(`📧 Email já enviado para "${normalizedStatus}"? ${emailAlreadySent}`);
		
		if (emailAlreadySent) {
			console.log(`📧 ⚠️ BLOQUEIO: Email de "${normalizedStatus}" já foi enviado anteriormente para o pedido ${orderId}`);
			this.showEmailAlreadySentNotification(normalizedStatus);
			return; // Não enviar email duplicado
		}
		
		console.log(`📧 ✅ Validação passou - Email de "${normalizedStatus}" pode ser enviado`);

		if (!this.sendPulseService) {
			console.log(`📧 Inicializando sendPulseService...`);
			// Aguardar até que BrevoEmailService esteja disponível
			let attempts = 0;
			while (!window.BrevoEmailService && attempts < 50) {
				await new Promise(resolve => setTimeout(resolve, 100));
				attempts++;
			}
			if (!window.BrevoEmailService) {
				console.error(`❌ BrevoEmailService não está disponível no objeto window após ${attempts} tentativas`);
				throw new Error('BrevoEmailService não foi carregado');
			}
			this.sendPulseService = new window.BrevoEmailService();
			console.log(`✅ sendPulseService inicializado com sucesso`);
		}

		console.log(`📧 Idioma do pedido:`, order.idioma);
		console.log(`📧 Cliente idioma:`, order.clientes?.idioma);
		console.log(`📧 Order completo para debug:`, order);
		
		const emailHtml = this.sendPulseService.getEmailTemplate(normalizedStatus, order);
		const subject = this.sendPulseService.getSubject(normalizedStatus, order);

		console.log(`📧 Enviando email para ${order.email} - Status: ${status}`);
		console.log(`📧 Assunto: ${subject}`);
		console.log(`📧 Template: ${normalizedStatus}`);

		const result = await this.sendPulseService.sendEmail({
			to: order.email,
			subject: subject,
			html: emailHtml
		});

		console.log(`📧 Resultado do envio:`, result);

		if (result.success) {
			console.log(`✅ Email enviado com sucesso para ${order.email} - Status: ${this.getStatusLabel(status)}`);

			// Tentar atualizar email_sent_steps
			try {
				// Inicializar array se não existir ou não for array
				if (!Array.isArray(order.email_sent_steps)) {
					console.log(`📧 Inicializando email_sent_steps como array vazio`);
					order.email_sent_steps = [];
				}
				
				console.log(`📧 email_sent_steps antes de adicionar:`, order.email_sent_steps);
				
				if (!order.email_sent_steps.includes(normalizedStatus)) {
					order.email_sent_steps.push(normalizedStatus);
					console.log(`📧 email_sent_steps depois de adicionar:`, order.email_sent_steps);

					const { data: updateData, error: updateError } = await this.supabase
						.from('pedidos')
						.update({ email_sent_steps: order.email_sent_steps })
						.eq('id', orderId)
						.select();

					if (updateError) {
						console.error(`❌ Erro ao atualizar email_sent_steps:`, updateError);
					} else {
						console.log(`✅ Email marcado como enviado para status "${normalizedStatus}" do pedido ${orderId}`);
						console.log(`📧 Dados atualizados no banco:`, updateData);
					}
				} else {
					console.log(`ℹ️ Status "${normalizedStatus}" já está em email_sent_steps, não adicionando novamente`);
				}
				
				await this.loadData();
			} catch (updateError) {
				console.error('❌ Erro ao atualizar email_sent_steps:', updateError);
				await this.loadData();
			}
		} else {
			console.error(`❌ Erro ao enviar email: ${result.error}`);
		}
	}
	prevProdutoPhotoDetalhe() {
		const carousel = document.getElementById('produto-detalhe-carousel');
		if (!carousel) return;
		let current = parseInt(carousel.getAttribute('data-current')) || 0;
		const total = carousel.children.length;
		current = (current - 1 + total) % total;
		carousel.setAttribute('data-current', current);
		carousel.style.transform = `translateX(-${current * 100}%)`;
	}
	nextProdutoPhotoDetalhe() {
		const carousel = document.getElementById('produto-detalhe-carousel');
		if (!carousel) return;
		let current = parseInt(carousel.getAttribute('data-current')) || 0;
		const total = carousel.children.length;
		current = (current + 1) % total;
		carousel.setAttribute('data-current', current);
		carousel.style.transform = `translateX(-${current * 100}%)`;
	}
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', async () => {
	try {
		// Aguardar inicialização do authSystem
		let authAttempts = 0;
		while (!window.authSystem?.isInitialized && authAttempts < 50) {
			console.log('⏳ Aguardando inicialização do authSystem...');
			await new Promise(resolve => setTimeout(resolve, 100));
			authAttempts++;
		}

		if (!window.authSystem?.isInitialized) {
			console.error('❌ authSystem não inicializado após 5 segundos');
			return;
		}

		const app = new DashboardApp();
		const initialized = await app.initialize();
		if (initialized) {
			window.dashboardApp = app;
			console.log('✅ DashboardApp inicializado com sucesso');
		} else {
			console.error('❌ Falha na inicialização do DashboardApp');
		}
	} catch (error) {
		console.error('Erro ao inicializar aplicação:', error);
	}
});
// CACHE DE VALIDAÇÃO DE CLIENTE (10 minutos) - MÉTODOS DA CLASSE DASHBOARDAPP
// Estes métodos são adicionados à classe DashboardApp
DashboardApp.prototype.getValidacaoClienteCache = function() {
	try {
		const cache = sessionStorage.getItem('cliente_validacao_cache');
		if (!cache) return null;
		const data = JSON.parse(cache);
		const agora = Date.now();
		const tempoDecorrido = agora - data.timestamp;
		// Verificar se não passou 10 minutos (600000 ms)
		if (tempoDecorrido > 600000) {
			console.log('⏰ Cache de validação expirado, removendo');
			sessionStorage.removeItem('cliente_validacao_cache');
			return null;
		}
		console.log(`✅ Cache válido: ${Math.round(tempoDecorrido / 1000)}s restantes`);
		return data;
	} catch (error) {
		console.error('Erro ao ler cache de validação:', error);
		sessionStorage.removeItem('cliente_validacao_cache');
		return null;
	}
};
DashboardApp.prototype.setValidacaoClienteCache = function(cliente) {
	try {
		const data = {
			cliente: cliente,
			timestamp: Date.now()
		};
		sessionStorage.setItem('cliente_validacao_cache', JSON.stringify(data));
		console.log('💾 Validação de cliente armazenada em cache (10 min)');
	} catch (error) {
		console.error('Erro ao salvar cache de validação:', error);
	}
};
DashboardApp.prototype.clearValidacaoClienteCache = function() {
	try {
		sessionStorage.removeItem('cliente_validacao_cache');
		console.log('🗑️ Cache de validação removido');
	} catch (error) {
		console.error('Erro ao remover cache de validação:', error);
	}
};
// Funções globais
function closeModal(modalId) {
	const modal = document.getElementById(modalId);
	if (modal) {
		modal.classList.add('closing');
		modal.classList.remove('show');
		modal.style.display = 'none !important';
		modal.remove();
	}
// ===== TIMELINE DE STATUS DO PEDIDO =====
// Função para abrir timeline de status com ícones clicáveis
function closeModalOverlay(event) {
	if (event.target.classList.contains('modal-overlay')) {
		const modalId = event.currentTarget.id;
		closeModal(modalId);
	}
// ===== SISTEMA DE EMAIL MANUAL VIA GMAIL COMPOSE =====
// ===== TIMELINE DE STATUS DO PEDIDO =====
		if (!order) {
			alert('Pedido não encontrado');
			return;
		}
		const modalsContainer = document.getElementById('modals-container');
		if (!modalsContainer) return;
		modalsContainer.innerHTML = '';
		const modalId = 'timeline-modal';
		const modal = document.createElement('div');
		modal.id = modalId;
		modal.className = 'modal-overlay show';
		modal.onclick = closeModalOverlay;
		const statusOptions = window.dashboardApp?.getTimelineStatuses ? window.dashboardApp.getTimelineStatuses() : [
			{ key: 'pendente', label: 'Pedido Recebido', emoji: '📥', color: '#ffc107', description: 'Pedido recebido e aguardando validação do time.' },
			{ key: 'confirmado', label: 'Pedido Confirmado', emoji: '✅', color: '#28a745', description: 'Detalhes e agenda confirmados. Cliente deve finalizar o pagamento.' },
			{ key: 'producao', label: 'Em Produção', emoji: '👩‍🍳', color: '#fd7e14', description: 'Pagamento validado e pedido em preparação.' },
			{ key: 'entregue', label: 'Pedido Entregue', emoji: '🚚', color: '#20c997', description: 'Pedido finalizado e entregue ao cliente.' }
		];
		const normalizedStatus = window.dashboardApp?.normalizeOrderStatus ? window.dashboardApp.normalizeOrderStatus(order.status) : order.status;
		const currentStatusIndex = statusOptions.findIndex(s => s.key === normalizedStatus);
		modal.innerHTML = `
			<div class="modal-content-wrapper" style="background: #fff; border-radius: 18px; max-width: 600px; width: 100%; padding: 2rem 1.5rem; box-shadow: 0 6px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; gap: 1.3rem; max-height: 90vh; overflow-y: auto;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
					<h3 style="margin: 0; font-size: 1.5rem; color: #333;">📋 Timeline do Pedido #${order.numero_pedido}</h3>
					<button onclick="closeModal('${modalId}')" style="background:none; border:none; font-size:1.5rem; color:#888; cursor:pointer;">&times;</button>
				</div>
				<div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
					<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
						<div style="width: 40px; height: 40px; border-radius: 50%; background: #007bff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
							${order.cliente_nome.charAt(0).toUpperCase()}
						</div>
						<div>
							<h4 style="margin: 0; color: #333;">${order.cliente_nome}</h4>
							<p style="margin: 0; color: #666; font-size: 0.9rem;">${order.numero_pedido}</p>
						</div>
					</div>
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<span style="font-weight: 600; color: #28a745;">R$ ${this.formatCurrency(order.valor_total)}</span>
						<span style="font-size: 0.9rem; color: #666;">${order.data_entrega ? new Date(order.data_entrega).toLocaleDateString('pt-BR') : 'Data não definida'}</span>
					</div>
				</div>
				<div style="display: flex; flex-direction: column; gap: 1rem;">
					${statusOptions.map((status, index) => {
						const isCompleted = index <= currentStatusIndex;
						const isCurrent = index === currentStatusIndex;
						const canAdvance = index === currentStatusIndex + 1;
						return `
							<div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 12px; background: ${isCompleted ? '#e8f5e8' : isCurrent ? '#fff3cd' : '#f8f9fa'}; border: 2px solid ${isCompleted ? '#28a745' : isCurrent ? '#ffc107' : '#dee2e6'}; transition: all 0.3s ease;">
								<div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
									<div style="width: 50px; height: 50px; border-radius: 50%; background: ${status.color}; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; cursor: ${canAdvance ? 'pointer' : 'default'}; transition: transform 0.2s ease;" 
										 onclick="${canAdvance ? `window.dashboardApp.avancarStatusPedido('${order.id}', '${status.key}')` : ''}"
										 onmouseover="${canAdvance ? `this.style.transform='scale(1.1)'` : ''}"
										 onmouseout="${canAdvance ? `this.style.transform='scale(1)'` : ''}">
										${status.emoji}
									</div>
									${canAdvance ? `<button style="background: ${status.color}; color: white; border: none; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.8rem; cursor: pointer;" onclick="window.dashboardApp.avancarStatusPedido('${order.id}', '${status.key}')">Avançar</button>` : ''}
								</div>
								<div style="flex: 1;">
									<h4 style="margin: 0 0 0.25rem 0; color: ${isCompleted ? '#28a745' : isCurrent ? '#856404' : '#6c757d'};">
										${status.label} ${isCompleted ? '✓' : isCurrent ? '🔄' : ''}
									</h4>
									<p style="margin: 0; color: #666; font-size: 0.9rem;">${status.description}</p>
									${isCompleted ? `<small style="color: #28a745; font-weight: 600;">Concluído</small>` : isCurrent ? `<small style="color: #856404; font-weight: 600;">Em andamento</small>` : `<small style="color: #6c757d;">Pendente</small>`}
								</div>
								${isCompleted || isCurrent ? `
									<button style="background: #007bff; color: white; border: none; border-radius: 6px; padding: 0.5rem 1rem; cursor: pointer;" 
											onclick="window.dashboardApp.enviarEmailStatus('${order.id}', '${status.key}')">
										📧 Enviar Email
									</button>
								` : ''}
							</div>
						`;
					}).join('')}
				</div>
				<div style="text-align: center; margin-top: 1rem;">
					<button onclick="closeModal('${modalId}')" style="background: #6c757d; color: white; border: none; border-radius: 8px; padding: 0.75rem 2rem; font-size: 1rem; cursor: pointer;">
						Fechar
					</button>
				</div>
			</div>
		`;
		modalsContainer.appendChild(modal);
	}
};

// Gerar corpo do email baseado no status
function gerarCorpoEmailStatus(order, status) {
	const saudacao = `Olá ${order.cliente_nome},`;

	// Template HTML profissional
	const htmlTemplate = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leo&apos;s Cake - Atualização do Pedido</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8f9fa;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #ff6b9d, #ffa726);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            margin: 10px 0;
        }
        .pedido-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #ff6b9d;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
        }
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .valor-total {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border-radius: 8px;
        }
        .footer {
            background: #343a40;
            color: white;
            padding: 25px 20px;
            text-align: center;
        }
        .contato-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .contato-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .assinatura {
            border-top: 1px solid #495057;
            padding-top: 15px;
            font-style: italic;
            opacity: 0.8;
        }
        .emoji {
            font-size: 20px;
        }
        @media (max-width: 480px) {
            .contato-info {
                flex-direction: column;
                gap: 10px;
            }
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🍰 Leo&apos;s Cake</div>
            <div class="subtitle">Doces artesanais com amor</div>
        </div>

        <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">${saudacao}</h2>

            <div class="status-badge" style="background: ${getStatusColor(status)};">
                ${getStatusEmoji(status)} ${getStatusLabel(status)}
            </div>

            <div class="pedido-info">
                <h3 style="margin: 0 0 15px 0; color: #ff6b9d;">📋 Informações do Pedido</h3>
                <div class="info-item">
                    <strong>Número do Pedido:</strong>
                    <span>${order.numero_pedido}</span>
                </div>
                ${order.data_entrega ? `
                <div class="info-item">
                    <strong>Previsão de Entrega:</strong>
                    <span>${new Date(order.data_entrega).toLocaleDateString('pt-BR')}</span>
                </div>
                ` : ''}
                <div class="info-item">
                    <strong>Status Atual:</strong>
                    <span>${getStatusLabel(status)}</span>
                </div>
            </div>

            <div class="valor-total">
                💰 R$ ${order.valor_total ? parseFloat(order.valor_total).toFixed(2) : '0.00'}
            </div>

            <p style="font-size: 16px; line-height: 1.6; margin: 20px 0;">
                ${getStatusMessage(order, status)}
            </p>

            <p style="color: #666; font-style: italic;">
                Qualquer dúvida, estamos à disposição para ajudar!
            </p>
        </div>

        <div class="footer">
            <div class="contato-info">
                <div class="contato-item">
                    <span class="emoji">📞</span>
                    <span>(11) 99999-9999</span>
                </div>
                <div class="contato-item">
                    <span class="emoji">📧</span>
                    <span>contato@leoscake.com</span>
                </div>
                <div class="contato-item">
                    <span class="emoji">🏪</span>
                    <span>Retirada em nossa loja</span>
                </div>
            </div>

            <div class="assinatura">
                <strong>Equipe Leo&apos;s Cake</strong><br>
                Doces feitos com muito carinho especialmente para você! 🍰✨
            </div>
        </div>
    </div>
</body>
</html>`;

	return htmlTemplate;
}

// Funções auxiliares para o email
function getStatusColor(status) {
	const colors = {
		'pendente': '#ffc107',
		'confirmado': '#28a745',
		'producao': '#fd7e14',
		'pago': '#20c997',
		'entregue': '#17a2b8'
	};
	return colors[status] || '#6c757d';
}

function getStatusEmoji(status) {
	const emojis = {
		'pendente': '⏳',
		'confirmado': '✅',
		'producao': '👨‍🍳',
		'pago': '💰',
		'entregue': '🚚'
	};
	return emojis[status] || '📦';
}

function getStatusLabel(status) {
	const labels = {
		'pendente': 'Pendente',
		'confirmado': 'Confirmado',
		'producao': 'Em Produção',
		'pago': 'Pago',
		'entregue': 'Entregue'
	};
	return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

function gerarCorpoEmailTexto(order, status) {
	// Importar configurações da empresa
	const empresa = {
		nome: 'Leo\'s Cake',
		email: 'leoscakegta@gmail.com',
		telefone: '+1 437 243 2072',
		endereco: '60-561 Childs Drive, Milton, ON, L9T 3Z1',
		website: 'https://leohena.github.io/leos-cake/vendas-online.html'
	};

	// Banner profissional
	const banner = `
╔══════════════════════════════════════════════════════════════╗
║                     🍰 LEO'S CAKE 🍰                        ║
║                 Doces Artesanais com Amor                   ║
║                                                              ║
║  📧 ${empresa.email.padEnd(56)} ║
║  📞 ${empresa.telefone.padEnd(56)} ║
║  🏪 ${empresa.endereco.substring(0, 56).padEnd(56)} ║
║  🌐 ${empresa.website.substring(0, 56).padEnd(56)} ║
╚══════════════════════════════════════════════════════════════╝
	`.trim();

	const saudacao = `Olá ${order.cliente_nome},`;

	const statusMessages = {
		'recebido': `Seu pedido #${order.numero_pedido} foi recebido com sucesso!\n\nDetalhes do pedido:\n- Cliente: ${order.cliente_nome}\n- Valor: R$ ${order.valor_total}\n- Tipo: ${order.tipo_entrega}\n${order.data_entrega ? `- Data de entrega: ${new Date(order.data_entrega).toLocaleDateString('pt-BR')}\n` : ''}\nAguarde a confirmação do pagamento para prosseguir com a produção.`,
		'confirmado': `Seu pedido #${order.numero_pedido} foi confirmado!\n\nEstamos aguardando a confirmação do pagamento para iniciar a produção dos seus doces.`,
		'producao': `Seu pedido #${order.numero_pedido} está em produção!\n\nNossos confeiteiros estão preparando seus doces com todo carinho. ${order.data_entrega ? `Seu pedido será entregue em ${new Date(order.data_entrega).toLocaleDateString('pt-BR')}.` : 'Entraremos em contato em breve com a data de entrega.'}`,
		'pago': `O pagamento do seu pedido #${order.numero_pedido} foi confirmado!\n\nSeu pedido está sendo preparado e ${order.data_entrega ? `será entregue em ${new Date(order.data_entrega).toLocaleDateString('pt-BR')}.` : 'entraremos em contato com a data de entrega.'}`,
		'entregue': `Seu pedido #${order.numero_pedido} foi entregue com sucesso!\n\nObrigado por escolher a Leo's Cake. Esperamos que tenha gostado dos nossos doces!\n\nVolte sempre!\n\nAtenciosamente,\nEquipe Leo's Cake`
	};

	const mensagemStatus = statusMessages[status] || `Atualização do seu pedido. Status: ${getStatusLabel(status)}`;

	return `${banner}\n\n${saudacao}\n\n${mensagemStatus}\n\nAtenciosamente,\nEquipe Leo's Cake\n\n${'═'.repeat(62)}\n🍰 Doces feitos com muito carinho especialmente para você! 🍰`;
}

function getStatusMessage(order, status) {
	const messages = {
		'pendente': `Recebemos seu pedido e estamos processando. Entraremos em contato em breve para confirmar todos os detalhes.`,
		'confirmado': `Seu pedido foi confirmado com sucesso! Estamos preparando tudo com muito carinho para você.`,
		'producao': `Seu pedido está sendo preparado em nossa cozinha. ${order.data_entrega ? `A entrega está prevista para ${new Date(order.data_entrega).toLocaleDateString('pt-BR')}.` : 'Entraremos em contato com a data de entrega.'}`,
		'pago': `O pagamento do seu pedido foi confirmado! Seu pedido está sendo preparado e ${order.data_entrega ? `será entregue em ${new Date(order.data_entrega).toLocaleDateString('pt-BR')}.` : 'entraremos em contato com a data de entrega.'}`,
		'entregue': `Seu pedido foi entregue com sucesso! Obrigado por escolher a Leo's Cake. Esperamos que tenha gostado dos nossos doces! Volte sempre!`
	};
	return messages[status] || `Atualização do seu pedido. Status: ${getStatusLabel(status)}`;
}// Tornar DashboardApp disponível globalmente
window.DashboardApp = DashboardApp;
// Copiar banner visual profissional como imagem (alta resolução)
DashboardApp.prototype.copiarBannerComoImagem = async function(orderId, statusKey) {
	const order = this.orders.find(o => o.id == orderId);
	if (!order) return;
	const empresa = this.emailConfig?.empresa || {};
	const statusLabels = {
		recebido: 'Pedido Recebido',
		confirmado: 'Pedido Confirmado',
		producao: 'Em Produção',
		pago: 'Pagamento Confirmado',
		entregue: 'Pedido Entregue'
	};
	const statusColors = {
		recebido: '#ffb347',
		confirmado: '#6bc6ff',
		producao: '#ffe58f',
		pago: '#a3e635',
		entregue: '#28a745'
	};
	const statusEmojis = {
		recebido: '📥',
		confirmado: '✅',
		producao: '👩‍🍳',
		pago: '💰',
		entregue: '🎁'
	};
	const label = statusLabels[statusKey] || 'Atualização';
	const color = statusColors[statusKey] || '#ffe58f';
	const emoji = statusEmojis[statusKey] || '🔔';
	const mensagem = window.getStatusMessage(order, statusKey);
	// Canvas alta resolução
	const width = 960, height = 640;
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	// Fundo
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, width, height);
	// Box central
	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#eee';
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.roundRect(60, 60, width-120, height-120, 32);
	ctx.fill();
	ctx.stroke();
	// Logo
	const img = new window.Image();
	img.src = empresa.logo || 'images/logo-png.png';
	await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
	if (img.src) ctx.drawImage(img, width/2-60, 90, 120, 120);
	// Título
	ctx.font = 'bold 44px Segoe UI, Arial';
	ctx.fillStyle = '#ff6b9d';
	ctx.textAlign = 'center';
	ctx.fillText(empresa.nome || "Leo's Cake", width/2, 250);
	// Status
	ctx.font = 'bold 36px Segoe UI, Arial';
	ctx.fillStyle = '#333';
	ctx.fillText(`${emoji} ${label}`, width/2, 310);
	// Mensagem
	ctx.font = '28px Segoe UI, Arial';
	ctx.fillStyle = '#333';
	const msgLines = (mensagem || '').split('\n');
	let yMsg = 360;
	for (const line of msgLines) {
		ctx.fillText(line, width/2, yMsg);
		yMsg += 36;
	}
	// Dados empresa
	ctx.font = '24px Segoe UI, Arial';
	ctx.fillStyle = '#555';
	ctx.fillText(empresa.endereco || '', width/2, height-180);
	ctx.fillText(empresa.telefone || '', width/2, height-150);
	ctx.fillText(empresa.email || '', width/2, height-120);
	ctx.fillText(empresa.website || '', width/2, height-90);
	// Rodapé
	ctx.font = 'italic 26px Segoe UI, Arial';
	ctx.fillStyle = '#ff6b9d';
	ctx.fillText('🍰 Doces feitos com carinho especialmente para você! 🍰', width/2, height-40);
	// Copia para clipboard
	canvas.toBlob(async blob => {
		try {
			await navigator.clipboard.write([
				new window.ClipboardItem({ 'image/png': blob })
			]);
			alert('Banner copiado como imagem! Cole diretamente no corpo do e-mail.');
		} catch (e) {
			alert('Não foi possível copiar como imagem. Use navegador moderno.');
		}
	}, 'image/png');
};
// Copiar banner como HTML profissional para e-mail
DashboardApp.prototype.copiarBannerEmailHTML = function(orderId, statusKey) {
		const order = this.orders.find(o => o.id == orderId);
		if (!order) return;
		const empresa = this.emailConfig?.empresa || {};
		const statusLabels = {
				recebido: 'Pedido Recebido',
				confirmado: 'Pedido Confirmado',
				producao: 'Em Produção',
				pago: 'Pagamento Confirmado',
				entregue: 'Pedido Entregue'
		};
		const statusColors = {
				recebido: '#ffb347',
				confirmado: '#6bc6ff',
				producao: '#ffe58f',
				pago: '#a3e635',
				entregue: '#28a745'
		};
		const statusEmojis = {
				recebido: '📥',
				confirmado: '✅',
				producao: '👩‍🍳',
				pago: '💰',
				entregue: '🎁'
		};
		const label = statusLabels[statusKey] || 'Atualização';
		const color = statusColors[statusKey] || '#ffe58f';
		const emoji = statusEmojis[statusKey] || '🔔';
		const mensagem = window.getStatusMessage(order, statusKey);
		// HTML profissional para e-mail (compatível, limpo)
		const html = `
		<table cellpadding='0' cellspacing='0' width='100%' style='max-width:480px; margin:auto; border-radius:16px; background:${color}; font-family:Arial,Helvetica,sans-serif;'>
			<tr>
				<td align='center' style='padding:24px 0 8px 0;'>
					<img src='${empresa.logo || 'images/logo-png.png'}' alt='Logo Leo\'s Cake' width='70' height='70' style='border-radius:12px;'/>
				</td>
			</tr>
			<tr>
				<td align='center' style='padding-bottom:8px;'>
					<span style='font-size:22px; color:#ff6b9d; font-weight:bold;'>${empresa.nome || "Leo's Cake"}</span>
				</td>
			</tr>
			<tr>
				<td align='center' style='padding-bottom:8px;'>
					<span style='font-size:17px; color:#333;'>${emoji} <b>${label}</b></span>
				</td>
			</tr>
			<tr>
				<td align='center' style='padding:0 18px 8px 18px;'>
					<span style='font-size:15px; color:#333;'>${mensagem}</span>
				</td>
			</tr>
			<tr>
				<td align='center' style='padding-bottom:8px;'>
					<span style='font-size:14px; color:#555;'>${empresa.endereco || ''}<br>${empresa.telefone || ''}<br>${empresa.email || ''}<br><a href='${empresa.website || '#'}' style='color:#007bff;text-decoration:none;'>${empresa.website || ''}</a></span>
				</td>
			</tr>
			<tr>
				<td align='center' style='padding-bottom:18px;'>
					<span style='color:#ff6b9d; font-size:15px;'>🍰 Doces feitos com carinho especialmente para você! 🍰</span>
				</td>
			</tr>
		</table>
		`;
		navigator.clipboard.writeText(html).then(() => {
				alert('Banner HTML copiado! Cole diretamente no corpo do e-mail.');
		});
};

// Função para carregar dados mockados quando offline
DashboardApp.prototype.loadMockData = function() {
	console.log('🎭 Carregando dados mockados para testes...');

	// Dados mockados de clientes
	this.clients = [
		{
			id: 1,
			nome: 'João Silva',
			telefone: '(11) 99999-9999',
			email: 'joao@email.com',
			endereco: 'Rua das Flores, 123 - São Paulo/SP',
			canal: 'whatsapp',
			created_at: new Date().toISOString()
		},
		{
			id: 2,
			nome: 'Maria Santos',
			telefone: '(11) 88888-8888',
			email: 'maria@email.com',
			endereco: 'Av. Paulista, 456 - São Paulo/SP',
			canal: 'instagram',
			created_at: new Date().toISOString()
		}
	];

	// Dados mockados de produtos
	this.stock = [
		{
			id: 1,
			nome: 'Chocolate Cake',
			preco: 45.00,
			status_produto: 'ativo',
			quantidade: 10
		},
		{
			id: 2,
			nome: 'Strawberry Pie',
			preco: 35.00,
			status_produto: 'ativo',
			quantidade: 5
		},
		{
			id: 3,
			nome: 'Cupcake',
			preco: 8.00,
			status_produto: 'ativo',
			quantidade: 20
		}
	];

	// Dados mockados de pedidos
	this.orders = [
		{
			id: 1,
			numero_pedido: '001',
			cliente_nome: 'João Silva',
			cliente_id: 1,
			status: 'confirmado',
			valor_total: 45.00,
			valor_pago: 22.50,
			forma_pagamento: 'dinheiro',
			data_entrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias no futuro
			itens: [
				{ produto_nome: 'Chocolate Cake', quantidade: 1, preco: 45.00 }
			],
			created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 dia no passado
		},
		{
			id: 2,
			numero_pedido: '002',
			cliente_nome: 'Maria Santos',
			cliente_id: 2,
			status: 'producao',
			valor_total: 35.00,
			valor_pago: 35.00,
			forma_pagamento: 'cartao',
			data_entrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias no futuro
			itens: [
				{ produto_nome: 'Strawberry Pie', quantidade: 1, preco: 35.00 }
			],
			created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 dias no passado
		}
	];

	// Dados mockados de entregas
	this.entregas = [
		{
			id: 1,
			pedido_id: 1,
			cliente_nome: 'João Silva',
			endereco: 'Rua das Flores, 123 - São Paulo/SP',
			data_entrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
			status: 'pendente',
			observacoes: 'Entregar até 14h'
		}
	];

	// Dados mockados de despesas/receitas
	this.despesas = [
		{
			id: 1,
			descricao: 'Compra de ingredientes',
			valor: 150.00,
			data: new Date().toISOString(),
			categoria: 'ingredientes'
		}
	];

	this.receitas = [
		{
			id: 1,
			pedido_id: 1,
			valor: 22.50,
			data: new Date().toISOString(),
			forma_pagamento: 'dinheiro'
		},
		{
			id: 2,
			pedido_id: 2,
			valor: 35.00,
			data: new Date().toISOString(),
			forma_pagamento: 'cartao'
		}
	];

	console.log('✅ Dados mockados carregados com sucesso!');
	console.log(`📊 ${this.clients.length} clientes, ${this.stock.length} produtos, ${this.orders.length} pedidos`);
};
