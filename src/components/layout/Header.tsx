'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart2, Search } from 'lucide-react'

export function Header() {
  const [username, setUsername] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUsername = username.trim()

    // Validate username: must be non-empty and contain only valid GitHub username characters
    if (!trimmedUsername) {
      return // Don't navigate if empty
    }

    // GitHub usernames can only contain alphanumeric characters and hyphens
    // and cannot begin or end with a hyphen
    const isValidUsername = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(trimmedUsername)

    if (isValidUsername) {
      router.push(`/${trimmedUsername}`)
      setUsername('') // Clear input after successful navigation
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center text-accent subtle-shadow">
            <BarChart2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </div>
          <span className="text-white font-medium tracking-tight text-base">DevMetrics</span>
        </div>

        {/* Search */}
        <div className="hidden sm:block">
          <form onSubmit={handleSubmit} className="relative group" role="search">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-600 group-focus-within:text-accent transition-colors duration-300" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Search username..."
              aria-label="Search GitHub username"
              className="block w-72 pl-10 pr-14 py-1.5 border border-border rounded-lg leading-5 bg-surface text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm smooth-transition subtle-shadow hover:border-zinc-700"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <kbd className="inline-flex items-center border border-border rounded px-2 text-[10px] font-sans font-medium text-zinc-500 bg-background" aria-label="Keyboard shortcut Command K">
                ⌘K
              </kbd>
            </div>
          </form>
        </div>

        {/* Mobile Menu Icon */}
        <button className="sm:hidden text-zinc-400 hover:text-white smooth-transition" aria-label="Open search">
          <Search className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
