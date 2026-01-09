# 🏢 Cultura Builder | Sales Ops

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)

**Plataforma de controle de vendas e relatórios para o time comercial**

[Documentação](./docs/INDEX.md) • [Quick Start](./QUICK_START.md) • [API Docs](./docs/API.md) • [Deploy Guide](./docs/DEPLOYMENT.md)

</div>

---

## 🚀 Funcionalidades

- ✅ Dashboards individuais por vendedor (Geovana, Renner, Kelvin, Matheus)
- ✅ Dashboard consolidado do time (página GERAL)
- ✅ Cálculo automático de comissões por faixa de faturamento
- ✅ CRUD completo de vendas com 3 status: CONFIRMADA, PENDENTE, ESTORNADA
- ✅ Relatórios diários (leads recebidos, respostas enviadas, vendas)
- ✅ Gráficos de faturamento, vendas e atividades
- ✅ Filtros por mês/ano
- ✅ Interface dark mode moderna inspirada no Cultura Builder
- ✅ Totalmente responsivo

## 🎯 Regras de Negócio

### Status de Vendas
- **CONFIRMADA**: Entra no faturamento e comissão
- **PENDENTE**: Não entra no cálculo
- **ESTORNADA**: Não entra no cálculo

### Cálculo de Comissão
A comissão é calculada por mês e por vendedor, baseada no faturamento mensal total (apenas vendas CONFIRMADAS).

#### Faixas de Faturamento Mensal:
- R$ 0 - R$ 40.000
- R$ 40.001 - R$ 50.000
- R$ 50.001 - R$ 60.000
- Acima de R$ 60.000

#### Percentuais por Cargo:
**JUNIOR** (Matheus):
- 0 - 40k: 2%
- 40k - 50k: 3%
- 50k - 60k: 4%
- 60k+: 5%

**PLENO** (Geovana, Renner, Kelvin):
- 0 - 40k: 6%
- 40k - 50k: 7%
- 50k - 60k: 8%
- 60k+: 9%

### Link Oficial
Regras detalhadas: [Plano de Carreira](https://plano-carreira-vercel-3izbxmi3g-ygors-projects-4796f89e.vercel.app/)

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: Radix UI (shadcn/ui)
- **Banco de Dados**: PostgreSQL via Neon (serverless)
- **ORM**: Prisma
- **Gráficos**: Recharts

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm, yarn ou pnpm
- Conta no [Neon](https://neon.tech/) (gratuita)

### 🚀 Setup Rápido

#### 1. Criar Banco de Dados no Neon

1. Acesse [neon.tech](https://neon.tech/) e crie uma conta
2. Crie um novo projeto
3. Copie a **Connection String** (algo como: `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require`)

📖 **Guia detalhado:** [SETUP_NEON.md](./SETUP_NEON.md)

#### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
```

⚠️ **Substitua pela SUA connection string do Neon!**

#### 3. Instalar e Configurar

```bash
# Instalar dependências
npm install

# Criar tabelas no banco
npx prisma db push

# Popular com dados iniciais
npm run prisma:seed

# Iniciar servidor
npm run dev
```

✅ **Pronto!** Acesse [http://localhost:3000](http://localhost:3000)

## 🎨 Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   ├── vendas/          # API de vendas
│   │   ├── relatorios/      # API de relatórios diários
│   │   └── vendedores/      # API de vendedores
│   ├── globals.css          # Estilos globais (dark theme)
│   ├── layout.tsx           # Layout raiz
│   └── page.tsx             # Página principal com abas
├── components/
│   ├── ui/                  # Componentes base (shadcn/ui)
│   ├── charts.tsx           # Gráficos
│   ├── geral-dashboard.tsx  # Dashboard consolidado
│   ├── header.tsx           # Cabeçalho
│   ├── kpi-card.tsx         # Cards de KPI
│   ├── period-selector.tsx  # Seletor de mês/ano
│   ├── relatorio-dialog.tsx # Modal de relatório diário
│   ├── venda-dialog.tsx     # Modal de venda
│   ├── vendas-table.tsx     # Tabela de vendas
│   └── vendedor-dashboard.tsx # Dashboard individual
├── lib/
│   ├── comissao.ts          # Sistema de cálculo de comissão
│   ├── prisma.ts            # Cliente Prisma
│   └── utils.ts             # Utilitários gerais
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   └── seed.ts              # Script de seed
└── package.json
```

## 📊 Como Usar

### Dashboard Individual
1. Clique na aba do vendedor (Geovana, Renner, Kelvin, Matheus)
2. Selecione o mês/ano desejado
3. Visualize os KPIs: Faturamento, Vendas, Ticket Médio e Comissão
4. Clique em "Nova Venda" para registrar uma venda
5. Clique em "Relatório Diário" para registrar atividades do dia
6. Edite ou exclua vendas diretamente na tabela

### Dashboard Geral
1. Clique na aba "Geral"
2. Visualize os KPIs consolidados do time (SEM comissão)
3. Veja gráficos de performance do time inteiro
4. Use o filtro para visualizar vendas de um vendedor específico

### Cálculo de Comissão
A comissão é recalculada automaticamente sempre que:
- Uma venda é criada/editada/excluída
- O status de uma venda é alterado
- Uma venda ESTORNADA deixa de contar no mês

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)

1. Faça push do projeto para o GitHub
2. Conecte seu repositório na [Vercel](https://vercel.com)
3. A Vercel detectará automaticamente Next.js
4. Configure as variáveis de ambiente (se necessário)
5. Deploy automático!

**Nota**: O projeto já está configurado com Neon (PostgreSQL serverless), pronto para produção!

### Opção 2: Outras Plataformas

- **Netlify**: Suporta Next.js
- **Railway**: Boa para Next.js + Postgres
- **DigitalOcean App Platform**: Full control

### Deploy com Neon (Produção)

O projeto já está configurado para Neon. No deploy:

1. **Vercel/Railway**: Adicione a variável de ambiente `DATABASE_URL`
2. O Neon já está pronto para produção (não precisa configurar servidor!)
3. Para branches separados (dev/prod), use Neon Branching

📖 **Veja o guia completo:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 📝 Observações

- **Sem autenticação**: Todos veem tudo (conforme requisito)
- **Sem ranking**: A página Geral não mostra comparativos entre vendedores
- **Timezone**: Todas as datas usam timezone local do navegador
- **Backup**: Recomenda-se fazer backup regular do banco de dados

## 🐛 Troubleshooting

### Erro: "Prisma Client not found"
```bash
npx prisma generate
```

### Erro: "Can't reach database server"
- Verifique se a `DATABASE_URL` no `.env` está correta
- Certifique-se que tem `?sslmode=require` no final da URL
- No Neon dashboard, verifique se o projeto está ativo (não suspended)

### Erro de porta em uso
```bash
# Altere a porta no package.json ou mate o processo
npx kill-port 3000
```

## 📞 Suporte

Para dúvidas sobre as regras de comissão, consulte o [Plano de Carreira Oficial](https://plano-carreira-vercel-3izbxmi3g-ygors-projects-4796f89e.vercel.app/).

## 📄 Licença

Uso interno - Cultura Builder

---

Desenvolvido com ❤️ para o time comercial do Cultura Builder

