// ===== CORREÇÃO DEFINITIVA: BUSCA DE CARTELAS =====

// Função de normalização padronizada
function normalizarTelefonePadrao(telefone) {
    if (!telefone) return '';
    
    // Remover todos os caracteres não numéricos
    let telefoneNumerico = telefone.toString().replace(/\D/g, '');
    
    console.log('📱 Normalizando telefone:', {
        original: telefone,
        numerico: telefoneNumerico,
        tamanho: telefoneNumerico.length
    });
    
    return telefoneNumerico;
}

// Função para gerar variações de telefone
function gerarVariacoesTelefone(telefone) {
    if (!telefone) return [];
    
    const normalizado = normalizarTelefonePadrao(telefone);
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

// Função corrigida de busca de cartelas
async function buscarCartelasCorrigida(telefone, email = null) {
    console.log('🔍 BUSCA CORRIGIDA - Iniciando busca por:', { telefone, email });
    
    try {
        const db = firebase.firestore();
        
        // Primeiro: tentar busca direta por telefone normalizado
        const telefoneNormalizado = normalizarTelefonePadrao(telefone);
        console.log('📱 Telefone normalizado para busca:', telefoneNormalizado);
        
        // Busca 1: Telefone exato normalizado
        let snapshot = await db.collection('cartelas')
            .where('telefone', '==', telefoneNormalizado)
            .get();
        
        console.log('🔍 Busca 1 (exata):', snapshot.size, 'resultados');
        
        if (!snapshot.empty) {
            const cartelas = [];
            snapshot.forEach(doc => {
                console.log('✅ Cartela encontrada (busca exata):', doc.id);
                cartelas.push({ id: doc.id, ...doc.data() });
            });
            return cartelas;
        }
        
        // Busca 2: Todas as variações do telefone
        const variacoes = gerarVariacoesTelefone(telefone);
        console.log('🔍 Testando variações:', variacoes);
        
        for (const variacao of variacoes) {
            snapshot = await db.collection('cartelas')
                .where('telefone', '==', variacao)
                .get();
            
            console.log(`🔍 Busca variação "${variacao}":`, snapshot.size, 'resultados');
            
            if (!snapshot.empty) {
                const cartelas = [];
                snapshot.forEach(doc => {
                    console.log('✅ Cartela encontrada (variação):', doc.id);
                    cartelas.push({ id: doc.id, ...doc.data() });
                });
                return cartelas;
            }
        }
        
        // Busca 3: Busca por conteúdo (última tentativa)
        console.log('🔍 Busca 3: Busca por conteúdo...');
        
        const todasCartelas = await db.collection('cartelas').get();
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
                    const telefoneDoc = normalizarTelefonePadrao(campoTelefone);
                    
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
        
        console.log(`🎯 Busca finalizada: ${cartelasEncontradas.length} cartelas encontradas`);
        return cartelasEncontradas;
        
    } catch (error) {
        console.error('❌ Erro na busca corrigida:', error);
        throw error;
    }
}

// Função para validar gravação (executar após salvar cartela)
async function validarGravacaoCartela(telefone, nomeComprador) {
    console.log('✅ VALIDANDO GRAVAÇÃO - Telefone:', telefone, 'Nome:', nomeComprador);
    
    // Aguardar 2 segundos para garantir propagação
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
        const cartelasEncontradas = await buscarCartelasCorrigida(telefone);
        console.log('📊 Validação:', cartelasEncontradas.length, 'cartelas encontradas');
        
        // Verificar se alguma cartela tem o nome do comprador
        const cartelasDoComprador = cartelasEncontradas.filter(cartela => 
            cartela.comprador === nomeComprador || 
            cartela.nomeComprador === nomeComprador
        );
        
        console.log('👤 Cartelas do comprador específico:', cartelasDoComprador.length);
        
        if (cartelasDoComprador.length === 0) {
            console.error('❌ FALHA NA VALIDAÇÃO: Cartela não encontrada após gravação!');
            return false;
        }
        
        console.log('✅ VALIDAÇÃO SUCESSO: Cartela encontrada após gravação!');
        return true;
        
    } catch (error) {
        console.error('❌ Erro na validação:', error);
        return false;
    }
}

// Função para corrigir firebase-service.js
async function corrigirFirebaseService() {
    console.log('🔧 Aplicando correção no FirebaseService...');
    
    // Sobrescrever a função carregarCartelasPorComprador
    if (window.firebaseService) {
        window.firebaseService.carregarCartelasPorComprador = async function(telefone, email) {
            return await buscarCartelasCorrigida(telefone, email);
        };
        
        console.log('✅ Função carregarCartelasPorComprador corrigida!');
    }
    
    // Sobrescrever a função de validação em cartelas.js
    if (window.validarGravacao) {
        window.validarGravacao = validarGravacaoCartela;
        console.log('✅ Função de validação corrigida!');
    }
}

// Auto-aplicar correção quando script carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Script de correção carregado!');
    corrigirFirebaseService();
});

// Disponibilizar funções globalmente para debug
window.buscarCartelasCorrigida = buscarCartelasCorrigida;
window.validarGravacaoCartela = validarGravacaoCartela;
window.gerarVariacoesTelefone = gerarVariacoesTelefone;
window.normalizarTelefonePadrao = normalizarTelefonePadrao;
