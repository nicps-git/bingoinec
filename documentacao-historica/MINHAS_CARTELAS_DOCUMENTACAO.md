# 🎫 Sistema de Acompanhamento de Cartelas - Bingo Arraiá INEC

## 📋 Visão Geral
Sistema que permite aos compradores de cartelas acompanhar suas cartelas durante o sorteio do bingo, visualizar números marcados e verificar se fizeram BINGO.

## ✨ Funcionalidades Implementadas

### 🔍 Acesso às Cartelas
- **Consulta por telefone ou e-mail**: Compradores podem acessar suas cartelas usando o telefone ou e-mail cadastrado na compra
- **Interface amigável**: Tela de login simples e intuitiva
- **Validação de dados**: Verificação se o comprador possui cartelas registradas

### 📊 Status do Sorteio
- **Último número sorteado**: Exibição destacada do último número chamado
- **Total de números sorteados**: Contador em tempo real
- **Lista de números sorteados**: Visualização completa dos números já chamados
- **Atualização automática**: Refresh automático a cada 30 segundos
- **Botão de atualização manual**: Para forçar atualização imediata

### 🎫 Visualização das Cartelas
- **Grid responsivo**: Cartelas organizadas em grade adaptável
- **Marcação automática**: Números sorteados são automaticamente destacados
- **Marcação manual**: Possibilidade de marcar/desmarcar números individualmente
- **Identificação visual**: Cada cartela mostra seu número único
- **Status de preenchimento**: Indicação visual do progresso da cartela

### 🎉 Verificação de BINGO
- **Verificação automática**: Sistema detecta automaticamente quando uma cartela faz BINGO
- **Modal de celebração**: Tela especial para comemorar o BINGO
- **Validação múltipla**: Verifica todas as cartelas do comprador
- **Instruções claras**: Orientação para procurar a organização

### 🔧 Ferramentas de Controle
- **Marcar todos os sorteados**: Marca automaticamente todos os números já sorteados em todas as cartelas
- **Limpar marcações**: Remove todas as marcações das cartelas
- **Logout**: Sair da conta para consultar outras cartelas
- **Navegação**: Links para outras páginas do sistema

## 📱 Interface
- **Design responsivo**: Funciona perfeitamente em dispositivos móveis
- **Tema festa junina**: Mantém a identidade visual do evento
- **Animações festivas**: Elementos decorativos e animados
- **Cores vibrantes**: Paleta de cores alegre e festiva

## 🔄 Sincronização
- **Dados em tempo real**: Sincronização com localStorage do sistema principal
- **Persistência de marcações**: Marcações manuais são salvas localmente
- **Atualização automática**: Sistema se mantém atualizado automaticamente

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- `minhas-cartelas.html` - Página principal do sistema de acompanhamento
- `minhas-cartelas.css` - Estilos específicos da página
- `minhas-cartelas.js` - Lógica JavaScript do sistema

### Arquivos Modificados
- `index.html` - Adicionado link "👀 Minhas Cartelas"
- `cartelas.html` - Adicionado link "👀 Minhas Cartelas"
- `admin.html` - Adicionado link "👀 Minhas Cartelas"
- `style.css` - Ajustado CSS dos botões para acomodar novo link

## 🚀 Como Usar

### Para Compradores
1. Acesse a página "Minhas Cartelas"
2. Digite o telefone ou e-mail usado na compra
3. Clique em "🔍 Buscar Cartelas"
4. Acompanhe o sorteio e veja suas cartelas
5. O sistema marca automaticamente os números sorteados
6. Quando fizer BINGO, será notificado automaticamente

### Para Organizadores
1. O sistema funciona automaticamente com base nos dados do sorteio
2. Compradores podem acessar suas cartelas independentemente
3. Todas as funcionalidades são client-side (localStorage)
4. Não requer configuração adicional

## 🔧 Tecnologias Utilizadas
- **HTML5**: Estrutura da página
- **CSS3**: Estilos e animações
- **JavaScript**: Lógica de negócio
- **LocalStorage**: Persistência de dados
- **Design Responsivo**: Compatibilidade móvel

## 🎯 Benefícios
- **Autonomia para compradores**: Não dependem de organizadores para verificar cartelas
- **Experiência melhorada**: Interface moderna e intuitiva
- **Redução de trabalho**: Menos consultas manuais para organizadores
- **Engajamento**: Compradores mais envolvidos no sorteio
- **Transparência**: Sistema aberto e verificável

## 📞 Suporte
Em caso de problemas, os compradores devem entrar em contato com a organização do evento INEC.

---
*Sistema desenvolvido para o Bingo Arraiá INEC 2024* 🎪
