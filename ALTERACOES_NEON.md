# 🔄 Alterações para Usar Neon

## O Que Mudou?

O projeto foi atualizado para usar **Neon** (PostgreSQL serverless) ao invés de SQLite.

---

## ✅ Vantagens do Neon

| Aspecto | SQLite | Neon |
|---------|--------|------|
| **Deploy Vercel** | ❌ Não funciona | ✅ Funciona perfeitamente |
| **Produção** | ❌ Não recomendado | ✅ Pronto para produção |
| **Múltiplos acessos** | ⚠️ Limitado | ✅ Ilimitado |
| **Backup automático** | ❌ Manual | ✅ Automático |
| **Escalabilidade** | ❌ Limitada | ✅ Serverless |
| **Branching** | ❌ Não tem | ✅ Tem (dev/prod) |
| **Custo inicial** | ✅ Gratuito | ✅ Gratuito (512MB) |
| **Cold start** | ✅ Instantâneo | ⚠️ ~1s (plano free) |

---

## 📝 Arquivos Alterados

### 1. `prisma/schema.prisma`

**Antes:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**Agora:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Novo: `.env` (você precisa criar)

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
```

### 3. `.gitignore`

**Antes:**
```
prisma/dev.db
prisma/dev.db-journal
```

**Agora:**
```
prisma/migrations
```

### 4. Scripts de Setup

- ✅ Criado: `setup-neon.sh` (Linux/Mac)
- ✅ Criado: `setup-neon.ps1` (Windows)
- ⚠️ Scripts antigos (`setup.sh`, `setup.ps1`) foram mantidos mas não funcionam mais

---

## 🆕 Novos Arquivos de Documentação

1. **SETUP_NEON.md** - Guia completo de configuração do Neon
2. **QUICK_START_NEON.md** - Setup rápido em 5 minutos
3. **INICIO_RAPIDO.md** - Do zero ao funcionando em 10 minutos
4. **setup-neon.sh** - Script automático (Linux/Mac)
5. **setup-neon.ps1** - Script automático (Windows)
6. **ALTERACOES_NEON.md** - Este arquivo

---

## 🚀 Como Usar Agora

### Para Novos Usuários

1. **Configure o Neon primeiro:**
   - Siga [QUICK_START_NEON.md](./QUICK_START_NEON.md)
   - Ou [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) para guia completo

2. **Depois instale normalmente:**
   ```bash
   npm install
   npx prisma db push
   npm run prisma:seed
   npm run dev
   ```

### Usando Scripts Automáticos

**Windows:**
```powershell
.\setup-neon.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-neon.sh
./setup-neon.sh
```

---

## 🔧 Para Quem Já Tinha SQLite

Se você já estava usando o projeto com SQLite:

### Opção 1: Começar do Zero (Recomendado)

1. Configure Neon (veja [SETUP_NEON.md](./SETUP_NEON.md))
2. Crie arquivo `.env` com a DATABASE_URL
3. Execute:
   ```bash
   npx prisma db push
   npm run prisma:seed
   npm run dev
   ```

### Opção 2: Migrar Dados Existentes

Se você tem dados importantes no SQLite:

1. **Export do SQLite:**
   ```bash
   sqlite3 prisma/dev.db .dump > backup.sql
   ```

2. **Configure o Neon** (veja guia)

3. **Import no Neon via Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   - Copie os dados manualmente
   - Ou use script de migração customizado

---

## 📊 Comandos Atualizados

### Antes (SQLite)
```bash
npm run prisma:push   # Criava dev.db local
```

### Agora (Neon)
```bash
npx prisma db push    # Cria tabelas no Neon
```

O resto continua igual:
- ✅ `npm run prisma:seed` - Popular dados
- ✅ `npm run dev` - Iniciar servidor
- ✅ `npx prisma studio` - Visualizar dados

---

## 🔐 Segurança

### ⚠️ IMPORTANTE

O arquivo `.env` contém sua senha do banco!

**NUNCA faça commit do `.env`**

O arquivo já está no `.gitignore`, mas verifique:
```bash
git status
# Se .env aparecer, adicione ao .gitignore
```

---

## 🌐 Deploy

### Antes (SQLite)

Deploy na Vercel **não funcionava** (SQLite é file-based)

### Agora (Neon)

Deploy funciona perfeitamente! 🎉

**Vercel:**
1. Push para GitHub
2. Conecte no Vercel
3. Adicione variável de ambiente `DATABASE_URL`
4. Deploy automático!

---

## 💰 Custos

### Plano Gratuito do Neon

- ✅ **512 MB** de storage
- ✅ **191 horas/mês** de compute
- ✅ **10 branches**
- ✅ **Suficiente para este MVP**

Para este projeto com ~100 vendas/mês: **100% gratuito**

### Quando Atualizar?

Só se:
- Passar de 512 MB (muitos dados)
- Precisar de banco "sempre ativo" (sem cold start)
- Quiser mais branches

**Pro Plan:** $19/mês (3GB storage)

---

## 🆘 Troubleshooting

### Erro: "Can't reach database server"

1. Verifique o arquivo `.env`
2. Confira se tem `?sslmode=require` no final da URL
3. No Neon, veja se o projeto está ativo

### Erro: "SSL required"

Adicione ao final da DATABASE_URL:
```
?sslmode=require
```

### Banco "lento" na primeira vez

Normal! Neon "dorme" após 5 min inativo (plano free).

- Primeira request: ~1 segundo
- Depois: rápido normal

### Ainda quer usar SQLite?

Reverta as mudanças:

1. Edite `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Delete arquivo `.env`

3. Execute:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```

⚠️ **Mas não funcionará no deploy!**

---

## 📚 Documentação Relacionada

- [SETUP_NEON.md](./SETUP_NEON.md) - Setup completo
- [QUICK_START_NEON.md](./QUICK_START_NEON.md) - Setup rápido
- [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) - Do zero ao funcionando
- [README.md](./README.md) - Documentação principal
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deploy

---

## ✅ Resumo

### O Que Você Precisa Fazer:

1. ✅ Criar conta no Neon (gratuita)
2. ✅ Criar projeto no Neon
3. ✅ Copiar connection string
4. ✅ Criar arquivo `.env` com a connection string
5. ✅ Rodar `npx prisma db push`
6. ✅ Rodar `npm run prisma:seed`
7. ✅ Rodar `npm run dev`

**Tempo total:** ~10 minutos

**Resultado:** Projeto funcionando e pronto para deploy! 🚀

---

**Dúvidas?** Veja o guia completo: [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)

