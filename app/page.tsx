'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [activeTab, setActiveTab] = useState<string>('geral')
  const [vendedorTabState, setVendedorTabState] = useState<Record<string, string>>({}) // Estado por vendedor

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

  // Função para exportar backup (será preenchida pelo VendedorDashboard)
  const exportBackupFnRef = useRef<(() => void) | null>(null)
  const [exportBackupFn, setExportBackupFn] = useState<(() => void) | null>(null)

  // Quando a URL mudar ou houver um hash, verificar se precisa mudar a aba
  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') return
    
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'geral' || hash === '') {
        setActiveTab('geral')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    
    // Listener para evento customizado do logo
    const handleNavigateToGeral = () => {
      setActiveTab('geral')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('navigateToGeral', handleNavigateToGeral)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('navigateToGeral', handleNavigateToGeral)
    }
  }, [])

  // Detectar vendedor atual baseado na aba ativa
  const vendedorSelecionado = vendedores.find(v => v.id === activeTab) || null
  const tabAtualVendedor = vendedorSelecionado ? (vendedorTabState[vendedorSelecionado.id] || 'visao-geral') : 'visao-geral'

  // Limpar função quando mudar de vendedor
  useEffect(() => {
    if (!vendedorSelecionado) {
      exportBackupFnRef.current = null
      setExportBackupFn(null)
    } else {
      // Atualizar função quando mudar para um vendedor
      if (exportBackupFnRef.current) {
        setExportBackupFn(() => exportBackupFnRef.current!)
      }
    }
  }, [vendedorSelecionado?.id])

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

  const handleExportBackup = () => {
    const fn = exportBackupFnRef.current || exportBackupFn
    if (fn) {
      fn()
    } else {
      console.log('Função de exportar backup ainda não está disponível')
    }
  }

  return (
    <div className="min-h-screen">
      <Header 
        vendedores={vendedores}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="geral" className="space-y-6">
            <GeralDashboard vendedores={vendedores} />
          </TabsContent>

          {vendedores.map(vendedor => (
            <TabsContent 
              key={vendedor.id} 
              value={vendedor.id} 
              className="space-y-6"
            >
              <VendedorDashboard 
                vendedor={vendedor} 
                activeTab={vendedorTabState[vendedor.id] || 'visao-geral'}
                onTabChange={(tab) => {
                  setVendedorTabState(prev => ({
                    ...prev,
                    [vendedor.id]: tab
                  }))
                }}
                onExportBackupReady={(exportFn) => {
                  // Armazenar função no ref e atualizar estado apenas se for o vendedor ativo
                  exportBackupFnRef.current = exportFn
                  if (vendedor.id === activeTab) {
                    setExportBackupFn(() => exportFn)
                  }
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}


