import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Agosto 2025 (excluindo a cancelada)
const vendasAgosto = [
  { dia: 6, mes: 8, ano: 2025, nome: 'Alexandre Miranda', email: 'alexandre.jcm@gmail.com', valor: 2998.00, observacao: '' },
  { dia: 8, mes: 8, ano: 2025, nome: 'Polyana de Jesus Jorge', email: 'polyanajulia@hotmail.com', valor: 1499.00, observacao: '' },
  { dia: 9, mes: 8, ano: 2025, nome: 'thiagowbj@gmail.com', email: 'thiagowbj@gmail.com', valor: 2998.00, observacao: '' },
  { dia: 11, mes: 8, ano: 2025, nome: 'Mauricio Braga', email: 'oftalmovasco1@gmail.com', valor: 2998.00, observacao: '' },
  { dia: 12, mes: 8, ano: 2025, nome: 'Ricardo Cavadas', email: 'ricardosilvacavadas@gmail.com', valor: 2098.60, observacao: '' },
  { dia: 13, mes: 8, ano: 2025, nome: 'Elizio Alves da Silva neto', email: 'Netoalves0805@Gmail.com', valor: 1499.00, observacao: '' },
  { dia: 14, mes: 8, ano: 2025, nome: 'Dani do Egyto', email: 'daniegyto@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 15, mes: 8, ano: 2025, nome: 'LEANDRO NARDI', email: 'leleandronardi@gmail.com', valor: 2098.60, observacao: '' },
  { dia: 20, mes: 8, ano: 2025, nome: 'Eliandro Tjader', email: 'elitjader@gmail.com', valor: 1798.80, observacao: '' },
  { dia: 21, mes: 8, ano: 2025, nome: 'Paulo Borges', email: 'scavabm@gmail.com', valor: 2098.60, observacao: '' },
  { dia: 22, mes: 8, ano: 2025, nome: 'Affonso Celso Moraes Sampaio Junior', email: 'affonsocelso.adv@gmail.com', valor: 2698.20, observacao: '' },
  { dia: 22, mes: 8, ano: 2025, nome: 'Ricardo Ribeiro', email: 'ricardoicmbh2@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 22, mes: 8, ano: 2025, nome: 'Cyro Eduardo', email: 'maiacyro@gmail.com', valor: 2398.40, observacao: '' },
  { dia: 23, mes: 8, ano: 2025, nome: 'Cristiano Machado Inacio', email: 'cristianomi@icloud.com', valor: 1499.00, observacao: '' },
  { dia: 26, mes: 8, ano: 2025, nome: 'Gabriela Fortunato', email: 'gabi.fortunato.14@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 29, mes: 8, ano: 2025, nome: 'Anderson Bueno', email: 'buenoanderson1999@gmail.com', valor: 1499.00, observacao: '' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasAgosto.length} vendas de Agosto/2025 para ${nomeVendedor}...`)
  console.log(`⚠️  1 venda cancelada foi excluída (Yago Abra - R$ 0,00)`)

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

