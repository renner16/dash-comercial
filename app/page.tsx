'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VendedorDashboard } from '@/components/vendedor-dashboard'
import { GeralDashboard } from '@/components/geral-dashboard'

interface Vendedor {
  id: string
  nome: string
  cargo: string
}

export default function Home() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/vendedores')
      .then(res => res.json())
      .then(data => {
        setVendedores(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar vendedores:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-8 py-8">
        <Tabs defaultValue={vendedores[0]?.id || 'geral'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            {vendedores.map(vendedor => (
              <TabsTrigger key={vendedor.id} value={vendedor.id}>
                {vendedor.nome}
              </TabsTrigger>
            ))}
            <TabsTrigger value="geral">Geral</TabsTrigger>
          </TabsList>

          {vendedores.map(vendedor => (
            <TabsContent key={vendedor.id} value={vendedor.id} className="space-y-6">
              <VendedorDashboard vendedor={vendedor} />
            </TabsContent>
          ))}

          <TabsContent value="geral" className="space-y-6">
            <GeralDashboard vendedores={vendedores} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

