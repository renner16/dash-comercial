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
        // Visão semanal: filtrar por semana do mês (quarta a terça - semana comercial)
        const semanaNum = parseInt(semana)
        const anoNum = parseInt(ano)
        const mesNum = parseInt(mes)
        
        // Função auxiliar para calcular o intervalo de dias de uma semana comercial (Quarta → Terça)
        const calcularIntervaloSemana = (numeroSemana: number, mes: number, ano: number) => {
          const primeiroDiaMes = new Date(ano, mes - 1, 1)
          const diasNoMes = new Date(ano, mes, 0).getDate()
          
          // Encontrar a primeira quarta-feira do mês
          let primeiraQuarta = 1
          for (let dia = 1; dia <= 7; dia++) {
            const data = new Date(ano, mes - 1, dia)
            if (data.getDay() === 3) { // Quarta-feira
              primeiraQuarta = dia
              break
            }
          }
          
          // Calcular início da semana solicitada
          // Semana 1: começa na primeira quarta (ou dia 1 se mês começa na quarta)
          let diaInicio = primeiraQuarta
          if (numeroSemana > 1) {
            // Cada semana adicional = 7 dias após a anterior
            diaInicio = primeiraQuarta + (numeroSemana - 1) * 7
          }
          
          // Se o início calculado está antes da primeira quarta, usar dia 1
          if (numeroSemana === 1 && primeiroDiaMes.getDay() !== 3) {
            diaInicio = 1
          }
          
          // Garantir que não ultrapasse os limites do mês
          if (diaInicio > diasNoMes) {
            diaInicio = diasNoMes
          }
          
          // Encontrar o dia final da semana (sempre terça-feira = 2, 7 dias após o início)
          let diaFim = diaInicio + 6
          // Ajustar se ultrapassar o mês
          if (diaFim > diasNoMes) {
            diaFim = diasNoMes
          } else {
            // Verificar se realmente termina numa terça-feira
            const dataFim = new Date(ano, mes - 1, diaFim)
            if (dataFim.getDay() !== 2) {
              // Ajustar para a terça-feira mais próxima
              const diff = (2 - dataFim.getDay() + 7) % 7
              diaFim = Math.min(diaFim + diff, diasNoMes)
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
        cupom: body.cupom || null,
        plano: body.plano || null,
        observacao: body.observacao || null,
      },
    })

    return NextResponse.json(venda)
  } catch (error) {
    console.error('Erro ao criar venda:', error)
    return NextResponse.json({ error: 'Erro ao criar venda' }, { status: 500 })
  }
}


