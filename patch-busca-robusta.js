/**
 * SOLUÇÃO RADICAL - PATCH COMPLETO PARA FIREBASE SERVICE
 * ======================================================
 * 
 * Esta solução substitui completamente a função de busca de cartelas
 * para resolver definitivamente o problema de busca por telefone.
 */

// Backup da função original (se existir)
let originalCarregarCartelasPorComprador = null;

// Função de normalização robusta
function normalizarTelefoneRobusta(telefone) {
    if (!telefone) return '';
    
    // Converter para string e remover todos os caracteres não numéricos
    const numeroLimpo = telefone.toString().replace(/\D/g, '');
    
    console.log(`📱 Normalização robusta: "${telefone}" → "${numeroLimpo}"`);
    return numeroLimpo;
}

// Função para gerar todas as variações possíveis de um telefone
function gerarTodasVariacoesTelefone(telefone) {
    if (!telefone) return [];
    
    const normalizado = normalizarTelefoneRobusta(telefone);
    const variacoes = new Set();
    
    // Adicionar variações básicas
    variacoes.add(telefone); // Original
    variacoes.add(normalizado); // Normalizado
    
    // Variações baseadas no tamanho
    if (normalizado.length >= 8) {
        // Adicionar/remover prefixos comuns
        variacoes.add(`+55${normalizado}`);
        variacoes.add(`055${normalizado}`);
        variacoes.add(`0${normalizado}`);
        
        // Remover prefixos
        if (normalizado.startsWith('55') && normalizado.length >= 10) {
            variacoes.add(normalizado.substring(2));
        }
        if (normalizado.startsWith('0') && normalizado.length >= 9) {
            variacoes.add(normalizado.substring(1));
        }
        
        // Adicionar/remover 9 no celular (padrão brasileiro)
        if (normalizado.length === 10) {
            // Adicionar 9 após DDD
            const ddd = normalizado.substring(0, 2);
            const numero = normalizado.substring(2);
            variacoes.add(`${ddd}9${numero}`);
        }
        if (normalizado.length === 11 && normalizado[2] === '9') {
            // Remover 9 após DDD
            const ddd = normalizado.substring(0, 2);
            const numero = normalizado.substring(3);
            variacoes.add(`${ddd}${numero}`);
        }
        
        // Adicionar DDD padrão (85 para Ceará)
        if (normalizado.length === 8 || normalizado.length === 9) {
            variacoes.add(`85${normalizado}`);
        }
    }
    
    // Filtrar variações válidas (mínimo 8 dígitos)
    const variacoesValidas = Array.from(variacoes).filter(v => v && v.length >= 8);
    
    console.log(`📱 Variações geradas para "${telefone}":`, variacoesValidas);
    return variacoesValidas;
}

