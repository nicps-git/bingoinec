// ===== SISTEMA DE AUTENTICAÇÃO ADMIN - BINGO INEC =====

// Credenciais do administrador (mesmo do sistema original)
const ADMIN_CREDENTIALS = {
    email: 'admin@bingoinec.org.br',
    password: 'wooFestadeComida'
};

// Chave para armazenar sessão no localStorage
const SESSION_KEY = 'bingoAdminSession';
const SESSION_EXPIRY_HOURS = 8; // Sessão expira em 8 horas

// Verificar se o usuário está autenticado
function isUserAuthenticated() {
    const sessionData = getSessionData();
    
    if (!sessionData) {
        return false;
    }
    
    // Verificar se a sessão não expirou
    const now = new Date();
    const expiry = new Date(sessionData.expiryTime);
    
    if (now >= expiry) {
        // Sessão expirada, remover
        localStorage.removeItem(SESSION_KEY);
        return false;
    }
    
    return true;
}

// Obter dados da sessão
function getSessionData() {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Erro ao ler dados da sessão:', error);
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}

// Criar sessão após login bem-sucedido
function createSession(email) {
    const now = new Date();
    const expiryTime = new Date(now.getTime() + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000));
    
    const sessionData = {
        email: email,
        loginTime: now.toISOString(),
        expiryTime: expiryTime.toISOString(),
        isAdmin: true
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    console.log('✅ Sessão criada para:', email);
}

// Fazer logout
function logout() {
    if (confirm('🚪 Deseja realmente sair da área administrativa?')) {
        localStorage.removeItem(SESSION_KEY);
        console.log('🚪 Logout realizado');
        window.location.href = 'index.html';
    }
}

// Verificar credenciais
function validateCredentials(email, password) {
    return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
}

// Solicitar login se não estiver autenticado (para uso apenas em scripts de admin)
function requireAuthentication() {
    if (isUserAuthenticated()) {
        console.log('✅ Usuário já autenticado');
        return true;
    }
    
    console.log('🔐 Autenticação necessária, redirecionando para login...');
    
    // Se estamos em uma página admin, redirecionar para login
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'login.html';
        return false;
    }
    
    return false;
}

// Obter informações do usuário logado
function getUserInfo() {
    const sessionData = getSessionData();
    if (sessionData && isUserAuthenticated()) {
        return {
            email: sessionData.email,
            loginTime: sessionData.loginTime,
            isAdmin: sessionData.isAdmin
        };
    }
    return null;
}

// Formatar tempo de sessão
function getSessionTimeString() {
    const userInfo = getUserInfo();
    if (userInfo) {
        const loginTime = new Date(userInfo.loginTime);
        return `Logado desde ${loginTime.toLocaleTimeString()}`;
    }
    return 'Não logado';
}

// Função mostrarToast para feedback visual (compartilhada)
if (typeof mostrarToast === 'undefined') {
    function mostrarToast(mensagem, tipo = 'info', duracao = 3000) {
        // Remover toast anterior se existir
        const toastAnterior = document.getElementById('toast-notification');
        if (toastAnterior) {
            toastAnterior.remove();
        }
        
        // Criar novo toast
        const toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: bold;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: 'Comic Sans MS', cursive, sans-serif;
        `;
        
        toast.textContent = mensagem;
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após duracao
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duracao);
    }
    
    // Tornar disponível globalmente
    window.mostrarToast = mostrarToast;
}

console.log('🔐 Sistema de autenticação admin carregado');
