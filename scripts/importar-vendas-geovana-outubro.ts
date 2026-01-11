import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Outubro 2025 - Geovana (incluindo 2 que estavam na lista de setembro)
const vendasOutubro = [
  { dia: 10, mes: 10, ano: 2025, nome: 'Carlos', email: 'Chesteves@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 10, mes: 10, ano: 2025, nome: 'Mauro', email: 'Vittafotovoltaico@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Leonardo da Rosa Garcia', email: 'leonardodarosagarciag@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Daniel Barroso Medeiros de Oliveira', email: 'danielbmedeiros@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Ricardo', email: 'ricaponciano@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Glaucia', email: 'glabortolon@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Rubens Memari Jr', email: 'rubens10gm@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 24, mes: 10, ano: 2025, nome: 'Luca Guedes', email: 'lucaguedesimoveis@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 30, mes: 10, ano: 2025, nome: 'Alexandre Kazuo Funaki', email: 'alexandrefunaki@hotmail.com', valor: 1998.00, observacao: '' },
  { dia: 30, mes: 10, ano: 2025, nome: 'Jonatas Mascarenhas', email: 'jonataspowerful@gmail.com', valor: 1998.00, observacao: '' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasOutubro.length} vendas de Outubro/2025 para ${nomeVendedor}...`)

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

  for (const venda of vendasOutubro) {
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
      console.log(`✅ Venda ${importadas}: ${venda.nome} - R$ ${venda.valor.toFixed(2)} (${venda.dia}/10/2025)`)
    } catch (error) {
      erros++
      console.error(`❌ Erro ao importar ${venda.nome}:`, error)
    }
  }

  console.log('')
  console.log('📊 Resumo da Importação:')
  console.log(`✅ Vendas importadas: ${importadas}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`💰 Total faturado: R$ ${vendasOutubro.reduce((sum, v) => sum + v.valor, 0).toFixed(2)}`)
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






