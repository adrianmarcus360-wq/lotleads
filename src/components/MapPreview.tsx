'use client';

import { useEffect, useRef } from 'react';

interface MapPreviewProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
}

/** Convert lat/lng to OSM tile x/y at a given zoom level */
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n,
  );
  return { x, y };
}

/** Pick from a/b/c subdomains for OSM tile CDN */
function osmTileUrl(x: number, y: number, z: number) {
  const sub = ['a', 'b', 'c'][(x + y) % 3];
  return `https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

/**
 * Client component that composites OSM tiles into a canvas map preview.
 * No API key required — uses free OSM tile CDN already whitelisted in next.config.js.
 */
export default function MapPreview({ lat, lng, zoom = 16, className = '' }: MapPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const TILE = 256;
    const COLS = 3;
    const ROWS = 3;

    canvas.width  = TILE * COLS;
    canvas.height = TILE * ROWS;

    const center = latLngToTile(lat, lng, zoom);

    // Exact pixel offset of center coordinate within center tile
    const n = Math.pow(2, zoom);
    const centerTileX = ((lng + 180) / 360) * n;
    const centerTileY =
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n;
    const pixOffX = (centerTileX - center.x) * TILE;
    const pixOffY = (centerTileY - center.y) * TILE;

    const startX = center.x - 1;
    const startY = center.y - 1;

    const canvasCenterX = canvas.width  / 2;
    const canvasCenterY = canvas.height / 2;
    const drawOriginX   = canvasCenterX - pixOffX - TILE;
    const drawOriginY   = canvasCenterY - pixOffY - TILE;

    let loaded = 0;
    const total = COLS * ROWS;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tx = startX + col;
        const ty = startY + row;
        const url = osmTileUrl(tx, ty, zoom);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, drawOriginX + col * TILE, drawOriginY + row * TILE, TILE, TILE);
          loaded++;
          if (loaded === total) {
            ctx.fillStyle = 'rgba(0, 8, 20, 0.35)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        };
        img.onerror = () => {
          ctx.fillStyle = '#0a1525';
          ctx.fillRect(drawOriginX + col * TILE, drawOriginY + row * TILE, TILE, TILE);
          ctx.strokeStyle = '#1a2535';
          ctx.lineWidth = 1;
          ctx.strokeRect(drawOriginX + col * TILE, drawOriginY + row * TILE, TILE, TILE);
          loaded++;
        };
        img.src = url;
      }
    }
  }, [lat, lng, zoom]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
