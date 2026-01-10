'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart2 } from 'lucide-react'

interface ContributionChartProps {
  data: { date: string; count: number }[]
}

export function ContributionChart({ data }: ContributionChartProps) {
  return (
    <div className="animate-enter delay-400 bg-surface border border-border rounded-xl p-8 h-[380px] flex flex-col subtle-shadow hover:border-zinc-700 smooth-transition">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-white">30-Day Activity</h3>
        <BarChart2 className="w-4 h-4 text-zinc-600" strokeWidth={1.5} />
      </div>
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="date" hide />
            <YAxis
              stroke="#262626"
              tick={{ fill: '#71717a', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#141414',
                border: '1px solid #262626',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#a1a1aa' }}
              cursor={{ fill: 'rgba(255, 237, 78, 0.05)' }}
            />
            <Bar dataKey="count" fill="#FFED4E" radius={[2, 2, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
