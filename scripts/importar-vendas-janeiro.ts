import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Janeiro 2026
const vendasJaneiro = [
  { dia: 6, mes: 1, ano: 2026, nome: 'Fred Cotta', email: 'fredcottatec@gmail.com', valor: 1499.00, observacao: 'feliz2026' },
  { dia: 6, mes: 1, ano: 2026, nome: 'Jonatas Souza', email: 'jonatassouzadarosa@gmail.com', valor: 1499.00, observacao: 'feliz2026' },
  { dia: 8, mes: 1, ano: 2026, nome: 'Tiago Fernandes', email: 'fliszt12@gmail.com', valor: 1499.00, observacao: 'feliz2026' },
  { dia: 8, mes: 1, ano: 2026, nome: 'Luis', email: 'luislerdslards@gmail.com', valor: 1998.00, observacao: '1k' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasJaneiro.length} vendas de Janeiro/2026 para ${nomeVendedor}...`)

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

  for (const venda of vendasJaneiro) {
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
      console.log(`✅ Venda ${importadas}: ${venda.nome} - R$ ${venda.valor.toFixed(2)} (${venda.dia}/01/2026)`)
    } catch (error) {
      erros++
      console.error(`❌ Erro ao importar ${venda.nome}:`, error)
    }
  }

  console.log('')
  console.log('📊 Resumo da Importação:')
  console.log(`✅ Vendas importadas: ${importadas}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`💰 Total faturado: R$ ${vendasJaneiro.reduce((sum, v) => sum + v.valor, 0).toFixed(2)}`)
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

