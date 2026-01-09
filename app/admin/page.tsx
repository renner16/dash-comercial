'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { ArrowLeft, Users, TrendingUp, Database, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 sm:p-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Dashboard
            </Button>
          </Link>
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie vendedores, planos de carreira e configurações do sistema</p>
        </div>

        {/* Cards de Administração */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Gestão de Vendedores */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Vendedores</CardTitle>
              </div>
              <CardDescription>
                Adicionar, editar ou remover vendedores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Gerenciar Vendedores
              </Button>
            </CardContent>
          </Card>

          {/* Planos de Carreira */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Planos de Carreira</CardTitle>
              </div>
              <CardDescription>
                Configurar salários e comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Gerenciar Planos
              </Button>
            </CardContent>
          </Card>

          {/* Backup e Dados */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <CardTitle>Backup de Dados</CardTitle>
              </div>
              <CardDescription>
                Exportar ou importar dados do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" size="sm">
                  Exportar
                </Button>
                <Button className="flex-1" variant="outline" size="sm">
                  Importar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Relatórios */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Relatórios</CardTitle>
              </div>
              <CardDescription>
                Gerar relatórios consolidados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <CardTitle>Configurações</CardTitle>
              </div>
              <CardDescription>
                Ajustes gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Abrir Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Metas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Metas</CardTitle>
              </div>
              <CardDescription>
                Definir metas mensais e semanais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Gerenciar Metas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Sistema */}
        <Card className="mt-8">
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
              <span className="text-muted-foreground">Último Backup:</span>
              <span className="font-medium">Nunca</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



