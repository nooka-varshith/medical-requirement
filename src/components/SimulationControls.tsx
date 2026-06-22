import React from 'react';
import { Bell, Truck, Navigation, CheckCircle, Play, ShieldAlert, Cpu } from 'lucide-react';
import { RequestOrder, Rider } from '../types';

interface SimulationControlsProps {
  order: RequestOrder;
  availableRiders: Rider[];
  onUpdateStatus: (orderId: string, status: RequestOrder['status'], rider?: Rider) => void;
  onAutopilotToggle: () => void;
  isAutopilotActive: boolean;
}

export default function SimulationControls({
  order,
  availableRiders,
  onUpdateStatus,
  onAutopilotToggle,
  isAutopilotActive,
}: SimulationControlsProps) {
  
  const handleAssignRider = (rider: Rider) => {
    onUpdateStatus(order.id, 'rider_assigned', rider);
  };

  return (
    <div id="simulation-console" className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-slate-800">
            <Cpu className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm tracking-tight">Interactive Logistical Cockpit</h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Control clinical dispatch steps manually or trigger autoplay</p>
        </div>

        <button
          onClick={onAutopilotToggle}
          className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
            isAutopilotActive 
              ? 'bg-teal-50 border-teal-200 text-teal-700 animate-pulse'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isAutopilotActive ? 'Autopilot Active' : 'Start Autopilot'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Step-by-Step Simulation Flow */}
        <div className="relative border-l-2 border-slate-200 ml-3 pl-5 space-y-4 text-xs">
          
          {/* Step 1: Handshake (Pending) */}
          <div className="relative">
            <span className={`absolute -left-[27px] top-0 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center ${
              order.status === 'pending' ? 'bg-red-500 animate-ping' : 'bg-teal-600'
            }`}></span>
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>1. Request Transmitted</span>
                {order.status === 'pending' && <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded text-[9px] animate-pulse">ALERT ACTIVE</span>}
              </div>
              <p className="text-slate-500 mt-0.5 text-[11px]">User request sent to {order.sourceName}.</p>
              
              {order.status === 'pending' && !isAutopilotActive && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'accepted')}
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-[10px] shadow-sm cursor-pointer"
                >
                  Confirm & Beep Alert Accept
                </button>
              )}
            </div>
          </div>

          {/* Step 2: Gathering (Accepted) */}
          <div className="relative">
            <span className={`absolute -left-[27px] top-0 w-3 h-3 rounded-full border-2 border-white ${
              ['accepted', 'assembling'].includes(order.status) ? 'bg-amber-500 animate-pulse' : 
              ['rider_assigned', 'in_transit', 'delivered'].includes(order.status) ? 'bg-teal-600' : 'bg-slate-300'
            }`}></span>
            <div>
              <div className="font-bold text-slate-700">2. Assemble and Sterilize Inventory</div>
              <p className="text-slate-500 mt-0.5 text-[11px]">Preparing {order.itemName} in sterile packs.</p>
              
              {order.status === 'accepted' && !isAutopilotActive && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'assembling')}
                  className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-[10px] cursor-pointer"
                >
                  Mark Packaged
                </button>
              )}
            </div>
          </div>

          {/* Step 3: Dispatch assignment */}
          <div className="relative">
            <span className={`absolute -left-[27px] top-0 w-3 h-3 rounded-full border-2 border-white ${
              order.status === 'assembling' ? 'bg-amber-500 animate-pulse' : 
              ['rider_assigned', 'in_transit', 'delivered'].includes(order.status) ? 'bg-teal-600' : 'bg-slate-300'
            }`}></span>
            <div>
              <div className="font-bold text-slate-700">3. Select Emergency Logistics Rider</div>
              <p className="text-slate-500 mt-0.5 text-[11px]">Assign rider to avoid clinical timing penalties.</p>
              
              {order.status === 'assembling' && !isAutopilotActive && (
                <div className="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold mb-1">NEARBY RIDERS (IDLE):</div>
                  {availableRiders.map(rider => (
                    <div key={rider.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-md border border-slate-100">
                      <div>
                        <div className="font-semibold text-[11px] text-slate-800">{rider.name}</div>
                        <div className="text-[9px] text-slate-400">{rider.vehicleNo}</div>
                      </div>
                      <button
                        onClick={() => handleAssignRider(rider)}
                        className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded hover:bg-slate-800 cursor-pointer"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {order.status === 'rider_assigned' && (
                <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-[11px] text-emerald-800 font-medium">
                  Rider <span className="font-bold">{order.rider?.name}</span> assigned. Ready for dispatch!
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Dispatch (In Transit) */}
          <div className="relative">
            <span className={`absolute -left-[27px] top-0 w-3 h-3 rounded-full border-2 border-white ${
              order.status === 'rider_assigned' ? 'bg-amber-500 animate-pulse' : 
              order.status === 'in_transit' ? 'bg-teal-500 animate-ping' : 
              order.status === 'delivered' ? 'bg-teal-600' : 'bg-slate-300'
            }`}></span>
            <div>
              <div className="font-bold text-slate-700">4. Dispatch Corridor Cleared</div>
              <p className="text-slate-500 mt-0.5 text-[11px]">Rider leaves on active transit path.</p>
              
              {order.status === 'rider_assigned' && !isAutopilotActive && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'in_transit')}
                  className="mt-2 px-3 py-1 bg-slate-900 hover:bg-black text-white font-semibold rounded text-[10px] cursor-pointer"
                >
                  Launch Transit Path Animation
                </button>
              )}
            </div>
          </div>

          {/* Step 5: Finished */}
          <div className="relative">
            <span className={`absolute -left-[27px] top-0 w-3 h-3 rounded-full border-2 border-white ${
              order.status === 'delivered' ? 'bg-emerald-600' : 'bg-slate-300'
            }`}></span>
            <div>
              <div className="font-bold text-slate-700">5. Package Transferred Successfully</div>
              <p className="text-slate-500 mt-0.5 text-[11px]">Direct handoff to patient on site.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
