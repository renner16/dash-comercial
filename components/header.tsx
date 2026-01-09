'use client'

import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Cultura Builder Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
        
        <Link
          href="https://plano-carreira-vercel-3izbxmi3g-ygors-projects-4796f89e.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Plano de Carreira</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </header>
  )
}


