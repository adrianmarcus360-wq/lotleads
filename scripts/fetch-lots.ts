/**
 * Fetch real commercial parking lot locations from OpenStreetMap Overpass API.
 * No API key required. Outputs JSON for use in seed-leads.ts
 *
 * Usage: npx tsx scripts/fetch-lots.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const MARKETS = [
  {
    id: 'chicago_il',
    name: 'Chicago, IL',
    bbox: '41.65,-87.90,42.05,-87.50',
    city: 'Chicago',
    state: 'IL',
  },
  {
    id: 'dallas_tx',
    name: 'Dallas, TX',
    bbox: '32.60,-97.00,33.05,-96.55',
    city: 'Dallas',
    state: 'TX',
  },
  {
    id: 'phoenix_az',
    name: 'Phoenix, AZ',
    bbox: '33.25,-112.35,33.75,-111.85',
    city: 'Phoenix',
    state: 'AZ',
  },
];

// Overpass QL query: get commercial parking lots / retail / office areas
function buildOverpassQuery(bbox: string): string {
  return `
[out:json][timeout:30];
(
  way["amenity"="parking"]["parking"!="underground"]["access"!="private"](${bbox});
  way["landuse"="retail"](${bbox});
  way["landuse"="commercial"](${bbox});
  way["shop"]["parking"](${bbox});
  relation["amenity"="parking"]["parking"!="underground"](${bbox});
)->.lots;
.lots out center tags;
`;
}

async function fetchMarket(market: typeof MARKETS[0]) {
  console.log(`\nFetching ${market.name}...`);
  const query = buildOverpassQuery(market.bbox);

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as {
      elements: Array<{
        id: number;
        type: string;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
        bounds?: { minlat: number; maxlat: number; minlon: number; maxlon: number };
      }>;
    };

    const lots = data.elements
      .filter((el) => {
        const center = el.lat ? { lat: el.lat, lon: el.lon! } : el.center;
        return center && center.lat && center.lon;
      })
      .map((el) => {
        const center = el.lat ? { lat: el.lat, lon: el.lon! } : el.center!;
        const tags = el.tags ?? {};
        return {
          osm_id: el.id,
          lat: center.lat,
          lng: center.lon,
          market: market.id,
          city: tags['addr:city'] || market.city,
          state: tags['addr:state'] || market.state,
          zip: tags['addr:postcode'] || '',
          address: [
            tags['addr:housenumber'],
            tags['addr:street'],
          ].filter(Boolean).join(' ') || '',
          name: tags['name'] || tags['operator'] || '',
          surface: tags['surface'] || '',
          capacity: parseInt(tags['capacity'] || '0') || null,
          area_approx: el.bounds
            ? calculateArea(el.bounds)
            : null,
        };
      })
      .filter((lot) => lot.lat && lot.lng);

    console.log(`  Found ${lots.length} lots in ${market.name}`);
    return lots;
  } catch (err) {
    console.error(`  Error fetching ${market.name}:`, err);
    return [];
  }
}

function calculateArea(bounds: { minlat: number; maxlat: number; minlon: number; maxlon: number }): number {
  // Rough sq footage from lat/lng bounds
  const latMeters = (bounds.maxlat - bounds.minlat) * 111000;
  const lngMeters = (bounds.maxlon - bounds.minlon) * 111000 * Math.cos((bounds.minlat * Math.PI) / 180);
  const sqMeters = latMeters * lngMeters;
  return Math.round(sqMeters * 10.764); // sq feet
}

async function main() {
  const allLots: ReturnType<typeof Array<{ osm_id: number; lat: number; lng: number; market: string; city: string; state: string; zip: string; address: string; name: string; surface: string; capacity: number | null; area_approx: number | null }>>  = [];

  for (const market of MARKETS) {
    const lots = await fetchMarket(market);
    allLots.push(...lots);
    // Throttle between requests
    await new Promise((r) => setTimeout(r, 2000));
  }

  const outputPath = path.join(process.cwd(), 'data', 'raw-lots.json');
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(allLots, null, 2));

  console.log(`\n✅ Saved ${allLots.length} lots to ${outputPath}`);
  console.log(`\nBreakdown:`);
  for (const market of MARKETS) {
    const count = allLots.filter((l) => l.market === market.id).length;
    console.log(`  ${market.name}: ${count} lots`);
  }
}

main().catch(console.error);
