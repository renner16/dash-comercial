'use client'

import { useState } from 'react'
import { Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { formatDate } from '@/lib/utils'

interface Relatorio {
    id: string
    data: Date | string
    vendedorId?: string
    vendedorNome?: string
    leadsRecebidos: number
    respostasEnviadas: number
    vendas: number
    observacao?: string | null
}

interface LeadsTableProps {
    relatorios: Relatorio[]
    onEdit?: (relatorio: Relatorio) => void
    onDelete?: (id: string) => void
    showVendedor?: boolean
}

type SortField = 'data' | 'vendedor' | 'leads' | 'respostas' | 'taxa'
type SortDirection = 'asc' | 'desc'

export function LeadsTable({ relatorios, onEdit, onDelete, showVendedor = false }: LeadsTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortField, setSortField] = useState<SortField>('data')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const itemsPerPage = 10

    // Filtrar relatórios
    const filteredRelatorios = relatorios.filter(relatorio => {
        const matchSearch = searchTerm === '' ||
            (relatorio.vendedorNome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (relatorio.observacao?.toLowerCase() || '').includes(searchTerm.toLowerCase())

        return matchSearch
    })

    // Ordenar relatórios
    const sortedRelatorios = [...filteredRelatorios].sort((a, b) => {
        let comparison = 0

        switch (sortField) {
            case 'data':
                comparison = new Date(a.data).getTime() - new Date(b.data).getTime()
                break
            case 'vendedor':
                comparison = (a.vendedorNome || '').localeCompare(b.vendedorNome || '')
                break
            case 'leads':
                comparison = a.leadsRecebidos - b.leadsRecebidos
                break
            case 'respostas':
                comparison = a.respostasEnviadas - b.respostasEnviadas
                break
            case 'taxa':
                const taxaA = a.leadsRecebidos > 0 ? a.respostasEnviadas / a.leadsRecebidos : 0
                const taxaB = b.leadsRecebidos > 0 ? b.respostasEnviadas / b.leadsRecebidos : 0
                comparison = taxaA - taxaB
                break
        }

        return sortDirection === 'asc' ? comparison : -comparison
    })

    // Paginar
    const totalPages = Math.ceil(sortedRelatorios.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedRelatorios = sortedRelatorios.slice(startIndex, startIndex + itemsPerPage)

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
        setCurrentPage(1)
    }

    return (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Buscar por vendedor ou observação..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                    }}
                    className="max-w-sm"
                />
                <div className="ml-auto text-sm text-muted-foreground">
                    {filteredRelatorios.length} resultados
                </div>
            </div>

            <div className="rounded-md border">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <button onClick={() => handleSort('data')} className="flex items-center gap-1 hover:text-foreground">
                                        Data <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                {showVendedor && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        <button onClick={() => handleSort('vendedor')} className="flex items-center gap-1 hover:text-foreground">
                                            Vendedor <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                )}
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <button onClick={() => handleSort('leads')} className="flex items-center gap-1 hover:text-foreground">
                                        Leads <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <button onClick={() => handleSort('respostas')} className="flex items-center gap-1 hover:text-foreground">
                                        Respostas <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Vendas
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <button onClick={() => handleSort('taxa')} className="flex items-center gap-1 hover:text-foreground">
                                        Taxa (%) <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
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
                            {paginatedRelatorios.length === 0 ? (
                                <tr>
                                    <td colSpan={showVendedor ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">
                                        Nenhum relatório encontrado
                                    </td>
                                </tr>
                            ) : (
                                paginatedRelatorios.map((rel) => {
                                    const taxa = rel.leadsRecebidos > 0
                                        ? (rel.respostasEnviadas / rel.leadsRecebidos) * 100
                                        : 0

                                    return (
                                        <tr key={rel.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-4 py-3 text-sm">{formatDate(new Date(rel.data))}</td>
                                            {showVendedor && (
                                                <td className="px-4 py-3 text-sm font-medium">{rel.vendedorNome || '-'}</td>
                                            )}
                                            <td className="px-4 py-3 text-sm">{rel.leadsRecebidos}</td>
                                            <td className="px-4 py-3 text-sm">{rel.respostasEnviadas}</td>
                                            <td className="px-4 py-3 text-sm">{rel.vendas || 0}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${taxa >= 50 ? 'bg-green-500/10 text-green-500' :
                                                        taxa >= 30 ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {taxa.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                                                {rel.observacao || '-'}
                                            </td>
                                            {(onEdit || onDelete) && (
                                                <td className="px-4 py-3 text-right text-sm">
                                                    <div className="flex justify-end gap-2">
                                                        {onEdit && (
                                                            <Button variant="ghost" size="icon" onClick={() => onEdit(rel)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {onDelete && (
                                                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(rel.id)} className="text-destructive hover:text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
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

            {/* Dialog de Exclusão */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Relatório</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja diminuir a quantidade de leads? Essa ação não pode ser desfeita.
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
                            className="bg-destructive"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
