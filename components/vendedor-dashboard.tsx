'use client'

import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Percent, Plus, Download } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { ProjecaoCard } from '@/components/projecao-card'
import { VendasTable } from '@/components/vendas-table'
import { VendaDialog } from '@/components/venda-dialog'
import { RelatorioDialog } from '@/components/relatorio-dialog'
import { SimpleLineChart, SimpleBarChart } from '@/components/charts'
import { PeriodSelector } from '@/components/period-selector'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { calcularComissao, getInfoFaixa, getSalarioFixo, calcularRemuneracaoTotal, Cargo } from '@/lib/comissao'
import { exportarParaCSV, formatarVendasParaExport, formatarRelatoriosParaExport } from '@/lib/export-utils'

interface VendedorDashboardProps {
  vendedor: {
    id: string
    nome: string
    cargo: string
  }
}

export function VendedorDashboard({ vendedor }: VendedorDashboardProps) {
  const hoje = new Date()
  const [mes, setMes] = useState<number | null>(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [dia, setDia] = useState<string | null>(hoje.toISOString().split('T')[0])
  const [semana, setSemana] = useState<number | null>(1)
  const [tipoVisao, setTipoVisao] = useState<'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado'>('mensal')
  const [dataInicio, setDataInicio] = useState<string | null>(null)
  const [dataFim, setDataFim] = useState<string | null>(null)
  const [periodoGrafico, setPeriodoGrafico] = useState<'auto' | 'dia' | 'semana' | 'mes'>('auto')
  const [vendas, setVendas] = useState<any[]>([]) // Dados do período exato (para KPIs e tabela)
  const [relatorios, setRelatorios] = useState<any[]>([]) // Dados do período exato
  const [vendasGraficos, setVendasGraficos] = useState<any[]>([]) // Dados expandidos para gráficos
  const [relatoriosGraficos, setRelatoriosGraficos] = useState<any[]>([]) // Dados expandidos para gráficos
  const [vendasPeriodoAnterior, setVendasPeriodoAnterior] = useState<any[]>([]) // Para comparação
  const [relatoriosPeriodoAnterior, setRelatoriosPeriodoAnterior] = useState<any[]>([]) // Para comparação
  const [loading, setLoading] = useState(true)
  const [vendaDialogOpen, setVendaDialogOpen] = useState(false)
  const [relatorioDialogOpen, setRelatorioDialogOpen] = useState(false)
  const [vendaEdit, setVendaEdit] = useState<any>(null)
  const [relatorioEdit, setRelatorioEdit] = useState<any>(null)

  const carregarDados = async () => {
    setLoading(true)
    try {
      let params = `vendedorId=${vendedor.id}`
      let paramsGraficos = `vendedorId=${vendedor.id}` // Params separados para gráficos
      let paramsPeriodoAnterior = `vendedorId=${vendedor.id}` // Params para período anterior
      
      if (tipoVisao === 'diario' && dia) {
        // KPIs: apenas o dia selecionado
        params += `&dia=${dia}`
        
        // Período anterior: dia anterior
        const dataSelecionada = new Date(dia + 'T00:00:00')
        const dataAnterior = new Date(dataSelecionada)
        dataAnterior.setDate(dataAnterior.getDate() - 1)
        const diaAnterior = dataAnterior.toISOString().split('T')[0]
        paramsPeriodoAnterior += `&dia=${diaAnterior}`
        
        // Gráficos: mês inteiro para contexto
        const mesData = dataSelecionada.getMonth() + 1
        const anoData = dataSelecionada.getFullYear()
        paramsGraficos += `&mes=${mesData}&ano=${anoData}`
      } else if (tipoVisao === 'semanal' && mes && semana) {
        // KPIs: apenas a semana selecionada
        params += `&mes=${mes}&ano=${ano}&semana=${semana}`
        
        // Período anterior: semana anterior
        let mesAnterior = mes
        let anoAnterior = ano
        let semanaAnterior = semana - 1
        if (semanaAnterior < 1) {
          // Se era primeira semana, ir para última semana do mês anterior
          mesAnterior = mes - 1
          if (mesAnterior < 1) {
            mesAnterior = 12
            anoAnterior = ano - 1
          }
          // Calcular quantas semanas tem o mês anterior
          const diasNoMesAnterior = new Date(anoAnterior, mesAnterior, 0).getDate()
          semanaAnterior = Math.ceil(diasNoMesAnterior / 7)
        }
        paramsPeriodoAnterior += `&mes=${mesAnterior}&ano=${anoAnterior}&semana=${semanaAnterior}`
        
        // Gráficos: mês inteiro para comparar semanas
        paramsGraficos += `&mes=${mes}&ano=${ano}`
      } else if (tipoVisao === 'mensal' && mes) {
        // KPIs: apenas o mês selecionado
        params += `&mes=${mes}&ano=${ano}`
        
        // Período anterior: mês anterior
        let mesAnterior = mes - 1
        let anoAnterior = ano
        if (mesAnterior < 1) {
          mesAnterior = 12
          anoAnterior = ano - 1
        }
        paramsPeriodoAnterior += `&mes=${mesAnterior}&ano=${anoAnterior}`
        
        // Gráficos: range expandido para contexto
        const hoje = new Date()
        const mesAtual = hoje.getMonth() + 1
        const anoAtual = hoje.getFullYear()
        
        // Se é o mês atual, buscar últimos 6 meses para gráficos
        if (mes === mesAtual && ano === anoAtual) {
          const dataInicio = new Date(ano, mes - 7, 1) // 6 meses antes
          const dataFim = new Date(ano, mes, 0, 23, 59, 59) // Fim do mês atual
          paramsGraficos += `&dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`
        } else {
          // Se é mês passado, buscar 3 meses antes e 3 depois para gráficos
          const dataInicio = new Date(ano, mes - 4, 1) // 3 meses antes
          const dataFim = new Date(ano, mes + 2, 0, 23, 59, 59) // 3 meses depois
          paramsGraficos += `&dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`
        }
      } else if (tipoVisao === 'anual') {
        // KPIs e Gráficos: mesmo ano
        params += `&ano=${ano}`
        paramsGraficos += `&ano=${ano}`
        
        // Período anterior: ano anterior
        paramsPeriodoAnterior += `&ano=${ano - 1}`
      } else if (tipoVisao === 'personalizado' && dataInicio && dataFim) {
        // Período personalizado: usar dataInicio e dataFim
        const inicio = new Date(dataInicio + 'T00:00:00')
        const fim = new Date(dataFim + 'T23:59:59')
        params += `&dataInicio=${inicio.toISOString()}&dataFim=${fim.toISOString()}`
        paramsGraficos = params // Usar mesmo período para gráficos
      }
      // Se tipoVisao === 'total', não adiciona nenhum filtro de período (KPIs e gráficos iguais)
      if (tipoVisao === 'total') {
        paramsGraficos = params
      }
      
      // Buscar dados do período exato (KPIs), expandidos (gráficos) e período anterior (comparação)
      const [vendasRes, relatoriosRes, vendasGraficosRes, relatoriosGraficosRes, vendasAnteriorRes, relatoriosAnteriorRes] = await Promise.all([
        fetch(`/api/vendas?${params}`),
        fetch(`/api/relatorios?${params}`),
        fetch(`/api/vendas?${paramsGraficos}`),
        fetch(`/api/relatorios?${paramsGraficos}`),
        fetch(`/api/vendas?${paramsPeriodoAnterior}`),
        fetch(`/api/relatorios?${paramsPeriodoAnterior}`)
      ])
      
      const vendasData = await vendasRes.json()
      const relatoriosData = await relatoriosRes.json()
      const vendasGraficosData = await vendasGraficosRes.json()
      const relatoriosGraficosData = await relatoriosGraficosRes.json()
      const vendasAnteriorData = await vendasAnteriorRes.json()
      const relatoriosAnteriorData = await relatoriosAnteriorRes.json()
      
      setVendas(vendasData)
      setRelatorios(relatoriosData)
      setVendasGraficos(vendasGraficosData)
      setRelatoriosGraficos(relatoriosGraficosData)
      setVendasPeriodoAnterior(vendasAnteriorData)
      setRelatoriosPeriodoAnterior(relatoriosAnteriorData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [mes, ano, dia, semana, tipoVisao, dataInicio, dataFim, vendedor.id])

  // Calcular KPIs do período atual
  const vendasConfirmadas = vendas.filter(v => v.status === 'CONFIRMADA')
  const faturamento = vendasConfirmadas.reduce((sum, v) => sum + v.valor, 0)
  const qtdVendas = vendasConfirmadas.length
  const ticketMedio = qtdVendas > 0 ? faturamento / qtdVendas : 0
  
  // Calcular comissão e remuneração
  const comissao = calcularComissao(vendedor.cargo as Cargo, faturamento)
  const salarioFixo = getSalarioFixo(vendedor.cargo as Cargo)
  const salarioTotal = calcularRemuneracaoTotal(vendedor.cargo as Cargo, faturamento)
  const infoFaixa = getInfoFaixa(vendedor.cargo as Cargo, faturamento)

  // Calcular KPIs do período anterior (para comparação)
  const vendasConfirmadasAnterior = vendasPeriodoAnterior.filter(v => v.status === 'CONFIRMADA')
  const faturamentoAnterior = vendasConfirmadasAnterior.reduce((sum, v) => sum + v.valor, 0)
  const qtdVendasAnterior = vendasConfirmadasAnterior.length
  const ticketMedioAnterior = qtdVendasAnterior > 0 ? faturamentoAnterior / qtdVendasAnterior : 0
  const comissaoAnterior = calcularComissao(vendedor.cargo as Cargo, faturamentoAnterior)

  // Calcular KPIs de relatórios
  const leadsRecebidos = relatorios.reduce((sum, r) => sum + r.leadsRecebidos, 0)
  const respostasEnviadas = relatorios.reduce((sum, r) => sum + r.respostasEnviadas, 0)
  const leadsRecebidosAnterior = relatoriosPeriodoAnterior.reduce((sum, r) => sum + r.leadsRecebidos, 0)
  const respostasEnviadasAnterior = relatoriosPeriodoAnterior.reduce((sum, r) => sum + r.respostasEnviadas, 0)

  // Calcular variações percentuais
  const calcularVariacao = (atual: number, anterior: number) => {
    if (anterior === 0) return atual > 0 ? 100 : 0
    return ((atual - anterior) / anterior) * 100
  }

  const variacaoFaturamento = calcularVariacao(faturamento, faturamentoAnterior)
  const variacaoVendas = calcularVariacao(qtdVendas, qtdVendasAnterior)
  const variacaoTicket = calcularVariacao(ticketMedio, ticketMedioAnterior)
  const variacaoComissao = calcularVariacao(comissao, comissaoAnterior)
  const variacaoLeads = calcularVariacao(leadsRecebidos, leadsRecebidosAnterior)
  const variacaoRespostas = calcularVariacao(respostasEnviadas, respostasEnviadasAnterior)

  // Label do período de comparação
  const labelComparacao = tipoVisao === 'diario' ? 'vs dia anterior' 
    : tipoVisao === 'semanal' ? 'vs semana anterior'
    : tipoVisao === 'mensal' ? 'vs mês anterior'
    : tipoVisao === 'anual' ? 'vs ano anterior'
    : ''

  // Adicionar comissão estimada nas vendas
  const vendasComComissao = vendas.map(v => ({
    ...v,
    comissaoEstimada: v.status === 'CONFIRMADA' ? v.valor * infoFaixa.percentual : 0
  }))

  // Determinar período real do gráfico
  const periodoReal = periodoGrafico === 'auto' 
    ? (tipoVisao === 'semanal' ? 'semana' : tipoVisao === 'mensal' ? 'mes' : tipoVisao === 'diario' ? 'dia' : tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado' ? 'mes' : 'dia')
    : periodoGrafico === 'semana' ? 'semana' : periodoGrafico === 'mes' ? 'mes' : 'dia'

  // Filtrar vendas confirmadas dos dados de gráficos
  const vendasConfirmadasGraficos = vendasGraficos.filter(v => v.status === 'CONFIRMADA')

  // Preparar dados para gráficos de vendas (usa dados expandidos)
  const chartDataFaturamento = prepararDadosChart(vendasConfirmadasGraficos, 'valor', tipoVisao, periodoReal, semana, mes, ano)
  const chartDataQuantidade = prepararDadosChart(vendasConfirmadasGraficos, 'count', tipoVisao, periodoReal, semana, mes, ano)

  // Preparar dados para gráficos de relatórios (usa dados expandidos)
  const chartDataLeads = prepararDadosChartRelatorios(relatoriosGraficos, 'leadsRecebidos', tipoVisao, periodoReal, semana, mes, ano)
  const chartDataRespostas = prepararDadosChartRelatorios(relatoriosGraficos, 'respostasEnviadas', tipoVisao, periodoReal, semana, mes, ano)

  // Calcular dados de leads (para qualquer período)
  const leadsRecebidosPeriodo = relatorios.reduce((sum, r) => sum + r.leadsRecebidos, 0)
  const respostasEnviadasPeriodo = relatorios.reduce((sum, r) => sum + r.respostasEnviadas, 0)
  const vendasPeriodo = relatorios.reduce((sum, r) => sum + r.vendas, 0)
  const taxaRespostaPeriodo = leadsRecebidosPeriodo > 0 
    ? ((respostasEnviadasPeriodo / leadsRecebidosPeriodo) * 100).toFixed(1)
    : '0'
  
  // Dados para projeção (apenas para visão mensal)
  let dadosProjecao: { diasDecorridos: number; diasNoMes: number; proximaFaixa: { valor: number; percentual: string } | null } | null = null
  
  if (tipoVisao === 'mensal' && mes && ano) {
    const hoje = new Date()
    const mesAtual = hoje.getMonth() + 1
    const anoAtual = hoje.getFullYear()
    
    // Só mostrar projeção se for o mês atual
    if (mes === mesAtual && ano === anoAtual) {
      const diaAtual = hoje.getDate()
      const diasNoMesAtual = new Date(ano, mes, 0).getDate()
      
      // Encontrar próxima faixa
      const FAIXAS = vendedor.cargo === 'JUNIOR' 
        ? [{ valor: 40000, percentual: '3%' }, { valor: 50000, percentual: '4%' }, { valor: 60000, percentual: '5%' }]
        : [{ valor: 40000, percentual: '7%' }, { valor: 50000, percentual: '8%' }, { valor: 60000, percentual: '9%' }]
      
      const proximaFaixa = FAIXAS.find(f => f.valor > faturamento)
      
      dadosProjecao = {
        diasDecorridos: diaAtual,
        diasNoMes: diasNoMesAtual,
        proximaFaixa: proximaFaixa || null
      }
    }
  }

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

  // Calcular metas (baseado em vendas por semana)
  const metasPorCargo: Record<string, { semanal: number, mensal: number }> = {
    JUNIOR: { semanal: 5, mensal: 20 },
    PLENO: { semanal: 7, mensal: 28 },
    SENIOR: { semanal: 10, mensal: 40 },
    GERENTE: { semanal: 12, mensal: 48 },
  }
  
  const metaAtual = metasPorCargo[vendedor.cargo] || metasPorCargo.PLENO
  const metaVendas = tipoVisao === 'semanal' ? metaAtual.semanal : metaAtual.mensal
  const progressoMeta = metaVendas > 0 ? (qtdVendas / metaVendas) * 100 : 0
  const metaAtingida = qtdVendas >= metaVendas

  const handleSaveVenda = async (venda: any) => {
    try {
      if (venda.id) {
        await fetch(`/api/vendas/${venda.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(venda)
        })
      } else {
        await fetch('/api/vendas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(venda)
        })
      }
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar venda:', error)
    }
  }

  const handleDeleteVenda = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await fetch(`/api/vendas/${id}`, { method: 'DELETE' })
        carregarDados()
      } catch (error) {
        console.error('Erro ao excluir venda:', error)
      }
    }
  }

  const handleSaveRelatorio = async (relatorio: any) => {
    try {
      if (relatorio.id) {
        await fetch(`/api/relatorios/${relatorio.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(relatorio)
        })
      } else {
        await fetch('/api/relatorios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(relatorio)
        })
      }
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar relatório:', error)
    }
  }

  const handleExportarVendas = () => {
    if (!vendas || vendas.length === 0) {
      alert('Não há vendas para exportar!')
      return
    }

    const vendasFormatadas = vendas.map(venda => ({
      Data: formatDate(venda.data),
      Nome: venda.nome,
      Email: venda.email,
      Valor: `R$ ${venda.valor.toFixed(2)}`,
      Status: venda.status,
      Observacao: venda.observacao || ''
    }))

    const periodo = tipoVisao === 'diario' 
      ? dia?.split('-').reverse().join('-') 
      : tipoVisao === 'mensal'
      ? `${mes}-${ano}`
      : `${ano}`

    exportarParaCSV(
      vendasFormatadas,
      `vendas_${vendedor.nome.toLowerCase()}_${periodo}.csv`
    )
  }

  const handleExportarRelatorios = () => {
    if (!relatorios || relatorios.length === 0) {
      alert('Não há relatórios para exportar!')
      return
    }

    const relatoriosFormatados = relatorios.map(relatorio => ({
      Data: formatDate(relatorio.data),
      'Leads Recebidos': relatorio.leadsRecebidos,
      'Respostas Enviadas': relatorio.respostasEnviadas,
      'Vendas Realizadas': relatorio.vendasRealizadas,
      'Taxa de Resposta (%)': relatorio.leadsRecebidos > 0 
        ? ((relatorio.respostasEnviadas / relatorio.leadsRecebidos) * 100).toFixed(2)
        : '0.00',
      Observacao: relatorio.observacao || ''
    }))

    const periodo = tipoVisao === 'diario' 
      ? dia?.split('-').reverse().join('-') 
      : tipoVisao === 'mensal'
      ? `${mes}-${ano}`
      : `${ano}`

    exportarParaCSV(
      relatoriosFormatados,
      `relatorios_${vendedor.nome.toLowerCase()}_${periodo}.csv`
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
        <h2 className="text-3xl font-bold tracking-tight">{vendedor.nome}</h2>
        <p className="text-muted-foreground">
          Cargo: <span className="font-medium">{vendedor.cargo}</span>
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Faturamento"
          value={formatCurrency(faturamento)}
          subtitle={infoFaixa.descricao}
          icon={DollarSign}
          trend={tipoVisao !== 'total' && tipoVisao !== 'personalizado' ? {
            value: variacaoFaturamento,
            isPositive: variacaoFaturamento >= 0,
            label: labelComparacao
          } : undefined}
        />
        <KPICard
          title="Vendas Confirmadas"
          value={qtdVendas.toString()}
          subtitle="No período"
          icon={ShoppingCart}
          trend={tipoVisao !== 'total' && tipoVisao !== 'personalizado' ? {
            value: variacaoVendas,
            isPositive: variacaoVendas >= 0,
            label: labelComparacao
          } : undefined}
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(ticketMedio)}
          icon={TrendingUp}
          trend={tipoVisao !== 'total' && tipoVisao !== 'personalizado' ? {
            value: variacaoTicket,
            isPositive: variacaoTicket >= 0,
            label: labelComparacao
          } : undefined}
        />
        <KPICard
          title="Comissão"
          value={formatCurrency(comissao)}
          subtitle={`Alíquota: ${infoFaixa.percentualFormatado}`}
          icon={Percent}
          trend={tipoVisao !== 'total' && tipoVisao !== 'personalizado' ? {
            value: variacaoComissao,
            isPositive: variacaoComissao >= 0,
            label: labelComparacao
          } : undefined}
        />
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Salário Total
            </CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salarioTotal)}</div>
            <p className="text-xs text-green-100 mt-1">
              Fixo: {formatCurrency(salarioFixo)} + Comissão: {formatCurrency(comissao)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Meta de Vendas */}
      {(tipoVisao === 'semanal' || tipoVisao === 'mensal') && (
        <Card className={`${metaAtingida ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-green-500/30' : 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                🎯 Meta de Vendas {tipoVisao === 'semanal' ? 'Semanal' : 'Mensal'}
              </CardTitle>
              <span className={`text-2xl font-bold ${metaAtingida ? 'text-green-600' : 'text-blue-600'}`}>
                {qtdVendas}/{metaVendas}
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
                      (+{(qtdVendas - metaVendas)} vendas acima)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  Faltam {metaVendas - qtdVendas} vendas para atingir a meta
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projeção de Faturamento (apenas para mês atual) */}
      {dadosProjecao && (
        <ProjecaoCard
          faturamentoAtual={faturamento}
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
            <div className="text-2xl font-bold text-blue-600">{leadsRecebidosPeriodo}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {textoPeriodo}
            </p>
            {tipoVisao !== 'total' && tipoVisao !== 'personalizado' && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                variacaoLeads === 0 
                  ? 'text-muted-foreground' 
                  : variacaoLeads >= 0 
                    ? 'text-green-600 dark:text-green-500' 
                    : 'text-red-600 dark:text-red-500'
              }`}>
                {variacaoLeads === 0 ? '—' : `${variacaoLeads >= 0 ? '+' : ''}${variacaoLeads.toFixed(1)}%`} {labelComparacao}
              </div>
            )}
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
            <div className="text-2xl font-bold text-green-600">{respostasEnviadasPeriodo}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {textoPeriodo}
            </p>
            {tipoVisao !== 'total' && tipoVisao !== 'personalizado' && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                variacaoRespostas === 0 
                  ? 'text-muted-foreground' 
                  : variacaoRespostas >= 0 
                    ? 'text-green-600 dark:text-green-500' 
                    : 'text-red-600 dark:text-red-500'
              }`}>
                {variacaoRespostas === 0 ? '—' : `${variacaoRespostas >= 0 ? '+' : ''}${variacaoRespostas.toFixed(1)}%`} {labelComparacao}
              </div>
            )}
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
            <div className="text-2xl font-bold text-purple-600">{taxaRespostaPeriodo}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Respostas / Leads recebidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={() => {
            setVendaEdit(null)
            setVendaDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Venda
        </Button>
        <Button 
          onClick={() => {
            setRelatorioEdit(null)
            setRelatorioDialogOpen(true)
          }}
          variant="outline"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Relatório Diário
        </Button>
        <Button 
          onClick={handleExportarVendas}
          variant="secondary"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Vendas
        </Button>
        <Button 
          onClick={handleExportarRelatorios}
          variant="secondary"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Relatórios
        </Button>
      </div>

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <VendasTable
            vendas={vendasComComissao}
            onEdit={(venda) => {
              setVendaEdit(venda)
              setVendaDialogOpen(true)
            }}
            onDelete={handleDeleteVenda}
            showComissao
          />
        </CardContent>
      </Card>

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

      {/* Dialogs */}
      <VendaDialog
        open={vendaDialogOpen}
        onOpenChange={setVendaDialogOpen}
        onSave={handleSaveVenda}
        venda={vendaEdit}
        vendedorId={vendedor.id}
      />

      <RelatorioDialog
        open={relatorioDialogOpen}
        onOpenChange={setRelatorioDialogOpen}
        onSave={handleSaveRelatorio}
        relatorio={relatorioEdit}
        vendedorId={vendedor.id}
      />
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

function prepararDadosChart(
  vendas: any[], 
  tipo: 'valor' | 'count', 
  tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total',
  periodoGrafico: 'dia' | 'semana' | 'mes' = 'dia',
  semanaSelecionada: number | null = null,
  mesSelecionado: number | null = null,
  anoSelecionado: number | null = null
) {
  // Se período do gráfico for MÊS ou for visão ANUAL/TOTAL, agrupa por MÊS com ANO
  if (periodoGrafico === 'mes' || tipoVisao === 'anual' || tipoVisao === 'total') {
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
      const diaDaSemanaInicio = primeiroDiaMes.getDay()
      const diasNoMes = new Date(ano, mes, 0).getDate()
      const mesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
      
      let diaInicio = 1
      let semanaAtual = 1
      
      // Encontrar o dia de início da semana
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
        highlight: semanaSelecionada === parseInt(semana) // Destacar semana selecionada
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
  campo: 'leadsRecebidos' | 'respostasEnviadas', 
  tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total',
  periodoGrafico: 'dia' | 'semana' | 'mes' = 'dia',
  semanaSelecionada: number | null = null,
  mesSelecionado: number | null = null,
  anoSelecionado: number | null = null
) {
  // Se período do gráfico for MÊS ou for visão ANUAL/TOTAL, agrupa por MÊS com ANO
  if (periodoGrafico === 'mes' || tipoVisao === 'anual' || tipoVisao === 'total') {
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


