// supabase.js - Configuração e utilitários do Supabase

let supabaseClient = null;
let supabaseConfig = null;

async function loadSupabaseConfig() {
	try {
		console.log('🔧 Carregando configurações do Supabase...');
		// Tentar carregar configurações da função Netlify primeiro
		const response = await fetch('/.netlify/functions/config');
		if (response.ok) {
			const config = await response.json();
			supabaseConfig = config.supabase;
			console.log('✅ Configurações carregadas da função Netlify:', supabaseConfig.URL);
		} else {
			console.warn('⚠️ Resposta da função config:', response.status, response.statusText);
			throw new Error('Função config não disponível');
		}
	} catch (error) {
		console.warn('⚠️ Usando configurações fallback:', error.message);
		// Fallback para configurações locais (desenvolvimento)
		supabaseConfig = {
			URL: 'https://qzuccgbxddzpbotxvjug.supabase.co',
			ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dWNjZ2J4ZGR6cGJvdHh2anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODE1NTQsImV4cCI6MjA3Nzc1NzU1NH0.jMtCOeyS3rLLanJzeWv0j1cYQFnFUBjZmnwMe5aUNk4'
		};
		console.log('📋 Usando configurações fallback');
	}
	return supabaseConfig;
}

async function initializeSupabase() {
	try {
		console.log('🔌 Inicializando Supabase...');

		// Carregar configurações primeiro
		if (!supabaseConfig) {
			await loadSupabaseConfig();
		}

		// Aguardar a biblioteca Supabase estar carregada
		let attempts = 0;
		while (!window.supabase && attempts < 50) {
			await new Promise(resolve => setTimeout(resolve, 100));
			attempts++;
		}

		if (!window.supabase) {
			console.error('❌ Biblioteca Supabase não carregou');
			window.supabaseClient = null;
			return null;
		}

		// Criar cliente Supabase com configurações carregadas
		supabaseClient = window.supabase.createClient(
			supabaseConfig.URL,
			supabaseConfig.ANON_KEY,
			{
				auth: {
					autoRefreshToken: true,
					persistSession: true
				},
				global: {
					headers: {
						'X-Client-Info': 'leos-cake-app'
					}
				},
				db: {
					schema: 'public'
				},
				realtime: {
					params: {
						eventsPerSecond: 10
					}
				}
			}
		);

		if (!supabaseClient) {
			console.error('❌ Erro ao criar cliente Supabase');
			return null;
		}

		// Testar conexão
		try {
			const { data, error } = await supabaseClient
				.from('usuarios')
				.select('id')
				.limit(1);

			if (error) {
				console.warn('⚠️ Aviso ao conectar:', error.message);
				// Não falhar totalmente, apenas avisar
			} else {
				console.log('✅ Conexão com Supabase estabelecida com sucesso');
			}
		} catch (testError) {
			console.warn('⚠️ Erro ao testar conexão:', testError.message);
		}

		// Guardar globalmente
		window.supabaseClient = supabaseClient;

		return supabaseClient;
	} catch (error) {
		console.error('❌ Erro ao inicializar Supabase:', error);
		window.supabaseClient = null;
		return null;
	}
}

// Verificar conexão
async function testSupabaseConnection() {
	try {
		if (!supabaseClient) {
			return {
				success: false,
				message: 'Cliente Supabase não inicializado'
			};
		}

		const { data, error } = await supabaseClient
			.from('usuarios')
			.select('id')
			.limit(1);

		if (error) {
			return {
				success: false,
				message: `Erro: ${error.message}`
			};
		}

		return {
			success: true,
			message: 'Conexão com Supabase OK'
		};
	} catch (error) {
		return {
			success: false,
			message: `Erro na conexão: ${error.message}`
		};
	}
}

// Inicializar quando o documento estiver pronto
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
	initializeSupabase();
}

// Exportar para uso global
window.initializeSupabase = initializeSupabase;
window.getSupabaseClient = () => supabaseClient;
window.testSupabaseConnection = testSupabaseConnection;