import React, { useEffect, useRef, useState } from 'react';

const ROUTE_1_COORDS: [number, number][] = [
  [28.6139, 77.2090], [28.5467, 77.3916], [28.4744, 77.5117],
  [28.3540, 77.5470], [28.2300, 77.5540], [28.1213, 77.5540],
  [27.9800, 77.5200], [27.8009, 77.4416], [27.6500, 77.5800],
  [27.5036, 77.6762], [27.3500, 77.8200], [27.1767, 78.0081],
];

const ROUTE_2_COORDS: [number, number][] = [
  [28.6139, 77.2090], [28.5100, 77.2700], [28.4089, 77.3178],
  [28.3000, 77.3100], [28.1446, 77.3263], [28.0200, 77.3500],
  [27.8800, 77.3800], [27.8009, 77.4416], [27.6500, 77.5800],
  [27.5036, 77.6762], [27.3500, 77.8200], [27.1767, 78.0081],
];

const TOLL_PLAZAS = [
  { id: 't1', position: [28.4590, 77.5100] as [number, number], name: 'Jewar Expressway Toll', carFee: 125, truckFee: 450 },
  { id: 't2', position: [28.1213, 77.5540] as [number, number], name: 'Greater Noida Toll (Entry)', carFee: 85, truckFee: 310 },
  { id: 't3', position: [27.8009, 77.4416] as [number, number], name: 'Kosi Kalan Toll', carFee: 115, truckFee: 415 },
  { id: 't4', position: [27.5036, 77.6762] as [number, number], name: 'Mathura Toll', carFee: 75, truckFee: 275 },
  { id: 't5', position: [28.3200, 77.3100] as [number, number], name: 'Faridabad Toll', carFee: 60, truckFee: 220 },
  { id: 't6', position: [28.1446, 77.3263] as [number, number], name: 'Palwal Toll', carFee: 80, truckFee: 295 },
];

const BLACK_SPOTS = [
  { id: 'b1', position: [28.3500, 77.3100] as [number, number], name: 'NH-19 Faridabad Stretch', severity: 'high', reason: 'High-speed collision zone — 34 fatalities in 2025. Night driving advisory.' },
  { id: 'b2', position: [28.1900, 77.5400] as [number, number], name: 'Yamuna Expressway Km 65', severity: 'high', reason: 'Dense fog zone Oct–Feb. Multiple pile-up history. Speed radar deployed.' },
  { id: 'b3', position: [27.7500, 77.5000] as [number, number], name: 'Hathras Bypass Junction', severity: 'medium', reason: 'Unprotected median crossing. Cattle on road advisory.' },
  { id: 'b4', position: [27.4200, 77.7300] as [number, number], name: 'Mathura-Agra Highway', severity: 'medium', reason: 'Potholes and poor lighting. Road widening in progress.' },
];

const FUEL_STATIONS = [
  { id: 'f1', position: [28.5200, 77.4100] as [number, number], brand: 'Indian Oil', name: 'IOC Noida Sector 62', petrol: 96.72, diesel: 89.62, cng: 82.50 },
  { id: 'f2', position: [28.3600, 77.5300] as [number, number], brand: 'HPCL', name: 'HP Petrol Pump — Yamuna Expy Km 28', petrol: 96.45, diesel: 89.37, cng: null },
  { id: 'f3', position: [28.1500, 77.5400] as [number, number], brand: 'BPCL', name: 'Bharat Petroleum — Jewar', petrol: 96.80, diesel: 89.70, cng: null },
  { id: 'f4', position: [27.9600, 77.4900] as [number, number], brand: 'Shell', name: 'Shell — Yamuna Expy Km 120', petrol: 97.10, diesel: 89.95, cng: null },
  { id: 'f5', position: [27.7800, 77.4200] as [number, number], brand: 'Indian Oil', name: 'IOC — Kosi Kalan', petrol: 95.82, diesel: 88.72, cng: 80.00 },
  { id: 'f6', position: [27.5200, 77.6900] as [number, number], brand: 'HPCL', name: 'HP — Mathura Bypass', petrol: 95.55, diesel: 88.45, cng: null },
  { id: 'f7', position: [27.2800, 77.9800] as [number, number], brand: 'Indian Oil', name: 'IOC — Agra Entrance', petrol: 95.60, diesel: 88.50, cng: 79.50 },
];

