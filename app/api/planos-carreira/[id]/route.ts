import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plano = await prisma.planoCarreira.findUnique({
      where: { id: params.id },
    })

    if (!plano) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    return NextResponse.json(plano)
  } catch (error) {
    console.error('Erro ao buscar plano:', error)
    return NextResponse.json({ error: 'Erro ao buscar plano' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Buscar plano existente
    const planoExistente = await prisma.planoCarreira.findUnique({
      where: { id: params.id }
    })

    if (!planoExistente) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    // Não permitir editar planos que já entraram em vigor
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    if (planoExistente.dataVigencia < hoje) {
      return NextResponse.json(
        { error: 'Não é permitido editar planos que já entraram em vigor' }, 
        { status: 400 }
      )
    }

    // Validar percentuais se fornecido
    let percentuais = body.percentuais
    if (percentuais) {
      percentuais = typeof percentuais === 'string' ? JSON.parse(percentuais) : percentuais
      if (!Array.isArray(percentuais) || percentuais.length !== 4) {
        return NextResponse.json(
          { error: 'Percentuais deve ser um array com 4 valores' }, 
          { status: 400 }
        )
      }
      percentuais = JSON.stringify(percentuais)
    }

    const plano = await prisma.planoCarreira.update({
      where: { id: params.id },
      data: {
        ...(body.salarioFixo && { salarioFixo: parseFloat(body.salarioFixo) }),
        ...(percentuais && { percentuais }),
        ...(body.dataVigencia && { dataVigencia: new Date(body.dataVigencia) }),
        ...(body.observacao !== undefined && { observacao: body.observacao }),
        ...(body.ativo !== undefined && { ativo: body.ativo }),
      },
    })

    return NextResponse.json(plano)
  } catch (error) {
    console.error('Erro ao atualizar plano:', error)
    return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar plano existente
    const planoExistente = await prisma.planoCarreira.findUnique({
      where: { id: params.id }
    })

    if (!planoExistente) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    // Não permitir deletar planos que já entraram em vigor
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    if (planoExistente.dataVigencia < hoje) {
      return NextResponse.json(
        { error: 'Não é permitido deletar planos que já entraram em vigor. Use desativação.' }, 
        { status: 400 }
      )
    }

    await prisma.planoCarreira.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Plano deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar plano:', error)
    return NextResponse.json({ error: 'Erro ao deletar plano' }, { status: 500 })
  }
}



