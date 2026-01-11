'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function MetasPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Gerenciar Metas</h1>
          <p className="text-muted-foreground">Definir metas mensais e semanais para os vendedores</p>
        </div>

        {/* Cards de Metas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Metas por Cargo</CardTitle>
              </div>
              <CardDescription>
                Configure metas padrão para cada cargo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Júnior</p>
                  <p className="text-sm text-muted-foreground">Semanal: 5 vendas | Mensal: 20 vendas</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Pleno</p>
                  <p className="text-sm text-muted-foreground">Semanal: 7 vendas | Mensal: 28 vendas</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Sênior</p>
                  <p className="text-sm text-muted-foreground">Semanal: 10 vendas | Mensal: 40 vendas</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium mb-2">Gerente</p>
                  <p className="text-sm text-muted-foreground">Semanal: 12 vendas | Mensal: 48 vendas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As metas atuais são definidas automaticamente por cargo. A funcionalidade de edição personalizada de metas será implementada em breve.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

