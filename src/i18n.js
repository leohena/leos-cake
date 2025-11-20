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
		'btn.fechar': 'Fechar',

		'verificacao.titulo': 'Verificar Cliente Existente',
		'verificacao.descricao': 'Já é nosso cliente? Informe seu e-mail ou telefone para carregar seus dados automaticamente.',
		'verificacao.email_telefone': 'E-mail ou Telefone *',
		'verificacao.verificar': 'Verificar',
		'verificacao.verificacao_seguranca': 'Security Verification',
		'verificacao.selecione_email': 'Select your correct email:',
		'verificacao.selecione_telefone': 'Select your correct phone number:',
		'verificacao.verificacao_final': 'Final Verification',
		'verificacao.selecione_endereco': 'Select your correct address:',
		'verificacao.tentativa_de': 'Attempt',
		'verificacao.email_incorreto_limite': 'Incorrect email. You have exceeded the attempt limit. You will be directed to registration.',
		'verificacao.email_incorreto_tente': 'Incorrect email. Try again.',
		'verificacao.telefone_incorreto_limite': 'Incorrect number. You have exceeded the attempt limit. You will be directed to registration.',
		'verificacao.telefone_incorreto_tente': 'Incorrect number. Try again.',
		'verificacao.endereco_incorreto_limite': 'Incorrect address. You have exceeded the attempt limit. You will be directed to registration.',
		'verificacao.endereco_incorreto_tente': 'Endereço incorreto. Tente novamente.',

		'verificacao.placeholder_email_telefone': 'Digite seu e-mail ou telefone',
		'verificacao.novo_cliente': 'Novo Cliente',

		'finalizar.produtos': 'Produtos',
		'finalizar.limpar_carrinho': 'Limpar Carrinho',
		'finalizar.cliente': 'Cliente',
		'finalizar.selecione_cliente': '-- Selecione o cliente --',
		'finalizar.forma_pagamento': 'Forma de Pagamento',
		'finalizar.dinheiro': 'Dinheiro',
		'finalizar.transferencia': 'Transferência',
		'finalizar.cartao': 'Cartão',
		'finalizar.pagamento_total': 'Pagamento total?',
		'finalizar.valor_sinal': 'Valor do sinal (CAD$):',
		'finalizar.tipo_entrega': 'Tipo de Entrega',
		'finalizar.retirada_loja': 'Retirada na Loja',
		'finalizar.entrega': 'Entrega',
		'finalizar.entrega_domicilio': 'Entrega em Domicílio',
		'finalizar.data_entrega': 'Data de Entrega:',
		'finalizar.horario': 'Horário:',
		'finalizar.selecione_horario': 'Selecione um horário...',
		'finalizar.tabela_produto': 'Produto',
		'finalizar.tabela_preco': 'Preço',
		'finalizar.tabela_qtd': 'Qtd',
		'finalizar.tabela_total': 'Total',
		'finalizar.tabela_acoes': 'Ações',
		'finalizar.endereco_entrega': 'Endereço de Entrega:',
		'finalizar.usar_endereco_cadastro': 'Usar endereço do cadastro',
		'finalizar.novo_endereco': 'Novo endereço',
		'finalizar.novo_endereco_label': 'Novo Endereço:',
		'finalizar.digite_novo_endereco': 'Digite o novo endereço...',
		'finalizar.valor_total': 'VALOR TOTAL',
		'finalizar.finalizar_venda': 'Finalizar Venda',
		'finalizar.finalizar_venda': 'Finalizar Venda',
		'finalizar.finalizar_pedido': 'Finalizar Pedido',

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

		// Configurações de horários
		'horarios.dias_semana': 'Dias de Semana (Segunda a Sexta)',
		'horarios.fins_semana': 'Fins de Semana (Sábado e Domingo)',
		'horarios.selecionar_todos': 'Selecionar Todos',
		'horarios.desmarcar_todos': 'Desmarcar Todos',
		'horarios.configurar': 'Configurar Horários',
		'horarios.salvar_config': 'Salvar Configuração',
		'horarios.erro_minimo': 'Selecione pelo menos um horário para dias de semana e fins de semana.',
		'horarios.sucesso': 'Configuração de horários salva com sucesso!',

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
		'vendas_online.nome_completo': 'Nome Completo *',
		'vendas_online.telefone_whatsapp': 'Telefone/WhatsApp *',
		'vendas_online.email': 'Email',
		'vendas_online.endereco_entrega': 'Endereço de Entrega *',
		'vendas_online.tipo_entrega': 'Tipo de Entrega *',
		'vendas_online.selecione': 'Selecione...',
		'vendas_online.retirada_local': 'Retirada no Local',
		'vendas_online.data_entrega': 'Data de Entrega *',
		'vendas_online.cancelar': 'Cancelar',
		'vendas_online.finalizar_pedido': 'Finalizar Pedido',
		'vendas_online.cadastro_pedido': 'Cadastro de Pedido',
		'vendas_online.descricao_cadastro': 'Para completar seu pedido, precisamos de algumas informações:',
		'vendas_online.placeholder_nome': 'Digite seu nome completo',
		'vendas_online.filtrar_label': 'Filtrar:',
		'vendas_online.todas_categorias': 'Todas Categorias',
		'vendas_online.total_label': 'Total:',
		'vendas_online.nenhum_produto': 'Nenhum produto disponível para venda',
		'vendas_online.sem_imagem': 'Sem imagem',
		'vendas_online.cliente_default': 'Cliente',
		'vendas_online.tipo_usuario': 'cliente',

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

		'email.pendente.assunto': 'Pedido Recebido - Leo\'s Cake',
		'email.pendente.corpo': 'Olá {{cliente_nome}},\n\nObrigado pelo seu pedido! Recebemos seu pedido #{{pedido_numero}} e estamos processando.\n\nDetalhes do Pedido:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nManteremos você informado sobre o status do seu pedido.\n\nAtenciosamente,\nEquipe Leo\'s Cake',

		'email.confirmado.assunto': 'Pedido Confirmado - Leo\'s Cake',
		'email.confirmado.corpo': 'Olá {{cliente_nome}},\n\nSeu pedido #{{pedido_numero}} foi confirmado e está em produção.\n\nDetalhes do Pedido:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nPrevisão de entrega: {{data_entrega}}\n\nAtenciosamente,\nEquipe Leo\'s Cake',

		'email.producao.assunto': 'Pedido em Produção - Leo\'s Cake',
		'email.producao.corpo': 'Olá {{cliente_nome}},\n\nSeu pedido #{{pedido_numero}} está em produção.\n\nDetalhes do Pedido:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nEstamos trabalhando duro para preparar suas delícias!\n\nAtenciosamente,\nEquipe Leo\'s Cake',

		'email.pago.assunto': 'Pagamento Confirmado - Leo\'s Cake',
		'email.pago.corpo': 'Olá {{cliente_nome}},\n\nRecebemos seu pagamento para o pedido #{{pedido_numero}}.\n\nDetalhes do Pedido:\n{{produtos}}\n\nTotal Pago: {{valor_total}}\n\nObrigado pela preferência!\n\nAtenciosamente,\nEquipe Leo\'s Cake',

		'email.entregue.assunto': 'Pedido Entregue - Leo\'s Cake',
		'email.entregue.corpo': 'Olá {{cliente_nome}},\n\nSeu pedido #{{pedido_numero}} foi entregue com sucesso!\n\nDetalhes do Pedido:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nEsperamos que aproveite suas delícias. Obrigado por escolher Leo\'s Cake!\n\nAtenciosamente,\nEquipe Leo\'s Cake',

		'email.cancelado.assunto': 'Pedido Cancelado - Leo\'s Cake',
		'email.cancelado.corpo': 'Olá {{cliente_nome}},\n\nLamentamos informar que seu pedido #{{pedido_numero}} foi cancelado.\n\nDetalhes do Pedido:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nSe tiver dúvidas, entre em contato conosco.\n\nAtenciosamente,\nEquipe Leo\'s Cake',

		'dashboard.titulo_pagina': 'Dashboard - Leo\'s Cake',
		'dashboard.bem_vindo_texto': 'Bem-vindo(a),',
		'dashboard.usuario_padrao': 'Usuário',

		'login.titulo_pagina': 'Leo\'s Cake - Sistema de Vendas',
		'login.sistema_vendas': 'Sistema de Vendas',
		'login.email': 'Email',
		'login.senha': 'Senha',
		'login.sua_senha': 'Sua senha',
		'login.entrar': 'Entrar',
		'login.erro_padrao': 'Preencha email e senha',
		'login.erro_autenticacao': 'Email ou senha incorretos',
		'login.erro_geral': 'Erro ao fazer login. Tente novamente.',

		'menu.configuracoes': 'Configurações',
		'menu.usuarios': 'Usuários',
		'menu.promocoes': 'Promoções',

		'modal.promocoes': 'Promoções'
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
		'btn.fechar': 'Close',

		'verificacao.titulo': 'Verify Existing Customer',
		'verificacao.descricao': 'Already a customer? Enter your email or phone to load your information automatically.',
		'verificacao.email_telefone': 'Email or Phone *',
		'verificacao.verificar': 'Verify',
		'verificacao.verificacao_seguranca': 'Security Verification',
		'verificacao.selecione_email': 'Select your correct email:',
		'verificacao.selecione_telefone': 'Select your correct phone number:',
		'verificacao.verificacao_final': 'Final Verification',
		'verificacao.selecione_endereco': 'Select your correct address:',
		'verificacao.tentativa_de': 'Attempt',
		'verificacao.email_incorreto_limite': 'Incorrect email. You have exceeded the attempt limit. You will be directed to registration.',
		'verificacao.email_incorreto_tente': 'Incorrect email. Try again.',
		'verificacao.telefone_incorreto_limite': 'Incorrect number. You have exceeded the attempt limit. You will be directed to registration.',
		'verificacao.telefone_incorreto_tente': 'Incorrect number. Try again.',
		'verificacao.endereco_incorreto_limite': 'Incorrect address. You have exceeded the attempt limit. You will be directed to registration.',
		'verificacao.endereco_incorreto_tente': 'Incorrect address. Try again.',
		'verificacao.placeholder_email_telefone': 'Enter your email or phone',
		'verificacao.novo_cliente': 'New Customer',

		'finalizar.produtos': 'Products',
		'finalizar.limpar_carrinho': 'Clear Cart',
		'finalizar.cliente': 'Client',
		'finalizar.selecione_cliente': '-- Select client --',
		'finalizar.forma_pagamento': 'Payment Method',
		'finalizar.dinheiro': 'Cash',
		'finalizar.transferencia': 'Transfer',
		'finalizar.cartao': 'Card',
		'finalizar.pagamento_total': 'Full payment?',
		'finalizar.valor_sinal': 'Deposit value (CAD$):',
		'finalizar.tipo_entrega': 'Delivery Type',
		'finalizar.retirada_loja': 'Pickup',
		'finalizar.entrega': 'Delivery',
		'finalizar.entrega_domicilio': 'Home Delivery',
		'finalizar.data_entrega': 'Delivery Date:',
		'finalizar.horario': 'Time:',
		'finalizar.selecione_horario': 'Select a time...',
		'finalizar.tabela_produto': 'Product',
		'finalizar.tabela_preco': 'Price',
		'finalizar.tabela_qtd': 'Qty',
		'finalizar.tabela_total': 'Total',
		'finalizar.tabela_acoes': 'Actions',

		// Traduções de produtos
		'produtos.pao_de_mel': 'Honey Cake',
		'produtos.honey_cake': 'Honey Cake',
		'produtos.bolo_de_cenoura': 'Carrot Cake',
		'produtos.carrot_cake': 'Carrot Cake',
		'produtos.torta_de_limao': 'Lemon Pie',
		'produtos.lemon_pie': 'Lemon Pie',
		'produtos.brownie': 'Brownie',
		'produtos.brownie': 'Brownie',
		'produtos.cupcake': 'Cupcake',
		'produtos.cupcake': 'Cupcake',

		// Traduções de produtos
		'produtos.pao_de_mel': 'Pão de Mel',
		'produtos.honey_cake': 'Honey Cake',
		'produtos.bolo_de_cenoura': 'Bolo de Cenoura',
		'produtos.carrot_cake': 'Carrot Cake',
		'produtos.torta_de_limao': 'Torta de Limão',
		'produtos.lemon_pie': 'Lemon Pie',
		'produtos.brownie': 'Brownie',
		'produtos.brownie': 'Brownie',
		'produtos.cupcake': 'Cupcake',
		'produtos.cupcake': 'Cupcake',
		'finalizar.endereco_entrega': 'Delivery Address:',
		'finalizar.usar_endereco_cadastro': 'Use registered address',
		'finalizar.novo_endereco': 'New address',
		'finalizar.novo_endereco_label': 'New Address:',
		'finalizar.digite_novo_endereco': 'Enter the new address...',
		'finalizar.valor_total': 'TOTAL VALUE',
		'finalizar.finalizar_venda': 'Complete Sale',
		'finalizar.finalizar_venda': 'Complete Sale',
		'finalizar.finalizar_pedido': 'Complete Order',

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

		// Delivery time settings
		'horarios.dias_semana': 'Weekdays (Monday to Friday)',
		'horarios.fins_semana': 'Weekends (Saturday and Sunday)',
		'horarios.selecionar_todos': 'Select All',
		'horarios.desmarcar_todos': 'Deselect All',
		'horarios.configurar': 'Configure Times',
		'horarios.salvar_config': 'Save Configuration',
		'horarios.erro_minimo': 'Select at least one time for weekdays and weekends.',
		'horarios.sucesso': 'Time configuration saved successfully!',

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
		'vendas_online.nome_completo': 'Full Name *',
		'vendas_online.telefone_whatsapp': 'Phone/WhatsApp *',
		'vendas_online.email': 'Email',
		'vendas_online.endereco_entrega': 'Delivery Address *',
		'vendas_online.tipo_entrega': 'Delivery Type *',
		'vendas_online.selecione': 'Select...',
		'vendas_online.retirada_local': 'Pickup at Location',
		'vendas_online.data_entrega': 'Delivery Date *',
		'vendas_online.cancelar': 'Cancel',
		'vendas_online.finalizar_pedido': 'Complete Order',
		'vendas_online.cadastro_pedido': 'Order Registration',
		'vendas_online.descricao_cadastro': 'To complete your order, we need some information:',
		'vendas_online.placeholder_nome': 'Enter your full name',
		'vendas_online.filtrar_label': 'Filter:',
		'vendas_online.todas_categorias': 'All Categories',
		'vendas_online.total_label': 'Total:',
		'vendas_online.nenhum_produto': 'No products available for sale',
		'vendas_online.sem_imagem': 'No image',
		'vendas_online.cliente_default': 'Client',
		'vendas_online.tipo_usuario': 'client',

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
		'promocoes.regioes': 'Regions',
		'email.pendente.assunto': 'Order Received - Leo\'s Cake',
		'email.pendente.corpo': 'Dear {{cliente_nome}},\n\nThank you for your order! We have received your order #{{pedido_numero}} and it is being processed.\n\nOrder Details:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nWe will keep you updated on the status of your order.\n\nBest regards,\nLeo\'s Cake Team',

		'email.confirmado.assunto': 'Order Confirmed - Leo\'s Cake',
		'email.confirmado.corpo': 'Dear {{cliente_nome}},\n\nYour order #{{pedido_numero}} has been confirmed and is now in production.\n\nOrder Details:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nEstimated delivery: {{data_entrega}}\n\nBest regards,\nLeo\'s Cake Team',

		'email.producao.assunto': 'Order in Production - Leo\'s Cake',
		'email.producao.corpo': 'Dear {{cliente_nome}},\n\nYour order #{{pedido_numero}} is now in production.\n\nOrder Details:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nWe are working hard to prepare your delicious treats!\n\nBest regards,\nLeo\'s Cake Team',

		'email.pago.assunto': 'Payment Confirmed - Leo\'s Cake',
		'email.pago.corpo': 'Dear {{cliente_nome}},\n\nWe have received your payment for order #{{pedido_numero}}.\n\nOrder Details:\n{{produtos}}\n\nTotal Paid: {{valor_total}}\n\nThank you for your business!\n\nBest regards,\nLeo\'s Cake Team',

		'email.entregue.assunto': 'Order Delivered - Leo\'s Cake',
		'email.entregue.corpo': 'Dear {{cliente_nome}},\n\nYour order #{{pedido_numero}} has been successfully delivered!\n\nOrder Details:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nWe hope you enjoy your treats. Thank you for choosing Leo\'s Cake!\n\nBest regards,\nLeo\'s Cake Team',

		'email.cancelado.assunto': 'Order Cancelled - Leo\'s Cake',
		'email.cancelado.corpo': 'Dear {{cliente_nome}},\n\nWe regret to inform you that your order #{{pedido_numero}} has been cancelled.\n\nOrder Details:\n{{produtos}}\n\nTotal: {{valor_total}}\n\nIf you have any questions, please contact us.\n\nBest regards,\nLeo\'s Cake Team',
		'dashboard.bem_vindo_texto': 'Welcome,',
		'dashboard.usuario_padrao': 'User',

		'login.titulo_pagina': 'Leo\'s Cake - Sales System',
		'login.sistema_vendas': 'Sales System',
		'login.email': 'Email',
		'login.senha': 'Password',
		'login.sua_senha': 'Your password',
		'login.entrar': 'Login',
		'login.erro_padrao': 'Please fill in email and password',
		'login.erro_autenticacao': 'Incorrect email or password',
		'login.erro_geral': 'Login error. Please try again.',

		'menu.configuracoes': 'Settings',
		'menu.usuarios': 'Users',
		'menu.promocoes': 'Promotions',

		'modal.promocoes': 'Promotions'
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

