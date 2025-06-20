/**
 * CONFIGURAÇÃO UNIFICADA DO FIREBASE - BINGO ARRAIÁ INEC
 * =====================================================
 * 
 * Este arquivo substitui todos os outros firebase-config*.js
 * Funciona com Firebase v8 (compat) e detecta automaticamente o ambiente
 * 
 * Arquivos substituídos:
 * - firebase-config.js
 * - firebase-config-fixed.js
 * - firebase-config-simple.js
 * - firebase-config-v8.js
 */

// Configuração do projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7CnYV9gkczJ8zIcmTLrvQlrFFKNVhJNw",
  authDomain: "bingoinec.firebaseapp.com",
  projectId: "bingoinec",
  storageBucket: "bingoinec.firebasestorage.app",
  messagingSenderId: "483007152008",
  appId: "1:483007152008:web:6347c02216e162c0a3c43d"
};

// Estado de inicialização
let firebaseInitialized = false;
let initializationPromise = null;

/**
 * Inicializar Firebase de forma unificada
 */
function initializeFirebaseUnified() {
  // Se já foi inicializado, retornar Promise resolvida
  if (firebaseInitialized) {
    return Promise.resolve(true);
  }
  
  // Se já está em processo de inicialização, retornar a Promise existente
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // Criar nova Promise de inicialização
  initializationPromise = new Promise((resolve, reject) => {
    try {
      // Verificar se Firebase SDK está carregado
      if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK não carregado. Certifique-se de incluir os scripts do Firebase v8 antes deste arquivo.');
      }
      
      console.log('🔥 Inicializando Firebase Unificado...');
      
      // Verificar se já existe uma instância do Firebase
      let app;
      if (firebase.apps && firebase.apps.length > 0) {
        app = firebase.apps[0];
        console.log('♻️ Reutilizando instância existente do Firebase');
      } else {
        app = firebase.initializeApp(firebaseConfig);
        console.log('🆕 Nova instância do Firebase criada');
      }
      
      // Inicializar serviços do Firebase
      const db = firebase.firestore();
      const auth = firebase.auth();
      
      // Tornar disponível globalmente para compatibilidade
      window.firebase = firebase;
      window.db = db;
      window.auth = auth;
      window.firebaseApp = app;
      window.firebaseConfig = firebaseConfig;
      
      // Configurações de desenvolvimento
      const isDevelopment = 
        location.hostname === 'localhost' || 
        location.hostname === '127.0.0.1' || 
        location.protocol === 'file:';
      
      if (isDevelopment) {
        console.log('🔧 Modo desenvolvimento detectado');
        
        // Configurar emuladores se necessário (descomentado por padrão)
        // try {
        //   if (!db._delegate._databaseId.projectId.includes('demo-')) {
        //     console.log('🔗 Conectando aos emuladores locais...');
        //     db.useEmulator('localhost', 8080);
        //     auth.useEmulator('http://localhost:9099');
        //   }
        // } catch (emulatorError) {
        //   console.warn('⚠️ Emuladores não disponíveis:', emulatorError.message);
        // }
      }
      
      // Marcar como inicializado
      firebaseInitialized = true;
      
      // Disparar evento global para indicar que Firebase está pronto
      const readyEvent = new CustomEvent('firebaseReady', {
        detail: {
          app: app,
          db: db,
          auth: auth,
          config: firebaseConfig,
          isDevelopment: isDevelopment
        }
      });
      window.dispatchEvent(readyEvent);
      
      console.log('✅ Firebase inicializado com sucesso!');
      console.log(`📋 Projeto: ${firebaseConfig.projectId}`);
      console.log(`🌐 Ambiente: ${isDevelopment ? 'Desenvolvimento' : 'Produção'}`);
      
      resolve(true);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase:', error);
      
      // Tentar novamente após um delay (uma única vez)
      setTimeout(() => {
        try {
          console.log('🔄 Tentativa de reinicialização do Firebase...');
          
          let app;
          if (firebase.apps && firebase.apps.length === 0) {
            app = firebase.initializeApp(firebaseConfig);
          } else {
            app = firebase.apps[0];
          }
          
          const db = firebase.firestore();
          const auth = firebase.auth();
          
          window.firebase = firebase;
          window.db = db;
          window.auth = auth;
          window.firebaseApp = app;
          window.firebaseConfig = firebaseConfig;
          
          firebaseInitialized = true;
          
          window.dispatchEvent(new CustomEvent('firebaseReady', {
            detail: { app, db, auth, config: firebaseConfig }
          }));
          
          console.log('✅ Firebase reinicializado com sucesso!');
          resolve(true);
          
        } catch (retryError) {
          console.error('❌ Falha na reinicialização:', retryError);
          reject(retryError);
        }
      }, 1000);
    }
  });
  
  return initializationPromise;
}

/**
 * Aguardar Firebase estar pronto
 * @param {number} timeout - Timeout em milissegundos
 * @returns {Promise} Promise que resolve quando Firebase estiver pronto
 */
function waitForFirebaseReady(timeout = 10000) {
  return new Promise((resolve, reject) => {
    // Se já está pronto, resolver imediatamente
    if (firebaseInitialized && window.db && window.auth) {
      resolve({
        app: window.firebaseApp,
        db: window.db,
        auth: window.auth,
        config: window.firebaseConfig
      });
      return;
    }
    
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout de ${timeout}ms aguardando Firebase estar pronto`));
    }, timeout);
    
    // Escutar evento de Firebase pronto
    function onFirebaseReady(event) {
      clearTimeout(timeoutId);
      window.removeEventListener('firebaseReady', onFirebaseReady);
      resolve(event.detail);
    }
    
    window.addEventListener('firebaseReady', onFirebaseReady);
    
    // Tentar inicializar se ainda não foi
    if (!initializationPromise) {
      initializeFirebaseUnified().catch(error => {
        clearTimeout(timeoutId);
        window.removeEventListener('firebaseReady', onFirebaseReady);
        reject(error);
      });
    }
  });
}

/**
 * Verificar se Firebase está pronto
 * @returns {boolean} True se Firebase estiver pronto para uso
 */
function isFirebaseReady() {
  return firebaseInitialized && 
         typeof window.firebase !== 'undefined' && 
         typeof window.db !== 'undefined' && 
         typeof window.auth !== 'undefined';
}

// Tornar funções disponíveis globalmente
window.initializeFirebaseUnified = initializeFirebaseUnified;
window.waitForFirebaseReady = waitForFirebaseReady;
window.isFirebaseReady = isFirebaseReady;

// Manter compatibilidade com função anterior
window.waitForFirebase = waitForFirebaseReady;

// Auto-inicialização quando o script carregar
if (typeof firebase !== 'undefined') {
  // Aguardar um tick para garantir que o DOM está pronto
  setTimeout(() => {
    initializeFirebaseUnified().catch(error => {
      console.error('❌ Falha na auto-inicialização do Firebase:', error);
    });
  }, 100);
} else {
  console.warn('⚠️ Firebase SDK não detectado. Certifique-se de incluir os scripts do Firebase v8 antes deste arquivo.');
}

// Log de carregamento
console.log('📦 Firebase Config Unificado carregado');

// Exportar configuração para módulos ES6 (se suportado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, initializeFirebaseUnified, waitForFirebaseReady, isFirebaseReady };
}

if (typeof window !== 'undefined') {
  window.firebaseConfigUnified = {
    config: firebaseConfig,
    initialize: initializeFirebaseUnified,
    waitForReady: waitForFirebaseReady,
    isReady: isFirebaseReady
  };
}
