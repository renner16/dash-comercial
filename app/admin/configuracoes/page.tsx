'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link'

export default function ConfiguracoesPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Ajustes gerais do sistema</p>
        </div>

        {/* Cards de Configurações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <CardTitle>Configurações Gerais</CardTitle>
              </div>
              <CardDescription>
                Ajustes básicos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As configurações gerais estão em desenvolvimento. Em breve você poderá ajustar preferências do sistema.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Versão:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Banco de Dados:</span>
                <span className="font-medium">Neon PostgreSQL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ambiente:</span>
                <span className="font-medium">Produção</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

