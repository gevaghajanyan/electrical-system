'use client'

import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export function Select({ className = '', error, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={[
        'flex h-9 w-full appearance-none rounded-md border bg-white px-3 py-1 text-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-zinc-900 dark:text-zinc-100',
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-zinc-300 dark:border-zinc-600',
        className,
      ].join(' ')}
    >
      {children}
    </select>
  )
}
