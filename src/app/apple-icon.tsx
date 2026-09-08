import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1b2740',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* DIN rail lines */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '32px 24px' }}>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.18)' }} />
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.14)' }} />
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.18)' }} />
        </div>
        {/* Yellow bolt (emoji fallback — ImageResponse can't render arbitrary SVG paths without OG fonts) */}
        <div
          style={{
            position: 'relative',
            fontSize: 128,
            fontWeight: 900,
            color: '#f2bc2e',
            lineHeight: 1,
            textShadow: '0 6px 20px rgba(0,0,0,0.4)',
          }}
        >
          ⚡
        </div>
      </div>
    ),
    { ...size }
  )
}
