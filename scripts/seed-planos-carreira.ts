import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Planos de Carreira baseados em https://plano-carreira-vercel-3izbxmi3g-ygors-projects-4796f89e.vercel.app/
const planosCarreira = [
  {
    cargo: 'JUNIOR',
    salarioFixo: 1500.00,
    percentuais: JSON.stringify([0.02, 0.03, 0.04, 0.05]), // 2%, 3%, 4%, 5%
    dataVigencia: new Date('2024-01-01T00:00:00'),
    observacao: 'Plano inicial - vigente desde 01/01/2024'
  },
  {
    cargo: 'PLENO',
    salarioFixo: 2200.00,
    percentuais: JSON.stringify([0.06, 0.07, 0.08, 0.09]), // 6%, 7%, 8%, 9%
    dataVigencia: new Date('2024-01-01T00:00:00'),
    observacao: 'Plano inicial - vigente desde 01/01/2024'
  },
  {
    cargo: 'SENIOR',
    salarioFixo: 2700.00,
    percentuais: JSON.stringify([0.09, 0.10, 0.11, 0.12]), // 9%, 10%, 11%, 12%
    dataVigencia: new Date('2024-01-01T00:00:00'),
    observacao: 'Plano inicial - vigente desde 01/01/2024'
  },
  {
    cargo: 'GERENTE',
    salarioFixo: 3500.00,
    percentuais: JSON.stringify([0.12, 0.13, 0.14, 0.15]), // 12%, 13%, 14%, 15%
    dataVigencia: new Date('2024-01-01T00:00:00'),
    observacao: 'Plano inicial - vigente desde 01/01/2024'
  },
]

async function seedPlanosCarreira() {
  console.log('🌱 Populando Planos de Carreira...')

  for (const plano of planosCarreira) {
    // Verificar se já existe um plano para este cargo nesta data
    const existente = await prisma.planoCarreira.findFirst({
      where: {
        cargo: plano.cargo,
        dataVigencia: plano.dataVigencia
      }
    })

    if (existente) {
      console.log(`⚠️  Plano ${plano.cargo} já existe para ${plano.dataVigencia.toLocaleDateString('pt-BR')}`)
      continue
    }

    await prisma.planoCarreira.create({
      data: plano
    })

    console.log(`✅ Plano ${plano.cargo} criado - Salário: R$ ${plano.salarioFixo.toFixed(2)}`)
  }

  console.log('')
  console.log('🎉 Planos de Carreira populados com sucesso!')
  console.log('')
  console.log('📋 Resumo:')
  console.log('- JUNIOR: R$ 1.500,00 (2%-5%)')
  console.log('- PLENO: R$ 2.200,00 (6%-9%)')
  console.log('- SENIOR: R$ 2.700,00 (9%-12%)')
  console.log('- GERENTE: R$ 3.500,00 (12%-15%)')
}

seedPlanosCarreira()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })



