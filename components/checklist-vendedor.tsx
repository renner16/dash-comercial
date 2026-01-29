'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Square } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface ChecklistItem {
  id: string
  texto: string
  concluida: boolean
  data: string
}

interface ChecklistVendedorProps {
  vendedorId: string
}

export function ChecklistVendedor({ vendedorId }: ChecklistVendedorProps) {
  const [modo, setModo] = useState<'diario' | 'semanal' | 'mensal'>('diario')
  const [itens, setItens] = useState<ChecklistItem[]>([])
  const [novoItem, setNovoItem] = useState('')
  const [carregando, setCarregando] = useState(true)

  // Carregar itens do banco de dados
  useEffect(() => {
    const carregarItens = async () => {
      try {
        setCarregando(true)
        const response = await fetch(`/api/checklist?vendedorId=${vendedorId}&modo=${modo}`)
        if (response.ok) {
          const dados = await response.json()
          setItens(dados.map((item: any) => ({
            id: item.id,
            texto: item.texto,
            concluida: item.concluida,
            data: item.data
          })))
        } else {
          console.error('Erro ao carregar checklist')
          setItens([])
        }
      } catch (error) {
        console.error('Erro ao carregar checklist:', error)
        setItens([])
      } finally {
        setCarregando(false)
      }
    }

    carregarItens()
  }, [vendedorId, modo])

  const toggleItem = async (id: string) => {
    const item = itens.find(i => i.id === id)
    if (!item) return

    try {
      const response = await fetch('/api/checklist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          concluida: !item.concluida,
        }),
      })

      if (response.ok) {
        const novosItens = itens.map(i =>
          i.id === id ? { ...i, concluida: !i.concluida } : i
        )
        setItens(novosItens)
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
    }
  }

  const adicionarItem = async () => {
    if (!novoItem.trim()) return

    try {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendedorId,
          texto: novoItem.trim(),
          concluida: false,
          modo,
        }),
      })

      if (response.ok) {
        const novoItemObj = await response.json()
        setItens([...itens, {
          id: novoItemObj.id,
          texto: novoItemObj.texto,
          concluida: novoItemObj.concluida,
          data: novoItemObj.data
        }])
        setNovoItem('')
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
    }
  }

  const removerItem = async (id: string) => {
    try {
      const response = await fetch(`/api/checklist?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setItens(itens.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Erro ao remover item:', error)
    }
  }

  const limparConcluidas = async () => {
    const itensConcluidas = itens.filter(item => item.concluida)
    
    // Deletar todos os itens concluídos
    await Promise.all(
      itensConcluidas.map(item => 
        fetch(`/api/checklist?id=${item.id}`, { method: 'DELETE' })
      )
    )

    setItens(itens.filter(item => !item.concluida))
  }

  const itensConcluidas = itens.filter(item => item.concluida).length
  const totalItens = itens.length
  const progresso = totalItens > 0 ? (itensConcluidas / totalItens) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Checklist {modo === 'diario' ? 'Diário' : modo === 'semanal' ? 'Semanal' : 'Mensal'}</CardTitle>
          <Select value={modo} onValueChange={(v: any) => setModo(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diario">Diário</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {totalItens > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span>Progresso: {itensConcluidas}/{totalItens}</span>
              <span>{progresso.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {carregando ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-muted-foreground">Carregando checklist...</span>
          </div>
        ) : (
          <>
            {/* Adicionar novo item */}
            <div className="flex gap-2">
          <input
            type="text"
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                adicionarItem()
              }
            }}
            placeholder="Adicionar novo item..."
            className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button onClick={adicionarItem} size="sm">
            Adicionar
          </Button>
        </div>

        {/* Lista de itens */}
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum item adicionado ainda. Adicione itens para começar!
          </p>
        ) : (
          <div className="space-y-2">
            {itens.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {item.concluida ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={item.concluida ? 'line-through text-muted-foreground' : ''}
                  >
                    {item.texto}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(new Date(item.data))}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removerItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Ações */}
        {itens.length > 0 && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={limparConcluidas}
              disabled={itensConcluidas === 0}
            >
              Limpar Concluídas
            </Button>
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>
  )
}




