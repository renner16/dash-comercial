'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface PlanoCarreira {
  id: string
  cargo: string
  salarioFixo: number
  percentuais: string
  dataVigencia: string
  ativo: boolean
  observacao?: string
}

export default function PlanosCarreiraPage() {
  const [planos, setPlanos] = useState<PlanoCarreira[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPlanos()
  }, [])

  const carregarPlanos = async () => {
    try {
      const res = await fetch('/api/planos-carreira')
      const data = await res.json()
      setPlanos(data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPercentuaisArray = (percentuais: string): number[] => {
    try {
      return typeof percentuais === 'string' ? JSON.parse(percentuais) : percentuais
    } catch {
      return [0, 0, 0, 0]
    }
  }

  const faixas = ['0-40k', '40k-50k', '50k-60k', '60k+']

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
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Planos de Carreira</h1>
          <p className="text-muted-foreground">Visualize os planos de carreira configurados no sistema</p>
        </div>

        {/* Lista de Planos */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {['JUNIOR', 'PLENO', 'SENIOR', 'GERENTE'].map((cargo) => {
              const planosCargo = planos.filter(p => p.cargo === cargo)
              const planoAtivo = planosCargo.find(p => p.ativo) || planosCargo[0]

              if (!planoAtivo) return null

              const percentuais = getPercentuaisArray(planoAtivo.percentuais)

              return (
                <Card key={cargo}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <CardTitle>{cargo}</CardTitle>
                      {planoAtivo.ativo && (
                        <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
                          Ativo
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      Vigência desde: {new Date(planoAtivo.dataVigencia).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Salário Fixo:</p>
                      <p className="text-2xl font-bold">{formatCurrency(planoAtivo.salarioFixo)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Comissões por Faixa:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {faixas.map((faixa, index) => (
                          <div key={faixa} className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">{faixa}</p>
                            <p className="text-lg font-semibold">{(percentuais[index] * 100).toFixed(0)}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {planoAtivo.observacao && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Observação:</strong> {planoAtivo.observacao}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

