'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from 'lucide-react'

interface PeriodSelectorProps {
  mes: number | null
  ano: number
  tipoVisao: 'mensal' | 'anual'
  onMesChange: (mes: number | null) => void
  onAnoChange: (ano: number) => void
  onTipoVisaoChange: (tipo: 'mensal' | 'anual') => void
}

export function PeriodSelector({ 
  mes, 
  ano, 
  tipoVisao,
  onMesChange, 
  onAnoChange,
  onTipoVisaoChange 
}: PeriodSelectorProps) {
  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ]

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
      <Calendar className="w-5 h-5 text-muted-foreground" />
      
      <div className="flex items-center gap-2">
        {/* Seletor de Tipo de Visão */}
        <Select value={tipoVisao} onValueChange={(v) => onTipoVisaoChange(v as 'mensal' | 'anual')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
          </SelectContent>
        </Select>

        {/* Seletor de Mês (só aparece se for visão mensal) */}
        {tipoVisao === 'mensal' && (
          <Select 
            value={mes?.toString() || ''} 
            onValueChange={(v) => onMesChange(parseInt(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Seletor de Ano (sempre aparece) */}
        <Select value={ano.toString()} onValueChange={(v) => onAnoChange(parseInt(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anos.map((a) => (
              <SelectItem key={a} value={a.toString()}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Indicador visual do período selecionado */}
      <div className="text-sm text-muted-foreground ml-2">
        {tipoVisao === 'mensal' && mes 
          ? `${meses.find(m => m.value === mes)?.label}/${ano}`
          : `Ano ${ano}`
        }
      </div>
    </div>
  )
}


