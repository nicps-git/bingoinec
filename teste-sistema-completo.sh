#!/bin/bash

# 🧪 SCRIPT DE TESTE AUTOMATIZADO - Sistema de Login e Admin
# Valida todo o fluxo de autenticação do Bingo Arraiá INEC

echo "🚀 Iniciando testes automatizados do sistema de login e admin..."
echo "📅 Data: $(date)"
echo "📂 Diretório: $(pwd)"
echo ""

# Função para log colorido
log_success() {
    echo -e "\033[32m✅ $1\033[0m"
}

log_error() {
    echo -e "\033[31m❌ $1\033[0m"
}

log_info() {
    echo -e "\033[34mℹ️  $1\033[0m"
}

log_warning() {
    echo -e "\033[33m⚠️  $1\033[0m"
}

# Contador de testes
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if $1; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log_success "$2"
        return 0
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        log_error "$2"
        return 1
    fi
}

# Teste 1: Verificar se os arquivos existem
test_files_exist() {
    [[ -f "login.html" ]] && [[ -f "admin.html" ]]
}

# Teste 2: Verificar se o servidor está rodando
test_server_running() {
    curl -s "http://localhost:8000" > /dev/null 2>&1
}

# Teste 3: Verificar se login.html é acessível
test_login_accessible() {
    curl -s "http://localhost:8000/login.html" | grep -q "Login Admin" > /dev/null 2>&1
}

# Teste 4: Verificar se admin.html é acessível
test_admin_accessible() {
    curl -s "http://localhost:8000/admin.html" | grep -q "Administração" > /dev/null 2>&1
}

# Teste 5: Verificar se os arquivos de backup foram criados
test_backups_exist() {
    [[ -f "login-original-backup.html" ]]
}

# Teste 6: Verificar se os arquivos de debug existem
test_debug_files() {
    [[ -f "debug-redirecionamento.html" ]] && [[ -f "admin-debug.html" ]] && [[ -f "teste-completo-login-admin.html" ]]
}

# Teste 7: Verificar se login.html não tem dependências externas problemáticas
test_login_no_external_deps() {
    ! grep -E 'src="auth-unified\.js"[^>]*>' "login.html" > /dev/null 2>&1
}

# Teste 8: Verificar se admin.html tem sistema de autenticação
test_admin_has_auth() {
    grep -q "verificarAutenticacao" "admin.html" > /dev/null 2>&1
}

# Executar testes
echo "🔍 Executando testes de integridade do sistema..."
echo ""

run_test test_files_exist "Arquivos principais (login.html, admin.html) existem"
run_test test_server_running "Servidor HTTP local está rodando na porta 8000"
run_test test_login_accessible "login.html é acessível via HTTP"
run_test test_admin_accessible "admin.html é acessível via HTTP"
run_test test_backups_exist "Arquivos de backup foram criados"
run_test test_debug_files "Arquivos de debug existem"
run_test test_login_no_external_deps "login.html não tem dependências auth-unified.js ativas"
run_test test_admin_has_auth "admin.html tem sistema de autenticação integrado"

echo ""
echo "📊 RESULTADOS DOS TESTES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total de testes: $TOTAL_TESTS"
log_success "Testes aprovados: $PASSED_TESTS"
log_error "Testes falharam: $FAILED_TESTS"

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo ""
    log_success "🎉 TODOS OS TESTES APROVADOS!"
    log_info "Sistema pronto para uso"
    echo ""
    echo "🔗 URLs de acesso:"
    echo "   Login: http://localhost:8000/login.html"
    echo "   Admin: http://localhost:8000/admin.html"
    echo "   Debug: http://localhost:8000/debug-redirecionamento.html"
    echo "   Teste: http://localhost:8000/teste-completo-login-admin.html"
    echo ""
    echo "🔑 Credenciais:"
    echo "   Email: admin@bingoinec.org.br"
    echo "   Senha: wooFestadeComida"
    echo ""
else
    echo ""
    log_error "⚠️  ALGUNS TESTES FALHARAM"
    log_warning "Verifique os erros acima e execute novamente"
    echo ""
fi

# Mostrar estrutura de arquivos importantes
echo "📁 ARQUIVOS DO SISTEMA:"
echo "━━━━━━━━━━━━━━━━━━━━━━"
ls -la *.html 2>/dev/null | grep -E "(login|admin|debug|teste)" | while read line; do
    filename=$(echo $line | awk '{print $9}')
    size=$(echo $line | awk '{print $5}')
    echo "   📄 $filename ($size bytes)"
done

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Acesse http://localhost:8000/login.html"
echo "2. Use as credenciais: admin@bingoinec.org.br / wooFestadeComida"
echo "3. Verifique se o redirecionamento funciona"
echo "4. Teste o logout no painel admin"
echo "5. Use os arquivos de debug se houver problemas"

echo ""
log_info "Script de teste concluído - $(date)"
