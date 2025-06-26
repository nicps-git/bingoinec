// CONFIGURAÇÃO SIMPLIFICADA DO FIREBASE PARA ADMIN
console.log('🔥 Carregando configuração simplificada do Firebase...');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC7CnYV9gkczJ8zIcmTLrvQlrFFKNVhJNw",
  authDomain: "bingoinec.firebaseapp.com",
  projectId: "bingoinec",
  storageBucket: "bingoinec.firebasestorage.app",
  messagingSenderId: "483007152008",
  appId: "1:483007152008:web:6347c02216e162c0a3c43d"
};

// Função simples de inicialização
function initFirebaseSimple() {
  try {
    // Verificar se Firebase está disponível
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK não carregado');
      return false;
    }
    
    // Inicializar apenas se não existir
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('✅ Firebase inicializado');
    } else {
      console.log('✅ Firebase já estava inicializado');
    }
    
    // Configurar variáveis globais
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    return false;
  }
}

// Inicializar imediatamente se possível
if (typeof firebase !== 'undefined') {
  initFirebaseSimple();
} else {
  console.log('⏳ Aguardando Firebase SDK carregar...');
}

// Disponibilizar função globalmente
window.initFirebaseSimple = initFirebaseSimple;

console.log('✅ Firebase config simplificado carregado');
