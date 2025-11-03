/**
 * Migração de Dados - Leo's Cake
 * Script para migrar dados do localStorage para Supabase
 */

class DataMigration {
    constructor(app) {
        this.app = app;
    }

    /**
     * Verifica se há dados antigos no localStorage
     */
    hasLegacyData() {
        const produtos = localStorage.getItem('produtos');
        const clientes = localStorage.getItem('clientes');
        const pedidos = localStorage.getItem('pedidos');
        
        return !!(produtos || clientes || pedidos);
    }

    /**
     * Executa a migração dos dados
     */
    async migrateLegacyData() {
        if (!this.hasLegacyData()) {
            console.log('✅ Nenhum dado antigo encontrado');
            return { migrated: false, message: 'Nenhum dado para migrar' };
        }

        console.log('🔄 Iniciando migração de dados do localStorage...');
        
        try {
            const results = {
                produtos: { total: 0, migrated: 0, errors: 0 },
                clientes: { total: 0, migrated: 0, errors: 0 },
                pedidos: { total: 0, migrated: 0, errors: 0 }
            };

            // Migrar produtos
            const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
            results.produtos.total = produtos.length;
            
            for (const produto of produtos) {
                try {
                    await this.app.dataManager.saveProduto(produto);
                    results.produtos.migrated++;
                } catch (error) {
                    console.error('❌ Erro ao migrar produto:', produto.nome, error);
                    results.produtos.errors++;
                }
            }

            // Migrar clientes
            const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
            results.clientes.total = clientes.length;
            
            for (const cliente of clientes) {
                try {
                    await this.app.dataManager.saveCliente(cliente);
                    results.clientes.migrated++;
                } catch (error) {
                    console.error('❌ Erro ao migrar cliente:', cliente.nome, error);
                    results.clientes.errors++;
                }
            }

            // Migrar pedidos
            const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
            results.pedidos.total = pedidos.length;
            
            for (const pedido of pedidos) {
                try {
                    await this.app.dataManager.savePedido(pedido);
                    results.pedidos.migrated++;
                } catch (error) {
                    console.error('❌ Erro ao migrar pedido:', pedido.id, error);
                    results.pedidos.errors++;
                }
            }

            console.log('✅ Migração concluída:', results);
            
            // Se migração foi bem-sucedida, limpar localStorage
            if (this.shouldCleanLegacyData(results)) {
                this.cleanLegacyData();
            }
            
            return { migrated: true, results };
            
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            throw error;
        }
    }

    /**
     * Determina se deve limpar dados antigos
     */
    shouldCleanLegacyData(results) {
        const totalMigrated = results.produtos.migrated + 
                            results.clientes.migrated + 
                            results.pedidos.migrated;
        
        const totalErrors = results.produtos.errors + 
                          results.clientes.errors + 
                          results.pedidos.errors;
        
        // Limpar apenas se a maioria foi migrada com sucesso
        return totalMigrated > 0 && totalErrors === 0;
    }

    /**
     * Remove dados antigos do localStorage
     */
    cleanLegacyData() {
        const keysToRemove = [
            'produtos',
            'clientes', 
            'pedidos',
            'configuracoes', // Configurações antigas
            'leos_cake_config' // Configurações antigas
        ];

        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🧹 Removido: ${key}`);
            }
        });

        console.log('✅ Limpeza do localStorage concluída');
    }

    /**
     * Cria backup dos dados antes da migração
     */
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            produtos: JSON.parse(localStorage.getItem('produtos') || '[]'),
            clientes: JSON.parse(localStorage.getItem('clientes') || '[]'),
            pedidos: JSON.parse(localStorage.getItem('pedidos') || '[]'),
            configuracoes: JSON.parse(localStorage.getItem('configuracoes') || '{}')
        };

        // Salvar backup no localStorage com chave específica
        localStorage.setItem('backup_migration_' + Date.now(), JSON.stringify(backup));
        
        console.log('💾 Backup criado:', backup.timestamp);
        return backup;
    }

    /**
     * Exibe estatísticas da migração
     */
    showMigrationStats(results) {
        const stats = [
            `📦 Produtos: ${results.produtos.migrated}/${results.produtos.total}`,
            `👥 Clientes: ${results.clientes.migrated}/${results.clientes.total}`,
            `📋 Pedidos: ${results.pedidos.migrated}/${results.pedidos.total}`
        ].join('\n');

        console.log('📊 Estatísticas da migração:\n' + stats);
        
        return stats;
    }

    /**
     * Migração interativa com interface
     */
    async showMigrationDialog() {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'migration-dialog';
            dialog.innerHTML = `
                <div class="migration-content">
                    <h3>🔄 Migração de Dados</h3>
                    <p>Dados antigos encontrados no navegador.</p>
                    <p>Deseja migrar para o banco de dados Supabase?</p>
                    <div class="migration-actions">
                        <button id="migrate-yes" class="btn btn-primary">✅ Sim, migrar</button>
                        <button id="migrate-no" class="btn btn-secondary">❌ Não agora</button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            document.getElementById('migrate-yes').onclick = () => {
                document.body.removeChild(dialog);
                resolve(true);
            };

            document.getElementById('migrate-no').onclick = () => {
                document.body.removeChild(dialog);
                resolve(false);
            };
        });
    }
}

// Disponibilizar globalmente
window.DataMigration = DataMigration;