import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limparVendas() {
  console.log('🗑️  Iniciando limpeza de dados...')

  try {
    // Deletar todos os relatórios diários
    const relatoriosDeletados = await prisma.relatoriosDiarios.deleteMany({})
    console.log(`✅ ${relatoriosDeletados.count} relatórios diários deletados`)

    // Deletar todas as vendas
    const vendasDeletadas = await prisma.venda.deleteMany({})
    console.log(`✅ ${vendasDeletadas.count} vendas deletadas`)

    console.log('')
    console.log('🎉 Banco de dados limpo com sucesso!')
    console.log('✅ Vendedores mantidos: Geovana, Renner, Kelvin, Matheus')
    console.log('📊 Sistema pronto para novos dados')
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error)
    throw error
  }
}

limparVendas()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })



