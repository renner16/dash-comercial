# 🐘 Setup com Neon Database

## O que é Neon?

**Neon** é um PostgreSQL serverless moderno, perfeito para aplicações Next.js:
- ✅ **Gratuito** para começar (até 512 MB)
- ✅ **Serverless** (escalabilidade automática)
- ✅ **Rápido** (cold start < 1s)
- ✅ **Branching** (crie branches do seu banco!)
- ✅ **Sem configuração** de servidor

🔗 **Site:** https://neon.tech/

---

## 🚀 Instalação Completa (5 Passos)

### Passo 1: Criar Conta no Neon

1. Acesse: https://neon.tech/
2. Clique em "Sign Up" (pode usar GitHub)
3. Confirme seu email

### Passo 2: Criar Projeto no Neon

1. No dashboard, clique em **"Create Project"**
2. Preencha:
   - **Project name:** `cultura-builder-sales`
   - **Database name:** `salesops` (ou deixe padrão)
   - **Region:** Escolha mais próximo do Brasil (US East geralmente)
   - **PostgreSQL version:** 16 (mais recente)
3. Clique em **"Create Project"**

### Passo 3: Copiar Connection String

1. Após criar, você verá a **Connection String**
2. Copie a URL completa (algo como):
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/salesops?sslmode=require
   ```

### Passo 4: Configurar no Projeto

1. **Crie o arquivo `.env` na raiz do projeto:**

```bash
# Windows PowerShell
New-Item .env

# Linux/Mac
touch .env
```

2. **Cole a connection string no arquivo `.env`:**

```env
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/salesops?sslmode=require"
```

⚠️ **Importante:** Substitua pela SUA connection string do Neon!

### Passo 5: Instalar e Popular o Banco

```bash
# 1. Instalar dependências
npm install

# 2. Criar tabelas no Neon
npx prisma db push

# 3. Popular com dados iniciais
npm run prisma:seed

# 4. Iniciar servidor
npm run dev
```

✅ **Pronto!** Acesse: http://localhost:3000

---

## 🔐 Segurança da Connection String

### ⚠️ NUNCA faça commit da `.env`

O arquivo `.env` já está no `.gitignore`, mas verifique:

```bash
# Ver o que será commitado
git status

# Se .env aparecer, adicione ao .gitignore
echo ".env" >> .gitignore
```

### 🔒 Para Deploy

**Vercel:**
1. Vá em Settings > Environment Variables
2. Adicione `DATABASE_URL` com o valor do Neon
3. Redeploy

**Railway:**
1. Clique em "Variables"
2. Adicione `DATABASE_URL`
3. Salve

---

## 🛠️ Comandos Úteis

```bash
# Ver estrutura do banco (Prisma Studio)
npx prisma studio

# Sincronizar schema após alterações
npx prisma db push

# Ver dados no terminal
npx prisma db seed

# Resetar banco (⚠️ apaga todos os dados)
npx prisma migrate reset --skip-seed
npm run prisma:seed
```

---

## 📊 Prisma Studio

Para visualizar e editar dados graficamente:

```bash
npx prisma studio
```

Abrirá em: http://localhost:5555

- Ver vendedores
- Ver/editar vendas
- Ver/editar relatórios
- Interface visual completa!

---

## 🌿 Neon Branching (Feature Avançada)

Neon permite criar "branches" do banco (como Git):

```bash
# No dashboard do Neon:
# 1. Clique em "Branches"
# 2. Crie uma branch "development"
# 3. Use connection strings diferentes para dev/prod
```

**Exemplo:**
```env
# .env.local (desenvolvimento)
DATABASE_URL="postgresql://...neon.tech/salesops-dev?..."

