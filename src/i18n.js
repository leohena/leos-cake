// i18n.js - Sistema de Internacionalização Completo

const translations = {
	'pt-BR': {
	'dashboard.confirmados': 'Confirmados',
	'dashboard.pagos': 'Pagos',
	'dashboard.entregues': 'Entregues',
	'dashboard.cancelados': 'Cancelados',
	'dashboard.total_pago': 'Total Pago',
	'dashboard.produtos': 'Produtos',
	'dashboard.clientes': 'Clientes',
	'dashboard.pedidos': 'Pedidos Pendentes',
	'dashboard.pendentes': 'Pendentes',
		'dashboard.estoque': 'Estoque',
		'dashboard.entregas': 'Entregas Hoje',
		'dashboard.bem_vindo': 'Bem-vindo(a)',
		'dashboard.entregas_hoje': 'Follow-up de Entregas',

		'nav.dashboard': 'Dashboard',
		'nav.produtos': 'Produtos',
		'nav.clientes': 'Clientes',
		'nav.pedidos': 'Pedidos',
		'nav.entregas': 'Entregas',

		'btn.add': 'Adicionar',
		'btn.save': 'Salvar',
		'btn.cancel': 'Cancelar',
		'btn.delete': 'Deletar',
		'btn.edit': 'Editar',
		'btn.logout': 'Sair',
		'btn.profile': 'Perfil',
		'btn.new_client': 'Novo Cliente',
		'btn.new_product': 'Novo Produto',
		'btn.new_order': 'Novo Pedido',

		'modal.perfil': 'Meu Perfil',
		'modal.alterar_foto': 'Alterar Foto',
		'modal.nome': 'Nome Completo',
		'modal.email': 'Email',
		'modal.telefone': 'Telefone',
		'modal.endereco': 'Endereço',
		'modal.tipo_usuario': 'Tipo de Usuário',
		'modal.data_cadastro': 'Data de Cadastro',
		'modal.cancelar': 'Cancelar',
		'modal.salvar': 'Salvar',

		'modal.add_client': 'Adicionar Cliente',
		'modal.edit_client': 'Editar Cliente',
		'modal.client_name': 'Nome do Cliente',
		'modal.client_phone': 'Telefone',
		'modal.client_email': 'Email (opcional)',
		'modal.client_address': 'Endereço Completo',

		'modal.add_product': 'Adicionar Produto',
		'modal.edit_product': 'Editar Produto',
		'modal.product_name': 'Nome do Produto',
		'modal.product_price': 'Preço (CAD$)',
		'modal.product_stock': 'Estoque (unidades)',
		'modal.product_description': 'Descrição (opcional)',

		'modal.add_order': 'Adicionar Pedido',
		'modal.edit_order': 'Editar Pedido',
		'modal.order_client': 'Cliente',
		'modal.order_product': 'Produto',
		'modal.order_quantity': 'Quantidade',
		'modal.order_delivery_date': 'Data de Entrega',
		'modal.order_delivery_time': 'Horário',
		'modal.order_delivery_address': 'Endereço de Entrega',
		'modal.order_status': 'Status',
		'modal.order_total': 'Valor Total',

		'status.pendente': 'Pendente',
		'status.pago': 'Pago',
		'status.entregue': 'Entregue',
		'status.cancelado': 'Cancelado',

		'msg.sem_dados': 'Sem dados para exibir',
		'msg.nenhum_produto': 'Nenhum produto cadastrado',
		'msg.nenhum_cliente': 'Nenhum cliente cadastrado',
		'msg.nenhum_pedido': 'Nenhum pedido cadastrado',
		'msg.nenhuma_entrega': 'Nenhuma entrega agendada para hoje',

		'section.dashboard': 'Dashboard',
		'section.clientes': '👥 Clientes',
		'section.produtos': '🍰 Produtos',
		'section.pedidos': '📋 Pedidos',
		'section.estoque': '📦 Estoque',
		'section.entregas': '🚚 Entregas',

		'detail.telefone': 'Telefone',
		'detail.endereco': 'Endereço',
		'detail.preco': 'Preço',
		'detail.estoque_unidades': 'Estoque',
		'detail.data': 'Data',
		'detail.status': 'Status',
		'detail.horario': 'Horário',
		'detail.pedido': 'Pedido',

		'placeholder.search_client': '🔍 Buscar cliente...',
		'placeholder.search_product': '🔍 Buscar produto...',
		'placeholder.search_order': '🔍 Buscar pedido...',
		'placeholder.enter_name': 'Digite o nome',
		'placeholder.enter_phone': '(XX) XXXXX-XXXX',
		'placeholder.enter_email': 'email@exemplo.com',
		'placeholder.enter_address': 'Rua, Número - Bairro',
		'placeholder.enter_price': '0.00',
		'placeholder.enter_stock': '0',
		'placeholder.select_client': 'Selecione um cliente',
		'placeholder.select_product': 'Selecione um produto',

		'currency.symbol': 'CAD$',
		'currency.name': 'Dólar Canadense',

		// Vendas Online
		'vendas_online.titulo': 'Leó\'s Cake - Vendas Online',
		'vendas_online.filtrar': 'Filtrar:',
		'vendas_online.todas_categorias': 'Todas Categorias',
		'vendas_online.adicionar_cliente': 'Adicionar Cliente',
		'vendas_online.total': 'Total',
		'vendas_online.adicionar_carrinho': 'Adicionar ao Carrinho',
		'vendas_online.pronta_entrega': 'Pronta Entrega',
		'vendas_online.sob_encomenda': 'Sob Encomenda',
		'vendas_online.cliente': 'Cliente',
		'vendas_online.perfil': 'Perfil',
		'vendas_online.sair': 'Sair',

		// Promoções Pop-up
		'promocoes.titulo': 'Promoções Especiais!',
		'promocoes.descricao': 'Aproveite nossas ofertas por tempo limitado',
		'promocoes.ver_detalhes': 'VER DETALHES',
		'promocoes.fechar': 'Fechar',
		'promocoes.condicoes': 'Condições:',
		'promocoes.beneficios': 'Benefícios:',
		'promocoes.observacoes': 'Observações:',
		'promocoes.produto': 'Produto',
		'promocoes.quantidade_minima': 'Quantidade mínima',
		'promocoes.valor_minimo': 'Valor mínimo',
		'promocoes.desconto_percentual': 'de desconto',
		'promocoes.desconto_valor': 'de desconto',
		'promocoes.frete_gratis': 'Frete grátis',
		'promocoes.regioes': 'Regiões',
		'promocoes.ativa': 'ATIVA',

		// Dashboard - Títulos e Interface
		'dashboard.titulo_pagina': 'Dashboard - Leo\'s Cake',
		'dashboard.bem_vindo_texto': 'Bem-vindo(a),',
		'dashboard.usuario_padrao': 'Usuário',

		// Login Page
		'login.titulo_pagina': 'Leo\'s Cake - Sistema de Vendas',
		'login.sistema_vendas': 'Sistema de Vendas',
		'login.email': 'Email',
		'login.senha': 'Senha',
		'login.sua_senha': 'Sua senha',
		'login.entrar': 'Entrar',
		'login.erro_padrao': 'Preencha email e senha',
		'login.erro_autenticacao': 'Email ou senha incorretos',
		'login.erro_geral': 'Erro ao fazer login. Tente novamente.',

		// Menu do Usuário
		'menu.configuracoes': 'Configurações',
		'menu.usuarios': 'Usuários',
		'menu.promocoes': 'Promoções',

		// Modal de Promoções
		'modal.promocoes': 'Promoções',
		'btn.fechar': 'Fechar'
	},
	'en-US': {
	'dashboard.confirmados': 'Confirmed',
	'dashboard.pagos': 'Paid',
	'dashboard.entregues': 'Delivered',
	'dashboard.cancelados': 'Canceled',
	'dashboard.total_pago': 'Total Paid',
	'dashboard.produtos': 'Products',
	'dashboard.clientes': 'Clients',
	'dashboard.pedidos': 'Pending Orders',
	'dashboard.pendentes': 'Pending',
		'dashboard.estoque': 'Stock',
		'dashboard.entregas': 'Deliveries Today',
		'dashboard.bem_vindo': 'Welcome',
		'dashboard.entregas_hoje': 'Delivery Follow-up',

		'nav.dashboard': 'Dashboard',
		'nav.produtos': 'Products',
		'nav.clientes': 'Clients',
		'nav.pedidos': 'Orders',
		'nav.entregas': 'Deliveries',

		'btn.add': 'Add',
		'btn.save': 'Save',
		'btn.cancel': 'Cancel',
		'btn.delete': 'Delete',
		'btn.edit': 'Edit',
		'btn.logout': 'Logout',
		'btn.profile': 'Profile',
		'btn.new_client': 'New Client',
		'btn.new_product': 'New Product',
		'btn.new_order': 'New Order',

		'modal.perfil': 'My Profile',
		'modal.alterar_foto': 'Change Photo',
		'modal.nome': 'Full Name',
		'modal.email': 'Email',
		'modal.telefone': 'Phone',
		'modal.endereco': 'Address',
		'modal.tipo_usuario': 'User Type',
		'modal.data_cadastro': 'Registration Date',
		'modal.cancelar': 'Cancel',
		'modal.salvar': 'Save',

		'modal.add_client': 'Add Client',
		'modal.edit_client': 'Edit Client',
		'modal.client_name': 'Client Name',
		'modal.client_phone': 'Phone',
		'modal.client_email': 'Email (optional)',
		'modal.client_address': 'Full Address',

		'modal.add_product': 'Add Product',
		'modal.edit_product': 'Edit Product',
		'modal.product_name': 'Product Name',
		'modal.product_price': 'Price (CAD$)',
		'modal.product_stock': 'Stock (units)',
		'modal.product_description': 'Description (optional)',

		'modal.add_order': 'Add Order',
		'modal.edit_order': 'Edit Order',
		'modal.order_client': 'Client',
		'modal.order_product': 'Product',
		'modal.order_quantity': 'Quantity',
		'modal.order_delivery_date': 'Delivery Date',
		'modal.order_delivery_time': 'Time',
		'modal.order_delivery_address': 'Delivery Address',
		'modal.order_status': 'Status',
		'modal.order_total': 'Total Amount',

		'status.pendente': 'Pending',
		'status.pago': 'Paid',
		'status.entregue': 'Delivered',
		'status.cancelado': 'Cancelled',

		'msg.sem_dados': 'No data to display',
		'msg.nenhum_produto': 'No products registered',
		'msg.nenhum_cliente': 'No clients registered',
		'msg.nenhum_pedido': 'No orders registered',
		'msg.nenhuma_entrega': 'No delivery scheduled for today',

		'section.dashboard': 'Dashboard',
		'section.clientes': '👥 Clients',
		'section.produtos': '🍰 Products',
		'section.pedidos': '📋 Orders',
		'section.estoque': '📦 Stock',
		'section.entregas': '🚚 Deliveries',

		'detail.telefone': 'Phone',
		'detail.endereco': 'Address',
		'detail.preco': 'Price',
		'detail.estoque_unidades': 'Stock',
		'detail.data': 'Date',
		'detail.status': 'Status',
		'detail.horario': 'Time',
		'detail.pedido': 'Order',

		'placeholder.search_client': '🔍 Search client...',
		'placeholder.search_product': '🔍 Search product...',
		'placeholder.search_order': '🔍 Search order...',
		'placeholder.enter_name': 'Enter name',
		'placeholder.enter_phone': '(XX) XXXXX-XXXX',
		'placeholder.enter_email': 'email@example.com',
		'placeholder.enter_address': 'Street, Number - District',
		'placeholder.enter_price': '0.00',
		'placeholder.enter_stock': '0',
		'placeholder.select_client': 'Select a client',
		'placeholder.select_product': 'Select a product',

		'currency.symbol': 'CAD$',
		'currency.name': 'Canadian Dollar',

		// Vendas Online
		'vendas_online.titulo': 'Leo\'s Cake - Online Sales',
		'vendas_online.filtrar': 'Filter:',
		'vendas_online.todas_categorias': 'All Categories',
		'vendas_online.adicionar_cliente': 'Add Client',
		'vendas_online.total': 'Total',
		'vendas_online.adicionar_carrinho': 'Add to Cart',
		'vendas_online.pronta_entrega': 'Ready for Delivery',
		'vendas_online.sob_encomenda': 'Made to Order',
		'vendas_online.cliente': 'Client',
		'vendas_online.perfil': 'Profile',
		'vendas_online.sair': 'Logout',

		// Promoções Pop-up
		'promocoes.titulo': 'Special Promotions!',
		'promocoes.descricao': 'Take advantage of our limited-time offers',
		'promocoes.ver_detalhes': 'VIEW DETAILS',
		'promocoes.fechar': 'Close',
		'promocoes.condicoes': 'Conditions:',
		'promocoes.beneficios': 'Benefits:',
		'promocoes.observacoes': 'Notes:',
		'promocoes.produto': 'Product',
		'promocoes.quantidade_minima': 'Minimum quantity',
		'promocoes.valor_minimo': 'Minimum value',
		'promocoes.desconto_percentual': 'discount',
		'promocoes.desconto_valor': 'discount',
		'promocoes.frete_gratis': 'Free shipping',
		'promocoes.regioes': 'Regiões',
		'promocoes.ativa': 'ATIVA',

		// Dashboard - Títulos e Interface
		'dashboard.titulo_pagina': 'Dashboard - Leo\'s Cake',
		'dashboard.bem_vindo_texto': 'Bem-vindo(a),',
		'dashboard.usuario_padrao': 'Usuário',

		// Seções do Dashboard
		'section.dashboard': 'Dashboard',
		'section.clientes': '👥 Clientes',
		'section.produtos': '🍰 Produtos',
		'section.pedidos': '📋 Pedidos',
		'section.estoque': '📦 Estoque',
		'section.entregas': '🚚 Entregas',

		// Dashboard - Títulos e Interface
		'dashboard.titulo_pagina': 'Dashboard - Leo\'s Cake',
		'dashboard.bem_vindo_texto': 'Welcome,',
		'dashboard.usuario_padrao': 'User',

		// Login Page
		'login.titulo_pagina': 'Leo\'s Cake - Sales System',
		'login.sistema_vendas': 'Sales System',
		'login.email': 'Email',
		'login.senha': 'Password',
		'login.sua_senha': 'Your password',
		'login.entrar': 'Login',
		'login.erro_padrao': 'Please fill in email and password',
		'login.erro_autenticacao': 'Incorrect email or password',
		'login.erro_geral': 'Login error. Please try again.',

		// Menu do Usuário
		'menu.configuracoes': 'Settings',
		'menu.usuarios': 'Users',
		'menu.promocoes': 'Promotions',

		// Modal de Promoções
		'modal.promocoes': 'Promotions',
		'btn.fechar': 'Close'
	}
};

function getCurrentLang() {
	return localStorage.getItem('lang') || 'en-US';
}

function t(key) {
	const lang = getCurrentLang();
	const result = translations[lang]?.[key] || translations['pt-BR'][key] || key;
	return result;
}

function applyTranslations() {
	document.querySelectorAll('[data-i18n]').forEach(el => {
		const key = el.getAttribute('data-i18n');
		el.textContent = t(key);
	});
}

function setLang(lang) {
	if (translations[lang]) {
		localStorage.setItem('lang', lang);
		applyTranslations();
		console.log('🌐 Idioma alterado para:', lang);
		
		const event = new CustomEvent('languageChanged', { 
			detail: { lang: lang } 
		});
		window.dispatchEvent(event);
	} else {
		console.warn('⚠️ Idioma não suportado:', lang);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		applyTranslations();
		console.log('✅ i18n inicializado com idioma:', getCurrentLang());
	});
} else {
	applyTranslations();
	console.log('✅ i18n inicializado com idioma:', getCurrentLang());
}

window.t = t;
window.setLang = setLang;
window.getCurrentLang = getCurrentLang;
window.applyTranslations = applyTranslations;