import React, { useState } from 'react';
import { ShoppingBag, Phone, MapPin, ChevronRight, ChevronDown, Check, DollarSign } from 'lucide-react';
import { MedicalStore, MedicineItem } from '../types';

interface StoreCardProps {
  key?: string;
  store: MedicalStore;
  onRequestMedicine: (storeId: string, medicine: MedicineItem, quantity: number) => void;
  activeSearchQuery: string;
}

export default function StoreCard({ store, onRequestMedicine, activeSearchQuery }: StoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQtyChange = (itemId: string, val: number, max: number) => {
    const cleanVal = Math.max(1, Math.min(max, val));
    setQuantities(prev => ({ ...prev, [itemId]: cleanVal }));
  };

  const filteredMedicines = store.medicines.filter(item => 
    item.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(activeSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm leading-tight">{store.name}</h4>
              <p className="text-[10px] uppercase font-mono tracking-wider text-blue-500 font-bold mt-1">Verified Wellness Pharmacy</p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
            Open 24/7
          </span>
        </div>

        {/* Essential Info */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{store.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span>{store.contact}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-slate-400">STATE REG: {store.licenseNumber}</span>
          </div>
        </div>

        {/* Medic Stocks Pill Summary */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {store.medicines.slice(0, 3).map(item => (
            <span key={item.id} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg font-medium border border-slate-100">
              {item.name}: <strong className={`font-semibold ${item.available ? 'text-emerald-600' : 'text-red-500'}`}>{item.available ? 'In Stock' : 'None'}</strong>
            </span>
          ))}
          {store.medicines.length > 3 && (
            <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
              +{store.medicines.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>{expanded ? 'Collapse Medicines' : 'View Available Pharmacy Drugs'}</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3 animate-fade-in font-sans">
            {filteredMedicines.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No matching medications found at this store.</p>
            ) : (
              filteredMedicines.map(item => {
                const qty = quantities[item.id] || 1;
                return (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] uppercase font-mono text-slate-400">{item.category}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Ref: ${item.price} per unit
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className={`text-[10px] font-semibold ${item.available ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.available ? `Stock: ${item.stock} pack(s)` : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-between">
                      {item.available && item.stock > 0 ? (
                        <>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                            <button
                              onClick={() => handleQtyChange(item.id, qty - 1, item.stock)}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-100 text-xs font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={qty}
                              onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1, item.stock)}
                              className="w-8 text-center text-xs font-semibold text-slate-800 border-none outline-none [appearance:textfield]"
                            />
                            <button
                              onClick={() => handleQtyChange(item.id, qty + 1, item.stock)}
                              className="px-2 py-1 text-slate-500 hover:bg-slate-100 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRequestMedicine(store.id, item, qty)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
                          >
                            Order Prescript
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-red-500 font-semibold px-2 py-1 bg-red-50 rounded-lg border border-red-100">
                          Unavailable
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
