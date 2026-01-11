import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const id = params.id

    if (!body.nome || !body.cargo) {
      return NextResponse.json(
        { error: 'Nome e cargo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se existe outro vendedor com esse nome
    const existente = await prisma.vendedor.findUnique({
      where: { nome: body.nome }
    })

    if (existente && existente.id !== id) {
      return NextResponse.json(
        { error: 'Já existe um vendedor com esse nome' },
        { status: 409 }
      )
    }

    const vendedor = await prisma.vendedor.update({
      where: { id },
      data: {
        nome: body.nome,
        cargo: body.cargo,
      },
    })

    return NextResponse.json(vendedor)
  } catch (error) {
    console.error('Erro ao atualizar vendedor:', error)
    return NextResponse.json({ error: 'Erro ao atualizar vendedor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    await prisma.vendedor.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir vendedor:', error)
    return NextResponse.json({ error: 'Erro ao excluir vendedor' }, { status: 500 })
  }
}

