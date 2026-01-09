import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const venda = await prisma.venda.update({
      where: { id: params.id },
      data: {
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
    console.error('Erro ao atualizar venda:', error)
    return NextResponse.json({ error: 'Erro ao atualizar venda' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.venda.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir venda:', error)
    return NextResponse.json({ error: 'Erro ao excluir venda' }, { status: 500 })
  }
}




