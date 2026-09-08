import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1b2740',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 7,
          color: '#f2bc2e',
          fontSize: 22,
          fontWeight: 900,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        ⚡
      </div>
    ),
    { ...size }
  )
}
