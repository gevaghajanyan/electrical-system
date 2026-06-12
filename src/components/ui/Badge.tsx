import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200',
  success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  outline: 'border border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-300',
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
