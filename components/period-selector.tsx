'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import DatePicker, { registerLocale } from 'react-datepicker'
import { cn } from '@/lib/utils'

// Registrar locale português
registerLocale('pt-BR', ptBR)

// Helper: Calcular início e fim da semana comercial (Quarta → Terça) para uma data qualquer
function calcularSemanaComercial(date: Date | null): { inicio: Date; fim: Date } {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    // Se a data for inválida, usar data atual
    const hoje = new Date()
    date = hoje
  }
  
  const diaDaSemana = date.getDay() // 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
  
  // Calcular quantos dias retroceder para chegar na quarta-feira
  let diasRetroceder = 0
  if (diaDaSemana === 0) { // Domingo: retroceder 4 dias
    diasRetroceder = 4
  } else if (diaDaSemana === 1) { // Segunda: retroceder 5 dias
    diasRetroceder = 5
  } else if (diaDaSemana === 2) { // Terça: retroceder 6 dias
    diasRetroceder = 6
  } else if (diaDaSemana === 3) { // Quarta: já é o início
    diasRetroceder = 0
  } else { // Quinta, Sexta, Sábado: retroceder 1, 2 ou 3 dias
    diasRetroceder = diaDaSemana - 3
  }
  
  const inicio = new Date(date)
  inicio.setDate(date.getDate() - diasRetroceder)
  inicio.setHours(0, 0, 0, 0)
  
  const fim = new Date(inicio)
  fim.setDate(inicio.getDate() + 6) // Terça-feira (6 dias após quarta)
  fim.setHours(23, 59, 59, 999)
  
  return { inicio, fim }
}

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

  // Calcular as semanas do mês dinamicamente (quarta a terça - semana comercial)
  const calcularSemanasDoMes = () => {
    if (!mes || !ano) return []
    
    const primeiroDiaMes = new Date(ano, mes - 1, 1)
    const diasNoMes = new Date(ano, mes, 0).getDate()
    
    const semanas: Array<{ numero: number; inicio: number; fim: number }> = []
    
    // Encontrar a primeira quarta-feira do mês
    let primeiraQuarta = 1
    for (let dia = 1; dia <= 7; dia++) {
      const data = new Date(ano, mes - 1, dia)
      if (data.getDay() === 3) { // Quarta-feira
        primeiraQuarta = dia
        break
      }
    }
    
    // Semana 1: começa no dia 1 (pode ser parcial se mês não começa na quarta)
    let semanaAtual = 1
    let diaInicio = 1
    
    // Se mês não começa na quarta, a primeira semana vai até a terça anterior à primeira quarta
    if (primeiraQuarta > 1) {
      // Primeira semana parcial: dia 1 até a terça antes da primeira quarta
      const tercaAntesPrimeiraQuarta = primeiraQuarta - 1
      semanas.push({
        numero: semanaAtual,
        inicio: 1,
        fim: tercaAntesPrimeiraQuarta
      })
      semanaAtual++
      diaInicio = primeiraQuarta
    }
    
    // Processar semanas completas (quarta → terça)
    while (diaInicio <= diasNoMes) {
      // Encontrar o fim da semana (terça-feira, 7 dias após o início)
      let diaFim = diaInicio + 6
      
      // Ajustar se ultrapassar o mês
      if (diaFim > diasNoMes) {
        diaFim = diasNoMes
      } else {
        // Verificar se realmente termina numa terça-feira
        const dataFim = new Date(ano, mes - 1, diaFim)
        if (dataFim.getDay() !== 2) {
          // Ajustar para a terça-feira mais próxima
          const diff = (2 - dataFim.getDay() + 7) % 7
          diaFim = Math.min(diaFim + diff, diasNoMes)
        }
      }
      
      semanas.push({
        numero: semanaAtual,
        inicio: diaInicio,
        fim: diaFim
      })
      
      semanaAtual++
      diaInicio = diaFim + 1
      
      // Ajustar para a próxima quarta-feira
      if (diaInicio <= diasNoMes) {
        for (let d = diaInicio; d <= Math.min(diaInicio + 6, diasNoMes); d++) {
          const data = new Date(ano, mes - 1, d)
          if (data.getDay() === 3) { // Quarta-feira
            diaInicio = d
            break
          }
        }
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
                      try {
                        let primeiraQuarta = 1
                        for (let dia = 1; dia <= 7; dia++) {
                          const data = new Date(ano, mes - 1, dia)
                          if (data.getDay() === 3) {
                            primeiraQuarta = dia
                            break
                          }
                        }
                        let diaInicio = primeiraQuarta
                        if (semana > 1) {
                          diaInicio = primeiraQuarta + (semana - 1) * 7
                        }
                        const primeiroDiaMes = new Date(ano, mes - 1, 1)
                        if (semana === 1 && primeiroDiaMes.getDay() !== 3) {
                          diaInicio = 1
                        }
                        const diasNoMes = new Date(ano, mes, 0).getDate()
                        if (diaInicio > diasNoMes) diaInicio = diasNoMes
                        return new Date(ano, mes - 1, diaInicio)
                      } catch {
                        return new Date(ano, mes - 1, 1)
                      }
                    })()
                  : null
              }
              onChange={(date: Date | null) => {
                if (!date || !onSemanaChange || !mes || !ano) return
                try {
                  const { inicio } = calcularSemanaComercial(date)
                  if (!inicio) return
                  
                  const primeiroDiaMes = new Date(ano, mes - 1, 1)
                  const diaInicioSemana = inicio.getDate()
                  
                  let primeiraQuarta = 1
                  for (let dia = 1; dia <= 7; dia++) {
                    const data = new Date(ano, mes - 1, dia)
                    if (data.getDay() === 3) {
                      primeiraQuarta = dia
                      break
                    }
                  }
                  
                  let numeroSemana = 1
                  if (primeiroDiaMes.getDay() === 3) {
                    numeroSemana = diaInicioSemana <= primeiraQuarta ? 1 : 2 + Math.floor((diaInicioSemana - primeiraQuarta) / 7)
                  } else {
                    numeroSemana = diaInicioSemana < primeiraQuarta ? 1 : 2 + Math.floor((diaInicioSemana - primeiraQuarta) / 7)
                  }
                  
                  onSemanaChange(numeroSemana)
                } catch (error) {
                  console.error('Erro ao calcular semana:', error)
                }
              }}
              locale="pt-BR"
              dateFormat="dd/MM/yyyy"
              openToDate={mes && ano ? new Date(ano, mes - 1, 1) : new Date()}
              onMonthChange={(date: Date | null) => {
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


