# Bingo Arraiá INEC 🎪🌽

Um sistema completo de bingo temático de festa junina para a empresa INEC com venda de cartelas e controle administrativo.

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

### 🔧 Administração (`admin.html`)
- **Configuração de range** de números (ex: 1-75, 1-100)
- **Controle de vendas** de cartelas
- **Confirmação de pagamentos** 
- **Relatórios de vendas** e arrecadação
- **Gerenciamento completo** do jogo

## 🚀 Como usar

### Para Jogadores:
1. **Comprar Cartelas**: Acesse `cartelas.html` e gere/compre suas cartelas
2. **Acompanhar Sorteio**: Vá para `index.html` e acompanhe os números sorteados

### Para Administradores:
1. **Configurar Jogo**: Acesse `admin.html` e defina o range de números
2. **Controlar Vendas**: Gerencie cartelas, confirme vendas e veja relatórios
3. **Sortear Números**: Use a página principal para conduzir o sorteio

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
├── admin.html          # Tela de administração
├── style.css           # Estilos da página principal
├── cartelas.css        # Estilos da página de cartelas
├── admin.css           # Estilos da administração
├── script.js           # JavaScript da página principal
├── cartelas.js         # JavaScript da página de cartelas
├── admin.js            # JavaScript da administração
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
- **⚙️ Admin**: `/admin.html`

---

**Desenvolvido para INEC** - Sistema Completo de Bingo - Festa Junina 2025 🌽✨