# .env.production (produção - Vercel)
DATABASE_URL="postgresql://...neon.tech/salesops?..."
```

---

## 🚨 Troubleshooting

### Erro: "Can't reach database server"

**Causa:** Connection string incorreta ou Neon inativo

**Solução:**
1. Verifique se copiou a connection string completa
2. Certifique-se que tem `?sslmode=require` no final
3. No Neon dashboard, vá em "Suspend" e clique em "Resume"

### Erro: "SSL connection required"

**Causa:** Falta `sslmode=require` na URL

**Solução:**
```env
# Adicione ao final da URL:
DATABASE_URL="...neon.tech/db?sslmode=require"
```

### Erro: "Prisma Client not generated"

**Solução:**
```bash
npx prisma generate
```

### Banco "dormente" (Suspended)

Neon coloca projetos inativos em "sleep mode" após 5 minutos (plano gratuito).

**Primeira request pode demorar ~1s para "acordar"** - isso é normal!

Para evitar:
- Upgrade para plano pago (mantém sempre ativo)
- Ou aceite o delay inicial

---

## 📈 Limites do Plano Gratuito

| Recurso | Limite Gratuito |
|---------|-----------------|
| Armazenamento | 512 MB |
| Compute hours | 191h/mês |
| Projetos | 1 projeto |
| Branches | 10 branches |
| História | 7 dias |

**Para este MVP, o plano gratuito é mais que suficiente!**

Se precisar mais:
- **Pro Plan:** $19/mês (3 GiB storage, sempre ativo)
- Veja: https://neon.tech/pricing

---

## 🔄 Migrar Dados de SQLite para Neon

Se você já tem dados em SQLite e quer migrar:

### Opção 1: Usar Prisma Studio

1. **Abra SQLite:**
   ```bash
   # Altere temporariamente schema.prisma para sqlite
   npx prisma studio
   ```

2. **Export manual:**
   - Copie dados de cada tabela
   - Cole no Neon via Prisma Studio

### Opção 2: Script de Migração

```typescript
// scripts/migrate-to-neon.ts
import { PrismaClient } from '@prisma/client'

// Configurar dois clientes
const sqlite = new PrismaClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
})

const neon = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function migrate() {
  // Migrar vendedores
  const vendedores = await sqlite.vendedor.findMany()
  for (const v of vendedores) {
    await neon.vendedor.create({ data: v })
  }

  // Migrar vendas
  const vendas = await sqlite.venda.findMany()
  for (const v of vendas) {
    await neon.venda.create({ data: v })
  }

  // Migrar relatórios
  const relatorios = await sqlite.relatoriosDiarios.findMany()
  for (const r of relatorios) {
    await neon.relatoriosDiarios.create({ data: r })
  }

  console.log('✅ Migração concluída!')
}

migrate()
```

Execute:
```bash
npx tsx scripts/migrate-to-neon.ts
```

### Opção 3: Começar do Zero

Mais simples:
```bash
npx prisma db push
npm run prisma:seed
```

---

## 🎯 Vantagens do Neon vs SQLite

| Recurso | SQLite | Neon |
|---------|--------|------|
| **Deploy Vercel** | ❌ Não funciona | ✅ Funciona |
| **Múltiplos acessos** | ⚠️ Limitado | ✅ Ilimitado |
| **Backup automático** | ❌ Manual | ✅ Automático |
| **Escalabilidade** | ❌ Limitada | ✅ Automática |
| **Branching** | ❌ Não tem | ✅ Tem |
| **Desenvolvimento local** | ✅ Ótimo | ✅ Ótimo |

---

## 📞 Suporte

- **Neon Docs:** https://neon.tech/docs/introduction
- **Neon Discord:** https://discord.gg/neon
- **Prisma + Neon:** https://www.prisma.io/docs/guides/database/neon

---

## 🎉 Checklist Final

- [ ] Criar conta no Neon
- [ ] Criar projeto
- [ ] Copiar connection string
- [ ] Criar arquivo `.env`
- [ ] Colar DATABASE_URL
- [ ] Executar `npx prisma db push`
- [ ] Executar `npm run prisma:seed`
- [ ] Executar `npm run dev`
- [ ] Acessar http://localhost:3000
- [ ] Testar criando uma venda

---

**Dica:** Adicione o Neon aos favoritos para acesso rápido ao dashboard! 🚀

---

**Próximo passo:** Volte ao [README.md](./README.md) para continuar usando o sistema!

