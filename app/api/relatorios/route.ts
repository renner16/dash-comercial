import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vendedorId = searchParams.get('vendedorId')
    const mes = searchParams.get('mes')
    const ano = searchParams.get('ano')
    const dia = searchParams.get('dia')
    const semana = searchParams.get('semana')

    let where: any = {}

    if (vendedorId) {
      where.vendedorId = vendedorId
    }

    if (dia) {
      // Visão diária: filtrar por dia específico
      const dataEspecifica = new Date(dia + 'T00:00:00')
      const startDate = new Date(dataEspecifica.getFullYear(), dataEspecifica.getMonth(), dataEspecifica.getDate(), 0, 0, 0)
      const endDate = new Date(dataEspecifica.getFullYear(), dataEspecifica.getMonth(), dataEspecifica.getDate(), 23, 59, 59)
      where.data = {
        gte: startDate,
        lte: endDate,
      }
    } else if (ano) {
      if (mes && semana) {
        // Visão semanal: filtrar por semana do mês (7 dias cada)
        const inicioMes = new Date(parseInt(ano), parseInt(mes) - 1, 1)
        const semanaNum = parseInt(semana)
        
        // Calcular o dia de início e fim da semana
        const diaInicio = 1 + ((semanaNum - 1) * 7)
        const diaFim = Math.min(diaInicio + 6, new Date(parseInt(ano), parseInt(mes), 0).getDate())
        
        const startDate = new Date(parseInt(ano), parseInt(mes) - 1, diaInicio, 0, 0, 0)
        const endDate = new Date(parseInt(ano), parseInt(mes) - 1, diaFim, 23, 59, 59)
        
        where.data = {
          gte: startDate,
          lte: endDate,
        }
      } else if (mes) {
        // Visão mensal: filtrar por mês específico
        const startDate = new Date(parseInt(ano), parseInt(mes) - 1, 1)
        const endDate = new Date(parseInt(ano), parseInt(mes), 0, 23, 59, 59)
        where.data = {
          gte: startDate,
          lte: endDate,
        }
      } else {
        // Visão anual: filtrar por ano inteiro
        const startDate = new Date(parseInt(ano), 0, 1)
        const endDate = new Date(parseInt(ano), 11, 31, 23, 59, 59)
        where.data = {
          gte: startDate,
          lte: endDate,
        }
      }
    }
    // Se nenhum filtro de período for fornecido, retorna todos os dados (visão "total")

    const relatorios = await prisma.relatoriosDiarios.findMany({
      where,
      include: {
        vendedor: true,
      },
      orderBy: {
        data: 'desc',
      },
    })

    return NextResponse.json(relatorios)
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    return NextResponse.json({ error: 'Erro ao buscar relatórios' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verificar se já existe um relatório para essa data e vendedor
    const existente = await prisma.relatoriosDiarios.findUnique({
      where: {
        vendedorId_data: {
          vendedorId: body.vendedorId,
          data: new Date(body.data),
        },
      },
    })

    if (existente) {
      // Atualizar o existente
      const relatorio = await prisma.relatoriosDiarios.update({
        where: { id: existente.id },
        data: {
          leadsRecebidos: body.leadsRecebidos,
          respostasEnviadas: body.respostasEnviadas,
          vendas: body.vendas,
          observacao: body.observacao || null,
        },
      })
      return NextResponse.json(relatorio)
    }

    // Criar novo
    const relatorio = await prisma.relatoriosDiarios.create({
      data: {
        vendedorId: body.vendedorId,
        data: new Date(body.data),
        leadsRecebidos: body.leadsRecebidos,
        respostasEnviadas: body.respostasEnviadas,
        vendas: body.vendas,
        observacao: body.observacao || null,
      },
    })

    return NextResponse.json(relatorio)
  } catch (error) {
    console.error('Erro ao criar relatório:', error)
    return NextResponse.json({ error: 'Erro ao criar relatório' }, { status: 500 })
  }
}


