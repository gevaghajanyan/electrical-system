'use client'

import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ className = '', error, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={[
        'flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm transition-colors',
        'placeholder:text-zinc-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500',
        error
          ? 'border-red-500 focus:ring-red-500'
          : 'border-zinc-300 dark:border-zinc-600',
        className,
      ].join(' ')}
    />
  )
}
