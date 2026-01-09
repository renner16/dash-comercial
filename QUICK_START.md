# 🚀 Guia de Início Rápido

## ⚠️ PRÉ-REQUISITO: Configurar Neon

**Primeiro, você precisa configurar o banco de dados Neon:**

📖 **Siga este guia rápido (5 min):** [QUICK_START_NEON.md](./QUICK_START_NEON.md)

Ou o guia completo: [SETUP_NEON.md](./SETUP_NEON.md)

---

## Depois de Configurar o Neon

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Configurar Banco de Dados
```bash
npx prisma db push
npm run prisma:seed
```

### 3️⃣ Iniciar o Servidor
```bash
npm run dev
```

✅ Pronto! Acesse [http://localhost:3000](http://localhost:3000)

---

## 📌 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run prisma:push` | Sincroniza schema com o banco |
| `npm run prisma:seed` | Popula banco com dados iniciais |

---

## 🎯 Primeiros Passos na Plataforma

1. **Navegue pelas abas** dos vendedores (Geovana, Renner, Kelvin, Matheus)
2. **Clique em "Nova Venda"** para registrar sua primeira venda
3. **Selecione o mês/ano** para filtrar os dados
4. **Veja a comissão** sendo calculada automaticamente
5. **Acesse "Geral"** para ver o consolidado do time

---

## 💡 Dicas

- As vendas devem estar com status **CONFIRMADA** para entrarem no cálculo
- A comissão é calculada baseada no **faturamento mensal total**
- Use **Relatório Diário** para registrar leads e respostas
- A página **Geral** não mostra comissões (apenas consolidado)

---

## 🐛 Problemas Comuns

**Erro ao rodar**: Certifique-se de ter Node.js 18+ instalado
```bash
node --version
```

**Erro de conexão**: Verifique o `.env`
```bash
# Certifique-se que o arquivo .env existe e tem a DATABASE_URL
cat .env  # Linux/Mac
type .env # Windows
```

**Porta em uso**: Altere a porta ou mate o processo
```bash
npx kill-port 3000
```

---

## 📞 Ajuda

Consulte o [README.md](./README.md) completo para mais detalhes.

