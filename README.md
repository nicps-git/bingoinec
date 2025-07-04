# Bingo Arraiá INEC 🎪🌽

Um sistema completo de bingo temático de festa junina para a empresa INEC com venda de cartelas, controle administrativo e **sistema de autenticação seguro**.

## 🎯 Funcionalidades

### 🎪 Página Principal (`index.html`)
- **Sorteio de Bingo** com tema de São João
- **Animações festivas** com elementos juninos
- **Persistência de dados** no navegador
- **Design responsivo** e interativo

### 🎫 Sistema de Cartelas (`cartelas.html`)
- **Geração de cartelas** baseada no range configurado
- **Preview em tempo real** das cartelas
- **Carrinho de compras** funcional
- **Checkout completo** com dados do comprador
- **Integração automática** com o sistema administrativo

### 🔧 Administração (`admin.html`) - **PROTEGIDA**
- **🔐 Login obrigatório** para acesso
- **Configuração de range** de números (ex: 1-75, 1-100)
- **Controle de vendas** de cartelas
- **Confirmação de pagamentos** 
- **Relatórios de vendas** e arrecadação
- **Gerenciamento completo** do jogo
- **Sessão segura** com expiração automática

### 🔐 Sistema de Login (`login.html`) - **NOVO**
- **Autenticação obrigatória** para área administrativa
- **Credenciais específicas** para acesso
- **Sessão persistente** (8 horas)
- **Renovação automática** com atividade
- **Logs de acesso** para auditoria
- **Proteção contra** acesso não autorizado

## 🚀 Como usar

### Para Jogadores:
1. **Comprar Cartelas**: Acesse `cartelas.html` e gere/compre suas cartelas
2. **Acompanhar Sorteio**: Vá para `index.html` e acompanhe os números sorteados

### Para Administradores:
1. **🔐 FAZER LOGIN**: Clique em "⚙️ Admin" e faça login com:
   - **E-mail:** admin@bingoinec.org.br
   - **Senha:** wooFestadeComida
2. **Configurar Jogo**: Defina o range de números e preço das cartelas
3. **Controlar Vendas**: Gerencie cartelas, confirme vendas e veja relatórios
4. **Sortear Números**: Use a página principal para conduzir o sorteio
5. **🚪 LOGOUT**: Use o botão "Sair" para finalizar a sessão

### 🔐 Credenciais de Acesso:
```
E-mail: admin@bingoinec.org.br
Senha: wooFestadeComida
```
**⚠️ IMPORTANTE:** Altere essas credenciais em produção editando o arquivo `login.js`.

## 💰 Sistema de Vendas

### Fluxo de Venda:
1. **Cliente** gera e compra cartelas na página `cartelas.html`
2. **Sistema** registra automaticamente as cartelas como "pendentes"
3. **Administrador** confirma o pagamento no painel admin
4. **Cartela** fica marcada como "vendida" com dados do comprador

### Controles Administrativos:
- ✅ **Confirmar Venda**: Marcar cartela como paga
- 🗑️ **Remover Cartela**: Excluir cartelas não vendidas
- 📊 **Relatórios**: Ver total arrecadado e estatísticas
- 💳 **Preço Dinâmico**: Configurar valor das cartelas

## 🎨 Tema

- **Festa Junina** com bandeirolas, fogueira e caipiras
- **Cores temáticas**: amarelo, laranja, vermelho, verde
- **Elementos interativos**: balões, confetes, fogos de artifício
- **Animações suaves** e efeitos visuais

## 📁 Estrutura do Projeto

```
/
├── index.html          # Página principal do bingo
├── cartelas.html       # Sistema de compra de cartelas
├── admin.html          # Tela de administração (PROTEGIDA)
├── login.html          # Sistema de login (NOVO)
├── style.css           # Estilos da página principal
├── cartelas.css        # Estilos da página de cartelas
├── admin.css           # Estilos da administração
├── login.css           # Estilos da página de login (NOVO)
├── script.js           # JavaScript da página principal
├── cartelas.js         # JavaScript da página de cartelas
├── admin.js            # JavaScript da administração
├── login.js            # Sistema de autenticação (NOVO)
├── inec.png            # Logo da empresa
├── netlify.toml        # Configuração de deploy
└── README.md           # Este arquivo
```

## 🔧 Tecnologias

- **HTML5** - Estrutura
- **CSS3** - Estilos e animações
- **JavaScript** - Lógica e interatividade
- **LocalStorage** - Persistência de dados
- **Responsive Design** - Compatibilidade mobile

## 📱 Funcionalidades Móveis

- **Layout responsivo** em todas as páginas
- **Touch-friendly** para dispositivos móveis
- **Otimizado** para diferentes tamanhos de tela

## 🎪 Deploy

Este projeto está configurado para deploy no Netlify. Consulte `DEPLOY_GUIDE.md` para instruções detalhadas.

### URLs de Acesso:
- **🎪 Sorteio**: `/index.html`
- **🎫 Cartelas**: `/cartelas.html`
- **🔐 Login**: `/login.html` (NOVO)
- **⚙️ Admin**: `/admin.html` (Requer login)

## 🛡️ Segurança

### Sistema de Autenticação Implementado:
- **Login obrigatório** para área administrativa
- **Sessão segura** com expiração automática (8 horas)
- **Renovação automática** da sessão com atividade do usuário
- **Logs de acesso** para auditoria (últimos 100 registros)
- **Redirecionamento** automático quando não autenticado
- **Proteção de rotas** administrativas

### Verificação de Sessão:
- Verifica autenticação **a cada minuto**
- **Estende sessão** automaticamente com atividade
- **Logout seguro** com limpeza de dados
- **Persistência** entre recarregamentos de página

---

**Desenvolvido para INEC** - Sistema Completo de Bingo com Autenticação - Festa Junina 2025 🌽✨
