'use client'

import { useState } from 'react'
import { Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Venda {
  id: string
  data: Date
  nome: string
  email: string
  valor: number
  status: string
  cupom?: string | null
  plano?: string | null
  observacao: string | null
  comissaoEstimada?: number
}

interface VendasTableProps {
  vendas: Venda[]
  onEdit?: (venda: Venda) => void
  onDelete?: (id: string) => void
  showComissao?: boolean
}

const STATUS_COLORS = {
  CONFIRMADA: 'bg-green-500/10 text-green-500 border-green-500/20',
  PENDENTE: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  CANCELADA: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  ESTORNADA: 'bg-red-500/10 text-red-500 border-red-500/20',
}

type SortField = 'data' | 'nome' | 'valor' | 'status'
type SortDirection = 'asc' | 'desc'

export function VendasTable({ vendas, onEdit, onDelete, showComissao = false }: VendasTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroCupom, setFiltroCupom] = useState<string>('todos')
  const [filtroPlano, setFiltroPlano] = useState<string>('todos')
  const [sortField, setSortField] = useState<SortField>('data')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const itemsPerPage = 10

  // Obter valores únicos para os filtros
  const cuponsUnicos = Array.from(new Set(vendas.map(v => v.cupom).filter(Boolean))) as string[]
  const planosUnicos = Array.from(new Set(vendas.map(v => v.plano).filter(Boolean))) as string[]

  // Filtrar vendas
  const filteredVendas = vendas.filter(venda => {
    // Filtro de busca por texto
    const matchSearch = searchTerm === '' ||
      venda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (venda.cupom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (venda.observacao?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    // Filtro de status
    const matchStatus = filtroStatus === 'todos' || venda.status === filtroStatus

    // Filtro de cupom
    const matchCupom = filtroCupom === 'todos' || 
      (filtroCupom === 'sem-cupom' && !venda.cupom) ||
      (filtroCupom !== 'sem-cupom' && venda.cupom === filtroCupom)

    // Filtro de plano
    const matchPlano = filtroPlano === 'todos' || 
      (filtroPlano === 'sem-plano' && !venda.plano) ||
      (filtroPlano !== 'sem-plano' && venda.plano === filtroPlano)

    return matchSearch && matchStatus && matchCupom && matchPlano
  })

  // Ordenar vendas
  const sortedVendas = [...filteredVendas].sort((a, b) => {
    let comparison = 0
    
    switch (sortField) {
      case 'data':
        comparison = new Date(a.data).getTime() - new Date(b.data).getTime()
        break
      case 'nome':
        comparison = a.nome.localeCompare(b.nome)
        break
      case 'valor':
        comparison = a.valor - b.valor
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Paginar vendas
  const totalPages = Math.ceil(sortedVendas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedVendas = sortedVendas.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset para primeira página ao ordenar
  }

  const limparFiltros = () => {
    setSearchTerm('')
    setFiltroStatus('todos')
    setFiltroCupom('todos')
    setFiltroPlano('todos')
    setCurrentPage(1)
  }

  const temFiltrosAtivos = searchTerm !== '' || filtroStatus !== 'todos' || filtroCupom !== 'todos' || filtroPlano !== 'todos'

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros</span>
          {temFiltrosAtivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="h-7 text-xs"
            >
              Limpar filtros
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca */}
          <div className="lg:col-span-2">
            <Input
              type="text"
              placeholder="Buscar por nome, email, cupom ou observação..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          {/* Filtro de Status */}
          <Select value={filtroStatus} onValueChange={(value) => {
            setFiltroStatus(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
              <SelectItem value="ESTORNADA">Estornada</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de Cupom */}
          <Select value={filtroCupom} onValueChange={(value) => {
            setFiltroCupom(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Cupom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Cupons</SelectItem>
              <SelectItem value="sem-cupom">Sem Cupom</SelectItem>
              {cuponsUnicos.map(cupom => (
                <SelectItem key={cupom} value={cupom}>{cupom}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de Plano */}
          <Select value={filtroPlano} onValueChange={(value) => {
            setFiltroPlano(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Planos</SelectItem>
              <SelectItem value="sem-plano">Sem Plano</SelectItem>
              <SelectItem value="ANUAL">Anual</SelectItem>
              <SelectItem value="VITALICIO">Vitalício</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contador de resultados */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {filteredVendas.length} de {vendas.length} vendas
            {temFiltrosAtivos && ' (filtrado)'}
          </span>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('data')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Data
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('nome')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Nome
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('valor')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Valor
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cupom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Plano
                </th>
                {showComissao && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Comissão
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Observação
                </th>
                {(onEdit || onDelete) && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedVendas.length === 0 ? (
                <tr>
                  <td colSpan={showComissao ? 9 : 8} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                paginatedVendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(new Date(venda.data))}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {venda.nome}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {venda.email}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {formatCurrency(venda.valor)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[venda.status as keyof typeof STATUS_COLORS]}`}>
                        {venda.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {venda.cupom || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {venda.plano ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          venda.plano === 'VITALICIO' 
                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {venda.plano === 'VITALICIO' ? 'Vitalício' : 'Anual'}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    {showComissao && (
                      <td className="px-4 py-3 text-sm font-medium text-green-500">
                        {venda.comissaoEstimada ? formatCurrency(venda.comissaoEstimada) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                      {venda.observacao || '-'}
                    </td>
                    {(onEdit || onDelete) && (
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(venda)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(venda.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages} ({sortedVendas.length} vendas)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita e afetará os cálculos de comissão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId && onDelete) {
                  onDelete(deleteId)
                  setDeleteId(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


