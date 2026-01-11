'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { ArrowLeft, Download, Upload, Database } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function BackupPage() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      // Buscar todos os dados
      const [vendedores, vendas, relatorios, planos] = await Promise.all([
        fetch('/api/vendedores').then(r => r.json()),
        fetch('/api/vendas').then(r => r.json()),
        fetch('/api/relatorios').then(r => r.json()),
        fetch('/api/planos-carreira').then(r => r.json()),
      ])

      const backup = {
        vendedores,
        vendas,
        relatorios,
        planos,
        dataBackup: new Date().toISOString(),
        versao: '1.0.0'
      }

      // Criar arquivo JSON
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('Backup exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar backup:', error)
      alert('Erro ao exportar backup')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      // Validar estrutura do backup
      if (!backup.vendedores || !backup.vendas || !backup.relatorios || !backup.planos) {
        alert('Arquivo de backup inválido')
        return
      }

      if (!confirm('Importar backup irá substituir os dados atuais. Deseja continuar?')) {
        return
      }

      // Aqui você implementaria a lógica de importação
      // Por segurança, isso deve ser feito via API com validações
      alert('Funcionalidade de importação será implementada em breve. Por enquanto, use a exportação para fazer backup dos dados.')
    } catch (error) {
      console.error('Erro ao importar backup:', error)
      alert('Erro ao importar backup. Verifique se o arquivo é válido.')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

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
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Backup de Dados</h1>
          <p className="text-muted-foreground">Exportar ou importar dados do sistema</p>
        </div>

        {/* Cards de Ação */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Exportar */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                <CardTitle>Exportar Dados</CardTitle>
              </div>
              <CardDescription>
                Faça backup de todos os dados do sistema em formato JSON
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleExport} 
                disabled={exporting}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exportando...' : 'Exportar Backup'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                O arquivo incluirá: vendedores, vendas, relatórios e planos de carreira
              </p>
            </CardContent>
          </Card>

          {/* Importar */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <CardTitle>Importar Dados</CardTitle>
              </div>
              <CardDescription>
                Restaure dados de um backup anterior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="hidden"
                />
                <Button 
                  asChild
                  disabled={importing}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <span>
                    <Upload className="w-4 h-4" />
                    {importing ? 'Importando...' : 'Selecionar Arquivo'}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ A importação substituirá os dados atuais
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informações */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle>Informações sobre Backup</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              • O backup inclui todos os vendedores, vendas, relatórios e planos de carreira
            </p>
            <p className="text-muted-foreground">
              • O arquivo é exportado em formato JSON e pode ser editado manualmente se necessário
            </p>
            <p className="text-muted-foreground">
              • Recomendamos fazer backup regularmente para proteger seus dados
            </p>
            <p className="text-muted-foreground">
              • A importação está em desenvolvimento e será implementada em breve
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

