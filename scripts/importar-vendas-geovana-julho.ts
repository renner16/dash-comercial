import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Julho 2025 - Geovana (dados incompletos - usando valores padrão)
const vendasJulho = [
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'ranchodoriacho@gmail.com', valor: 1448.50, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'danilotavio@icloud.com', valor: 1448.50, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'danyerogers4@gmail.com', valor: 1448.50, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'saviobraga84@gmail.com', valor: 1499.00, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'andersonmcv@gmail.com', valor: 1448.50, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'fi.frazao@gmail.com', valor: 1499.00, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'aes.sobreira@gmail.com', valor: 1499.00, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'flavioenf2012@hotmail.com', valor: 1499.00, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Cliente', email: 'mariagabiarg@gmail.com', valor: 2698.20, observacao: 'Data estimada - Nome não informado' },
  { dia: 15, mes: 7, ano: 2025, nome: 'Leonardo', email: 'leonardo@beagleship.com.br', valor: 2998.00, observacao: 'Data estimada' },
  { dia: 23, mes: 7, ano: 2025, nome: 'Cliente', email: 'mktanabe@gmail.com', valor: 1499.00, observacao: 'Assinou RC + CB' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasJulho.length} vendas de Julho/2025 para ${nomeVendedor}...`)
  console.log(`⚠️  Dados incompletos (nomes e datas) foram preenchidos com valores padrão`)

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

  for (const venda of vendasJulho) {
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
      console.log(`✅ Venda ${importadas}: ${venda.nome} - R$ ${venda.valor.toFixed(2)} (${venda.dia}/07/2025)`)
    } catch (error) {
      erros++
      console.error(`❌ Erro ao importar ${venda.nome}:`, error)
    }
  }

  console.log('')
  console.log('📊 Resumo da Importação:')
  console.log(`✅ Vendas importadas: ${importadas}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`💰 Total faturado: R$ ${vendasJulho.reduce((sum, v) => sum + v.valor, 0).toFixed(2)}`)
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

