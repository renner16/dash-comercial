'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Venda {
  id: string
  data: Date
  nome: string
  email: string
  valor: number
  status: string
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
  ESTORNADA: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export function VendasTable({ vendas, onEdit, onDelete, showComissao = false }: VendasTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVendas = vendas.filter(venda =>
    venda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venda.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
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
              {filteredVendas.length === 0 ? (
                <tr>
                  <td colSpan={showComissao ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                filteredVendas.map((venda) => (
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
                              onClick={() => onDelete(venda.id)}
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
    </div>
  )
}


