import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const vendedores = await prisma.vendedor.findMany({
      orderBy: {
        nome: 'asc',
      },
    })

    return NextResponse.json(vendedores)
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error)
    return NextResponse.json({ error: 'Erro ao buscar vendedores' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.nome || !body.cargo) {
      return NextResponse.json(
        { error: 'Nome e cargo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe vendedor com esse nome
    const existente = await prisma.vendedor.findUnique({
      where: { nome: body.nome }
    })

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe um vendedor com esse nome' },
        { status: 409 }
      )
    }

    const vendedor = await prisma.vendedor.create({
      data: {
        nome: body.nome,
        cargo: body.cargo,
      },
    })

    return NextResponse.json(vendedor, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar vendedor:', error)
    return NextResponse.json({ error: 'Erro ao criar vendedor' }, { status: 500 })
  }
}







