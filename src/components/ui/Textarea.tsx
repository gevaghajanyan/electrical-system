'use client'

import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({ className = '', error, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={[
        'flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
        'placeholder:text-zinc-400 resize-none',
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
