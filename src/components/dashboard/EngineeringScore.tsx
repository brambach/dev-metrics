'use client'

import { useEffect, useRef } from 'react'

interface EngineeringScoreProps {
  score: number
  breakdown: {
    consistency: number
    volume: number
    impact: number
    recency: number
  }
}

export function EngineeringScore({ score, breakdown }: EngineeringScoreProps) {
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (circleRef.current) {
      const circumference = 753.98 // 2 * PI * 120
      const offset = circumference - (score / 100) * circumference
      circleRef.current.style.strokeDashoffset = String(offset)
    }
  }, [score])

  return (
    <div className="animate-enter delay-300 bg-surface border border-border rounded-xl p-10 flex flex-col items-center justify-center relative overflow-hidden subtle-shadow group hover:border-zinc-700 smooth-transition">
      <div className="relative w-[280px] h-[280px] flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 300 300"
          role="img"
          aria-label={`Engineering score: ${score} out of 100`}
        >
          <circle cx="150" cy="150" r="120" fill="none" stroke="#262626" strokeWidth="8" />
          <circle
            ref={circleRef}
            className="progress-ring-circle"
            cx="150"
            cy="150"
            r="120"
            fill="none"
            stroke="#FFED4E"
            strokeWidth="8"
            strokeDasharray="753.98"
            strokeDashoffset="753.98"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="text-6xl font-semibold text-white tracking-tighter mb-2 opacity-0"
            style={{ animation: 'fadeInUp 0.5s 0.5s forwards' }}
          >
            {score}
          </span>
          <span
            className="text-xs font-medium text-zinc-500 uppercase tracking-widest opacity-0"
            style={{ animation: 'fadeInUp 0.5s 0.6s forwards' }}
          >
            Score
          </span>
        </div>
      </div>
      <div
        className="w-full max-w-3xl mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-border opacity-0"
        style={{ animation: 'fadeInUp 0.5s 0.8s forwards' }}
      >
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-1.5 hover:scale-105 smooth-transition cursor-default">
            <span className="text-base font-medium text-white tracking-tight">{value}%</span>
            <span className="text-xs text-zinc-500 font-medium capitalize">{key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
