'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'

interface LanguageData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface LanguageBreakdownProps {
  data: LanguageData[]
}

export function LanguageBreakdown({ data }: LanguageBreakdownProps) {
  return (
    <div className="animate-enter delay-400 bg-surface border border-border rounded-xl p-8 h-[380px] flex flex-col subtle-shadow hover:border-zinc-700 smooth-transition">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-white">Languages</h3>
        <PieChartIcon className="w-4 h-4 text-zinc-600" strokeWidth={1.5} />
      </div>
      <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#141414',
                border: '1px solid #262626',
                borderRadius: '8px',
                color: '#fff',
              }}
              itemStyle={{ color: '#a1a1aa' }}
            />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconType="circle"
              iconSize={6}
              wrapperStyle={{
                fontSize: '12px',
                paddingLeft: '20px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