function translateProductName(productName) {
	// Mapeamento inteligente baseado em padrões comuns
	const normalizedName = productName.toLowerCase().trim();
	
	// Mapeamentos diretos para produtos conhecidos
	const directMappings = {
		'pão de mel': 'produtos.pao_de_mel',
		'honey cake': 'produtos.honey_cake',
		'bolo de cenoura': 'produtos.bolo_de_cenoura',
		'carrot cake': 'produtos.carrot_cake',
		'torta de limão': 'produtos.torta_de_limao',
		'lemon pie': 'produtos.lemon_pie',
		'brownie': 'produtos.brownie',
		'cupcake': 'produtos.cupcake',
	};
	
	// Verificar mapeamento direto
	const directKey = directMappings[normalizedName];
	if (directKey) {
		return t(directKey);
	}
	
	// Para produtos não mapeados, tentar tradução automática baseada em padrões
	const currentLang = getCurrentLang();
	if (currentLang === 'en-US') {
		// Primeiro, detectar frases compostas comuns
		const compoundTranslations = {
			'pão de mel': 'Honey Cake',
			'bolo de cenoura': 'Carrot Cake',
			'torta de limão': 'Lemon Pie',
			'bolo de chocolate': 'Chocolate Cake',
			'torta de morango': 'Strawberry Pie',
			'doce de leite': 'Milk Sweet',
			'pão de açúcar': 'Sugar Bread',
		};
		
		// Verificar frases compostas primeiro
		for (const [pt, en] of Object.entries(compoundTranslations)) {
			if (normalizedName.includes(pt)) {
				return en;
			}
		}
		
		// Traduções palavra por palavra para casos não cobertos
		const wordTranslations = {
			'pão': 'bread',
			'bolo': 'cake',
			'torta': 'pie',
			'doce': 'sweet',
			'cenoura': 'carrot',
			'limão': 'lemon',
			'mel': 'honey',
			'chocolate': 'chocolate',
			'baunilha': 'vanilla',
			'morango': 'strawberry',
			'abacaxi': 'pineapple',
			'coco': 'coconut',
			'leite': 'milk',
			'açúcar': 'sugar',
			'café': 'coffee',
			'laranja': 'orange',
			'uva': 'grape',
			'banana': 'banana',
			'maçã': 'apple',
		};
		
		// Aplicar traduções palavra por palavra
		let translated = productName;
		Object.entries(wordTranslations).forEach(([pt, en]) => {
			const regex = new RegExp(`\\b${pt}\\b`, 'gi');
			translated = translated.replace(regex, en);
		});
		
		// Remover palavras de ligação comuns que não fazem sentido em inglês
		translated = translated.replace(/\bde\b/gi, ''); // remover "de"
		translated = translated.replace(/\bcom\b/gi, 'with'); // "com" -> "with"
		translated = translated.replace(/\be\b/gi, 'and'); // "e" -> "and"
		
		// Limpar espaços extras
		translated = translated.replace(/\s+/g, ' ').trim();
		
		// Capitalizar primeira letra de cada palavra
		return translated.replace(/\b\w/g, l => l.toUpperCase());
	}
	
	// Retornar nome original se não conseguir traduzir
	return productName;
}

