import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cargo = searchParams.get('cargo')
    const data = searchParams.get('data')

    let where: any = {
      ativo: true
    }

    if (cargo) {
      where.cargo = cargo
    }

    if (data) {
      // Buscar plano vigente em uma data específica
      where.dataVigencia = {
        lte: new Date(data)
      }
    }

    const planos = await prisma.planoCarreira.findMany({
      where,
      orderBy: [
        { cargo: 'asc' },
        { dataVigencia: 'desc' }
      ]
    })

    return NextResponse.json(planos)
  } catch (error) {
    console.error('Erro ao buscar planos de carreira:', error)
    return NextResponse.json({ error: 'Erro ao buscar planos de carreira' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validações básicas
    if (!body.cargo || !body.salarioFixo || !body.percentuais || !body.dataVigencia) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: cargo, salarioFixo, percentuais, dataVigencia' }, 
        { status: 400 }
      )
    }

    // Validar que a data de vigência é futura (não pode alterar o passado)
    const dataVigencia = new Date(body.dataVigencia)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    if (dataVigencia < hoje) {
      return NextResponse.json(
        { error: 'Não é permitido criar planos com data de vigência no passado' }, 
        { status: 400 }
      )
    }

    // Verificar se já existe um plano para este cargo nesta data
    const existente = await prisma.planoCarreira.findFirst({
      where: {
        cargo: body.cargo,
        dataVigencia: dataVigencia
      }
    })

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe um plano para este cargo nesta data de vigência' }, 
        { status: 409 }
      )
    }

    // Validar formato dos percentuais (deve ser um array de 4 números)
    const percentuais = typeof body.percentuais === 'string' 
      ? JSON.parse(body.percentuais) 
      : body.percentuais

    if (!Array.isArray(percentuais) || percentuais.length !== 4) {
      return NextResponse.json(
        { error: 'Percentuais deve ser um array com 4 valores' }, 
        { status: 400 }
      )
    }

    const plano = await prisma.planoCarreira.create({
      data: {
        cargo: body.cargo,
        salarioFixo: parseFloat(body.salarioFixo),
        percentuais: JSON.stringify(percentuais),
        dataVigencia: dataVigencia,
        observacao: body.observacao || null,
      },
    })

    return NextResponse.json(plano)
  } catch (error) {
    console.error('Erro ao criar plano de carreira:', error)
    return NextResponse.json({ error: 'Erro ao criar plano de carreira' }, { status: 500 })
  }
}






