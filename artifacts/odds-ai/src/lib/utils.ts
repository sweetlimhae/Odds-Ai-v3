import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CircleCheck, AlertTriangle, ShieldAlert, Activity } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskDetails(risk: string) {
  switch(risk) {
    case 'low': return { label: '안전', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20', indicatorClass: 'bg-emerald-500', icon: CircleCheck };
    case 'medium': return { label: '주의', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20', indicatorClass: 'bg-amber-500', icon: AlertTriangle };
    case 'high': return { label: '위험', colorClass: 'text-red-500', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/20', indicatorClass: 'bg-red-500', icon: ShieldAlert };
    default: return { label: '-', colorClass: 'text-muted-foreground', bgClass: 'bg-muted', borderClass: 'border-border', indicatorClass: 'bg-primary', icon: Activity };
  }
}