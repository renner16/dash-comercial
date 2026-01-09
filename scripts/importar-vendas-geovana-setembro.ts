import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Setembro 2025 - Geovana
const vendasSetembro = [
  { dia: 21, mes: 9, ano: 2025, nome: 'Alexandre', email: 'aoalves@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 22, mes: 9, ano: 2025, nome: 'Ulysses', email: '21991415624@example.com', valor: 1998.00, observacao: 'Tel: 21991415624' },
  { dia: 29, mes: 9, ano: 2025, nome: 'Leandro', email: 'leandromj2@gmail.com', valor: 1498.00, observacao: '' },
  { dia: 29, mes: 9, ano: 2025, nome: 'Eros', email: 'erosoliveira98@hotmail.com', valor: 1998.00, observacao: '' },
  { dia: 29, mes: 9, ano: 2025, nome: 'Dr Felipe', email: 'drfelipecouto@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 29, mes: 9, ano: 2025, nome: 'Lucas lima', email: 'lucaslima.seve@gmail.com', valor: 1498.00, observacao: '' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasSetembro.length} vendas de Setembro/2025 para ${nomeVendedor}...`)

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

  for (const venda of vendasSetembro) {
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
      console.log(`✅ Venda ${importadas}: ${venda.nome} - R$ ${venda.valor.toFixed(2)} (${venda.dia}/09/2025)`)
    } catch (error) {
      erros++
      console.error(`❌ Erro ao importar ${venda.nome}:`, error)
    }
  }

  console.log('')
  console.log('📊 Resumo da Importação:')
  console.log(`✅ Vendas importadas: ${importadas}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`💰 Total faturado: R$ ${vendasSetembro.reduce((sum, v) => sum + v.valor, 0).toFixed(2)}`)
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



