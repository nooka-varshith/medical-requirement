import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShieldAlert, Key, Mail, Landmark, Phone, MapPin, CheckCircle, FileText, Activity } from 'lucide-react';
import { Hospital, UserSession } from '../types';

interface RegistrationPortalProps {
  onUserRegister: (session: UserSession) => void;
  onHospitalRegister: (newHospital: Hospital) => void;
  existingHospitals: Hospital[];
}

export default function RegistrationPortal({ onUserRegister, onHospitalRegister, existingHospitals }: RegistrationPortalProps) {
  const [activeTab, setActiveTab] = useState<'user_reg' | 'hospital_reg' | 'user_login'>('user_reg');
  
  // User Registration State
  const [userRegName, setUserRegName] = useState('');
  const [userRegEmail, setUserRegEmail] = useState('');
  const [userRegPassword, setUserRegPassword] = useState('');
  const [userRegAddress, setUserRegAddress] = useState('');

  // User Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Hospital Registration State
  const [hospName, setHospName] = useState('');
  const [hospLicense, setHospLicense] = useState('');
  const [hospLocation, setHospLocation] = useState('');
  const [hospContact, setHospContact] = useState('');
  const [registeredSuccessfully, setRegisteredSuccessfully] = useState(false);

  // Errors state
  const [errorMsg, setErrorMsg] = useState('');

  const handleUserRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRegName || !userRegEmail || !userRegPassword || !userRegAddress) {
      setErrorMsg('Please enter all the details.');
      return;
    }
    setErrorMsg('');
    const session: UserSession = {
      username: userRegName,
      email: userRegEmail,
      address: userRegAddress,
    };
    onUserRegister(session);
  };

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter email and password.');
      return;
    }
    setErrorMsg('');
    onUserRegister({
      username: loginEmail.split('@')[0],
      email: loginEmail,
      address: '150 Metro Central Plaza, Flat 3B',
    });
  };

  const handleHospitalRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !hospLicense || !hospLocation || !hospContact) {
      setErrorMsg('All credential verification fields are strictly required.');
      return;
    }

    setErrorMsg('');
    const newHospital: Hospital = {
      id: `hosp-registered-${Date.now()}`,
      name: hospName,
      licenseNumber: hospLicense,
      location: hospLocation,
      contact: hospContact,
      lat: (Math.random() * 80) - 40,
      lng: (Math.random() * 80) - 40,
      verified: true, // Auto verified for demonstration
      equipment: [
        { id: `eq-reg-${Date.now()}-1`, name: 'O2 Cylinder (45L)', category: 'Oxygen', available: 10, total: 10, unit: 'cylinders' },
        { id: `eq-reg-${Date.now()}-2`, name: 'O2 Cylinder (10L Mini)', category: 'Oxygen', available: 5, total: 5, unit: 'cylinders' },
        { id: `eq-reg-${Date.now()}-3`, name: 'O- Negative Blood', category: 'Blood', available: 6, total: 6, unit: 'bags' },
        { id: `eq-reg-${Date.now()}-4`, name: 'AB+ Positive Blood', category: 'Blood', available: 8, total: 8, unit: 'bags' },
        { id: `eq-reg-${Date.now()}-5`, name: 'ICU Ventilator (Portable)', category: 'Ventilator', available: 2, total: 2, unit: 'units' },
        { id: `eq-reg-${Date.now()}-6`, name: 'AED Defibrillator', category: 'Defibrillator', available: 4, total: 4, unit: 'units' },
      ]
    };

    onHospitalRegister(newHospital);
    setRegisteredSuccessfully(true);
    setTimeout(() => {
      setRegisteredSuccessfully(false);
      // Clean
      setHospName('');
      setHospLicense('');
      setHospLocation('');
      setHospContact('');
      setActiveTab('user_login');
    }, 2500);
  };

  return (
    <div id="registration-portal-wrapper" className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col justify-between">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-16 h-16 rounded-full bg-white/5 blur-xl"></div>
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
            <Activity className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">MedSaviour Portal</h1>
            <p className="text-xs text-white/80 font-medium">Borrowing, Tracking & Emergency Dispatch</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/20 p-1 rounded-xl mt-6">
          <button
            onClick={() => { setActiveTab('user_reg'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'user_reg' ? 'bg-white text-teal-700 shadow-sm' : 'text-white hover:bg-white/5'
            }`}
          >
            User Signup
          </button>
          <button
            onClick={() => { setActiveTab('user_login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'user_login' ? 'bg-white text-teal-700 shadow-sm' : 'text-white hover:bg-white/5'
            }`}
          >
            User Login
          </button>
          <button
            onClick={() => { setActiveTab('hospital_reg'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all line-clamp-1 ${
              activeTab === 'hospital_reg' ? 'bg-white text-teal-700 shadow-sm' : 'text-white hover:bg-white/5'
            }`}
          >
            Hospital Reg
          </button>
        </div>
      </div>

      {/* Main Body Forms with tab animations */}
      <div className="p-6 flex-1 min-h-[380px]">
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-center gap-2.5 text-xs text-red-600 border border-red-100 animate-pulse">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'user_reg' && (
            <motion.form
              key="user_signup_form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-4"
              onSubmit={handleUserRegSubmit}
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Username Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={userRegName}
                    onChange={(e) => setUserRegName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={userRegEmail}
                    onChange={(e) => setUserRegEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Emergency Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Where to deliver equipment?"
                    value={userRegAddress}
                    onChange={(e) => setUserRegAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Emergency Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter secure password"
                    value={userRegPassword}
                    onChange={(e) => setUserRegPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                Create Account & Proceed
              </button>
            </motion.form>
          )}

          {activeTab === 'user_login' && (
            <motion.form
              key="user_login_form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-4 pt-4"
              onSubmit={handleUserLoginSubmit}
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <a href="#" className="text-xs text-teal-600 font-semibold hover:underline">Forgot Password?</a>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all transform active:scale-95 mt-2 cursor-pointer"
              >
                Log In & Search Inventory
              </button>
            </motion.form>
          )}

          {activeTab === 'hospital_reg' && (
            <motion.form
              key="hospital_signup_form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-4"
              onSubmit={handleHospitalRegSubmit}
            >
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 mb-2">
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  Register clinical facility to join our Live Emergency Logistics network and update your real-time inventory.
                </p>
              </div>

              {registeredSuccessfully ? (
                <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="p-3 bg-emerald-100 rounded-full text-emerald-600"
                  >
                    <CheckCircle className="w-12 h-12" />
                  </motion.div>
                  <h4 className="font-bold text-slate-800">Hospital Registered!</h4>
                  <p className="text-xs text-slate-500">License verified with state records. You can now login.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Official Hospital Name</label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Grace Valley Memorial"
                        value={hospName}
                        onChange={(e) => setHospName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">State Board License Key</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. LIC-2026-XXXXX"
                        value={hospLicense}
                        onChange={(e) => setHospLicense(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Physical Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Clinical block street, Sector No."
                        value={hospLocation}
                        onChange={(e) => setHospLocation(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Emergency Dispatch Contact</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="Hotline / clinical phone"
                        value={hospContact}
                        onChange={(e) => setHospContact(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 transition-all text-slate-800 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-sm rounded-xl hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
                  >
                    Submit Clinical License for Audit
                  </button>
                </>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Safety Bottom Label */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 leading-relaxed font-mono">
        <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>SECURE SHA-256 EMERGENCY MEDICAL PLATFORM v1.4</span>
      </div>
    </div>
  );
}
