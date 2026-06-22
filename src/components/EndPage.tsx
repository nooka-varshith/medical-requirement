import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, HeartHandshake, ShieldCheck, RefreshCw, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { RequestOrder } from '../types';

interface EndPageProps {
  order: RequestOrder;
  onReset: () => void;
}

export default function EndPage({ order, onReset }: EndPageProps) {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-teal-500/5 blur-3xl"></div>

      <div className="flex flex-col items-center">
        {/* Checkmark icon with ring waves */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-100 rounded-full scale-[1.3] animate-pulse"></div>
          <div className="absolute inset-0 bg-emerald-200 rounded-full scale-[1.1] opacity-70"></div>
          <div className="relative p-4 bg-emerald-500 text-white rounded-full shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Successfully Delivered!</h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">Your critical resource has arrived safely at your coordinates.</p>
        
        {/* Certificate Shield badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-lg uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Dispatch Protocol Secure</span>
        </div>

        {/* Handoff Receipt card Details */}
        <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-100 w-full text-left space-y-3">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 flex justify-between items-center">
            <span>OFFICIAL DISPATCH RECEIPT</span>
            <span className="text-slate-500">#{order.id.slice(0, 10).toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="block text-slate-400 font-medium text-[10px] uppercase">Allocated Item</span>
              <strong className="text-slate-800 font-bold">{order.itemName} ({order.quantity} units)</strong>
            </div>
            
            <div>
              <span className="block text-slate-400 font-medium text-[10px] uppercase">Service Facility</span>
              <strong className="text-slate-800 font-semibold">{order.sourceName}</strong>
            </div>

            <div className="col-span-2">
              <span className="block text-slate-400 font-medium text-[10px] uppercase">Receipt Coordinate</span>
              <strong className="text-slate-800 font-semibold truncate block max-w-full">{order.userLocation}</strong>
            </div>

            <div>
              <span className="block text-slate-400 font-medium text-[10px] uppercase">Handled By Fleet Rider</span>
              <strong className="text-slate-800 font-semibold">{order.rider?.name || 'Emergency Team'}</strong>
            </div>

            <div>
              <span className="block text-slate-400 font-medium text-[10px] uppercase">Fulfillment Status</span>
              <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                HANDOVER VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Brand visual appreciation */}
        <div className="mt-10 mb-8 max-w-sm">
          <HeartHandshake className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
          <h3 className="font-bold text-slate-800 text-sm mt-3">Thank you for choosing MedSaviour!</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Our mission is making hospital resource-sharing transparent to protect lives. Tell your medical administrator to connect their stocks.
          </p>
        </div>

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:from-teal-700 hover:to-emerald-700 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New Emergency Search</span>
        </button>
      </div>
    </div>
  );
}
