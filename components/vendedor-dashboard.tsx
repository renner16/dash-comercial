'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Percent, Plus, Download, Eye, EyeOff } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { ProjecaoCard } from '@/components/projecao-card'
import { FunilConversao } from '@/components/funil-conversao'
import { VendasTable } from '@/components/vendas-table'
import { VendaDialog } from '@/components/venda-dialog'
import { RelatorioDialog } from '@/components/relatorio-dialog'
import { LeadsTable } from '@/components/leads-table'
import { SimpleLineChart } from '@/components/charts'
import { PeriodSelector } from '@/components/period-selector'
import { ChecklistVendedor } from '@/components/checklist-vendedor'
import { ObservacoesVendedor } from '@/components/observacoes-vendedor'
import { NotificacoesRenovacao } from '@/components/notificacoes-renovacao'
import { SidebarVendedor } from '@/components/sidebar-vendedor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { calcularComissao, getInfoFaixa, getSalarioFixo, calcularRemuneracaoTotal, Cargo } from '@/lib/comissao'
import { exportarParaCSV, formatarVendasParaExport, formatarRelatoriosParaExport } from '@/lib/export-utils'

interface VendedorDashboardProps {
  vendedor: {
    id: string
    nome: string
    cargo: string
  }
  activeTab?: string
  onTabChange?: (tab: string) => void
  onExportBackupReady?: (exportFn: () => void) => void
}

