'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import Link from 'next/link'

export default function RelatoriosPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Relatórios Consolidados</h1>
          <p className="text-muted-foreground">Gere relatórios detalhados do sistema</p>
        </div>

        {/* Cards de Relatórios */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Relatório de Vendas</CardTitle>
              </div>
              <CardDescription>
                Relatório completo de todas as vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Relatório de Performance</CardTitle>
              </div>
              <CardDescription>
                Análise de performance do time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Relatório de Comissões</CardTitle>
              </div>
              <CardDescription>
                Relatório detalhado de comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Os relatórios consolidados estão em desenvolvimento. Em breve você poderá gerar relatórios detalhados de vendas, performance e comissões.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

