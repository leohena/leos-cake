/**
 * dashboard-app.js - Leo's Cake Dashboard
 * Versão FINAL: Aguarda DataManager antes de carregar
 */

class DashboardApp {
    constructor() {
        this.auth = window.authSystem;
        this.dataManager = null;
        this.currentUser = null;
        this.isLoading = false;
        
        log('Dashboard App iniciado');
        this.init();
    }

    async init() {
        log('Dashboard carregando...');

        // 1. Verificar AuthSystem
        if (!this.auth || !this.auth.isReady()) {
            log('AuthSystem não está pronto');
            return this.showError('Sistema de autenticação não carregado');
        }
        log('AuthSystem encontrado');

        // 2. Verificar usuário logado
        this.currentUser = this.auth.getCurrentUser();
        if (!this.currentUser) {
            log('Usuário não autenticado, redirecionando...');
            window.location.href = 'login.html';
            return;
        }
        log('Usuário autenticado:', this.currentUser.nome);

        // 3. AGUARDAR DataManager com retry
        this.dataManager = await this.waitForDataManager();
        if (!this.dataManager) {
            return this.showError('Falha ao conectar com o banco de dados');
        }

        log('Todos os sistemas prontos: Auth + DataManager');

        // 4. Carregar dados
        await this.loadInitialData();

        log('Dashboard inicializado com sucesso');
    }

    // ===========================================
    // AGUARDAR DATAMANAGER COM RETRY
    // ===========================================
    async waitForDataManager(maxAttempts = 50, delay = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            if (window.dataManager && window.dataManager.isReady()) {
                log('DataManager.isReady() → true');
                return window.dataManager;
            }
            await new Promise(r => setTimeout(r, delay));
        }
        console.error('DataManager não inicializou a tempo');
        return null;
    }

    // ===========================================
    // CARREGAR DADOS INICIAIS
    // ===========================================
    async loadInitialData() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            await this.loadDashboardData();
            await this.loadRecentOrders();
            await this.loadUpcomingDeliveries();
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.showError('Erro ao carregar dados do dashboard');
        } finally {
            this.isLoading = false;
        }
    }

    async loadDashboardData() {
        log('Carregando estatísticas do dashboard...');
        try {
        const stats = await this.dataManager.getDashboardStats();

        const el = (id) => document.getElementById(id);
        if (!el('total-produtos')) throw new Error('Elemento #total-produtos não encontrado');

        el('total-produtos').textContent = stats.totalProdutos || 0;
        el('total-clientes').textContent = stats.totalClientes || 0;
        el('pedidos-pendentes').textContent = stats.pedidosPendentes || 0;
        el('receita-mes').textContent = `R$ ${(stats.receitaMes || 0).toFixed(2)}`.replace('.', ',');

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        this.showError('Erro ao carregar estatísticas do dashboard');
    }
}

showError(message) {
    const container = document.querySelector('.container-fluid') || document.body;
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        <strong>Erro:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.prepend(alert);
}

    async loadRecentOrders() {
        log('Carregando pedidos recentes...');
        try {
            const pedidos = await this.dataManager.getPedidos();
            const recentes = pedidos.slice(0, 5);

            const tbody = document.getElementById('recent-orders-body');
            tbody.innerHTML = '';

            if (recentes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum pedido recente</td></tr>';
                return;
            }

            recentes.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${p.numero_pedido}</td>
                    <td>${p.clientes?.nome || 'Cliente'}</td>
                    <td>R$ ${parseFloat(p.valor_total || 0).toFixed(2).replace('.', ',')}</td>
                    <td><span class="badge bg-${this.getStatusColor(p.status)}">${this.formatStatus(p.status)}</span></td>
                    <td>${new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar pedidos recentes:', error);
        }
    }

    async loadUpcomingDeliveries() {
        log('Carregando entregas futuras...');
        try {
            const hoje = new Date().toISOString().split('T')[0];
            const entregas = await this.dataManager.getEntregas(hoje);

            const container = document.getElementById('upcoming-deliveries');
            container.innerHTML = '';

            if (entregas.length === 0) {
                container.innerHTML = '<p class="text-muted">Nenhuma entrega agendada para hoje</p>';
                return;
            }

            entregas.slice(0, 5).forEach(e => {
                const div = document.createElement('div');
                div.className = 'delivery-item';
                div.innerHTML = `
                    <strong>${e.hora_entrega}</strong> - 
                    Pedido #${e.pedidos?.numero_pedido} 
                    <small>(${e.pedidos?.clientes?.nome})</small>
                `;
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Erro ao carregar entregas:', error);
        }
    }

    // ===========================================
    // UTILS
    // ===========================================
    getStatusColor(status) {
        const map = {
            'pendente': 'warning',
            'confirmado': 'info',
            'producao': 'primary',
            'pronto': 'success',
            'entregue': 'secondary',
            'cancelado': 'danger'
        };
        return map[status] || 'secondary';
    }

    formatStatus(status) {
        const map = {
            'pendente': 'Pendente',
            'confirmado': 'Confirmado',
            'producao': 'Em Produção',
            'pronto': 'Pronto',
            'entregue': 'Entregue',
            'cancelado': 'Cancelado'
        };
        return map[status] || status;
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.innerHTML = `<strong>Erro:</strong> ${message}`;
        document.querySelector('.container-fluid').prepend(alert);
    }
}

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Garantir que tudo carregue na ordem certa
document.addEventListener('DOMContentLoaded', () => {
    log('Script de inicialização carregado');
    
    // Aguardar Supabase e Auth
    setTimeout(() => {
        if (window.supabase) {
            log('Supabase inicializado com sucesso');
        }
        if (window.authSystem && window.authSystem.isReady()) {
            log('AuthSystem pronto para uso');
        }

        // Só inicia o dashboard quando tudo estiver pronto
        if (window.authSystem && window.dataManager) {
            new DashboardApp();
        } else {
            // Retry em 500ms
            setTimeout(() => {
                if (window.authSystem && window.dataManager) {
                    new DashboardApp();
                }
            }, 500);
        }
    }, 100);
});

log('dashboard-app.js carregado');class DashboardApp {
    async init() {
        await this.wait(100);
        if (!window.authSystem?.getCurrentUser()) {
            location.href = 'login.html';
            return;
        }

        if (!window.dataManager?.isReady()) {
            this.error('Banco de dados não conectado');
            return;
        }

        const stats = await window.dataManager.getDashboardStats();
        this.set('total-produtos', stats.totalProdutos);
        this.set('total-clientes', stats.totalClientes);
        this.set('pedidos-pendentes', stats.pedidosPendentes);
        this.set('receita-mes', `R$ ${stats.receitaMes.toFixed(2)}`.replace('.', ','));

        document.getElementById('recent-orders-body').innerHTML = '<tr><td>Sem dados</td></tr>';
    }

    set(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    error(msg) {
        const div = document.createElement('div');
        div.className = 'alert alert-danger';
        div.innerHTML = `<strong>Erro:</strong> ${msg}`;
        document.getElementById('error-container').appendChild(div);
    }

    wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

window.addEventListener('load', () => new DashboardApp().init());