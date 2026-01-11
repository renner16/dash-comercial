import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log('API PUT - Recebendo dados:', body) // Debug
    console.log('API PUT - Status recebido:', body.status) // Debug
    console.log('API PUT - ID recebido:', params.id) // Debug
    
    // Converter data para Date se for string ou objeto Date
    let dataVenda: Date
    if (body.data instanceof Date) {
      dataVenda = body.data
    } else if (typeof body.data === 'string') {
      dataVenda = new Date(body.data)
    } else {
      dataVenda = new Date()
    }

    // Validar se a data é válida
    if (isNaN(dataVenda.getTime())) {
      return NextResponse.json({ 
        error: 'Data inválida',
        details: `Data recebida: ${body.data}`
      }, { status: 400 })
    }

    // Validar campos obrigatórios
    if (!body.nome || !body.email || body.valor === undefined) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, email e valor são obrigatórios'
      }, { status: 400 })
    }

    const venda = await prisma.venda.update({
      where: { id: params.id },
      data: {
        data: dataVenda,
        nome: String(body.nome),
        email: String(body.email),
        valor: parseFloat(String(body.valor)),
        status: String(body.status || 'CONFIRMADA'), // Garantir que sempre tenha um status
        cupom: body.cupom ? String(body.cupom) : null,
        plano: body.plano ? String(body.plano) : null,
        observacao: body.observacao ? String(body.observacao) : null,
      },
    })

    console.log('API PUT - Venda atualizada:', venda) // Debug
    return NextResponse.json(venda)
  } catch (error) {
    console.error('Erro ao atualizar venda:', error)
    return NextResponse.json({ 
      error: 'Erro ao atualizar venda',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
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
    return NextResponse.json({ 
      error: 'Erro ao excluir venda',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}







