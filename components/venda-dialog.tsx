'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface VendaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (venda: any) => void
  venda?: any
  vendedorId: string
}

export function VendaDialog({ open, onOpenChange, onSave, venda, vendedorId }: VendaDialogProps) {
  const [formData, setFormData] = useState({
    data: '',
    nome: '',
    email: '',
    valor: '',
    status: 'CONFIRMADA',
    observacao: '',
  })

  useEffect(() => {
    if (venda) {
      setFormData({
        data: new Date(venda.data).toISOString().split('T')[0],
        nome: venda.nome,
        email: venda.email,
        valor: venda.valor.toString(),
        status: venda.status,
        observacao: venda.observacao || '',
      })
    } else {
      setFormData({
        data: new Date().toISOString().split('T')[0],
        nome: '',
        email: '',
        valor: '',
        status: 'CONFIRMADA',
        observacao: '',
      })
    }
  }, [venda, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const vendaData = {
      ...formData,
      valor: parseFloat(formData.valor),
      data: new Date(formData.data + 'T12:00:00'),
      vendedorId,
    }

    if (venda) {
      vendaData.id = venda.id
    }

    await onSave(vendaData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{venda ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cliente</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMADA">CONFIRMADA</SelectItem>
                <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                <SelectItem value="ESTORNADA">ESTORNADA</SelectItem>
              </SelectContent>
            </Select>
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
              {venda ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

