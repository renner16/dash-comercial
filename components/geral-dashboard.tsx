'use client'

import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { VendasTable } from '@/components/vendas-table'
import { SimpleLineChart, SimpleBarChart } from '@/components/charts'
import { PeriodSelector } from '@/components/period-selector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface GeralDashboardProps {
  vendedores: Array<{
    id: string
    nome: string
    cargo: string
  }>
}

export function GeralDashboard({ vendedores }: GeralDashboardProps) {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [vendas, setVendas] = useState<any[]>([])
  const [relatorios, setRelatorios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroVendedor, setFiltroVendedor] = useState<string>('todos')

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [vendasRes, relatoriosRes] = await Promise.all([
        fetch(`/api/vendas?mes=${mes}&ano=${ano}`),
        fetch(`/api/relatorios?mes=${mes}&ano=${ano}`)
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
  }, [mes, ano])

  // Calcular KPIs gerais (apenas CONFIRMADAS)
  const vendasConfirmadas = vendas.filter(v => v.status === 'CONFIRMADA')
  const faturamentoTotal = vendasConfirmadas.reduce((sum, v) => sum + v.valor, 0)
  const qtdVendasTotal = vendasConfirmadas.length
  const ticketMedioGeral = qtdVendasTotal > 0 ? faturamentoTotal / qtdVendasTotal : 0

  // Filtrar vendas para a tabela
  const vendasFiltradas = filtroVendedor === 'todos' 
    ? vendas 
    : vendas.filter(v => v.vendedorId === filtroVendedor)

  // Preparar dados para gráficos
  const chartDataFaturamento = prepararDadosChartVendas(vendasConfirmadas, 'valor')
  const chartDataQuantidade = prepararDadosChartVendas(vendasConfirmadas, 'count')

  // Preparar dados de relatórios (soma de todos os vendedores por dia)
  const chartDataLeads = prepararDadosChartRelatorios(relatorios, 'leadsRecebidos')
  const chartDataRespostas = prepararDadosChartRelatorios(relatorios, 'respostasEnviadas')

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
        <PeriodSelector mes={mes} ano={ano} onMesChange={setMes} onAnoChange={setAno} />
      </div>

      {/* KPIs Gerais - SEM COMISSÃO */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Gráficos de Performance do Time */}
      <div className="grid gap-4 md:grid-cols-2">
        <SimpleLineChart
          title="Faturamento do Time ao Longo do Mês"
          data={chartDataFaturamento}
          color="#8b5cf6"
        />
        <SimpleBarChart
          title="Total de Vendas ao Longo do Mês"
          data={chartDataQuantidade}
          color="#10b981"
        />
      </div>

      {/* Gráficos de Atividade do Time */}
      <div className="grid gap-4 md:grid-cols-2">
        <SimpleLineChart
          title="Leads Recebidos (Time)"
          data={chartDataLeads}
          color="#3b82f6"
        />
        <SimpleLineChart
          title="Respostas Enviadas (Time)"
          data={chartDataRespostas}
          color="#f59e0b"
        />
      </div>

      {/* Tabela de Todas as Vendas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todas as Vendas do Período</CardTitle>
            <div className="flex items-center gap-2">
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

function prepararDadosChartVendas(vendas: any[], tipo: 'valor' | 'count') {
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

function prepararDadosChartRelatorios(relatorios: any[], campo: string) {
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


