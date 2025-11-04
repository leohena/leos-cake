// login-app.js - Sistema de Login Completo e Corrigido
// Versão compatível com auth-system.js atualizado

class LoginApp {
    constructor() {
        this.auth = null;
        this.dataManager = null;
        this.splashShown = false;
        console.log('🔐 Login App iniciado');
    }

    async init() {
        try {
            console.log('🚀 Inicializando LoginApp...');
            
            // Aguardar sistemas carregarem
            await this.waitForSystems();
            
            // Mostrar splash screen
            this.showSplashScreen();
            
            // Após splash, verificar autenticação
            setTimeout(() => {
                this.hideSplashScreen();
                this.checkAuth();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro na inicialização do Login:', error);
            // Mesmo com erro, mostrar tela de login
            this.hideSplashScreen();
            this.showLogin();
        }
    }

    async waitForSystems() {
        console.log('⏳ Aguardando sistemas...');
        
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos
        
        while (attempts < maxAttempts) {
            // Verificar se AuthSystem existe e está inicializado
            if (window.authSystem && window.authSystem.isInitialized) {
                this.auth = window.authSystem;
                console.log('✅ AuthSystem encontrado e inicializado');
                
                // DataManager é opcional
                if (window.dataManager) {
                    this.dataManager = window.dataManager;
                    console.log('✅ DataManager encontrado');
                }
                
                return; // Sucesso!
            }
            
            // Aguardar 100ms e tentar novamente
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // Se chegou aqui, AuthSystem não foi encontrado
        // Mas vamos tentar criar um novo
        console.warn('⚠️ AuthSystem não encontrado, criando novo...');
        
        if (window.AuthSystem) {
            this.auth = new window.AuthSystem();
            await this.auth.initialize();
            console.log('✅ Novo AuthSystem criado');
        } else {
            throw new Error('AuthSystem não disponível');
        }
    }

    showSplashScreen() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.display = 'flex';
            this.splashShown = true;
            console.log('📱 Splash screen exibido');
        }
    }

    hideSplashScreen() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 300);
            console.log('✅ Splash screen oculto');
        }
    }

    checkAuth() {
        console.log('🔍 Verificando autenticação...');
        
        const userData = sessionStorage.getItem('currentUser');
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                console.log('✅ Usuário autenticado encontrado:', user.nome);
                
                // Redirecionar para dashboard
                window.location.href = 'dashboard.html';
                return;
            } catch (error) {
                console.error('❌ Erro ao recuperar usuário:', error);
                sessionStorage.removeItem('currentUser');
            }
        }
        
        // Não está autenticado, mostrar tela de login
        console.log('ℹ️ Usuário não autenticado, mostrando login');
        this.showLogin();
    }

    showLogin() {
        const loginContainer = document.getElementById('login-container');
        const mainContainer = document.getElementById('main-container');
        
        if (loginContainer) {
            loginContainer.style.display = 'flex';
        }
        
        if (mainContainer) {
            mainContainer.style.display = 'none';
        }
        
        // Configurar evento de login
        this.setupLoginForm();
        
        console.log('🔑 Tela de login exibida');
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        
        if (!loginForm) {
            console.error('❌ Formulário de login não encontrado');
            return;
        }

        // Remover event listeners anteriores
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);

        // Adicionar novo event listener
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e);
        });

        console.log('✅ Formulário de login configurado');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const submitButton = e.target.querySelector('button[type="submit"]');

        console.log('🔑 Tentando fazer login:', username);

        // Validação básica
        if (!username || !password) {
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        // Desabilitar botão durante login
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Entrando...';
        }

        try {
            // Verificar se auth está disponível
            if (!this.auth) {
                throw new Error('Sistema de autenticação não inicializado');
            }

            // Fazer login
            const result = await this.auth.login(username, password);

            if (result.success) {
                console.log('✅ Login bem-sucedido!');
                this.showSuccess('Login realizado com sucesso!');
                
                // Aguardar 500ms e redirecionar
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                console.error('❌ Login falhou:', result.message);
                this.showError(result.message || 'Usuário ou senha incorretos');
                
                // Reabilitar botão
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Entrar';
                }
            }

        } catch (error) {
            console.error('❌ Erro no login:', error);
            this.showError('Erro ao fazer login. Tente novamente.');
            
            // Reabilitar botão
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Entrar';
            }
        }
    }

    showError(message) {
        // Remover mensagens antigas
        this.clearMessages();
        
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-message error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
        
        // Remover após 5 segundos
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        this.clearMessages();
        
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        const successDiv = document.createElement('div');
        successDiv.className = 'login-message success';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        loginForm.insertBefore(successDiv, loginForm.firstChild);
    }

    clearMessages() {
        const messages = document.querySelectorAll('.login-message');
        messages.forEach(msg => msg.remove());
    }
}

// ============================================
// ESTILOS PARA MENSAGENS DE LOGIN
// ============================================

const style = document.createElement('style');
style.textContent = `
    .login-message {
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        animation: slideDown 0.3s ease-out;
    }

    .login-message.error {
        background-color: #fee;
        color: #c33;
        border: 1px solid #fcc;
    }

    .login-message.success {
        background-color: #efe;
        color: #3c3;
        border: 1px solid #cfc;
    }

    .login-message i {
        font-size: 18px;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Estilos da tela de login */
    .login-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    .login-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        padding: 40px;
        width: 90%;
        max-width: 400px;
    }

    .login-logo {
        text-align: center;
        margin-bottom: 20px;
    }

    .login-logo img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .login-form h1 {
        text-align: center;
        color: #333;
        margin: 10px 0 5px 0;
        font-size: 24px;
    }

    .login-form p {
        text-align: center;
        color: #666;
        margin-bottom: 30px;
        font-size: 14px;
    }

    .login-form input {
        width: 100%;
        padding: 14px;
        margin-bottom: 16px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 15px;
        transition: all 0.3s;
        box-sizing: border-box;
    }

    .login-form input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .login-form button {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
    }

    .login-form button:hover:not(:disabled) {
        transform: translateY(-2px);
    }

    .login-form button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .demo-info {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }

    .demo-info small {
        color: #999;
        font-size: 13px;
    }

    /* Splash Screen */
    .splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        transition: opacity 0.3s ease-out;
    }

    .splash-content {
        text-align: center;
        color: white;
    }

    .splash-logo {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin-bottom: 20px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        animation: pulse 2s infinite;
    }

    .splash-title {
        font-size: 32px;
        font-weight: 700;
        margin: 10px 0;
    }

    .splash-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin-bottom: 30px;
    }

    .splash-loader {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        margin: 0 auto;
        animation: spin 1s linear infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ============================================
// INICIALIZAR APLICAÇÃO
// ============================================

let loginApp = null;

async function initApp() {
    console.log('🚀 Iniciando aplicação...');
    
    try {
        loginApp = new LoginApp();
        await loginApp.init();
    } catch (error) {
        console.error('❌ Erro fatal ao iniciar:', error);
        
        // Tentar mostrar login mesmo com erro
        const splash = document.getElementById('splash-screen');
        const login = document.getElementById('login-container');
        
        if (splash) splash.style.display = 'none';
        if (login) login.style.display = 'flex';
        
        alert('Erro ao inicializar sistema. Recarregue a página.');
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('✅ login-app.js carregado');