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

// Solicitar login se não estiver autenticado
function requireAuthentication() {
    if (isUserAuthenticated()) {
        console.log('✅ Usuário já autenticado');
        return true;
    }
    
    console.log('🔐 Autenticação necessária');
    
    // Mostrar dialog de login
    const email = prompt('📧 Digite seu email de administrador:');
    if (!email) {
        console.log('❌ Login cancelado');
        return false;
    }
    
    const password = prompt('🔒 Digite sua senha:');
    if (!password) {
        console.log('❌ Login cancelado');
        return false;
    }
    
    if (validateCredentials(email, password)) {
        createSession(email);
        console.log('✅ Login bem-sucedido');
        return true;
    } else {
        alert('❌ Credenciais inválidas!');
        console.log('❌ Credenciais inválidas');
        return false;
    }
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

console.log('🔐 Sistema de autenticação admin carregado');
