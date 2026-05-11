/**
 * Route Planner — Enterprise Module
 *
 * Port the Leaflet map from:
 *   Next.js source: components/map/RouteMap.tsx
 *   Next.js page:   app/dashboard/fastag/page.tsx (RoutePlannerSection)
 *
 * The RouteMap component loads Leaflet via CDN script injection in useEffect —
 * this pattern works identically in CRA. No next/dynamic needed; just import directly.
 *
 * TODO for tech team:
 *   1. Copy RouteMap.tsx from Next.js components/map/ into this module or shared/components/
 *   2. Import and render it here with from/to props
 *   3. Add the city autocomplete input from the Next.js fastag page
 */

import React from 'react';

export default function RoutePlanner() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', marginBottom: 8 }}>Route Planner</h1>
      <p style={{ color: '#64748B', fontSize: 14, maxWidth: 480, margin: '0 auto 24px' }}>
        Port the Leaflet map component from <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>components/map/RouteMap.tsx</code>.
        Works in CRA without modification — remove the <code>dynamic()</code> wrapper, import directly.
      </p>
    </div>
  );
}
