#!/bin/bash
# Script de Instalação Automatizada - Cultura Builder Sales Ops
# Para Linux/Mac

echo "======================================"
echo "  Cultura Builder | Sales Ops Setup  "
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
echo "Configurando banco de dados..."
npm run prisma:push
if [ $? -ne 0 ]; then
    echo "✗ Erro ao configurar banco de dados"
    exit 1
fi
echo "✓ Banco de dados configurado"
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


