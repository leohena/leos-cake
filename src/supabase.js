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
