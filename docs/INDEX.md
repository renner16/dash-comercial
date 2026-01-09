# 📚 Índice de Documentação

Bem-vindo à documentação completa do **Cultura Builder | Sales Ops**!

---

## 🚀 Início Rápido

Para começar imediatamente:

1. **[INICIO_RAPIDO.md](../INICIO_RAPIDO.md)** - Do zero ao funcionando (10 min)
2. **[QUICK_START_NEON.md](../QUICK_START_NEON.md)** - Setup Neon (5 min)
3. **[SETUP_NEON.md](../SETUP_NEON.md)** - Guia completo do Neon
4. **[README.md](../README.md)** - Documentação completa do projeto

---

## 📖 Documentação Detalhada

### Para Desenvolvedores

| Documento | Descrição |
|-----------|-----------|
| **[API.md](./API.md)** | Documentação completa das APIs REST |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Guias de deploy para diferentes plataformas |

### Para Usuários

| Documento | Descrição |
|-----------|-----------|
| **[CASOS_DE_USO.md](./CASOS_DE_USO.md)** | Cenários práticos de uso da plataforma |

---

## 🗂️ Estrutura do Projeto

```
cultura-builder-sales/
├── 📄 README.md                 # Documentação principal
├── 📄 QUICK_START.md            # Instalação rápida
├── 📄 package.json              # Dependências
├── 📄 setup.sh / setup.ps1      # Scripts de instalação
│
├── 📁 app/
│   ├── api/                     # APIs REST
│   │   ├── vendas/             # CRUD de vendas
│   │   ├── relatorios/         # CRUD de relatórios
│   │   └── vendedores/         # Listagem de vendedores
│   ├── layout.tsx              # Layout raiz
│   ├── page.tsx                # Página principal
│   └── globals.css             # Estilos globais
│
├── 📁 components/
│   ├── ui/                     # Componentes base (shadcn/ui)
│   ├── charts.tsx              # Gráficos
│   ├── geral-dashboard.tsx     # Dashboard consolidado
│   ├── header.tsx              # Cabeçalho
│   ├── kpi-card.tsx            # Cards de KPI
│   ├── period-selector.tsx     # Seletor de período
│   ├── relatorio-dialog.tsx    # Modal de relatório
│   ├── venda-dialog.tsx        # Modal de venda
│   ├── vendas-table.tsx        # Tabela de vendas
│   └── vendedor-dashboard.tsx  # Dashboard individual
│
├── 📁 lib/
│   ├── comissao.ts             # Sistema de cálculo de comissão
│   ├── prisma.ts               # Cliente Prisma
│   └── utils.ts                # Utilitários gerais
│
├── 📁 prisma/
│   ├── schema.prisma           # Schema do banco
│   └── seed.ts                 # Script de seed
│
└── 📁 docs/
    ├── INDEX.md                # Este arquivo
    ├── API.md                  # Documentação da API
    ├── DEPLOYMENT.md           # Guias de deploy
    └── CASOS_DE_USO.md         # Casos de uso práticos
```

---

## 🎯 Funcionalidades Principais

### ✅ Implementado

- [x] Dashboards individuais por vendedor
- [x] Dashboard consolidado (GERAL)
- [x] Cálculo automático de comissões por faixa
- [x] CRUD completo de vendas
- [x] Relatórios diários
- [x] Gráficos de performance
- [x] Filtros por mês/ano
- [x] Interface dark mode moderna
- [x] Totalmente responsivo
- [x] APIs REST completas
- [x] Banco de dados com Prisma

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** (Type-safe)
- **Tailwind CSS** (Styling)
- **Radix UI** (Componentes acessíveis)
- **Recharts** (Gráficos)

### Backend
- **Next.js API Routes** (REST API)
- **Prisma ORM** (Database ORM)
- **PostgreSQL via Neon** (Serverless Database)

### DevOps
- **Git** (Version control)
- **Vercel** (Deploy recomendado)
- **Railway/Netlify** (Alternativas)

---

## 📊 Regras de Negócio

### Status de Vendas
- **CONFIRMADA**: Conta no faturamento e comissão
- **PENDENTE**: Aguardando confirmação (não conta)
- **ESTORNADA**: Cancelada (não conta)

### Cálculo de Comissão

#### Faixas de Faturamento Mensal:
1. R$ 0 - R$ 40.000
2. R$ 40.001 - R$ 50.000
3. R$ 50.001 - R$ 60.000
4. Acima de R$ 60.000

#### Percentuais:

**JUNIOR** (Matheus):
- Faixa 1: 2%
- Faixa 2: 3%
- Faixa 3: 4%
- Faixa 4: 5%

**PLENO** (Geovana, Renner, Kelvin):
- Faixa 1: 6%
- Faixa 2: 7%
- Faixa 3: 8%
- Faixa 4: 9%

### Vendedores Fixos
1. **Geovana** - PLENO
2. **Renner** - PLENO
3. **Kelvin** - PLENO
4. **Matheus** - JUNIOR

---

## 🎨 Design System

### Cores Principais
- **Primary**: Purple (#8b5cf6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Info**: Blue (#3b82f6)
- **Danger**: Red (#ef4444)

### Tema
- **Dark Mode** por padrão
- Esquema de cores inspirado no Cultura Builder
- Cards com sombras suaves
- Bordas arredondadas (8px)

---

## 🔐 Segurança e Permissões

### ⚠️ Importante
- **Sem autenticação**: Todos veem tudo (conforme requisito)
- **Sem roles/permissões**: Qualquer um pode editar qualquer coisa
- **Sem auditoria**: Não há log de alterações

### Para Produção (Opcional)
Se quiser adicionar autenticação no futuro:
- NextAuth.js
- Clerk
- Auth0
- Supabase Auth

---

## 📦 Instalação

### Opção 1: Script Automático (Recomendado)

**Windows PowerShell:**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Opção 2: Manual

```bash
npm install
npm run prisma:push
npm run prisma:seed
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy

### Plataformas Suportadas
1. **Vercel** (Recomendado) - [Ver guia](./DEPLOYMENT.md#deploy-na-vercel-recomendado)
2. **Railway** - [Ver guia](./DEPLOYMENT.md#deploy-na-railway)
3. **Netlify** - [Ver guia](./DEPLOYMENT.md#deploy-na-netlify)
4. **VPS** - [Ver guia](./DEPLOYMENT.md#deploy-em-vps-digitalocean-aws-etc)

---

## 📞 Suporte

### Documentação Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)

### Links Úteis
- [Plano de Carreira (Regras)](https://plano-carreira-vercel-3izbxmi3g-ygors-projects-4796f89e.vercel.app/)
- [GitHub do Projeto](https://github.com/seu-usuario/seu-repo)

---

## 📝 Licença

Uso interno - Cultura Builder

---

## 🎉 Créditos

Desenvolvido com ❤️ para o time comercial do **Cultura Builder**

---

**Última atualização:** Janeiro 2026

