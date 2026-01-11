import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Agosto 2025 - Geovana (excluindo canceladas)
const vendasAgosto = [
  { dia: 15, mes: 8, ano: 2025, nome: 'Deivid', email: 'deivid.chiaretti@gmail.com', valor: 1998.00, observacao: 'Data estimada' },
  { dia: 15, mes: 8, ano: 2025, nome: 'Gabriel Arcanjo', email: 'Arcanjosud16@gmail.com', valor: 1998.00, observacao: 'Data estimada' },
  { dia: 15, mes: 8, ano: 2025, nome: 'Antonio', email: 'antoniocurcion@gmail.com', valor: 2698.00, observacao: 'Data estimada' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasAgosto.length} vendas de Agosto/2025 para ${nomeVendedor}...`)
  console.log(`⚠️  2 vendas canceladas (R$ 0,00) foram excluídas`)

  const vendedor = await prisma.vendedor.findUnique({
    where: { nome: nomeVendedor }
  })

  if (!vendedor) {
    console.error(`❌ Vendedor ${nomeVendedor} não encontrado!`)
    return
  }

  console.log(`✅ Vendedor encontrado: ${vendedor.nome} (${vendedor.cargo})`)

  let importadas = 0
  let erros = 0

  for (const venda of vendasAgosto) {
    try {
      const dataVenda = new Date(venda.ano, venda.mes - 1, venda.dia, 12, 0, 0)

      await prisma.venda.create({
        data: {
          vendedorId: vendedor.id,
          data: dataVenda,
          nome: venda.nome,
          email: venda.email,
          valor: venda.valor,
          status: 'CONFIRMADA',
          observacao: venda.observacao
        }
      })

      importadas++
      console.log(`✅ Venda ${importadas}: ${venda.nome} - R$ ${venda.valor.toFixed(2)} (${venda.dia}/08/2025)`)
    } catch (error) {
      erros++
      console.error(`❌ Erro ao importar ${venda.nome}:`, error)
    }
  }

  console.log('')
  console.log('📊 Resumo da Importação:')
  console.log(`✅ Vendas importadas: ${importadas}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`💰 Total faturado: R$ ${vendasAgosto.reduce((sum, v) => sum + v.valor, 0).toFixed(2)}`)
  console.log('')
  console.log('🎉 Importação concluída!')
}

const nomeVendedor = process.argv[2] || 'Geovana'

importarVendas(nomeVendedor)
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })






