'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    console.log('Switching from', theme, 'to', newTheme)
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <Button 
        variant="outline" 
        size="lg"
        className="shadow-sm border-gray-300"
      >
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={toggleTheme}
      className="shadow-sm hover:shadow-md transition-all duration-300 border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 relative overflow-hidden group dark:bg-slate-800 dark:text-slate-200"
    >
      <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5 transition-all duration-300 rotate-0 group-hover:rotate-180 text-gray-700 dark:text-emerald-400 relative z-10" />
      ) : (
        <Moon className="h-5 w-5 transition-all duration-300 rotate-0 group-hover:-rotate-12 text-gray-700 dark:text-emerald-400 relative z-10" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
