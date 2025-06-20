#!/bin/bash

echo "🔧 Verificação Final: Firebase Service"
echo "======================================"

echo "🐛 PROBLEMA PERSISTENTE:"
echo "• Admin ainda mostra: 'Erro ao carregar sistema Firebase'"
echo "• Necessário correção mais robusta"
echo ""

echo "✅ NOVAS CORREÇÕES IMPLEMENTADAS:"
echo "================================"

echo "1. Configuração Firebase v8 Dedicada:"
echo "   • firebase-config-v8.js criado especificamente para v8"
echo "   • Evento 'firebaseReady' para sincronização"
echo "   • Retry automático em caso de falha"
echo ""

echo "2. Sistema de Espera Melhorado:"
echo "   • waitForFirebase() com Promise e timeout"
echo "   • Aguarda evento firebaseReady"
echo "   • Verificação a cada 500ms como fallback"
echo ""

echo "3. Admin.js Mais Robusto:"
echo "   • Timeout de 15 segundos"
echo "   • Melhor tratamento de erro"
echo "   • Não recarrega página automaticamente"
echo ""

echo "🧪 VERIFICANDO CORREÇÕES..."

# Verificar novos arquivos
echo "📁 Verificando novos arquivos:"
if [ -f "firebase-config-v8.js" ]; then
    echo "  ✅ firebase-config-v8.js criado"
else
    echo "  ❌ firebase-config-v8.js não encontrado"
fi

# Verificar se admin.html usa nova configuração
if grep -q "firebase-config-v8.js" admin.html; then
    echo "  ✅ admin.html usando firebase-config-v8.js"
else
    echo "  ❌ admin.html ainda não usa firebase-config-v8.js"
fi

# Verificar se firebase-service.js tem waitForFirebase
if grep -q "waitForFirebase" firebase-service.js; then
    echo "  ✅ firebase-service.js tem waitForFirebase()"
else
    echo "  ❌ firebase-service.js não tem waitForFirebase()"
fi

# Verificar se admin.js usa waitForFirebase
if grep -q "await window.waitForFirebase" admin.js; then
    echo "  ✅ admin.js usa waitForFirebase()"
else
    echo "  ❌ admin.js não usa waitForFirebase()"
fi

echo ""
echo "🌐 Verificando servidor:"
if curl -s http://localhost:8000 > /dev/null; then
    echo "  ✅ Servidor rodando"
else
    echo "  🚀 Iniciando servidor..."
    python3 -m http.server 8000 > /dev/null 2>&1 &
    sleep 2
    echo "  ✅ Servidor iniciado"
fi

echo ""
echo "📱 LINKS PARA TESTE URGENTE:"
echo "============================"
echo "🧪 Teste Firebase Service: http://localhost:8000/teste-firebase-service.html"
echo "👨‍💼 Admin (corrigido): http://localhost:8000/admin.html"
echo ""

echo "📝 TESTE PRIORITÁRIO:"
echo "===================="
echo ""

echo "PASSO 1: Testar página de diagnóstico"
echo "→ Abrir: http://localhost:8000/teste-firebase-service.html"
echo "→ Aguardar carregamento automático"
echo "→ Verificar se todos os status são verde (sucesso)"
echo "→ Se algo estiver vermelho, ver log para detalhes"
echo ""

echo "PASSO 2: Testar admin corrigido"
echo "→ Abrir: http://localhost:8000/admin.html"
echo "→ Aguardar carregamento (pode demorar até 15 segundos)"
echo "→ NÃO deve aparecer 'Erro ao carregar sistema Firebase'"
echo "→ Fazer login: admin / admin123"
echo "→ Verificar se interface carrega normalmente"
echo ""

echo "PASSO 3: Debug adicional (se necessário)"
echo "→ Abrir F12 (console do navegador)"
echo "→ Recarregar admin.html"
echo "→ Verificar mensagens no console:"
echo "   ✅ '🔥 Inicializando Firebase...'"
echo "   ✅ '✅ Firebase inicializado com sucesso!'"
echo "   ✅ '🎉 FirebaseService pronto!'"
echo "   ✅ '✅ Firebase pronto para uso!'"
echo ""

echo "⚠️  SE AINDA HOUVER ERRO:"
echo "========================"
echo ""

echo "CENÁRIO 1: Erro de configuração Firebase"
echo "→ Verificar se as credenciais estão corretas"
echo "→ Verificar se projeto 'bingoinec' existe"
echo "→ Verificar conexão com internet"
echo ""

echo "CENÁRIO 2: Erro de carregamento de scripts"
echo "→ Verificar se todos os arquivos existem"
echo "→ Verificar ordem de carregamento no HTML"
echo "→ Verificar se não há erro 404 no console"
echo ""

echo "CENÁRIO 3: Erro de sintaxe JavaScript"
echo "→ Verificar sintaxe dos arquivos modificados"
echo "→ Usar ferramentas de validação JS"
echo "→ Verificar se não há conflitos entre versões"
echo ""

echo "🔧 DIAGNÓSTICO AVANÇADO:"
echo "========================"

# Verificar sintaxe dos arquivos principais
echo "📝 Verificando sintaxe dos arquivos:"

if command -v node &> /dev/null; then
    for file in "firebase-config-v8.js" "firebase-service.js" "admin.js"; do
        if [ -f "$file" ]; then
            if node -c "$file" 2>/dev/null; then
                echo "  ✅ $file - sintaxe OK"
            else
                echo "  ❌ $file - erro de sintaxe"
                echo "     Erro detectado:"
                node -c "$file" 2>&1 | head -3
            fi
        fi
    done
else
    echo "  ⚠️ Node.js não disponível para verificar sintaxe"
fi

echo ""
echo "🎯 SOLUÇÃO DEFINITIVA:"
echo "======================"
echo "Se o problema persistir após estas correções:"
echo ""
echo "1. 📋 Abrir console do navegador (F12)"
echo "2. 🔄 Recarregar admin.html"
echo "3. 📝 Anotar EXATO erro que aparece"
echo "4. 🔍 Compartilhar erro específico para correção direcionada"
echo ""
echo "💡 As correções implementadas devem resolver o problema!"
echo "   Se não resolver, o erro específico ajudará no diagnóstico."