// Nova função de busca de cartelas - VERSÃO ROBUSTA
async function buscarCartelasRobusta(telefone, email = null) {
    console.log('🔍 BUSCA ROBUSTA - Iniciando...', { telefone, email });
    
    try {
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            throw new Error('Firebase não disponível');
        }
        
        const db = firebase.firestore();
        const cartelasEncontradas = [];
        
        if (telefone) {
            const telefoneNormalizado = normalizarTelefoneRobusta(telefone);
            console.log(`📱 Telefone para busca: "${telefoneNormalizado}"`);
            
            // ESTRATÉGIA 1: Busca exata por telefone normalizado
            console.log('🔍 Estratégia 1: Busca exata...');
            try {
                const snapshot = await db.collection('cartelas')
                    .where('telefone', '==', telefoneNormalizado)
                    .get();
                
                console.log(`   Resultados busca exata: ${snapshot.size}`);
                
                snapshot.forEach(doc => {
                    const cartela = { id: doc.id, ...doc.data() };
                    cartelasEncontradas.push(cartela);
                    console.log(`   ✅ Encontrada: ${doc.id}`);
                });
                
                // Se encontrou resultados, retornar
                if (cartelasEncontradas.length > 0) {
                    console.log(`✅ Busca exata bem-sucedida: ${cartelasEncontradas.length} cartelas`);
                    return cartelasEncontradas;
                }
            } catch (error) {
                console.error('❌ Erro na busca exata:', error);
            }
            
            // ESTRATÉGIA 2: Busca por variações
            console.log('🔍 Estratégia 2: Busca por variações...');
            const variacoes = gerarTodasVariacoesTelefone(telefone);
            
            for (const variacao of variacoes) {
                try {
                    const snapshot = await db.collection('cartelas')
                        .where('telefone', '==', variacao)
                        .get();
                    
                    console.log(`   Variação "${variacao}": ${snapshot.size} resultados`);
                    
                    snapshot.forEach(doc => {
                        const cartela = { id: doc.id, ...doc.data() };
                        // Evitar duplicatas
                        if (!cartelasEncontradas.find(c => c.id === cartela.id)) {
                            cartelasEncontradas.push(cartela);
                            console.log(`   ✅ Nova cartela: ${doc.id}`);
                        }
                    });
                } catch (error) {
                    console.error(`❌ Erro na variação "${variacao}":`, error);
                }
            }
            
            // Se encontrou resultados, retornar
            if (cartelasEncontradas.length > 0) {
                console.log(`✅ Busca por variações bem-sucedida: ${cartelasEncontradas.length} cartelas`);
                return cartelasEncontradas;
            }
            
            // ESTRATÉGIA 3: Busca em todos os documentos (última tentativa)
            console.log('🔍 Estratégia 3: Busca em todos os documentos...');
            try {
                const todasCartelas = await db.collection('cartelas').get();
                console.log(`   Analisando ${todasCartelas.size} documentos...`);
                
                todasCartelas.forEach(doc => {
                    const data = doc.data();
                    
                    // Verificar múltiplos campos de telefone
                    const camposTelefone = [
                        data.telefone,
                        data.telefoneComprador,
                        data.phone,
                        data.celular,
                        data.tel
                    ];
                    
                    for (const campoTelefone of camposTelefone) {
                        if (campoTelefone) {
                            const telefoneDoc = normalizarTelefoneRobusta(campoTelefone);
                            
                            // Comparações múltiplas
                            if (telefoneDoc === telefoneNormalizado ||
                                telefoneDoc.includes(telefoneNormalizado) ||
                                telefoneNormalizado.includes(telefoneDoc) ||
                                variacoes.includes(telefoneDoc)) {
                                
                                console.log(`   ✅ Match por conteúdo: ${doc.id} (${telefoneDoc})`);
                                
                                const cartela = { id: doc.id, ...data };
                                if (!cartelasEncontradas.find(c => c.id === cartela.id)) {
                                    cartelasEncontradas.push(cartela);
                                }
                                break;
                            }
                        }
                    }
                });
                
                console.log(`✅ Busca por conteúdo concluída: ${cartelasEncontradas.length} cartelas`);
                
            } catch (error) {
                console.error('❌ Erro na busca por conteúdo:', error);
            }
        }
        
        // Busca por email (se fornecido)
        if (email && cartelasEncontradas.length === 0) {
            console.log('📧 Tentando busca por email...');
            try {
                const snapshot = await db.collection('cartelas')
                    .where('email', '==', email)
                    .get();
                
                snapshot.forEach(doc => {
                    const cartela = { id: doc.id, ...doc.data() };
                    if (!cartelasEncontradas.find(c => c.id === cartela.id)) {
                        cartelasEncontradas.push(cartela);
                        console.log(`   ✅ Encontrada por email: ${doc.id}`);
                    }
                });
            } catch (error) {
                console.error('❌ Erro na busca por email:', error);
            }
        }
        
        console.log(`🎯 RESULTADO FINAL: ${cartelasEncontradas.length} cartelas encontradas`);
        return cartelasEncontradas;
        
    } catch (error) {
        console.error('❌ Erro crítico na busca robusta:', error);
        throw error;
    }
}

// Função para aplicar o patch
function aplicarPatchBuscaRobusta() {
    console.log('🔧 Aplicando patch de busca robusta...');
    
    try {
        // Se firebaseService existir, substituir a função
        if (typeof window !== 'undefined' && window.firebaseService) {
            console.log('🔧 Aplicando patch no firebaseService existente...');
            
            // Fazer backup da função original
            if (!originalCarregarCartelasPorComprador) {
                originalCarregarCartelasPorComprador = window.firebaseService.carregarCartelasPorComprador;
            }
            
            // Substituir pela versão robusta
            window.firebaseService.carregarCartelasPorComprador = async function(telefone, email) {
                return await buscarCartelasRobusta(telefone, email);
            };
            
            console.log('✅ Patch aplicado no firebaseService');
        }
        
        // Disponibilizar função globalmente
        window.buscarCartelasRobusta = buscarCartelasRobusta;
        window.normalizarTelefoneRobusta = normalizarTelefoneRobusta;
        window.gerarTodasVariacoesTelefone = gerarTodasVariacoesTelefone;
        
        console.log('✅ Funções robustas disponibilizadas globalmente');
        
        // Tentar aplicar patch quando DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(aplicarPatchBuscaRobusta, 1000);
            });
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao aplicar patch:', error);
        return false;
    }
}

// Função para testar o patch
async function testarPatchRobusta() {
    console.log('🧪 Testando patch robusta...');
    
    try {
        const telefoneTest = '85966666666';
        const resultados = await buscarCartelasRobusta(telefoneTest);
        
        console.log(`🎯 Teste do patch: ${resultados.length} cartelas encontradas`);
        
        if (resultados.length > 0) {
            console.log('✅ PATCH FUNCIONANDO!');
            resultados.forEach((cartela, index) => {
                console.log(`   📄 Cartela ${index + 1}: ${cartela.id} (${cartela.comprador})`);
            });
        } else {
            console.log('⚠️ Patch funcionando mas nenhuma cartela encontrada');
        }
        
        return resultados;
        
    } catch (error) {
        console.error('❌ Erro no teste do patch:', error);
        return [];
    }
}

// Auto-aplicar patch
try {
    aplicarPatchBuscaRobusta();
    console.log('🚀 Patch de busca robusta carregado!');
} catch (error) {
    console.error('❌ Erro ao carregar patch:', error);
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        buscarCartelasRobusta,
        normalizarTelefoneRobusta,
        gerarTodasVariacoesTelefone,
        aplicarPatchBuscaRobusta,
        testarPatchRobusta
    };
}
