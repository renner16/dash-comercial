'use client'

import { ExternalLink, Settings } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface Vendedor {
  id: string
  nome: string
  cargo: string
}

interface HeaderProps {
  vendedores?: Vendedor[]
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function Header({ 
  vendedores = [], 
  activeTab, 
  onTabChange
}: HeaderProps = {}) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Verificar se está no cliente
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    // Detectar tema inicial
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }
    
    checkTheme()
    
    // Observar mudanças no tema
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  const logoSrc = isDark ? '/logo.png' : '/logolog2.png'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link 
            href="/#geral" 
            className="relative flex items-center cursor-pointer hover:opacity-80 transition-opacity shrink-0"
            onClick={(e) => {
              // Se já estiver na home, apenas muda a aba
              if (typeof window !== 'undefined' && window.location.pathname === '/') {
                e.preventDefault()
                window.location.hash = 'geral'
                // Dispara evento customizado para mudar a aba
                window.dispatchEvent(new CustomEvent('navigateToGeral'))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            <img 
              src={logoSrc}
              key={logoSrc} // Força re-render quando muda
              alt="Cultura Builder Logo" 
              className="h-8 sm:h-12 w-auto object-contain transition-opacity duration-300"
              style={{ maxWidth: '200px' }}
              onError={(e) => {
                console.error('Erro ao carregar logo');
                e.currentTarget.style.display = 'none';
              }}
            />
          </Link>

          {/* Menu de Abas (Geral, Geovana, Kelvin, etc.) - ao lado da logo */}
          {vendedores && vendedores.length > 0 && activeTab && onTabChange && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="inline-flex gap-1 sm:gap-2 bg-muted/50 backdrop-blur-sm rounded-md p-1 h-9 sm:h-10">
                  <button
                    onClick={() => onTabChange('geral')}
                    className={cn(
                      "whitespace-nowrap px-3 sm:px-4 rounded-md text-sm font-medium transition-all",
                      "hover:bg-background/50",
                      activeTab === 'geral' 
                        ? "bg-background shadow-sm text-primary" 
                        : "text-muted-foreground"
                    )}
                  >
                    Geral
                  </button>
                  {vendedores.map(v => (
                    <button
                      key={v.id}
                      onClick={() => onTabChange(v.id)}
                      className={cn(
                        "whitespace-nowrap px-3 sm:px-4 rounded-md text-sm font-medium transition-all",
                        "hover:bg-background/50",
                        activeTab === v.id 
                          ? "bg-background shadow-sm text-primary" 
                          : "text-muted-foreground"
                      )}
                    >
                      {v.nome}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <ThemeToggle />
          <Link href="/admin">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 sm:gap-2"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">ADM</span>
            </Button>
          </Link>
          <Link
            href="https://plano-carreira-vercel-3izbxmi3g-ygors-projects-4796f89e.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="hidden sm:inline">Plano de Carreira</span>
            <span className="sm:hidden">Plano</span>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}


