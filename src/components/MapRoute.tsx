import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, MessageSquare, CheckCircle2, Circle, ChevronLeft } from 'lucide-react';
import { RequestOrder } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MapRouteProps {
  order: RequestOrder;
  onDeliveryComplete: () => void;
}

// ─── OSRM Real Road Routing (free, no API key) ───────────────────────────────
async function fetchRoadRoute(
  from: L.LatLng,
  to: L.LatLng
): Promise<{ points: L.LatLng[]; distanceKm: number; durationMin: number }> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);

    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]) {
      const route = data.routes[0];
      const points: L.LatLng[] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => L.latLng(lat, lng)
      );
      // Use OSRM's own road distance (not our straight-line calc)
      const distanceKm = +(route.distance / 1000).toFixed(1);
      const durationMin = Math.max(1, Math.ceil(route.duration / 60));
      return { points, distanceKm, durationMin };
    }
  } catch {
    /* fall through */
  }
  // Fallback straight line
  const distanceKm = +(from.distanceTo(to) / 1000).toFixed(1);
  return { points: [from, to], distanceKm, durationMin: 8 };
}

// ─── Route interpolation along polyline ──────────────────────────────────────
function interpolateRoute(
  points: L.LatLng[],
  t: number
): { pos: L.LatLng; bearing: number } {
  if (!points.length) return { pos: L.latLng(0, 0), bearing: 0 };
  if (t <= 0) return { pos: points[0], bearing: calcBearing(points[0], points[1] ?? points[0]) };
  if (t >= 1) return { pos: points[points.length - 1], bearing: 0 };

  let totalLen = 0;
  const segs: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const d = points[i - 1].distanceTo(points[i]);
    segs.push(d);
    totalLen += d;
  }

  let remaining = t * totalLen;
  for (let i = 0; i < segs.length; i++) {
    if (remaining <= segs[i] || i === segs.length - 1) {
      const segT = Math.min(remaining / Math.max(segs[i], 1e-6), 1);
      const a = points[i];
      const b = points[i + 1] ?? points[i];
      return {
        pos: L.latLng(a.lat + (b.lat - a.lat) * segT, a.lng + (b.lng - a.lng) * segT),
        bearing: calcBearing(a, b),
      };
    }
    remaining -= segs[i];
  }
  return { pos: points[points.length - 1], bearing: 0 };
}

