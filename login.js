// ===== LOGIN AUTHENTICATION SYSTEM =====

// Credenciais do administrador
const ADMIN_CREDENTIALS = {
    email: 'admin@bingoinec.org.br',
    password: 'wooFestadeComida'
};

// Chave para armazenar sessão no localStorage
const SESSION_KEY = 'bingoAdminSession';
const SESSION_EXPIRY_HOURS = 8; // Sessão expira em 8 horas

// Elementos do DOM
let emailInput, senhaInput, loginForm, alertErro, alertSucesso;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

function initializeLoginPage() {
    // Buscar elementos do DOM
    emailInput = document.getElementById('email');
    senhaInput = document.getElementById('senha');
    loginForm = document.getElementById('login-form');
    alertErro = document.getElementById('alert-erro');
    alertSucesso = document.getElementById('alert-sucesso');

    // Verificar se já está logado
    if (isUserAuthenticated()) {
        showSuccessAlert('Você já está logado! Redirecionando...');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        return;
    }

    // Adicionar event listeners
    setupEventListeners();
    
    // Focar no campo de email
    emailInput.focus();
    
    console.log('Login page initialized');
}

function setupEventListeners() {
    // Submit do formulário
    loginForm.addEventListener('submit', handleLogin);
    
    // Enter nos campos de input
    emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            senhaInput.focus();
        }
    });
    
    senhaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
    
    // Limpar alerts quando começar a digitar
    emailInput.addEventListener('input', clearAlerts);
    senhaInput.addEventListener('input', clearAlerts);
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    
    // Validações básicas
    if (!email || !senha) {
        showErrorAlert('Por favor, preencha todos os campos.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showErrorAlert('Por favor, digite um e-mail válido.');
        emailInput.focus();
        return;
    }
    
    // Verificar credenciais
    if (authenticateUser(email, senha)) {
        handleSuccessfulLogin();
    } else {
        handleFailedLogin();
    }
}

function authenticateUser(email, password) {
    return email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && 
           password === ADMIN_CREDENTIALS.password;
}

function handleSuccessfulLogin() {
    // Criar sessão
    const sessionData = {
        email: ADMIN_CREDENTIALS.email,
        loginTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000)).toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    // Log de acesso (para futuras funcionalidades)
    logAccess('successful_login', ADMIN_CREDENTIALS.email);
    
    // Mostrar sucesso
    showSuccessAlert('Login realizado com sucesso! Redirecionando...');
    
    // Redirecionar para admin
    setTimeout(() => {
        window.location.href = 'admin.html';
    }, 2000);
}

function handleFailedLogin() {
    // Log de tentativa falhada
    logAccess('failed_login', emailInput.value);
    
    // Mostrar erro
    showErrorAlert('Credenciais inválidas! Verifique e-mail e senha.');
    
    // Limpar campos
    senhaInput.value = '';
    emailInput.focus();
    
    // Adicionar delay de segurança (previne ataques de força bruta)
    loginForm.style.pointerEvents = 'none';
    setTimeout(() => {
        loginForm.style.pointerEvents = 'auto';
    }, 2000);
}

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

function logAccess(type, email) {
    // Sistema de log simples para armazenar tentativas de acesso
    const logs = getAccessLogs();
    const logEntry = {
        type: type,
        email: email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'client-side' // Em produção, seria capturado pelo servidor
    };
    
    logs.push(logEntry);
    
    // Manter apenas os últimos 100 logs
    if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('bingoAccessLogs', JSON.stringify(logs));
}

function getAccessLogs() {
    try {
        const logs = localStorage.getItem('bingoAccessLogs');
        return logs ? JSON.parse(logs) : [];
    } catch (error) {
        console.error('Erro ao ler logs de acesso:', error);
        return [];
    }
}

// Utilitários para validação
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Funções para mostrar/esconder senha
function togglePassword() {
    const senhaInput = document.getElementById('senha');
    const toggleButton = document.querySelector('.toggle-password');
    
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        toggleButton.textContent = '🙈';
    } else {
        senhaInput.type = 'password';
        toggleButton.textContent = '👁️';
    }
}

// Funções para alerts
function showErrorAlert(message) {
    clearAlerts();
    
    const alertMessage = alertErro.querySelector('.alert-message');
    alertMessage.textContent = message;
    
    alertErro.style.display = 'flex';
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        fecharAlert();
    }, 5000);
}

function showSuccessAlert(message) {
    clearAlerts();
    
    const alertMessage = alertSucesso.querySelector('.alert-message');
    alertMessage.textContent = message;
    
    alertSucesso.style.display = 'flex';
}

function clearAlerts() {
    alertErro.style.display = 'none';
    alertSucesso.style.display = 'none';
}

function fecharAlert() {
    clearAlerts();
}

// Função para logout (será usada em outras páginas)
function logout() {
    localStorage.removeItem(SESSION_KEY);
    logAccess('logout', getSessionData()?.email || 'unknown');
    window.location.href = 'login.html';
}

// Função para verificar autenticação (será usada em outras páginas)
function requireAuthentication() {
    if (!isUserAuthenticated()) {
        alert('Acesso não autorizado! Você será redirecionado para a página de login.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Função para obter dados do usuário logado
function getCurrentUser() {
    const sessionData = getSessionData();
    return sessionData ? {
        email: sessionData.email,
        loginTime: sessionData.loginTime,
        expiryTime: sessionData.expiryTime
    } : null;
}

// Função para estender sessão (renovar expiração)
function extendSession() {
    const sessionData = getSessionData();
    if (sessionData) {
        sessionData.expiryTime = new Date(Date.now() + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000)).toISOString();
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        return true;
    }
    return false;
}

// Exportar funções para uso em outras páginas
window.bingoAuth = {
    isAuthenticated: isUserAuthenticated,
    requireAuth: requireAuthentication,
    logout: logout,
    getCurrentUser: getCurrentUser,
    extendSession: extendSession,
    getAccessLogs: getAccessLogs
};

// Auto-refresh da sessão quando há atividade
let activityTimer;
document.addEventListener('mousedown', resetActivityTimer);
document.addEventListener('keydown', resetActivityTimer);

function resetActivityTimer() {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        extendSession();
    }, 5 * 60 * 1000); // Estender sessão a cada 5 minutos de atividade
}

console.log('Login authentication system loaded');
