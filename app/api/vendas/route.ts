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
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    let where: any = {}

    if (vendedorId) {
      where.vendedorId = vendedorId
    }

    // Se dataInicio e dataFim forem fornecidos, usar range customizado
    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      }
    } else if (dia) {
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
        // Visão semanal: filtrar por semana do mês (domingo a sábado)
        const semanaNum = parseInt(semana)
        const anoNum = parseInt(ano)
        const mesNum = parseInt(mes)
        
        // Função auxiliar para calcular o intervalo de dias de uma semana
        const calcularIntervaloSemana = (numeroSemana: number, mes: number, ano: number) => {
          const primeiroDiaMes = new Date(ano, mes - 1, 1)
          const diaDaSemanaInicio = primeiroDiaMes.getDay() // 0=domingo, 6=sábado
          const diasNoMes = new Date(ano, mes, 0).getDate()
          
          let diaInicio = 1
          let semanaAtual = 1
          
          // Encontrar o dia de início da semana selecionada
          for (let dia = 1; dia <= diasNoMes; dia++) {
            const data = new Date(ano, mes - 1, dia)
            const diaDaSemana = data.getDay()
            
            if (semanaAtual === numeroSemana) {
              diaInicio = dia
              break
            }
            
            if (diaDaSemana === 6) { // Sábado = fim da semana
              semanaAtual++
            }
          }
          
          // Encontrar o dia final da semana (sábado)
          let diaFim = diaInicio
          for (let dia = diaInicio; dia <= diasNoMes; dia++) {
            const data = new Date(ano, mes - 1, dia)
            diaFim = dia
            if (data.getDay() === 6) { // Sábado
              break
            }
          }
          
          return { diaInicio, diaFim }
        }
        
        const { diaInicio, diaFim } = calcularIntervaloSemana(semanaNum, mesNum, anoNum)
        
        const startDate = new Date(anoNum, mesNum - 1, diaInicio, 0, 0, 0)
        const endDate = new Date(anoNum, mesNum - 1, diaFim, 23, 59, 59)
        
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


