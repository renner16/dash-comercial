#!/bin/bash
# Script de Instalação com Neon - Cultura Builder Sales Ops
# Para Linux/Mac

echo "======================================"
echo "  Cultura Builder | Sales Ops Setup  "
echo "  com Neon Database                   "
echo "======================================"
echo ""

# Verificar Node.js
echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js não encontrado. Instale Node.js 18+ antes de continuar."
    echo "  Download: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js encontrado: $NODE_VERSION"
echo ""

# Verificar .env
echo "Verificando configuração do banco..."
if [ ! -f .env ]; then
    echo "✗ Arquivo .env não encontrado!"
    echo ""
    echo "Você precisa configurar o Neon primeiro:"
    echo "1. Acesse https://neon.tech/"
    echo "2. Crie um projeto"
    echo "3. Copie a Connection String"
    echo "4. Crie arquivo .env com:"
    echo '   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"'
    echo ""
    echo "📖 Guia completo: SETUP_NEON.md"
    exit 1
fi

if ! grep -q "DATABASE_URL" .env; then
    echo "✗ DATABASE_URL não encontrada no .env!"
    echo "  Adicione a connection string do Neon"
    exit 1
fi

echo "✓ Arquivo .env configurado"
echo ""

# Instalar dependências
echo "Instalando dependências..."
npm install
if [ $? -ne 0 ]; then
    echo "✗ Erro ao instalar dependências"
    exit 1
fi
echo "✓ Dependências instaladas"
echo ""

# Configurar banco de dados
echo "Criando tabelas no Neon..."
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
    echo "✗ Erro ao configurar banco de dados"
    echo "  Verifique se a DATABASE_URL está correta"
    exit 1
fi
echo "✓ Tabelas criadas"
echo ""

# Popular com dados iniciais
echo "Populando com dados iniciais..."
npm run prisma:seed
if [ $? -ne 0 ]; then
    echo "✗ Erro ao popular banco de dados"
    exit 1
fi
echo "✓ Dados iniciais carregados"
echo ""

echo "======================================"
echo "  ✓ Instalação concluída com sucesso! "
echo "======================================"
echo ""
echo "Para iniciar o servidor:"
echo "  npm run dev"
echo ""
echo "Acesse: http://localhost:3000"
echo ""
echo "💡 Dica: Use 'npx prisma studio' para visualizar o banco"
echo ""

