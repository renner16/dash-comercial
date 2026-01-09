'use client'

import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Percent, Plus, Download } from 'lucide-react'
import { KPICard } from '@/components/kpi-card'
import { VendasTable } from '@/components/vendas-table'
import { VendaDialog } from '@/components/venda-dialog'
import { RelatorioDialog } from '@/components/relatorio-dialog'
import { SimpleLineChart, SimpleBarChart } from '@/components/charts'
import { PeriodSelector } from '@/components/period-selector'
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
  const [tipoVisao, setTipoVisao] = useState<'diario' | 'semanal' | 'mensal' | 'anual' | 'total'>('mensal')
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
      } else if (tipoVisao === 'semanal' && mes && semana) {
        // Visão semanal: busca por semana do mês
        params += `&mes=${mes}&ano=${ano}&semana=${semana}`
      } else if (tipoVisao === 'mensal' && mes) {
        // Visão mensal: busca por mês/ano
        params += `&mes=${mes}&ano=${ano}`
      } else if (tipoVisao === 'anual') {
        // Visão anual: busca por ano
        params += `&ano=${ano}`
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
  }, [mes, ano, dia, semana, tipoVisao, vendedor.id])

  // Calcular KPIs
  const vendasConfirmadas = vendas.filter(v => v.status === 'CONFIRMADA')
  const faturamento = vendasConfirmadas.reduce((sum, v) => sum + v.valor, 0)
  const qtdVendas = vendasConfirmadas.length
  const ticketMedio = qtdVendas > 0 ? faturamento / qtdVendas : 0
  
  // Calcular comissão e remuneração
  const comissao = calcularComissao(vendedor.cargo as Cargo, faturamento)
  const salarioFixo = getSalarioFixo(vendedor.cargo as Cargo)
  const salarioTotal = calcularRemuneracaoTotal(vendedor.cargo as Cargo, faturamento)
  const infoFaixa = getInfoFaixa(vendedor.cargo as Cargo, faturamento)

  // Adicionar comissão estimada nas vendas
  const vendasComComissao = vendas.map(v => ({
    ...v,
    comissaoEstimada: v.status === 'CONFIRMADA' ? v.valor * infoFaixa.percentual : 0
  }))

  // Preparar dados para gráficos de vendas
  const chartDataFaturamento = prepararDadosChart(vendasConfirmadas, 'valor', tipoVisao)
  const chartDataQuantidade = prepararDadosChart(vendasConfirmadas, 'count', tipoVisao)

  // Preparar dados para gráficos de relatórios
  const chartDataLeads = prepararDadosChartRelatorios(relatorios, 'leadsRecebidos', tipoVisao)
  const chartDataRespostas = prepararDadosChartRelatorios(relatorios, 'respostasEnviadas', tipoVisao)

  // Calcular dados de leads (para qualquer período)
  const leadsRecebidosPeriodo = relatorios.reduce((sum, r) => sum + r.leadsRecebidos, 0)
  const respostasEnviadasPeriodo = relatorios.reduce((sum, r) => sum + r.respostasEnviadas, 0)
  const vendasPeriodo = relatorios.reduce((sum, r) => sum + r.vendas, 0)
  const taxaRespostaPeriodo = leadsRecebidosPeriodo > 0 
    ? ((respostasEnviadasPeriodo / leadsRecebidosPeriodo) * 100).toFixed(1)
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
          semana={semana}
          tipoVisao={tipoVisao}
          onMesChange={setMes} 
          onAnoChange={setAno}
          onDiaChange={setDia}
          onSemanaChange={setSemana}
          onTipoVisaoChange={setTipoVisao}
        />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
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

      {/* Gráficos de Vendas */}
      <div className={`grid gap-4 ${tipoVisao === 'total' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <SimpleLineChart
          title={tipoVisao === 'total' || tipoVisao === 'anual' ? "Faturamento por Mês" : "Faturamento por Dia"}
          data={chartDataFaturamento}
          color="#8b5cf6"
        />
        <SimpleBarChart
          title={tipoVisao === 'total' || tipoVisao === 'anual' ? "Quantidade de Vendas por Mês" : "Quantidade de Vendas por Dia"}
          data={chartDataQuantidade}
          color="#10b981"
        />
      </div>

      {/* Gráficos de Relatórios */}
      <div className={`grid gap-4 ${tipoVisao === 'total' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <SimpleLineChart
          title={tipoVisao === 'total' || tipoVisao === 'anual' ? "Leads Recebidos por Mês" : "Leads Recebidos por Dia"}
          data={chartDataLeads}
          color="#3b82f6"
        />
        <SimpleLineChart
          title={tipoVisao === 'total' || tipoVisao === 'anual' ? "Respostas Enviadas por Mês" : "Respostas Enviadas por Dia"}
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

function prepararDadosChart(vendas: any[], tipo: 'valor' | 'count', tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total') {
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

function prepararDadosChartRelatorios(relatorios: any[], campo: 'leadsRecebidos' | 'respostasEnviadas', tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total') {
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
  return relatorios.map(r => ({
    name: new Date(r.data).getDate().toString(),
    value: r[campo]
  })).sort((a, b) => parseInt(a.name) - parseInt(b.name))
}


