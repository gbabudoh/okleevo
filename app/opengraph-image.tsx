import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Okleevo — All-in-One Virtual HQ & Business Operating Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#070b14',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.2) 0%, transparent 50%)',
          backgroundSize: '100px 100px, 100px 100px, 100% 100%, 100% 100%',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
        }}
      >
        {/* Header / Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)',
                fontSize: '28px',
                fontWeight: 900,
                color: '#ffffff',
              }}
            >
              O
            </div>
            <span
              style={{
                fontSize: '36px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Okleevo
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ● Virtual HQ & Operating System
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: 0,
              background: 'linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            The All-in-One Business Operating System for Modern SMEs
          </h1>
          <p
            style={{
              fontSize: '22px',
              color: '#94a3b8',
              lineHeight: 1.45,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Replace 10+ disjointed tools. Seamlessly run team messaging, HD video rooms, CRM pipelines, booking pages, and automated billing in one unified platform.
          </p>
        </div>

        {/* Feature Pills Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '30px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {[
              '💬 Team Messaging',
              '🎥 HD Video Rooms',
              '📊 CRM & Sales',
              '⚡ Smart Invoicing',
              '📅 Booking Pages',
            ].map((pill, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#e2e8f0',
                }}
              >
                {pill}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '18px',
              fontWeight: 800,
              color: '#f97316',
            }}
          >
            okleevo.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
