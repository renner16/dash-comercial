# 🔧 Correções para Build na Vercel

## Problemas Corrigidos

### 1. Uso de `window` no Server-Side
- **Problema**: `window` não existe durante o build (SSR)
- **Solução**: Adicionada verificação `typeof window !== 'undefined'` em:
  - `components/header.tsx`
  - `app/page.tsx`

### 2. Prisma Client no Build
- **Problema**: Prisma Client precisa ser gerado antes do build
- **Solução**: Adicionado `postinstall` script e `prisma generate` no build

## Arquivos Modificados

1. `components/header.tsx` - Verificação de window
2. `app/page.tsx` - Verificação de window no useEffect
3. `package.json` - Scripts de build atualizados

## Como Testar Localmente

```bash
npm run build
```

Se o build local funcionar, funcionará na Vercel também.

