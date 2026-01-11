import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dados da planilha do Renner
const vendasRenner = [
  { email: 'izicripto@gmail.com', valor: 2607.30 },
  { email: 'rodrigues.rribeiro@gmail.com', valor: 1448.50 },
  { email: 'Watson.mauricio88@gmail.com', valor: 1448.50 },
  { email: 'lulochaumont@gmail.com', valor: 1448.50 },
  { email: 'contato@rafaelmariano.com.br', valor: 2317.60 },
  { email: 'alepiza633@gmail.com', valor: 2607.30 },
  { email: 'Vbsalheb@gmail.com', valor: 1448.50 },
  { email: 't4ygr4.g@gmail.com', valor: 1448.50 },
  { email: 'unificasolutions@gmail.com', valor: 1448.50 },
  { email: 'kadu0790@gmail.com', valor: 1448.50 },
  { email: 'yan00919@gmail.com', valor: 2297.00 },
  { email: 'yanmatiasalm@gmail.com', valor: 2317.60 },
  { email: 'luis_fernando_690@hotmail.com', valor: 1448.50 },
  { email: 'cruze2013caxias@gmail.com', valor: 2317.60 },
  { email: 'Joaobss.almeida@gmail.com', valor: 1448.50 },
  { email: 'caiornbusines@gmail.com', valor: 2398.40 },
  { email: 'web3cryptoshirts@gmail.com', valor: 2027.90 },
  { email: 'gestorfinanceiroar@gmail.com', valor: 1448.50 },
  { email: 'lojaorganica@gmail.com', valor: 1319.12 },
  { email: 'paulomelocripto@gmail.com', valor: 1499.00 },
  { email: 'vendasmalu23@gmail.com', valor: 1499.00 },
  { email: 'arthuralvesleonel99@gmail.com', valor: 1499.00 },
  { email: 'pedronery90@gmail.com', valor: 1499.00 },
  { email: 'dubcommedia@gmail.com', valor: 2998.00 },
  { email: 'caioserafim98@gmail.com', valor: 2698.20 },
]

async function importarVendas() {
  console.log('🚀 Iniciando importação de vendas do Renner...')

  // Buscar o vendedor Renner
  const renner = await prisma.vendedor.findUnique({
    where: { nome: 'Renner' }
  })

  if (!renner) {
    console.error('❌ Vendedor Renner não encontrado!')
    return
  }

  console.log(`✅ Vendedor encontrado: ${renner.nome} (ID: ${renner.id})`)

  // Data base: janeiro de 2025 (mês atual)
  const hoje = new Date()
  const mesAtual = hoje.getMonth() // Janeiro = 0
  const anoAtual = hoje.getFullYear()

  let importadas = 0
  let erros = 0

  for (const venda of vendasRenner) {
    try {
      // Pular vendas com valor 0
      if (venda.valor === 0) {
        console.log(`⏭️  Pulando venda com valor R$ 0,00`)
        continue
      }

      // Distribuir as vendas ao longo do mês (dias 1-25)
      const dia = (importadas % 25) + 1
      const dataVenda = new Date(anoAtual, mesAtual, dia, 12, 0, 0)

      // Extrair nome do email (parte antes do @)
      const nomeCliente = venda.email.split('@')[0]
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ')

      await prisma.venda.create({
        data: {
          vendedorId: renner.id,
          data: dataVenda,
          nome: nomeCliente || venda.email,
          email: venda.email,
          valor: venda.valor,
          status: 'CONFIRMADA',
          observacao: 'Importado da planilha Google Sheets'
        }
      })

      importadas++
      console.log(`✅ Venda ${importadas}: ${nomeCliente} - R$ ${venda.valor.toFixed(2)}`)
    } catch (error) {
      erros++
      console.error(`❌ Erro ao importar ${venda.email}:`, error)
    }
  }

  console.log('')
  console.log('📊 Resumo da Importação:')
  console.log(`✅ Vendas importadas: ${importadas}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`💰 Total faturado: R$ ${vendasRenner.reduce((sum, v) => sum + v.valor, 0).toFixed(2)}`)
  console.log('')
  console.log('🎉 Importação concluída!')
}

importarVendas()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })






