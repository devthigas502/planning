# 🚀 Quick Start Guide - Planner

## ⚡ Começando em 3 Passos

### 1. Já está rodando! ✅
O servidor já está online em: **http://localhost:3000**

### 2. Acesse a Aplicação
Abra seu navegador e vá para:
```
http://localhost:3000
```

### 3. Explore as Funcionalidades
- Você será redirecionado para `/login`
- Navegue entre as páginas criadas
- O design rosa pastel já está aplicado!

---

## 📍 Páginas Disponíveis

| Página | URL | Descrição |
|--------|-----|-----------|
| Login | `/login` | Tela de autenticação |
| Registro | `/registro` | Criar nova conta |
| Dashboard | `/dashboard` | Visão geral |
| Financeiro | `/financeiro` | Receitas e despesas |
| Notas | `/notas` | Editor de anotações |
| Compras | `/compras` | Lista de compras |
| Rotinas | `/rotinas` | Afazeres e estudos |

---

## 🎯 Testando o Banco de Dados

Visualize os feriados cadastrados:

```bash
npx prisma studio
```

Isso abre uma interface visual em `http://localhost:5555`

---

## 🛠️ Se precisar reiniciar

```bash
# Parar o servidor
Ctrl + C no terminal

# Iniciar novamente
npm run dev
```

---

## 🎨 Personalização Rápida

### Mudar Cores do Tema

Edite `app/globals.css` e ajuste as variáveis:

```css
:root {
  --primary: 340 82% 85%;  /* Rosa pastel */
  --background: 0 0% 100%; /* Branco */
}
```

### Adicionar Nova Página

1. Crie em `app/(dashboard)/nome-da-pagina/page.tsx`
2. Adicione à navegação em `components/sidebar.tsx`

---

## 📊 Estrutura de Dados

O banco SQLite já possui:
- ✅ 13 feriados nacionais (2025)
- ✅ 1 feriado municipal (Jundiaí)
- ✅ Estrutura completa para usuários
- ✅ Tabelas para tarefas, finanças, notas, compras e rotinas

---

## 🔥 Próximas Features a Implementar

1. **Autenticação Real**
   - Integrar Better Auth com API routes
   - Proteger rotas do dashboard

2. **Calendário Interativo**
   - Adicionar FullCalendar
   - Visualizar tarefas e feriados

3. **Editor de Notas Rico**
   - Implementar TipTap
   - Formatação de texto

4. **Controle Financeiro Completo**
   - CRUD de transações
   - Gráficos com Recharts
   - Relatórios mensais

5. **Lista de Compras Funcional**
   - Adicionar/editar itens
   - Marcar como comprado
   - Filtros e categorias

---

## 💡 Dicas

- **Tema Rosa Pastel**: Já aplicado em toda a interface
- **Sidebar Fixa**: Navegação sempre visível à esquerda
- **Componentes**: Use os componentes de `components/ui/`
- **Moeda**: Valores sempre em BRL (R$) como Decimal

---

## 📖 Documentação Completa

Para mais detalhes, consulte:
- `README.md` - Documentação completa
- `STATUS.md` - Status atual do projeto
- `prisma/schema.prisma` - Estrutura do banco

---

**Divirta-se desenvolvendo!** 💖✨
