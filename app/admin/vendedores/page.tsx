'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { ArrowLeft, Plus, Edit, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Vendedor {
  id: string
  nome: string
  cargo: string
  createdAt: string
  updatedAt: string
}

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null)
  const [formData, setFormData] = useState({ nome: '', cargo: 'PLENO' })

  useEffect(() => {
    carregarVendedores()
  }, [])

  const carregarVendedores = async () => {
    try {
      const res = await fetch('/api/vendedores')
      const data = await res.json()
      setVendedores(data)
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingVendedor 
        ? `/api/vendedores/${editingVendedor.id}`
        : '/api/vendedores'
      
      const method = editingVendedor ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setDialogOpen(false)
        setEditingVendedor(null)
        setFormData({ nome: '', cargo: 'PLENO' })
        carregarVendedores()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao salvar vendedor')
      }
    } catch (error) {
      console.error('Erro ao salvar vendedor:', error)
      alert('Erro ao salvar vendedor')
    }
  }

  const handleEdit = (vendedor: Vendedor) => {
    setEditingVendedor(vendedor)
    setFormData({ nome: vendedor.nome, cargo: vendedor.cargo })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vendedor?')) return

    try {
      const res = await fetch(`/api/vendedores/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        carregarVendedores()
      } else {
        alert('Erro ao excluir vendedor')
      }
    } catch (error) {
      console.error('Erro ao excluir vendedor:', error)
      alert('Erro ao excluir vendedor')
    }
  }

  const handleNew = () => {
    setEditingVendedor(null)
    setFormData({ nome: '', cargo: 'PLENO' })
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 sm:p-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Admin
            </Button>
          </Link>
        </div>

        {/* Título */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Gerenciar Vendedores</h1>
            <p className="text-muted-foreground">Adicionar, editar ou remover vendedores do sistema</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNew} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Vendedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}</DialogTitle>
                <DialogDescription>
                  {editingVendedor ? 'Atualize as informações do vendedor' : 'Preencha os dados do novo vendedor'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JUNIOR">Júnior</SelectItem>
                      <SelectItem value="PLENO">Pleno</SelectItem>
                      <SelectItem value="SENIOR">Sênior</SelectItem>
                      <SelectItem value="GERENTE">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingVendedor ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Vendedores */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendedores.map((vendedor) => (
              <Card key={vendedor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <CardTitle>{vendedor.nome}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    Cargo: <span className="font-medium">{vendedor.cargo}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(vendedor)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(vendedor.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

