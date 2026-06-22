import React, { useState } from 'react';
import { Hospital, MedicalStore, EquipmentItem, MedicineItem } from '../types';
import { ShieldCheck, Landmark, ShoppingBag, Plus, Minus, ArrowUpRight, PlusCircle } from 'lucide-react';

interface InventoryManagerProps {
  hospitals: Hospital[];
  stores: MedicalStore[];
  onUpdateHospitalEquipment: (hospitalId: string, equipmentId: string, newAvailable: number, newTotal: number) => void;
  onUpdateStoreMedicines: (storeId: string, medicineId: string, newStock: number, isAvailable: boolean) => void;
  onAddEquipmentToHospital: (hospitalId: string, item: Omit<EquipmentItem, 'id'>) => void;
  onAddMedicineToStore: (storeId: string, item: Omit<MedicineItem, 'id'>) => void;
}

export default function InventoryManager({
  hospitals,
  stores,
  onUpdateHospitalEquipment,
  onUpdateStoreMedicines,
  onAddEquipmentToHospital,
  onAddMedicineToStore,
}: InventoryManagerProps) {
  const [selectedType, setSelectedType] = useState<'hospital' | 'store'>('hospital');
  const [selectedItemId, setSelectedItemId] = useState<string>(hospitals[0]?.id || '');

  // Add Equipment Form States
  const [newEqName, setNewEqName] = useState('');
  const [newEqCategory, setNewEqCategory] = useState<'Oxygen' | 'Blood' | 'Ventilator' | 'Defibrillator' | 'Other'>('Oxygen');
  const [newEqCount, setNewEqCount] = useState(10);
  const [newEqUnit, setNewEqUnit] = useState('units');

  // Add Medicine Form States
  const [newMedName, setNewMedName] = useState('');
  const [newMedCategory, setNewMedCategory] = useState('');
  const [newMedStock, setNewMedStock] = useState(25);
  const [newMedPrice, setNewMedPrice] = useState(15);

  const currentHospital = hospitals.find(h => h.id === selectedItemId);
  const currentStore = stores.find(s => s.id === selectedItemId);

  const handleTypeChange = (type: 'hospital' | 'store') => {
    setSelectedType(type);
    if (type === 'hospital') {
      setSelectedItemId(hospitals[0]?.id || '');
    } else {
      setSelectedItemId(stores[0]?.id || '');
    }
  };

  const handleCreateEq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqName || !selectedItemId) return;

    onAddEquipmentToHospital(selectedItemId, {
      name: newEqName,
      category: newEqCategory,
      available: newEqCount,
      total: newEqCount,
      unit: newEqUnit,
    });

    // Reset Form
    setNewEqName('');
    setNewEqCount(10);
  };

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !selectedItemId) return;

    onAddMedicineToStore(selectedItemId, {
      name: newMedName,
      category: newMedCategory || 'General',
      available: newMedStock > 0,
      stock: newMedStock,
      price: newMedPrice,
    });

    // Reset Form
    setNewMedName('');
    setNewMedCategory('');
    setNewMedStock(25);
    setNewMedPrice(15);
  };

  return (
    <div id="inventory-manager-component" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-1.5">
            <ShieldCheck className="w-5.5 h-5.5 text-teal-600" />
            <span>Facility Inventory Control Panel</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Authorized hospital & pharmacy personnel only. Updates reflect to customers in real-time.</p>
        </div>

        {/* Picker Mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-center">
          <button
            onClick={() => handleTypeChange('hospital')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedType === 'hospital' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Hospitals</span>
          </button>
          <button
            onClick={() => handleTypeChange('store')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedType === 'store' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Stores</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Select item & list inventory */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select {selectedType === 'hospital' ? 'Clinical Facility' : 'Medical Store'} to Update:
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              {selectedType === 'hospital' ? (
                hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.location.slice(0, 30)}...)</option>
                ))
              ) : (
                stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.location.slice(0, 30)}...)</option>
                ))
              )}
            </select>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">
              Currently Logged Stocks
            </h4>

            {selectedType === 'hospital' && currentHospital ? (
              <div className="space-y-3">
                {currentHospital.equipment.map(item => (
                  <div key={item.id} className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Category: <span className="font-mono">{item.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          onClick={() => onUpdateHospitalEquipment(currentHospital.id, item.id, item.available - 1, item.total)}
                          className="p-1 px-2 text-slate-500 hover:bg-slate-100 text-xs font-bold"
                          title="Decrease Stock"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-slate-800">
                          {item.available} / {item.total}
                        </span>
                        <button
                          onClick={() => onUpdateHospitalEquipment(currentHospital.id, item.id, item.available + 1, item.total + 1)}
                          className="p-1 px-2 text-slate-500 hover:bg-slate-100 text-xs font-bold"
                          title="Increase/Add Stock"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedType === 'store' && currentStore ? (
              <div className="space-y-3">
                {currentStore.medicines.map(med => (
                  <div key={med.id} className="bg-white p-3.5 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{med.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Category: <span className="font-mono">{med.category}</span> • Price: <span className="font-semibold text-emerald-600">${med.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                        <button
                          onClick={() => onUpdateStoreMedicines(currentStore.id, med.id, med.stock - 1, med.stock - 1 > 0)}
                          className="p-1 px-2 text-slate-500 hover:bg-slate-100 text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {med.stock}
                        </span>
                        <button
                          onClick={() => onUpdateStoreMedicines(currentStore.id, med.id, med.stock + 1, true)}
                          className="p-1 px-2 text-slate-500 hover:bg-slate-100 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        med.available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'
                      }`}>
                        {med.available ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No facility selected or available.</p>
            )}
          </div>
        </div>

        {/* Right Side: Add new resource item forms */}
        <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-150">
          <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>Launch New Emergency Item</span>
          </h4>

          {selectedType === 'hospital' ? (
            <form onSubmit={handleCreateEq} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Equipment Name</label>
                <input
                  type="text"
                  placeholder="e.g. Liquid Oxygen Tank 50L"
                  required
                  value={newEqName}
                  onChange={(e) => setNewEqName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Stock Category</label>
                <select
                  value={newEqCategory}
                  onChange={(e) => setNewEqCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="Oxygen">Oxygen Cylinders</option>
                  <option value="Blood">Blood Infusions</option>
                  <option value="Ventilator">Mechanical Ventilators</option>
                  <option value="Defibrillator">Defibrillators (AED)</option>
                  <option value="Other">Other Emergency Accessories</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Quantity Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEqCount}
                    onChange={(e) => setNewEqCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Measure Unit</label>
                  <input
                    type="text"
                    required
                    value={newEqUnit}
                    onChange={(e) => setNewEqUnit(e.target.value)}
                    placeholder="e.g. cylinders, bags"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-all cursor-pointer mt-2"
              >
                Add Equipment to Hospital
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateMed} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Medicine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol IV Solution"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Stock Category</label>
                <input
                  type="text"
                  placeholder="e.g. Antibiotic, Antiviral"
                  value={newMedCategory}
                  onChange={(e) => setNewMedCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Packs Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMedStock}
                    onChange={(e) => setNewMedStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMedPrice}
                    onChange={(e) => setNewMedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-all cursor-pointer mt-2"
              >
                Add Medicine to Store
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
