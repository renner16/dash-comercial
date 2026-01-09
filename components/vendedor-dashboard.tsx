'use client'

import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Percent, Plus } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { VendasTable } from '@/components/vendas-table'
import { VendaDialog } from '@/components/venda-dialog'
import { RelatorioDialog } from '@/components/relatorio-dialog'
import { SimpleLineChart, SimpleBarChart } from '@/components/charts'
import { PeriodSelector } from '@/components/period-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { calcularComissao, getInfoFaixa, Cargo } from '@/lib/comissao'

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
  const [tipoVisao, setTipoVisao] = useState<'diario' | 'mensal' | 'anual'>('mensal')
  const [vendas, setVendas] = useState<any[]>([])
  const [relatorios, setRelatorios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [vendaDialogOpen, setVendaDialogOpen] = useState(false)
  const [relatorioDialogOpen, setRelatorioDialogOpen] = useState(false)
  const [vendaEdit, setVendaEdit] = useState<any>(null)
  const [relatorioEdit, setRelatorioEdit] = useState<any>(null)

  const carregarDados = async () => {
    setLoading(true)
    try {
      let params = `vendedorId=${vendedor.id}`
      
      if (tipoVisao === 'diario' && dia) {
        // Visão diária: busca por data específica
        params += `&dia=${dia}`
      } else if (tipoVisao === 'mensal' && mes) {
        // Visão mensal: busca por mês/ano
        params += `&mes=${mes}&ano=${ano}`
      } else if (tipoVisao === 'anual') {
        // Visão anual: busca por ano
        params += `&ano=${ano}`
      }
      
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
  }, [mes, ano, dia, tipoVisao, vendedor.id])

  // Calcular KPIs
  const vendasConfirmadas = vendas.filter(v => v.status === 'CONFIRMADA')
  const faturamento = vendasConfirmadas.reduce((sum, v) => sum + v.valor, 0)
  const qtdVendas = vendasConfirmadas.length
  const ticketMedio = qtdVendas > 0 ? faturamento / qtdVendas : 0
  
  // Calcular comissão
  const comissao = calcularComissao(vendedor.cargo as Cargo, faturamento)
  const infoFaixa = getInfoFaixa(vendedor.cargo as Cargo, faturamento)

  // Adicionar comissão estimada nas vendas
  const vendasComComissao = vendas.map(v => ({
    ...v,
    comissaoEstimada: v.status === 'CONFIRMADA' ? v.valor * infoFaixa.percentual : 0
  }))

  // Preparar dados para gráficos de vendas
  const chartDataFaturamento = prepararDadosChart(vendasConfirmadas, 'valor')
  const chartDataQuantidade = prepararDadosChart(vendasConfirmadas, 'count')

  // Preparar dados para gráficos de relatórios
  const chartDataLeads = relatorios.map(r => ({
    name: new Date(r.data).getDate().toString(),
    value: r.leadsRecebidos
  })).sort((a, b) => parseInt(a.name) - parseInt(b.name))

  const chartDataRespostas = relatorios.map(r => ({
    name: new Date(r.data).getDate().toString(),
    value: r.respostasEnviadas
  })).sort((a, b) => parseInt(a.name) - parseInt(b.name))

  // Calcular dados de leads do dia (para visão diária)
  const leadsRecebidosDia = relatorios.reduce((sum, r) => sum + r.leadsRecebidos, 0)
  const respostasEnviadasDia = relatorios.reduce((sum, r) => sum + r.respostasEnviadas, 0)
  const vendasDia = relatorios.reduce((sum, r) => sum + r.vendas, 0)
  const taxaRespostaDia = leadsRecebidosDia > 0 
    ? ((respostasEnviadasDia / leadsRecebidosDia) * 100).toFixed(1)
    : '0'

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
          <h2 className="text-3xl font-bold tracking-tight">{vendedor.nome}</h2>
          <p className="text-muted-foreground">
            Cargo: <span className="font-medium">{vendedor.cargo}</span>
          </p>
        </div>
        <PeriodSelector 
          mes={mes} 
          ano={ano}
          dia={dia}
          tipoVisao={tipoVisao}
          onMesChange={setMes} 
          onAnoChange={setAno}
          onDiaChange={setDia}
          onTipoVisaoChange={setTipoVisao}
        />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Faturamento"
          value={formatCurrency(faturamento)}
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
          value={formatCurrency(ticketMedio)}
          icon={TrendingUp}
        />
        <KPICard
          title="Comissão"
          value={formatCurrency(comissao)}
          subtitle={`Alíquota: ${infoFaixa.percentualFormatado}`}
          icon={Percent}
        />
      </div>

      {/* KPIs de Leads - Visão Diária */}
      {tipoVisao === 'diario' && (
        <div className="grid gap-4 md:grid-cols-4">
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
              <div className="text-2xl font-bold text-blue-600">{leadsRecebidosDia}</div>
              <p className="text-xs text-muted-foreground mt-1">
                No dia
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
              <div className="text-2xl font-bold text-green-600">{respostasEnviadasDia}</div>
              <p className="text-xs text-muted-foreground mt-1">
                No dia
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
              <div className="text-2xl font-bold text-purple-600">{taxaRespostaDia}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Respostas / Leads
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vendas do Dia
              </CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{vendasDia}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Fechadas no dia
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-2">
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

      {/* Gráficos de Vendas */}
      <div className="grid gap-4 md:grid-cols-2">
        <SimpleLineChart
          title="Faturamento por Dia"
          data={chartDataFaturamento}
          color="#8b5cf6"
        />
        <SimpleBarChart
          title="Quantidade de Vendas por Dia"
          data={chartDataQuantidade}
          color="#10b981"
        />
      </div>

      {/* Gráficos de Relatórios */}
      <div className="grid gap-4 md:grid-cols-2">
        <SimpleLineChart
          title="Leads Recebidos"
          data={chartDataLeads}
          color="#3b82f6"
        />
        <SimpleLineChart
          title="Respostas Enviadas"
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

function prepararDadosChart(vendas: any[], tipo: 'valor' | 'count') {
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


