/**
 * CONFIGURAÇÃO PRINCIPAL DO FIREBASE - BINGO ARRAIÁ INEC
 * ======================================================
 * 
 * Arquivo único de configuração do Firebase
 * Compatível com Firebase v8 e v9 
 * Detecta automaticamente o ambiente
 * 
 * Este arquivo substitui TODOS os outros firebase-config*.js
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
      
      console.log('🔥 Inicializando Firebase...');
      
      // Verificar se já existe uma app inicializada
      let app;
      try {
        app = firebase.app(); // Pegar app existente
        console.log('✅ App Firebase existente encontrada');
      } catch (error) {
        // Se não existe, criar nova
        app = firebase.initializeApp(firebaseConfig);
        console.log('✅ Nova app Firebase criada');
      }
      
      // Inicializar Firestore
      const db = firebase.firestore();
      console.log('✅ Firestore inicializado');
      
      // Disponibilizar globalmente
      window.FirebaseDB = {
        app: app,
        db: db,
        auth: firebase.auth(),
        
        // Método para salvar cartela
        async saveCartela(cartelaData) {
          try {
            console.log('💾 Salvando cartela no Firebase...', cartelaData);
            const docRef = await db.collection('cartelas').add({
              ...cartelaData,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              status: 'ativa'
            });
            console.log('✅ Cartela salva com ID:', docRef.id);
            return { success: true, id: docRef.id };
          } catch (error) {
            console.error('❌ Erro ao salvar cartela:', error);
            throw error;
          }
        },
        
        // Método para buscar cartelas
        async getCartelas(telefone) {
          try {
            console.log('🔍 Buscando cartelas para:', telefone);
            const snapshot = await db.collection('cartelas')
              .where('telefone', '==', telefone)
              .orderBy('timestamp', 'desc')
              .get();
            
            const cartelas = [];
            snapshot.forEach(doc => {
              cartelas.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('✅ Cartelas encontradas:', cartelas.length);
            return cartelas;
          } catch (error) {
            console.error('❌ Erro ao buscar cartelas:', error);
            throw error;
          }
        },
        
        // Método para salvar compra
        async saveCompra(compraData) {
          try {
            console.log('💾 Salvando compra no Firebase...', compraData);
            const docRef = await db.collection('compras').add({
              ...compraData,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              status: 'pendente'
            });
            console.log('✅ Compra salva com ID:', docRef.id);
            return { success: true, id: docRef.id };
          } catch (error) {
            console.error('❌ Erro ao salvar compra:', error);
            throw error;
          }
        },
        
        // Método para obter estatísticas
        async getStats() {
          try {
            console.log('📊 Buscando estatísticas...');
            
            // Buscar cartelas vendidas
            const cartelasSnapshot = await db.collection('cartelas').get();
            const totalCartelas = cartelasSnapshot.size;
            
            // Buscar compras
            const comprasSnapshot = await db.collection('compras').get();
            const totalCompras = comprasSnapshot.size;
            
            let totalArrecadado = 0;
            comprasSnapshot.forEach(doc => {
              const data = doc.data();
              if (data.valor) {
                totalArrecadado += parseFloat(data.valor);
              }
            });
            
            const stats = {
              totalCartelas,
              totalCompras,
              totalArrecadado
            };
            
            console.log('✅ Estatísticas obtidas:', stats);
            return stats;
          } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            throw error;
          }
        },
        
        // Método para verificar se é admin
        async isAdmin(uid) {
          try {
            console.log('🔐 Verificando permissões de admin para:', uid);
            const doc = await db.collection('admins').doc(uid).get();
            const isAdmin = doc.exists;
            console.log('✅ É admin:', isAdmin);
            return isAdmin;
          } catch (error) {
            console.error('❌ Erro ao verificar admin:', error);
            return false;
          }
        },
        
        // Método para login de admin
        async adminLogin(email, password) {
          try {
            console.log('🔑 Fazendo login de admin...');
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Verificar se é admin
            const isAdminUser = await this.isAdmin(user.uid);
            if (!isAdminUser) {
              await firebase.auth().signOut();
              throw new Error('Usuário não tem permissões de administrador');
            }
            
            console.log('✅ Login de admin bem-sucedido');
            return { success: true, user };
          } catch (error) {
            console.error('❌ Erro no login de admin:', error);
            throw error;
          }
        },
        
        // Método para logout
        async adminLogout() {
          try {
            await firebase.auth().signOut();
            console.log('✅ Logout realizado');
            return { success: true };
          } catch (error) {
            console.error('❌ Erro no logout:', error);
            throw error;
          }
        },
        
        // Método para obter admin atual
        async getCurrentAdmin() {
          try {
            const user = firebase.auth().currentUser;
            if (user) {
              const isAdminUser = await this.isAdmin(user.uid);
              if (isAdminUser) {
                return { success: true, user };
              }
            }
            return { success: false, user: null };
          } catch (error) {
            console.error('❌ Erro ao obter admin atual:', error);
            return { success: false, user: null };
          }
        },
        
        // Método para carregar todas as compras (admin)
        async loadPurchases() {
          try {
            console.log('📋 Carregando todas as compras...');
            const snapshot = await db.collection('compras')
              .orderBy('timestamp', 'desc')
              .get();
            
            const compras = [];
            snapshot.forEach(doc => {
              compras.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('✅ Compras carregadas:', compras.length);
            return compras;
          } catch (error) {
            console.error('❌ Erro ao carregar compras:', error);
            throw error;
          }
        }
      };
      
      // Marcar como inicializado
      firebaseInitialized = true;
      
      // Disparar evento personalizado
      window.dispatchEvent(new Event('firebaseReady'));
      
      console.log('🎉 Firebase inicializado com sucesso!');
      resolve(true);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase:', error);
      reject(error);
    }
  });
  
  return initializationPromise;
}

/**
 * Auto-inicialização quando o DOM estiver pronto
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebaseUnified);
} else {
  // Se o DOM já carregou, inicializar imediatamente
  setTimeout(initializeFirebaseUnified, 100);
}

// Exportar para compatibilidade
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, initializeFirebaseUnified };
}

console.log('✅ firebase-config.js carregado e pronto para inicialização');