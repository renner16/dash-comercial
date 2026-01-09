import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const vendedores = await prisma.vendedor.findMany({
      orderBy: {
        nome: 'asc',
      },
    })

    return NextResponse.json(vendedores)
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error)
    return NextResponse.json({ error: 'Erro ao buscar vendedores' }, { status: 500 })
  }
}


