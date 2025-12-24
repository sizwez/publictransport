
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Search, MapPin, Ticket as TicketIcon, User, 
  ArrowRight, CheckCircle2, X, Clock, Zap, Gift,
  ShieldAlert, Share2, Navigation, History, Trash2,
  ChevronRight, Settings, PhoneCall, HelpCircle
} from 'lucide-react';
import { getRouteSuggestions } from './services/geminiService';
import { RouteOption, Ticket, TransportType, Reward } from './types';
import RouteCard from './components/RouteCard';
import TaxiHub from './components/TaxiHub';

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', partner: 'Shoprite', deal: 'R10 Off Airtime', expiry: '2 days', icon: '🛍️' },
  { id: 'r2', partner: 'Debonairs', deal: 'Free Delivery', expiry: '5 days', icon: '🍕' },
  { id: 'r3', partner: 'Checkers', deal: 'Sixty60 Credit', expiry: '1 day', icon: '🛵' }
];

// --- Booking Modal ---
const BookingModal: React.FC<{ 
  route: RouteOption, 
  onClose: () => void, 
  onConfirm: (t: Ticket) => void 
}> = ({ route, onClose, onConfirm }) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');

  const handlePay = () => {
    setStep('payment');
    setTimeout(() => {
      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        routeId: route.id,
        provider: route.provider,
        from: 'Current Location',
        to: 'Destination',
        date: new Date().toLocaleDateString('en-ZA'),
        time: route.departureTime,
        price: route.price,
        type: route.type,
        qrCode: 'MZ-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        status: 'active'
      };
      onConfirm(newTicket);
      setStep('success');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="p-8 relative">
          {step !== 'success' && (
            <button onClick={onClose} aria-label="Close" className="absolute right-6 top-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900">
              <X size={20} />
            </button>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Secure Seat</h2>
                <p className="text-sm text-slate-500 font-medium">Instantly book via Capitec Pay or Card</p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Service</span>
                  <span className="font-bold text-slate-800">{route.provider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Departure</span>
                  <span className="font-bold text-slate-800">{route.departureTime}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 font-black text-lg">Total Cost</span>
                  <span className="text-2xl font-black text-blue-600">R{route.price}</span>
                </div>
              </div>
              <button 
                onClick={handlePay} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3"
              >
                Pay Now <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="py-16 flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="space-y-2">
                <p className="font-black text-slate-900 text-xl tracking-tight">Authenticating...</p>
                <p className="text-sm text-slate-400">Please check your Capitec App for the push notification.</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-10 text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={56} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Hooray!</h2>
                <p className="text-slate-500 font-medium px-8">Your ticket is active. Head to the Rank/Station soon!</p>
              </div>
              <button onClick={onClose} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform">
                Go to Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Home Screen ---
const HomeScreen: React.FC<{ onBook: (r: RouteOption) => void }> = ({ onBook }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RouteOption[]>([]);
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem('mzanigo_recent') || '[]'));
  const [showSos, setShowSos] = useState(false);

  const handleSearch = async (e?: React.FormEvent, overrideTo?: string) => {
    e?.preventDefault();
    const destination = overrideTo || to;
    if (!from || !destination) return;
    setLoading(true);
    
    const newRecent = Array.from(new Set([destination, ...recent])).slice(0, 5);
    setRecent(newRecent);
    localStorage.setItem('mzanigo_recent', JSON.stringify(newRecent));

    try {
      const routes = await getRouteSuggestions(from, destination);
      setResults(routes);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setRecent([]);
    localStorage.removeItem('mzanigo_recent');
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setFrom(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (My Location)`);
    }, () => alert("Permission denied."));
  };

  return (
    <div className="space-y-8 pb-8">
      {showSos && (
        <div className="fixed inset-0 z-[200] bg-red-600 flex flex-col items-center justify-center p-12 text-white text-center animate-in fade-in duration-300">
           <ShieldAlert size={120} className="mb-8 animate-bounce" />
           <h2 className="text-4xl font-black mb-4 uppercase italic">Distress Alert</h2>
           <p className="text-xl mb-12 opacity-90">Sending location to SAPS & Emergency Contacts in 5 seconds...</p>
           <button onClick={() => setShowSos(false)} className="bg-white text-red-600 px-12 py-5 rounded-3xl font-black uppercase text-lg">Cancel Now</button>
        </div>
      )}

      <header className="py-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Mzani<span className="text-blue-600">Go</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">SA Commuter Network</p>
        </div>
        <button 
          onClick={() => setShowSos(true)} 
          className="bg-red-50 text-red-600 w-14 h-14 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-red-500/10 active:scale-90 transition-transform"
          aria-label="SOS Emergency"
        >
          <ShieldAlert size={28} />
        </button>
      </header>

      <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex justify-between items-center overflow-hidden">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Fuel Price:</span>
        </div>
        <div className="text-xs font-bold">Inland 95: <span className="text-yellow-400">R24.88/L</span></div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 no-scrollbar">
        {INITIAL_REWARDS.map(reward => (
          <div key={reward.id} className="min-w-[220px] bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:bg-blue-50">
              {reward.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-blue-600 leading-none mb-1">{reward.partner}</p>
              <p className="text-sm font-black text-slate-800 leading-tight">{reward.deal}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-slate-100 space-y-4">
        <div className="space-y-3">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600">
               <MapPin size={18} />
            </div>
            <input 
              type="text" 
              placeholder="From: e.g. Noord Street" 
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              value={from} onChange={e => setFrom(e.target.value)}
            />
            <button type="button" onClick={useMyLocation} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:scale-110 transition-transform">
              <Navigation size={20} />
            </button>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600">
               <MapPin size={18} className="text-red-400" />
            </div>
            <input 
              type="text" 
              placeholder="To: e.g. Sandton City" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              value={to} onChange={e => setTo(e.target.value)}
            />
          </div>
        </div>
        <button 
          className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
             </div>
          ) : <><Search size={20}/> Plan My Trip</>}
        </button>
      </form>

      {recent.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <History size={12}/> Recents
            </h3>
            <button onClick={clearHistory} className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1 hover:underline">
               <Trash2 size={10}/> Clear
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
            {recent.map((place, i) => (
              <button 
                key={i} 
                onClick={() => { setTo(place); handleSearch(undefined, place); }} 
                className="whitespace-nowrap bg-white px-5 py-3 rounded-full border border-slate-100 text-[11px] font-black text-slate-700 hover:border-blue-600 transition-colors shadow-sm"
              >
                {place}
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 px-1">
             <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
             <h2 className="font-black text-slate-900 text-lg tracking-tight">Best Routes</h2>
          </div>
          <div className="grid gap-5">
            {results.map(r => <RouteCard key={r.id} route={r} onBook={() => onBook(r)} />)}
          </div>
        </div>
      )}

      <TaxiHub />
    </div>
  );
};

// --- Wallet Screen ---
const TicketsScreen: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  return (
    <div className="space-y-8 py-4">
       <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Wallet</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Scan QR code when boarding</p>
      </header>

      {tickets.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
            <TicketIcon size={48} />
          </div>
          <div className="space-y-2">
            <p className="text-slate-800 font-black text-lg">No active trips</p>
            <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Book a ride to see your digital tickets here.</p>
          </div>
          <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Plan a Trip</Link>
        </div>
      ) : (
        <div className="space-y-6 pb-24">
          {tickets.map(t => (
            <div key={t.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden group">
              <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-xs font-black uppercase tracking-widest">{t.provider}</span>
                </div>
                <button 
                  onClick={() => alert(`Sharing Trip ${t.id} with your Safety Contacts...`)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors"
                  aria-label="Share Trip"
                >
                  <Share2 size={16} />
                </button>
              </div>
              <div className="p-8 flex justify-between items-start">
                <div className="space-y-6 text-left">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">To Destination</p>
                    <p className="text-xl font-black text-slate-900 leading-tight">{t.to}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Date</p>
                      <p className="text-sm font-bold text-slate-800">{t.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Time</p>
                      <p className="text-sm font-bold text-slate-800">{t.time}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                      <div className="grid grid-cols-4 gap-1.5">
                        {[...Array(16)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-sm ${Math.random() > 0.3 ? 'bg-slate-900' : 'bg-slate-200'}`} />)}
                      </div>
                   </div>
                   <span className="text-[9px] font-mono font-bold text-slate-400 tracking-tighter uppercase">{t.id}</span>
                </div>
              </div>
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button className="flex items-center gap-2 text-blue-600 font-black text-[11px] uppercase tracking-wider">
                  <Clock size={14} /> Tracking On Map
                </button>
                <div className="text-[11px] font-black text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 uppercase">
                  R{t.price} Paid
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Profile Screen ---
const ProfileScreen: React.FC = () => {
  return (
    <div className="space-y-8 py-4">
       <header className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900">Account</h1>
        <button className="p-2 bg-slate-100 rounded-full" aria-label="Settings"><Settings size={20} className="text-slate-600" /></button>
      </header>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm">
        <div className="relative">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/20">
            SM
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
        </div>
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-900 leading-none">Sipho Mokoena</h2>
          <div className="flex items-center gap-2 mt-2">
             <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Gold Member</span>
             <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Johannesburg</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center space-y-1">
           <p className="text-3xl font-black text-blue-600">1,240</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MzansiPoints</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center space-y-1">
           <p className="text-3xl font-black text-emerald-600">12.4</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CO2 Saved (kg)</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
        {[
          { icon: <History size={18} />, label: "Trip History" },
          { icon: <PhoneCall size={18} />, label: "Safety Contacts" },
          { icon: <HelpCircle size={18} />, label: "Support & Help" },
        ].map((item, idx) => (
          <button key={idx} className="w-full px-6 py-5 flex justify-between items-center hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-4">
               <div className="text-slate-400 group-hover:text-blue-600 transition-colors">{item.icon}</div>
               <span className="text-sm font-bold text-slate-800">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        ))}
      </div>

      <div className="py-6 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">MzaniGo v2.5.0 • Made with ❤️ in SA</p>
      </div>
    </div>
  );
};

// --- App Wrapper ---
const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('mzanigo_tickets');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('mzanigo_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = (t: Ticket) => {
    setTickets(prev => [t, ...prev]);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative flex flex-col shadow-2xl overflow-hidden font-sans selection:bg-blue-100">
      <main className="flex-1 px-5 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomeScreen onBook={setSelectedRoute} />} />
          <Route path="/tickets" element={<TicketsScreen tickets={tickets} />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </main>

      {selectedRoute && (
        <BookingModal route={selectedRoute} onClose={() => setSelectedRoute(null)} onConfirm={addTicket} />
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-slate-100 py-5 px-10 flex justify-between items-center z-[80]">
        <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'text-blue-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
          <Search size={24} strokeWidth={isActive('/') ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Explore</span>
        </Link>
        <Link to="/tickets" className={`flex flex-col items-center gap-1 transition-all ${isActive('/tickets') ? 'text-blue-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
          <TicketIcon size={24} strokeWidth={isActive('/tickets') ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Wallet</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center gap-1 transition-all ${isActive('/profile') ? 'text-blue-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
          <User size={24} strokeWidth={isActive('/profile') ? 3 : 2} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Account</span>
        </Link>
      </nav>
    </div>
  );
};

export default App;
