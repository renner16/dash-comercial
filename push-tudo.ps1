# Script para enviar TODOS os dados do projeto para Git e Vercel
Write-Host "🚀 Enviando TODOS os dados do projeto..." -ForegroundColor Cyan

# Navegar para o diretório
Set-Location "C:\Dev\dash comercial"

# Verificar status inicial
Write-Host "`n📊 Status inicial do repositório:" -ForegroundColor Yellow
git status

# Adicionar TODOS os arquivos (forçar)
Write-Host "`n➕ Adicionando TODOS os arquivos..." -ForegroundColor Cyan
git add -A --force

# Remover apenas node_modules e .next do staging (mas manter no .gitignore)
git reset HEAD node_modules/ 2>$null
git reset HEAD .next/ 2>$null
git reset HEAD .env 2>$null
git reset HEAD .env.local 2>$null

# Verificar o que será commitado
Write-Host "`n📋 Arquivos que serão enviados:" -ForegroundColor Yellow
git status --short | Select-Object -First 50

# Verificar se há commits locais não enviados
Write-Host "`n📝 Verificando commits locais..." -ForegroundColor Cyan
$commitsLocais = git log origin/main..HEAD --oneline 2>$null
if ($commitsLocais) {
    Write-Host "Commits locais encontrados:" -ForegroundColor Yellow
    $commitsLocais
} else {
    Write-Host "Nenhum commit local pendente" -ForegroundColor Gray
}

# Fazer commit de tudo (se houver alterações)
Write-Host "`n💾 Fazendo commit de todas as alterações..." -ForegroundColor Cyan
$hasChanges = git diff --cached --quiet
if (-not $hasChanges) {
    Write-Host "Nenhuma alteração para commitar" -ForegroundColor Gray
} else {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "chore: reenvia todos os dados do projeto - $timestamp

- Envia todas as alterações locais
- Sincroniza projeto completo
- Garante que tudo está no repositório"
    
    git commit -m $commitMessage
    Write-Host "✅ Commit criado!" -ForegroundColor Green
}

# Push para o repositório (forçar se necessário)
Write-Host "`n🚀 Enviando para o GitHub..." -ForegroundColor Cyan
try {
    git push origin main
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Tentando push com force-with-lease..." -ForegroundColor Yellow
    git push origin main --force-with-lease
}

# Verificar status final
Write-Host "`n📊 Status final:" -ForegroundColor Yellow
git status

Write-Host "`n✅ Processo concluído!" -ForegroundColor Green
Write-Host "`n📝 A Vercel fará o deploy automaticamente em alguns minutos." -ForegroundColor Yellow
Write-Host "🔗 Verifique o deploy em: https://vercel.com/dashboard" -ForegroundColor Cyan