function translateProductDescription(description) {
	if (!description) return '';
	
	// Mapeamento de descrições comuns
	const descriptionMappings = {
		'pão': 'bread',
		'bolo': 'cake',
		'torta': 'pie',
		'doce': 'sweet',
		'cenoura': 'carrot',
		'limão': 'lemon',
		'mel': 'honey',
		'chocolate': 'chocolate',
		'baunilha': 'vanilla',
		'morango': 'strawberry',
		'abacaxi': 'pineapple',
		'coco': 'coconut',
		'leite': 'milk',
		'açúcar': 'sugar',
		'café': 'coffee',
		'laranja': 'orange',
		'uva': 'grape',
		'banana': 'banana',
		'maçã': 'apple',
		'delicioso': 'delicious',
		'saboroso': 'tasty',
		'feito': 'made',
		'com': 'with',
		'e': 'and',
		'de': 'of',
		'fresco': 'fresh',
		'caseiro': 'homemade',
		'tradicional': 'traditional',
		'especial': 'special',
	};
	
	const currentLang = getCurrentLang();
	if (currentLang === 'en-US') {
		let translated = description;
		Object.entries(descriptionMappings).forEach(([pt, en]) => {
			const regex = new RegExp(`\\b${pt}\\b`, 'gi');
			translated = translated.replace(regex, en);
		});
		
		// Capitalizar primeira letra
		return translated.charAt(0).toUpperCase() + translated.slice(1);
	}
	
	return description;
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
		console.log('🌍 Idioma alterado para:', lang);
		
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
window.translateProductName = translateProductName;