export function VendedorDashboard({ vendedor, activeTab: activeTabProp, onTabChange: onTabChangeProp, onExportBackupReady }: VendedorDashboardProps) {
  const hoje = new Date()
  const anoAtual = hoje.getFullYear()
  const [mes, setMes] = useState<number | null>(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [dia, setDia] = useState<string | null>(hoje.toISOString().split('T')[0])
  const [semana, setSemana] = useState<number | null>(1)
  const [tipoVisao, setTipoVisao] = useState<'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado'>('mensal')
  const [dataInicio, setDataInicio] = useState<string | null>(null)
  const [dataFim, setDataFim] = useState<string | null>(null)
  const [periodoGrafico, setPeriodoGrafico] = useState<'auto' | 'dia' | 'semana' | 'mes'>('auto')
  const [periodoFunil, setPeriodoFunil] = useState<'auto' | 'dia' | 'semana' | 'mes'>('auto')
  const [vendas, setVendas] = useState<any[]>([]) // Dados do período exato (para KPIs e tabela)
  const [relatorios, setRelatorios] = useState<any[]>([]) // Dados do período exato
  const [vendasGraficos, setVendasGraficos] = useState<any[]>([]) // Dados expandidos para gráficos
  const [relatoriosGraficos, setRelatoriosGraficos] = useState<any[]>([]) // Dados expandidos para gráficos
  const [vendasPeriodoAnterior, setVendasPeriodoAnterior] = useState<any[]>([]) // Para comparação
  const [relatoriosPeriodoAnterior, setRelatoriosPeriodoAnterior] = useState<any[]>([]) // Para comparação
  const [vendasMensais, setVendasMensais] = useState<any[]>([]) // Dados mensais (para meta e projeção quando diário)
  const [vendasSemanais, setVendasSemanais] = useState<any[]>([]) // Dados semanais (para meta e projeção quando semanal)
  const [todasVendas, setTodasVendas] = useState<any[]>([]) // Todas as vendas (para renovações)
  const [todosRelatorios, setTodosRelatorios] = useState<any[]>([]) // Todos os relatórios (para renovações)
  const [loading, setLoading] = useState(true)
  const [vendaDialogOpen, setVendaDialogOpen] = useState(false)
  const [relatorioDialogOpen, setRelatorioDialogOpen] = useState(false)
  const [vendaEdit, setVendaEdit] = useState<any>(null)
  const [relatorioEdit, setRelatorioEdit] = useState<any>(null)
  const [activeTabInternal, setActiveTabInternal] = useState('visao-geral')
  const [valoresVisiveis, setValoresVisiveis] = useState(false)
  const [periodoGraficoFinanceiro, setPeriodoGraficoFinanceiro] = useState<'auto' | 'dia' | 'semana' | 'mes'>('auto')
  const [periodoGraficoLeads, setPeriodoGraficoLeads] = useState<'auto' | 'dia' | 'semana' | 'mes'>('auto')
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`sidebarOpen_${vendedor.id}`)
      return saved !== null ? saved === 'true' : true
    }
    return true
  })
  
  // Usar prop se fornecida, senão usar estado interno
  // Usar activeTabInternal como fonte da verdade, mas sincronizar com prop externa
  const activeTab = activeTabInternal
  const setActiveTab = (tab: string) => {
    setActiveTabInternal(tab)
    onTabChangeProp?.(tab)
  }

  const carregarDados = useCallback(async () => {
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

      // Se período do gráfico for "mensal" OU se for "automático" com visão mensal (para relatórios),
      // garantir que os dados sejam sempre buscados como diários (usando dataInicio e dataFim)
      // para poder agrupar corretamente no frontend
      const precisaDadosDiarios = periodoGrafico === 'mes' || (periodoGrafico === 'auto' && tipoVisao === 'mensal')
      if (precisaDadosDiarios && !paramsGraficos.includes('dataInicio')) {
        // Determinar o range de datas baseado na visão atual
        let dataInicio: Date
        let dataFim: Date
        
        if (tipoVisao === 'mensal' && mes && ano) {
          // Se visão mensal, usar o range já calculado (já está em paramsGraficos com dataInicio)
          // Mas se não estiver, calcular
          const hoje = new Date()
          const mesAtual = hoje.getMonth() + 1
          const anoAtual = hoje.getFullYear()
          
          if (mes === mesAtual && ano === anoAtual) {
            dataInicio = new Date(ano, mes - 7, 1) // 6 meses antes
            dataFim = new Date(ano, mes, 0, 23, 59, 59) // Fim do mês atual
          } else {
            dataInicio = new Date(ano, mes - 4, 1) // 3 meses antes
            dataFim = new Date(ano, mes + 2, 0, 23, 59, 59) // 3 meses depois
          }
        } else if (tipoVisao === 'anual' && ano) {
          // Se visão anual, buscar todos os dias do ano
          dataInicio = new Date(ano, 0, 1) // 1º de janeiro
          dataFim = new Date(ano, 11, 31, 23, 59, 59) // 31 de dezembro
        } else if (tipoVisao === 'diario' && dia) {
          // Se visão diária, buscar o mês inteiro do dia selecionado
          const dataSelecionada = new Date(dia + 'T00:00:00')
          const mesData = dataSelecionada.getMonth() + 1
          const anoData = dataSelecionada.getFullYear()
          dataInicio = new Date(anoData, mesData - 1, 1) // Início do mês
          dataFim = new Date(anoData, mesData, 0, 23, 59, 59) // Fim do mês
        } else if (tipoVisao === 'semanal' && mes && ano) {
          // Se visão semanal, buscar o mês inteiro
          dataInicio = new Date(ano, mes - 1, 1) // Início do mês
          dataFim = new Date(ano, mes, 0, 23, 59, 59) // Fim do mês
        } else if (tipoVisao === 'total') {
          // Se visão total, buscar todos os dados disponíveis (sem filtro de data)
          // Mas para gráfico mensal, vamos buscar últimos 12 meses
          const hoje = new Date()
          dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1) // 12 meses atrás
        } else {
          // Fallback: usar mês atual
          const hoje = new Date()
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1) // 6 meses atrás
          dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)
        }
        
        // Substituir paramsGraficos para usar dataInicio e dataFim (dados diários)
        paramsGraficos = `vendedorId=${vendedor.id}&dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`
      }

      // Buscar dados do período exato (KPIs), expandidos (gráficos) e período anterior (comparação)
      // Também buscar TODAS as vendas e relatórios para renovações (sem filtro de período)
      const promises = [
        fetch(`/api/vendas?${params}`),
        fetch(`/api/relatorios?${params}`),
        fetch(`/api/vendas?${paramsGraficos}`),
        fetch(`/api/relatorios?${paramsGraficos}`),
        fetch(`/api/vendas?${paramsPeriodoAnterior}`),
        fetch(`/api/relatorios?${paramsPeriodoAnterior}`),
        fetch(`/api/vendas?vendedorId=${vendedor.id}`), // Todas as vendas para renovações
        fetch(`/api/relatorios?vendedorId=${vendedor.id}`) // Todos os relatórios para renovações
      ]

      // Buscar dados mensais se for diário
      if (tipoVisao === 'diario' && dia) {
        const dataSelecionada = new Date(dia + 'T00:00:00')
        const mesData = dataSelecionada.getMonth() + 1
        const anoData = dataSelecionada.getFullYear()
        promises.push(fetch(`/api/vendas?vendedorId=${vendedor.id}&mes=${mesData}&ano=${anoData}`))
      }

      const results = await Promise.all(promises)

      const vendasData = await results[0].json()
      const relatoriosData = await results[1].json()
      const vendasGraficosData = await results[2].json()
      const relatoriosGraficosData = await results[3].json()
      const vendasAnteriorData = await results[4].json()
      const relatoriosAnteriorData = await results[5].json()
      const todasVendasData = await results[6].json()
      const todosRelatoriosData = await results[7].json()

      setVendas(vendasData)
      setRelatorios(relatoriosData)
      setVendasGraficos(vendasGraficosData)
      setRelatoriosGraficos(relatoriosGraficosData)
      setVendasPeriodoAnterior(vendasAnteriorData)
      setRelatoriosPeriodoAnterior(relatoriosAnteriorData)
      setTodasVendas(todasVendasData)
      setTodosRelatorios(todosRelatoriosData)

      // Armazenar dados mensais/semanais para meta e projeção
      if (tipoVisao === 'diario' && results[6]) {
        // Diário: usar dados mensais do mês do dia selecionado
        const vendasMensaisData = await results[6].json()
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
  }, [mes, ano, dia, semana, tipoVisao, dataInicio, dataFim, vendedor.id, periodoGrafico, periodoFunil])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // Carregar estado de visibilidade dos valores do localStorage
  useEffect(() => {
    const visibilidadeSalva = localStorage.getItem(`valoresVisiveis_${vendedor.id}`)
    if (visibilidadeSalva === 'true') {
      setValoresVisiveis(true)
    }
  }, [vendedor.id])

  // Salvar estado de visibilidade dos valores no localStorage
  useEffect(() => {
    localStorage.setItem(`valoresVisiveis_${vendedor.id}`, valoresVisiveis.toString())
  }, [valoresVisiveis, vendedor.id])

  // Função auxiliar para verificar se venda deve contar (apenas CONFIRMADAS)
  const vendaDeveContar = (v: any) => v.status === 'CONFIRMADA'

  // Robustez anti-crash: garantir que arrays sejam sempre arrays
  const vendasSeguras = Array.isArray(vendas) ? vendas : []
  const relatoriosSeguros = Array.isArray(relatorios) ? relatorios : []
  const vendasGraficosSeguras = Array.isArray(vendasGraficos) ? vendasGraficos : []
  const relatoriosGraficosSeguros = Array.isArray(relatoriosGraficos) ? relatoriosGraficos : []
  const vendasPeriodoAnteriorSeguras = Array.isArray(vendasPeriodoAnterior) ? vendasPeriodoAnterior : []
  const relatoriosPeriodoAnteriorSeguros = Array.isArray(relatoriosPeriodoAnterior) ? relatoriosPeriodoAnterior : []
  const vendasMensaisSeguras = Array.isArray(vendasMensais) ? vendasMensais : []
  const vendasSemanaisSeguras = Array.isArray(vendasSemanais) ? vendasSemanais : []


  // Calcular KPIs do período atual
  const vendasConfirmadas = vendasSeguras.filter(vendaDeveContar)
  const faturamento = vendasConfirmadas.reduce((sum, v) => sum + (v?.valor || 0), 0)
  const qtdVendas = vendasConfirmadas.length
  const ticketMedio = qtdVendas > 0 ? faturamento / qtdVendas : 0

  // Calcular comissão e remuneração
  // Para período anual, calcular comissão baseada no faturamento médio mensal
  let faturamentoParaComissao = faturamento
  let comissao: number
  let salarioTotal: number
  
  if (tipoVisao === 'anual' && ano) {
    // Para anual: calcular faturamento médio mensal e multiplicar comissão por 12
    const faturamentoMensalMedio = faturamento / 12
    const comissaoMensal = calcularComissao(vendedor.cargo as Cargo, faturamentoMensalMedio)
    comissao = comissaoMensal * 12
    
    // Calcular quantos meses já passaram no ano (apenas meses recebidos, não futuros)
    const dataInicioAno = new Date(ano, 0, 1, 0, 0, 0) // 1º de janeiro
    const dataFimAno = new Date(ano, 11, 31, 23, 59, 59) // 31 de dezembro
    const dataReferencia = dataFimAno < hoje ? dataFimAno : hoje
    
    // Calcular meses decorridos (considerando o mês atual como completo se já passou)
    let mesesDecorridos: number
    if (ano < anoAtual) {
      mesesDecorridos = 12 // Ano passado: todos os meses
    } else if (ano > anoAtual) {
      mesesDecorridos = 0 // Ano futuro: nenhum mês
    } else {
      // Ano atual: contar meses até hoje (incluindo o mês atual)
      mesesDecorridos = dataReferencia.getMonth() + 1
    }
    
    const salarioFixo = getSalarioFixo(vendedor.cargo as Cargo)
    salarioTotal = (salarioFixo * mesesDecorridos) + comissao
    faturamentoParaComissao = faturamentoMensalMedio // Para infoFaixa usar mensal
  } else {
    // Para outros períodos: calcular normalmente
    comissao = calcularComissao(vendedor.cargo as Cargo, faturamento)
    salarioTotal = calcularRemuneracaoTotal(vendedor.cargo as Cargo, faturamento)
    faturamentoParaComissao = faturamento
  }
  
  const salarioFixo = getSalarioFixo(vendedor.cargo as Cargo)
  
  // Calcular salário fixo para exibição (apenas meses recebidos quando anual)
  let salarioFixoParaExibicao = salarioFixo
  if (tipoVisao === 'anual' && ano) {
    const dataInicioAno = new Date(ano, 0, 1, 0, 0, 0)
    const dataFimAno = new Date(ano, 11, 31, 23, 59, 59)
    const dataReferencia = dataFimAno < hoje ? dataFimAno : hoje
    let mesesDecorridos: number
    if (ano < anoAtual) {
      mesesDecorridos = 12
    } else if (ano > anoAtual) {
      mesesDecorridos = 0
    } else {
      mesesDecorridos = dataReferencia.getMonth() + 1
    }
    salarioFixoParaExibicao = salarioFixo * mesesDecorridos
  }
  const infoFaixa = getInfoFaixa(vendedor.cargo as Cargo, faturamentoParaComissao)

  // Calcular KPIs do período anterior (para comparação)
  const vendasConfirmadasAnterior = vendasPeriodoAnteriorSeguras.filter(vendaDeveContar)
  const faturamentoAnterior = vendasConfirmadasAnterior.reduce((sum, v) => sum + (v?.valor || 0), 0)
  const qtdVendasAnterior = vendasConfirmadasAnterior.length
  const ticketMedioAnterior = qtdVendasAnterior > 0 ? faturamentoAnterior / qtdVendasAnterior : 0
  const comissaoAnterior = calcularComissao(vendedor.cargo as Cargo, faturamentoAnterior)

  // Calcular KPIs de relatórios
  const leadsRecebidos = relatoriosSeguros.reduce((sum, r) => sum + (r?.leadsRecebidos || 0), 0)
  const respostasEnviadas = relatoriosSeguros.reduce((sum, r) => sum + (r?.respostasEnviadas || 0), 0)
  const leadsRecebidosAnterior = relatoriosPeriodoAnteriorSeguros.reduce((sum, r) => sum + (r?.leadsRecebidos || 0), 0)
  const respostasEnviadasAnterior = relatoriosPeriodoAnteriorSeguros.reduce((sum, r) => sum + (r?.respostasEnviadas || 0), 0)

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
  const vendasComComissao = vendasSeguras.map(v => ({
    ...v,
    comissaoEstimada: vendaDeveContar(v) ? (v?.valor || 0) * infoFaixa.percentual : 0
  }))

  // Determinar período real do gráfico para vendas
  const periodoReal = periodoGrafico === 'auto'
    ? (tipoVisao === 'semanal' ? 'semana' : tipoVisao === 'mensal' ? 'mes' : tipoVisao === 'diario' ? 'dia' : tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado' ? 'mes' : 'dia')
    : periodoGrafico === 'semana' ? 'semana' : periodoGrafico === 'mes' ? 'mes' : 'dia'

  // Determinar período real do gráfico para relatórios (Leads e Respostas)
  // Quando o período for mensal, sempre mostrar dados diários
  const periodoRealRelatorios = periodoGrafico === 'auto'
    ? (tipoVisao === 'semanal' ? 'semana' : tipoVisao === 'mensal' ? 'dia' : tipoVisao === 'diario' ? 'dia' : tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado' ? 'dia' : 'dia')
    : periodoGrafico === 'semana' ? 'semana' : periodoGrafico === 'mes' ? 'dia' : 'dia'

  // Filtrar vendas confirmadas dos dados de gráficos
  const vendasConfirmadasGraficos = vendasGraficosSeguras.filter(vendaDeveContar)

  // Preparar dados para gráficos de vendas (usa dados expandidos)
  const chartDataFaturamento = prepararDadosChart(vendasConfirmadasGraficos, 'valor', tipoVisao, periodoReal, semana, mes, ano)
  const chartDataQuantidade = prepararDadosChart(vendasConfirmadasGraficos, 'count', tipoVisao, periodoReal, semana, mes, ano)

  // Preparar dados para gráficos de relatórios (usa dados expandidos com período diário quando automático)
  const chartDataLeads = prepararDadosChartRelatorios(relatoriosGraficosSeguros, 'leadsRecebidos', tipoVisao, periodoRealRelatorios, semana, mes, ano)
  const chartDataRespostas = prepararDadosChartRelatorios(relatoriosGraficosSeguros, 'respostasEnviadas', tipoVisao, periodoRealRelatorios, semana, mes, ano)

  // Verificar se o período inclui 2025 (ano atual)
  // Se incluir, filtrar dados para apenas 2025 nas métricas de conversão
  const periodoInclui2025 = 
    tipoVisao === 'total' ||
    tipoVisao === 'personalizado' ||
    (tipoVisao === 'anual' && ano === anoAtual) ||
    (tipoVisao === 'mensal' && ano === anoAtual) ||
    (tipoVisao === 'semanal' && ano === anoAtual) ||
    (tipoVisao === 'diario' && dia && new Date(dia + 'T00:00:00').getFullYear() === anoAtual)

  // Filtrar dados para métricas de conversão (apenas 2025 quando período incluir 2025)
  const relatoriosParaConversao = periodoInclui2025
    ? relatoriosSeguros.filter(r => r?.data && new Date(r.data).getFullYear() === anoAtual)
    : relatoriosSeguros
  
  const vendasParaConversao = periodoInclui2025
    ? vendasConfirmadas.filter(v => v?.data && new Date(v.data).getFullYear() === anoAtual)
    : vendasConfirmadas

  // Calcular dados de leads (para métricas de conversão, usar apenas dados de 2025 quando período incluir 2025)
  const leadsRecebidosPeriodo = relatoriosParaConversao.reduce((sum, r) => sum + r.leadsRecebidos, 0)
  const respostasEnviadasPeriodo = relatoriosParaConversao.reduce((sum, r) => sum + r.respostasEnviadas, 0)
  const vendasPeriodo = relatoriosParaConversao.reduce((sum, r) => sum + r.vendas, 0)
  const qtdVendasParaConversao = vendasParaConversao.length
  const taxaRespostaPeriodo = leadsRecebidosPeriodo > 0
    ? ((respostasEnviadasPeriodo / leadsRecebidosPeriodo) * 100).toFixed(1)
    : '0'
  const taxaConversaoPeriodo = leadsRecebidosPeriodo > 0
    ? ((qtdVendasParaConversao / leadsRecebidosPeriodo) * 100).toFixed(1)
    : '0'

  // Determinar período real do funil
  const periodoRealFunil = periodoFunil === 'auto'
    ? (tipoVisao === 'semanal' ? 'semana' : tipoVisao === 'mensal' ? 'mes' : tipoVisao === 'diario' ? 'dia' : tipoVisao === 'anual' || tipoVisao === 'total' || tipoVisao === 'personalizado' ? 'mes' : 'dia')
    : periodoFunil === 'semana' ? 'semana' : periodoFunil === 'mes' ? 'mes' : 'dia'

  // Função auxiliar para calcular intervalo da semana (usada no funil)
  const calcularIntervaloSemanaFunil = (numeroSemana: number, mes: number, ano: number) => {
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

  // Filtrar dados do funil baseado no período selecionado
  const filtrarDadosPorPeriodo = (dados: any[], campoData: string = 'data') => {
    if (periodoRealFunil === 'dia' && tipoVisao === 'diario' && dia) {
      return dados.filter(d => {
        const dataItem = new Date(d[campoData])
        return dataItem.toISOString().split('T')[0] === dia
      })
    } else if (periodoRealFunil === 'semana' && tipoVisao === 'semanal' && mes && semana && ano) {
      // Calcular intervalo da semana
      const { diaInicio, diaFim } = calcularIntervaloSemanaFunil(semana, mes, ano)
      const dataInicio = new Date(ano, mes - 1, diaInicio, 0, 0, 0)
      const dataFim = new Date(ano, mes - 1, diaFim, 23, 59, 59)
      return dados.filter(d => {
        const dataItem = new Date(d[campoData])
        return dataItem >= dataInicio && dataItem <= dataFim
      })
    } else if (periodoRealFunil === 'mes' && tipoVisao === 'mensal' && mes && ano) {
      const dataInicio = new Date(ano, mes - 1, 1, 0, 0, 0)
      const dataFim = new Date(ano, mes, 0, 23, 59, 59)
      return dados.filter(d => {
        const dataItem = new Date(d[campoData])
        return dataItem >= dataInicio && dataItem <= dataFim
      })
    } else if (tipoVisao === 'anual' && ano) {
      const dataInicio = new Date(ano, 0, 1, 0, 0, 0)
      const dataFim = new Date(ano, 11, 31, 23, 59, 59)
      return dados.filter(d => {
        const dataItem = new Date(d[campoData])
        return dataItem >= dataInicio && dataItem <= dataFim
      })
    }
    return dados // Retornar todos se não houver filtro específico
  }

  // Calcular dados do funil baseado no período selecionado
  // Filtrar para apenas 2025 quando período incluir 2025
  const relatoriosFunilFiltrados = periodoInclui2025
    ? relatoriosSeguros.filter(r => r?.data && new Date(r.data).getFullYear() === anoAtual)
    : relatoriosSeguros
  const vendasFunilFiltradas = periodoInclui2025
    ? vendasConfirmadas.filter(v => v?.data && new Date(v.data).getFullYear() === anoAtual)
    : vendasConfirmadas
  
  const relatoriosFunil = filtrarDadosPorPeriodo(relatoriosFunilFiltrados)
  const vendasFunil = filtrarDadosPorPeriodo(vendasFunilFiltradas, 'data')
  
  const leadsRecebidosFunil = relatoriosFunil.reduce((sum, r) => sum + (r?.leadsRecebidos || 0), 0)
  const respostasEnviadasFunil = relatoriosFunil.reduce((sum, r) => sum + (r?.respostasEnviadas || 0), 0)
  const vendasFechadasFunil = vendasFunil.length

  // Calcular metas (baseado em vendas por semana)
  const metasPorCargo: Record<string, { diaria: number, semanal: number, mensal: number, anual: number }> = {
    JUNIOR: { diaria: 1, semanal: 5, mensal: 20, anual: 240 },
    PLENO: { diaria: 1, semanal: 7, mensal: 28, anual: 336 },
    SENIOR: { diaria: 2, semanal: 10, mensal: 40, anual: 480 },
    GERENTE: { diaria: 2, semanal: 12, mensal: 48, anual: 576 },
  }

  // Metas de faturamento por cargo e período (baseado nas faixas do plano de carreiras)
  // Meta mensal: primeira faixa de faturamento (40.000)
  // Meta semanal: mensal / 4.33 (média de semanas no mês)
  // Meta diária: mensal / 30
  // Meta anual: mensal * 12
  const metasFaturamentoPorCargo: Record<string, { diaria: number, semanal: number, mensal: number, anual: number }> = {
    JUNIOR: { diaria: 1333.33, semanal: 9237.76, mensal: 40000, anual: 480000 },
    PLENO: { diaria: 1333.33, semanal: 9237.76, mensal: 40000, anual: 480000 },
    SENIOR: { diaria: 1333.33, semanal: 9237.76, mensal: 40000, anual: 480000 },
    GERENTE: { diaria: 1333.33, semanal: 9237.76, mensal: 40000, anual: 480000 },
  }

  // Determinar qual período usar para meta e projeção
  const usarDadosDiarios = tipoVisao === 'diario'
  const usarDadosSemanais = tipoVisao === 'semanal'
  const usarDadosMensais = tipoVisao === 'mensal' || tipoVisao === 'total' || tipoVisao === 'personalizado'
  const usarDadosAnuais = tipoVisao === 'anual'

  // Vendas para meta e projeção
  let vendasParaMeta = vendasConfirmadas
  if (usarDadosDiarios && dia) {
    // Para diário, usar apenas as vendas do dia selecionado
    const dataSelecionada = new Date(dia + 'T00:00:00')
    vendasParaMeta = vendasSeguras.filter(v => {
      if (!v?.data) return false
      const dataVenda = new Date(v.data)
      return dataVenda.toISOString().split('T')[0] === dia && vendaDeveContar(v)
    })
  } else if (usarDadosSemanais) {
    vendasParaMeta = vendasSemanaisSeguras.filter(vendaDeveContar)
  } else if (usarDadosAnuais && ano) {
    // Para anual, filtrar vendas do ano selecionado
    vendasParaMeta = vendasSeguras.filter(v => {
      if (!v?.data) return false
      const dataVenda = new Date(v.data)
      return dataVenda.getFullYear() === ano && vendaDeveContar(v)
    })
  } else if (usarDadosMensais) {
    vendasParaMeta = vendasMensaisSeguras.filter(vendaDeveContar)
  }

  const qtdVendasParaMeta = vendasParaMeta.length
  const faturamentoParaMeta = vendasParaMeta.reduce((sum, v) => sum + (v?.valor || 0), 0)
  
  // Calcular comissão para meta/projeção
  // Para anual, calcular comissão baseada no faturamento médio mensal e multiplicar por 12
  const comissaoParaMeta = usarDadosAnuais
    ? calcularComissao(vendedor.cargo as Cargo, faturamentoParaMeta / 12) * 12
    : calcularComissao(vendedor.cargo as Cargo, faturamentoParaMeta)

  const metaAtual = metasPorCargo[vendedor.cargo] || metasPorCargo.PLENO
  const metaFaturamentoAtual = metasFaturamentoPorCargo[vendedor.cargo] || metasFaturamentoPorCargo.PLENO
  
  // Determinar meta de quantidade baseada no período
  let metaVendas: number
  let metaFaturamento: number
  let textoPeriodoMeta: string
  
  if (usarDadosDiarios) {
    metaVendas = metaAtual.diaria
    metaFaturamento = metaFaturamentoAtual.diaria
    textoPeriodoMeta = 'Diária'
  } else if (usarDadosSemanais) {
    metaVendas = metaAtual.semanal
    metaFaturamento = metaFaturamentoAtual.semanal
    textoPeriodoMeta = 'Semanal'
  } else if (usarDadosAnuais) {
    metaVendas = metaAtual.anual
    metaFaturamento = metaFaturamentoAtual.anual
    textoPeriodoMeta = 'Anual'
  } else {
    metaVendas = metaAtual.mensal
    metaFaturamento = metaFaturamentoAtual.mensal
    textoPeriodoMeta = 'Mensal'
  }

  const progressoMetaVendas = metaVendas > 0 ? (qtdVendasParaMeta / metaVendas) * 100 : 0
  const progressoMetaFaturamento = metaFaturamento > 0 ? (faturamentoParaMeta / metaFaturamento) * 100 : 0
  const metaAtingidaVendas = qtdVendasParaMeta >= metaVendas
  const metaAtingidaFaturamento = faturamentoParaMeta >= metaFaturamento
  const metaAtingida = metaAtingidaVendas && metaAtingidaFaturamento

  // Dados para projeção
  // diário: projeção mensal (mês do dia selecionado)
  // semanal: projeção semanal (semana selecionada)
  // restante: projeção mensal (mês selecionado)
  let dadosProjecao: { diasDecorridos: number; diasNoMes: number; proximaFaixa: { valor: number; percentual: string } | null } | null = null

  const mesAtual = hoje.getMonth() + 1

  // Função auxiliar para calcular intervalo da semana comercial (Quarta → Terça)
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
  } else if (usarDadosAnuais && ano) {
    // Projeção anual: calcular baseado no ano selecionado
    const dataInicioAno = new Date(ano, 0, 1, 0, 0, 0) // 1º de janeiro
    const dataFimAno = new Date(ano, 11, 31, 23, 59, 59) // 31 de dezembro
    const diasNoAno = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0) ? 366 : 365 // Ano bissexto
    
    // Determinar data de referência: se ano selecionado é futuro, usar hoje; se passado, usar último dia do ano
    const dataReferencia = dataFimAno < hoje ? dataFimAno : hoje
    
    // Calcular dias decorridos desde o início do ano até a data de referência
    const diasDecorridos = dataFimAno < hoje
      ? diasNoAno // Ano passado: todos os dias decorridos
      : Math.floor((dataReferencia.getTime() - dataInicioAno.getTime()) / (1000 * 60 * 60 * 24)) + 1 // Dias desde 1º de janeiro
    
    // Encontrar próxima faixa (apenas para ano atual)
    let proximaFaixa: { valor: number; percentual: string } | null = null
    if (ano === anoAtual) {
      const FAIXAS = vendedor.cargo === 'JUNIOR'
        ? [{ valor: 40000, percentual: '3%' }, { valor: 50000, percentual: '4%' }, { valor: 60000, percentual: '5%' }]
        : vendedor.cargo === 'PLENO'
          ? [{ valor: 40000, percentual: '7%' }, { valor: 50000, percentual: '8%' }, { valor: 60000, percentual: '9%' }]
          : vendedor.cargo === 'SENIOR'
            ? [{ valor: 40000, percentual: '10%' }, { valor: 50000, percentual: '11%' }, { valor: 60000, percentual: '12%' }]
            : [{ valor: 40000, percentual: '13%' }, { valor: 50000, percentual: '14%' }, { valor: 60000, percentual: '15%' }]
      
      // Para anual, verificar próxima faixa mensal (multiplicar por 12 para anual)
      const faturamentoMensalMedio = faturamentoParaMeta / (diasDecorridos / 30.44) // Média mensal baseada nos dias decorridos
      proximaFaixa = FAIXAS.find(f => f.valor > faturamentoMensalMedio) 
        ? { valor: (FAIXAS.find(f => f.valor > faturamentoMensalMedio)!.valor * 12), percentual: FAIXAS.find(f => f.valor > faturamentoMensalMedio)!.percentual }
        : null
    }

    dadosProjecao = {
      diasDecorridos: diasDecorridos,
      diasNoMes: diasNoAno,
      proximaFaixa: proximaFaixa
    }
  } else if (usarDadosMensais) {
    // Projeção mensal: calcular baseado no mês selecionado
    let mesSelecionado: number | null = null
    let anoSelecionado: number | null = null

    if (tipoVisao === 'mensal' && mes && ano) {
      mesSelecionado = mes
      anoSelecionado = ano
    } else if (tipoVisao === 'total' || tipoVisao === 'personalizado') {
      // Para total, personalizado: usar mês atual
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

      // Encontrar próxima faixa (apenas para mês atual)
      let proximaFaixa: { valor: number; percentual: string } | null = null
      if (mesSelecionado === mesAtual && anoSelecionado === anoAtual) {
        const FAIXAS = vendedor.cargo === 'JUNIOR'
          ? [{ valor: 40000, percentual: '3%' }, { valor: 50000, percentual: '4%' }, { valor: 60000, percentual: '5%' }]
          : vendedor.cargo === 'PLENO'
            ? [{ valor: 40000, percentual: '7%' }, { valor: 50000, percentual: '8%' }, { valor: 60000, percentual: '9%' }]
            : vendedor.cargo === 'SENIOR'
              ? [{ valor: 40000, percentual: '10%' }, { valor: 50000, percentual: '11%' }, { valor: 60000, percentual: '12%' }]
              : [{ valor: 40000, percentual: '13%' }, { valor: 50000, percentual: '14%' }, { valor: 60000, percentual: '15%' }]

        proximaFaixa = FAIXAS.find(f => f.valor > faturamentoParaMeta) || null
      }

      dadosProjecao = {
        diasDecorridos: diasDecorridos,
        diasNoMes: diasNoMesSelecionado,
        proximaFaixa: proximaFaixa
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

  const handleSaveVenda = async (venda: any) => {
    try {
      console.log('Salvando venda:', venda) // Debug
      let response
      if (venda.id) {
        response = await fetch(`/api/vendas/${venda.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(venda)
        })
      } else {
        response = await fetch('/api/vendas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(venda)
        })
      }

      if (!response.ok) {
        const error = await response.json()
        console.error('Erro na resposta:', error)
        alert(`Erro ao salvar venda: ${error.error || 'Erro desconhecido'}`)
        return
      }

      const result = await response.json()
      console.log('Venda salva com sucesso:', result) // Debug
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar venda:', error)
      alert('Erro ao salvar venda. Verifique o console para mais detalhes.')
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

  const handleDeleteRelatorio = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este relatório?')) {
      try {
        await fetch(`/api/relatorios/${id}`, { method: 'DELETE' })
        carregarDados()
      } catch (error) {
        console.error('Erro ao excluir relatório:', error)
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
    if (!vendasSeguras || vendasSeguras.length === 0) {
      alert('Não há vendas para exportar!')
      return
    }

    const vendasFormatadas = vendasSeguras.map(venda => ({
      Data: formatDate(venda.data),
      Nome: venda.nome,
      Email: venda.email,
      Valor: `R$ ${venda.valor.toFixed(2)}`,
      Status: venda.status,
      Cupom: venda.cupom || '',
      Plano: venda.plano || '',
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
    if (!relatoriosSeguros || relatoriosSeguros.length === 0) {
      alert('Não há relatórios para exportar!')
      return
    }

    const relatoriosFormatados = relatoriosSeguros.map(relatorio => ({
      Data: formatDate(relatorio.data),
      'Leads Recebidos': relatorio.leadsRecebidos,
      'Respostas Recebidas': relatorio.respostasEnviadas,
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

  // Função para exportar backup completo
  const handleExportarBackup = useCallback(() => {
    try {
      const vendasSeguras = Array.isArray(vendas) ? vendas : []
      const relatoriosSeguros = Array.isArray(relatorios) ? relatorios : []
      
      // Carregar checklist e observações do localStorage
      const checklistDiario = localStorage.getItem(`checklist_${vendedor.id}_diario`) || '[]'
      const checklistSemanal = localStorage.getItem(`checklist_${vendedor.id}_semanal`) || '[]'
      const checklistMensal = localStorage.getItem(`checklist_${vendedor.id}_mensal`) || '[]'
      const observacoes = localStorage.getItem(`observacoes_${vendedor.id}`) || ''
      const valoresVisiveisState = localStorage.getItem(`valoresVisiveis_${vendedor.id}`) || 'false'

      const backup = {
        vendedor: {
          id: vendedor.id,
          nome: vendedor.nome,
          cargo: vendedor.cargo
        },
        dataExportacao: new Date().toISOString(),
        vendas: vendasSeguras,
        relatorios: relatoriosSeguros,
        checklist: {
          diario: JSON.parse(checklistDiario),
          semanal: JSON.parse(checklistSemanal),
          mensal: JSON.parse(checklistMensal)
        },
        observacoes: observacoes,
        configuracoes: {
          valoresVisiveis: valoresVisiveisState === 'true'
        }
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_${vendedor.nome.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar backup:', error)
      alert('Erro ao exportar backup. Verifique o console para mais detalhes.')
    }
  }, [vendedor, vendas, relatorios])

  // Expor função de exportar backup para o componente pai
  useEffect(() => {
    if (onExportBackupReady) {
      onExportBackupReady(handleExportarBackup)
    }
  }, [handleExportarBackup, onExportBackupReady])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Função auxiliar para ocultar/mostrar valores
  const formatarValorSensivel = (valor: number) => {
    if (valoresVisiveis) {
      return formatCurrency(valor)
    }
    return 'R$ ••••'
  }

  return (
    <>
      {/* Sidebar Lateral */}
      <SidebarVendedor
        vendedor={vendedor}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportBackup={handleExportarBackup}
        onToggle={setSidebarOpen}
        notificacoesCount={0}
      />

      {/* Conteúdo Principal */}
      <div className={cn(
        "space-y-6 transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "md:ml-16"
      )}>
      {/* Sistema de Abas */}
      {activeTab === 'visao-geral' && (
        <>
          {/* Título */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{vendedor.nome}</h2>
          <p className="text-muted-foreground">
            Cargo: <span className="font-medium">{vendedor.cargo}</span>
          </p>
        </div>
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
            Quantidade de Leads
          </Button>
        </div>
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
          value={formatarValorSensivel(faturamento)}
          subtitle={infoFaixa.descricao}
          icon={DollarSign}
        />
        <KPICard
          title="Vendas Confirmadas"
          value={qtdVendas.toString()}
          subtitle="No período"
          icon={ShoppingCart}
        />
        <KPICard
          title="Ticket Médio"
          value={formatarValorSensivel(ticketMedio)}
          icon={TrendingUp}
        />
        <KPICard
          title="Comissão"
          value={formatarValorSensivel(comissao)}
          subtitle={`Alíquota: ${infoFaixa.percentualFormatado}`}
          icon={Percent}
        />
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Salário Total
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setValoresVisiveis(!valoresVisiveis)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={valoresVisiveis ? "Ocultar valores" : "Mostrar valores"}
              >
                {valoresVisiveis ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarValorSensivel(salarioTotal)}</div>
            <p className="text-xs text-green-100 mt-1">
              Fixo: {formatarValorSensivel(salarioFixoParaExibicao)} + Comissão: {formatarValorSensivel(comissao)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs de Leads e Vendas - Agrupados */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Recebidos
            </CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{leadsRecebidosPeriodo}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {textoPeriodo}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Respostas Recebidas
            </CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{respostasEnviadasPeriodo}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {textoPeriodo}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Resposta
            </CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{taxaRespostaPeriodo}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Respostas / Leads recebidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendas
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{qtdVendasParaConversao}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {textoPeriodo}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversão de Vendas
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{taxaConversaoPeriodo}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vendas / Leads recebidos
            </p>
            {respostasEnviadasPeriodo > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {((qtdVendasParaConversao / respostasEnviadasPeriodo) * 100).toFixed(1)}% sobre respostas
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meta de Vendas */}
      {(usarDadosDiarios || usarDadosSemanais || usarDadosMensais || usarDadosAnuais) && tipoVisao !== 'total' && (
        <Card className={`${metaAtingida ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-green-500/30' : 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                🎯 Meta de Vendas
              </CardTitle>
              <span className={`text-lg font-bold ${metaAtingida ? 'text-green-600' : 'text-blue-600'}`}>
                {textoPeriodoMeta}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meta de Quantidade de Vendas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Quantidade de Vendas</span>
                <span className={`font-bold ${metaAtingidaVendas ? 'text-green-600' : 'text-blue-600'}`}>
                  {qtdVendasParaMeta}/{metaVendas}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${metaAtingidaVendas ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                  style={{ width: `${Math.min(100, progressoMetaVendas)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso: {Math.min(100, progressoMetaVendas).toFixed(0)}%</span>
                {metaAtingidaVendas ? (
                  <span className="text-green-600">✅ Meta atingida!</span>
                ) : (
                  <span>Faltam {metaVendas - qtdVendasParaMeta} vendas</span>
                )}
              </div>
            </div>

            {/* Meta de Faturamento */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Faturamento</span>
                <span className={`font-bold ${metaAtingidaFaturamento ? 'text-green-600' : 'text-blue-600'}`}>
                  {formatCurrency(faturamentoParaMeta)}/{formatCurrency(metaFaturamento)}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${metaAtingidaFaturamento ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                  style={{ width: `${Math.min(100, progressoMetaFaturamento)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progresso: {Math.min(100, progressoMetaFaturamento).toFixed(0)}%</span>
                {metaAtingidaFaturamento ? (
                  <span className="text-green-600">✅ Meta atingida!</span>
                ) : (
                  <span>Faltam {formatCurrency(metaFaturamento - faturamentoParaMeta)}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projeção de Faturamento */}
      {dadosProjecao && tipoVisao !== 'total' && (
        <ProjecaoCard
          faturamentoAtual={faturamentoParaMeta}
          comissaoAtual={comissaoParaMeta}
          salarioFixo={usarDadosAnuais ? salarioFixo * 12 : salarioFixo}
          diasDecorridos={dadosProjecao.diasDecorridos}
          diasNoMes={dadosProjecao.diasNoMes}
          proximaFaixa={dadosProjecao.proximaFaixa}
        />
      )}

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
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
        <SimpleLineChart
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
      <div className="flex items-center justify-between mt-4">
        <h3 className="text-lg font-semibold">Gráficos de Relatórios</h3>
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
      <div className={`grid gap-4 ${tipoVisao === 'total' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <SimpleLineChart
          title={
            periodoRealRelatorios === 'semana' ? "Leads Recebidos por Semana" :
              "Leads Recebidos por Dia"
          }
          data={chartDataLeads}
          color="#3b82f6"
        />
        <SimpleLineChart
          title={
            periodoRealRelatorios === 'semana' ? "Respostas Recebidas por Semana" :
              "Respostas Recebidas por Dia"
          }
          data={chartDataRespostas}
          color="#f59e0b"
        />
      </div>

      {/* Funil de Conversão */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Funil de Conversão</h3>
        <FunilConversao
          leadsRecebidos={leadsRecebidosFunil}
          respostasEnviadas={respostasEnviadasFunil}
          vendasFechadas={vendasFechadasFunil}
        />
      </div>

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vendas do Período</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVendaEdit(null)
                setVendaDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
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

      {/* Tabela de Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads do Período</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRelatorioEdit(null)
                setRelatorioDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LeadsTable
            relatorios={relatorios.map(r => ({
              ...r,
              data: new Date(r.data),
              vendedorNome: vendedor.nome
            }))}
            onEdit={(rel) => {
              setRelatorioEdit(rel)
              setRelatorioDialogOpen(true)
            }}
            onDelete={handleDeleteRelatorio}
          />
        </CardContent>
      </Card>
            </>
          )}

          {/* Aba Faturamento */}
          {activeTab === 'faturamento' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Faturamento</h2>
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
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                  title="Faturamento"
                  value={formatarValorSensivel(faturamento)}
                  subtitle={infoFaixa.descricao}
                  icon={DollarSign}
                />
                <KPICard
                  title="Vendas Confirmadas"
                  value={qtdVendas.toString()}
                  subtitle="No período"
                  icon={ShoppingCart}
                />
                <KPICard
                  title="Ticket Médio"
                  value={formatarValorSensivel(ticketMedio)}
                  icon={TrendingUp}
                />
                <KPICard
                  title="Comissão"
                  value={formatarValorSensivel(comissao)}
                  subtitle={`Alíquota: ${infoFaixa.percentualFormatado}`}
                  icon={Percent}
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gráficos de Faturamento</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Visualizar por:</label>
                  <Select value={periodoGraficoFinanceiro} onValueChange={(v: any) => setPeriodoGraficoFinanceiro(v)}>
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
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <SimpleLineChart
                  title={
                    periodoReal === 'mes' ? "Faturamento por Mês" :
                      periodoReal === 'semana' ? "Faturamento por Semana" :
                        "Faturamento por Dia"
                  }
                  data={chartDataFaturamento}
                  color="#8b5cf6"
                />
                <SimpleLineChart
                  title={
                    periodoReal === 'mes' ? "Quantidade de Vendas por Mês" :
                      periodoReal === 'semana' ? "Quantidade de Vendas por Semana" :
                        "Quantidade de Vendas por Dia"
                  }
                  data={chartDataQuantidade}
                  color="#10b981"
                />
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Vendas do Período</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setVendaEdit(null)
                        setVendaDialogOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
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
            </div>
          )}

          {/* Aba Leads */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
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
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Leads Recebidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{leadsRecebidosPeriodo}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Respostas Recebidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{respostasEnviadasPeriodo}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Taxa de Resposta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{taxaRespostaPeriodo}%</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Conversão de Vendas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{taxaConversaoPeriodo}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vendas / Leads recebidos
                    </p>
                    {respostasEnviadasPeriodo > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {((qtdVendasParaConversao / respostasEnviadasPeriodo) * 100).toFixed(1)}% sobre respostas
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gráficos de Leads</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Visualizar por:</label>
                  <Select value={periodoGraficoLeads} onValueChange={(v: any) => setPeriodoGraficoLeads(v)}>
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
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <SimpleLineChart
                  title={
                    periodoRealRelatorios === 'semana' ? "Leads Recebidos por Semana" :
                      "Leads Recebidos por Dia"
                  }
                  data={chartDataLeads}
                  color="#3b82f6"
                />
                <SimpleLineChart
                  title={
                    periodoRealRelatorios === 'semana' ? "Respostas Recebidas por Semana" :
                      "Respostas Recebidas por Dia"
                  }
                  data={chartDataRespostas}
                  color="#f59e0b"
                />
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Leads do Período</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRelatorioEdit(null)
                        setRelatorioDialogOpen(true)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <LeadsTable
                    relatorios={relatoriosSeguros.map(r => ({
                      ...r,
                      data: new Date(r.data),
                      vendedorNome: vendedor.nome
                    }))}
                    onEdit={(rel) => {
                      setRelatorioEdit(rel)
                      setRelatorioDialogOpen(true)
                    }}
                    onDelete={handleDeleteRelatorio}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Aba Metas */}
          {activeTab === 'metas' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Metas</h2>
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
              {(usarDadosDiarios || usarDadosSemanais || usarDadosMensais || usarDadosAnuais) && tipoVisao !== 'total' && (
                <>
                  <Card className={`${metaAtingida ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-green-500/30' : 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          🎯 Meta de Vendas
                        </CardTitle>
                        <span className={`text-lg font-bold ${metaAtingida ? 'text-green-600' : 'text-blue-600'}`}>
                          {textoPeriodoMeta}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Quantidade de Vendas</span>
                          <span className={`font-bold ${metaAtingidaVendas ? 'text-green-600' : 'text-blue-600'}`}>
                            {qtdVendasParaMeta}/{metaVendas}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${metaAtingidaVendas ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                            style={{ width: `${Math.min(100, progressoMetaVendas)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso: {Math.min(100, progressoMetaVendas).toFixed(0)}%</span>
                          {metaAtingidaVendas ? (
                            <span className="text-green-600">✅ Meta atingida!</span>
                          ) : (
                            <span>Faltam {metaVendas - qtdVendasParaMeta} vendas</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Faturamento</span>
                          <span className={`font-bold ${metaAtingidaFaturamento ? 'text-green-600' : 'text-blue-600'}`}>
                            {formatCurrency(faturamentoParaMeta)}/{formatCurrency(metaFaturamento)}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${metaAtingidaFaturamento ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
                            style={{ width: `${Math.min(100, progressoMetaFaturamento)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso: {Math.min(100, progressoMetaFaturamento).toFixed(0)}%</span>
                          {metaAtingidaFaturamento ? (
                            <span className="text-green-600">✅ Meta atingida!</span>
                          ) : (
                            <span>Faltam {formatCurrency(metaFaturamento - faturamentoParaMeta)}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {metaAtingida && (
                    <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          🏆 Medalha de Ouro — Meta Batida!
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Parabéns! Você atingiu a meta de vendas em {formatDate(new Date())}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
              {dadosProjecao && tipoVisao !== 'total' && (
                <ProjecaoCard
                  faturamentoAtual={faturamentoParaMeta}
                  comissaoAtual={comissaoParaMeta}
                  salarioFixo={usarDadosAnuais ? salarioFixo * 12 : salarioFixo}
                  diasDecorridos={dadosProjecao.diasDecorridos}
                  diasNoMes={dadosProjecao.diasNoMes}
                  proximaFaixa={dadosProjecao.proximaFaixa}
                />
              )}
            </div>
          )}

          {/* Aba Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Checklist</h2>
              <ChecklistVendedor vendedorId={vendedor.id} />
            </div>
          )}

          {/* Aba Renovações */}
          {activeTab === 'notificacoes' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Renovações</h2>
              <NotificacoesRenovacao 
                vendas={Array.isArray(todasVendas) ? todasVendas : []} 
                vendedorId={vendedor.id}
                relatorios={Array.isArray(todosRelatorios) ? todosRelatorios : []}
              />
            </div>
          )}

          {/* Aba Observações */}
          {activeTab === 'observacoes' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Observações</h2>
              <ObservacoesVendedor vendedorId={vendedor.id} />
            </div>
          )}

      {/* Dialogs (sempre visíveis) */}
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
    </>
  )
}

// Retorna o número da semana no mês (1-6) baseado em semana comercial (Quarta → Terça)
// 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
function getWeekOfMonth(date: Date): number {
  const primeiroDiaMes = new Date(date.getFullYear(), date.getMonth(), 1)
  const diaDaSemanaInicio = primeiroDiaMes.getDay() // 0=domingo, 1=segunda, ..., 6=sábado

  const diaAtual = date.getDate()

  // Ajustar para semana comercial: quarta-feira (3) é o início da semana
  // Se o mês começa numa quarta (3), não precisa ajustar
  // Se começa numa quinta (4), precisa de 6 dias até a próxima quarta, etc.
  // Se começa numa terça (2), a primeira semana já começou (semana anterior)
  let diasAtePrimeiraQuarta = 0
  if (diaDaSemanaInicio <= 2) {
    // Se começa em domingo (0), segunda (1) ou terça (2), a primeira quarta está a (3 - diaDaSemanaInicio) dias
    diasAtePrimeiraQuarta = 3 - diaDaSemanaInicio
  } else {
    // Se começa em quinta (4), sexta (5) ou sábado (6), a primeira quarta está a (10 - diaDaSemanaInicio) dias
    diasAtePrimeiraQuarta = 10 - diaDaSemanaInicio
  }

  if (diaAtual <= diasAtePrimeiraQuarta) {
    return 1 // Primeira semana (pode ser parcial)
  }

  // Dias restantes após a primeira semana
  const diasAposPrimeiraSemana = diaAtual - diasAtePrimeiraQuarta

  // Cada 7 dias completos = 1 semana adicional
  const semanasCompletas = Math.floor(diasAposPrimeiraSemana / 7)

  return 2 + semanasCompletas
}

function prepararDadosChart(
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

        if (diaDaSemana === 2) { // Terça-feira = fim da semana comercial
          semanaAtual++
        }
      }

      // Encontrar o dia final da semana
      let diaFim = diaInicio
      for (let dia = diaInicio; dia <= diasNoMes; dia++) {
        const data = new Date(ano, mes - 1, dia)
        diaFim = dia
        if (data.getDay() === 2) { // Terça-feira = fim da semana comercial
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

        if (diaDaSemana === 2) { // Terça-feira = fim da semana comercial
          semanaAtual++
        }
      }

      // Encontrar o dia final da semana
      let diaFim = diaInicio
      for (let dia = diaInicio; dia <= diasNoMes; dia++) {
        const data = new Date(ano, mes - 1, dia)
        diaFim = dia
        if (data.getDay() === 2) { // Terça-feira = fim da semana comercial
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


