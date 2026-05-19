import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CODRATEC — Software House';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '8px',
              height: '52px',
              background: '#6366f1',
              borderRadius: '4px',
              marginRight: '20px',
            }}
          />
          <span
            style={{
              fontSize: '60px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-2px',
            }}
          >
            CODRATEC
          </span>
        </div>
        <p
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            margin: 0,
            maxWidth: '720px',
            lineHeight: 1.4,
          }}
        >
          Sistemas e automações que reduzem trabalho manual e aumentam escala.
        </p>
        <div style={{ display: 'flex', marginTop: '48px', gap: '16px' }}>
          <span
            style={{
              fontSize: '16px',
              color: '#a5b4fc',
              background: '#1e293b',
              padding: '8px 20px',
              borderRadius: '6px',
              border: '1px solid #334155',
            }}
          >
            Software House
          </span>
          <span
            style={{
              fontSize: '16px',
              color: '#64748b',
              background: '#1e293b',
              padding: '8px 20px',
              borderRadius: '6px',
              border: '1px solid #334155',
            }}
          >
            codratec.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