const BRAND_COLORS: Record<string, string> = {
  'Indian Oil': '#C00', 'HPCL': '#005DAA', 'BPCL': '#009933', 'Shell': '#DD1D21',
};

declare global {
  interface Window { L: typeof import('leaflet'); }
}

function RouteMap({ from, to }: { from: string; to: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (window.L) {
      initMap();
    } else if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      document.querySelector<HTMLScriptElement>('script[src*="leaflet"]')!.addEventListener('load', () => initMap());
    }

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initMap() {
    if (!mapRef.current || !window.L || mapInstanceRef.current) return;
    if ((mapRef.current as unknown as { _leaflet_id?: number })._leaflet_id) return;
    const L = window.L;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([27.9, 77.6], 9);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors', maxZoom: 18,
    }).addTo(map);

    const route1 = L.polyline(ROUTE_1_COORDS, { color: '#10B981', weight: 5, opacity: 0.9 }).addTo(map);
    route1.bindTooltip('Route 1: Yamuna Expressway — 165km · ~2h 30m · ₹435 toll', { sticky: true });

    const route2 = L.polyline(ROUTE_2_COORDS, { color: '#64748B', weight: 4, opacity: 0.6, dashArray: '8,6' }).addTo(map);
    route2.bindTooltip('Route 2: NH19 via Faridabad — 204km · ~3h 30m · ₹215 toll', { sticky: true });

    const startIcon = L.divIcon({ html: `<div style="background:#0A2342;color:white;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${from || 'Delhi'}</div>`, className: '', iconAnchor: [30, 20] });
    const endIcon   = L.divIcon({ html: `<div style="background:#F59E0B;color:#0A2342;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${to || 'Agra'}</div>`, className: '', iconAnchor: [25, 20] });
    L.marker([28.6139, 77.2090], { icon: startIcon }).addTo(map);
    L.marker([27.1767, 78.0081], { icon: endIcon }).addTo(map);

    TOLL_PLAZAS.forEach((t) => {
      const icon = L.divIcon({ html: `<div title="${t.name}" style="width:20px;height:20px;background:#7C3AED;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><span style="color:white;font-size:10px;font-weight:700">₹</span></div>`, className: '', iconAnchor: [10, 10] });
      L.marker(t.position, { icon }).addTo(map).bindPopup(`<b>${t.name}</b><br>Car: ₹${t.carFee} | Truck: ₹${t.truckFee}<br><span style="font-size:11px;color:#7C3AED">NETC FASTag accepted</span>`);
    });

    BLACK_SPOTS.forEach((b) => {
      const color = b.severity === 'high' ? '#DC2626' : '#D97706';
      const icon = L.divIcon({ html: `<div title="${b.name}" style="width:22px;height:22px;background:${color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.4)"><span style="color:white;font-size:12px;font-weight:900">!</span></div>`, className: '', iconAnchor: [11, 11] });
      L.marker(b.position, { icon }).addTo(map).bindPopup(`<b style="color:${color}">⚠ ${b.name}</b><br><span style="font-size:11px">${b.reason}</span>`);
    });

    FUEL_STATIONS.forEach((f) => {
      const brandColor = BRAND_COLORS[f.brand] || '#0A2342';
      const icon = L.divIcon({ html: `<div title="${f.name}" style="width:20px;height:20px;background:${brandColor};border:2px solid white;border-radius:4px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><span style="color:white;font-size:9px;font-weight:700">⛽</span></div>`, className: '', iconAnchor: [10, 10] });
      L.marker(f.position, { icon }).addTo(map).bindPopup(`<b>${f.name}</b><br><table style="font-size:12px;margin-top:4px;width:100%"><tr><td>Petrol</td><td style="text-align:right;font-weight:700">₹${f.petrol}/L</td></tr><tr><td>Diesel</td><td style="text-align:right;font-weight:700">₹${f.diesel}/L</td></tr>${f.cng ? `<tr><td>CNG</td><td style="text-align:right;font-weight:700">₹${f.cng}/kg</td></tr>` : ''}</table><span style="font-size:10px;color:#94A3B8">Prices as of 11 May 2026</span>`);
    });

    const LegendControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create('div');
        div.innerHTML = `<div style="background:white;padding:10px 14px;border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,0.15);font-family:sans-serif;font-size:11px;min-width:160px"><p style="font-weight:700;margin:0 0 6px;color:#0A2342">Road Types</p><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><div style="width:24px;height:4px;background:#10B981;border-radius:2px"></div><span>Expressway</span></div><div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><div style="width:24px;height:3px;background:#64748B;border-radius:2px;border:1px dashed #94A3B8"></div><span>National Highway</span></div><p style="font-weight:700;margin:6px 0;color:#0A2342">Markers</p><div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><div style="width:14px;height:14px;background:#7C3AED;border-radius:50%;border:1.5px solid white"></div><span>Toll Plaza</span></div><div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><div style="width:14px;height:14px;background:#DC2626;border-radius:50%;border:1.5px solid white"></div><span>Black Spot (High)</span></div><div style="display:flex;align-items:center;gap:6px"><div style="width:14px;height:14px;background:#C00;border-radius:3px;border:1.5px solid white"></div><span>Fuel Station</span></div></div>`;
        return div;
      },
    });
    new LegendControl({ position: 'bottomright' }).addTo(map);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div ref={mapRef} style={{ height: 480, width: '100%', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#059669', margin: 0 }}>Route 1 — Yamuna Expressway (Recommended)</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0A2342', margin: '4px 0 0' }}>165 km · ~2h 30m</p>
          <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>4 toll plazas · Car toll: ₹435 · Truck: ₹1,450</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>Access Controlled Expressway · Max speed 100km/h</p>
        </div>
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', margin: 0 }}>Route 2 — NH19 via Faridabad</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0A2342', margin: '4px 0 0' }}>204 km · ~3h 30m</p>
          <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>2 toll plazas · Car toll: ₹215 · Truck: ₹780</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>National Highway · High traffic · 2 black spots en route</p>
        </div>
      </div>
      <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12, padding: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#92400E', margin: 0 }}>
          ⚠ 2 high-risk black spots on Route 2. If travelling at night or during monsoon, Route 1 (Yamuna Expressway) is strongly recommended.
        </p>
      </div>
    </div>
  );
}

