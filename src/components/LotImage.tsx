'use client';

import { useState } from 'react';

interface LotImageProps {
  lat: number;
  lng: number;
  /** Zoom 19 = ~50m across, just asphalt. 18 = ~100m. Use 19 for teasers, 18 for unlocked detail. */
  zoom?: number;
  className?: string;
}

/**
 * Satellite aerial image of the parking lot surface via Google Maps Static API (server-proxied).
 * At zoom 19 the image shows ~50m — pavement cracks, oxidation, fading are visible but
 * no street names or landmarks appear, making the location unidentifiable without purchasing.
 *
 * Falls back to an asphalt-texture CSS pattern when the Maps API key is not yet active.
 */
export default function LotImage({ lat, lng, zoom = 19, className = '' }: LotImageProps) {
  const [failed, setFailed] = useState(false);

  const src = `/api/lot-image?lat=${lat}&lng=${lng}&zoom=${zoom}&w=640&h=400`;

  if (failed) {
    return <AsphaltFallback className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Aerial parking lot surface"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
      onError={() => setFailed(true)}
    />
  );
}

/**
 * CSS-only fallback that renders a convincing dark asphalt texture with hairline cracks.
 * Used when Google Maps billing is not yet enabled.
 */
function AsphaltFallback({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: `
          repeating-linear-gradient(
            73deg,
            transparent,
            transparent 60px,
            rgba(255,255,255,0.015) 60px,
            rgba(255,255,255,0.015) 61px
          ),
          repeating-linear-gradient(
            -21deg,
            transparent,
            transparent 90px,
            rgba(255,255,255,0.012) 90px,
            rgba(255,255,255,0.012) 91px
          ),
          repeating-linear-gradient(
            140deg,
            transparent,
            transparent 120px,
            rgba(255,255,255,0.008) 120px,
            rgba(255,255,255,0.008) 121px
          ),
          radial-gradient(ellipse at 30% 40%, rgba(30,22,10,0.6) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 70%, rgba(20,15,5,0.4) 0%, transparent 50%),
          linear-gradient(180deg, #1a1a14 0%, #141410 40%, #1c1c16 100%)
        `,
      }}
    />
  );
}
