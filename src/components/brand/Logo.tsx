import type { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLSpanElement> {
  size?: number
  showWordmark?: boolean
  wordmark?: string
}

/**
 * Brand mark — a rounded navy badge with three DIN-rail lines and a yellow
 * lightning bolt slicing through them. The DIN lines nod to the product's
 * domain, the bolt to electricity, and the whole thing sits on a warm ink
 * background so the yellow really pops.
 *
 * Renders inline SVG so it scales crisply at any size (favicon → home hero).
 * Everything is deterministic — no <defs> id collisions when multiple copies
 * appear on the same page (NavBar + home + share cards).
 */
export function Logo({ size = 32, showWordmark = false, wordmark = 'Voltra', className = '', ...rest }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} {...rest}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rounded ink badge with soft edge highlight */}
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#1b2740" />
        <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" fill="none" stroke="rgba(255,255,255,0.06)" />

        {/* DIN rail striping — three horizontal lines */}
        <rect x="7"  y="11" width="34" height="2" rx="1" fill="rgba(255,255,255,0.18)" />
        <rect x="7"  y="23" width="34" height="2" rx="1" fill="rgba(255,255,255,0.14)" />
        <rect x="7"  y="35" width="34" height="2" rx="1" fill="rgba(255,255,255,0.18)" />

        {/* Lightning bolt (yellow) — main mark */}
        <path
          d="M27 6 L14 26 L22 26 L20 42 L34 22 L26 22 Z"
          fill="#f2bc2e"
          stroke="#c68812"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Bolt inner highlight for depth */}
        <path
          d="M27 8 L17 26 L22 26 L21 38 L32 24 L26 24 Z"
          fill="#f7cf50"
          opacity="0.65"
        />
      </svg>
      {showWordmark && (
        <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50" style={{ fontSize: size * 0.62 }}>
          {wordmark}
        </span>
      )}
    </span>
  )
}
