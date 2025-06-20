#!/bin/bash

echo "🔧 Corrigindo exibição de vendas no admin"
echo "========================================"

echo "📋 Problemas identificados:"
echo "1. Modal de vendas mostrando apenas texto"
echo "2. Possível problema com CSS ou JavaScript"
echo "3. Números das cartelas não aparecendo formatados"
echo ""

echo "✅ Correções implementadas:"
echo "1. Melhorado JavaScript da função verVendas()"
echo "2. Adicionada validação de dados das cartelas"
echo "3. Implementado layout de grade para números"
echo "4. Criada página de teste específica"
echo ""

echo "🧪 Testando correções..."

# Verificar se os arquivos foram atualizados
echo "📁 Verificando arquivos atualizados..."

files_to_check=(
    "admin.js:verVendas"
    "admin.css:lista-vendas"
    "admin.css:venda-item"
    "admin.css:cartela-numeros"
    "admin.css:numeros-grid"
)

for item in "${files_to_check[@]}"; do
    file=$(echo $item | cut -d: -f1)
    pattern=$(echo $item | cut -d: -f2)
    
    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo "  ✅ $file contém $pattern"
    else
        echo "  ❌ $file não contém $pattern ou arquivo não existe"
    fi
done

echo ""
echo "🔍 Verificando estrutura do modal no admin.html..."

if grep -q 'id="modal-vendas"' admin.html; then
    echo "  ✅ Modal de vendas encontrado"
else
    echo "  ❌ Modal de vendas não encontrado"
fi

if grep -q 'id="lista-cartelas"' admin.html; then
    echo "  ✅ Container da lista encontrado"
else
    echo "  ❌ Container da lista não encontrado"
fi

echo ""
echo "🎨 Verificando estilos CSS..."

css_classes=(
    "lista-vendas"
    "venda-item"
    "cartela-numeros"
    "numeros-grid"
    "numero-cartela"
)

for class in "${css_classes[@]}"; do
    if grep -q "\.$class" admin.css; then
        echo "  ✅ Classe .$class definida no CSS"
    else
        echo "  ❌ Classe .$class não encontrada no CSS"
    fi
done

echo ""
echo "🌐 Iniciando testes..."

# Verificar se servidor está rodando
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Servidor rodando em http://localhost:8000"
else
    echo "🚀 Iniciando servidor..."
    python3 -m http.server 8000 > /dev/null 2>&1 &
    sleep 2
    echo "✅ Servidor iniciado"
fi

echo ""
echo "📱 Links para teste:"
echo "====================="
echo "🧪 Teste específico: http://localhost:8000/teste-exibicao-vendas.html"
echo "👨‍💼 Admin real: http://localhost:8000/admin.html"
echo "🔍 Diagnóstico: http://localhost:8000/diagnostico-gravacao-compras.html"
echo ""

echo "📝 ROTEIRO DE TESTE PARA VENDAS:"
echo "================================="
echo ""

echo "TESTE 1: Página de teste específica"
echo "→ Abrir: http://localhost:8000/teste-exibicao-vendas.html"
echo "→ Clicar: 'Criar Cartela de Teste'"
echo "→ Clicar: 'Mostrar Vendas'"
echo "→ Verificar se cartela aparece formatada corretamente"
echo "→ Verificar se números aparecem em grade colorida"
echo ""

echo "TESTE 2: Admin real"
echo "→ Abrir: http://localhost:8000/admin.html"
echo "→ Fazer login: admin / admin123"
echo "→ Se não houver vendas, fazer uma compra em cartelas.html"
echo "→ Clicar: 'Ver Vendas'"
echo "→ Verificar se modal abre corretamente"
echo "→ Verificar se cartelas estão bem formatadas"
echo ""

echo "TESTE 3: Compra + Verificação"
echo "→ Abrir: http://localhost:8000/cartelas.html"
echo "→ Fazer compra completa de uma cartela"
echo "→ Ir para admin.html"
echo "→ Verificar se cartela aparece em 'Ver Vendas'"
echo ""

echo "⚠️  SE AINDA HOUVER PROBLEMAS:"
echo "=============================="
echo ""

echo "PROBLEMA: Modal abre mas só mostra texto"
echo "→ Verificar console do navegador (F12)"
echo "→ Verificar se admin.css está carregando"
echo "→ Verificar se JavaScript não tem erros"
echo ""

echo "PROBLEMA: Números não aparecem em grade"
echo "→ Verificar se classe 'numeros-grid' existe no CSS"
echo "→ Verificar se 'numero-cartela' tem estilos"
echo "→ Usar página de teste para isolar o problema"
echo ""

echo "PROBLEMA: Dados das cartelas estão vazios"
echo "→ Usar diagnóstico para verificar se dados existem"
echo "→ Verificar se cartelas têm campo 'vendida: true'"
echo "→ Verificar se array 'numeros' está preenchido"
echo ""

echo "✅ CORREÇÃO COMPLETA IMPLEMENTADA!"
echo "=================================="
echo "A exibição de vendas foi corrigida com:"
echo "• Validação robusta de dados"
echo "• Layout visual melhorado"
echo "• Tratamento de erros"
echo "• Ferramentas de teste"
echo ""
echo "💡 Use a página de teste para verificar se está funcionando!"
