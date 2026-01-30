import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  iconColor?: string
  accentColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-500",
  accentColor = "from-blue-500 to-blue-600",
  trend,
  onClick
}: KPICardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Gradient accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1",
        "bg-gradient-to-r",
        accentColor
      )} />

      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground font-body">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground font-heading tracking-tight">
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-600" : "text-red-500"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </p>
            )}
          </div>
          <div className={cn(
            "p-2.5 rounded-lg bg-muted",
            iconColor
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
