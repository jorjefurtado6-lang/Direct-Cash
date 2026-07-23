// High quality SVG Vector Logo for Direct Cash PIX
const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
  <defs>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00FF85" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <g transform="translate(10, 10)">
    <rect x="0" y="0" width="60" height="60" rx="16" fill="#0d1527" stroke="url(#emeraldGrad)" stroke-width="2" />
    <path d="M30 12 L46 28 L30 44 L14 28 Z" fill="rgba(0, 255, 133, 0.08)" stroke="url(#emeraldGrad)" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M24 23 L31 28 L24 33" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M36 33 L29 28 L36 23" fill="none" stroke="url(#emeraldGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="30" cy="28" r="3.5" fill="#00FF85" filter="url(#glow)" />
  </g>

  <text x="82" y="37" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="21" fill="#FFFFFF" letter-spacing="0.5">
    DIRECT <tspan fill="url(#emeraldGrad)">CASH</tspan>
  </text>

  <g transform="translate(82, 45)">
    <rect x="0" y="0" width="92" height="20" rx="6" fill="rgba(0, 255, 133, 0.15)" stroke="rgba(0, 255, 133, 0.4)" stroke-width="1" />
    <text x="46" y="14" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="10.5" fill="#00FF85" text-anchor="middle" letter-spacing="1">
      PIX 100% P2P
    </text>
  </g>
</svg>`;

export const LOGO_IMAGE_URL = `data:image/svg+xml;utf8,${encodeURIComponent(svgLogo)}`;

