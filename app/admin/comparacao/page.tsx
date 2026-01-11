'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { PeriodSelector } from '@/components/period-selector'
import { ArrowLeft, TrendingUp, TrendingDown, Award, DollarSign, ShoppingCart, Percent, Users, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { calcularComissao, getSalarioFixo, type Cargo } from '@/lib/comissao'

interface VendedorComparacao {
  id: string
  nome: string
  cargo: string
  faturamento: number
  qtdVendas: number
  ticketMedio: number
  comissao: number
  salarioFixo: number
  salarioTotal: number
  leadsRecebidos: number
  respostasEnviadas: number
  taxaResposta: number
  taxaConversao: number
  metaSemanal: number
  metaMensal: number
  vendasSemanais: number
  vendasMensais: number
  progressoMetaSemanal: number
  progressoMetaMensal: number
  metaAtingidaSemanal: boolean
  metaAtingidaMensal: boolean
}

export default function ComparacaoPage() {
  const hoje = new Date()
  const [mes, setMes] = useState<number | null>(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [dia, setDia] = useState<string | null>(hoje.toISOString().split('T')[0])
  const [semana, setSemana] = useState<number | null>(1)
  const [tipoVisao, setTipoVisao] = useState<'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado'>('mensal')
  const [dataInicio, setDataInicio] = useState<string | null>(null)
  const [dataFim, setDataFim] = useState<string | null>(null)
  const [vendedores, setVendedores] = useState<any[]>([])
  const [dadosComparacao, setDadosComparacao] = useState<VendedorComparacao[]>([])
  const [loading, setLoading] = useState(true)
  const [ordenacao, setOrdenacao] = useState<{ coluna: string | null; direcao: 'asc' | 'desc' }>({ coluna: 'faturamento', direcao: 'desc' })

  const carregarDados = async () => {
    setLoading(true)
    try {
      // Buscar todos os vendedores
      const vendedoresRes = await fetch('/api/vendedores')
      const vendedoresData = await vendedoresRes.json()
      setVendedores(vendedoresData)

      // Preparar parâmetros de período
      let params = ''
      if (tipoVisao === 'diario' && dia) {
        params = `dia=${dia}`
      } else if (tipoVisao === 'semanal' && mes && semana) {
        params = `mes=${mes}&ano=${ano}&semana=${semana}`
      } else if (tipoVisao === 'mensal' && mes) {
        params = `mes=${mes}&ano=${ano}`
      } else if (tipoVisao === 'anual') {
        params = `ano=${ano}`
      } else if (tipoVisao === 'personalizado' && dataInicio && dataFim) {
        const inicio = new Date(dataInicio + 'T00:00:00')
        const fim = new Date(dataFim + 'T23:59:59')
        params = `dataInicio=${inicio.toISOString()}&dataFim=${fim.toISOString()}`
      }

      // Buscar vendas e relatórios do período
      const [vendasRes, relatoriosRes] = await Promise.all([
        fetch(`/api/vendas?${params}`),
        fetch(`/api/relatorios?${params}`)
      ])

      const vendas = await vendasRes.json()
      const relatorios = await relatoriosRes.json()

      // Buscar dados mensais para meta mensal
      let vendasMensais: any[] = []
      let relatoriosMensais: any[] = []
      if (tipoVisao === 'diario' && dia) {
        const dataSelecionada = new Date(dia + 'T00:00:00')
        const mesData = dataSelecionada.getMonth() + 1
        const anoData = dataSelecionada.getFullYear()
        const [vendasMensaisRes, relatoriosMensaisRes] = await Promise.all([
          fetch(`/api/vendas?mes=${mesData}&ano=${anoData}`),
          fetch(`/api/relatorios?mes=${mesData}&ano=${anoData}`)
        ])
        vendasMensais = await vendasMensaisRes.json()
        relatoriosMensais = await relatoriosMensaisRes.json()
      } else if (tipoVisao === 'semanal' && mes && ano) {
        // Para semanal, buscar dados mensais do mês selecionado
        const [vendasMensaisRes, relatoriosMensaisRes] = await Promise.all([
          fetch(`/api/vendas?mes=${mes}&ano=${ano}`),
          fetch(`/api/relatorios?mes=${mes}&ano=${ano}`)
        ])
        vendasMensais = await vendasMensaisRes.json()
        relatoriosMensais = await relatoriosMensaisRes.json()
      } else if (tipoVisao === 'mensal' || tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado') {
        vendasMensais = vendas
        relatoriosMensais = relatorios
      }

      // Buscar dados semanais para meta semanal
      let vendasSemanais: any[] = []
      if (tipoVisao === 'semanal' && mes && semana) {
        vendasSemanais = vendas
      } else if (tipoVisao === 'diario' && dia) {
        // Para diário, buscar dados semanais da semana do dia selecionado
        const dataSelecionada = new Date(dia + 'T00:00:00')
        const mesData = dataSelecionada.getMonth() + 1
        const anoData = dataSelecionada.getFullYear()
        // Calcular semana do mês
        const primeiroDiaMes = new Date(anoData, mesData - 1, 1)
        const diaMes = dataSelecionada.getDate()
        let semanaNum = 1
        let diaAtual = 1
        while (diaAtual < diaMes) {
          const data = new Date(anoData, mesData - 1, diaAtual)
          if (data.getDay() === 6) { // Sábado
            semanaNum++
          }
          diaAtual++
        }
        const [vendasSemanaisRes] = await Promise.all([
          fetch(`/api/vendas?mes=${mesData}&ano=${anoData}&semana=${semanaNum}`)
        ])
        vendasSemanais = await vendasSemanaisRes.json()
      }

      // Metas por cargo
      const metasPorCargo: Record<string, { semanal: number, mensal: number }> = {
        JUNIOR: { semanal: 5, mensal: 20 },
        PLENO: { semanal: 7, mensal: 28 },
        SENIOR: { semanal: 10, mensal: 40 },
        GERENTE: { semanal: 12, mensal: 48 },
      }

      // Calcular dados de cada vendedor
      const comparacao: VendedorComparacao[] = vendedoresData.map((vendedor: any) => {
        // Vendas do período
        const vendasVendedor = vendas.filter((v: any) => v.vendedorId === vendedor.id && v.status === 'CONFIRMADA')
        const faturamento = vendasVendedor.reduce((sum: number, v: any) => sum + v.valor, 0)
        const qtdVendas = vendasVendedor.length
        const ticketMedio = qtdVendas > 0 ? faturamento / qtdVendas : 0

        // Comissão e salário
        const comissao = calcularComissao(vendedor.cargo as Cargo, faturamento)
        const salarioFixo = getSalarioFixo(vendedor.cargo as Cargo)
        const salarioTotal = salarioFixo + comissao

        // Relatórios do período
        const relatoriosVendedor = relatorios.filter((r: any) => r.vendedorId === vendedor.id)
        const leadsRecebidos = relatoriosVendedor.reduce((sum: number, r: any) => sum + r.leadsRecebidos, 0)
        const respostasEnviadas = relatoriosVendedor.reduce((sum: number, r: any) => sum + r.respostasEnviadas, 0)
        const taxaResposta = leadsRecebidos > 0 ? (respostasEnviadas / leadsRecebidos) * 100 : 0
        const taxaConversao = leadsRecebidos > 0 ? (qtdVendas / leadsRecebidos) * 100 : 0

        // Metas
        const metaVendedor = metasPorCargo[vendedor.cargo] || metasPorCargo.PLENO
        
        // Vendas semanais e mensais para cálculo de metas
        const vendasSemanaisVendedor = vendasSemanais.filter((v: any) => v.vendedorId === vendedor.id && v.status === 'CONFIRMADA')
        const vendasMensaisVendedor = vendasMensais.filter((v: any) => v.vendedorId === vendedor.id && v.status === 'CONFIRMADA')
        
        const qtdVendasSemanais = vendasSemanaisVendedor.length
        const qtdVendasMensais = vendasMensaisVendedor.length
        
        const progressoMetaSemanal = metaVendedor.semanal > 0 ? (qtdVendasSemanais / metaVendedor.semanal) * 100 : 0
        const progressoMetaMensal = metaVendedor.mensal > 0 ? (qtdVendasMensais / metaVendedor.mensal) * 100 : 0
        const metaAtingidaSemanal = qtdVendasSemanais >= metaVendedor.semanal
        const metaAtingidaMensal = qtdVendasMensais >= metaVendedor.mensal

        return {
          id: vendedor.id,
          nome: vendedor.nome,
          cargo: vendedor.cargo,
          faturamento,
          qtdVendas,
          ticketMedio,
          comissao,
          salarioFixo,
          salarioTotal,
          leadsRecebidos,
          respostasEnviadas,
          taxaResposta,
          taxaConversao,
          metaSemanal: metaVendedor.semanal,
          metaMensal: metaVendedor.mensal,
          vendasSemanais: qtdVendasSemanais,
          vendasMensais: qtdVendasMensais,
          progressoMetaSemanal,
          progressoMetaMensal,
          metaAtingidaSemanal,
          metaAtingidaMensal,
        }
      })

      setDadosComparacao(comparacao)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [mes, ano, dia, semana, tipoVisao, dataInicio, dataFim])

  // Função para ordenar dados
  const ordenarDados = (coluna: string) => {
    let novaDirecao: 'asc' | 'desc' = 'desc'
    
    if (ordenacao.coluna === coluna && ordenacao.direcao === 'desc') {
      novaDirecao = 'asc'
    }
    
    setOrdenacao({ coluna, direcao: novaDirecao })
  }

  // Dados ordenados
  const dadosOrdenados = [...dadosComparacao].sort((a, b) => {
    if (!ordenacao.coluna) return 0
    
    let valorA: number | string = 0
    let valorB: number | string = 0
    
    switch (ordenacao.coluna) {
      case 'faturamento':
        valorA = a.faturamento
        valorB = b.faturamento
        break
      case 'qtdVendas':
        valorA = a.qtdVendas
        valorB = b.qtdVendas
        break
      case 'ticketMedio':
        valorA = a.ticketMedio
        valorB = b.ticketMedio
        break
      case 'comissao':
        valorA = a.comissao
        valorB = b.comissao
        break
      case 'salarioTotal':
        valorA = a.salarioTotal
        valorB = b.salarioTotal
        break
      case 'leadsRecebidos':
        valorA = a.leadsRecebidos
        valorB = b.leadsRecebidos
        break
      case 'taxaResposta':
        valorA = a.taxaResposta
        valorB = b.taxaResposta
        break
      case 'taxaConversao':
        valorA = a.taxaConversao
        valorB = b.taxaConversao
        break
      case 'vendasSemanais':
        valorA = a.vendasSemanais
        valorB = b.vendasSemanais
        break
      case 'vendasMensais':
        valorA = a.vendasMensais
        valorB = b.vendasMensais
        break
      case 'nome':
        valorA = a.nome.toLowerCase()
        valorB = b.nome.toLowerCase()
        break
      case 'cargo':
        valorA = a.cargo.toLowerCase()
        valorB = b.cargo.toLowerCase()
        break
      default:
        return 0
    }
    
    if (typeof valorA === 'string' && typeof valorB === 'string') {
      if (ordenacao.direcao === 'asc') {
        return valorA.localeCompare(valorB)
      } else {
        return valorB.localeCompare(valorA)
      }
    } else {
      if (ordenacao.direcao === 'asc') {
        return (valorA as number) - (valorB as number)
      } else {
        return (valorB as number) - (valorA as number)
      }
    }
  })

  // Componente de cabeçalho ordenável
  const HeaderOrdenavel = ({ coluna, label, className = '' }: { coluna: string; label: string; className?: string }) => {
    const isAtivo = ordenacao.coluna === coluna
    return (
      <th 
        className={`px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
        onClick={() => ordenarDados(coluna)}
      >
        <div className="flex items-center justify-end gap-1">
          <span>{label}</span>
          {isAtivo ? (
            ordenacao.direcao === 'desc' ? (
              <ArrowDown className="w-3 h-3 text-primary" />
            ) : (
              <ArrowUp className="w-3 h-3 text-primary" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-muted-foreground opacity-50" />
          )}
        </div>
      </th>
    )
  }

  const HeaderOrdenavelLeft = ({ coluna, label, className = '' }: { coluna: string; label: string; className?: string }) => {
    const isAtivo = ordenacao.coluna === coluna
    return (
      <th 
        className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
        onClick={() => ordenarDados(coluna)}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {isAtivo ? (
            ordenacao.direcao === 'desc' ? (
              <ArrowDown className="w-3 h-3 text-primary" />
            ) : (
              <ArrowUp className="w-3 h-3 text-primary" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-muted-foreground opacity-50" />
          )}
        </div>
      </th>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 sm:p-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  // Calcular totais e médias
  const totalFaturamento = dadosComparacao.reduce((sum, v) => sum + v.faturamento, 0)
  const totalVendas = dadosComparacao.reduce((sum, v) => sum + v.qtdVendas, 0)
  const totalComissao = dadosComparacao.reduce((sum, v) => sum + v.comissao, 0)
  const totalLeads = dadosComparacao.reduce((sum, v) => sum + v.leadsRecebidos, 0)
  const totalRespostas = dadosComparacao.reduce((sum, v) => sum + v.respostasEnviadas, 0)
  const ticketMedioGeral = totalVendas > 0 ? totalFaturamento / totalVendas : 0
  const taxaRespostaGeral = totalLeads > 0 ? (totalRespostas / totalLeads) * 100 : 0
  const taxaConversaoGeral = totalLeads > 0 ? (totalVendas / totalLeads) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 sm:p-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Admin
            </Button>
          </Link>
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Comparação entre Vendedores</h1>
          <p className="text-muted-foreground">Compare a performance de todos os vendedores no período selecionado</p>
        </div>

        {/* Seletor de Período */}
        <div className="mb-6">
          <PeriodSelector 
            mes={mes} 
            ano={ano}
            dia={dia}
            semana={semana}
            tipoVisao={tipoVisao}
            dataInicio={dataInicio}
            dataFim={dataFim}
            onMesChange={setMes} 
            onAnoChange={setAno}
            onDiaChange={setDia}
            onSemanaChange={setSemana}
            onTipoVisaoChange={setTipoVisao}
            onDataInicioChange={setDataInicio}
            onDataFimChange={setDataFim}
          />
        </div>

        {/* Resumo Geral */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalFaturamento)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVendas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(ticketMedioGeral)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taxaConversaoGeral.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Comparação */}
        <Card>
          <CardHeader>
            <CardTitle>Comparação Detalhada</CardTitle>
            <CardDescription>
              Clique nos cabeçalhos das colunas para ordenar os dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rank
                    </th>
                    <HeaderOrdenavelLeft coluna="nome" label="Vendedor" />
                    <HeaderOrdenavelLeft coluna="cargo" label="Cargo" />
                    <HeaderOrdenavel coluna="faturamento" label="Faturamento" />
                    <HeaderOrdenavel coluna="qtdVendas" label="Vendas" />
                    <HeaderOrdenavel coluna="ticketMedio" label="Ticket Médio" />
                    <HeaderOrdenavel coluna="comissao" label="Comissão" />
                    <HeaderOrdenavel coluna="salarioTotal" label="Salário Total" />
                    <HeaderOrdenavel coluna="leadsRecebidos" label="Leads" />
                    <HeaderOrdenavel coluna="taxaResposta" label="Taxa Resposta" />
                    <HeaderOrdenavel coluna="taxaConversao" label="Taxa Conversão" />
                    {(tipoVisao === 'semanal' || tipoVisao === 'diario' || tipoVisao === 'mensal' || tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado') && (
                      <>
                        <HeaderOrdenavel coluna="vendasSemanais" label="Meta Semanal" />
                        <HeaderOrdenavel coluna="vendasMensais" label="Meta Mensal" />
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dadosOrdenados.map((vendedor, index) => (
                    <tr key={vendedor.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                          {index === 1 && <Award className="w-4 h-4 text-gray-400" />}
                          {index === 2 && <Award className="w-4 h-4 text-orange-600" />}
                          <span className="font-medium">{index + 1}º</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{vendedor.nome}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{vendedor.cargo}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(vendedor.faturamento)}</td>
                      <td className="px-4 py-3 text-right">{vendedor.qtdVendas}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(vendedor.ticketMedio)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(vendedor.comissao)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(vendedor.salarioTotal)}</td>
                      <td className="px-4 py-3 text-right">{vendedor.leadsRecebidos}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={vendedor.taxaResposta >= 50 ? 'text-green-600' : vendedor.taxaResposta >= 30 ? 'text-yellow-600' : 'text-red-600'}>
                          {vendedor.taxaResposta.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={vendedor.taxaConversao >= 20 ? 'text-green-600' : vendedor.taxaConversao >= 10 ? 'text-yellow-600' : 'text-red-600'}>
                          {vendedor.taxaConversao.toFixed(1)}%
                        </span>
                      </td>
                      {(tipoVisao === 'semanal' || tipoVisao === 'diario' || tipoVisao === 'mensal' || tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado') && (
                        <>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={vendedor.metaAtingidaSemanal ? 'text-green-600 font-medium' : ''}>
                                {vendedor.vendasSemanais}/{vendedor.metaSemanal}
                              </span>
                              {vendedor.metaAtingidaSemanal ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  ({vendedor.progressoMetaSemanal.toFixed(0)}%)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={vendedor.metaAtingidaMensal ? 'text-green-600 font-medium' : ''}>
                                {vendedor.vendasMensais}/{vendedor.metaMensal}
                              </span>
                              {vendedor.metaAtingidaMensal ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  ({vendedor.progressoMetaMensal.toFixed(0)}%)
                                </span>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold bg-muted/50">
                    <td colSpan={3} className="px-4 py-3">TOTAL / MÉDIA</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(totalFaturamento)}</td>
                    <td className="px-4 py-3 text-right">{totalVendas}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(ticketMedioGeral)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(totalComissao)}</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right">{totalLeads}</td>
                    <td className="px-4 py-3 text-right">{taxaRespostaGeral.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">{taxaConversaoGeral.toFixed(1)}%</td>
                    {(tipoVisao === 'semanal' || tipoVisao === 'diario' || tipoVisao === 'mensal' || tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado') && (
                      <>
                        <td className="px-4 py-3 text-right">-</td>
                        <td className="px-4 py-3 text-right">-</td>
                      </>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

