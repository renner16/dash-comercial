# 🛠️ Comandos Úteis

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm run start

# Verificar erros de lint
npm run lint
```

---

## Banco de Dados

```bash
# Sincronizar schema com o banco
npm run prisma:push

# Popular banco com dados iniciais
npm run prisma:seed

# Abrir Prisma Studio (visualizador do banco)
npx prisma studio

# Gerar cliente Prisma após alterações no schema
npx prisma generate

# Resetar banco (⚠️ apaga todos os dados)
npx prisma migrate reset
```

---

## Manutenção

```bash
# Limpar cache do Next.js
rm -rf .next

# Limpar node_modules e reinstalar
rm -rf node_modules
npm install

# Limpar banco e recriar
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed

# Atualizar dependências
npm update
```

---

## Debug

```bash
# Ver logs detalhados do Prisma
DEBUG=prisma:* npm run dev

# Ver estrutura do banco
sqlite3 prisma/dev.db ".schema"

# Ver dados de uma tabela
sqlite3 prisma/dev.db "SELECT * FROM Vendedor;"

# Contar registros
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Venda;"
```

---

## Git

```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU_USER/SEU_REPO.git
git branch -M main
git push -u origin main
```

---

## Deploy (Vercel)

```bash
# Instalar CLI da Vercel
npm i -g vercel

# Login
vercel login

# Deploy (produção)
vercel --prod

# Deploy (preview)
vercel
```

---

## Prisma Studio

```bash
# Abrir interface visual do banco
npx prisma studio

# Acessar em: http://localhost:5555
# - Ver/editar vendas
# - Ver/editar relatórios
# - Ver/editar vendedores
```

---

## Adicionar Vendedor

Se precisar adicionar um novo vendedor:

```typescript
// No arquivo prisma/seed.ts, adicione:
await prisma.vendedor.create({
  data: {
    nome: 'Novo Vendedor',
    cargo: 'PLENO' // ou 'JUNIOR'
  }
})

// Depois execute:
npm run prisma:seed
```

Ou via Prisma Studio:
1. `npx prisma studio`
2. Clique em "Vendedor"
3. Clique em "Add record"
4. Preencha os dados
5. Salve

---

## Backup do Banco

```bash
# Criar backup
cp prisma/dev.db prisma/backup_$(date +%Y%m%d).db

# Restaurar backup
cp prisma/backup_20240115.db prisma/dev.db

# Export SQL
sqlite3 prisma/dev.db .dump > backup.sql

# Import SQL
sqlite3 prisma/dev.db < backup.sql
```

---

## Troubleshooting

### Porta já em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Ou use outra porta
PORT=3001 npm run dev
```

### Prisma Client desatualizado
```bash
npm run postinstall
# ou
npx prisma generate
```

### Erro de TypeScript
```bash
# Recarregar servidor TypeScript no VSCode
# Ctrl+Shift+P > TypeScript: Restart TS Server

# Ou limpar cache
rm -rf .next
npm run dev
```

### Banco corrompido
```bash
rm prisma/dev.db
npm run prisma:push
npm run prisma:seed
```

---

## Variáveis de Ambiente

Criar arquivo `.env` na raiz:

```env
# Desenvolvimento (SQLite)
DATABASE_URL="file:./dev.db"

# Produção (PostgreSQL)
# DATABASE_URL="postgresql://user:pass@host:5432/db"

NODE_ENV=development
```

---

## Testes Rápidos

### Testar API de Vendas
```bash
# Listar vendas
curl http://localhost:3000/api/vendas

# Criar venda
curl -X POST http://localhost:3000/api/vendas \
  -H "Content-Type: application/json" \
  -d '{
    "vendedorId": "ID_DO_VENDEDOR",
    "data": "2024-01-15T12:00:00Z",
    "nome": "Teste",
    "email": "teste@email.com",
    "valor": 10000,
    "status": "CONFIRMADA"
  }'
```

### Testar API de Vendedores
```bash
curl http://localhost:3000/api/vendedores
```

---

## Análise de Performance

```bash
# Analisar bundle size
npm run build
npx @next/bundle-analyzer

# Lighthouse (Chrome DevTools)
# F12 > Lighthouse > Analyze page load
```

---

## Atalhos VSCode Úteis

| Ação | Atalho |
|------|--------|
| Abrir terminal | Ctrl + ` |
| Formatar código | Shift + Alt + F |
| Buscar arquivo | Ctrl + P |
| Buscar texto | Ctrl + Shift + F |
| Renomear símbolo | F2 |
| Go to definition | F12 |

---

## NPM Scripts Customizados

Adicione ao `package.json`:

```json
"scripts": {
  "db:studio": "npx prisma studio",
  "db:reset": "rm -f prisma/dev.db && npm run prisma:push && npm run prisma:seed",
  "db:backup": "cp prisma/dev.db prisma/backup_$(date +%Y%m%d).db"
}
```

Uso:
```bash
npm run db:studio
npm run db:reset
npm run db:backup
```

---

## Dicas de Produtividade

1. **Use Prisma Studio** para visualizar/editar dados rapidamente
2. **Hot reload** do Next.js salva tempo (mudanças aparecem automaticamente)
3. **TypeScript** ajuda a evitar erros em tempo de desenvolvimento
4. **ESLint** mantém código limpo e consistente
5. **Git commits frequentes** ajudam a trackear mudanças

---

## Recursos Adicionais

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Dica:** Adicione este arquivo aos favoritos para acesso rápido! 📌


