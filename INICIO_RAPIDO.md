# ⚡ Início Rápido - Cultura Builder Sales Ops

## 🎯 Do Zero ao Funcionando em 10 Minutos

---

## Passo 1: Configurar Neon Database (5 min)

### 1.1 Criar Conta

🔗 Acesse: **https://neon.tech/**

- Clique em "Sign Up"
- Use GitHub para login rápido
- Confirme o email

### 1.2 Criar Projeto

No dashboard do Neon:

1. Clique em **"Create Project"**
2. Configure:
   - **Project name:** `cultura-builder-sales`
   - **Region:** US East (recomendado)
   - **PostgreSQL:** 16 (deixe padrão)
3. Clique em **"Create"**

### 1.3 Copiar Connection String

Na página do projeto, você verá a **Connection String**. Copie inteira:

```
postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/db?sslmode=require
```

---

## Passo 2: Configurar Projeto (5 min)

### 2.1 Clonar/Baixar Projeto

Se ainda não tem o código:

```bash
# Se está no GitHub
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo

# Ou se baixou o ZIP
# Extraia e entre na pasta
```

### 2.2 Criar Arquivo .env

**Windows PowerShell:**
```powershell
New-Item .env -ItemType File
notepad .env
```

**Linux/Mac:**
```bash
touch .env
nano .env
```

**Cole no arquivo:**
```env
DATABASE_URL="SUA_CONNECTION_STRING_AQUI"
```

⚠️ **Substitua pela connection string que você copiou do Neon!**

Exemplo:
```env
DATABASE_URL="postgresql://user:pass@ep-ab12cd34.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### 2.3 Instalar e Configurar

```bash
# 1. Instalar dependências
npm install

# 2. Criar tabelas no Neon
npx prisma db push

# 3. Popular com dados de exemplo
npm run prisma:seed

# 4. Iniciar servidor
npm run dev
```

---

## ✅ Pronto!

Acesse: **http://localhost:3000**

Você verá:
- ✅ 4 vendedores (Geovana, Renner, Kelvin, Matheus)
- ✅ 6 vendas de exemplo
- ✅ 2 relatórios diários

---

## 🎮 Primeiros Passos

### 1. Explorar Dashboards

- Clique nas abas: **Geovana**, **Renner**, **Matheus**, **Kelvin**
- Veja os KPIs: Faturamento, Vendas, Ticket Médio, Comissão
- Role para ver os gráficos

### 2. Criar Primeira Venda

1. Na aba de qualquer vendedor, clique **"Nova Venda"**
2. Preencha:
   - Data: Hoje
   - Nome: Teste Cliente
   - Email: teste@email.com
   - Valor: 25000
   - Status: CONFIRMADA
3. Clique em **"Criar"**
4. 🎉 Veja a comissão sendo recalculada!

### 3. Ver Dashboard Geral

- Clique na aba **"Geral"** (última)
- Veja o consolidado do time
- Note que NÃO mostra comissões (conforme requisito)

### 4. Criar Relatório Diário

1. Volte para aba de um vendedor
2. Clique em **"Relatório Diário"**
3. Preencha leads, respostas e vendas do dia
4. Salve

---

## 🛠️ Ferramentas Úteis

### Visualizar Banco de Dados

```bash
npx prisma studio
```

Abre interface visual em: http://localhost:5555

- Ver todos os dados
- Editar registros
- Deletar vendas
- Adicionar vendedores

---

## 🎨 Customização Rápida

### Alterar Cores

Edite `app/globals.css` na seção `:root` ou `.dark`

### Adicionar Logo

Coloque sua logo em `public/logo.png` e ajuste `components/header.tsx`

### Adicionar Vendedor

Via Prisma Studio ou:

```bash
npx prisma studio
# Vá em Vendedor > Add Record
# Nome: Novo Vendedor
# Cargo: PLENO (ou JUNIOR)
```

---

## 📊 Testar Comissões

### Cenário 1: PLENO Faixa 1 (6%)

1. Crie vendas totalizando R$ 30.000
2. Comissão: R$ 1.800 (6%)

### Cenário 2: PLENO Faixa 2 (7%)

1. Continue adicionando vendas até R$ 45.000
2. Comissão: R$ 3.150 (7%)

### Cenário 3: Estorno

1. Edite uma venda e mude status para ESTORNADA
2. Veja o faturamento cair
3. Comissão recalcula (pode mudar de faixa!)

---

## 🚨 Problemas Comuns

### "Can't reach database server"

**Causa:** Connection string errada ou Neon inativo

**Solução:**
1. Verifique o arquivo `.env`
2. Confira se tem `?sslmode=require` no final
3. Acesse dashboard do Neon e veja se projeto está ativo

### "Prisma Client não gerado"

```bash
npx prisma generate
```

### Banco "lento" na primeira request

- Normal! Neon plano gratuito "dorme" após 5 min inativo
- Primeira request demora ~1s para "acordar"
- Depois fica rápido normalmente

### Porta 3000 em uso

```bash
# Use outra porta
PORT=3001 npm run dev
```

---

## 📱 Acessar no Celular

1. Descubra IP do seu computador:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. No celular, acesse:
   ```
   http://SEU_IP:3000
   ```

3. A interface é responsiva! 📱

---

## 🎯 Próximos Passos

### Documentação Completa
- [README.md](./README.md) - Tudo sobre o projeto
- [SETUP_NEON.md](./SETUP_NEON.md) - Detalhes do Neon
- [docs/CASOS_DE_USO.md](./docs/CASOS_DE_USO.md) - Cenários práticos

### Deploy
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Como colocar no ar

### APIs
- [docs/API.md](./docs/API.md) - Documentação das APIs

---

## ✅ Checklist de Sucesso

- [ ] Conta no Neon criada
- [ ] Projeto no Neon criado
- [ ] Connection string copiada
- [ ] Arquivo `.env` criado
- [ ] `npm install` executado
- [ ] `npx prisma db push` executado
- [ ] `npm run prisma:seed` executado
- [ ] `npm run dev` rodando
- [ ] http://localhost:3000 aberto
- [ ] Primeira venda criada
- [ ] Comissão calculada
- [ ] Dashboard Geral acessado

---

## 🆘 Precisa de Ajuda?

### Guias Detalhados
- [SETUP_NEON.md](./SETUP_NEON.md) - Setup completo do Neon
- [COMANDOS_UTEIS.md](./COMANDOS_UTEIS.md) - Comandos para debug

### Documentação Oficial
- [Neon Docs](https://neon.tech/docs)
- [Prisma Docs](https://prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Tempo total:** ~10 minutos ⏱️

Agora é só usar e vender mais! 🚀💰




