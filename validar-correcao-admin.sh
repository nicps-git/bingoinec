#!/bin/bash

echo "🔧 VALIDAÇÃO FINAL - CORREÇÃO ADMIN FIREBASE"
echo "=============================================="

# Verificar se arquivos essenciais existem
echo ""
echo "📁 Verificando arquivos essenciais..."

files=(
    "admin.html"
    "admin.js"
    "firebase-config-fixed.js"
    "firebase-service.js"
    "login.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - OK"
    else
        echo "❌ $file - FALTANDO"
    fi
done

# Verificar sintaxe JavaScript
echo ""
echo "🔍 Verificando sintaxe dos arquivos JS..."

js_files=("admin.js" "firebase-config-fixed.js" "firebase-service.js" "login.js")

for file in "${js_files[@]}"; do
    if [ -f "$file" ]; then
        # Verificar se node está disponível para sintaxe
        if command -v node &> /dev/null; then
            if node -c "$file" 2>/dev/null; then
                echo "✅ $file - Sintaxe OK"
            else
                echo "❌ $file - ERRO DE SINTAXE"
                node -c "$file"
            fi
        else
            echo "⚠️ $file - Node.js não disponível para verificação"
        fi
    fi
done

# Verificar estrutura do HTML
echo ""
echo "🌐 Verificando admin.html..."

if grep -q "firebase-config-fixed.js" admin.html; then
    echo "✅ admin.html usa firebase-config-fixed.js"
else
    echo "❌ admin.html não está usando firebase-config-fixed.js"
fi

if grep -q "waitForFirebase" admin.js; then
    echo "✅ admin.js usa waitForFirebase"
else
    echo "❌ admin.js não usa waitForFirebase"
fi

# Verificar configuração Firebase
echo ""
echo "🔥 Verificando configuração Firebase..."

if grep -q "window.db.*firebase.firestore" firebase-config-fixed.js; then
    echo "✅ firebase-config-fixed.js inicializa window.db"
else
    echo "❌ firebase-config-fixed.js não inicializa window.db"
fi

if grep -q "window.auth.*firebase.auth" firebase-config-fixed.js; then
    echo "✅ firebase-config-fixed.js inicializa window.auth"
else
    echo "❌ firebase-config-fixed.js não inicializa window.auth"
fi

# Verificar sistema de autenticação
echo ""
echo "🔐 Verificando sistema de autenticação..."

if grep -q "window.bingoAuth" login.js; then
    echo "✅ login.js exporta window.bingoAuth"
else
    echo "❌ login.js não exporta window.bingoAuth"
fi

if grep -q "window.bingoAuth.isAuthenticated" admin.js; then
    echo "✅ admin.js verifica autenticação"
else
    echo "❌ admin.js não verifica autenticação"
fi

# Verificar FirebaseService
echo ""
echo "⚙️ Verificando FirebaseService..."

if grep -q "testConnection" firebase-service.js; then
    echo "✅ firebase-service.js tem testConnection"
else
    echo "❌ firebase-service.js não tem testConnection"
fi

if grep -q "window.waitForFirebase" firebase-service.js; then
    echo "✅ firebase-service.js exporta waitForFirebase"
else
    echo "❌ firebase-service.js não exporta waitForFirebase"
fi

echo ""
echo "🎯 RESUMO DA VALIDAÇÃO"
echo "====================="
echo ""
echo "Se todos os itens acima estão ✅, então:"
echo "1. A estrutura HTML está correta"
echo "2. O Firebase está configurado adequadamente"
echo "3. O sistema de autenticação funciona"
echo "4. O FirebaseService tem todos os métodos necessários"
echo ""
echo "Para testar:"
echo "1. Abra: http://localhost:3000/teste-admin-simplificado.html"
echo "2. Clique em 'Fazer Login como Admin'"
echo "3. Clique em 'Testar Carregamento Admin'"
echo "4. Se tudo funcionar, acesse: http://localhost:3000/admin.html"
echo ""
echo "✅ Validação concluída!"
