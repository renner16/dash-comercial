'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ObservacoesVendedorProps {
  vendedorId: string
}

export function ObservacoesVendedor({ vendedorId }: ObservacoesVendedorProps) {
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(true)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Carregar observações do localStorage
  useEffect(() => {
    const chave = `observacoes_${vendedorId}`
    const dadosSalvos = localStorage.getItem(chave)
    if (dadosSalvos) {
      try {
        setTexto(dadosSalvos)
        setSalvo(true)
      } catch (error) {
        console.error('Erro ao carregar observações:', error)
      }
    }
  }, [vendedorId])

  // Salvar observações no localStorage
  const salvar = () => {
    const chave = `observacoes_${vendedorId}`
    localStorage.setItem(chave, texto)
    setSalvando(false)
    setSalvo(true)
    
    // Resetar indicador de salvo após 2 segundos
    setTimeout(() => {
      setSalvo(false)
    }, 2000)
  }

  // Autosave com debounce
  const handleTextoChange = (novoTexto: string) => {
    setTexto(novoTexto)
    setSalvo(false)

    // Limpar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Salvar automaticamente após 2 segundos de inatividade
    debounceRef.current = setTimeout(() => {
      salvar()
    }, 2000)
  }

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Observações</CardTitle>
          <div className="flex items-center gap-2">
            {salvando && (
              <span className="text-xs text-muted-foreground">Salvando...</span>
            )}
            {salvo && !salvando && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3 w-3" />
                <span>Salvo</span>
              </div>
            )}
            <Button
              onClick={salvar}
              size="sm"
              variant="outline"
              disabled={salvando}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Suas anotações pessoais. Salva automaticamente após 2 segundos de inatividade.
        </p>
      </CardHeader>
      <CardContent>
        <Textarea
          value={texto}
          onChange={(e) => handleTextoChange(e.target.value)}
          placeholder="Digite suas observações aqui..."
          className="min-h-[400px] resize-none"
        />
      </CardContent>
    </Card>
  )
}


