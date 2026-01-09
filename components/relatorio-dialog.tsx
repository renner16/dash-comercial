'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface RelatorioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (relatorio: any) => void
  relatorio?: any
  vendedorId: string
}

export function RelatorioDialog({ open, onOpenChange, onSave, relatorio, vendedorId }: RelatorioDialogProps) {
  const [formData, setFormData] = useState({
    data: '',
    leadsRecebidos: '',
    respostasEnviadas: '',
    vendas: '',
    observacao: '',
  })

  useEffect(() => {
    if (relatorio) {
      setFormData({
        data: new Date(relatorio.data).toISOString().split('T')[0],
        leadsRecebidos: relatorio.leadsRecebidos.toString(),
        respostasEnviadas: relatorio.respostasEnviadas.toString(),
        vendas: relatorio.vendas.toString(),
        observacao: relatorio.observacao || '',
      })
    } else {
      setFormData({
        data: new Date().toISOString().split('T')[0],
        leadsRecebidos: '',
        respostasEnviadas: '',
        vendas: '',
        observacao: '',
      })
    }
  }, [relatorio, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const relatorioData = {
      ...formData,
      leadsRecebidos: parseInt(formData.leadsRecebidos),
      respostasEnviadas: parseInt(formData.respostasEnviadas),
      vendas: parseInt(formData.vendas),
      data: new Date(formData.data + 'T12:00:00'),
      vendedorId,
    }

    if (relatorio) {
      relatorioData.id = relatorio.id
    }

    await onSave(relatorioData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{relatorio ? 'Editar Relatório Diário' : 'Novo Relatório Diário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadsRecebidos" className="block h-10 flex items-center">Leads Recebidos</Label>
              <Input
                id="leadsRecebidos"
                type="number"
                min="0"
                value={formData.leadsRecebidos}
                onChange={(e) => setFormData({ ...formData, leadsRecebidos: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respostasEnviadas" className="block h-10 flex items-center">Respostas Recebidas</Label>
              <Input
                id="respostasEnviadas"
                type="number"
                min="0"
                value={formData.respostasEnviadas}
                onChange={(e) => setFormData({ ...formData, respostasEnviadas: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendas" className="block h-10 flex items-center">Vendas</Label>
              <Input
                id="vendas"
                type="number"
                min="0"
                value={formData.vendas}
                onChange={(e) => setFormData({ ...formData, vendas: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação (opcional)</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {relatorio ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

