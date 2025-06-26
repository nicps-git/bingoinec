// ===== SISTEMA DE AUTENTICAÇÃO CENTRALIZADO =====

// Configurações de autenticação
const AUTH_CONFIG = {
    // Tempo de expiração da sessão (em milissegundos) - 24 horas
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
    
    // Chave para localStorage
    SESSION_KEY: 'bingo_auth_session',
    
    // Páginas que requerem autenticação
    PROTECTED_PAGES: ['admin.html', 'bingo-original.html', 'cartelas.html'],
    
    // Credenciais válidas (baseadas no sistema anterior)
    VALID_CREDENTIALS: {
        'admin': 'inecAdmin2024'
    }
};

// Classe para gerenciar autenticação
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionData = null;
        this.init();
    }

    // Inicializar sistema de autenticação
    init() {
        console.log('🔐 Inicializando sistema de autenticação...');
        
        // Verificar se há sessão ativa
        this.checkExistingSession();
        
        // Verificar se a página atual requer autenticação
        this.checkPageAccess();
    }

    // Verificar sessão existente
    checkExistingSession() {
        try {
            const sessionJson = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
            if (sessionJson) {
                const session = JSON.parse(sessionJson);
                const now = Date.now();
                
                // Verificar se sessão não expirou
                if (session.expiresAt > now) {
                    this.sessionData = session;
                    this.currentUser = session.username;
                    console.log('✅ Sessão ativa encontrada para:', this.currentUser);
                    return true;
                } else {
                    console.log('⏰ Sessão expirada, removendo...');
                    this.logout();
                }
            }
        } catch (error) {
            console.error('❌ Erro ao verificar sessão:', error);
            this.logout();
        }
        return false;
    }

    // Verificar se a página atual requer autenticação
    checkPageAccess() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        console.log('📄 Página atual:', currentPage);
        
        if (AUTH_CONFIG.PROTECTED_PAGES.includes(currentPage)) {
            console.log('🔒 Página protegida detectada');
            
            if (!this.isAuthenticated()) {
                console.log('❌ Usuário não autenticado, mostrando login');
                this.showLoginModal();
                return false;
            } else {
                console.log('✅ Usuário autenticado, permitindo acesso');
                this.showAuthenticatedUser();
                return true;
            }
        } else {
            console.log('🌐 Página pública, acesso liberado');
            return true;
        }
    }

    // Verificar se usuário está autenticado
    isAuthenticated() {
        return this.sessionData !== null && this.currentUser !== null;
    }

    // Realizar login
    async login(username, password) {
        console.log('🔑 Tentativa de login para:', username);
        
        // Verificar credenciais
        if (AUTH_CONFIG.VALID_CREDENTIALS[username] === password) {
            const now = Date.now();
            const expiresAt = now + AUTH_CONFIG.SESSION_TIMEOUT;
            
            this.sessionData = {
                username: username,
                loginTime: now,
                expiresAt: expiresAt
            };
            
            this.currentUser = username;
            
            // Salvar sessão
            localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(this.sessionData));
            
            console.log('✅ Login realizado com sucesso');
            this.hideLoginModal();
            this.showAuthenticatedUser();
            
            return { success: true, user: username };
        } else {
            console.log('❌ Credenciais inválidas');
            return { success: false, error: 'Usuário ou senha incorretos' };
        }
    }

    // Realizar logout
    logout() {
        console.log('🚪 Realizando logout...');
        
        this.currentUser = null;
        this.sessionData = null;
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        
        // Redirecionar para página principal
        window.location.href = 'index.html';
    }

    // Mostrar modal de login
    showLoginModal() {
        // Remover modal existente se houver
        const existingModal = document.getElementById('auth-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Criar modal de login
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-overlay">
                <div class="auth-modal-content">
                    <div class="auth-header">
                        <h2>🔐 Acesso Restrito</h2>
                        <p>Esta página requer autenticação</p>
                    </div>
                    
                    <form id="auth-form" class="auth-form">
                        <div class="auth-field">
                            <label for="auth-username">👤 Usuário:</label>
                            <input type="text" id="auth-username" name="username" required 
                                   placeholder="Digite seu usuário" autocomplete="username">
                        </div>
                        
                        <div class="auth-field">
                            <label for="auth-password">🔑 Senha:</label>
                            <input type="password" id="auth-password" name="password" required 
                                   placeholder="Digite sua senha" autocomplete="current-password">
                        </div>
                        
                        <div class="auth-buttons">
                            <button type="submit" class="auth-btn auth-btn-primary">
                                🔓 Entrar
                            </button>
                            <button type="button" class="auth-btn auth-btn-secondary" onclick="authManager.redirectToHome()">
                                🏠 Voltar ao Início
                            </button>
                        </div>
                        
                        <div id="auth-error" class="auth-error" style="display: none;"></div>
                    </form>
                    
                    <div class="auth-info">
                        <p><small>💡 Entre em contato com a organização se não tiver acesso</small></p>
                    </div>
                </div>
            </div>
        `;

        // Adicionar estilos
        const styles = `
            <style>
                .auth-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                }
                
                .auth-modal-content {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .auth-header {
                    text-align: center;
                    margin-bottom: 25px;
                }
                
                .auth-header h2 {
                    color: #333;
                    margin: 0 0 10px 0;
                    font-size: 24px;
                }
                
                .auth-header p {
                    color: #666;
                    margin: 0;
                    font-size: 14px;
                }
                
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .auth-field {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .auth-field label {
                    font-weight: bold;
                    color: #333;
                    font-size: 14px;
                }
                
                .auth-field input {
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s;
                }
                
                .auth-field input:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                }
                
                .auth-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .auth-btn {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .auth-btn-primary {
                    background: #007bff;
                    color: white;
                }
                
                .auth-btn-primary:hover {
                    background: #0056b3;
                    transform: translateY(-2px);
                }
                
                .auth-btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .auth-btn-secondary:hover {
                    background: #545b62;
                    transform: translateY(-2px);
                }
                
                .auth-error {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 10px;
                    border-radius: 5px;
                    border: 1px solid #f5c6cb;
                    font-size: 14px;
                    text-align: center;
                }
                
                .auth-info {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
                
                .auth-info p {
                    margin: 0;
                    color: #666;
                }
                
                @media (max-width: 480px) {
                    .auth-modal-content {
                        padding: 20px;
                        margin: 10px;
                    }
                    
                    .auth-header h2 {
                        font-size: 20px;
                    }
                    
                    .auth-field input {
                        font-size: 16px; /* Evita zoom no iOS */
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(modal);

        // Configurar eventos
        const form = document.getElementById('auth-form');
        form.addEventListener('submit', (e) => this.handleLoginSubmit(e));

        // Focar no campo de usuário
        document.getElementById('auth-username').focus();

        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
    }

    // Esconder modal de login
    hideLoginModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.remove();
        }
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
    }

    // Processar submit do login
    async handleLoginSubmit(event) {
        event.preventDefault();
        
        const username = document.getElementById('auth-username').value.trim();
        const password = document.getElementById('auth-password').value;
        const errorDiv = document.getElementById('auth-error');
        
        // Limpar erro anterior
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        if (!username || !password) {
            this.showLoginError('Por favor, preencha todos os campos');
            return;
        }
        
        // Tentar login
        const result = await this.login(username, password);
        
        if (!result.success) {
            this.showLoginError(result.error);
        }
    }

    // Mostrar erro de login
    showLoginError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    // Redirecionar para home
    redirectToHome() {
        window.location.href = 'index.html';
    }

    // Mostrar informações do usuário autenticado
    showAuthenticatedUser() {
        if (!this.isAuthenticated()) return;
        
        // Remover indicador existente
        const existingIndicator = document.getElementById('auth-user-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Criar indicador de usuário autenticado
        const indicator = document.createElement('div');
        indicator.id = 'auth-user-indicator';
        indicator.innerHTML = `
            <div class="auth-user-info">
                <span class="auth-user-name">👤 ${this.currentUser}</span>
                <button class="auth-logout-btn" onclick="authManager.logout()">🚪 Sair</button>
            </div>
        `;
        
        // Adicionar estilos para o indicador
        const indicatorStyles = `
            <style>
                .auth-user-info {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 1000;
                    font-size: 14px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }
                
                .auth-user-name {
                    font-weight: bold;
                }
                
                .auth-logout-btn {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background-color 0.3s;
                }
                
                .auth-logout-btn:hover {
                    background: #c82333;
                }
                
                @media (max-width: 768px) {
                    .auth-user-info {
                        top: 5px;
                        right: 5px;
                        padding: 6px 10px;
                        font-size: 12px;
                    }
                    
                    .auth-logout-btn {
                        padding: 3px 6px;
                        font-size: 11px;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', indicatorStyles);
        document.body.appendChild(indicator);
    }

    // Método público para verificar autenticação
    requireAuth() {
        return this.checkPageAccess();
    }
}

// Criar instância global do gerenciador de autenticação
let authManager;

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando sistema de autenticação...');
    authManager = new AuthManager();
    
    // Tornar disponível globalmente
    window.authManager = authManager;
});

// Função global para verificar autenticação (compatibilidade)
function requireAuthentication() {
    if (window.authManager) {
        return window.authManager.requireAuth();
    } else {
        console.warn('⚠️ Sistema de autenticação não inicializado');
        return false;
    }
}

// Tornar função disponível globalmente
window.requireAuthentication = requireAuthentication;

console.log('✅ Sistema de autenticação carregado');
