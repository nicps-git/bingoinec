// ===== SISTEMA DE AUTENTICAÇÃO UNIFICADO - BINGO INEC =====
// Sistema único de autenticação para evitar conflitos entre arquivos

// Credenciais do administrador
const ADMIN_CREDENTIALS = {
    email: 'admin@bingoinec.org.br',
    password: 'wooFestadeComida'
};

// Configurações da sessão
const SESSION_CONFIG = {
    key: 'bingoAdminSession',
    expiryHours: 8
};

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

// Verificar se o usuário está autenticado
function isUserAuthenticated() {
    try {
        const sessionData = getSessionData();
        
        if (!sessionData) {
            console.log('🔐 Nenhuma sessão encontrada');
            return false;
        }
        
        // Verificar se a sessão não expirou
        const now = new Date();
        const expiry = new Date(sessionData.expiryTime);
        
        if (now >= expiry) {
            console.log('🔐 Sessão expirada, removendo...');
            localStorage.removeItem(SESSION_CONFIG.key);
            return false;
        }
        
        console.log('✅ Usuário autenticado');
        return true;
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        return false;
    }
}

// Obter dados da sessão
function getSessionData() {
    try {
        const data = localStorage.getItem(SESSION_CONFIG.key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('❌ Erro ao ler dados da sessão:', error);
        localStorage.removeItem(SESSION_CONFIG.key);
        return null;
    }
}

// Criar sessão após login bem-sucedido
function createSession(email) {
    try {
        const now = new Date();
        const expiryTime = new Date(now.getTime() + (SESSION_CONFIG.expiryHours * 60 * 60 * 1000));
        
        const sessionData = {
            email: email,
            loginTime: now.toISOString(),
            expiryTime: expiryTime.toISOString(),
            userAgent: navigator.userAgent,
            ipAddress: 'localhost' // Em produção, capturar IP real
        };
        
        localStorage.setItem(SESSION_CONFIG.key, JSON.stringify(sessionData));
        console.log('✅ Sessão criada com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao criar sessão:', error);
        return false;
    }
}

// Destruir sessão (logout)
function destroySession() {
    try {
        localStorage.removeItem(SESSION_CONFIG.key);
        console.log('✅ Sessão destruída');
        return true;
    } catch (error) {
        console.error('❌ Erro ao destruir sessão:', error);
        return false;
    }
}

// Validar credenciais
function validateCredentials(email, password) {
    return email.toLowerCase().trim() === ADMIN_CREDENTIALS.email.toLowerCase() && 
           password === ADMIN_CREDENTIALS.password;
}

// Fazer login
function performLogin(email, password) {
    if (!email || !password) {
        return { success: false, message: 'Email e senha são obrigatórios' };
    }
    
    if (!validateCredentials(email, password)) {
        return { success: false, message: 'Credenciais inválidas' };
    }
    
    if (createSession(email)) {
        return { success: true, message: 'Login realizado com sucesso' };
    } else {
        return { success: false, message: 'Erro ao criar sessão' };
    }
}

// Fazer logout
function performLogout() {
    if (destroySession()) {
        return { success: true, message: 'Logout realizado com sucesso' };
    } else {
        return { success: false, message: 'Erro ao fazer logout' };
    }
}

// Verificar se precisa redirecionar para login
function requireAuthentication() {
    if (!isUserAuthenticated()) {
        console.log('🔐 Redirecionando para login...');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ===== SISTEMA DE NOTIFICAÇÕES =====

// Função mostrarToast unificada
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
        max-width: 350px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-family: Arial, sans-serif;
        word-wrap: break-word;
    `;
    
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após duração
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, duracao);
    
    // Log da notificação
    console.log(`🍞 [TOAST] ${tipo.toUpperCase()}: ${mensagem}`);
}

// ===== DISPONIBILIZAR GLOBALMENTE =====

// Tornar todas as funções disponíveis globalmente
window.isUserAuthenticated = isUserAuthenticated;
window.getSessionData = getSessionData;
window.createSession = createSession;
window.destroySession = destroySession;
window.validateCredentials = validateCredentials;
window.performLogin = performLogin;
window.performLogout = performLogout;
window.requireAuthentication = requireAuthentication;
window.mostrarToast = mostrarToast;

// Constantes globais
window.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
window.SESSION_CONFIG = SESSION_CONFIG;

console.log('🔐 Sistema de autenticação unificado carregado');
console.log('✅ Funções disponíveis globalmente:', [
    'isUserAuthenticated',
    'getSessionData', 
    'createSession',
    'destroySession',
    'validateCredentials',
    'performLogin',
    'performLogout',
    'requireAuthentication',
    'mostrarToast'
]);
