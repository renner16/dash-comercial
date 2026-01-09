import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const relatorio = await prisma.relatoriosDiarios.update({
      where: { id: params.id },
      data: {
        data: new Date(body.data),
        leadsRecebidos: body.leadsRecebidos,
        respostasEnviadas: body.respostasEnviadas,
        vendas: body.vendas,
        observacao: body.observacao || null,
      },
    })

    return NextResponse.json(relatorio)
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error)
    return NextResponse.json({ error: 'Erro ao atualizar relatório' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.relatoriosDiarios.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir relatório:', error)
    return NextResponse.json({ error: 'Erro ao excluir relatório' }, { status: 500 })
  }
}


