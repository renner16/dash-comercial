'use client'
// Build fix: corrige tipos TypeScript - adiciona personalizado

import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Download, Percent } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { VendasTable } from '@/components/vendas-table'
import { SimpleLineChart, SimpleBarChart } from '@/components/charts'
import { PeriodSelector } from '@/components/period-selector'
import { ProjecaoCard } from '@/components/projecao-card'
import { FunilConversao } from '@/components/funil-conversao'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { exportarParaCSV } from '@/lib/export-utils'
import { calcularComissao, getSalarioFixo, calcularRemuneracaoTotal, type Cargo } from '@/lib/comissao'

interface GeralDashboardProps {
  vendedores: Array<{
    id: string
    nome: string
    cargo: string
  }>
}

export function GeralDashboard({ vendedores }: GeralDashboardProps) {
  const hoje = new Date()
  const [mes, setMes] = useState<number | null>(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [dia, setDia] = useState<string | null>(hoje.toISOString().split('T')[0])
  const [semana, setSemana] = useState<number | null>(1)
  const [tipoVisao, setTipoVisao] = useState<'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado'>('diario')
  const [dataInicio, setDataInicio] = useState<string | null>(null)
  const [dataFim, setDataFim] = useState<string | null>(null)
  const [periodoGrafico, setPeriodoGrafico] = useState<'auto' | 'dia' | 'semana' | 'mes'>('auto')
  const [vendas, setVendas] = useState<any[]>([]) // Dados do período exato (para KPIs e tabela)
  const [relatorios, setRelatorios] = useState<any[]>([]) // Dados do período exato
  const [vendasGraficos, setVendasGraficos] = useState<any[]>([]) // Dados expandidos para gráficos
  const [relatoriosGraficos, setRelatoriosGraficos] = useState<any[]>([]) // Dados expandidos para gráficos
  const [vendasMensais, setVendasMensais] = useState<any[]>([]) // Dados mensais (para meta e projeção quando diário)
  const [vendasSemanais, setVendasSemanais] = useState<any[]>([]) // Dados semanais (para meta e projeção quando semanal)
  const [loading, setLoading] = useState(true)
  const [filtroVendedor, setFiltroVendedor] = useState<string>('todos')

  const carregarDados = async () => {
    setLoading(true)
    try {
      let params = ''
      let paramsGraficos = '' // Params separados para gráficos
      
      if (tipoVisao === 'diario' && dia) {
        // KPIs: apenas o dia selecionado
        params = `dia=${dia}`
        
        // Gráficos: mês inteiro para contexto
        const dataSelecionada = new Date(dia + 'T00:00:00')
        const mesData = dataSelecionada.getMonth() + 1
        const anoData = dataSelecionada.getFullYear()
        paramsGraficos = `mes=${mesData}&ano=${anoData}`
      } else if (tipoVisao === 'semanal' && mes && semana) {
        // KPIs: apenas a semana selecionada
        params = `mes=${mes}&ano=${ano}&semana=${semana}`
        
        // Gráficos: mês inteiro para comparar semanas
        paramsGraficos = `mes=${mes}&ano=${ano}`
      } else if (tipoVisao === 'mensal' && mes) {
        // KPIs: apenas o mês selecionado
        params = `mes=${mes}&ano=${ano}`
        
        // Gráficos: range expandido para contexto
        const mesAtual = hoje.getMonth() + 1
        const anoAtual = hoje.getFullYear()
        
        // Se é o mês atual, buscar últimos 6 meses para gráficos
        if (mes === mesAtual && ano === anoAtual) {
          const dataInicio = new Date(ano, mes - 7, 1) // 6 meses antes
          const dataFim = new Date(ano, mes, 0, 23, 59, 59) // Fim do mês atual
          paramsGraficos = `dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`
        } else {
          // Se é mês passado, buscar 3 meses antes e 3 depois para gráficos
          const dataInicio = new Date(ano, mes - 4, 1) // 3 meses antes
          const dataFim = new Date(ano, mes + 2, 0, 23, 59, 59) // 3 meses depois
          paramsGraficos = `dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`
        }
      } else if (tipoVisao === 'anual') {
        // KPIs e Gráficos: mesmo ano
        params = `ano=${ano}`
        paramsGraficos = `ano=${ano}`
      } else if (tipoVisao === 'personalizado' && dataInicio && dataFim) {
        // Período personalizado: usar dataInicio e dataFim
        const inicio = new Date(dataInicio + 'T00:00:00')
        const fim = new Date(dataFim + 'T23:59:59')
        params = `dataInicio=${inicio.toISOString()}&dataFim=${fim.toISOString()}`
        paramsGraficos = params // Usar mesmo período para gráficos
      }
      // Se tipoVisao === 'total', não adiciona nenhum filtro de período (KPIs e gráficos iguais)
      if (tipoVisao === 'total') {
        paramsGraficos = params
      }
      
      // Buscar dados do período exato (KPIs) e dados expandidos (gráficos)
      const promises = [
        fetch(`/api/vendas?${params}`),
        fetch(`/api/relatorios?${params}`),
        fetch(`/api/vendas?${paramsGraficos}`),
        fetch(`/api/relatorios?${paramsGraficos}`)
      ]

      // Buscar dados mensais se for diário
      if (tipoVisao === 'diario' && dia) {
        const dataSelecionada = new Date(dia + 'T00:00:00')
        const mesData = dataSelecionada.getMonth() + 1
        const anoData = dataSelecionada.getFullYear()
        promises.push(fetch(`/api/vendas?mes=${mesData}&ano=${anoData}`))
      }

      const results = await Promise.all(promises)
      
      const vendasData = await results[0].json()
      const relatoriosData = await results[1].json()
      const vendasGraficosData = await results[2].json()
      const relatoriosGraficosData = await results[3].json()
      
      setVendas(vendasData)
      setRelatorios(relatoriosData)
      setVendasGraficos(vendasGraficosData)
      setRelatoriosGraficos(relatoriosGraficosData)

      // Armazenar dados mensais/semanais para meta e projeção
      if (tipoVisao === 'diario' && results[4]) {
        // Diário: usar dados mensais do mês do dia selecionado
        const vendasMensaisData = await results[4].json()
        setVendasMensais(vendasMensaisData)
        setVendasSemanais([])
      } else if (tipoVisao === 'semanal') {
        // Semanal: usar dados semanais (já estão em vendasData)
        setVendasSemanais(vendasData)
        setVendasMensais([])
      } else {
        // Mensal, anual, total, personalizado: usar dados mensais (já estão em vendasData)
        if (tipoVisao === 'mensal' || tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado') {
          setVendasMensais(vendasData)
          setVendasSemanais([])
        } else {
          setVendasMensais([])
          setVendasSemanais([])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [mes, ano, dia, semana, tipoVisao, dataInicio, dataFim])

  // Função auxiliar para verificar se venda deve contar (apenas CONFIRMADAS)
  const vendaDeveContar = (v: any) => v.status === 'CONFIRMADA'
  
  // Calcular KPIs gerais (apenas CONFIRMADAS)
  const vendasConfirmadas = vendas.filter(vendaDeveContar)
  const faturamentoTotal = vendasConfirmadas.reduce((sum, v) => sum + v.valor, 0)
  const qtdVendasTotal = vendasConfirmadas.length
  const ticketMedioGeral = qtdVendasTotal > 0 ? faturamentoTotal / qtdVendasTotal : 0

  // Calcular comissão e salário total da equipe
  // Agrupar vendas por vendedor para calcular comissão individual
  const vendasPorVendedor: Record<string, any[]> = vendasConfirmadas.reduce((acc, venda) => {
    if (!acc[venda.vendedorId]) {
      acc[venda.vendedorId] = []
    }
    acc[venda.vendedorId].push(venda)
    return acc
  }, {} as Record<string, any[]>)

  // Calcular comissão total e salário total da equipe
  let comissaoTotalEquipe = 0
  let salarioFixoTotalEquipe = 0
  
  Object.entries(vendasPorVendedor).forEach(([vendedorId, vendasVendedor]) => {
    const vendedor = vendedores.find(v => v.id === vendedorId)
    if (vendedor && Array.isArray(vendasVendedor)) {
      const faturamentoVendedor = vendasVendedor.reduce((sum: number, v: any) => sum + v.valor, 0)
      const comissaoVendedor = calcularComissao(vendedor.cargo as Cargo, faturamentoVendedor)
      const salarioFixoVendedor = getSalarioFixo(vendedor.cargo as Cargo)
      
      comissaoTotalEquipe += comissaoVendedor
      salarioFixoTotalEquipe += salarioFixoVendedor
    }
  })
  
  const salarioTotalEquipe = salarioFixoTotalEquipe + comissaoTotalEquipe

  // Calcular dados de leads (soma de todos os vendedores)
  const totalLeadsRecebidos = relatorios.reduce((sum, r) => sum + r.leadsRecebidos, 0)
  const totalRespostasEnviadas = relatorios.reduce((sum, r) => sum + r.respostasEnviadas, 0)
  const taxaResposta = totalLeadsRecebidos > 0 
    ? ((totalRespostasEnviadas / totalLeadsRecebidos) * 100).toFixed(1)
    : '0'
  
  // Texto do período para os KPIs de leads
  const textoPeriodo = tipoVisao === 'diario' 
    ? 'no dia' 
    : tipoVisao === 'semanal'
    ? 'na semana'
    : tipoVisao === 'mensal'
    ? 'no mês'
    : tipoVisao === 'anual'
    ? 'no ano'
    : 'no total'

  // Calcular metas (soma das metas de todos os vendedores)
  const metasPorCargo: Record<string, { semanal: number, mensal: number }> = {
    JUNIOR: { semanal: 5, mensal: 20 },
    PLENO: { semanal: 7, mensal: 28 },
    SENIOR: { semanal: 10, mensal: 40 },
    GERENTE: { semanal: 12, mensal: 48 },
  }
  
  // Determinar qual período usar para meta e projeção
  // diário: dados mensais
  // semanal: dados semanais
  // restante: dados mensais
  const usarDadosSemanais = tipoVisao === 'semanal'
  const usarDadosMensais = tipoVisao === 'diario' || tipoVisao === 'mensal' || tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado'
  
  // Vendas para meta e projeção
  const vendasParaMeta = usarDadosSemanais 
    ? vendasSemanais.filter(vendaDeveContar)
    : usarDadosMensais
    ? vendasMensais.filter(vendaDeveContar)
    : vendasConfirmadas
  
  const qtdVendasParaMeta = vendasParaMeta.length
  const faturamentoParaMeta = vendasParaMeta.reduce((sum, v) => sum + v.valor, 0)
  
  // Calcular meta total da equipe
  const metaTotalEquipe = vendedores.reduce((total, vendedor) => {
    const metaVendedor = metasPorCargo[vendedor.cargo] || metasPorCargo.PLENO
    const metaAtual = usarDadosSemanais ? metaVendedor.semanal : metaVendedor.mensal
    return total + metaAtual
  }, 0)
  
  const progressoMeta = metaTotalEquipe > 0 ? (qtdVendasParaMeta / metaTotalEquipe) * 100 : 0
  const metaAtingida = qtdVendasParaMeta >= metaTotalEquipe

  // Dados para projeção
  // diário: projeção mensal (mês do dia selecionado)
  // semanal: projeção semanal (semana selecionada)
  // restante: projeção mensal (mês selecionado)
  let dadosProjecao: { diasDecorridos: number; diasNoMes: number; proximaFaixa: { valor: number; percentual: string } | null } | null = null
  
  const mesAtual = hoje.getMonth() + 1
  const anoAtual = hoje.getFullYear()
  
  // Função auxiliar para calcular intervalo da semana
  const calcularIntervaloSemana = (numeroSemana: number, mes: number, ano: number) => {
    const primeiroDiaMes = new Date(ano, mes - 1, 1)
    const diasNoMes = new Date(ano, mes, 0).getDate()
    
    let diaInicio = 1
    let semanaAtual = 1
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes - 1, dia)
      if (semanaAtual === numeroSemana) {
        diaInicio = dia
        break
      }
      if (data.getDay() === 6) {
        semanaAtual++
      }
    }
    
    let diaFim = diaInicio
    for (let dia = diaInicio; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes - 1, dia)
      diaFim = dia
      if (data.getDay() === 6) {
        break
      }
    }
    
    return { diaInicio, diaFim }
  }
  
  if (usarDadosSemanais) {
    // Projeção semanal: calcular baseado na semana selecionada
    if (mes && semana && ano) {
      const { diaInicio, diaFim } = calcularIntervaloSemana(semana, mes, ano)
      const diasNaSemana = diaFim - diaInicio + 1
      
      // Determinar data de referência: se semana selecionada é futura, usar hoje; se passada, usar último dia da semana
      const dataFimSemana = new Date(ano, mes - 1, diaFim, 23, 59, 59)
      const dataReferencia = dataFimSemana < hoje ? dataFimSemana : hoje
      
      // Calcular dias decorridos até a data de referência
      const diasDecorridosSemana = dataFimSemana < hoje
        ? diasNaSemana // Semana passada: todos os dias decorridos
        : Math.max(0, Math.min(dataReferencia.getDate() - diaInicio + 1, diasNaSemana))
      
      dadosProjecao = {
        diasDecorridos: diasDecorridosSemana,
        diasNoMes: diasNaSemana,
        proximaFaixa: null
      }
    }
  } else if (usarDadosMensais) {
    // Projeção mensal: calcular baseado no mês selecionado
    let mesSelecionado: number | null = null
    let anoSelecionado: number | null = null
    
    if (tipoVisao === 'diario' && dia) {
      // Se for diário, usar o mês do dia selecionado
      const dataSelecionada = new Date(dia + 'T00:00:00')
      mesSelecionado = dataSelecionada.getMonth() + 1
      anoSelecionado = dataSelecionada.getFullYear()
    } else if (tipoVisao === 'mensal' && mes && ano) {
      mesSelecionado = mes
      anoSelecionado = ano
    } else if (tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado') {
      // Para anual, total, personalizado: usar mês atual
      mesSelecionado = mesAtual
      anoSelecionado = anoAtual
    }
    
    if (mesSelecionado && anoSelecionado) {
      const diasNoMesSelecionado = new Date(anoSelecionado, mesSelecionado, 0).getDate()
      
      // Determinar data de referência: se mês selecionado é futuro, usar hoje; se passado, usar último dia do mês
      const dataFimMes = new Date(anoSelecionado, mesSelecionado, 0, 23, 59, 59)
      const dataReferencia = dataFimMes < hoje ? dataFimMes : hoje
      
      // Calcular dias decorridos até a data de referência
      const diasDecorridos = dataFimMes < hoje
        ? diasNoMesSelecionado // Mês passado: todos os dias decorridos
        : dataReferencia.getDate() // Mês atual ou futuro: dias até hoje
      
      dadosProjecao = {
        diasDecorridos: diasDecorridos,
        diasNoMes: diasNoMesSelecionado,
        proximaFaixa: null
      }
    }
  }

  // Filtrar vendas para a tabela
  const vendasFiltradas = filtroVendedor === 'todos' 
    ? vendas 
    : vendas.filter(v => v.vendedorId === filtroVendedor)

  // Determinar período real do gráfico
  const periodoReal = periodoGrafico === 'auto' 
    ? (tipoVisao === 'semanal' ? 'semana' : tipoVisao === 'mensal' ? 'mes' : tipoVisao === 'diario' ? 'dia' : tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado' ? 'mes' : 'dia')
    : periodoGrafico === 'semana' ? 'semana' : periodoGrafico === 'mes' ? 'mes' : 'dia'

  // Filtrar vendas confirmadas dos dados de gráficos
  const vendasConfirmadasGraficos = vendasGraficos.filter(vendaDeveContar)

  // Preparar dados para gráficos (usa dados expandidos)
  const chartDataFaturamento = prepararDadosChartVendas(vendasConfirmadasGraficos, 'valor', tipoVisao, periodoReal, semana, mes, ano)
  const chartDataQuantidade = prepararDadosChartVendas(vendasConfirmadasGraficos, 'count', tipoVisao, periodoReal, semana, mes, ano)

  // Preparar dados de relatórios (usa dados expandidos)
  const chartDataLeads = prepararDadosChartRelatorios(relatoriosGraficos, 'leadsRecebidos', tipoVisao, periodoReal, semana, mes, ano)
  const chartDataRespostas = prepararDadosChartRelatorios(relatoriosGraficos, 'respostasEnviadas', tipoVisao, periodoReal, semana, mes, ano)

  const handleExportarTodasVendas = () => {
    const vendasParaExportar = filtroVendedor === 'todos' ? vendas : vendasFiltradas
    
    if (!vendasParaExportar || vendasParaExportar.length === 0) {
      alert('Não há vendas para exportar!')
      return
    }

    const vendasFormatadas = vendasParaExportar.map(venda => {
      const vendedor = vendedores.find(v => v.id === venda.vendedorId)
      return {
        Data: formatDate(venda.data),
        Vendedor: vendedor?.nome || 'N/A',
        Nome: venda.nome,
        Email: venda.email,
        Valor: `R$ ${venda.valor.toFixed(2)}`,
        Status: venda.status,
        Cupom: venda.cupom || '',
        Plano: venda.plano || '',
        Observacao: venda.observacao || ''
      }
    })

    const periodo = tipoVisao === 'diario' 
      ? dia?.split('-').reverse().join('-') 
      : tipoVisao === 'mensal'
      ? `${mes}-${ano}`
      : `${ano}`

    const filtro = filtroVendedor === 'todos' ? 'todas' : vendedores.find(v => v.id === filtroVendedor)?.nome.toLowerCase()

    exportarParaCSV(
      vendasFormatadas,
      `vendas_time_${filtro}_${periodo}.csv`
    )
  }

  const handleExportarTodosRelatorios = () => {
    if (!relatorios || relatorios.length === 0) {
      alert('Não há relatórios para exportar!')
      return
    }

    const relatoriosFormatados = relatorios.map(relatorio => {
      const vendedor = vendedores.find(v => v.id === relatorio.vendedorId)
      return {
        Data: formatDate(relatorio.data),
        Vendedor: vendedor?.nome || 'N/A',
        'Leads Recebidos': relatorio.leadsRecebidos,
        'Respostas Enviadas': relatorio.respostasEnviadas,
        'Vendas Realizadas': relatorio.vendasRealizadas,
        'Taxa de Resposta (%)': relatorio.leadsRecebidos > 0 
          ? ((relatorio.respostasEnviadas / relatorio.leadsRecebidos) * 100).toFixed(2)
          : '0.00',
        Observacao: relatorio.observacao || ''
      }
    })

    const periodo = tipoVisao === 'diario' 
      ? dia?.split('-').reverse().join('-') 
      : tipoVisao === 'mensal'
      ? `${mes}-${ano}`
      : `${ano}`

    exportarParaCSV(
      relatoriosFormatados,
      `relatorios_time_${periodo}.csv`
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral do Time</h2>
        <p className="text-muted-foreground">
          Consolidado de todos os vendedores
        </p>
      </div>

      {/* Seletor de Período */}
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

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Faturamento Total"
          value={formatCurrency(faturamentoTotal)}
          subtitle="Vendas confirmadas"
          icon={DollarSign}
        />
        <KPICard
          title="Total de Vendas"
          value={qtdVendasTotal.toString()}
          subtitle="Confirmadas no período"
          icon={ShoppingCart}
        />
        <KPICard
          title="Ticket Médio Geral"
          value={formatCurrency(ticketMedioGeral)}
          icon={TrendingUp}
        />
        <KPICard
          title="Comissão Total"
          value={formatCurrency(comissaoTotalEquipe)}
          subtitle="Total da equipe"
          icon={Percent}
        />
      </div>

      {/* Meta de Vendas */}
      {(usarDadosSemanais || usarDadosMensais) && (
        <Card className={`${metaAtingida ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-green-500/30' : 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                🎯 Meta de Vendas {usarDadosSemanais ? 'Semanal' : 'Mensal'} - Equipe
              </CardTitle>
              <span className={`text-2xl font-bold ${metaAtingida ? 'text-green-600' : 'text-blue-600'}`}>
                {qtdVendasParaMeta}/{metaTotalEquipe || 0}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.min(100, progressoMeta).toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${metaAtingida ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                  style={{ width: `${Math.min(100, progressoMeta)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {metaAtingida ? (
                <>
                  <span className="text-green-600 font-medium">✅ Meta atingida!</span>
                  {progressoMeta > 100 && (
                    <span className="text-muted-foreground">
                      (+{(qtdVendasParaMeta - metaTotalEquipe)} vendas acima)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  {metaTotalEquipe > 0 
                    ? `Faltam ${metaTotalEquipe - qtdVendasParaMeta} vendas para atingir a meta da equipe`
                    : 'Meta não configurada para este período'
                  }
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projeção de Faturamento */}
      {dadosProjecao && (
        <ProjecaoCard
          faturamentoAtual={faturamentoParaMeta}
          diasDecorridos={dadosProjecao.diasDecorridos}
          diasNoMes={dadosProjecao.diasNoMes}
          proximaFaixa={dadosProjecao.proximaFaixa}
        />
      )}

      {/* KPIs de Leads - Sempre Visível */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Recebidos
            </CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalLeadsRecebidos}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Total do time {textoPeriodo}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Respostas Enviadas
            </CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalRespostasEnviadas}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Total do time {textoPeriodo}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Resposta
            </CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{taxaResposta}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Respostas / Leads recebidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleExportarTodasVendas}
          variant="secondary"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Vendas
        </Button>
        <Button 
          onClick={handleExportarTodosRelatorios}
          variant="secondary"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Relatórios
        </Button>
      </div>

      {/* Seletor de Período do Gráfico */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gráficos de Vendas</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Visualizar por:</label>
          <Select value={periodoGrafico} onValueChange={(v: any) => setPeriodoGrafico(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automático</SelectItem>
              <SelectItem value="dia">Por Dia</SelectItem>
              <SelectItem value="semana">Por Semana</SelectItem>
              <SelectItem value="mes">Por Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gráficos de Vendas */}
      <div className={`grid gap-4 ${tipoVisao === 'total' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <SimpleLineChart
          title={
            periodoReal === 'mes' ? "Faturamento por Mês" : 
            periodoReal === 'semana' ? "Faturamento por Semana" : 
            "Faturamento por Dia"
          }
          data={chartDataFaturamento}
          color="#8b5cf6"
        />
        <SimpleBarChart
          title={
            periodoReal === 'mes' ? "Quantidade de Vendas por Mês" : 
            periodoReal === 'semana' ? "Quantidade de Vendas por Semana" : 
            "Quantidade de Vendas por Dia"
          }
          data={chartDataQuantidade}
          color="#10b981"
        />
      </div>

      {/* Gráficos de Relatórios */}
      <h3 className="text-lg font-semibold mt-4">Gráficos de Relatórios</h3>
      <div className={`grid gap-4 ${tipoVisao === 'total' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <SimpleLineChart
          title={
            periodoReal === 'mes' ? "Leads Recebidos por Mês" : 
            periodoReal === 'semana' ? "Leads Recebidos por Semana" : 
            "Leads Recebidos por Dia"
          }
          data={chartDataLeads}
          color="#3b82f6"
        />
        <SimpleLineChart
          title={
            periodoReal === 'mes' ? "Respostas Enviadas por Mês" : 
            periodoReal === 'semana' ? "Respostas Enviadas por Semana" : 
            "Respostas Enviadas por Dia"
          }
          data={chartDataRespostas}
          color="#f59e0b"
        />
      </div>

      {/* Funil de Conversão */}
      <FunilConversao
        leadsRecebidos={totalLeadsRecebidos}
        respostasEnviadas={totalRespostasEnviadas}
        vendasFechadas={qtdVendasTotal}
      />

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Vendas do Período</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtrar por vendedor:</span>
              <Select value={filtroVendedor} onValueChange={setFiltroVendedor}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {vendedores.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VendasTable
            vendas={vendasFiltradas.map(v => ({
              ...v,
              nome: `${v.nome} (${vendedores.find(vend => vend.id === v.vendedorId)?.nome || 'Desconhecido'})`
            }))}
            showComissao={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Retorna o número da semana no mês (1-6) baseado em domingo=0 a sábado=6
function getWeekOfMonth(date: Date): number {
  const primeiroDiaMes = new Date(date.getFullYear(), date.getMonth(), 1)
  const diaDaSemanaInicio = primeiroDiaMes.getDay() // 0=domingo, 1=segunda, ..., 6=sábado
  
  const diaAtual = date.getDate()
  
  // Calcular quantos dias desde o início do mês até o primeiro domingo
  // Se o mês começa num domingo (0), não precisa ajustar
  // Se começa numa segunda (1), precisa de 6 dias até o domingo, etc.
  const diasAteSegundaSemana = 7 - diaDaSemanaInicio
  
  if (diaAtual <= diasAteSegundaSemana) {
    return 1 // Primeira semana (pode ser parcial)
  }
  
  // Dias restantes após a primeira semana
  const diasAposSegundaSemana = diaAtual - diasAteSegundaSemana
  
  // Cada 7 dias completos = 1 semana adicional
  const semanasCompletas = Math.floor(diasAposSegundaSemana / 7)
  
  return 2 + semanasCompletas
}

function prepararDadosChartVendas(
  vendas: any[], 
  tipo: 'valor' | 'count', 
  tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado',
  periodoGrafico: 'dia' | 'semana' | 'mes' = 'dia',
  semanaSelecionada: number | null = null,
  mesSelecionado: number | null = null,
  anoSelecionado: number | null = null
) {
  // Se período do gráfico for MÊS ou for visão ANUAL/TOTAL/PERSONALIZADO, agrupa por MÊS com ANO
  // CORRIGIDO: Adicionado tipo 'personalizado' para corrigir erro TypeScript no build
  if (periodoGrafico === 'mes' || tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado') {
    const dadosPorMesAno: Record<string, number> = {}
    const mesesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    // Identificar todos os anos presentes nos dados
    const anos = new Set<number>()
    vendas.forEach(v => {
      const ano = new Date(v.data).getFullYear()
      anos.add(ano)
    })
    
    // Se não houver dados, usar o ano atual
    if (anos.size === 0) {
      anos.add(new Date().getFullYear())
    }
    
    // Inicializar TODOS os meses para todos os anos com 0
    Array.from(anos).forEach(ano => {
      for (let mes = 0; mes < 12; mes++) {
        const chave = `${ano}-${mes}`
        dadosPorMesAno[chave] = 0
      }
    })
    
    // Preencher com os dados reais
    vendas.forEach(v => {
      const data = new Date(v.data)
      const ano = data.getFullYear()
      const mes = data.getMonth()
      const chave = `${ano}-${mes}`
      dadosPorMesAno[chave] += tipo === 'valor' ? v.valor : 1
    })

    return Object.entries(dadosPorMesAno)
      .map(([chave, valor]) => {
        const [anoStr, mesStr] = chave.split('-')
        const ano = parseInt(anoStr)
        const mes = parseInt(mesStr)
        // Destacar o mês selecionado
        const isSelected = mesSelecionado && anoSelecionado && 
                          mes === (mesSelecionado - 1) && ano === anoSelecionado
        return {
          name: `${mesesNome[mes]} ${ano}`,
          value: valor,
          sortKey: ano * 100 + mes,
          highlight: isSelected
        }
      })
      .sort((a, b) => a.sortKey - b.sortKey)
  }
  
  // Se período do gráfico for SEMANA, agrupa por SEMANA
  if (periodoGrafico === 'semana') {
    const dadosPorSemana: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
    
    vendas.forEach(v => {
      const data = new Date(v.data)
      const semana = getWeekOfMonth(data)
      dadosPorSemana[semana] += tipo === 'valor' ? v.valor : 1
    })

    // Função auxiliar para calcular o intervalo de dias de uma semana
    const getWeekRange = (numeroSemana: number, mes: number, ano: number) => {
      const primeiroDiaMes = new Date(ano, mes - 1, 1)
      const diasNoMes = new Date(ano, mes, 0).getDate()
      const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
      
      let diaInicio = 1
      let semanaAtual = 1
      
      // Encontrar o dia de início da semana
      for (let dia = 1; dia <= diasNoMes; dia++) {
        const data = new Date(ano, mes - 1, dia)
        
        if (semanaAtual === numeroSemana) {
          diaInicio = dia
          break
        }
        
        if (data.getDay() === 6) { // Sábado = fim da semana
          semanaAtual++
        }
      }
      
      // Encontrar o dia final da semana
      let diaFim = diaInicio
      for (let dia = diaInicio; dia <= diasNoMes; dia++) {
        const data = new Date(ano, mes - 1, dia)
        diaFim = dia
        if (data.getDay() === 6) { // Sábado
          break
        }
      }
      
      const diaInicioStr = String(diaInicio).padStart(2, '0')
      const diaFimStr = String(diaFim).padStart(2, '0')
      const mesAbrev = mesesAbrev[mes - 1]
      
      return `${diaInicioStr}a${diaFimStr} ${mesAbrev}`
    }

    return Object.entries(dadosPorSemana)
      .map(([semana, valor]) => ({
        name: mesSelecionado && anoSelecionado 
          ? getWeekRange(parseInt(semana), mesSelecionado, anoSelecionado)
          : `Semana ${semana}`,
        value: valor,
        highlight: semanaSelecionada === parseInt(semana)
      }))
      .sort((a, b) => {
        const semanaA = parseInt(a.name.includes('Semana') ? a.name.split(' ')[1] : a.name.split('a')[0])
        const semanaB = parseInt(b.name.includes('Semana') ? b.name.split(' ')[1] : b.name.split('a')[0])
        return semanaA - semanaB
      })
  }
  
  // Para DIA, agrupa por DIA - mostrar TODOS os dias do mês
  const dadosPorDia: Record<number, number> = {}
  
  // Determinar o mês/ano para calcular quantos dias tem
  let diasNoMes = 31
  if (vendas.length > 0) {
    const primeiraData = new Date(vendas[0].data)
    const mes = primeiraData.getMonth()
    const ano = primeiraData.getFullYear()
    diasNoMes = new Date(ano, mes + 1, 0).getDate()
  }
  
  // Inicializar TODOS os dias do mês com 0
  for (let dia = 1; dia <= diasNoMes; dia++) {
    dadosPorDia[dia] = 0
  }
  
  // Preencher com os dados reais
  vendas.forEach(v => {
    const dia = new Date(v.data).getDate()
    dadosPorDia[dia] += tipo === 'valor' ? v.valor : 1
  })

  return Object.entries(dadosPorDia)
    .map(([dia, valor]) => ({
      name: dia,
      value: valor
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name))
}

function prepararDadosChartRelatorios(
  relatorios: any[], 
  campo: string, 
  tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado',
  periodoGrafico: 'dia' | 'semana' | 'mes' = 'dia',
  semanaSelecionada: number | null = null,
  mesSelecionado: number | null = null,
  anoSelecionado: number | null = null
) {
  // Se período do gráfico for MÊS ou for visão ANUAL/TOTAL/PERSONALIZADO, agrupa por MÊS com ANO
  if (periodoGrafico === 'mes' || tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado') {
    const dadosPorMesAno: Record<string, number> = {}
    const mesesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    // Identificar todos os anos presentes nos dados
    const anos = new Set<number>()
    relatorios.forEach(r => {
      const ano = new Date(r.data).getFullYear()
      anos.add(ano)
    })
    
    // Se não houver dados, usar o ano atual
    if (anos.size === 0) {
      anos.add(new Date().getFullYear())
    }
    
    // Inicializar TODOS os meses para todos os anos com 0
    Array.from(anos).forEach(ano => {
      for (let mes = 0; mes < 12; mes++) {
        const chave = `${ano}-${mes}`
        dadosPorMesAno[chave] = 0
      }
    })
    
    // Preencher com os dados reais
    relatorios.forEach(r => {
      const data = new Date(r.data)
      const ano = data.getFullYear()
      const mes = data.getMonth()
      const chave = `${ano}-${mes}`
      dadosPorMesAno[chave] += r[campo]
    })

    return Object.entries(dadosPorMesAno)
      .map(([chave, valor]) => {
        const [anoStr, mesStr] = chave.split('-')
        const ano = parseInt(anoStr)
        const mes = parseInt(mesStr)
        // Destacar o mês selecionado
        const isSelected = mesSelecionado && anoSelecionado && 
                          mes === (mesSelecionado - 1) && ano === anoSelecionado
        return {
          name: `${mesesNome[mes]} ${ano}`,
          value: valor,
          sortKey: ano * 100 + mes,
          highlight: isSelected
        }
      })
      .sort((a, b) => a.sortKey - b.sortKey)
  }
  
  // Se período do gráfico for SEMANA, agrupa por SEMANA
  if (periodoGrafico === 'semana') {
    const dadosPorSemana: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
    
    relatorios.forEach(r => {
      const data = new Date(r.data)
      const semana = getWeekOfMonth(data)
      dadosPorSemana[semana] += r[campo]
    })

    // Função auxiliar para calcular o intervalo de dias de uma semana
    const getWeekRange = (numeroSemana: number, mes: number, ano: number) => {
      const primeiroDiaMes = new Date(ano, mes - 1, 1)
      const diasNoMes = new Date(ano, mes, 0).getDate()
      const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
      
      let diaInicio = 1
      let semanaAtual = 1
      
      // Encontrar o dia de início da semana
      for (let dia = 1; dia <= diasNoMes; dia++) {
        const data = new Date(ano, mes - 1, dia)
        
        if (semanaAtual === numeroSemana) {
          diaInicio = dia
          break
        }
        
        if (data.getDay() === 6) { // Sábado = fim da semana
          semanaAtual++
        }
      }
      
      // Encontrar o dia final da semana
      let diaFim = diaInicio
      for (let dia = diaInicio; dia <= diasNoMes; dia++) {
        const data = new Date(ano, mes - 1, dia)
        diaFim = dia
        if (data.getDay() === 6) { // Sábado
          break
        }
      }
      
      const diaInicioStr = String(diaInicio).padStart(2, '0')
      const diaFimStr = String(diaFim).padStart(2, '0')
      const mesAbrev = mesesAbrev[mes - 1]
      
      return `${diaInicioStr}a${diaFimStr} ${mesAbrev}`
    }

    return Object.entries(dadosPorSemana)
      .map(([semana, valor]) => ({
        name: mesSelecionado && anoSelecionado 
          ? getWeekRange(parseInt(semana), mesSelecionado, anoSelecionado)
          : `Semana ${semana}`,
        value: valor,
        highlight: semanaSelecionada === parseInt(semana)
      }))
      .sort((a, b) => {
        const semanaA = parseInt(a.name.includes('Semana') ? a.name.split(' ')[1] : a.name.split('a')[0])
        const semanaB = parseInt(b.name.includes('Semana') ? b.name.split(' ')[1] : b.name.split('a')[0])
        return semanaA - semanaB
      })
  }
  
  // Para DIA, agrupa por DIA - mostrar TODOS os dias do mês
  const dadosPorDia: Record<number, number> = {}
  
  // Determinar o mês/ano para calcular quantos dias tem
  let diasNoMes = 31
  if (relatorios.length > 0) {
    const primeiraData = new Date(relatorios[0].data)
    const mes = primeiraData.getMonth()
    const ano = primeiraData.getFullYear()
    diasNoMes = new Date(ano, mes + 1, 0).getDate()
  }
  
  // Inicializar TODOS os dias do mês com 0
  for (let dia = 1; dia <= diasNoMes; dia++) {
    dadosPorDia[dia] = 0
  }
  
  // Preencher com os dados reais
  relatorios.forEach(r => {
    const dia = new Date(r.data).getDate()
    if (dadosPorDia[dia] !== undefined) {
      dadosPorDia[dia] += r[campo]
    }
  })

  return Object.entries(dadosPorDia)
    .map(([dia, valor]) => ({
      name: dia,
      value: valor
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name))
}


