// Sistema de Internacionalização - Leo's Cake
class I18n {
    constructor() {
        this.currentLang = 'pt';
        this.translations = {
            pt: {
                // Sistema
                system_title: 'Leo\'s Cake - Sistema de Pré-Vendas',
                login: 'Entrar',
                logout: 'Sair',
                password: 'Senha',
                enter_password: 'Digite a senha',
                incorrect_password: 'Senha incorreta!',
                
                // Menu do usuário
                'user.profile': 'Perfil',
                'user.settings': 'Configurações',
                'user.name': 'Nome',
                'user.username': 'Usuário',
                'user.email': 'Email',
                'user.type': 'Tipo de Usuário',
                'user.admin': 'Administrador',
                'user.operator': 'Operador',
                'user.viewer': 'Visualizador',
                'user.change_password': 'Alterar Senha',
                'user.current_password': 'Senha Atual',
                'user.new_password': 'Nova Senha',
                'user.confirm_password': 'Confirmar Senha',
                'user.change_photo': 'Alterar Foto',
                'user.passwords_dont_match': 'As senhas não coincidem',
                'user.password_hint': 'Dica:',
                'user.password_help': 'Deixe os campos de senha em branco se não quiser alterá-la. A nova senha deve ter pelo menos 6 caracteres.',
                
                // Configurações
                'settings.company': 'Empresa',
                'settings.email': 'Email',
                'settings.system': 'Sistema',
                'settings.company_name': 'Nome da Empresa',
                'settings.phone': 'Telefone',
                'settings.address': 'Endereço',
                'settings.email_service': 'Serviço de Email',
                'settings.email_template': 'Template de Email',
                'settings.from_email': 'Email Remetente',
                'settings.currency': 'Moeda',
                'settings.timezone': 'Fuso Horário',
                'settings.date_format': 'Formato de Data',
                'settings.save_success': 'Salvo com sucesso!',
                'settings.save_error': 'Erro ao salvar. Tente novamente.',
                'settings.companyName': 'Nome da Empresa',
                'settings.companyEmail': 'Email da Empresa',
                'settings.emailServiceId': 'EmailJS Service ID',
                'settings.emailTemplateId': 'EmailJS Template ID',
                'settings.emailUserId': 'EmailJS User ID',
                'settings.defaultLanguage': 'Idioma Padrão',
                'settings.theme': 'Tema',
                'settings.notifications': 'Notificações',
                'settings.orderNotifications': 'Novos Pedidos',
                'settings.deliveryNotifications': 'Entregas',
                
                // Comum
                'common.cancel': 'Cancelar',
                'common.save': 'Salvar',
                'cancel': 'Cancelar',
                'save': 'Salvar',
                
                // Menu/Navigation
                dashboard: 'Dashboard',
                products: 'Produtos',
                clients: 'Clientes',
                orders: 'Pedidos',
                deliveries: 'Entregas',
                stock: 'Estoque',
                
                // Navigation (nav prefix)
                'nav.dashboard': 'Dashboard',
                'nav.products': 'Produtos',
                'nav.clients': 'Clientes',
                'nav.orders': 'Pedidos',
                'nav.deliveries': 'Entregas',
                'nav.stock': 'Estoque',
                
                // Dashboard
                'dashboard.title': 'Dashboard',
                'dashboard.newOrder': 'Novo Pedido',
                'dashboard.totalProducts': 'Total de Produtos', 
                'dashboard.totalClients': 'Total de Clientes',
                'dashboard.pendingOrders': 'Pedidos Pendentes',
                'dashboard.monthlyRevenue': 'Receita do Mês',
                'dashboard.recentOrders': 'Pedidos Recentes',
                'dashboard.todayDeliveries': 'Entregas de Hoje',
                total_products: 'Total de Produtos',
                total_clients: 'Total de Clientes',
                pending_orders: 'Pedidos Pendentes',
                monthly_revenue: 'Receita do Mês',
                
                // Produtos
                add_product: 'Adicionar Produto',
                product_name: 'Nome do Produto',
                product_description: 'Descrição',
                product_price: 'Preço',
                product_category: 'Categoria',
                preparation_time: 'Tempo de Preparo (horas)',
                
                // Clientes
                add_client: 'Adicionar Cliente',
                client_name: 'Nome do Cliente',
                client_email: 'Email',
                client_phone: 'Telefone',
                client_address: 'Endereço',
                client_language: 'Idioma Preferido',
                client_notes: 'Observações',
                
                // Pedidos
                new_order: 'Novo Pedido',
                order_number: 'Número do Pedido',
                order_date: 'Data do Pedido',
                delivery_date: 'Data de Entrega',
                delivery_time: 'Hora de Entrega',
                total_value: 'Valor Total',
                paid_value: 'Valor Pago',
                pending_value: 'Valor Pendente',
                payment_method: 'Forma de Pagamento',
                order_status: 'Status do Pedido',
                order_notes: 'Observações',
                
                // Status
                pending: 'Pendente',
                confirmed: 'Confirmado',
                production: 'Em Produção',
                ready: 'Pronto',
                delivered: 'Entregue',
                cancelled: 'Cancelado',
                
                // Entregas
                delivery_address: 'Endereço de Entrega',
                delivery_person: 'Entregador',
                scheduled: 'Agendada',
                out_for_delivery: 'Saiu para Entrega',
                delivery_cancelled: 'Cancelada',
                
                // Recibo
                receipt: 'Recibo',
                order_summary: 'Resumo do Pedido',
                payment_info: 'Informações de Pagamento',
                partial_payment: 'Pagamento Parcial',
                remaining_payment: 'Pagamento Restante',
                pay_on_delivery: 'Pagar na Entrega',
                
                // Email
                order_confirmation: 'Confirmação de Pedido',
                email_sent: 'Email enviado com sucesso!',
                email_error: 'Erro ao enviar email',
                
                // Botões
                save: 'Salvar',
                cancel: 'Cancelar',
                delete: 'Excluir',
                edit: 'Editar',
                confirm: 'Confirmar',
                send_email: 'Enviar Email',
                generate_receipt: 'Gerar Recibo',
                
                // Mensagens
                success: 'Operação realizada com sucesso!',
                error: 'Ocorreu um erro. Tente novamente.',
                confirm_delete: 'Tem certeza que deseja excluir?',
                no_data: 'Nenhum registro encontrado',
                loading: 'Carregando...',
                
                // Validação
                required_field: 'Campo obrigatório',
                invalid_email: 'Email inválido',
                invalid_phone: 'Telefone inválido',
                invalid_price: 'Preço inválido',
                
                // Categorias
                cakes: 'Bolos',
                cupcakes: 'Cupcakes',
                pies: 'Tortas',
                special_cakes: 'Bolos Especiais',
                sweets: 'Doces'
            },
            
            en: {
                // System
                system_title: 'Leo\'s Cake - Pre-Order System',
                login: 'Login',
                logout: 'Logout',
                password: 'Password',
                enter_password: 'Enter password',
                incorrect_password: 'Incorrect password!',
                
                // User menu
                'user.profile': 'Profile',
                'user.settings': 'Settings',
                'user.name': 'Name',
                'user.username': 'Username',
                'user.email': 'Email',
                'user.type': 'User Type',
                'user.admin': 'Administrator',
                'user.operator': 'Operator',
                'user.viewer': 'Viewer',
                'user.change_password': 'Change Password',
                'user.current_password': 'Current Password',
                'user.new_password': 'New Password',
                'user.confirm_password': 'Confirm Password',
                'user.change_photo': 'Change Photo',
                'user.passwords_dont_match': 'Passwords don\'t match',
                'user.password_hint': 'Hint:',
                'user.password_help': 'Leave password fields blank if you don\'t want to change it. New password must be at least 6 characters long.',
                
                // Settings
                'settings.company': 'Company',
                'settings.email': 'Email',
                'settings.system': 'System',
                'settings.company_name': 'Company Name',
                'settings.phone': 'Phone',
                'settings.address': 'Address',
                'settings.email_service': 'Email Service',
                'settings.email_template': 'Email Template',
                'settings.from_email': 'From Email',
                'settings.currency': 'Currency',
                'settings.timezone': 'Timezone',
                'settings.date_format': 'Date Format',
                'settings.save_success': 'Saved successfully!',
                'settings.save_error': 'Error saving. Please try again.',
                'settings.companyName': 'Company Name',
                'settings.companyEmail': 'Company Email',
                'settings.address': 'Address',
                'settings.emailServiceId': 'EmailJS Service ID',
                'settings.emailTemplateId': 'EmailJS Template ID',
                'settings.emailUserId': 'EmailJS User ID',
                'settings.defaultLanguage': 'Default Language',
                'settings.theme': 'Theme',
                'settings.notifications': 'Notifications',
                'settings.orderNotifications': 'New Orders',
                'settings.deliveryNotifications': 'Deliveries',
                
                // Common
                'common.cancel': 'Cancel',
                'common.save': 'Save',
                'cancel': 'Cancel',
                'save': 'Save',
                
                // Menu/Navigation
                dashboard: 'Dashboard',
                products: 'Products',
                clients: 'Clients',
                orders: 'Orders',
                deliveries: 'Deliveries',
                stock: 'Stock',
                
                // Navigation (nav prefix)
                'nav.dashboard': 'Dashboard',
                'nav.products': 'Products',
                'nav.clients': 'Clients',
                'nav.orders': 'Orders',
                'nav.deliveries': 'Deliveries',
                'nav.stock': 'Stock',
                
                // Dashboard
                'dashboard.title': 'Dashboard',
                'dashboard.newOrder': 'New Order',
                'dashboard.totalProducts': 'Total Products',
                'dashboard.totalClients': 'Total Clients',
                'dashboard.pendingOrders': 'Pending Orders',
                'dashboard.monthlyRevenue': 'Monthly Revenue',
                'dashboard.recentOrders': 'Recent Orders',
                'dashboard.todayDeliveries': 'Today\'s Deliveries',
                total_products: 'Total Products',
                total_clients: 'Total Clients',
                pending_orders: 'Pending Orders',
                monthly_revenue: 'Monthly Revenue',
                
                // Products
                add_product: 'Add Product',
                product_name: 'Product Name',
                product_description: 'Description',
                product_price: 'Price',
                product_category: 'Category',
                preparation_time: 'Preparation Time (hours)',
                
                // Clients
                add_client: 'Add Client',
                client_name: 'Client Name',
                client_email: 'Email',
                client_phone: 'Phone',
                client_address: 'Address',
                client_language: 'Preferred Language',
                client_notes: 'Notes',
                
                // Orders
                new_order: 'New Order',
                order_number: 'Order Number',
                order_date: 'Order Date',
                delivery_date: 'Delivery Date',
                delivery_time: 'Delivery Time',
                total_value: 'Total Value',
                paid_value: 'Paid Value',
                pending_value: 'Pending Value',
                payment_method: 'Payment Method',
                order_status: 'Order Status',
                order_notes: 'Notes',
                
                // Status
                pending: 'Pending',
                confirmed: 'Confirmed',
                production: 'In Production',
                ready: 'Ready',
                delivered: 'Delivered',
                cancelled: 'Cancelled',
                
                // Deliveries
                delivery_address: 'Delivery Address',
                delivery_person: 'Delivery Person',
                scheduled: 'Scheduled',
                out_for_delivery: 'Out for Delivery',
                delivery_cancelled: 'Cancelled',
                
                // Receipt
                receipt: 'Receipt',
                order_summary: 'Order Summary',
                payment_info: 'Payment Information',
                partial_payment: 'Partial Payment',
                remaining_payment: 'Remaining Payment',
                pay_on_delivery: 'Pay on Delivery',
                
                // Email
                order_confirmation: 'Order Confirmation',
                email_sent: 'Email sent successfully!',
                email_error: 'Error sending email',
                
                // Buttons
                save: 'Save',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                confirm: 'Confirm',
                send_email: 'Send Email',
                generate_receipt: 'Generate Receipt',
                
                // Messages
                success: 'Operation completed successfully!',
                error: 'An error occurred. Please try again.',
                confirm_delete: 'Are you sure you want to delete?',
                no_data: 'No records found',
                loading: 'Loading...',
                
                // Validation
                required_field: 'Required field',
                invalid_email: 'Invalid email',
                invalid_phone: 'Invalid phone',
                invalid_price: 'Invalid price',
                
                // Categories
                cakes: 'Cakes',
                cupcakes: 'Cupcakes',
                pies: 'Pies',
                special_cakes: 'Special Cakes',
                sweets: 'Sweets'
            }
        };
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.updateUI();
            localStorage.setItem('leos_cake_language', lang);
        }
    }
    
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    t(key) {
        return this.translations[this.currentLang][key] || key;
    }
    
    updateUI() {
        // Atualizar todos os elementos com data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (element.tagName === 'INPUT' && element.type !== 'submit') {
                element.placeholder = this.t(key);
            } else {
                element.textContent = this.t(key);
            }
        });
        
        // Atualizar título da página
        document.title = this.t('system_title');
    }
    
    formatCurrency(value, currency = 'BRL') {
        const locale = this.currentLang === 'pt' ? 'pt-BR' : 'en-US';
        const currencyCode = this.currentLang === 'pt' ? 'BRL' : 'USD';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode
        }).format(value);
    }
    
    formatDate(date) {
        const locale = this.currentLang === 'pt' ? 'pt-BR' : 'en-US';
        return new Intl.DateTimeFormat(locale).format(new Date(date));
    }
    
    init() {
        // Carregar idioma salvo
        const savedLang = localStorage.getItem('leos_cake_language');
        if (savedLang && this.translations[savedLang]) {
            this.currentLang = savedLang;
        }
        this.updateUI();
    }
}

// Instância global
window.i18n = new I18n();

// Função global para trocar idioma via bandeiras clicáveis
function changeLanguage(lang) {
    if (window.i18n && window.i18n.translations[lang]) {
        window.i18n.currentLang = lang;
        localStorage.setItem('leos_cake_language', lang);
        window.i18n.updateUI();
        
        // Atualizar bandeiras ativas
        document.querySelectorAll('.flag-wrapper').forEach(flag => {
            flag.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
    }
}