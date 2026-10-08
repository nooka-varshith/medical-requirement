import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Search, 
  User as UserIcon, 
  Settings, 
  BellRing, 
  ShieldAlert, 
  Crosshair, 
  Activity, 
  HeartHandshake, 
  LogOut, 
  Truck, 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  FileLock2, 
  Layers,
  Sparkles
} from 'lucide-react';

import { EquipmentItem, MedicineItem, Hospital, MedicalStore, Rider, RequestOrder, UserSession } from './types';
import { INITIAL_HOSPITALS, INITIAL_STORES, INITIAL_RIDERS } from './data';
import RegistrationPortal from './components/RegistrationPortal';
import HospitalCard from './components/HospitalCard';
import StoreCard from './components/StoreCard';
import SimulationControls from './components/SimulationControls';
import MapRoute from './components/MapRoute';
import EndPage from './components/EndPage';
import InventoryManager from './components/InventoryManager';
import AICopilot from './components/AICopilot';

// Helper to fetch from localStorage or fallback
const getStoredData = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  // Session details State
  const [session, setSession] = useState<UserSession | null>(() => 
    getStoredData<UserSession | null>('med_saviour_session', null)
  );

  // Core databases state
  const [hospitals, setHospitals] = useState<Hospital[]>(() => 
    getStoredData<Hospital[]>('med_saviour_hospitals', INITIAL_HOSPITALS)
  );
  
  const [stores, setStores] = useState<MedicalStore[]>(() => 
    getStoredData<MedicalStore[]>('med_saviour_stores', INITIAL_STORES)
  );

  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);

  // Active logistics state
  const [activeOrder, setActiveOrder] = useState<RequestOrder | null>(() => 
    getStoredData<RequestOrder | null>('med_saviour_active_order', null)
  );

  // UI Views States
  const [activeSearch, setActiveSearch] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('All');
  const [dashboardTab, setDashboardTab] = useState<'hospitals' | 'stores' | 'delivery' | 'inventory'>('hospitals');
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  
  // Simulated Autopilot state
  const [isAutopilot, setIsAutopilot] = useState(false);

  const handleAICopilotDispatch = (
    sourceType: 'hospital' | 'store',
    sourceId: string,
    sourceName: string,
    itemName: string,
    quantity: number
  ) => {
    if (!session) return;

    let sLat = 40;
    let sLng = 80;

    if (sourceType === 'hospital') {
      const h = hospitals.find(item => item.id === sourceId);
      if (h) {
        sLat = h.lat;
        sLng = h.lng;
      }
    } else {
      const s = stores.find(item => item.id === sourceId);
      if (s) {
        sLat = s.lat;
        sLng = s.lng;
      }
    }

    const newOrder: RequestOrder = {
      id: `ord-ai-${Date.now()}`,
      userEmail: session.email,
      userLocation: session.address,
      destinationLat: 17.4005,
      destinationLng: 78.4631,
      sourceType,
      sourceId,
      sourceName,
      sourceLat: sLat,
      sourceLng: sLng,
      itemName,
      quantity,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString(),
    };

    setActiveOrder(newOrder);
    setDashboardTab('delivery');
    setIsAutopilot(true);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('med_saviour_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem('med_saviour_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('med_saviour_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('med_saviour_active_order', JSON.stringify(activeOrder));
  }, [activeOrder]);

  // Autopilot Tick Handler
  useEffect(() => {
    if (!isAutopilot || !activeOrder) return;

    let timer: NodeJS.Timeout;

    if (activeOrder.status === 'pending') {
      timer = setTimeout(() => {
        updateOrderStatus(activeOrder.id, 'accepted');
      }, 2500);
    } else if (activeOrder.status === 'accepted') {
      timer = setTimeout(() => {
        updateOrderStatus(activeOrder.id, 'assembling');
      }, 2500);
    } else if (activeOrder.status === 'assembling') {
      timer = setTimeout(() => {
        // Auto assign the first available rider
        const idleRider = riders.find(r => r.status === 'idle') || riders[0];
        updateOrderStatus(activeOrder.id, 'rider_assigned', idleRider);
      }, 2500);
    } else if (activeOrder.status === 'rider_assigned') {
      timer = setTimeout(() => {
        updateOrderStatus(activeOrder.id, 'in_transit');
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [isAutopilot, activeOrder?.status]);

  // Handle User Registration & immediate session grant
  const handleUserRegister = (newSession: UserSession) => {
    setSession(newSession);
    // Create prefilled coordinates near central zone
    newSession.address = newSession.address || '150 Metro Central Plaza, Flat 3B';
  };

  // Hospital Registrations (adds them to the simulation list)
  const handleHospitalRegister = (newHospital: Hospital) => {
    setHospitals(prev => [newHospital, ...prev]);
  };

  // Sign out
  const handleLogOut = () => {
    setSession(null);
    setActiveOrder(null);
    setIsAutopilot(false);
  };

  // Handles requested medical equipment from nearest general hospitals
  const handleRequestEquipment = (hospitalId: string, item: EquipmentItem, quantity: number) => {
    if (!session) return;

    // Check if item is available in requested count
    const targetHosp = hospitals.find(h => h.id === hospitalId);
    if (!targetHosp) return;

    // Deduct stock immediately
    setHospitals(prev => prev.map(h => {
      if (h.id === hospitalId) {
        return {
          ...h,
          equipment: h.equipment.map(eq => {
            if (eq.id === item.id) {
              return { ...eq, available: Math.max(0, eq.available - quantity) };
            }
            return eq;
          })
        };
      }
      return h;
    }));

    // Create direct order request
    const newOrder: RequestOrder = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userEmail: session.email,
      userLocation: session.address,
      destinationLat: 17.4005, // user position - Banjara Hills residential, ~2km from sources
      destinationLng: 78.4631,
      sourceType: 'hospital',
      sourceId: hospitalId,
      sourceName: targetHosp.name,
      sourceLat: targetHosp.lat,
      sourceLng: targetHosp.lng,
      itemName: item.name,
      quantity: quantity,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString(),
    };

    setActiveOrder(newOrder);
    setDashboardTab('delivery');
  };

  // Handles requested medicines from medical stores
  const handleRequestMedicine = (storeId: string, medicine: MedicineItem, quantity: number) => {
    if (!session) return;

    const targetStore = stores.find(s => s.id === storeId);
    if (!targetStore) return;

    // Deduct medicine stock
    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          medicines: s.medicines.map(m => {
            if (m.id === medicine.id) {
              return { ...m, stock: Math.max(0, m.stock - quantity) };
            }
            return m;
          })
        };
      }
      return s;
    }));

    const newOrder: RequestOrder = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userEmail: session.email,
      userLocation: session.address,
      destinationLat: 17.4005,
      destinationLng: 78.4631,
      sourceType: 'store',
      sourceId: storeId,
      sourceName: targetStore.name,
      sourceLat: targetStore.lat,
      sourceLng: targetStore.lng,
      itemName: medicine.name,
      quantity: quantity,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString(),
    };

    setActiveOrder(newOrder);
    setDashboardTab('delivery');
  };

  // Status updates triggered by hospital, simulation or auto timers
  const updateOrderStatus = (orderId: string, status: RequestOrder['status'], rider?: Rider) => {
    setActiveOrder(prev => {
      if (!prev || prev.id !== orderId) return prev;
      return {
        ...prev,
        status,
        rider: rider || prev.rider,
      };
    });

    if (rider) {
      // Mark assigned rider as busy
      setRiders(prev => prev.map(r => r.id === rider.id ? { ...r, status: 'assigned' } : r));
    }
  };

  // Real-time animation callback indicating rider physically reached clinical destination
  const handleDeliveryComplete = () => {
    setActiveOrder(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'delivered'
      };
    });

    // Reset assigned riders to idle
    if (activeOrder?.rider) {
      setRiders(prev => prev.map(r => r.id === activeOrder.rider?.id ? { ...r, status: 'idle' } : r));
    }
  };

  // Reset order to clear screen
  const handleResetOrder = () => {
    setActiveOrder(null);
    setDashboardTab('hospitals');
    setIsAutopilot(false);
  };

  // Update Hospital Equipment stock from Inventory Management Panel
  const handleUpdateHospitalEquipment = (hospitalId: string, equipmentId: string, newAvailable: number, newTotal: number) => {
    setHospitals(prev => prev.map(h => {
      if (h.id === hospitalId) {
        return {
          ...h,
          equipment: h.equipment.map(eq => {
            if (eq.id === equipmentId) {
              const cleanAvailable = Math.max(0, Math.min(newTotal, newAvailable));
              return { ...eq, available: cleanAvailable, total: Math.max(eq.total, newTotal) };
            }
            return eq;
          })
        };
      }
      return h;
    }));
  };

  // Update Store Medicine stock from Inventory Management Panel
  const handleUpdateStoreMedicines = (storeId: string, medicineId: string, newStock: number, isAvailable: boolean) => {
    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          medicines: s.medicines.map(m => {
            if (m.id === medicineId) {
              const cleanStock = Math.max(0, newStock);
              return { ...m, stock: cleanStock, available: cleanStock > 0 ? isAvailable : false };
            }
            return m;
          })
        };
      }
      return s;
    }));
  };

  // Add Equipment to Hospital from Inventory Management Panel
  const handleAddEquipmentToHospital = (hospitalId: string, item: Omit<EquipmentItem, 'id'>) => {
    setHospitals(prev => prev.map(h => {
      if (h.id === hospitalId) {
        const newItem: EquipmentItem = {
          ...item,
          id: `eq-reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };
        return {
          ...h,
          equipment: [...h.equipment, newItem],
        };
      }
      return h;
    }));
  };

  // Add Medicine to Store from Inventory Management Panel
  const handleAddMedicineToStore = (storeId: string, item: Omit<MedicineItem, 'id'>) => {
    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        const newItem: MedicineItem = {
          ...item,
          id: `med-reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        };
        return {
          ...s,
          medicines: [...s.medicines, newItem],
        };
      }
      return s;
    }));
  };

  // Total unique inventory statistics counters
  const totalHospitalsRegistered = hospitals.length;
  const totalCriticalCylinders = hospitals.reduce((acc, h) => 
    acc + h.equipment.filter(eq => eq.category === 'Oxygen').reduce((s, item) => s + item.available, 0), 0
  );
  const totalMechanicalVentilators = hospitals.reduce((acc, h) => 
    acc + h.equipment.filter(eq => eq.category === 'Ventilator').reduce((s, item) => s + item.available, 0), 0
  );
  const totalBloodBags = hospitals.reduce((acc, h) => 
    acc + h.equipment.filter(eq => eq.category === 'Blood').reduce((s, item) => s + item.available, 0), 0
  );

  return (
    <div id="application-container" className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800 font-sans">
      
      {/* Dynamic top safety warning bar */}
      <div className="bg-rose-600 text-white py-2 px-4 shadow-sm text-xs font-mono font-bold flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>EMERGENCY DISPATCH CORRIDORS LIVE FOR PATIENT INVENTORY IN NEARBY CLINICS</span>
        </div>
        <span className="hidden sm:inline bg-rose-700 px-2 py-0.5 rounded text-[10px]">VER: 1.09-EMERGENCY</span>
      </div>

      {session ? (
        <>
          {/* Main logged-in Navigation header */}
          <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-shadow shadow-md">
                <Stethoscope className="w-5.5 h-5.5 text-emerald-100" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                  <span>MedSaviour</span>
                  <span className="text-[10px] bg-teal-50 border border-teal-100 text-teal-700 font-extrabold px-1.5 py-0.2 rounded-full uppercase">Live</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider">SECURE EMERGENCY NETWORK</p>
              </div>
            </div>

            {/* Quick stats and user action details */}
            <div className="flex items-center gap-4">
              {/* AI Triage Trigger Button in Header */}
              <button
                onClick={() => setIsAICopilotOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI Triage Copilot</span>
              </button>

              <div className="hidden lg:flex items-center gap-2 text-xs border-r border-slate-200 pr-4 text-slate-500">
                <span className="font-medium">Active Address:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[180px]" title={session.address}>
                  {session.address}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
                <div className="bg-teal-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono">
                  {session.username[0].toUpperCase()}
                </div>
                <div className="text-left leading-none pr-1">
                  <div className="text-[11px] font-bold text-slate-800">{session.username}</div>
                  <div className="text-[9px] text-slate-400 font-mono">PATIENT ACC</div>
                </div>
                <button
                  onClick={handleLogOut}
                  title="Sign Out Session"
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>

          {/* Dynamic Hero Section showing live network status stats panel */}
          <section className="bg-white border-b border-slate-100 py-6 px-6 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinics Available</div>
                  <div className="text-base font-extrabold text-slate-800 tracking-tight">{totalHospitalsRegistered} Connected</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 text-sky-500 rounded-xl">
                  <span className="text-sm font-bold font-mono">O₂</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blood/O₂ Tanks</div>
                  <div className="text-base font-extrabold text-slate-800 tracking-tight">{totalCriticalCylinders + totalBloodBags} units</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ICU Ventilators</div>
                  <div className="text-base font-extrabold text-slate-800 tracking-tight">{totalMechanicalVentilators} Available</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Logistics Dispatch</div>
                  <div className="text-base font-extrabold text-slate-800 tracking-tight">8.5 Mins</div>
                </div>
              </div>

            </div>
          </section>

          {/* Main layout container */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT MAIN CONTENT PANEL (Search, Lists or Active Route tracker) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* If no actively completed order, display live search filter panels */}
              {activeOrder?.status === 'delivered' ? (
                <EndPage order={activeOrder} onReset={handleResetOrder} />
              ) : (
                <>
                  {/* Dashboard toggle navigation */}
                  <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-1 sm:gap-0">
                    <button
                      onClick={() => setDashboardTab('hospitals')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer min-w-[140px] md:min-w-[0] ${
                        dashboardTab === 'hospitals' 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Nearby General Hospitals</span>
                    </button>

                    <button
                      onClick={() => setDashboardTab('stores')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer min-w-[140px] md:min-w-[0] ${
                        dashboardTab === 'stores' 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Wellness Medical Stores</span>
                    </button>

                    <button
                      onClick={() => setDashboardTab('inventory')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer min-w-[140px] md:min-w-[0] ${
                        dashboardTab === 'inventory' 
                          ? 'bg-teal-700 text-white shadow-md' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Facility & Pharmacy Stock Control</span>
                    </button>

                    {activeOrder && (
                      <button
                        onClick={() => setDashboardTab('delivery')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer min-w-[140px] md:min-w-[0] ${
                          dashboardTab === 'delivery' 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-600 hover:bg-slate-50 relative'
                        }`}
                      >
                        <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <Truck className="w-4 h-4" />
                        <span>Active Dispatch Map</span>
                      </button>
                    )}
                  </div>

                  {dashboardTab !== 'delivery' && dashboardTab !== 'inventory' && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base leading-tight">Live Medical Resource Inventory</h3>
                          <p className="text-xs text-slate-400 mt-1">Real-time status updates from hospital wards and pharmacy logs.</p>
                        </div>
                        
                        {/* Categorical quick filters */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {['All', 'Oxygen', 'Blood', 'Ventilator', 'Emergency'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => setActiveFilterCategory(cat)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                activeFilterCategory === cat
                                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                                  : 'bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder={
                            dashboardTab === 'hospitals'
                              ? "Search O2 Cylinders, specific blood groups (O-, AB+), Ventilators..."
                              : "Search medicine names like Remdesivir, Insulin, Albuterol..."
                          }
                          value={activeSearch}
                          onChange={(e) => setActiveSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all placeholder:text-slate-400 text-slate-800 bg-slate-50/50 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic grids and panels based on tab selection */}
                  <div>
                    {dashboardTab === 'hospitals' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hospitals.map(hosp => (
                          <HospitalCard 
                            key={hosp.id} 
                            hospital={hosp} 
                            onRequestItem={handleRequestEquipment} 
                            activeSearchQuery={activeSearch} 
                          />
                        ))}
                      </div>
                    )}

                    {dashboardTab === 'stores' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stores.map(store => (
                          <StoreCard 
                            key={store.id} 
                            store={store} 
                            onRequestMedicine={handleRequestMedicine}
                            onUpdateStock={handleUpdateStoreMedicines} 
                            activeSearchQuery={activeSearch} 
                          />
                        ))}
                      </div>
                    )}

                    {dashboardTab === 'inventory' && (
                      <InventoryManager 
                        hospitals={hospitals}
                        stores={stores}
                        onUpdateHospitalEquipment={handleUpdateHospitalEquipment}
                        onUpdateStoreMedicines={handleUpdateStoreMedicines}
                        onAddEquipmentToHospital={handleAddEquipmentToHospital}
                        onAddMedicineToStore={handleAddMedicineToStore}
                      />
                    )}

                    {dashboardTab === 'delivery' && activeOrder && (
                      <div className="space-y-6">
                        <MapRoute order={activeOrder} onDeliveryComplete={handleDeliveryComplete} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT SIDEBAR PANEL: Displays simulation logs, order pipeline steps, etc. */}
            <div className="lg:col-span-4 space-y-6">
              
              {activeOrder && activeOrder.status !== 'delivered' ? (
                <>
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></span>
                      <h3 className="font-bold text-slate-800 text-sm">Emergency Status Panel</h3>
                    </div>

                    <div className="text-xs text-slate-600 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-400">Order ID:</span>
                        <span className="font-mono font-semibold text-slate-800">#{activeOrder.id.slice(0, 10).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-400">Requested Item:</span>
                        <strong className="text-slate-800 font-bold">{activeOrder.itemName} ({activeOrder.quantity}x)</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-400">From Facility:</span>
                        <span className="font-semibold text-slate-800">{activeOrder.sourceName}</span>
                      </div>
                    </div>
                  </div>

                  <SimulationControls 
                    order={activeOrder} 
                    availableRiders={riders} 
                    onUpdateStatus={updateOrderStatus} 
                    onAutopilotToggle={() => setIsAutopilot(!isAutopilot)}
                    isAutopilotActive={isAutopilot}
                  />
                </>
              ) : (
                <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden border border-slate-800">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl"></div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>HOSPITAL DISPATCH GUIDANCE</span>
                  </div>

                  <h3 className="text-base font-bold tracking-tight">How to Borrow or Order</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Browse connected hospital stocks in the <strong className="text-white">Nearby General Hospitals</strong> tab. Place an immediate emergency borrow request for required items.
                  </p>
                  
                  <div className="mt-5 space-y-3.5 text-xs text-slate-400 border-t border-slate-800 pt-4">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold shrink-0">1</span>
                      <span>Fill in user location coordinates on registry.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold shrink-0">2</span>
                      <span>Search for items - O2 tanks, blood bags or medicines.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold shrink-0">3</span>
                      <span>Trigger simulation to let clinical administrators accept and assign riders.</span>
                    </div>
                  </div>
                </div>
              )}
              
            </div>

          </main>

          {/* Persistent global footer */}
          <footer className="bg-white border-t border-slate-100 py-6 px-6 text-center text-xs text-slate-400 shrink-0">
            <div className="flex justify-center items-center gap-1.5 font-semibold text-slate-500 mb-1">
              <HeartHandshake className="w-4 h-4 text-emerald-500" />
              <span>MedSaviour Logistics Core Engine</span>
            </div>
            <p className="font-mono">All rights reserved © 2026. Code 56-Emergency-Protocol.</p>
          </footer>

          {/* Floating AI Copilot Trigger Button */}
          <button
            onClick={() => setIsAICopilotOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full shadow-2xl shadow-cyan-600/50 border-2 border-white/20 flex items-center gap-2.5 transition transform hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="relative">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <span className="font-bold text-xs pr-1 hidden sm:inline">AI Emergency Copilot</span>
          </button>

          {/* AI Copilot Drawer Modal */}
          <AICopilot
            isOpen={isAICopilotOpen}
            onClose={() => setIsAICopilotOpen(false)}
            hospitals={hospitals}
            stores={stores}
            onInitiateDispatch={handleAICopilotDispatch}
          />
        </>
      ) : (
        /* Prompt for Registration of hospital or Patient / User initially */
        <div className="flex-1 flex items-center justify-center p-4 py-12 bg-gradient-to-tr from-slate-100 via-white to-slate-200">
          <RegistrationPortal 
            onUserRegister={handleUserRegister} 
            onHospitalRegister={handleHospitalRegister} 
            existingHospitals={hospitals} 
          />
        </div>
      )}

    </div>
  );
}
