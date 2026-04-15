import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function getConditionLabel(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score >= 8) return { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100' };
  if (score >= 6) return { label: 'High Priority', color: 'text-orange-700', bg: 'bg-orange-100' };
  if (score >= 4) return { label: 'Moderate', color: 'text-yellow-700', bg: 'bg-yellow-100' };
  return { label: 'Low Priority', color: 'text-green-700', bg: 'bg-green-100' };
}

export function getAerialImageUrl(lat: number, lng: number, zoom = 19, width = 600, height = 400): string {
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${googleKey}`;
  }

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (mapboxToken) {
    return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${zoom}/${width}x${height}?access_token=${mapboxToken}`;
  }

  // OpenStreetMap fallback (no key needed)
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const MARKETS = [
  { id: 'chicago_il', label: 'Chicago, IL', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { id: 'dallas_tx', label: 'Dallas, TX', state: 'TX', lat: 32.7767, lng: -96.797 },
  { id: 'phoenix_az', label: 'Phoenix, AZ', state: 'AZ', lat: 33.4484, lng: -112.074 },
] as const;
