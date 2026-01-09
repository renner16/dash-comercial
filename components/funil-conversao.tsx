'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, ArrowDown } from "lucide-react"

interface FunilConversaoProps {
  leadsRecebidos: number
  respostasEnviadas: number
  vendasFechadas: number
}

export function FunilConversao({ 
  leadsRecebidos, 
  respostasEnviadas, 
  vendasFechadas 
}: FunilConversaoProps) {
  // Calcular taxas de conversão
  const taxaResposta = leadsRecebidos > 0 
    ? ((respostasEnviadas / leadsRecebidos) * 100).toFixed(1)
    : '0'
  
  const taxaFechamento = respostasEnviadas > 0 
    ? ((vendasFechadas / respostasEnviadas) * 100).toFixed(1)
    : '0'
  
  const taxaConversaoGeral = leadsRecebidos > 0 
    ? ((vendasFechadas / leadsRecebidos) * 100).toFixed(1)
    : '0'

  // Calcular larguras dos estágios do funil (baseado em percentuais)
  const larguraRespostas = leadsRecebidos > 0 
    ? (respostasEnviadas / leadsRecebidos) * 100 
    : 0
  
  const larguraVendas = leadsRecebidos > 0 
    ? (vendasFechadas / leadsRecebidos) * 100 
    : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Funil de Conversão
        </CardTitle>
        <div className="text-sm font-medium text-primary">
          {taxaConversaoGeral}% total
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estágio 1: Leads Recebidos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Leads Recebidos</span>
            <span className="text-2xl font-bold text-blue-600">{leadsRecebidos}</span>
          </div>
          <div className="w-full h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-md">
            100%
          </div>
        </div>

        {/* Seta */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center text-muted-foreground">
            <ArrowDown className="w-6 h-6" />
            <span className="text-xs mt-1">{taxaResposta}%</span>
          </div>
        </div>

        {/* Estágio 2: Respostas Enviadas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Respostas Enviadas</span>
            <span className="text-2xl font-bold text-green-600">{respostasEnviadas}</span>
          </div>
          <div className="w-full flex justify-center">
            <div 
              className="h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-md transition-all duration-500"
              style={{ width: `${Math.max(30, larguraRespostas)}%` }}
            >
              {taxaResposta}%
            </div>
          </div>
        </div>

        {/* Seta */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center text-muted-foreground">
            <ArrowDown className="w-6 h-6" />
            <span className="text-xs mt-1">{taxaFechamento}%</span>
          </div>
        </div>

        {/* Estágio 3: Vendas Fechadas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Vendas Fechadas</span>
            <span className="text-2xl font-bold text-purple-600">{vendasFechadas}</span>
          </div>
          <div className="w-full flex justify-center">
            <div 
              className="h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-md transition-all duration-500"
              style={{ width: `${Math.max(20, larguraVendas)}%` }}
            >
              {taxaConversaoGeral}%
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de Resposta:</span>
            <span className="font-medium">{taxaResposta}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de Fechamento:</span>
            <span className="font-medium">{taxaFechamento}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-semibold">Conversão Geral:</span>
            <span className="font-bold text-primary">{taxaConversaoGeral}%</span>
          </div>
        </div>

        {/* Insights */}
        {parseFloat(taxaResposta) < 50 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
            💡 <span className="font-medium">Oportunidade:</span> Taxa de resposta abaixo de 50%. Considere melhorar o script de abordagem inicial.
          </div>
        )}
        {parseFloat(taxaFechamento) < 15 && respostasEnviadas > 0 && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-sm text-orange-700 dark:text-orange-400">
            💡 <span className="font-medium">Oportunidade:</span> Taxa de fechamento abaixo de 15%. Revise as objeções comuns dos clientes.
          </div>
        )}
        {parseFloat(taxaConversaoGeral) >= 20 && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-700 dark:text-green-400">
            ✨ <span className="font-medium">Excelente!</span> Conversão geral acima de 20%. Continue com as estratégias atuais!
          </div>
        )}
      </CardContent>
    </Card>
  )
}

