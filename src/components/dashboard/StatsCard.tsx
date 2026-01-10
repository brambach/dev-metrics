import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  highlight?: boolean
  delay?: number
}

export function StatsCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend,
  highlight,
  delay,
}: StatsCardProps) {
  return (
    <div
      className={`
      animate-enter group bg-surface border border-border rounded-xl p-6
      hover:border-accent/30 smooth-transition subtle-shadow glow-shadow
      hover:scale-[1.02] cursor-default relative overflow-hidden
      ${highlight ? 'ring-1 ring-accent/20' : ''}
    `}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {highlight && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent opacity-[0.03] blur-3xl rounded-full pointer-events-none group-hover:opacity-[0.08] smooth-transition duration-700" />
      )}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-sm font-medium text-muted group-hover:text-zinc-300 transition-colors">
          {label}
        </span>
        <Icon className="w-[18px] h-[18px] text-zinc-600 group-hover:text-accent smooth-transition" strokeWidth={1.5} />
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="text-3xl font-medium text-white tracking-tight group-hover:tracking-normal transition-all duration-300">
          {value.toLocaleString()}
        </span>
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center text-xs text-muted relative z-10">
          <span
            className={`flex items-center gap-0.5 mr-2 px-1.5 py-0.5 rounded border
            ${trend === 'up' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : ''}
            ${trend === 'down' ? 'text-red-500 bg-red-500/10 border-red-500/20' : ''}
            ${trend === 'neutral' ? 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' : ''}
            ${trend === undefined && highlight ? 'text-accent bg-accent/10 border-accent/20' : ''}
          `}
          >
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '–'}
            {trend === undefined && highlight && '⚡'}
            {change > 0 && trend !== 'neutral' && !highlight ? change : ''}
            {highlight && !trend ? '' : change === 0 ? '0%' : change > 0 && !highlight ? '%' : ''}
            {highlight && !trend ? 'Active' : ''}
          </span>
          <span>{changeLabel}</span>
        </div>
      )}
    </div>
  )
}
