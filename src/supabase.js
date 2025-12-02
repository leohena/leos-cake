// supabase.js - Configuração e utilitários do Supabase
let supabaseClient = null;

async function initializeSupabase() {
	if (supabaseClient) {
		console.log('🔌 Cliente Supabase já inicializado.');
		return supabaseClient;
	}

	console.log('🔧 Inicializando Supabase...');

	// Aguardar biblioteca Supabase carregar
	if (!window.supabase) {
		let attempts = 0;
		while (!window.supabase && attempts < 50) {
			await new Promise(resolve => setTimeout(resolve, 100));
			attempts++;
		}
		if (!window.supabase) {
			throw new Error('Biblioteca Supabase não carregou');
		}
	}

	// Detectar se estamos no GitHub Pages ou Netlify
	const isGitHubPages = window.location.hostname.includes('github.io');

	let config;
	if (isGitHubPages) {
		console.log('📄 Usando GitHub Pages - configurações locais');
		// Configurações seguras para GitHub Pages (desenvolvimento/demo)
		config = {
			url: 'https://qzuccgbxddzpbotxvjug.supabase.co',
			anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dWNjZ2J4ZGR6cGJvdHh2anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODE1NTQsImV4cCI6MjA3Nzc1NzU1NH0.jMtCOeyS3rLLanJzeWv0j1cYQFnFUBjZmnwMe5aUNk4'
		};
	} else {
		// Usar Netlify Functions para produção
		console.log('🌐 Usando Netlify - carregando configuração segura');

		try {
			const response = await fetch('/.netlify/functions/config');
			if (response.ok) {
				const netlifyConfig = await response.json();
				config = {
					url: netlifyConfig.supabase.url,
					anonKey: netlifyConfig.supabase.anonKey
				};
				console.log('✅ Configuração carregada via Netlify Functions');
			} else {
				throw new Error('Função config falhou');
			}
		} catch (error) {
			console.error('❌ Erro ao carregar config do Netlify:', error);
			// Fallback para desenvolvimento local
			config = {
				url: 'https://qzuccgbxddzpbotxvjug.supabase.co',
				anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6dWNjZ2J4ZGR6cGJvdHh2anVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxODE1NTQsImV4cCI6MjA3Nzc1NzU1NH0.jMtCOeyS3rLLanJzeWv0j1cYQFnFUBjZmnwMe5aUNk4'
			};
			console.log('⚠️ Usando fallback local');
		}
	}

	// Criar cliente Supabase
	supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
		auth: {
			autoRefreshToken: true,
			persistSession: true
		},
		global: {
			headers: {
				'X-Client-Info': 'leos-cake-app'
			}
		}
	});

	console.log('✅ Cliente Supabase criado com sucesso');
	window.supabaseClient = supabaseClient;
	return supabaseClient;
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
			const response = await fetch('/.netlify/functions/config');
			if (response.ok) {
				config = await response.json();
			}
		} catch (error) {
			console.warn('⚠️ Função Netlify não disponível, tentando modo offline...');
		}

		// 2. Se não conseguiu da função Netlify, tentar config.local.json
		if (!config || !config.supabase?.url || !config.supabase?.anonKey) {
			try {
				const localConfigResponse = await fetch('./config.local.json');
				if (localConfigResponse.ok) {
					const localConfig = await localConfigResponse.json();
					if (localConfig.supabase?.url && localConfig.supabase?.anonKey &&
						!localConfig.supabase.anonKey.includes('SUA_CHAVE')) {
						config = localConfig;
						console.log('✅ Configurações carregadas do config.local.json');
					}
				}
			} catch (error) {
				console.warn('⚠️ config.local.json não disponível');
			}
		}

		// 3. Se ainda não tem config válida, usar modo OFFLINE com dados mockados
		if (!config || !config.supabase?.url || !config.supabase?.anonKey ||
			config.supabase.anonKey.includes('SUA_CHAVE') || config.supabase.anonKey.includes('example')) {

			console.warn('⚠️ Configuração não encontrada ou inválida. Usando MODO OFFLINE para testes.');

			// Criar cliente mockado
			supabaseClient = {
				from: (table) => ({
					select: () => ({
						eq: () => ({
							single: async () => ({ data: null, error: null }),
							order: () => ({ data: [], error: null }),
							limit: () => ({ data: [], error: null })
						}),
						order: () => ({
							limit: () => ({ data: [], error: null })
						}),
						limit: () => ({ data: [], error: null })
					}),
					insert: () => ({
						select: () => ({ data: { id: Date.now() }, error: null })
					}),
					update: () => ({
						eq: () => ({ data: { id: 1 }, error: null })
					}),
					delete: () => ({
						eq: () => ({ data: null, error: null })
					})
				}),
				auth: {
					signInWithPassword: async () => ({ data: { user: { id: 1, email: 'admin@test.com' } }, error: null }),
					signOut: async () => ({ error: null }),
					onAuthStateChange: (callback) => {
						// Simular usuário logado
						setTimeout(() => callback('SIGNED_IN', { user: { id: 1, email: 'admin@test.com' } }), 100);
						return { data: { subscription: { unsubscribe: () => {} } } };
					}
				}
			};

			window.supabaseClient = supabaseClient;
			console.log('🎭 MODO OFFLINE ativado - Usando dados mockados para testes');
			return supabaseClient;
		}

		if (!config.supabase?.url || !config.supabase?.anonKey) {
			throw new Error('Configuração recebida é inválida.');
		}

		console.log('✅ Configurações carregadas com sucesso.');
		const { url, anonKey } = config.supabase;

		// 2. Aguardar a biblioteca Supabase estar disponível no window.
		let attempts = 0;
		while (!window.supabase && attempts < 50) {
			await new Promise(resolve => setTimeout(resolve, 100));
			attempts++;
		}
		if (!window.supabase) {
			throw new Error('A biblioteca global do Supabase (window.supabase) não carregou a tempo.');
		}

		// 3. Criar e testar o cliente Supabase.
		supabaseClient = window.supabase.createClient(url, anonKey, {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
			},
			global: { headers: { 'X-Client-Info': 'leos-cake-app' } },
		});

		const { error } = await supabaseClient.from('usuarios').select('id').limit(1);
		if (error) {
			console.warn(`⚠️ Conexão com Supabase estabelecida, mas com um aviso: ${error.message}`);
		} else {
			console.log('✅ Conexão com Supabase verificada com sucesso.');
		}

		// 4. Disponibilizar o cliente globalmente e retornar.
		window.supabaseClient = supabaseClient;
		return supabaseClient;

	} catch (error) {
		console.error('❌ Erro crítico ao inicializar o Supabase:', error.message);
		// Em caso de falha, exibe uma mensagem clara para o usuário final.
		const body = document.querySelector('body');
		if (body) {
			body.innerHTML = '<div style="font-family: sans-serif; text-align: center; padding: 40px;"><h1>Erro de Configuração</h1><p>O sistema não pôde ser iniciado. Verifique se as variáveis de ambiente no servidor estão configuradas corretamente e tente novamente.</p></div>';
		}
		window.supabaseClient = null;
		return null;
	}
}

// Função para obter o cliente Supabase já inicializado.
function getSupabaseClient() {
	if (!supabaseClient) {
		console.warn("getSupabaseClient chamado antes da inicialização. Considere usar 'await initializeSupabase()' primeiro.");
	}
	return supabaseClient;
}

// Inicializa o Supabase quando o DOM está pronto.
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		// Não inicializar automaticamente - deixar para os outros scripts chamarem quando necessário
		console.log('🔧 Supabase pronto para inicialização');
	});
} else {
	console.log('🔧 Supabase pronto para inicialização');
}

// Exportar funções para o escopo global para acesso em outros scripts.
window.initializeSupabase = initializeSupabase;
window.getSupabaseClient = getSupabaseClient;
