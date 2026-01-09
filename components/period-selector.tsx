'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'

interface PeriodSelectorProps {
  mes: number | null
  ano: number
  dia: string | null
  semana?: number | null
  tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total'
  onMesChange: (mes: number | null) => void
  onAnoChange: (ano: number) => void
  onDiaChange: (dia: string | null) => void
  onSemanaChange?: (semana: number | null) => void
  onTipoVisaoChange: (tipo: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total') => void
}

export function PeriodSelector({ 
  mes, 
  ano, 
  dia,
  semana,
  tipoVisao,
  onMesChange, 
  onAnoChange,
  onDiaChange,
  onSemanaChange,
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
        <Select value={tipoVisao} onValueChange={(v) => onTipoVisaoChange(v as 'diario' | 'semanal' | 'mensal' | 'anual' | 'total')}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diario">Diário</SelectItem>
            <SelectItem value="semanal">Semanal</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
            <SelectItem value="total">Total</SelectItem>
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

        {/* Seletor de Semana (só aparece se for visão semanal) */}
        {tipoVisao === 'semanal' && onSemanaChange && (
          <Select 
            value={semana?.toString() || '1'} 
            onValueChange={(v) => onSemanaChange(parseInt(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Semana" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Semana 1</SelectItem>
              <SelectItem value="2">Semana 2</SelectItem>
              <SelectItem value="3">Semana 3</SelectItem>
              <SelectItem value="4">Semana 4</SelectItem>
              <SelectItem value="5">Semana 5</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Seletor de Mês (aparece em mensal e semanal) */}
        {(tipoVisao === 'mensal' || tipoVisao === 'semanal') && (
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

        {/* Seletor de Ano (aparece em semanal, mensal e anual) */}
        {(tipoVisao === 'semanal' || tipoVisao === 'mensal' || tipoVisao === 'anual') && (
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
        {tipoVisao === 'total'
          ? 'Todos os períodos'
          : tipoVisao === 'diario' && dia
          ? formatarData(dia)
          : tipoVisao === 'semanal' && mes && semana
          ? `Semana ${semana} - ${meses.find(m => m.value === mes)?.label}/${ano}`
          : tipoVisao === 'mensal' && mes 
          ? `${meses.find(m => m.value === mes)?.label}/${ano}`
          : tipoVisao === 'anual'
          ? `Ano ${ano}`
          : 'Selecione um período'
        }
      </div>
    </div>
  )
}


