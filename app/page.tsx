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
      <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <Tabs defaultValue="geral" className="space-y-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0 pb-2">
            <TabsList className="inline-flex min-w-full sm:min-w-0 px-4 sm:px-1 h-12 sm:h-11 gap-1 sm:gap-2 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger 
                value="geral" 
                className="whitespace-nowrap px-4 sm:px-6 rounded-lg font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary"
              >
                Geral
              </TabsTrigger>
              {vendedores.map(vendedor => (
                <TabsTrigger 
                  key={vendedor.id} 
                  value={vendedor.id} 
                  className="whitespace-nowrap px-4 sm:px-6 rounded-lg font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary"
                >
                  {vendedor.nome}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="geral" className="space-y-6">
            <GeralDashboard vendedores={vendedores} />
          </TabsContent>

          {vendedores.map(vendedor => (
            <TabsContent key={vendedor.id} value={vendedor.id} className="space-y-6">
              <VendedorDashboard vendedor={vendedor} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}


