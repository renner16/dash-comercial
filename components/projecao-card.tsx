'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Clock, Target } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ProjecaoCardProps {
  faturamentoAtual: number
  comissaoAtual?: number
  salarioFixo?: number
  diasDecorridos: number
  diasNoMes: number
  proximaFaixa: {
    valor: number
    percentual: string
  } | null
}

export function ProjecaoCard({
  faturamentoAtual,
  comissaoAtual,
  salarioFixo,
  diasDecorridos,
  diasNoMes,
  proximaFaixa
}: ProjecaoCardProps) {
  // Calcular projeção de faturamento
  const mediaDiaria = diasDecorridos > 0 ? faturamentoAtual / diasDecorridos : 0
  const diasRestantes = diasNoMes - diasDecorridos
  const projecaoFimMes = faturamentoAtual + (mediaDiaria * diasRestantes)

  // Calcular projeção de comissão (se houver)
  const mediaDiariaComissao = (comissaoAtual && diasDecorridos > 0) ? comissaoAtual / diasDecorridos : 0
  const projecaoComissao = comissaoAtual !== undefined ? comissaoAtual + (mediaDiariaComissao * diasRestantes) : null
  
  // Calcular projeção de salário total (salário fixo + comissão)
  const projecaoSalarioTotal = (salarioFixo !== undefined && projecaoComissao !== null) 
    ? salarioFixo + projecaoComissao 
    : null

  // Progresso do mês
  const progressoMes = (diasDecorridos / diasNoMes) * 100

  // Verificar se vai atingir próxima faixa
  const vaiAtingirProximaFaixa = proximaFaixa && projecaoFimMes >= proximaFaixa.valor

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-orange-600/5 border-amber-500/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Projeções
        </CardTitle>
        <TrendingUp className="w-4 h-4 text-amber-500" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Projeção de Vendas */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Projeção de Vendas
          </p>
          <div className="text-2xl font-bold text-amber-600">
            {formatCurrency(projecaoFimMes)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ritmo: {formatCurrency(mediaDiaria)}/dia
          </p>
        </div>

        {/* Projeção de Comissão */}
        {projecaoComissao !== null && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">
              Projeção de Comissão
            </p>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(projecaoComissao)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ritmo: {formatCurrency(mediaDiariaComissao)}/dia
            </p>
            {projecaoSalarioTotal !== null && (
              <p className="text-xs text-muted-foreground mt-2">
                Salário Total: <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(projecaoSalarioTotal)}</span>
              </p>
            )}
          </div>
        )}

        {/* Progresso do Mês */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              Progresso
            </span>
            <span className="font-medium">{progressoMes.toFixed(0)}%</span>
          </div>
          <Progress value={progressoMes} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {diasDecorridos} de {diasNoMes} dias
          </p>
        </div>

        {/* Próxima Faixa */}
        {proximaFaixa && (
          <div className={`pt-2 border-t ${vaiAtingirProximaFaixa ? 'border-green-500/30' : 'border-border'}`}>
            <div className="flex items-start gap-2">
              <Target className={`w-3 h-3 mt-0.5 ${vaiAtingirProximaFaixa ? 'text-green-500' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <p className={`text-xs font-medium ${vaiAtingirProximaFaixa ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                  {vaiAtingirProximaFaixa
                    ? `✓ Vai atingir próxima faixa!`
                    : `Próxima faixa: ${proximaFaixa.percentual}`
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {vaiAtingirProximaFaixa
                    ? `Comissão de ${proximaFaixa.percentual} a partir de ${formatCurrency(proximaFaixa.valor)}`
                    : `Faltam ${formatCurrency(proximaFaixa.valor - projecaoFimMes)} no ritmo atual`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}






