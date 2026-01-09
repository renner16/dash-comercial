import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Novembro 2025
const vendasNovembro = [
  { dia: 5, mes: 11, ano: 2025, nome: 'Marcelo', email: 'difoggijuniormarcelo@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 10, mes: 11, ano: 2025, nome: 'Vinícius Junqueira Guimarães', email: 'vini.yep@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 11, mes: 11, ano: 2025, nome: 'Arcanjo YH', email: 'arcanjopil@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 13, mes: 11, ano: 2025, nome: 'Emanuel Reais', email: 'emanuelreissantos12@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 14, mes: 11, ano: 2025, nome: 'Maria do Carmo', email: 'carmodias@uol.com.br', valor: 1998.00, observacao: '' },
  { dia: 18, mes: 11, ano: 2025, nome: 'Frederico Ribeiro', email: 'fredrg@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 18, mes: 11, ano: 2025, nome: 'Claudio de Quadra', email: 'claudio.quadra@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 21, mes: 11, ano: 2025, nome: 'Gustavo', email: 'gucoelho@gmail.com', valor: 1998.00, observacao: 'desc 1k' },
  { dia: 22, mes: 11, ano: 2025, nome: 'Anselmo', email: 'anselmo.endlich@gmail.com', valor: 1499.00, observacao: 'black50' },
  { dia: 22, mes: 11, ano: 2025, nome: 'Arcanjo', email: 'arcanjopil@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Julio', email: 'juliobalsini@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Thais', email: 'taicarvalhos@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Alan', email: 'arpuntim@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Daniel', email: 'danielcristhian.lourenco@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Marcos', email: 'mscheide@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 23, mes: 11, ano: 2025, nome: 'Victor', email: 'vbsalheb@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 24, mes: 11, ano: 2025, nome: 'Luis', email: 'luiscruz.anuncios.@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 24, mes: 11, ano: 2025, nome: 'Joao', email: 'joaopedrogfc@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 24, mes: 11, ano: 2025, nome: 'Cicero', email: 'silva.cicero@hotmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 24, mes: 11, ano: 2025, nome: 'Madson', email: 'madson.l.magalhaes@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 24, mes: 11, ano: 2025, nome: 'Thiago', email: 'thdigitalhighway@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 24, mes: 11, ano: 2025, nome: 'Luis', email: 'lhcs10@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 25, mes: 11, ano: 2025, nome: 'Elton', email: 'elton_brito_psn@hotmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 25, mes: 11, ano: 2025, nome: 'Waldemir', email: 'wfarias@urjasocial.com.br', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 25, mes: 11, ano: 2025, nome: 'Ramon', email: 'ramoncittadin085@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 25, mes: 11, ano: 2025, nome: 'Frederico Ribeiro', email: 'fredrg@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 26, mes: 11, ano: 2025, nome: 'Pedro', email: 'dutracripto1@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 26, mes: 11, ano: 2025, nome: 'Ricardo', email: 'ricardoicmbh2@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 26, mes: 11, ano: 2025, nome: 'Matheus', email: 'matheushenriqueoliveira0103@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 27, mes: 11, ano: 2025, nome: 'Dani do Egyto', email: 'daniegyto@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 27, mes: 11, ano: 2025, nome: 'Carol', email: 'caroldweb3@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 27, mes: 11, ano: 2025, nome: 'Andre', email: 'andrelucasbs@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 27, mes: 11, ano: 2025, nome: 'John', email: 'jhsfelix@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 27, mes: 11, ano: 2025, nome: 'Patrick', email: 'pmdiniz95@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 27, mes: 11, ano: 2025, nome: 'Tales', email: 'talesfavaaconcelos@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 27, mes: 11, ano: 2025, nome: 'Luis', email: 'luis_fernando_690@hotmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 28, mes: 11, ano: 2025, nome: 'Eliandro', email: 'elitjader@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 28, mes: 11, ano: 2025, nome: 'Barone', email: 'oi@barone.club', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 28, mes: 11, ano: 2025, nome: 'Benedito', email: 'beneditofljunior@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 28, mes: 11, ano: 2025, nome: 'Guilherme', email: 'gsalvador89@gmail.com', valor: 1499.00, observacao: 'black50' },
  { dia: 29, mes: 11, ano: 2025, nome: 'Marciano', email: 'marcianosrr@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 29, mes: 11, ano: 2025, nome: 'Genaro', email: 'delgenarocripto@gmail.com', valor: 1499.00, observacao: 'black50' },
  { dia: 29, mes: 11, ano: 2025, nome: 'Hudson', email: 'hudsonpinheiro39@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
  { dia: 29, mes: 11, ano: 2025, nome: 'Sérgio', email: '1cbrownsocialmedia@gmail.com', valor: 1997.00, observacao: 'membrofundador' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasNovembro.length} vendas de Novembro/2025 para ${nomeVendedor}...`)

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



