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
  console.log('🎉 Seed concluído! Banco pronto para uso real.')
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


