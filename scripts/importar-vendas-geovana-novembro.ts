import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Novembro 2025 - Geovana
const vendasNovembro = [
  { dia: 20, mes: 11, ano: 2025, nome: 'Gabriel', email: 'gabrieldaytrader@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Francisco', email: 'Dr.Francisco.urologia@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Vinicius', email: 'vcaramez@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Pedro', email: 'pedrogiordanocicarelli@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 25, mes: 11, ano: 2025, nome: 'Bárbara', email: 'barbarapcastro@hotmail.com', valor: 1997.00, observacao: '' },
  { dia: 25, mes: 11, ano: 2025, nome: 'Felipe', email: 'fivillegas@gmail.com', valor: 3496.00, observacao: '' },
  { dia: 26, mes: 11, ano: 2025, nome: 'Fabio', email: 'fpedrozoh@hotmail.com', valor: 1997.00, observacao: '' },
  { dia: 26, mes: 11, ano: 2025, nome: 'Marcos', email: 'l2w3top@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 27, mes: 11, ano: 2025, nome: 'Bruno', email: 'reisribeirob@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 28, mes: 11, ano: 2025, nome: 'Arthur', email: 'Kazu.ozassa@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 28, mes: 11, ano: 2025, nome: 'Guilherme', email: 'guilherme@example.com', valor: 1997.00, observacao: 'Tel: 55 81 99161-1090' },
  { dia: 28, mes: 11, ano: 2025, nome: 'Antônio', email: 'acarlosr@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 30, mes: 11, ano: 2025, nome: 'Paulo', email: 'pdantejr@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 30, mes: 11, ano: 2025, nome: 'Laysa', email: 'Laysa.cintra@hotmail.com', valor: 1997.00, observacao: '' },
  { dia: 30, mes: 11, ano: 2025, nome: 'Cliente', email: 'giugorges@gmail.com', valor: 1997.00, observacao: '' },
  { dia: 30, mes: 11, ano: 2025, nome: 'Victor', email: 'Victorsalheb@outlook.com', valor: 1997.00, observacao: '' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasNovembro.length} vendas de Novembro/2025 para ${nomeVendedor}...`)

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

  for (const venda of vendasNovembro) {
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
      console.log(`✅ Venda ${importadas}: ${venda.nome} - R$ ${venda.valor.toFixed(2)} (${venda.dia}/11/2025)`)
    } catch (error) {
      erros++
      console.error(`❌ Erro ao importar ${venda.nome}:`, error)
    }
  }

  console.log('')
  console.log('📊 Resumo da Importação:')
  console.log(`✅ Vendas importadas: ${importadas}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`💰 Total faturado: R$ ${vendasNovembro.reduce((sum, v) => sum + v.valor, 0).toFixed(2)}`)
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



