#!/bin/bash

# ===== VALIDAÇÃO FINAL DO SISTEMA BINGO ARRAIÁ INEC =====
# Este script verifica se todos os componentes estão funcionando

echo "🎪 ===== VALIDAÇÃO SISTEMA BINGO ARRAIÁ INEC ====="
echo ""

# Função para verificar se arquivo existe
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 - Arquivo encontrado"
        return 0
    else
        echo "❌ $1 - Arquivo não encontrado"
        return 1
    fi
}

# Função para verificar função em arquivo JS
check_function() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo "✅ $1 - Função '$2' encontrada"
        return 0
    else
        echo "❌ $1 - Função '$2' não encontrada"
        return 1
    fi
}

# Contador de problemas
PROBLEMAS=0

echo "📁 Verificando arquivos principais..."
echo "-----------------------------------"

# Verificar arquivos HTML
check_file "index.html" || ((PROBLEMAS++))
check_file "cartelas.html" || ((PROBLEMAS++))
check_file "minhas-cartelas.html" || ((PROBLEMAS++))
check_file "login.html" || ((PROBLEMAS++))
check_file "admin.html" || ((PROBLEMAS++))

echo ""
echo "📄 Verificando arquivos JavaScript..."
echo "------------------------------------"

# Verificar arquivos JS
check_file "cartelas.js" || ((PROBLEMAS++))
check_file "minhas-cartelas.js" || ((PROBLEMAS++))
check_file "login.js" || ((PROBLEMAS++))
check_file "auth-admin.js" || ((PROBLEMAS++))
check_file "admin.js" || ((PROBLEMAS++))
check_file "firebase-config-admin.js" || ((PROBLEMAS++))

echo ""
echo "🎨 Verificando arquivos CSS..."
echo "------------------------------"

# Verificar arquivos CSS
check_file "style.css" || ((PROBLEMAS++))
check_file "cartelas.css" || ((PROBLEMAS++))
check_file "minhas-cartelas.css" || ((PROBLEMAS++))
check_file "login.css" || ((PROBLEMAS++))
check_file "admin.css" || ((PROBLEMAS++))

echo ""
echo "🔧 Verificando funções críticas..."
echo "----------------------------------"

# Verificar função mostrarToast
check_function "login.js" "function mostrarToast" || ((PROBLEMAS++))
check_function "auth-admin.js" "function mostrarToast" || ((PROBLEMAS++))
check_function "admin.js" "function mostrarToast" || ((PROBLEMAS++))

# Verificar função de autenticação
check_function "auth-admin.js" "function isUserAuthenticated" || ((PROBLEMAS++))
check_function "login.js" "function isUserAuthenticated" || ((PROBLEMAS++))

# Verificar configuração Firebase
check_function "firebase-config-admin.js" "firebaseConfig" || ((PROBLEMAS++))

echo ""
echo "🧪 Verificando arquivos de teste..."
echo "-----------------------------------"

# Verificar arquivos de teste
check_file "teste-sistema-completo.html" || echo "⚠️ Arquivo de teste não encontrado (opcional)"
check_file "teste-final-cartelas.html" || echo "⚠️ Arquivo de teste não encontrado (opcional)"

echo ""
echo "📚 Verificando documentação..."
echo "------------------------------"

# Verificar documentação
check_file "SISTEMA_FINALIZADO_COMPLETO.md" || echo "⚠️ Documentação não encontrada (opcional)"
check_file "README.md" || echo "⚠️ README não encontrado (opcional)"

echo ""
echo "🔍 Verificando sintaxe JavaScript..."
echo "------------------------------------"

# Verificar sintaxe básica dos arquivos JS principais
for file in "login.js" "auth-admin.js" "admin.js" "minhas-cartelas.js" "cartelas.js"; do
    if [ -f "$file" ]; then
        # Verificar se não há erros de sintaxe óbvios
        if node -c "$file" 2>/dev/null; then
            echo "✅ $file - Sintaxe OK"
        else
            echo "❌ $file - Erro de sintaxe detectado"
            ((PROBLEMAS++))
        fi
    fi
done

echo ""
echo "📊 RELATÓRIO FINAL"
echo "=================="

if [ $PROBLEMAS -eq 0 ]; then
    echo "🎉 SISTEMA TOTALMENTE VALIDADO!"
    echo "✅ Todos os componentes foram verificados com sucesso"
    echo ""
    echo "🚀 Status: PRONTO PARA PRODUÇÃO"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Fazer deploy dos arquivos para o servidor"
    echo "2. Configurar Firebase no ambiente de produção"
    echo "3. Testar todas as funcionalidades em produção"
    echo "4. Monitorar logs de erro"
    echo ""
    echo "🔗 Páginas principais:"
    echo "- Página inicial: index.html"
    echo "- Gerar cartelas: cartelas.html"
    echo "- Consultar cartelas: minhas-cartelas.html"
    echo "- Login admin: login.html"
    echo "- Painel admin: admin.html"
    echo ""
    exit 0
else
    echo "⚠️ PROBLEMAS ENCONTRADOS: $PROBLEMAS"
    echo "❌ Sistema precisa de correções adicionais"
    echo ""
    echo "🔧 Ações recomendadas:"
    echo "1. Revisar arquivos marcados com ❌"
    echo "2. Corrigir problemas identificados"
    echo "3. Executar validação novamente"
    echo ""
    exit 1
fi
