'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Target, 
  CheckSquare, 
  StickyNote, 
  Download,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarVendedorProps {
  vendedor: {
    id: string
    nome: string
    cargo: string
  }
  activeTab: string
  onTabChange: (tab: string) => void
  onExportBackup: () => void
  onToggle?: (isOpen: boolean) => void
  notificacoesCount?: number
}

export function SidebarVendedor({ 
  vendedor, 
  activeTab, 
  onTabChange, 
  onExportBackup,
  onToggle,
  notificacoesCount = 0
}: SidebarVendedorProps) {
  // Carregar estado do localStorage
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`sidebarOpen_${vendedor.id}`)
      return saved !== null ? saved === 'true' : true
    }
    return true
  })

  // Salvar estado no localStorage e notificar componente pai
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sidebarOpen_${vendedor.id}`, isOpen.toString())
    }
    onToggle?.(isOpen)
  }, [isOpen, vendedor.id, onToggle])

  const menuItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'faturamento', label: 'Faturamento', icon: DollarSign },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'notificacoes', label: 'Renovações', icon: Bell },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'observacoes', label: 'Observações', icon: StickyNote },
  ]

  const inicialNome = vendedor.nome.charAt(0).toUpperCase()

  return (
    <>
      {/* Overlay para mobile quando sidebar está aberta */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border z-30",
          "transition-all duration-300 ease-in-out",
          "shadow-lg",
          // Mobile: controlado por translate
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: sempre visível, largura varia
          "md:translate-x-0",
          // Largura: mobile sempre 256px quando visível, desktop varia
          "w-64",
          isOpen ? "md:w-64" : "md:w-16"
        )}
      >
        {/* Toggle Button - sempre visível no topo */}
        <div className={cn(
          "flex items-center border-b border-border bg-card",
          isOpen ? "justify-between px-4 py-3" : "justify-center p-2"
        )}>
          {isOpen && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <Menu className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold">Menu</span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const newState = !isOpen
              console.log('Toggle clicked, changing from', isOpen, 'to', newState)
              setIsOpen(newState)
            }}
            className={cn(
              "flex items-center justify-center rounded-md transition-all",
              "hover:bg-accent hover:text-accent-foreground",
              "text-muted-foreground hover:text-foreground",
              "cursor-pointer relative z-50",
              "active:scale-95",
              isOpen ? "p-1.5" : "p-2 w-full"
            )}
            title={isOpen ? "Recolher menu" : "Expandir menu"}
            type="button"
            aria-label={isOpen ? "Recolher menu" : "Expandir menu"}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

      {/* Perfil do Vendedor */}
      <div className={cn(
        "border-b border-border transition-all duration-300",
        isOpen ? "p-4" : "p-2"
      )}>
        <div className={cn(
          "flex items-center transition-all duration-300",
          isOpen ? "gap-3" : "justify-center"
        )}>
          <div className={cn(
            "rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 transition-all duration-300",
            isOpen ? "h-12 w-12 text-lg" : "h-8 w-8 text-sm"
          )}>
            {inicialNome}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
              <p className="font-semibold text-sm truncate">{vendedor.nome}</p>
              <p className="text-xs text-muted-foreground truncate">{vendedor.cargo}</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const showBadge = false
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id)
                // Fechar sidebar em mobile após selecionar
                if (window.innerWidth < 768) {
                  setIsOpen(false)
                }
              }}
              className={cn(
                "w-full flex items-center rounded-lg transition-all duration-200 relative",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground font-medium shadow-sm",
                isOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <div className="relative">
                <Icon className={cn(
                  "flex-shrink-0 transition-all",
                  "h-5 w-5",
                  isActive && "scale-110"
                )} />
                {showBadge && (
                  <span className={cn(
                    "absolute -top-1 -right-1 rounded-full bg-red-500 text-white font-bold flex items-center justify-center",
                    isOpen ? "h-4 w-4 text-[10px]" : "h-3 w-3 text-[8px]"
                  )}>
                    {notificacoesCount > 9 ? '9+' : notificacoesCount}
                  </span>
                )}
              </div>
              {isOpen && (
                <span className={cn(
                  "text-sm transition-all duration-300 whitespace-nowrap flex-1",
                  "animate-in fade-in slide-in-from-left-2"
                )}>
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Backup Button */}
      <div className="p-2 border-t border-border">
        <button
          onClick={onExportBackup}
          className={cn(
            "w-full flex items-center rounded-lg transition-all duration-200",
            "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
            isOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2"
          )}
          title={!isOpen ? "Salvar Backup" : undefined}
        >
          <Download className="h-5 w-5 flex-shrink-0" />
          {isOpen && (
            <span className={cn(
              "text-sm transition-all duration-300 whitespace-nowrap",
              "animate-in fade-in slide-in-from-left-2"
            )}>
              Salvar Backup
            </span>
          )}
        </button>
      </div>
    </div>

    {/* Botão para abrir sidebar em mobile (quando fechada) */}
    {!isOpen && (
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    )}
    </>
  )
}

