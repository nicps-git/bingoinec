// Configuração do Firebase para Bingo Arraiá INEC (Firebase v8)
const firebaseConfig = {
  apiKey: "AIzaSyCWcZMF4Yty2aX7vAHUs_LI5R6N0S8NRy4",
  authDomain: "bingoinec.firebaseapp.com",
  projectId: "bingoinec",
  storageBucket: "bingoinec.firebasestorage.app",
  messagingSenderId: "483007152008",
  appId: "1:483007152008:web:6347c02216e162c0a3c43d"
};

// Verificar se Firebase está carregado
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase SDK não carregado!');
  throw new Error('Firebase SDK não encontrado');
}

try {
  // Inicializar Firebase v8
  console.log('🔥 Inicializando Firebase...');
  
  // Verificar se já foi inicializado
  let app;
  if (firebase.apps.length === 0) {
    app = firebase.initializeApp(firebaseConfig);
  } else {
    app = firebase.apps[0];
  }
  
  // Inicializar serviços
  const db = firebase.firestore();
  const auth = firebase.auth();
  
  // Tornar disponível globalmente
  window.firebase = firebase;
  window.db = db;
  window.auth = auth;
  window.firebaseApp = app;
  
  // Configuração para desenvolvimento local
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('🔧 Modo desenvolvimento - configurações locais ativadas');
  }
  
  console.log('✅ Firebase inicializado com sucesso!');
  console.log(`📋 Projeto: ${firebaseConfig.projectId}`);
  
  // Evento personalizado para indicar que Firebase está pronto
  window.dispatchEvent(new CustomEvent('firebaseReady', { 
    detail: { app, db, auth, config: firebaseConfig }
  }));
  
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  
  // Tentar novamente após um delay
  setTimeout(() => {
    try {
      console.log('🔄 Tentativa de reinicialização do Firebase...');
      
      // Usar app existente ou criar novo
      let app;
      if (firebase.apps.length === 0) {
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
      
      console.log('✅ Firebase reinicializado com sucesso!');
      window.dispatchEvent(new CustomEvent('firebaseReady', { 
        detail: { app, db, auth, config: firebaseConfig }
      }));
    } catch (retryError) {
      console.error('❌ Falha na reinicialização do Firebase:', retryError);
    }
  }, 1000);
}
