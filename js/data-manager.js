// data-manager.js - Gerenciador de Dados com Supabase
class DataManager {
    constructor(supabase) {
        this.supabase = supabase;
        this.cache = {};
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        log('✅ DataManager inicializado');
    }

    async getTable(tableName, filters = {}) {
        try {
            let query = this.supabase.from(tableName).select('*');
           
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
           
            const { data, error } = await query;
            if (error) throw error;
           
            this.cache[tableName] = data;
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            return this.cache[tableName] || [];
        }
    }

    async saveData(tableName, data) {
        try {
            const { error } = await this.supabase.from(tableName).upsert(data);
            if (error) throw error;
           
            // Atualizar cache
            const cached = this.cache[tableName] || [];
            const index = cached.findIndex(item => item.id === data.id);
            if (index > -1) {
                cached[index] = data;
            } else {
                cached.push(data);
            }
            this.cache[tableName] = cached;
           
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }

    isReady() {
        return this.isInitialized;
    }
}

// Inicialização global
window.dataManager = new DataManager(window.supabase);