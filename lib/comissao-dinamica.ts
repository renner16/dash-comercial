// Sistema de cálculo de comissão com planos dinâmicos (versionados por data)

import { prisma } from '@/lib/prisma'

export type Cargo = 'JUNIOR' | 'PLENO' | 'SENIOR' | 'GERENTE'

// Faixas de faturamento mensal (fixas)
const FAIXAS = [
  { min: 0, max: 40000 },
  { min: 40001, max: 50000 },
  { min: 50001, max: 60000 },
  { min: 60001, max: Infinity },
]

/**
 * Busca o plano de carreira vigente para um cargo em uma data específica
 */
export async function buscarPlanoVigente(cargo: Cargo, data: Date) {
  // Buscar o plano mais recente que estava vigente na data fornecida
  const plano = await prisma.planoCarreira.findFirst({
    where: {
      cargo,
      dataVigencia: {
        lte: data // Data de vigência menor ou igual à data consultada
      },
      ativo: true
    },
    orderBy: {
      dataVigencia: 'desc' // Mais recente primeiro
    }
  })

  if (!plano) {
    // Fallback para valores padrão caso não exista plano no banco
    return getPlanoDefault(cargo)
  }

  return {
    cargo: plano.cargo,
    salarioFixo: plano.salarioFixo,
    percentuais: JSON.parse(plano.percentuais) as number[],
    dataVigencia: plano.dataVigencia
  }
}

/**
 * Planos padrão (fallback caso não exista no banco)
 */
function getPlanoDefault(cargo: Cargo) {
  const SALARIOS_FIXOS: Record<Cargo, number> = {
    JUNIOR: 1500.00,
    PLENO: 2200.00,
    SENIOR: 2700.00,
    GERENTE: 3500.00,
  }

  const PERCENTUAIS: Record<Cargo, number[]> = {
    JUNIOR: [0.02, 0.03, 0.04, 0.05],
    PLENO: [0.06, 0.07, 0.08, 0.09],
    SENIOR: [0.09, 0.10, 0.11, 0.12],
    GERENTE: [0.12, 0.13, 0.14, 0.15],
  }

  return {
    cargo,
    salarioFixo: SALARIOS_FIXOS[cargo],
    percentuais: PERCENTUAIS[cargo],
    dataVigencia: new Date('2024-01-01')
  }
}

/**
 * Calcula a faixa de comissão baseada no faturamento mensal
 */
export function getFaixaComissao(faturamento: number): number {
  for (let i = 0; i < FAIXAS.length; i++) {
    const faixa = FAIXAS[i]
    if (faturamento >= faixa.min && faturamento <= faixa.max) {
      return i
    }
  }
  return FAIXAS.length - 1
}

/**
 * Retorna o percentual de comissão para um cargo e faturamento
 */
export function getPercentualComissao(percentuais: number[], faturamento: number): number {
  const faixa = getFaixaComissao(faturamento)
  return percentuais[faixa]
}

/**
 * Calcula o valor da comissão mensal
 */
export async function calcularComissaoDinamica(
  cargo: Cargo, 
  faturamentoMensal: number,
  dataReferencia: Date
): Promise<number> {
  const plano = await buscarPlanoVigente(cargo, dataReferencia)
  const percentual = getPercentualComissao(plano.percentuais, faturamentoMensal)
  return faturamentoMensal * percentual
}

/**
 * Retorna informações detalhadas sobre a faixa de comissão
 */
export async function getInfoFaixaDinamica(
  cargo: Cargo, 
  faturamento: number,
  dataReferencia: Date
) {
  const plano = await buscarPlanoVigente(cargo, dataReferencia)
  const faixa = getFaixaComissao(faturamento)
  const percentual = getPercentualComissao(plano.percentuais, faturamento)
  const faixaInfo = FAIXAS[faixa]
  
  return {
    faixa: faixa + 1,
    percentual,
    percentualFormatado: `${(percentual * 100).toFixed(0)}%`,
    salarioFixo: plano.salarioFixo,
    min: faixaInfo.min,
    max: faixaInfo.max === Infinity ? null : faixaInfo.max,
    descricao: faixaInfo.max === Infinity 
      ? `Acima de R$ ${faixaInfo.min.toLocaleString('pt-BR')}`
      : `R$ ${faixaInfo.min.toLocaleString('pt-BR')} - R$ ${faixaInfo.max.toLocaleString('pt-BR')}`,
    dataVigenciaPlano: plano.dataVigencia
  }
}

/**
 * Retorna o salário fixo baseado no cargo e data
 */
export async function getSalarioFixoDinamico(cargo: Cargo, dataReferencia: Date): Promise<number> {
  const plano = await buscarPlanoVigente(cargo, dataReferencia)
  return plano.salarioFixo
}

/**
 * Calcula a remuneração total (salário fixo + comissão)
 */
export async function calcularRemuneracaoTotalDinamica(
  cargo: Cargo, 
  faturamentoMensal: number,
  dataReferencia: Date
): Promise<number> {
  const plano = await buscarPlanoVigente(cargo, dataReferencia)
  const percentual = getPercentualComissao(plano.percentuais, faturamentoMensal)
  const comissao = faturamentoMensal * percentual
  return plano.salarioFixo + comissao
}






