'use client'

import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Download } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { VendasTable } from '@/components/vendas-table'
import { SimpleLineChart, SimpleBarChart } from '@/components/charts'
import { PeriodSelector } from '@/components/period-selector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { exportarParaCSV } from '@/lib/export-utils'

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
  const [tipoVisao, setTipoVisao] = useState<'diario' | 'semanal' | 'mensal' | 'anual' | 'total'>('diario')
  const [vendas, setVendas] = useState<any[]>([])
  const [relatorios, setRelatorios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroVendedor, setFiltroVendedor] = useState<string>('todos')

  const carregarDados = async () => {
    setLoading(true)
    try {
      let params = ''
      
      if (tipoVisao === 'diario' && dia) {
        // Visão diária: busca por data específica
        params = `dia=${dia}`
      } else if (tipoVisao === 'semanal' && mes && semana) {
        // Visão semanal: busca por semana do mês
        params = `mes=${mes}&ano=${ano}&semana=${semana}`
      } else if (tipoVisao === 'mensal' && mes) {
        // Visão mensal: busca por mês/ano
        params = `mes=${mes}&ano=${ano}`
      } else if (tipoVisao === 'anual') {
        // Visão anual: busca por ano
        params = `ano=${ano}`
      }
      // Se tipoVisao === 'total', não adiciona nenhum filtro de período
      
      const [vendasRes, relatoriosRes] = await Promise.all([
        fetch(`/api/vendas?${params}`),
        fetch(`/api/relatorios?${params}`)
      ])
      
      const vendasData = await vendasRes.json()
      const relatoriosData = await relatoriosRes.json()
      
      setVendas(vendasData)
      setRelatorios(relatoriosData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [mes, ano, dia, semana, tipoVisao])

  // Calcular KPIs gerais (apenas CONFIRMADAS)
  const vendasConfirmadas = vendas.filter(v => v.status === 'CONFIRMADA')
  const faturamentoTotal = vendasConfirmadas.reduce((sum, v) => sum + v.valor, 0)
  const qtdVendasTotal = vendasConfirmadas.length
  const ticketMedioGeral = qtdVendasTotal > 0 ? faturamentoTotal / qtdVendasTotal : 0

  // Calcular dados de leads (soma de todos os vendedores)
  const totalLeadsRecebidos = relatorios.reduce((sum, r) => sum + r.leadsRecebidos, 0)
  const totalRespostasEnviadas = relatorios.reduce((sum, r) => sum + r.respostasEnviadas, 0)
  const taxaResposta = totalLeadsRecebidos > 0 
    ? ((totalRespostasEnviadas / totalLeadsRecebidos) * 100).toFixed(1)
    : '0'

  // Filtrar vendas para a tabela
  const vendasFiltradas = filtroVendedor === 'todos' 
    ? vendas 
    : vendas.filter(v => v.vendedorId === filtroVendedor)

  // Preparar dados para gráficos
  const chartDataFaturamento = prepararDadosChartVendas(vendasConfirmadas, 'valor', tipoVisao)
  const chartDataQuantidade = prepararDadosChartVendas(vendasConfirmadas, 'count', tipoVisao)

  // Preparar dados de relatórios (soma de todos os vendedores por dia)
  const chartDataLeads = prepararDadosChartRelatorios(relatorios, 'leadsRecebidos', tipoVisao)
  const chartDataRespostas = prepararDadosChartRelatorios(relatorios, 'respostasEnviadas', tipoVisao)

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visão Geral do Time</h2>
          <p className="text-muted-foreground">
            Consolidado de todos os vendedores
          </p>
        </div>
        <PeriodSelector 
          mes={mes} 
          ano={ano}
          dia={dia}
          semana={semana}
          tipoVisao={tipoVisao}
          onMesChange={setMes} 
          onAnoChange={setAno}
          onDiaChange={setDia}
          onSemanaChange={setSemana}
          onTipoVisaoChange={setTipoVisao}
        />
      </div>

      {/* KPIs Gerais - SEM COMISSÃO */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {/* KPIs de Leads - Visão Diária */}
      {tipoVisao === 'diario' && (
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
              <p className="text-xs text-muted-foreground mt-1">
                Total do time no dia
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
              <p className="text-xs text-muted-foreground mt-1">
                Total do time no dia
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
      )}

      {/* Gráficos de Performance do Time */}
      <div className={`grid gap-4 ${tipoVisao === 'total' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <SimpleLineChart
          title={tipoVisao === 'total' || tipoVisao === 'anual' ? "Faturamento do Time por Mês" : "Faturamento do Time por Dia"}
          data={chartDataFaturamento}
          color="#8b5cf6"
        />
        <SimpleBarChart
          title={tipoVisao === 'total' || tipoVisao === 'anual' ? "Total de Vendas por Mês" : "Total de Vendas por Dia"}
          data={chartDataQuantidade}
          color="#10b981"
        />
      </div>

      {/* Gráficos de Atividade do Time */}
      <div className={`grid gap-4 ${tipoVisao === 'total' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <SimpleLineChart
          title={tipoVisao === 'total' || tipoVisao === 'anual' ? "Leads Recebidos (Time) por Mês" : "Leads Recebidos (Time) por Dia"}
          data={chartDataLeads}
          color="#3b82f6"
        />
        <SimpleLineChart
          title={tipoVisao === 'total' || tipoVisao === 'anual' ? "Respostas Enviadas (Time) por Mês" : "Respostas Enviadas (Time) por Dia"}
          data={chartDataRespostas}
          color="#f59e0b"
        />
      </div>

      {/* Tabela de Todas as Vendas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Todas as Vendas do Período</CardTitle>
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
              <Button 
                onClick={handleExportarTodasVendas}
                variant="secondary"
                className="gap-2"
                size="sm"
              >
                <Download className="w-4 h-4" />
                Exportar Vendas
              </Button>
              <Button 
                onClick={handleExportarTodosRelatorios}
                variant="secondary"
                className="gap-2"
                size="sm"
              >
                <Download className="w-4 h-4" />
                Exportar Relatórios
              </Button>
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

function prepararDadosChartVendas(vendas: any[], tipo: 'valor' | 'count', tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total') {
  // Se visão ANUAL ou TOTAL, agrupa por MÊS com ANO
  if (tipoVisao === 'anual' || tipoVisao === 'total') {
    const dadosPorMesAno: Record<string, number> = {} // Formato: "2025-0", "2025-1", etc.
    const mesesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    vendas.forEach(v => {
      const data = new Date(v.data)
      const ano = data.getFullYear()
      const mes = data.getMonth() // 0-11
      const chave = `${ano}-${mes}`
      
      if (!dadosPorMesAno[chave]) {
        dadosPorMesAno[chave] = 0
      }
      dadosPorMesAno[chave] += tipo === 'valor' ? v.valor : 1
    })

    return Object.entries(dadosPorMesAno)
      .map(([chave, valor]) => {
        const [ano, mes] = chave.split('-')
        return {
          name: `${mesesNome[parseInt(mes)]} ${ano}`,
          value: valor,
          sortKey: parseInt(ano) * 100 + parseInt(mes) // Para ordenação
        }
      })
      .sort((a, b) => a.sortKey - b.sortKey)
  }
  
  // Para MENSAL ou outros, agrupa por DIA
  const dadosPorDia: Record<number, number> = {}
  
  vendas.forEach(v => {
    const dia = new Date(v.data).getDate()
    if (!dadosPorDia[dia]) {
      dadosPorDia[dia] = 0
    }
    dadosPorDia[dia] += tipo === 'valor' ? v.valor : 1
  })

  return Object.entries(dadosPorDia)
    .map(([dia, valor]) => ({
      name: dia,
      value: valor
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name))
}

function prepararDadosChartRelatorios(relatorios: any[], campo: string, tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total') {
  // Se visão ANUAL ou TOTAL, agrupa por MÊS com ANO
  if (tipoVisao === 'anual' || tipoVisao === 'total') {
    const dadosPorMesAno: Record<string, number> = {} // Formato: "2025-0", "2025-1", etc.
    const mesesNome = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    relatorios.forEach(r => {
      const data = new Date(r.data)
      const ano = data.getFullYear()
      const mes = data.getMonth() // 0-11
      const chave = `${ano}-${mes}`
      
      if (!dadosPorMesAno[chave]) {
        dadosPorMesAno[chave] = 0
      }
      dadosPorMesAno[chave] += r[campo]
    })

    return Object.entries(dadosPorMesAno)
      .map(([chave, valor]) => {
        const [ano, mes] = chave.split('-')
        return {
          name: `${mesesNome[parseInt(mes)]} ${ano}`,
          value: valor,
          sortKey: parseInt(ano) * 100 + parseInt(mes) // Para ordenação
        }
      })
      .sort((a, b) => a.sortKey - b.sortKey)
  }
  
  // Para MENSAL ou outros, agrupa por DIA
  const dadosPorDia: Record<number, number> = {}
  
  relatorios.forEach(r => {
    const dia = new Date(r.data).getDate()
    if (!dadosPorDia[dia]) {
      dadosPorDia[dia] = 0
    }
    dadosPorDia[dia] += r[campo]
  })

  return Object.entries(dadosPorDia)
    .map(([dia, valor]) => ({
      name: dia,
      value: valor
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name))
}


