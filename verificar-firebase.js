/**
 * Script de verificação rápida do Firebase
 */

console.log('🔍 Verificando conexão com Firebase...');

// Aguardar carregamento
setTimeout(async () => {
    try {
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK não carregado');
            return;
        }

        console.log('✅ Firebase SDK carregado');

        // Inicializar se necessário
        if (!firebase.apps.length) {
            if (typeof firebaseConfig !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase inicializado');
            } else {
                console.error('❌ firebaseConfig não encontrado');
                return;
            }
        }

        const db = firebase.firestore();
        console.log('✅ Firestore conectado');

        // Verificar cartelas existentes
        console.log('🔍 Verificando cartelas existentes...');
        const cartelasSnapshot = await db.collection('cartelas').limit(5).get();
        console.log(`📊 Cartelas encontradas: ${cartelasSnapshot.size}`);
        
        if (!cartelasSnapshot.empty) {
            console.log('📋 Dados das cartelas:');
            cartelasSnapshot.forEach(doc => {
                const data = doc.data();
                console.log(`  - ID: ${doc.id}, Nome: ${data.nome}, Telefone: ${data.telefone}`);
            });
        }

        // Verificar números sorteados
        console.log('🔍 Verificando números sorteados...');
        const numerosSnapshot = await db.collection('numeros-sorteados').limit(10).get();
        console.log(`🎲 Números sorteados encontrados: ${numerosSnapshot.size}`);
        
        if (!numerosSnapshot.empty) {
            const numeros = [];
            numerosSnapshot.forEach(doc => {
                const data = doc.data();
                const numero = data.numero || parseInt(doc.id);
                if (!isNaN(numero)) numeros.push(numero);
            });
            numeros.sort((a, b) => a - b);
            console.log(`🎯 Números: ${numeros.join(', ')}`);
        }

        // Se não há dados, vamos criar alguns dados de teste
        if (cartelasSnapshot.empty) {
            console.log('📝 Criando dados de teste...');
            
            // Criar cartela de teste
            const cartelaTeste = {
                nome: 'João Silva',
                telefone: '11999999999',
                email: 'joao@teste.com',
                numeros: [1, 5, 12, 23, 34, 45, 56, 67, 78, 89],
                vendida: true,
                status: 'vendida',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await db.collection('cartelas').add(cartelaTeste);
            console.log(`✅ Cartela de teste criada com ID: ${docRef.id}`);
            
            // Criar números sorteados de teste
            const numerosTeste = [1, 5, 12, 23];
            const batch = db.batch();
            
            for (const numero of numerosTeste) {
                const docRef = db.collection('numeros-sorteados').doc(numero.toString());
                batch.set(docRef, {
                    numero: numero,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            await batch.commit();
            console.log(`✅ ${numerosTeste.length} números de teste criados: ${numerosTeste.join(', ')}`);
            
            console.log('🎉 Dados de teste criados! Agora você pode testar com:');
            console.log('  📱 Telefone: 11999999999');
            console.log('  👤 Nome: João Silva');
            console.log('  🎯 Números da cartela: 1, 5, 12, 23, 34, 45, 56, 67, 78, 89');
            console.log('  🎲 Números já sorteados: 1, 5, 12, 23');
        }

    } catch (error) {
        console.error('❌ Erro na verificação:', error);
    }
}, 2000);
