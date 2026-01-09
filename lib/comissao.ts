// Sistema de cálculo de comissão baseado nas regras do Cultura Builder

export type Cargo = 'JUNIOR' | 'PLENO'

// Faixas de faturamento mensal
const FAIXAS = [
  { min: 0, max: 40000 },
  { min: 40001, max: 50000 },
  { min: 50001, max: 60000 },
  { min: 60001, max: Infinity },
]

// Percentuais por cargo e faixa
const PERCENTUAIS: Record<Cargo, number[]> = {
  JUNIOR: [0.02, 0.03, 0.04, 0.05], // 2%, 3%, 4%, 5%
  PLENO: [0.06, 0.07, 0.08, 0.09],  // 6%, 7%, 8%, 9%
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
  return FAIXAS.length - 1 // Última faixa por padrão
}

/**
 * Retorna o percentual de comissão para um cargo e faturamento
 */
export function getPercentualComissao(cargo: Cargo, faturamento: number): number {
  const faixa = getFaixaComissao(faturamento)
  return PERCENTUAIS[cargo][faixa]
}

/**
 * Calcula o valor da comissão mensal
 */
export function calcularComissao(cargo: Cargo, faturamentoMensal: number): number {
  const percentual = getPercentualComissao(cargo, faturamentoMensal)
  return faturamentoMensal * percentual
}

/**
 * Retorna informações detalhadas sobre a faixa de comissão
 */
export function getInfoFaixa(cargo: Cargo, faturamento: number) {
  const faixa = getFaixaComissao(faturamento)
  const percentual = getPercentualComissao(cargo, faturamento)
  const faixaInfo = FAIXAS[faixa]
  
  return {
    faixa: faixa + 1,
    percentual,
    percentualFormatado: `${(percentual * 100).toFixed(0)}%`,
    min: faixaInfo.min,
    max: faixaInfo.max === Infinity ? null : faixaInfo.max,
    descricao: faixaInfo.max === Infinity 
      ? `Acima de R$ ${faixaInfo.min.toLocaleString('pt-BR')}`
      : `R$ ${faixaInfo.min.toLocaleString('pt-BR')} - R$ ${faixaInfo.max.toLocaleString('pt-BR')}`
  }
}


