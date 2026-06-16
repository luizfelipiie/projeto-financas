# FinBot 💚

**Aplicativo de finanças pessoais com interface conversacional e IA.**

Gerencie suas finanças apenas conversando — sem formulários, sem planilhas, sem fricção.

---

## ✨ Funcionalidades

- **Chat com IA** — Registre despesas e receitas em linguagem natural: *"Gastei R$50 no mercado pelo Nubank"*
- **Múltiplos perfis** — Crie perfis separados (você, cônjuge, empresa) com dados completamente isolados
- **Múltiplas contas** — Nubank, Itaú, Carteira, Poupança e mais, cada uma com saldo e histórico próprio
- **Categorização automática** — Alimentação, Transporte, Lazer, Saúde e outras categorias detectadas automaticamente
- **Metas gamificadas** — Defina objetivos financeiros e acompanhe o progresso com barras animadas
- **Insights preditivos** — Alertas inteligentes sobre padrões de gastos e saúde financeira
- **Relatórios inline** — Gráficos e resumos gerados direto na conversa do chat
- **Responsivo** — Funciona no desktop e no mobile

---

## 🛠 Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + Vite |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Estado | Zustand |

---

## 🚀 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/luizfelipiie/projeto-financas.git
cd projeto-financas

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173**

---

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── ChatView.tsx          # Tela principal do chat
│   ├── ChatMessage.tsx       # Bolhas de mensagem com gráficos inline
│   ├── ChatInput.tsx         # Input com quick actions
│   ├── Sidebar.tsx           # Navegação + perfis + contas
│   ├── TransactionsView.tsx  # Extrato com filtros
│   ├── GoalsView.tsx         # Metas com progress bars
│   ├── InsightsView.tsx      # Insights e gráfico de tendência
│   ├── AccountModal.tsx      # Modal de nova conta
│   ├── ProfileModal.tsx      # Modal de novo perfil
│   └── MobileNav.tsx         # Navegação mobile
├── store/
│   └── useFinanceStore.ts    # Store Zustand + NLP + lógica de negócio
├── App.tsx
└── index.css
```

---

## 💬 Comandos do chat

| O que digitar | O que acontece |
|---------------|----------------|
| `Gastei R$80 no restaurante pelo Nubank` | Registra despesa na conta Nubank |
| `Recebi R$3000 de salário` | Registra receita |
| `Qual meu saldo?` | Exibe resumo financeiro com gráfico |
| `Resumo do mês` | Gera relatório de gastos por categoria |
| `Ver minhas metas` | Lista metas com progresso |
| `Minhas contas` | Lista todas as contas cadastradas |

---

## 📄 Licença

MIT
