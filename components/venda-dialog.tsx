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
  vendedores?: Array<{ id: string; nome: string }>
}

export function VendaDialog({ open, onOpenChange, onSave, venda, vendedorId, vendedores }: VendaDialogProps) {
  const [vendedorSelecionado, setVendedorSelecionado] = useState(vendedorId)
  const [formData, setFormData] = useState({
    data: '',
    nome: '',
    email: '',
    valor: '',
    status: 'CONFIRMADA',
    cupom: '',
    plano: '',
    observacao: '',
  })

  // Atualizar vendedor selecionado quando vendedorId mudar
  useEffect(() => {
    if (vendedorId) {
      setVendedorSelecionado(vendedorId)
    } else if (vendedores && vendedores.length > 0) {
      setVendedorSelecionado(vendedores[0].id)
    }
  }, [vendedorId, vendedores])

  useEffect(() => {
    if (open) {
      if (venda) {
        setFormData({
          data: new Date(venda.data).toISOString().split('T')[0],
          nome: venda.nome,
          email: venda.email,
          valor: venda.valor.toString(),
          status: venda.status || 'CONFIRMADA',
          cupom: venda.cupom || '',
          plano: venda.plano || '',
          observacao: venda.observacao || '',
        })
        // Atualizar vendedor selecionado se a venda tiver vendedorId
        if (venda.vendedorId) {
          setVendedorSelecionado(venda.vendedorId)
        }
      } else {
        setFormData({
          data: new Date().toISOString().split('T')[0],
          nome: '',
          email: '',
          valor: '',
          status: 'CONFIRMADA',
          cupom: '',
          plano: '',
          observacao: '',
        })
      }
    }
  }, [venda, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('❌ Por favor, insira um email válido.')
      return
    }

    const valor = parseFloat(formData.valor)
    
    // Alerta para valores muito baixos (< R$ 100)
    if (valor < 100) {
      const confirmar = confirm('⚠️ Valor muito baixo (menos de R$ 100,00). Tem certeza que está correto?')
      if (!confirmar) return
    }
    
    // Alerta para valores muito altos (> R$ 10.000)
    if (valor > 10000) {
      const confirmar = confirm('⚠️ Valor muito alto (mais de R$ 10.000,00). Tem certeza que está correto?')
      if (!confirmar) return
    }
    
    const vendaData: any = {
      ...formData,
      valor,
      data: new Date(formData.data + 'T12:00:00').toISOString(), // Converter para ISO string
      vendedorId: vendedorSelecionado || vendedorId,
      status: formData.status, // Garantir que o status está sendo enviado
    }

    if (venda) {
      vendaData.id = venda.id
    }

    console.log('Enviando venda:', vendaData) // Debug
    await onSave(vendaData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{venda ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {vendedores && vendedores.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="vendedor">Vendedor</Label>
              <Select value={vendedorSelecionado} onValueChange={setVendedorSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                <SelectItem value="CANCELADA">CANCELADA</SelectItem>
                <SelectItem value="ESTORNADA">ESTORNADA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cupom">Cupom Usado (opcional)</Label>
            <Input
              id="cupom"
              value={formData.cupom}
              onChange={(e) => setFormData({ ...formData, cupom: e.target.value })}
              placeholder="Ex: DESCONTO10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plano">Plano do Lead</Label>
            <Select value={formData.plano} onValueChange={(value) => setFormData({ ...formData, plano: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANUAL">Anual</SelectItem>
                <SelectItem value="VITALICIO">Vitalício</SelectItem>
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

