# 🚀 Guia de Deploy

## Deploy na Vercel (Recomendado)

A Vercel é a plataforma oficial do Next.js e oferece a melhor experiência de deploy.

### Passo 1: Preparar o Repositório

```bash
# Inicializar Git (se ainda não inicializou)
git init
git add .
git commit -m "Initial commit"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/seu-repo.git
git branch -M main
git push -u origin main
```

### Passo 2: Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe seu repositório
5. A Vercel detectará automaticamente Next.js
6. Clique em "Deploy"

### Passo 3: Configurar Banco de Dados

**⚠️ IMPORTANTE:** SQLite não funciona na Vercel. Use PostgreSQL.

#### Opção 1: Vercel Postgres

```bash
# Instalar CLI da Vercel
npm i -g vercel

# Criar banco Postgres
vercel postgres create
```

#### Opção 2: Railway Postgres

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto Postgres
3. Copie a `DATABASE_URL`

### Passo 4: Configurar Variáveis de Ambiente

Na Vercel:
1. Vá em Settings > Environment Variables
2. Adicione:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Passo 5: Atualizar Schema do Prisma

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Commit e push:

```bash
git add .
git commit -m "Update to PostgreSQL"
git push
```

A Vercel fará redeploy automaticamente.

### Passo 6: Popular o Banco

No terminal da Vercel ou localmente com a DATABASE_URL de produção:

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run prisma:seed
```

---

## Deploy na Railway

Railway oferece deploy gratuito com banco incluído.

### Passo 1: Criar Conta

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub

### Passo 2: Novo Projeto

1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha seu repositório

### Passo 3: Adicionar PostgreSQL

1. No projeto, clique em "+ New"
2. Selecione "Database" > "PostgreSQL"
3. Copie a `DATABASE_URL` gerada

### Passo 4: Configurar Variáveis

1. Clique no serviço do Next.js
2. Vá em "Variables"
3. Adicione:

```
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Passo 5: Deploy

Railway fará deploy automaticamente. Para popular o banco:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Popular banco
railway run npm run prisma:push
railway run npm run prisma:seed
```

---

## Deploy na Netlify

### Passo 1: Preparar

Netlify não suporta Next.js App Router nativamente. Use o plugin:

```bash
npm install @netlify/plugin-nextjs
```

Crie `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Passo 2: Deploy

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "Add new site" > "Import an existing project"
3. Conecte seu repositório
4. Configure variáveis de ambiente

**Nota:** Use banco externo (Railway, Supabase, etc.)

---

## Deploy em VPS (DigitalOcean, AWS, etc.)

### Requisitos

- Node.js 18+
- PostgreSQL instalado
- PM2 para gerenciar processo

### Passo 1: Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Passo 2: Clonar Repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
npm install
```

### Passo 3: Configurar Ambiente

```bash
# Criar .env
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/db" > .env
echo "NODE_ENV=production" >> .env

# Configurar banco
npm run prisma:push
npm run prisma:seed
```

### Passo 4: Build

```bash
npm run build
```

### Passo 5: Instalar PM2

```bash
sudo npm install -g pm2
pm2 start npm --name "cultura-builder" -- start
pm2 save
pm2 startup
```

### Passo 6: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Migração de SQLite para PostgreSQL

Se você já tem dados em SQLite e quer migrar:

### Opção 1: Export/Import Manual

```bash
# No SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# Editar backup.sql para sintaxe PostgreSQL
# Depois executar no PostgreSQL
psql $DATABASE_URL < backup.sql
```

### Opção 2: Script de Migração

```typescript
// scripts/migrate.ts
import { PrismaClient as SQLiteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'

const sqlite = new SQLiteClient()
const postgres = new PostgresClient()

async function migrate() {
  const vendedores = await sqlite.vendedor.findMany()
  const vendas = await sqlite.venda.findMany()
  const relatorios = await sqlite.relatoriosDiarios.findMany()

  // Criar vendedores
  for (const v of vendedores) {
    await postgres.vendedor.create({ data: v })
  }

  // Criar vendas
  for (const v of vendas) {
    await postgres.venda.create({ data: v })
  }

  // Criar relatórios
  for (const r of relatorios) {
    await postgres.relatoriosDiarios.create({ data: r })
  }

  console.log('Migração concluída!')
}

migrate()
```

---

## Checklist de Deploy

- [ ] Código commitado no Git
- [ ] Variáveis de ambiente configuradas
- [ ] Schema do Prisma ajustado para PostgreSQL
- [ ] Banco de dados criado e populado
- [ ] Build passa sem erros
- [ ] Domínio configurado (opcional)
- [ ] SSL/HTTPS configurado
- [ ] Monitoramento configurado

---

## Troubleshooting

### Erro: "Can't reach database server"

- Verifique a `DATABASE_URL`
- Confira se o banco está acessível
- Verifique firewall/security groups

### Erro: "EADDRINUSE: address already in use"

- Porta 3000 já está em uso
- Altere a porta: `PORT=3001 npm start`

### Build muito lento

- Use cache do Next.js
- Configure `.gitignore` corretamente
- Use variáveis de build otimizadas

---

Para mais informações, consulte:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)

