
import React from 'react';
import { RouteOption, TransportType } from '../types';
import { ShieldCheck, Clock, Zap, AlertCircle } from 'lucide-react';

interface RouteCardProps {
  route: RouteOption;
  onBook: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onBook }) => {
  const getIcon = () => {
    switch (route.type) {
      case TransportType.BUS: return '🚌';
      case TransportType.TAXI: return '🚐';
      case TransportType.TRAIN: return '🚆';
      default: return '📍';
    }
  };

  const isTaxi = route.type === TransportType.TAXI;

  return (
    <div className={`bg-white rounded-[2rem] shadow-sm border p-6 space-y-5 transition-all active:scale-[0.98] ${isTaxi ? 'border-yellow-100' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${isTaxi ? 'bg-yellow-50' : 'bg-blue-50'}`}>
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 leading-none text-lg">{route.provider}</h3>
              {route.isSponsored && (
                <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100">Recommended</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase mt-1.5 tracking-widest">{route.type}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
             <span className="text-2xl font-black text-slate-900 leading-none">R{route.price}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Instant Ticket</p>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 border-y border-slate-50">
        <div className="flex items-center gap-2.5">
          <Clock size={16} className="text-blue-600" />
          <span className="text-sm font-black text-slate-900">{route.departureTime}</span>
        </div>
        <div className="flex-1 mx-6 h-[2px] bg-slate-100 relative">
          <div className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-3 text-[9px] font-black text-slate-300 uppercase whitespace-nowrap tracking-widest">
            {route.duration} Trip
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-[11px] font-black text-slate-500">{route.reliability}% Score</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {route.reliability < 85 ? (
          <div className="flex items-center gap-2 text-[10px] text-red-500 bg-red-50 px-4 py-2 rounded-full font-black uppercase tracking-wider">
             <AlertCircle size={14} /> Peak Delays
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full font-black uppercase tracking-wider">
             <Zap size={14} className="fill-emerald-600" /> Real-time Fast
          </div>
        )}
        <button 
          onClick={onBook}
          className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isTaxi ? 'bg-yellow-400 text-yellow-900 shadow-yellow-500/10' : 'bg-slate-900 text-white shadow-slate-900/10'}`}
        >
          Book Seat
        </button>
      </div>
    </div>
  );
};

export default RouteCard;