function calcBearing(from: L.LatLng, to: L.LatLng): number {
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ─── Map icons ────────────────────────────────────────────────────────────────
const makeRiderIcon = (bearing: number) =>
  L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div style="width:44px;height:44px;position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(59,130,246,0.18);animation:rp 1.8s ease-out infinite;"></div>
        <div style="
          width:40px;height:40px;border-radius:50%;
          background:linear-gradient(145deg,#3b82f6,#1d4ed8);
          border:3px solid #fff;
          box-shadow:0 3px 16px rgba(59,130,246,0.55);
          display:flex;align-items:center;justify-content:center;
          transform:rotate(${bearing}deg);
          position:relative;z-index:2;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L19 19H5L12 2Z" fill="white" opacity="0.95"/>
          </svg>
        </div>
        <style>@keyframes rp{0%{transform:scale(.8);opacity:.6}70%{transform:scale(1.6);opacity:0}100%{transform:scale(1.6);opacity:0}}</style>
      </div>
    `,
  });

const storePin = L.divIcon({
  className: '',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  html: `
    <div style="position:relative;width:38px;height:38px;">
      <div style="
        width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        background:linear-gradient(135deg,#10b981,#059669);
        border:3px solid #fff;box-shadow:0 4px 14px rgba(16,185,129,.5);
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:17px;line-height:1;">🏥</span>
      </div>
    </div>`,
});

const homePin = L.divIcon({
  className: '',
  iconSize: [38, 44],
  iconAnchor: [19, 44],
  html: `
    <div style="position:relative;width:38px;height:44px;">
      <div style="
        width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        background:linear-gradient(135deg,#8b5cf6,#7c3aed);
        border:3px solid #fff;box-shadow:0 4px 14px rgba(139,92,246,.5);
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:17px;line-height:1;">📍</span>
      </div>
    </div>`,
});

// ─── Component ────────────────────────────────────────────────────────────────
const DELIVERY_STEPS = ['Picked Up', 'Order Confirmed', 'On the Way', 'Delivered'];

export default function MapRoute({ order, onDeliveryComplete }: MapRouteProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderRef = useRef<L.Marker | null>(null);
  const travelledRef = useRef<L.Polyline | null>(null);
  const remainingRef = useRef<L.Polyline | null>(null);
  const routeRef = useRef<L.LatLng[]>([]);
  const totalDistRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const startTRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(8);
  const [distKm, setDistKm] = useState<string>('…');
  const [loading, setLoading] = useState(true);
  const [routeReady, setRouteReady] = useState(false);

  const src = L.latLng(order.sourceLat, order.sourceLng);
  const dst = L.latLng(order.destinationLat, order.destinationLng);

  const activeStep =
    order.status === 'delivered' ? 3
    : order.status === 'in_transit' ? 2
    : order.status === 'rider_assigned' ? 1
    : 0;

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: src,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    // HOT OSM tiles — renders ALL street/place names in English, fully free, no API key
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://hot.openstreetmap.org/">HOT</a>',
      maxZoom: 20,
      subdomains: 'abc',
    }).addTo(map);

    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Markers
    L.marker(src, { icon: storePin, zIndexOffset: 50 }).addTo(map)
      .bindTooltip(order.sourceName, { permanent: false, direction: 'top', offset: [0, -40] });
    L.marker(dst, { icon: homePin, zIndexOffset: 50 }).addTo(map)
      .bindTooltip('Your Location', { permanent: false, direction: 'top', offset: [0, -40] });

    // Fetch real road route
    fetchRoadRoute(src, dst).then(({ points, distanceKm, durationMin }) => {
      routeRef.current = points;
      totalDistRef.current = distanceKm;
      setDistKm(distanceKm.toFixed(1));
      setEta(durationMin);

      // Remaining line (grey, dashed)
      remainingRef.current = L.polyline(points, {
        color: '#94a3b8',
        weight: 5,
        opacity: 0.5,
        dashArray: '10,8',
        lineCap: 'round',
      }).addTo(map);

      // Travelled line (blue, solid — on top)
      travelledRef.current = L.polyline([points[0]], {
        color: '#3b82f6',
        weight: 6,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Rider marker
      riderRef.current = L.marker(points[0], {
        icon: makeRiderIcon(0),
        zIndexOffset: 999,
      }).addTo(map);

      // Fit bounds — cap max zoom at 16 so English street names stay readable
      map.fitBounds(L.latLngBounds(points), { padding: [55, 55], maxZoom: 16, animate: true });
      setLoading(false);
      setRouteReady(true);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Animate rider when in_transit ─────────────────────────────────────────
  useEffect(() => {
    if (order.status !== 'in_transit' || !routeReady) return;
    const points = routeRef.current;
    if (!points.length) return;

    const totalDist = totalDistRef.current;
    const DURATION = 14000;
    startTRef.current = null;

    const tick = (ts: number) => {
      if (!startTRef.current) startTRef.current = ts;
      const t = Math.min((ts - startTRef.current) / DURATION, 1);
      const { pos, bearing } = interpolateRoute(points, t);

      // Move rider
      riderRef.current?.setLatLng(pos);
      riderRef.current?.setIcon(makeRiderIcon(bearing));

      // Split route into travelled/remaining
      let totalLen = 0;
      const segs: number[] = [];
      for (let i = 1; i < points.length; i++) {
        const d = points[i - 1].distanceTo(points[i]);
        segs.push(d);
        totalLen += d;
      }
      const targetLen = t * totalLen;
      let cumLen = 0;
      const tPts: L.LatLng[] = [points[0]];
      const rPts: L.LatLng[] = [];
      let split = false;
      for (let i = 0; i < segs.length; i++) {
        if (!split) {
          if (cumLen + segs[i] >= targetLen) {
            tPts.push(pos);
            rPts.push(pos);
            split = true;
          } else {
            tPts.push(points[i + 1]);
          }
          cumLen += segs[i];
        } else {
          rPts.push(points[i + 1]);
        }
      }
      travelledRef.current?.setLatLngs(tPts.length > 1 ? tPts : [points[0], pos]);
      remainingRef.current?.setLatLngs(rPts.length > 1 ? rPts : [pos, dst]);

      // Follow rider
      mapRef.current?.panTo(pos, { animate: true, duration: 0.8, easeLinearity: 0.5 });

      // HUD
      const rem = 1 - t;
      setProgress(t * 100);
      setEta(Math.max(0, Math.ceil(rem * (totalDistRef.current > 0 ? totalDistRef.current / 0.5 : 8))));
      setDistKm((rem * totalDist).toFixed(1));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setEta(0);
        setDistKm('0.0');
        onDeliveryComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [order.status, routeReady]);

  const isDelivered = order.status === 'delivered';

  return (
    <div
      id="map-route-container"
      style={{
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}
    >
      {/* ── TOP CARD — Rider info (like Rapido / image 2) ── */}
      <div style={{
        background: '#fff',
        padding: '16px 20px 14px',
        borderBottom: '1px solid #f1f5f9',
      }}>
        {/* Sub-header */}
        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          Your Rider
        </div>

        {/* Rider row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
            border: '2px solid #e0e7ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>🏍️</div>

          {/* Name + rating */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: '#0f172a', fontWeight: 700, fontSize: 17 }}>
                {order.rider?.name || 'Rider Sarah'}
              </span>
              <span style={{
                background: '#fef9c3', color: '#854d0e',
                fontSize: 12, fontWeight: 700, borderRadius: 20,
                padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3,
              }}>
                ⭐ 4.8
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: 13, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                background: isDelivered ? '#dcfce7' : '#dbeafe',
                color: isDelivered ? '#166534' : '#1e40af',
                borderRadius: 20, padding: '2px 10px', fontWeight: 600, fontSize: 12,
              }}>
                {isDelivered ? 'Delivered ✓' : `${eta} min away`}
              </span>
              {order.rider?.vehicleNo && (
                <span style={{ color: '#94a3b8', fontSize: 12 }}>• {order.rider.vehicleNo}</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button style={{
              width: 42, height: 42, borderRadius: '50%',
              background: '#f0fdf4', border: '1.5px solid #bbf7d0',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Phone size={18} color="#16a34a" strokeWidth={2.5} />
            </button>
            <button style={{
              width: 42, height: 42, borderRadius: '50%',
              background: '#eff6ff', border: '1.5px solid #bfdbfe',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageSquare size={17} color="#2563eb" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ── THE MAP ── */}
      <div style={{ position: 'relative', height: 360 }}>
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

        {/* Loading spinner */}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2000,
            background: 'rgba(255,255,255,0.88)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40,
              border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6',
              borderRadius: '50%', animation: 'mrspin 0.8s linear infinite',
            }} />
            <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>Finding road route…</span>
          </div>
        )}

        {/* Distance badge */}
        {!loading && (
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 1000,
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
            borderRadius: 10, padding: '6px 14px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid rgba(226,232,240,0.8)',
          }}>
            <span style={{ fontSize: 14 }}>📍</span>
            <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>
              {isDelivered ? '0.0 km' : `${distKm} km`} remaining
            </span>
          </div>
        )}

        {/* Progress bar inside map */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 4, background: '#e2e8f0', zIndex: 1000,
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg,#3b82f6,#60a5fa)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* ── DELIVERY STEPS (like image 2 bottom) ── */}
      <div style={{
        background: '#fff',
        padding: '18px 20px 20px',
        borderTop: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Connecting line behind steps */}
          <div style={{
            position: 'absolute', top: 18, left: '12.5%', right: '12.5%',
            height: 3, background: '#e2e8f0', zIndex: 0, borderRadius: 4,
          }}>
            <div style={{
              height: '100%',
              width: activeStep === 0 ? '0%'
                   : activeStep === 1 ? '33%'
                   : activeStep === 2 ? '66%'
                   : '100%',
              background: 'linear-gradient(90deg,#22c55e,#3b82f6)',
              borderRadius: 4,
              transition: 'width 0.6s ease',
            }} />
          </div>

          {DELIVERY_STEPS.map((label, idx) => {
            const done = idx < activeStep;
            const active = idx === activeStep;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, flex: 1 }}>
                {/* Circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: done ? '#22c55e' : active ? '#3b82f6' : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? '0 0 0 4px rgba(59,130,246,0.2)' : done ? '0 0 0 3px rgba(34,197,94,0.15)' : 'none',
                  transition: 'all 0.4s ease',
                }}>
                  {done ? (
                    <CheckCircle2 size={18} color="white" strokeWidth={2.5} />
                  ) : active ? (
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', background: '#fff',
                      animation: 'mrblink 1s ease-in-out infinite',
                    }} />
                  ) : (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1' }} />
                  )}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: 10.5, fontWeight: active ? 700 : done ? 600 : 500,
                  color: done ? '#16a34a' : active ? '#2563eb' : '#94a3b8',
                  textAlign: 'center', lineHeight: 1.3, maxWidth: 60,
                  transition: 'color 0.3s ease',
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Order info strip ── */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #f1f5f9',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: '#64748b', fontSize: 12 }}>
          Order <span style={{ fontFamily: 'monospace', color: '#0f172a', fontWeight: 700 }}>#{order.id.slice(0, 8)}</span>
          {' '}• <span style={{ color: '#0f172a', fontWeight: 600 }}>{order.itemName}</span> ({order.quantity}x)
        </span>
        <span style={{
          background: order.status === 'delivered' ? '#dcfce7' : '#dbeafe',
          color: order.status === 'delivered' ? '#166534' : '#1d4ed8',
          fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
        }}>
          {order.status === 'delivered' ? '✓ Delivered'
           : order.status === 'in_transit' ? '🚴 On the way'
           : order.status === 'rider_assigned' ? '🏍️ Rider assigned'
           : '⏳ Preparing'}
        </span>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes mrspin { to { transform: rotate(360deg); } }
        @keyframes mrblink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        /* Leaflet overrides */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.14) !important;
          border-radius: 10px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: #fff !important; color: #1e293b !important;
          border: none !important; border-bottom: 1px solid #f1f5f9 !important;
          font-weight: 700 !important; font-size: 17px !important;
          width: 36px !important; height: 36px !important; line-height: 36px !important;
        }
        .leaflet-control-zoom a:hover { background: #f8fafc !important; }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.8) !important;
          font-size: 9px !important; color: #94a3b8 !important;
          padding: 2px 6px !important; border-radius: 0 0 0 0 !important;
        }
        .leaflet-control-attribution a { color: #94a3b8 !important; }
        .leaflet-tooltip {
          background: #1e293b !important; border: 1px solid #334155 !important;
          color: #f1f5f9 !important; border-radius: 8px !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 4px 10px !important; box-shadow: 0 3px 12px rgba(0,0,0,.2) !important;
        }
        .leaflet-tooltip::before { display: none !important; }
      `}</style>
    </div>
  );
}
