# Script para sincronizar todas as alterações com Git e Vercel
Write-Host "🔄 Verificando alterações..." -ForegroundColor Cyan

# Verificar status
Write-Host "`n📊 Status do repositório:" -ForegroundColor Yellow
git status --short

# Adicionar todas as alterações (exceto node_modules e .env)
Write-Host "`n➕ Adicionando alterações..." -ForegroundColor Cyan
git add -A
git reset HEAD node_modules
git reset HEAD .next
git reset HEAD .env
git reset HEAD .env.local

# Verificar o que será commitado
Write-Host "`n📋 Arquivos que serão commitados:" -ForegroundColor Yellow
git status --short

# Fazer commit
Write-Host "`n💾 Fazendo commit..." -ForegroundColor Cyan
$commitMessage = "chore: sincroniza todas as alterações pendentes

- Atualiza todas as modificações locais
- Sincroniza com repositório remoto"
git commit -m $commitMessage

# Push para o repositório
Write-Host "`n🚀 Enviando para o GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "`n✅ Sincronização concluída!" -ForegroundColor Green
Write-Host "`n📝 A Vercel fará o deploy automaticamente em alguns minutos." -ForegroundColor Yellow

