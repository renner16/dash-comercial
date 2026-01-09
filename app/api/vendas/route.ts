import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vendedorId = searchParams.get('vendedorId')
    const mes = searchParams.get('mes')
    const ano = searchParams.get('ano')

    let where: any = {}

    if (vendedorId) {
      where.vendedorId = vendedorId
    }

    if (mes && ano) {
      const startDate = new Date(parseInt(ano), parseInt(mes) - 1, 1)
      const endDate = new Date(parseInt(ano), parseInt(mes), 0, 23, 59, 59)
      where.data = {
        gte: startDate,
        lte: endDate,
      }
    }

    const vendas = await prisma.venda.findMany({
      where,
      include: {
        vendedor: true,
      },
      orderBy: {
        data: 'desc',
      },
    })

    return NextResponse.json(vendas)
  } catch (error) {
    console.error('Erro ao buscar vendas:', error)
    return NextResponse.json({ error: 'Erro ao buscar vendas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const venda = await prisma.venda.create({
      data: {
        vendedorId: body.vendedorId,
        data: new Date(body.data),
        nome: body.nome,
        email: body.email,
        valor: body.valor,
        status: body.status,
        observacao: body.observacao || null,
      },
    })

    return NextResponse.json(venda)
  } catch (error) {
    console.error('Erro ao criar venda:', error)
    return NextResponse.json({ error: 'Erro ao criar venda' }, { status: 500 })
  }
}


