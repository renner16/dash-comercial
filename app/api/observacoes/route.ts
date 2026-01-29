import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendedorId = searchParams.get('vendedorId')

    if (!vendedorId) {
      return NextResponse.json({ error: 'vendedorId é obrigatório' }, { status: 400 })
    }

    const observacoes = await prisma.observacoesVendedor.findUnique({
      where: { vendedorId },
    })

    return NextResponse.json(observacoes || { texto: '' })
  } catch (error) {
    console.error('Erro ao buscar observações:', error)
    return NextResponse.json({ error: 'Erro ao buscar observações' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendedorId, texto } = body

    if (!vendedorId) {
      return NextResponse.json({ error: 'vendedorId é obrigatório' }, { status: 400 })
    }

    // Verificar se já existe observações para este vendedor
    const existente = await prisma.observacoesVendedor.findUnique({
      where: { vendedorId },
    })

    if (existente) {
      // Atualizar o existente
      const observacoes = await prisma.observacoesVendedor.update({
        where: { id: existente.id },
        data: {
          texto: texto || '',
        },
      })
      return NextResponse.json(observacoes)
    }

    // Criar novo
    const observacoes = await prisma.observacoesVendedor.create({
      data: {
        vendedorId,
        texto: texto || '',
      },
    })

    return NextResponse.json(observacoes)
  } catch (error) {
    console.error('Erro ao salvar observações:', error)
    return NextResponse.json({ error: 'Erro ao salvar observações' }, { status: 500 })
  }
}

