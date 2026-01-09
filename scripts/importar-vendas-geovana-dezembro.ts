import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Dezembro 2025 - Geovana (dados incompletos - usando valores padrão)
const vendasDezembro = [
  { dia: 15, mes: 12, ano: 2025, nome: 'João Ricardo', email: 'joaoricardojori@gmail.com', valor: 1998.00, observacao: 'Data estimada' },
  { dia: 15, mes: 12, ano: 2025, nome: 'Luís Otávio', email: 'luisotavio@example.com', valor: 1998.00, observacao: 'Email gerado - Data estimada' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasDezembro.length} vendas de Dezembro/2025 para ${nomeVendedor}...`)
  console.log(`⚠️  Alguns dados estavam incompletos e foram preenchidos com valores padrão`)

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

  for (const venda of vendasDezembro) {
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
      console.log(`✅ Venda ${importadas}: ${venda.nome} - R$ ${venda.valor.toFixed(2)} (${venda.dia}/12/2025)`)
    } catch (error) {
      erros++
      console.error(`❌ Erro ao importar ${venda.nome}:`, error)
    }
  }

  console.log('')
  console.log('📊 Resumo da Importação:')
  console.log(`✅ Vendas importadas: ${importadas}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`💰 Total faturado: R$ ${vendasDezembro.reduce((sum, v) => sum + v.valor, 0).toFixed(2)}`)
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

