// Serviço para gerenciar dados do Firebase - Bingo Arraiá INEC
class FirebaseService {
    constructor() {
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK não carregado');
        }
        
        // Inicializar Firebase se necessário
        if (!firebase.apps.length) {
            if (window.firebaseConfig) {
                firebase.initializeApp(window.firebaseConfig);
            } else {
                throw new Error('Firebase config não encontrado');
            }
        }
        
        // Usar variáveis globais ou criar instâncias
        this.db = window.db || firebase.firestore();
        this.auth = window.auth || firebase.auth();
        
        // Garantir que as instâncias globais existam
        if (!window.db) window.db = this.db;
        if (!window.auth) window.auth = this.auth;
        
        this.collections = {
            configuracoes: 'configuracoes',
            cartelas: 'cartelas',
            numerosSorteados: 'numeros-sorteados',
            alertas: 'alertas',
            usuarios: 'usuarios'
        };
        
        console.log('🔥 FirebaseService inicializado');
    }

    // ===== CONFIGURAÇÕES =====
    async salvarConfiguracoes(config) {
        try {
            await this.db.collection(this.collections.configuracoes).doc('bingo').set({
                numeroInicial: config.numeroInicial || 1,
                numeroFinal: config.numeroFinal || 75,
                precoCartela: config.precoCartela || 5.00,
                jogoAtivo: config.jogoAtivo || false,
                dataUltimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Configurações salvas no Firebase');
        } catch (error) {
            console.error('❌ Erro ao salvar configurações:', error);
            throw error;
        }
    }

    async carregarConfiguracoes() {
        try {
            const doc = await this.db.collection(this.collections.configuracoes).doc('bingo').get();
            if (doc.exists) {
                return doc.data();
            } else {
                // Configurações padrão
                const configPadrao = {
                    numeroInicial: 1,
                    numeroFinal: 75,
                    precoCartela: 5.00,
                    jogoAtivo: false
                };
                await this.salvarConfiguracoes(configPadrao);
                return configPadrao;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            throw error;
        }
    }

    // ===== CARTELAS =====
    async salvarCartela(cartela) {
        try {
            const cartelaComTimestamp = {
                ...cartela,
                id: cartela.id || Date.now().toString(),
                dataGeracao: cartela.dataGeracao || firebase.firestore.FieldValue.serverTimestamp(),
                dataVenda: cartela.vendida ? (cartela.dataVenda || firebase.firestore.FieldValue.serverTimestamp()) : null
            };

            await this.db.collection(this.collections.cartelas).doc(cartelaComTimestamp.id).set(cartelaComTimestamp);
            console.log('✅ Cartela salva no Firebase:', cartelaComTimestamp.id);
            return cartelaComTimestamp;
        } catch (error) {
            console.error('❌ Erro ao salvar cartela:', error);
            throw error;
        }
    }

    async carregarCartelas() {
        try {
            // Tentar ordenar por dataGeracao primeiro, se falhar, carregar sem ordenação
            let snapshot;
            try {
                snapshot = await this.db.collection(this.collections.cartelas).orderBy('dataGeracao', 'desc').get();
            } catch (orderError) {
                console.warn('⚠️ Não foi possível ordenar por dataGeracao, carregando sem ordenação');
                snapshot = await this.db.collection(this.collections.cartelas).get();
            }

            const cartelas = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                cartelas.push({ 
                    id: doc.id, 
                    ...data,
                    // Garantir que sempre tenha uma data de referência
                    dataReferencia: data.dataVenda || data.dataGeracao || data.timestamp
                });
            });
            
            // Ordenar localmente por data de referência
            cartelas.sort((a, b) => {
                const dateA = a.dataReferencia ? new Date(a.dataReferencia) : new Date(0);
                const dateB = b.dataReferencia ? new Date(b.dataReferencia) : new Date(0);
                return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
            });

            console.log(`✅ ${cartelas.length} cartelas carregadas do Firebase`);
            return cartelas;
        } catch (error) {
            console.error('❌ Erro ao carregar cartelas:', error);
            throw error;
        }
    }

    async carregarCartelasPorComprador(telefone, email) {
        try {
            let query = this.db.collection(this.collections.cartelas).where('vendida', '==', true);
            
            if (telefone) {
                query = query.where('telefone', '==', telefone);
            } else if (email) {
                query = query.where('email', '==', email);
            }

            const snapshot = await query.get();
            const cartelas = [];
            snapshot.forEach(doc => {
                cartelas.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`✅ ${cartelas.length} cartelas encontradas para o comprador`);
            return cartelas;
        } catch (error) {
            console.error('❌ Erro ao carregar cartelas do comprador:', error);
            throw error;
        }
    }

    // ===== NÚMEROS SORTEADOS =====
    async salvarNumeroSorteado(numero) {
        try {
            const numeroData = {
                numero: numero,
                dataSorteio: firebase.firestore.FieldValue.serverTimestamp(),
                id: Date.now().toString()
            };

            await this.db.collection(this.collections.numerosSorteados).doc(numeroData.id).set(numeroData);
            console.log('✅ Número sorteado salvo no Firebase:', numero);
            return numeroData;
        } catch (error) {
            console.error('❌ Erro ao salvar número sorteado:', error);
            throw error;
        }
    }

    async carregarNumerosSorteados() {
        try {
            const snapshot = await this.db.collection(this.collections.numerosSorteados).orderBy('dataSorteio', 'asc').get();
            const numeros = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                numeros.push(data.numero);
            });
            console.log(`✅ ${numeros.length} números sorteados carregados do Firebase`);
            return numeros;
        } catch (error) {
            console.error('❌ Erro ao carregar números sorteados:', error);
            throw error;
        }
    }

    // ===== ALERTAS =====
    async salvarAlerta(alerta) {
        try {
            const alertaData = {
                ...alerta,
                id: Date.now().toString(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                ativo: true
            };

            await this.db.collection(this.collections.alertas).doc(alertaData.id).set(alertaData);
            console.log('✅ Alerta salvo no Firebase:', alertaData.tipo);
            return alertaData;
        } catch (error) {
            console.error('❌ Erro ao salvar alerta:', error);
            throw error;
        }
    }

    async carregarAlertasAtivos() {
        try {
            const snapshot = await this.db.collection(this.collections.alertas)
                .where('ativo', '==', true)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            const alertas = [];
            snapshot.forEach(doc => {
                alertas.push({ id: doc.id, ...doc.data() });
            });
            
            return alertas;
        } catch (error) {
            console.error('❌ Erro ao carregar alertas:', error);
            throw error;
        }
    }

    // ===== LISTENERS EM TEMPO REAL =====
    escutarNumerosSorteados(callback) {
        return this.db.collection(this.collections.numerosSorteados)
            .orderBy('dataSorteio', 'asc')
            .onSnapshot(snapshot => {
                const numeros = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    numeros.push(data.numero);
                });
                callback(numeros);
            }, error => {
                console.error('❌ Erro no listener de números sorteados:', error);
            });
    }

    escutarCartelas(callback) {
        return this.db.collection(this.collections.cartelas)
            .orderBy('dataGeracao', 'desc')
            .onSnapshot(snapshot => {
                const cartelas = [];
                snapshot.forEach(doc => {
                    cartelas.push({ id: doc.id, ...doc.data() });
                });
                callback(cartelas);
            }, error => {
                console.error('❌ Erro no listener de cartelas:', error);
            });
    }

    escutarConfiguracoes(callback) {
        return this.db.collection(this.collections.configuracoes).doc('bingo')
            .onSnapshot(doc => {
                if (doc.exists) {
                    callback(doc.data());
                }
            }, error => {
                console.error('❌ Erro no listener de configurações:', error);
            });
    }

    // ===== UTILITÁRIOS =====
    async deletarTodasCartelas() {
        try {
            const snapshot = await this.db.collection(this.collections.cartelas).get();
            const batch = this.db.batch();
            
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log('✅ Todas as cartelas deletadas');
        } catch (error) {
            console.error('❌ Erro ao deletar cartelas:', error);
            throw error;
        }
    }

    async limparNumerosSorteados() {
        try {
            await this.db.collection(this.collections.numerosSorteados).doc('lista').delete();
            console.log('✅ Números sorteados limpos');
        } catch (error) {
            console.error('❌ Erro ao limpar números sorteados:', error);
            throw error;
        }
    }

    async resetarJogo() {
        try {
            console.log('🔄 Resetando jogo...');
            await this.deletarTodasCartelas();
            await this.limparNumerosSorteados();
            
            // Resetar configurações para padrão
            await this.salvarConfiguracoes({
                numeroInicial: 1,
                numeroFinal: 75,
                precoCartela: 5.00,
                jogoAtivo: false
            });
            
            console.log('✅ Jogo resetado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao resetar jogo:', error);
            throw error;
        }
    }

    async verificarConexao() {
        try {
            await this.db.collection('teste').doc('conexao').set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await this.db.collection('teste').doc('conexao').delete();
            console.log('✅ Conexão com Firebase OK');
            return true;
        } catch (error) {
            console.error('❌ Erro de conexão com Firebase:', error);
            return false;
        }
    }

    // Alias para verificarConexao (usado em alguns testes)
    async testConnection() {
        return await this.verificarConexao();
    }
}

