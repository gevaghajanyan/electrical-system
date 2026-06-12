'use client'

import type { LabelHTMLAttributes } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ className = '', required, children, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={[
        'block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1',
        className,
      ].join(' ')}
    >
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}
