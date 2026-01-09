import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Vendas de Setembro 2025 (+ 2 vendas de início de outubro)
const vendasSetembro = [
  { dia: 1, mes: 9, ano: 2025, nome: 'Dionizio Oliveira Neto', email: 'dionizio.oliveira.neto@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 1, mes: 9, ano: 2025, nome: 'Giovanni Tiepolo', email: 'giovanni.b.tiepolo@gmail.com', valor: 2398.40, observacao: '' },
  { dia: 5, mes: 9, ano: 2025, nome: 'Felipe Ribeiro', email: 'feliperibeiropanda@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 5, mes: 9, ano: 2025, nome: 'Pablo', email: 'pablofcr@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 6, mes: 9, ano: 2025, nome: 'Fabio Carvalho', email: 'fabio.eng.carvalho@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 8, mes: 9, ano: 2025, nome: 'Juliano', email: 'julianosakai@gmail.com', valor: 2398.40, observacao: '' },
  { dia: 9, mes: 9, ano: 2025, nome: 'Marcos Isodoro', email: 'l2w3top@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 10, mes: 9, ano: 2025, nome: 'Antônio Nascimento Nascimento', email: 'nego2022fr@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 18, mes: 9, ano: 2025, nome: 'Elton Brito', email: 'elton_brito_psn@hotmail.com', valor: 1499.00, observacao: '' },
  { dia: 18, mes: 9, ano: 2025, nome: 'Alvaro Bernardo', email: 'alvarosaraiva18@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 19, mes: 9, ano: 2025, nome: 'João Paulo Aníbal de Souza', email: 'joaopauloanibaldesouza@protonmail.com', valor: 1998.00, observacao: '' },
  { dia: 22, mes: 9, ano: 2025, nome: 'Fernando Alves', email: 'fernandoalves.pef@gmail.com', valor: 1499.00, observacao: '' },
  { dia: 23, mes: 9, ano: 2025, nome: 'Fernando Amano', email: 'famano@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 24, mes: 9, ano: 2025, nome: 'Marcello', email: 'marcellocappio@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 24, mes: 9, ano: 2025, nome: 'Yves Mourão Félix', email: 'yvesfelix.88@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 24, mes: 9, ano: 2025, nome: 'Junior Campos', email: 'billy.jrc@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 24, mes: 9, ano: 2025, nome: 'Arnold Bernardi', email: 'arnoldbernardi13@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 29, mes: 9, ano: 2025, nome: 'Eric Cabral', email: 'eric_cabral_@hotmail.com', valor: 1998.00, observacao: '' },
  { dia: 29, mes: 9, ano: 2025, nome: 'Bruno Teodoro Lopes', email: 'brunoteodoro17091@gmail.com', valor: 1998.00, observacao: '' },
  { dia: 30, mes: 9, ano: 2025, nome: 'Lucas Piqueras', email: 'lucaspiqueras0420@gmail.com', valor: 1998.00, observacao: '' },
  // 2 vendas de início de outubro (incluídas aqui)
  { dia: 2, mes: 10, ano: 2025, nome: 'Adriano Fernandes de Carvalho', email: 'adriano_carvalho7@hotmail.com', valor: 1998.00, observacao: '' },
  { dia: 3, mes: 10, ano: 2025, nome: 'Leonardo Monteiro', email: 'garethleo7@gmail.com', valor: 1499.00, observacao: '' },
]

async function importarVendas(nomeVendedor: string) {
  console.log(`🚀 Importando ${vendasSetembro.length} vendas de Setembro/2025 para ${nomeVendedor}...`)
  console.log(`ℹ️  Incluindo 2 vendas de início de Outubro (02-10 e 03-10)`)

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
      console.log(`✅ Venda ${importadas}: ${venda.nome} - R$ ${venda.valor.toFixed(2)} (${venda.dia}/${venda.mes}/2025)`)
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

