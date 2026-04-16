import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for Google Maps Static API satellite images.
 * Keeps the API key server-only; returns raw image bytes to the client.
 * Cached 24 hours at the CDN / Next.js data cache layer.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat  = searchParams.get('lat');
  const lng  = searchParams.get('lng');
  const zoom = searchParams.get('zoom') ?? '19';
  const w    = searchParams.get('w')    ?? '640';
  const h    = searchParams.get('h')    ?? '400';

  if (!lat || !lng) {
    return new NextResponse(null, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // Return a 204 so the client can show its CSS fallback
    return new NextResponse(null, { status: 204 });
  }

  const mapsUrl =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=${zoom}` +
    `&size=${w}x${h}` +
    `&scale=2` +
    `&maptype=satellite` +
    `&key=${apiKey}`;

  try {
    const upstream = await fetch(mapsUrl, {
      next: { revalidate: 86400 }, // cache 24 h
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
