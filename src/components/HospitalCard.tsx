import React, { useState } from 'react';
import { Landmark, Phone, MapPin, Activity, HelpCircle, ChevronRight, ChevronDown, Check, Cross } from 'lucide-react';
import { Hospital, EquipmentItem } from '../types';

interface HospitalCardProps {
  key?: string;
  hospital: Hospital;
  onRequestItem: (hospitalId: string, item: EquipmentItem, quantity: number) => void;
  activeSearchQuery: string;
}

export default function HospitalCard({ hospital, onRequestItem, activeSearchQuery }: HospitalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQtyChange = (itemId: string, val: number, max: number) => {
    const cleanVal = Math.max(1, Math.min(max, val));
    setQuantities(prev => ({ ...prev, [itemId]: cleanVal }));
  };

  // Filter equipment based on search query
  const filteredEquipment = hospital.equipment.filter(item => 
    item.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(activeSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm leading-tight">{hospital.name}</h4>
              <p className="text-[10px] uppercase font-mono tracking-wider text-rose-500 font-bold mt-1">Verified Clinical Entity</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
            Active
          </span>
        </div>

        {/* Essential Info */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{hospital.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span>{hospital.contact}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-slate-400">LICENSE: {hospital.licenseNumber}</span>
          </div>
        </div>

        {/* Live Mini Stocks pill */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {hospital.equipment.slice(0, 3).map(item => (
            <span key={item.id} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg font-medium border border-slate-100">
              {item.name}: <strong className="text-slate-800 font-semibold">{item.available}</strong>
            </span>
          ))}
          {hospital.equipment.length > 3 && (
            <span className="text-[10px] text-teal-600 font-semibold bg-teal-50 px-2 py-1 rounded-lg">
              +{hospital.equipment.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <span>{expanded ? 'Collapse Inventory' : 'Expand full Equipment Stock'}</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {filteredEquipment.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No matching resources available at this hospital.</p>
            ) : (
              filteredEquipment.map(item => {
                const qty = quantities[item.id] || 1;
                return (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] uppercase font-mono text-slate-400">{item.category}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className={`text-[10px] font-semibold ${item.available > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.available} of {item.total} {item.unit} left
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-between">
                      {item.available > 0 ? (
                        <>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => handleQtyChange(item.id, qty - 1, item.available)}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-100 text-xs font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={qty}
                              onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1, item.available)}
                              className="w-8 text-center text-xs font-semibold text-slate-800 border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => handleQtyChange(item.id, qty + 1, item.available)}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-100 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRequestItem(hospital.id, item, qty)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
                          >
                            Request (Borrow)
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-red-500 font-semibold px-2 py-1 bg-red-50 rounded-lg border border-red-100">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
