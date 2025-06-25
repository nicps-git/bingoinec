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
            return cartelaComTimestamp.id; // Retornar apenas o ID, não o objeto completo
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

    // Função para normalizar telefone de forma padronizada
    normalizarTelefone(telefone) {
        if (!telefone) return '';
        return telefone.toString().replace(/\D/g, '');
    }

    // Função para gerar variações de telefone
    gerarVariacoesTelefone(telefone) {
        if (!telefone) return [];
        
        const normalizado = this.normalizarTelefone(telefone);
        const variacoes = new Set();
        
        // Adicionar o telefone original
        variacoes.add(telefone);
        variacoes.add(normalizado);
        
        // Se tem 11 dígitos (celular com 9)
        if (normalizado.length === 11) {
            variacoes.add(normalizado.substring(2)); // Remove DDI
            variacoes.add(normalizado.substring(1)); // Remove primeiro dígito
            variacoes.add('0' + normalizado); // Adiciona 0
            variacoes.add('+55' + normalizado); // Adiciona DDI
        }
        
        // Se tem 10 dígitos (fixo ou celular antigo)
        if (normalizado.length === 10) {
            variacoes.add('9' + normalizado); // Adiciona 9 no celular
            variacoes.add(normalizado.substring(2)); // Remove DDI
            variacoes.add('0' + normalizado); // Adiciona 0
            variacoes.add('+55' + normalizado); // Adiciona DDI
        }
        
        // Se tem 9 dígitos (sem DDD)
        if (normalizado.length === 9) {
            variacoes.add('85' + normalizado); // Adiciona DDD Ceará
            variacoes.add('085' + normalizado); // Adiciona DDD com 0
        }
        
        // Se tem 8 dígitos (fixo sem DDD)
        if (normalizado.length === 8) {
            variacoes.add('85' + normalizado); // Adiciona DDD Ceará
            variacoes.add('859' + normalizado); // Adiciona DDD + 9
        }
        
        return Array.from(variacoes).filter(v => v && v.length >= 8);
    }

    async carregarCartelasPorComprador(telefone, email) {
        try {
            console.log('🔍 [CORRIGIDO] carregarCartelasPorComprador chamada com:', { 
                telefone: telefone, 
                email: email,
                tipoTelefone: typeof telefone,
                tipoEmail: typeof email
            });
            
            if (!telefone) {
                console.log('❌ Telefone não fornecido');
                return [];
            }
            
            // Normalizar telefone para busca
            const telefoneNormalizado = this.normalizarTelefone(telefone);
            console.log('📱 Telefone normalizado:', telefoneNormalizado);
            
            // BUSCA 1: Telefone exato normalizado
            let snapshot = await this.db.collection(this.collections.cartelas)
                .where('telefone', '==', telefoneNormalizado)
                .get();
            
            console.log('🔍 Busca 1 (exata normalizada):', snapshot.size, 'resultados');
            
            if (!snapshot.empty) {
                const cartelas = [];
                snapshot.forEach(doc => {
                    console.log('✅ Cartela encontrada (busca exata):', doc.id);
                    cartelas.push({ id: doc.id, ...doc.data() });
                });
                console.log(`✅ SUCESSO: ${cartelas.length} cartelas encontradas na busca exata`);
                return cartelas;
            }
            
            // BUSCA 2: Testar todas as variações
            const variacoes = this.gerarVariacoesTelefone(telefone);
            console.log('� Testando variações:', variacoes);
            
            for (const variacao of variacoes) {
                snapshot = await this.db.collection(this.collections.cartelas)
                    .where('telefone', '==', variacao)
                    .get();
                
                console.log(`🔍 Busca variação "${variacao}":`, snapshot.size, 'resultados');
                
                if (!snapshot.empty) {
                    const cartelas = [];
                    snapshot.forEach(doc => {
                        console.log('✅ Cartela encontrada (variação):', doc.id);
                        cartelas.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(`✅ SUCESSO: ${cartelas.length} cartelas encontradas com variação`);
                    return cartelas;
                }
            }
            
            // BUSCA 3: Busca por conteúdo em múltiplos campos
            console.log('🔍 Busca 3: Busca por conteúdo em múltiplos campos...');
            
            const todasCartelas = await this.db.collection(this.collections.cartelas).get();
            console.log('📊 Total de cartelas na coleção:', todasCartelas.size);
            
            const cartelasEncontradas = [];
            
            todasCartelas.forEach(doc => {
                const data = doc.data();
                
                // Verificar múltiplos campos de telefone
                const camposTelefone = [
                    data.telefone,
                    data.telefoneComprador,
                    data.phone,
                    data.celular
                ];
                
                for (const campoTelefone of camposTelefone) {
                    if (campoTelefone) {
                        const telefoneDoc = this.normalizarTelefone(campoTelefone);
                        
                        // Comparações múltiplas
                        if (telefoneDoc === telefoneNormalizado ||
                            telefoneDoc.includes(telefoneNormalizado) ||
                            telefoneNormalizado.includes(telefoneDoc) ||
                            variacoes.includes(telefoneDoc)) {
                            
                            console.log('✅ MATCH por conteúdo:', {
                                docId: doc.id,
                                telefoneDoc: telefoneDoc,
                                telefoneBusca: telefoneNormalizado,
                                campo: camposTelefone.indexOf(campoTelefone)
                            });
                            
                            cartelasEncontradas.push({ id: doc.id, ...data });
                            break; // Para evitar duplicatas
                        }
                    }
                }
            });
            
            console.log(`🎯 RESULTADO FINAL: ${cartelasEncontradas.length} cartelas encontradas`);
            return cartelasEncontradas;
            
        } catch (error) {
            console.error('❌ [DEBUG] Erro ao carregar cartelas do comprador:', error);
            console.error('❌ [DEBUG] Stack trace:', error.stack);
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

    // ===== FUNÇÕES PARA SISTEMA DE PRÊMIOS =====
    
    // Buscar todas as cartelas vendidas para verificação de prêmios
    async buscarTodasCartelas() {
        try {
            console.log('🔍 Buscando todas as cartelas vendidas...');
            
            // Buscar cartelas vendidas
            const snapshot = await this.db.collection(this.collections.cartelas)
                .where('vendida', '==', true)
                .get();
                
            const cartelas = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                cartelas.push({ 
                    id: doc.id, 
                    ...data
                });
            });
            
            console.log(`✅ ${cartelas.length} cartelas vendidas encontradas`);
            return cartelas;
        } catch (error) {
            console.error('❌ Erro ao buscar cartelas:', error);
            throw error;
        }
    }
    
    // Salvar prêmio no Firebase
    async salvarPremio(tipo, dadosPremio) {
        try {
            console.log(`💾 Salvando prêmio ${tipo} no Firebase...`);
            
            const premio = {
                ...dadosPremio,
                id: `${tipo}_${Date.now()}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Salvar na coleção de prêmios
            await this.db.collection('premios').doc(premio.id).set(premio);
            
            // Também salvar em configurações do jogo para fácil acesso
            await this.db.collection(this.collections.configuracoes).doc('premios').set({
                [tipo.toLowerCase()]: premio,
                ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log(`✅ Prêmio ${tipo} salvo no Firebase`);
            return premio.id;
        } catch (error) {
            console.error(`❌ Erro ao salvar prêmio ${tipo}:`, error);
            throw error;
        }
    }
    
    // Buscar prêmios já concedidos
    async buscarPremios() {
        try {
            const snapshot = await this.db.collection('premios').get();
            const premios = [];
            
            snapshot.forEach(doc => {
                premios.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`✅ ${premios.length} prêmios encontrados`);
            return premios;
        } catch (error) {
            console.error('❌ Erro ao buscar prêmios:', error);
            throw error;
        }
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
