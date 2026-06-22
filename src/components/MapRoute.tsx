import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Truck, AlertCircle, CheckCircle2, Navigation, Send, Flame, Compass } from 'lucide-react';
import { Rider, RequestOrder } from '../types';

interface MapRouteProps {
  order: RequestOrder;
  onDeliveryComplete: () => void;
}

export default function MapRoute({ order, onDeliveryComplete }: MapRouteProps) {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [eta, setEta] = useState(8); // in seconds represent minutes
  const [currentDistance, setCurrentDistance] = useState(4.2); // in km
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>({ x: 150, y: 150 });
  
  // Custom points for the map path
  const startX = 120;
  const startY = 240;
  const controlX1 = 200;
  const controlY1 = 100;
  const controlX2 = 400;
  const controlY2 = 300;
  const endX = 480;
  const endY = 120;

  // Bezier curve interpolation
  const getCubicBezierXY = (t: number) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = mt3 * startX + 3 * mt2 * t * controlX1 + 3 * mt * t2 * controlX2 + t3 * endX;
    const y = mt3 * startY + 3 * mt2 * t * controlY1 + 3 * mt * t2 * controlY2 + t3 * endY;
    return { x, y };
  };

  useEffect(() => {
    if (order.status === 'in_transit') {
      const duration = 12000; // 12 seconds simulation duration
      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(currentProgress);

        // Update coordinate
        const t = currentProgress / 100;
        const pt = getCubicBezierXY(t);
        setCoordinates(pt);

        // Update dynamic ETA and distance
        const remainingPrg = 1 - t;
        setEta(Math.ceil(remainingPrg * 8));
        setCurrentDistance(parseFloat((remainingPrg * 4.2).toFixed(1)));

        if (currentProgress >= 100) {
          clearInterval(interval);
          onDeliveryComplete();
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      // Not in transit, just set coordinate to start point
      setCoordinates({ x: startX, y: startY });
    }
  }, [order.status]);

  // Generate d attribute for bezier curve to draw path
  const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

  return (
    <div id="map-route-container" className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <h3 className="font-semibold text-lg text-slate-100">Live Delivery Route Tracker</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Order <span className="font-mono text-teal-400">#{order.id.slice(0, 8)}</span> • Delivering <span className="text-slate-200 font-medium">{order.itemName}</span> ({order.quantity}x)
          </p>
        </div>
        
        {/* Telemetry metrics */}
        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status</div>
            <div className="text-sm font-semibold text-amber-400">
              {order.status === 'rider_assigned' && 'Rider Incoming'}
              {order.status === 'in_transit' && 'In Transit'}
              {order.status === 'delivered' && 'Delivered'}
              {order.status === 'accepted' && 'Prepping'}
            </div>
          </div>
          <div className="w-[1px] h-8 bg-slate-800"></div>
          <div className="text-center px-2">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">ETA</div>
            <div className="text-sm font-mono font-semibold text-teal-400">{order.status === 'delivered' ? '0 min' : `${eta} mins`}</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-800"></div>
          <div className="text-center px-2">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Distance</div>
            <div className="text-sm font-mono font-semibold text-teal-400">{order.status === 'delivered' ? '0 km' : `${currentDistance} km`}</div>
          </div>
        </div>
      </div>

      {/* Styled Interactive SVGRoadmap Map */}
      <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Blueprint Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
        
        {/* District Landmark Background Decorations */}
        <div className="absolute top-1/4 left-1/3 text-[9px] text-slate-700 font-mono tracking-widest uppercase pointer-events-none">Central Hospital District</div>
        <div className="absolute bottom-1/4 right-1/4 text-[9px] text-slate-700 font-mono tracking-widest uppercase pointer-events-none">Residential Greens</div>
        
        {/* SVG Drawing Canvas */}
        <svg className="w-full h-full" viewBox="0 0 600 350">
          {/* Roads Network Mock lines behind main track to give realistic map depth */}
          <path d="M 50 120 L 550 120" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M 120 50 L 120 300" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M 480 50 L 480 300" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M 280 180 C 200 240, 450 300, 480 120" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4,4" />

          {/* Active Curved Highway Path */}
          <path
            d={pathData}
            fill="none"
            stroke="#334155"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Active Highlighted glow track */}
          <path
            d={pathData}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="4"
            strokeLinecap="round"
            className="opacity-40"
          />
          {/* Moving fluid progress pulse wave */}
          <path
            d={pathData}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="40 180"
            strokeDashoffset={-progress * 2}
          />

          {/* Source node (Hospital/Store) */}
          <g transform={`translate(${startX}, ${startY})`}>
            {/* Pulsing radar */}
            <circle r="18" fill="#14b8a6" className="animate-ping opacity-20" />
            <circle r="10" fill="#0f766e" />
            <circle r="6" fill="#2dd4bf" />
            <text y="-25" textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-sans font-semibold">
              {order.sourceName.slice(0, 15)}...
            </text>
          </g>

          {/* Destination Node (Patient/User Home) */}
          <g transform={`translate(${endX}, ${endY})`}>
            <circle r="18" fill="#ec4899" className="animate-ping opacity-20" />
            <circle r="10" fill="#be185d" />
            <circle r="6" fill="#f472b6" />
            <text y="-25" textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-sans font-semibold">
              Emergency Delivery (You)
            </text>
          </g>

          {/* Active Transit Rider Marker */}
          {order.status === 'in_transit' && (
            <g transform={`translate(${coordinates.x}, ${coordinates.y})`}>
              {/* Halos */}
              <circle r="16" fill="#f59e0b" className="animate-pulse opacity-30" />
              <g transform="translate(-10, -10)">
                <rect width="20" height="20" rx="10" fill="#f59e0b" className="shadow-lg" />
                {/* Embedded mini motorbike vehicle direction indicator */}
                <svg viewBox="0 0 24 24" fill="none" className="w-[14px] h-[14px] text-white mx-auto mt-[3px]" stroke="currentColor" strokeWidth="3">
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                  <path d="M5 17h14v-4l-3-4H9l-2 4H5z" />
                </svg>
              </g>
            </g>
          )}
        </svg>

        {/* Map UI overlays */}
        <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-sm border border-slate-800 text-slate-300 text-[10px] py-1 px-2.5 rounded-lg font-mono flex items-center gap-1.5 shadow-md">
          <Compass className="w-3 h-3 text-teal-400 rotate-12" />
          <span>ROUTE RESOLVED VIA HEALTH-CORRIDOR</span>
        </div>

        <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-sm border border-slate-800 py-2 px-3 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 shadow-md">
          <div className="p-1 bg-teal-500/10 rounded-lg text-teal-400">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200">{order.rider?.name || 'Rider Sarah'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{order.rider?.vehicleNo || 'EV-MOTO-303'} • {order.rider?.phone}</div>
          </div>
        </div>
      </div>

      {/* Navigation directions panel (Simulated) */}
      <div id="route-directions-feed" className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Live Navigation Feed</h4>
        <div className="space-y-2 max-h-[85px] overflow-y-auto pr-2 custom-scrollbar">
          {progress < 25 && (
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <Navigation className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <span>Rider has departed from <span className="font-semibold text-slate-100">{order.sourceName}</span> with requested item. Emergency flashing enabled.</span>
            </div>
          )}
          {progress >= 25 && progress < 60 && (
            <div className="flex items-start gap-2.5 text-xs text-slate-300 animate-slide-in">
              <Navigation className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" fill="currentColor" />
              <span>Rider passing the <span className="text-slate-100 font-semibold">Central Medical District Road</span>, routing around the traffic bottleneck to bypass delays. ETA updated.</span>
            </div>
          )}
          {progress >= 60 && progress < 90 && (
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <Navigation className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>Approaching destination area. Delivery assistant coordinates aligned. Please prepare storage/acceptance desk for immediate dispatch handoff.</span>
            </div>
          )}
          {progress >= 90 && (
            <div className="flex items-start gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="font-medium">Arrived! The rider is outside your emergency entrance door. Please sign the delivery tablet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
