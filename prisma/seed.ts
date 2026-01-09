import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Criar vendedores fixos
  const vendedores = [
    { nome: 'Geovana', cargo: 'PLENO' },
    { nome: 'Renner', cargo: 'PLENO' },
    { nome: 'Kelvin', cargo: 'PLENO' },
    { nome: 'Matheus', cargo: 'JUNIOR' },
  ]

  for (const vendedor of vendedores) {
    await prisma.vendedor.upsert({
      where: { nome: vendedor.nome },
      update: {},
      create: vendedor,
    })
  }

  console.log('✅ Vendedores criados!')

  // Criar algumas vendas de exemplo (opcional)
  const geovana = await prisma.vendedor.findUnique({ where: { nome: 'Geovana' } })
  const renner = await prisma.vendedor.findUnique({ where: { nome: 'Renner' } })
  const kelvin = await prisma.vendedor.findUnique({ where: { nome: 'Kelvin' } })
  const matheus = await prisma.vendedor.findUnique({ where: { nome: 'Matheus' } })

  if (geovana && renner && kelvin && matheus) {
    // Vendas de exemplo para o mês atual
    const hoje = new Date()
    const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

    const vendasExemplo = [
      {
        vendedorId: geovana.id,
        data: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 5),
        nome: 'Cliente A',
        email: 'clientea@email.com',
        valor: 15000,
        status: 'CONFIRMADA',
        observacao: 'Venda rápida',
      },
      {
        vendedorId: geovana.id,
        data: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 10),
        nome: 'Cliente B',
        email: 'clienteb@email.com',
        valor: 20000,
        status: 'CONFIRMADA',
        observacao: null,
      },
      {
        vendedorId: renner.id,
        data: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 7),
        nome: 'Cliente C',
        email: 'clientec@email.com',
        valor: 18000,
        status: 'CONFIRMADA',
        observacao: null,
      },
      {
        vendedorId: renner.id,
        data: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 12),
        nome: 'Cliente D',
        email: 'cliented@email.com',
        valor: 25000,
        status: 'PENDENTE',
        observacao: 'Aguardando pagamento',
      },
      {
        vendedorId: kelvin.id,
        data: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 8),
        nome: 'Cliente E',
        email: 'clientee@email.com',
        valor: 12000,
        status: 'CONFIRMADA',
        observacao: null,
      },
      {
        vendedorId: matheus.id,
        data: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 6),
        nome: 'Cliente F',
        email: 'clientef@email.com',
        valor: 10000,
        status: 'CONFIRMADA',
        observacao: null,
      },
    ]

    for (const venda of vendasExemplo) {
      await prisma.venda.create({ data: venda })
    }

    console.log('✅ Vendas de exemplo criadas!')

    // Relatórios diários de exemplo
    const relatoriosExemplo = [
      {
        vendedorId: geovana.id,
        data: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 5),
        leadsRecebidos: 15,
        respostasEnviadas: 12,
        vendas: 1,
        observacao: 'Bom dia de trabalho',
      },
      {
        vendedorId: renner.id,
        data: new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 7),
        leadsRecebidos: 20,
        respostasEnviadas: 18,
        vendas: 1,
        observacao: null,
      },
    ]

    for (const relatorio of relatoriosExemplo) {
      await prisma.relatoriosDiarios.create({ data: relatorio })
    }

    console.log('✅ Relatórios diários de exemplo criados!')
  }

  console.log('🎉 Seed concluído!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

