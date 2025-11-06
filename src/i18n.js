// i18n.js - Sistema de Internacionalização

const translations = {
	'pt-BR': {
		// Dashboard - Cards
		'dashboard.produtos': 'Produtos',
		'dashboard.clientes': 'Clientes',
		'dashboard.pedidos': 'Pedidos Pendentes',
		'dashboard.estoque': 'Estoque',
		'dashboard.entregas': 'Entregas Hoje',
		'dashboard.bem_vindo': 'Bem-vindo(a)',
		'dashboard.entregas_hoje': 'Entregas de Hoje',

		// Navegação
		'nav.dashboard': 'Dashboard',
		'nav.produtos': 'Produtos',
		'nav.clientes': 'Clientes',
		'nav.pedidos': 'Pedidos',
		'nav.entregas': 'Entregas',

		// Botões
		'btn.add': 'Adicionar',
		'btn.save': 'Salvar',
		'btn.cancel': 'Cancelar',
		'btn.delete': 'Deletar',
		'btn.edit': 'Editar',
		'btn.logout': 'Sair',
		'btn.profile': 'Perfil',

		// Modal Perfil
		'modal.perfil': 'Meu Perfil',
		'modal.alterar_foto': 'Alterar Foto',
		'modal.nome': 'Nome Completo',
		'modal.email': 'Email',
		'modal.cancelar': 'Cancelar',
		'modal.salvar': 'Salvar',

		// Mensagens vazias
		'msg.sem_dados': 'Sem dados para exibir',
		'msg.nenhum_produto': 'Nenhum produto cadastrado',
		'msg.nenhum_cliente': 'Nenhum cliente cadastrado',
		'msg.nenhum_pedido': 'Nenhum pedido cadastrado',
		'msg.nenhuma_entrega': 'Nenhuma entrega agendada para hoje',

		// Seções
		'section.dashboard': 'Dashboard',
		'section.clientes': '👥 Clientes',
		'section.produtos': '🍰 Produtos',
		'section.pedidos': '📋 Pedidos',
		'section.estoque': '📦 Estoque',
		'section.entregas': '🚚 Entregas',

		// Detalhes
		'detail.telefone': 'Telefone',
		'detail.endereco': 'Endereço',
		'detail.preco': 'Preço',
		'detail.estoque_unidades': 'Estoque',
		'detail.data': 'Data',
		'detail.status': 'Status',
		'detail.horario': 'Horário',
		'detail.pedido': 'Pedido'
	},
	'en-US': {
		// Dashboard - Cards
		'dashboard.produtos': 'Products',
		'dashboard.clientes': 'Clients',
		'dashboard.pedidos': 'Pending Orders',
		'dashboard.estoque': 'Stock',
		//'dashboard.entregas': 'Deliveries Today',
		'dashboard.bem_vindo': 'Welcome',
		'dashboard.entregas_hoje': 'Today\'s Deliveries',

		// Navigation
		'nav.dashboard': 'Dashboard',
		'nav.produtos': 'Products',
		'nav.clientes': 'Clients',
		'nav.pedidos': 'Orders',
		'nav.entregas': 'Deliveries',

		// Buttons
		'btn.add': 'Add',
		'btn.save': 'Save',
		'btn.cancel': 'Cancel',
		'btn.delete': 'Delete',
		'btn.edit': 'Edit',
		'btn.logout': 'Logout',
		'btn.profile': 'Profile',

		// Modal Profile
		'modal.perfil': 'My Profile',
		'modal.alterar_foto': 'Change Photo',
		'modal.nome': 'Full Name',
		'modal.email': 'Email',
		'modal.cancelar': 'Cancel',
		'modal.salvar': 'Save',

		// Empty messages
		'msg.sem_dados': 'No data to display',
		'msg.nenhum_produto': 'No products registered',
		'msg.nenhum_cliente': 'No clients registered',
		'msg.nenhum_pedido': 'No orders registered',
		'msg.nenhuma_entrega': 'No delivery scheduled for today',

		// Sections
		'section.dashboard': 'Dashboard',
		'section.clientes': '👥 Clients',
		'section.produtos': '🍰 Products',
		'section.pedidos': '📋 Orders',
		'section.estoque': '📦 Stock',
		'section.entregas': '🚚 Deliveries',

		// Details
		'detail.telefone': 'Phone',
		'detail.endereco': 'Address',
		'detail.preco': 'Price',
		'detail.estoque_unidades': 'Stock',
		'detail.data': 'Date',
		'detail.status': 'Status',
		'detail.horario': 'Time',
		'detail.pedido': 'Order'
	}
};

// Obter idioma atual
function getCurrentLang() {
	return localStorage.getItem('lang') || 'pt-BR';
}

// Traduzir chave
function t(key) {
	const lang = getCurrentLang();
	const result = translations[lang]?.[key] || translations['pt-BR'][key] || key;
	return result;
}

// Aplicar traduções no DOM
function applyTranslations() {
	document.querySelectorAll('[data-i18n]').forEach(el => {
		const key = el.getAttribute('data-i18n');
		el.textContent = t(key);
	});
}

// Mudar idioma
function setLang(lang) {
	if (translations[lang]) {
		localStorage.setItem('lang', lang);
		applyTranslations();
		console.log('🌐 Idioma alterado para:', lang);
		
		// Disparar evento customizado para notificar outras partes do app
		const event = new CustomEvent('languageChanged', { 
			detail: { lang: lang } 
		});
		window.dispatchEvent(event);
	} else {
		console.warn('⚠️ Idioma não suportado:', lang);
	}
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		applyTranslations();
		console.log('✅ i18n inicializado com idioma:', getCurrentLang());
	});
} else {
	applyTranslations();
	console.log('✅ i18n inicializado com idioma:', getCurrentLang());
}

// Exportar para uso global
window.t = t;
window.setLang = setLang;
window.getCurrentLang = getCurrentLang;
window.applyTranslations = applyTranslations;