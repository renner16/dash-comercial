import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Outubro 2025 (excluindo as canceladas)
const vendasOutubro = [
  { dia: 10, mes: 10, ano: 2025, nome: 'SagazInvestor', email: 'msagazcontato01@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 16, mes: 10, ano: 2025, nome: 'Beatriz', email: 'beatriz.levy@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 16, mes: 10, ano: 2025, nome: 'João Vitor', email: 'jvsf030909@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 16, mes: 10, ano: 2025, nome: 'Luca Guedes Pereira de Mello', email: 'lucaguedesimoveis@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Jarder Rodrigues', email: 'jader.alessander@gmail.com', valor: 2098.60, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Andre Porto', email: 'enderecodoandre@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Josileudo Rodrigues', email: 'bileujb@hotmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Gabriel Bordonal', email: 'vasculargabriel@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Jorge Cardoso', email: 'jorgecardoso@sapo.pt', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Helquer Zúcari', email: 'metalhjsz@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Henrique Carvalho', email: 'carvalhomamudhenrique@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Claudio Velasco Junior', email: 'velascojunior82@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 10, ano: 2025, nome: 'Marcos', email: 'mscheide@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 22, mes: 10, ano: 2025, nome: 'Miqueias Ruben dos Reis Brito', email: 'miqueiasokings@gmail.com', valor: 1424.05, observacao: '' },
  { dia: 22, mes: 10, ano: 2025, nome: 'Alexandre Azeredo', email: 'azeredotech@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 22, mes: 10, ano: 2025, nome: 'Evandro Carvalho', email: 'vanndopc@gmail.com', valor: 1424.05, observacao: '' },
  { dia: 22, mes: 10, ano: 2025, nome: 'vne2299@gmail.com', email: 'vne2299@gmail.com', valor: 2998.00, observacao: '' },
  { dia: 23, mes: 10, ano: 2025, nome: 'Jane Viana', email: 'passeidiretofmu2024@gmail.com', valor: 1499.00, observacao: '+5566992536683' },
  { dia: 26, mes: 10, ano: 2025, nome: 'Orlando Maximo', email: 'orlandomaximo@outlook.com', valor: 1499.00, observacao: '' },
  { dia: 31, mes: 10, ano: 2025, nome: 'achilles', email: 'achilles@karga.rio', valor: 2498.00, observacao: '21997459350' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasOutubro.length} vendas de Outubro/2025 para ${nomeVendedor}...`)
  console.log(`⚠️  2 vendas canceladas foram excluídas (Renan Santos e Luiz Felipe)`)

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

