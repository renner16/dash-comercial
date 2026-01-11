# ⚠️ URGENTE: Enviar Correções para o Git

## ❌ Problema
As correções estão no seu computador, mas NÃO foram enviadas para o GitHub.
A Vercel está usando o código antigo (commit 056c2ca) que tem o erro.

## ✅ Solução: Enviar para o GitHub AGORA

### Método 1: VS Code (MAIS FÁCIL - RECOMENDADO)

1. Abra o VS Code
2. Abra a pasta: `C:\Dev\dash comercial`
3. Pressione `Ctrl+Shift+G` (ou clique no ícone de Source Control no menu lateral)
4. Você verá uma lista de arquivos modificados:
   - ✅ components/geral-dashboard.tsx
   - ✅ components/vendedor-dashboard.tsx
   - ✅ components/header.tsx
   - ✅ components/theme-toggle.tsx
   - ✅ app/page.tsx
   - ✅ package.json
5. Clique no **"+"** ao lado de "Changes" (ou marque cada arquivo)
6. Digite a mensagem: `fix: corrige tipos TypeScript e erros de build`
7. Clique no **ícone de ✓** (Commit)
8. Clique no **ícone de nuvem com seta** (Sync Changes / Push)

### Método 2: Script Automático

1. Abra o Explorador de Arquivos
2. Vá até: `C:\Dev\dash comercial`
3. Clique duas vezes em: **GIT-PUSH.bat**
4. Pronto!

### Método 3: PowerShell Manual

Abra PowerShell e execute:

```powershell
cd "C:\Dev\dash comercial"
git add components/geral-dashboard.tsx components/vendedor-dashboard.tsx components/header.tsx components/theme-toggle.tsx app/page.tsx package.json
git commit -m "fix: corrige tipos TypeScript e erros de build"
git push origin main
```

## 📋 O Que Será Enviado

- ✅ Tipo 'personalizado' adicionado nas funções de gráfico
- ✅ Verificações de window/document para SSR
- ✅ Arquivos recriados (page.tsx, header.tsx)
- ✅ package.json com scripts corretos

## ⏱️ Após Enviar

1. Aguarde 2-3 minutos
2. A Vercel detectará o novo commit
3. Fará o build automaticamente
4. O build deve funcionar agora!

## 🔍 Verificar se Funcionou

1. Acesse: https://github.com/renner16/dash-comercial
2. Veja se o último commit é o seu
3. Acesse: https://vercel.com/dashboard
4. Veja o status do deploy

---

**IMPORTANTE:** As correções só funcionarão na Vercel DEPOIS de enviar para o GitHub!