const CITIES = ['Delhi', 'Agra', 'Jaipur', 'Mumbai', 'Chennai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Ahmedabad', 'Pune', 'Lucknow', 'Chandigarh'];

export default function RoutePlanner() {
  const [from, setFrom] = useState('Delhi');
  const [to, setTo]     = useState('Agra');
  const [mapKey, setMapKey] = useState(0);

  function handleSearch() { setMapKey((k) => k + 1); }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2342', margin: 0 }}>Route Planner</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Multi-modal route optimisation with FASTag tolls, fuel stations and road risk data</p>
      </div>

      {/* Origin / Destination selector */}
      <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Origin</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC' }}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 20, color: '#94A3B8', paddingBottom: 8 }}>→</div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Destination</label>
          <select value={to} onChange={(e) => setTo(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, color: '#0F172A', outline: 'none', background: '#F8FAFC' }}>
            {CITIES.filter((c) => c !== from).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={handleSearch}
          style={{ padding: '10px 24px', borderRadius: 10, background: '#0A2342', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          Plan Route
        </button>
      </div>

      {/* Note for non-Delhi-Agra routes */}
      {(from !== 'Delhi' || to !== 'Agra') && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '10px 16px' }}>
          <p style={{ fontSize: 12, color: '#1D4ED8', margin: 0 }}>📍 Showing sample route data for Delhi → Agra corridor. Full multi-city routing with live NHAI data coming soon.</p>
        </div>
      )}

      {/* Map */}
      <RouteMap key={mapKey} from={from} to={to} />
    </div>
  );
}
