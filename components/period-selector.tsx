'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'

interface PeriodSelectorProps {
  mes: number | null
  ano: number
  dia: string | null
  tipoVisao: 'diario' | 'mensal' | 'anual'
  onMesChange: (mes: number | null) => void
  onAnoChange: (ano: number) => void
  onDiaChange: (dia: string | null) => void
  onTipoVisaoChange: (tipo: 'diario' | 'mensal' | 'anual') => void
}

export function PeriodSelector({ 
  mes, 
  ano, 
  dia,
  tipoVisao,
  onMesChange, 
  onAnoChange,
  onDiaChange,
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

  const formatarData = (dataStr: string) => {
    const d = new Date(dataStr + 'T00:00:00')
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
      <Calendar className="w-5 h-5 text-muted-foreground" />
      
      <div className="flex items-center gap-2">
        {/* Seletor de Tipo de Visão */}
        <Select value={tipoVisao} onValueChange={(v) => onTipoVisaoChange(v as 'diario' | 'mensal' | 'anual')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diario">Diário</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
          </SelectContent>
        </Select>

        {/* Seletor de Data (só aparece se for visão diária) */}
        {tipoVisao === 'diario' && (
          <Input
            type="date"
            value={dia || ''}
            onChange={(e) => onDiaChange(e.target.value)}
            className="w-[160px]"
          />
        )}

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

        {/* Seletor de Ano (aparece em mensal e anual) */}
        {tipoVisao !== 'diario' && (
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
        )}
      </div>

      {/* Indicador visual do período selecionado */}
      <div className="text-sm text-muted-foreground ml-2">
        {tipoVisao === 'diario' && dia
          ? formatarData(dia)
          : tipoVisao === 'mensal' && mes 
          ? `${meses.find(m => m.value === mes)?.label}/${ano}`
          : `Ano ${ano}`
        }
      </div>
    </div>
  )
}


