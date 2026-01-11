import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Dezembro 2025
const vendasDezembro = [
  { dia: 10, mes: 12, ano: 2025, nome: 'Francisco', email: '59antares7@gmail.com', valor: 1998.00, observacao: 'cupom 1k' },
  { dia: 16, mes: 12, ano: 2025, nome: 'Luiz', email: 'luizpedroandrade1@gmail.com', valor: 4997.00, observacao: 'cupom 1k' },
  { dia: 20, mes: 12, ano: 2025, nome: 'Luis', email: 'advlhmm@gmail.com', valor: 1998.00, observacao: 'cupom 1k' },
  { dia: 22, mes: 12, ano: 2025, nome: 'Thiago', email: 'mobile.thiagosobral@gmail.com', valor: 1998.00, observacao: 'cupom 1k' },
  { dia: 23, mes: 12, ano: 2025, nome: 'Andreza', email: 'negociosnavida@gmail.com', valor: 1499.00, observacao: 'YH' },
  { dia: 30, mes: 12, ano: 2025, nome: 'Vinicius', email: 'vini.1411@gmail.com', valor: 2998.50, observacao: '50% off' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasDezembro.length} vendas de Dezembro/2025 para ${nomeVendedor}...`)

  // Buscar o vendedor
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

// Pegar nome do vendedor do argumento da linha de comando
const nomeVendedor = process.argv[2] || 'Renner'

importarVendas(nomeVendedor)
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })






