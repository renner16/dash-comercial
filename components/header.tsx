'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <img 
                src="/logo.png?v=2" 
                alt="Cultura Builder Logo" 
                className="h-8 sm:h-12 w-auto object-contain"
                style={{ maxWidth: '200px' }}
                onLoad={() => console.log('Logo carregada com sucesso!')}
                onError={(e) => {
                  console.error('Erro ao carregar logo');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Cultura Builder</h1>
              <p className="text-xs text-muted-foreground">Sales Ops</p>
            </div>
          </div>
        </div>
        
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
    </header>
  )
}


