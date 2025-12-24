
import React, { useState } from 'react';
import { getTaxiAdvice } from '../services/geminiService';
import { Info } from 'lucide-react';

const TaxiHub: React.FC = () => {
  const [location, setLocation] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (!location) return;
    setLoading(true);
    try {
      const result = await getTaxiAdvice(location);
      setAdvice(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center text-xl shadow-sm">🚐</div>
        <div>
          <h2 className="text-lg font-bold text-yellow-900 leading-tight">Minibus Guide</h2>
          <p className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider">Informal Sector Assistant</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Nearest Rank / Area"
            className="flex-1 bg-white border border-yellow-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
          />
          <button 
            onClick={handleGetAdvice}
            disabled={loading}
            className="bg-yellow-900 text-white px-5 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>

        {advice ? (
          <div className="bg-white rounded-2xl p-4 border border-yellow-100 animate-in zoom-in-95 duration-200">
            <p className="text-xs text-slate-700 whitespace-pre-wrap italic leading-relaxed">
              "{advice}"
            </p>
            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-2">
               <div className="bg-yellow-50 px-2 py-1 rounded-md flex items-center gap-2 border border-yellow-100">
                  <span className="text-sm">☝️</span>
                  <span className="text-[9px] font-black text-yellow-800">TOWN / CBD</span>
               </div>
               <div className="bg-yellow-50 px-2 py-1 rounded-md flex items-center gap-2 border border-yellow-100">
                  <span className="text-sm">✋</span>
                  <span className="text-[9px] font-black text-yellow-800">LOCAL STOP</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-yellow-100/50 p-3 rounded-2xl">
            <Info size={14} className="text-yellow-700 mt-0.5" />
            <p className="text-[10px] text-yellow-800 leading-tight">
              Enter your location to get rank info, hand signs, and local safety tips for the informal taxi network.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxiHub;
