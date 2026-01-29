import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendedorId = searchParams.get('vendedorId')
    const modo = searchParams.get('modo') // diario, semanal, mensal

    if (!vendedorId) {
      return NextResponse.json({ error: 'vendedorId é obrigatório' }, { status: 400 })
    }

    const where: any = { vendedorId }
    if (modo) {
      where.modo = modo
    }

    const itens = await prisma.checklistItem.findMany({
      where,
      orderBy: { data: 'desc' },
    })

    return NextResponse.json(itens)
  } catch (error) {
    console.error('Erro ao buscar checklist:', error)
    return NextResponse.json({ error: 'Erro ao buscar checklist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendedorId, texto, concluida, modo } = body

    if (!vendedorId || !texto || !modo) {
      return NextResponse.json({ error: 'vendedorId, texto e modo são obrigatórios' }, { status: 400 })
    }

    const item = await prisma.checklistItem.create({
      data: {
        vendedorId,
        texto,
        concluida: concluida || false,
        modo,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao criar item do checklist:', error)
    return NextResponse.json({ error: 'Erro ao criar item do checklist' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, texto, concluida } = body

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    const updateData: any = {}
    if (texto !== undefined) updateData.texto = texto
    if (concluida !== undefined) updateData.concluida = concluida

    const item = await prisma.checklistItem.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao atualizar item do checklist:', error)
    return NextResponse.json({ error: 'Erro ao atualizar item do checklist' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    await prisma.checklistItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar item do checklist:', error)
    return NextResponse.json({ error: 'Erro ao deletar item do checklist' }, { status: 500 })
  }
}