// Função para inicializar o serviço quando o Firebase estiver pronto
function initFirebaseService() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK não carregado ainda');
            return null;
        }
        
        // Tentar criar o serviço
        const service = new FirebaseService();
        console.log('✅ FirebaseService inicializado com sucesso');
        return service;
    } catch (error) {
        console.error('❌ Erro ao inicializar FirebaseService:', error);
        return null;
    }
}

// Aguardar Firebase estar pronto
let firebaseService = null;

// Função para aguardar Firebase com Promise
function waitForFirebase(timeout = 10000) {
    return new Promise((resolve, reject) => {
        // Se já estiver pronto, resolver imediatamente
        if (window.db && window.auth) {
            const service = initFirebaseService();
            if (service) {
                resolve(service);
                return;
            }
        }
        
        let timeoutId = setTimeout(() => {
            reject(new Error('Timeout aguardando Firebase'));
        }, timeout);
        
        // Aguardar evento firebaseReady
        function onFirebaseReady() {
            clearTimeout(timeoutId);
            window.removeEventListener('firebaseReady', onFirebaseReady);
            
            const service = initFirebaseService();
            if (service) {
                resolve(service);
            } else {
                reject(new Error('Falha ao inicializar FirebaseService'));
            }
        }
        
        window.addEventListener('firebaseReady', onFirebaseReady);
        
        // Tentar inicializar a cada 500ms
        const checkInterval = setInterval(() => {
            if (window.db && window.auth) {
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                window.removeEventListener('firebaseReady', onFirebaseReady);
                
                const service = initFirebaseService();
                if (service) {
                    resolve(service);
                } else {
                    reject(new Error('Falha ao inicializar FirebaseService'));
                }
            }
        }, 500);
    });
}

// Tentar inicializar imediatamente
firebaseService = initFirebaseService();

// Se não conseguiu, aguardar
if (!firebaseService) {
    waitForFirebase().then(service => {
        firebaseService = service;
        window.firebaseService = firebaseService;
        console.log('🎉 FirebaseService pronto!');
    }).catch(error => {
        console.error('❌ Falha ao aguardar Firebase:', error);
        firebaseService = null;
        window.firebaseService = null;
    });
} else {
    window.firebaseService = firebaseService;
}

// Tornar disponível globalmente
window.FirebaseService = FirebaseService;
window.waitForFirebase = waitForFirebase;
