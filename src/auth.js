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
				// Criar usuário mockado para testes
				this.currentUser = {
					id: 1,
					nome: 'Administrador',
					email: 'admin@test.com',
					perfil: 'admin',
					senha_padrao: false
				};
				sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
				this.isInitialized = true;
				console.log('🎭 MODO OFFLINE: Usuário administrador mockado criado');
				return true;
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
			// Primeiro, tentar login via Supabase Auth
			if (this.supabaseClient) {
				const result = await this.loginWithSupabase(email, senha);
				if (result.success) return result;
				// Se falhar, tentar login manual na tabela 'usuarios'
				const { data: usuario, error } = await this.supabaseClient
					.from('usuarios')
					.select('*')
					.eq('email', email)
					.single();
				const hashDigitado = btoa(senha);
				// Removido console.log de senhas por segurança
				const comparacao = usuario?.password_hash === hashDigitado;
				if (!error && usuario && usuario.password_hash && comparacao) {
					const user = {
						id: usuario.id,
						nome: usuario.nome,
						email: usuario.email,
						role: usuario.role || usuario.tipo || 'user',
						foto_url: usuario.foto_url || null,
						ativo: usuario.ativo !== false,
						senha_padrao: usuario.password_hash === btoa('123456') // Flag para senha padrão
					};
					this.currentUser = user;
					sessionStorage.setItem('currentUser', JSON.stringify(user));
					return { success: true, user };
				} else {
					console.warn('Login local falhou: email ou senha incorretos');
					return { success: false, message: 'Email ou senha incorretos' };
				}
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
			// 1. Autenticar pelo Supabase Auth
			const { data: authUser, error: authError } = await this.supabaseClient.auth.signInWithPassword({ email, password: senha });
			if (authError || !authUser?.user) {
				console.error('Erro de autenticação Supabase:', authError);
				return { success: false, message: 'Email ou senha incorretos' };
			}
			const userEmail = authUser.user.email;

			// 2. Buscar dados completos na tabela 'usuarios'
			let { data: usuario, error: queryError } = await this.supabaseClient
				.from('usuarios')
				.select('*')
				.eq('email', userEmail)
				.single();

			// 3. Se não existir, criar registro básico
			if (!usuario) {
				const basicUser = {
					nome: authUser.user.user_metadata?.full_name || userEmail.split('@')[0],
					email: userEmail,
					tipo: 'user',
					foto_url: null,
					ativo: true
				};
				const { data: created, error: createError } = await this.supabaseClient
					.from('usuarios')
					.insert([basicUser])
					.select('*')
					.single();
				usuario = created;
			}

			// 4. Login bem-sucedido, usar dados da tabela 'usuarios'
			const user = {
				id: usuario.id,
				nome: usuario.nome,
				email: usuario.email,
				role: usuario.role || usuario.tipo || 'user',
				foto_url: usuario.foto_url || null,
				ativo: usuario.ativo !== false,
				senha_padrao: usuario.password_hash === btoa('123456') // Flag para senha padrão
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

	async getCurrentUser() {
		// Busca o usuário atualizado da tabela 'usuarios' pelo id
		if (!this.currentUser || !this.currentUser.id || !this.supabaseClient) return this.currentUser;
		try {
			const { data: usuario, error } = await this.supabaseClient
				.from('usuarios')
				.select('*')
				.eq('id', this.currentUser.id)
				.single();
			if (!error && usuario) {
				// Atualiza os dados locais
				this.currentUser = {
					...this.currentUser,
					role: usuario.role || usuario.tipo || 'user',
					nome: usuario.nome,
					email: usuario.email,
					foto_url: usuario.foto_url || null,
					telefone: usuario.telefone || '',
					endereco: usuario.endereco || '',
					ativo: usuario.ativo !== false
				};
				sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
			}
		} catch (e) {
			console.warn('Erro ao atualizar usuário:', e);
		}
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
				if (profileData.telefone) updateData.telefone = profileData.telefone;
				if (profileData.endereco) updateData.endereco = profileData.endereco;

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