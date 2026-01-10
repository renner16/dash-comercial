'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import DatePicker, { registerLocale } from 'react-datepicker'
import { cn } from '@/lib/utils'

// Registrar locale português
registerLocale('pt-BR', ptBR)

interface PeriodSelectorProps {
  mes: number | null
  ano: number
  dia: string | null
  semana?: number | null
  tipoVisao: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado'
  dataInicio?: string | null
  dataFim?: string | null
  onMesChange: (mes: number | null) => void
  onAnoChange: (ano: number) => void
  onDiaChange: (dia: string | null) => void
  onSemanaChange?: (semana: number | null) => void
  onTipoVisaoChange: (tipo: 'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado') => void
  onDataInicioChange?: (data: string | null) => void
  onDataFimChange?: (data: string | null) => void
}

export function PeriodSelector({ 
  mes, 
  ano, 
  dia,
  semana,
  tipoVisao,
  dataInicio,
  dataFim,
  onMesChange, 
  onAnoChange,
  onDiaChange,
  onSemanaChange,
  onTipoVisaoChange,
  onDataInicioChange,
  onDataFimChange
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

  // Calcular as semanas do mês dinamicamente (domingo a sábado)
  const calcularSemanasDoMes = () => {
    if (!mes || !ano) return []
    
    const primeiroDia = new Date(ano, mes - 1, 1)
    const ultimoDia = new Date(ano, mes, 0)
    const diasNoMes = ultimoDia.getDate()
    
    const semanas: Array<{ numero: number; inicio: number; fim: number }> = []
    let semanaAtual = 1
    let diaInicio = 1
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes - 1, dia)
      const diaDaSemana = data.getDay() // 0=domingo, 6=sábado
      
      // Se é sábado ou último dia do mês, fecha a semana
      if (diaDaSemana === 6 || dia === diasNoMes) {
        semanas.push({
          numero: semanaAtual,
          inicio: diaInicio,
          fim: dia
        })
        semanaAtual++
        diaInicio = dia + 1
      }
    }
    
    return semanas
  }

  const semanasDoMes = calcularSemanasDoMes()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-card p-4 rounded-lg border">
      <CalendarIcon className="w-5 h-5 text-muted-foreground hidden sm:block" />
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Seletor de Tipo de Visão */}
        <Select value={tipoVisao} onValueChange={(v) => onTipoVisaoChange(v as 'diario' | 'semanal' | 'mensal' | 'anual' | 'total' | 'personalizado')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diario">Diário</SelectItem>
            <SelectItem value="semanal">Semanal</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
            <SelectItem value="total">Total</SelectItem>
            <SelectItem value="personalizado">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        {/* Seletor de Data com Calendário (só aparece se for visão diária) */}
        {tipoVisao === 'diario' && (
          <div className="relative">
            <DatePicker
              selected={dia ? new Date(dia + 'T00:00:00') : null}
              onChange={(date: Date | null) => {
                if (date) {
                  const year = date.getFullYear()
                  const month = String(date.getMonth() + 1).padStart(2, '0')
                  const day = String(date.getDate()).padStart(2, '0')
                  onDiaChange(`${year}-${month}-${day}`)
                }
              }}
              locale="pt-BR"
              dateFormat="dd/MM/yyyy"
              className={cn(
                "flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              placeholderText="Selecione uma data"
              showPopperArrow={false}
              calendarClassName="shadow-lg rounded-lg"
            />
          </div>
        )}

        {/* Seletor de Semana com Calendário (só aparece se for visão semanal) */}
        {tipoVisao === 'semanal' && onSemanaChange && mes && ano && (
          <div className="relative">
            <DatePicker
              selected={
                semana && mes && ano
                  ? (() => {
                      // Encontrar o primeiro dia da semana selecionada
                      const primeiraData = new Date(ano, mes - 1, 1)
                      let diaAtual = 1
                      let semanaAtual = 1
                      
                      while (semanaAtual < semana && diaAtual <= new Date(ano, mes, 0).getDate()) {
                        const data = new Date(ano, mes - 1, diaAtual)
                        if (data.getDay() === 6) { // Sábado = fim da semana
                          semanaAtual++
                        }
                        diaAtual++
                      }
                      
                      return new Date(ano, mes - 1, diaAtual)
                    })()
                  : null
              }
              onChange={(date: Date | null) => {
                if (date && onSemanaChange) {
                  // Calcular qual semana do mês foi clicada
                  const primeiroDiaMes = new Date(ano, mes - 1, 1)
                  const diaDaSemanaInicio = primeiroDiaMes.getDay()
                  const diaClicado = date.getDate()
                  
                  const diasAteSegundaSemana = 7 - diaDaSemanaInicio
                  
                  let numeroSemana = 1
                  if (diaClicado > diasAteSegundaSemana) {
                    const diasAposSegundaSemana = diaClicado - diasAteSegundaSemana
                    numeroSemana = 2 + Math.floor((diasAposSegundaSemana - 1) / 7)
                  }
                  
                  onSemanaChange(numeroSemana)
                }
              }}
              locale="pt-BR"
              dateFormat="'Semana' w 'de' MMMM yyyy"
              showWeekNumbers
              openToDate={mes && ano ? new Date(ano, mes - 1, 1) : new Date()}
              onMonthChange={(date: Date | null) => {
                // Atualizar mês e ano quando o usuário navega no calendário
                if (date && onMesChange && onAnoChange) {
                  onMesChange(date.getMonth() + 1)
                  onAnoChange(date.getFullYear())
                }
              }}
              className={cn(
                "flex h-10 w-[180px] sm:w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "cursor-pointer"
              )}
              placeholderText="Clique para selecionar uma semana"
              calendarClassName="week-picker"
              showMonthYearPicker={false}
            />
          </div>
        )}

        {/* Seletor de Mês (aparece apenas em mensal) - Grade de meses */}
        {tipoVisao === 'mensal' && (
          <div className="relative">
            <DatePicker
              selected={mes && ano ? new Date(ano, mes - 1, 15) : null}
              onChange={(date: Date | null) => {
                if (date && onMesChange && onAnoChange) {
                  onMesChange(date.getMonth() + 1)
                  onAnoChange(date.getFullYear())
                }
              }}
              locale="pt-BR"
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              className={cn(
                "flex h-10 w-[180px] sm:w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "cursor-pointer"
              )}
              placeholderText="Clique para selecionar o mês"
              openToDate={mes && ano ? new Date(ano, mes - 1, 1) : new Date()}
            />
          </div>
        )}

        {/* Seletor de Ano (aparece apenas em anual) */}
        {tipoVisao === 'anual' && (
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

        {/* Seletor de Período Personalizado (data início e fim) */}
        {tipoVisao === 'personalizado' && (
          <>
            <div className="relative">
              <DatePicker
                selected={dataInicio ? new Date(dataInicio + 'T00:00:00') : null}
                onChange={(date: Date | null) => {
                  if (date && onDataInicioChange) {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    onDataInicioChange(`${year}-${month}-${day}`)
                  }
                }}
                locale="pt-BR"
                dateFormat="dd/MM/yyyy"
                className={cn(
                  "flex h-10 w-[140px] sm:w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  "cursor-pointer"
                )}
                placeholderText="Data início"
              />
            </div>
            <span className="text-muted-foreground hidden sm:inline">até</span>
            <div className="relative">
              <DatePicker
                selected={dataFim ? new Date(dataFim + 'T00:00:00') : null}
                onChange={(date: Date | null) => {
                  if (date && onDataFimChange) {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    onDataFimChange(`${year}-${month}-${day}`)
                  }
                }}
                locale="pt-BR"
                dateFormat="dd/MM/yyyy"
                minDate={dataInicio ? new Date(dataInicio + 'T00:00:00') : undefined}
                className={cn(
                  "flex h-10 w-[140px] sm:w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  "cursor-pointer"
                )}
                placeholderText="Data fim"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}


