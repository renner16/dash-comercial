import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number // Percentual de variação
    isPositive: boolean
    label?: string // Ex: "vs mês anterior"
  }
}

export function KPICard({ title, value, subtitle, icon: Icon, trend }: KPICardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            trend.value === 0 
              ? 'text-muted-foreground' 
              : trend.isPositive 
                ? 'text-green-600 dark:text-green-500' 
                : 'text-red-600 dark:text-red-500'
          }`}>
            {trend.value === 0 ? (
              <Minus className="w-3 h-3" />
            ) : trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {trend.value === 0 ? 'Sem variação' : `${trend.isPositive ? '+' : ''}${trend.value.toFixed(1)}%`}
              {trend.label && ` ${trend.label}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


