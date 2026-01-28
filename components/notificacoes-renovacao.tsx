'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Search,
  Users,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Renovacao {
  id: string
  vendaId: string
  clienteNome: string
  clienteEmail: string
  valorVenda: number
  dataVenda: Date
  dataRenovacao: Date
  plano: string
  mesRenovacao: string
  mesRenovacaoLabel: string
  precisaVerificacao: boolean // Indica se o plano precisa ser verificado
}

interface NotificacoesRenovacaoProps {
  vendas: any[]
  vendedorId: string
  relatorios?: any[]
}

export function NotificacoesRenovacao({ vendas, vendedorId, relatorios = [] }: NotificacoesRenovacaoProps) {
  const [renovacoes, setRenovacoes] = useState<Renovacao[]>([])
  const [mesesExpandidos, setMesesExpandidos] = useState<Set<string>>(new Set())
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (!Array.isArray(vendas) || vendas.length === 0) {
      setRenovacoes([])
      return
    }

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const novasRenovacoes: Renovacao[] = []
    const renovacoesProcessadas = new Set<string>()

    vendas.forEach((venda) => {
      // Exigir apenas data, plano pode estar vazio
      if (!venda?.data) return

      const plano = (venda.plano || '').toUpperCase()
      
      // Excluir planos vitalícios
      if (plano && (plano.includes('VITALICIO') || plano.includes('VITALÍCIO') || plano.includes('LIFETIME'))) {
        return
      }

      // Verificar se precisa de verificação (plano vazio, desconhecido ou não especificado)
      const precisaVerificacao = !plano || 
                                 plano === '' || 
                                 plano === 'DESCONHECIDO' || 
                                 (!plano.includes('ANUAL') && !plano.includes('MENSAL') && plano !== '')

      const dataVenda = new Date(venda.data)
      const dataRenovacao = new Date(dataVenda)
      dataRenovacao.setFullYear(dataRenovacao.getFullYear() + 1)
      dataRenovacao.setHours(0, 0, 0, 0)

      // Não filtrar por data - mostrar todas as renovações futuras e passadas recentes
      const mesRenovacao = `${dataRenovacao.getFullYear()}-${String(dataRenovacao.getMonth() + 1).padStart(2, '0')}`
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
      const mesRenovacaoLabel = `${meses[dataRenovacao.getMonth()]} ${dataRenovacao.getFullYear()}`

      const id = `renovacao_${venda.id}_${mesRenovacao}`
      if (!renovacoesProcessadas.has(id)) {
        novasRenovacoes.push({
          id,
          vendaId: venda.id,
          clienteNome: venda.nome || 'Cliente',
          clienteEmail: venda.email || '',
          valorVenda: venda.valor || 0,
          dataVenda: dataVenda,
          dataRenovacao,
          plano: plano || 'NÃO ESPECIFICADO',
          mesRenovacao,
          mesRenovacaoLabel,
          precisaVerificacao
        })
        renovacoesProcessadas.add(id)
      }
    })

    novasRenovacoes.sort((a, b) => a.dataRenovacao.getTime() - b.dataRenovacao.getTime())
    setRenovacoes(novasRenovacoes)

    // Expandir mês atual e próximo mês por padrão
    const hojeMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)
    const proximoMesKey = `${proximoMes.getFullYear()}-${String(proximoMes.getMonth() + 1).padStart(2, '0')}`
    setMesesExpandidos(new Set([hojeMes, proximoMesKey]))
  }, [vendas, vendedorId])

  const toggleMes = (mesKey: string) => {
    setMesesExpandidos(prev => {
      const novo = new Set(prev)
      if (novo.has(mesKey)) {
        novo.delete(mesKey)
      } else {
        novo.add(mesKey)
      }
      return novo
    })
  }

  // Filtrar renovações por busca
  const renovacoesFiltradas = useMemo(() => {
    if (!busca) return renovacoes

    const buscaLower = busca.toLowerCase()
    return renovacoes.filter(r => 
      r.clienteNome.toLowerCase().includes(buscaLower) ||
      r.clienteEmail.toLowerCase().includes(buscaLower) ||
      r.plano.toLowerCase().includes(buscaLower)
    )
  }, [renovacoes, busca])

  // Criar todos os meses do ano atual e próximo
  const todosOsMeses = useMemo(() => {
    const meses: Array<{ key: string; label: string; date: Date }> = []
    const hoje = new Date()
    const anoAtual = hoje.getFullYear()
    const anoProximo = anoAtual + 1
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    
    // Adicionar meses do ano atual (a partir do mês atual)
    for (let mes = hoje.getMonth(); mes < 12; mes++) {
      const date = new Date(anoAtual, mes, 1)
      meses.push({
        key: `${anoAtual}-${String(mes + 1).padStart(2, '0')}`,
        label: `${mesesNomes[mes]} ${anoAtual}`,
        date
      })
    }
    
    // Adicionar todos os meses do próximo ano
    for (let mes = 0; mes < 12; mes++) {
      const date = new Date(anoProximo, mes, 1)
      meses.push({
        key: `${anoProximo}-${String(mes + 1).padStart(2, '0')}`,
        label: `${mesesNomes[mes]} ${anoProximo}`,
        date
      })
    }
    
    return meses
  }, [])

  // Calcular leads por mês de renovação
  const leadsPorMes = useMemo(() => {
    const leads: Record<string, number> = {}
    
    // Inicializar todos os meses com 0
    const mesesTemp: Array<{ key: string; label: string; date: Date }> = []
    const hoje = new Date()
    const anoAtual = hoje.getFullYear()
    const anoProximo = anoAtual + 1
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    
    for (let mes = hoje.getMonth(); mes < 12; mes++) {
      mesesTemp.push({
        key: `${anoAtual}-${String(mes + 1).padStart(2, '0')}`,
        label: `${mesesNomes[mes]} ${anoAtual}`,
        date: new Date(anoAtual, mes, 1)
      })
    }
    
    for (let mes = 0; mes < 12; mes++) {
      mesesTemp.push({
        key: `${anoProximo}-${String(mes + 1).padStart(2, '0')}`,
        label: `${mesesNomes[mes]} ${anoProximo}`,
        date: new Date(anoProximo, mes, 1)
      })
    }
    
    if (!Array.isArray(relatorios) || relatorios.length === 0) {
      mesesTemp.forEach(mes => {
        leads[mes.key] = 0
      })
      return leads
    }

    // Agrupar renovações por mês de renovação e calcular leads do mês da venda original
    // Usar um Set para evitar duplicar leads quando há múltiplas vendas no mesmo mês
    const mesesVendaProcessados: Record<string, Set<string>> = {}
    
    renovacoes.forEach(renovacao => {
      const mesVenda = `${renovacao.dataVenda.getFullYear()}-${String(renovacao.dataVenda.getMonth() + 1).padStart(2, '0')}`
      const mesRenovacao = renovacao.mesRenovacao
      
      // Inicializar Set para este mês de renovação se não existir
      if (!mesesVendaProcessados[mesRenovacao]) {
        mesesVendaProcessados[mesRenovacao] = new Set()
      }
      
      // Se ainda não processamos os leads deste mês de venda para este mês de renovação
      if (!mesesVendaProcessados[mesRenovacao].has(mesVenda)) {
        // Buscar leads do mês da venda original
        const leadsDoMes = relatorios.filter(rel => {
          const dataRel = new Date(rel.data)
          const mesRel = `${dataRel.getFullYear()}-${String(dataRel.getMonth() + 1).padStart(2, '0')}`
          return mesRel === mesVenda
        }).reduce((sum, rel) => sum + (rel.leadsRecebidos || 0), 0)
        
        if (!leads[mesRenovacao]) {
          leads[mesRenovacao] = 0
        }
        leads[mesRenovacao] += leadsDoMes
        
        // Marcar este mês de venda como processado para este mês de renovação
        mesesVendaProcessados[mesRenovacao].add(mesVenda)
      }
    })

    // Garantir que todos os meses tenham entrada (mesmo que 0)
    mesesTemp.forEach(mes => {
      if (!(mes.key in leads)) {
        leads[mes.key] = 0
      }
    })

    return leads
  }, [renovacoes, relatorios])

  const renovacoesPorMes = useMemo(() => {
    const agrupadas: Record<string, Renovacao[]> = {}
    renovacoesFiltradas.forEach(renovacao => {
      if (!agrupadas[renovacao.mesRenovacao]) {
        agrupadas[renovacao.mesRenovacao] = []
      }
      agrupadas[renovacao.mesRenovacao].push(renovacao)
    })

    // Criar objeto com TODOS os meses, mesmo sem renovações
    const resultado: Record<string, Renovacao[]> = {}
    todosOsMeses.forEach(mes => {
      resultado[mes.key] = agrupadas[mes.key] || []
    })

    return resultado
  }, [renovacoesFiltradas, todosOsMeses])

  const stats = useMemo(() => {
    const total = renovacoes.length
    const valorTotal = renovacoes.reduce((sum, r) => sum + r.valorVenda, 0)
    const totalLeads = Object.values(leadsPorMes).reduce((sum, leads) => sum + leads, 0)
    const precisamVerificacao = renovacoes.filter(r => r.precisaVerificacao).length
    
    return { total, valorTotal, totalLeads, precisamVerificacao }
  }, [renovacoes, leadsPorMes])

  if (renovacoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Renovações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">Nenhuma renovação encontrada</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className={cn(
        "grid gap-4",
        stats.precisamVerificacao > 0 ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
      )}>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total de Renovações</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.valorTotal)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total de Leads</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        {stats.precisamVerificacao > 0 && (
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Precisam Verificação</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.precisamVerificacao}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Renovações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, email ou plano..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Renovações por Mês */}
      <div className="space-y-4">
        {todosOsMeses.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">Carregando meses...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          todosOsMeses.map((mesInfo) => {
            const mesKey = mesInfo.key
            const renovacoesMes = renovacoesPorMes[mesKey] || []
            const mesLabel = mesInfo.label
            const isExpanded = mesesExpandidos.has(mesKey)
            const valorMes = renovacoesMes.reduce((sum, r) => sum + r.valorVenda, 0)
            const leadsMes = leadsPorMes[mesKey] || 0
            const temRenovacoes = renovacoesMes.length > 0
            const precisamVerificacaoMes = renovacoesMes.filter(r => r.precisaVerificacao).length

            return (
              <Card 
                key={mesKey} 
                className={cn(
                  "overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-shadow",
                  temRenovacoes ? "border-l-primary" : "border-l-gray-300 opacity-70"
                )}
              >
                <CardHeader 
                  className="cursor-pointer hover:bg-accent/50 transition-colors pb-3"
                  onClick={() => toggleMes(mesKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <CardTitle className="text-lg font-bold">{mesLabel}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {temRenovacoes ? (
                            <>
                              <Badge variant="secondary" className="text-xs">
                                {renovacoesMes.length} {renovacoesMes.length === 1 ? 'renovação' : 'renovações'}
                              </Badge>
                              {precisamVerificacaoMes > 0 && (
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {precisamVerificacaoMes} {precisamVerificacaoMes === 1 ? 'verificação' : 'verificações'}
                                </Badge>
                              )}
                              {leadsMes > 0 && (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500 text-xs">
                                  {leadsMes} {leadsMes === 1 ? 'lead' : 'leads'}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Sem renovações
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {temRenovacoes ? (
                        <>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(valorMes)}</p>
                          <p className="text-xs text-muted-foreground">Valor do mês</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-muted-foreground">-</p>
                          <p className="text-xs text-muted-foreground">Sem dados</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0">
                    {temRenovacoes ? (
                      <div className="space-y-3">
                        {renovacoesMes.map((renovacao) => (
                          <div
                            key={renovacao.id}
                            className={cn(
                              "rounded-lg border p-4 transition-all hover:shadow-sm border-l-4",
                              renovacao.precisaVerificacao 
                                ? "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20" 
                                : "border-l-primary"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                      <h4 className="font-semibold text-base">{renovacao.clienteNome}</h4>
                                      {renovacao.precisaVerificacao && (
                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500 text-xs">
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          Verificar Plano
                                        </Badge>
                                      )}
                                    </div>
                                    {renovacao.clienteEmail && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate">{renovacao.clienteEmail}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <DollarSign className="h-3 w-3" />
                                      <span>Valor Original</span>
                                    </div>
                                    <p className="font-semibold text-sm">{formatCurrency(renovacao.valorVenda)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>Data Venda</span>
                                    </div>
                                    <p className="font-semibold text-sm">{formatDate(renovacao.dataVenda)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>Data Renovação</span>
                                    </div>
                                    <p className="font-semibold text-sm">{formatDate(renovacao.dataRenovacao)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>Plano</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <p className={cn(
                                        "font-semibold text-sm",
                                        renovacao.precisaVerificacao && "text-yellow-600"
                                      )}>
                                        {renovacao.plano}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {renovacao.precisaVerificacao && (
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="flex items-start gap-2 p-2 rounded-md bg-yellow-100/50 dark:bg-yellow-900/20">
                                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                        <strong>Atenção:</strong> Este plano precisa ser verificado. Por favor, confirme o tipo de plano (Anual ou Mensal) para garantir o cálculo correto da renovação.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-muted-foreground">Nenhuma renovação programada para este mês</p>
                        {leadsMes > 0 && (
                          <div className="mt-4">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500">
                              {leadsMes} {leadsMes === 1 ? 'lead relacionado' : 'leads relacionados'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
