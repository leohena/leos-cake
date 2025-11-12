// auth.js - Sistema de Autenticação com Supabase

class AuthSystem {
	constructor() {
		this.currentUser = null;
		this.isInitialized = false;
		this.supabaseClient = null;
	}

	async initialize() {
		try {
			// Aguardar inicialização do Supabase
			let attempts = 0;
			while (!window.supabaseClient && attempts < 50) {
				await new Promise(resolve => setTimeout(resolve, 100));
				attempts++;
			}

			this.supabaseClient = window.supabaseClient;

			if (!this.supabaseClient) {
				console.warn('⚠️ Supabase não inicializado, usando modo local');
			} else {
				console.log('✅ Supabase conectado com sucesso');
			}

			// Verificar se há usuário em sessão
			const userData = sessionStorage.getItem('currentUser');
			if (userData) {
				this.currentUser = JSON.parse(userData);
				this.isInitialized = true;
				console.log('✅ Usuário carregado da sessão:', this.currentUser.nome);
				return true;
			}

			this.isInitialized = true;
			return false;
		} catch (error) {
			console.error('Erro ao inicializar AuthSystem:', error);
			this.isInitialized = true;
			return false;
		}
	}

	async login(email, senha) {
		try {
			// Primeiro, tentar login via Supabase
			if (this.supabaseClient) {
				return await this.loginWithSupabase(email, senha);
			} else {
				console.warn('⚠️ Supabase não disponível');
				return { success: false, message: 'Erro de conexão com o servidor' };
			}
		} catch (error) {
			console.error('Erro no login:', error);
			return { success: false, message: 'Erro ao fazer login' };
		}
	}

	async loginWithSupabase(email, senha) {
		try {
			// Verificar se o usuário existe na tabela 'usuarios'
			const { data: usuarios, error: queryError } = await this.supabaseClient
				.from('usuarios')
				.select('*')
				.eq('email', email)
				.single();

			if (queryError) {
				console.error('Erro ao buscar usuário:', queryError);
				return { success: false, message: 'Email ou senha incorretos' };
			}

			if (!usuarios) {
				console.log('Usuário não encontrado');
				return { success: false, message: 'Email ou senha incorretos' };
			}

			// Verificar senha (em produção, usar hash)
			// Por enquanto, comparar diretamente (melhorar depois)
			if (usuarios.senha !== senha && usuarios.password_hash !== senha) {
				console.log('Senha incorreta');
				return { success: false, message: 'Email ou senha incorretos' };
			}

			// Login bem-sucedido
			const user = {
				id: usuarios.id,
				nome: usuarios.nome,
				email: usuarios.email,
				tipo: usuarios.tipo || 'user',
				foto_url: usuarios.foto_url || null,
				ativo: usuarios.ativo !== false
			};

			this.currentUser = user;
			sessionStorage.setItem('currentUser', JSON.stringify(user));

			console.log('✅ Login bem-sucedido:', user.nome);
			return { success: true, user };
		} catch (error) {
			console.error('Erro ao fazer login via Supabase:', error);
			return { success: false, message: 'Erro ao fazer login. Tente novamente.' };
		}
	}

	logout() {
		this.currentUser = null;
		sessionStorage.removeItem('currentUser');
		console.log('✅ Logout realizado');
		return true;
	}

	isLoggedIn() {
		return this.currentUser !== null;
	}

	getCurrentUser() {
		return this.currentUser;
	}

	async updateUserProfile(profileData) {
		try {
			if (!this.currentUser) {
				return { success: false, message: 'Usuário não autenticado' };
			}

			// Atualizar no Supabase se disponível
			if (this.supabaseClient && this.currentUser.id) {
				const updateData = {};
				if (profileData.nome) updateData.nome = profileData.nome;
				if (profileData.foto_url) updateData.foto_url = profileData.foto_url;
				if (profileData.password_hash) updateData.password_hash = profileData.password_hash;

				const { error } = await this.supabaseClient
					.from('usuarios')
					.update(updateData)
					.eq('id', this.currentUser.id);

				if (error) {
					console.error('Erro ao atualizar perfil no Supabase:', error);
					return { success: false, message: 'Erro ao atualizar perfil' };
				}
			}

			// Atualizar dados locais
			this.currentUser = { ...this.currentUser, ...profileData };
			sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));

			console.log('✅ Perfil atualizado:', this.currentUser.nome);
			return { success: true, user: this.currentUser };
		} catch (error) {
			console.error('Erro ao atualizar perfil:', error);
			return { success: false, message: 'Erro ao atualizar perfil' };
		}
	}

	async uploadUserPhoto(file) {
		try {
			// Em desenvolvimento, usar URL de data
			const reader = new FileReader();
			return new Promise((resolve, reject) => {
				reader.onload = (e) => {
					const photoUrl = e.target.result;
					this.currentUser.foto_url = photoUrl;
					sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
					resolve({ success: true, photoUrl });
				};
				reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
				reader.readAsDataURL(file);
			});
		} catch (error) {
			console.error('Erro ao fazer upload:', error);
			return { success: false, message: 'Erro ao fazer upload' };
		}
	}

	isReady() {
		return this.isInitialized;
	}

	async testConnection() {
		try {
			if (!this.supabaseClient) {
				return { success: false, message: 'Supabase não inicializado' };
			}

			// Testar conexão
			const { data, error } = await this.supabaseClient
				.from('usuarios')
				.select('COUNT(*)');

			if (error) {
				console.error('Erro ao testar conexão:', error);
				return { success: false, message: 'Erro ao conectar ao banco de dados' };
			}

			console.log('✅ Conexão com Supabase OK');
			return { success: true, message: 'Conexão com Supabase funcionando' };
		} catch (error) {
			console.error('Erro ao testar conexão:', error);
			return { success: false, message: 'Erro ao testar conexão' };
		}
	}
}

// Inicializar AuthSystem globalmente
let authSystem = null;

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', async () => {
		authSystem = new AuthSystem();
		await authSystem.initialize();
		window.authSystem = authSystem;
	});
} else {
	authSystem = new AuthSystem();
	authSystem.initialize();
	window.authSystem = authSystem;
}

window.AuthSystem = AuthSystem;