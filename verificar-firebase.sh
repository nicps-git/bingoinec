#!/bin/bash

# Script para verificar e aplicar regras do Firebase

echo "🔥 Verificando configuração do Firebase..."

# Verificar se está logado
firebase projects:list > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Firebase CLI autenticado"
else
    echo "❌ Firebase CLI não autenticado. Execute: firebase login"
    exit 1
fi

# Verificar projeto ativo
PROJETO_ATUAL=$(firebase use 2>/dev/null)
if [[ $PROJETO_ATUAL == *"bingoinec"* ]]; then
    echo "✅ Projeto bingoinec ativo"
else
    echo "⚠️ Configurando projeto bingoinec..."
    firebase use bingoinec
fi

# Verificar arquivo de regras
if [ -f "firestore.rules" ]; then
    echo "✅ Arquivo firestore.rules encontrado"
    echo "📋 Conteúdo das regras:"
    cat firestore.rules
else
    echo "❌ Arquivo firestore.rules não encontrado"
    exit 1
fi

# Aplicar regras
echo "🚀 Aplicando regras do Firestore..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Regras aplicadas com sucesso!"
    echo "🔗 Console: https://console.firebase.google.com/project/bingoinec/firestore/rules"
else
    echo "❌ Erro ao aplicar regras"
    exit 1
fi

echo "🎉 Configuração concluída!"
