// Configuração do Firebase para Bingo Arraiá INEC (versão compat)
const firebaseConfig = {
  apiKey: "AIzaSyCWcZMF4Yty2aX7vAHUs_LI5R6N0S8NRy4",
  authDomain: "bingoinec.firebaseapp.com",
  projectId: "bingoinec",
  storageBucket: "bingoinec.firebasestorage.app",
  messagingSenderId: "483007152008",
  appId: "1:483007152008:web:6347c02216e162c0a3c43d"
};

// Inicializar Firebase assim que o script carregar
try {
  // Inicializar Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();

  // Tornar disponível globalmente
  window.db = db;
  window.auth = auth;
  window.firebase = firebase;

  // Configuração para desenvolvimento local
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('🔧 Modo desenvolvimento - usando configurações locais');
  }

  console.log('🔥 Firebase inicializado com sucesso!');
  
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
}
