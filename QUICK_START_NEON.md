# ⚡ Quick Start com Neon

## Setup Completo em 5 Minutos

### 1️⃣ Criar Conta no Neon (2 min)

🔗 **Acesse:** https://neon.tech/

1. Clique em "Sign Up"
2. Use sua conta GitHub (mais rápido)
3. Confirme o email

### 2️⃣ Criar Projeto (1 min)

1. Clique em **"Create Project"**
2. Configure:
   - **Nome:** `cultura-builder-sales`
   - **Region:** US East (mais próximo do Brasil)
3. Clique em **"Create"**

### 3️⃣ Copiar Connection String (30 seg)

Na página do projeto, copie a **Connection String**:

```
postgresql://user:password@ep-xxxxx.aws.neon.tech/db?sslmode=require
```

### 4️⃣ Configurar Projeto (1 min)

**Criar arquivo `.env`:**

```bash
# Windows
echo DATABASE_URL="COLE_SUA_CONNECTION_STRING_AQUI" > .env

# Linux/Mac
echo 'DATABASE_URL="COLE_SUA_CONNECTION_STRING_AQUI"' > .env
```

⚠️ **Substitua pela SUA connection string do Neon!**

### 5️⃣ Instalar e Rodar (1 min)

```bash
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```

---

## ✅ Pronto!

Acesse: **http://localhost:3000**

O sistema já vem com:
- ✅ 4 vendedores (Geovana, Renner, Kelvin, Matheus)
- ✅ 6 vendas de exemplo
- ✅ 2 relatórios diários

---

## 🎯 Teste Agora

1. Clique na aba **"Geovana"**
2. Clique em **"Nova Venda"**
3. Preencha os dados
4. Veja a comissão sendo calculada! 🎉

---

## 🐛 Problemas?

### Erro de conexão?
- Verifique se copiou a connection string completa
- Certifique-se que tem `?sslmode=require` no final

### Prisma Client error?
```bash
npx prisma generate
```

### Banco "acordando"?
- Primeira request pode demorar ~1s (plano gratuito do Neon)
- É normal! Depois fica rápido

---

## 📚 Mais Informações

- **Setup detalhado:** [SETUP_NEON.md](./SETUP_NEON.md)
- **Documentação completa:** [README.md](./README.md)
- **Deploy:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 💡 Dica

Use **Prisma Studio** para visualizar o banco:

```bash
npx prisma studio
```

Abre em: http://localhost:5555

---

**Tempo total:** ~5 minutos ⏱️

Agora é só usar! 🚀


