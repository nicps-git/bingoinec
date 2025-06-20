// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7CnYV9gkczJ8zIcmTLrvQlrFFKNVhJNw",
  authDomain: "bingoinec.firebaseapp.com",
  projectId: "bingoinec",
  storageBucket: "bingoinec.firebasestorage.app",
  messagingSenderId: "483007152008",
  appId: "1:483007152008:web:6347c02216e162c0a3c43d"
};

// Initialize Firebase (para uso com SDK v8)
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    
    // Inicializar serviços e tornar globais
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    
    console.log('✅ Firebase inicializado com Firestore e Auth');
    
    // Disparar evento para indicar que Firebase está pronto
    window.dispatchEvent(new Event('firebaseReady'));
  }
} else {
  console.error('❌ Firebase SDK não carregado');
}

// Export da configuração para outros arquivos
window.firebaseConfig = firebaseConfig;

console.log('Firebase configuration loaded');
