# 🌸 Planner - Aplicação de Organização Pessoal

Uma aplicação web pessoal desenvolvida em Next.js para planejamento e organização, com tema rosa pastel pensado para público feminino.

## ✨ Funcionalidades

- 🔐 **Autenticação** com Better Auth (email + senha)
- 📅 **Dashboard** com calendário de feriados e tarefas
- 💰 **Controle Financeiro** para receitas e despesas em BRL
- 📝 **Editor de Notas** estilo Notion com TipTap
- 🛒 **Lista de Compras** mensal
- ✅ **Rotinas** de casa e estudo com checklist

## 🛠️ Tecnologias

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **Banco de Dados**: Prisma ORM + SQLite (produção: PostgreSQL)
- **Autenticação**: Better Auth com bcrypt
- **Editor**: TipTap
- **Calendário**: FullCalendar
- **Gráficos**: Recharts
- **Moeda**: BRL com Decimal.js

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o `.env` e adicione suas chaves:

```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="seu-segredo-aqui"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Configurar Banco de Dados

```bash
# Criar o banco de dados
npx prisma migrate dev --name init

# Popular com dados iniciais (feriados)
npx prisma db seed
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📂 Estrutura do Projeto

```
planner/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   │   ├── login/
│   │   └── registro/
│   ├── (dashboard)/     # Páginas protegidas
│   │   ├── dashboard/
│   │   ├── financeiro/
│   │   ├── notas/
│   │   ├── compras/
│   │   └── rotinas/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/             # Componentes shadcn/ui
│   └── sidebar.tsx     # Navegação lateral
├── lib/
│   ├── auth.ts         # Configuração Better Auth
│   ├── prisma.ts       # Cliente Prisma
│   └── utils.ts        # Utilitários
├── prisma/
│   ├── schema.prisma   # Schema do banco
│   └── seed.ts         # Dados iniciais
└── ...
```

## 🎨 Design

- Layout com **sidebar fixa** à esquerda
- Paleta: **rosa pastel** + branco
- Componentes do **shadcn/ui**
- Tipografia legível
- Botões com cantos arredondados

## 📊 Banco de Dados

### Modelos Principais

- **User**: Usuários com autenticação
- **Holiday**: Feriados nacionais e municipais
- **Task**: Tarefas do calendário
- **Transaction**: Receitas e despesas
- **Note**: Notas com editor rico
- **ShoppingItem**: Itens da lista de compras
- **Routine**: Rotinas recorrentes

## 🔒 Autenticação

Utiliza **Better Auth** com:
- Email + senha
- Hash seguro com bcrypt
- Sessões persistentes

## 💵 Valores Financeiros

Todos os valores monetários são armazenados como **Decimal** para evitar imprecisão de floats. A moeda padrão é **BRL (R$)**.

## 📅 Feriados

O sistema inclui:
- Feriados nacionais brasileiros
- Feriados municipais de Jundiaí/SP

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Produção
npm run lint         # Linter
npx prisma studio    # Interface visual do banco
```

## 📝 TODO

- [ ] Implementar API routes para Better Auth
- [ ] Integrar FullCalendar com tarefas
- [ ] Implementar editor TipTap completo
- [ ] Adicionar gráficos financeiros com Recharts
- [ ] Sistema de notificações
- [ ] Exportação de relatórios
- [ ] Modo escuro
- [ ] PWA para uso offline

## 📄 Licença

Projeto pessoal - Uso privado

---

Desenvolvido com 💖 e Next.js
