
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Sun, Wind, Battery, Zap, Activity, ShieldCheck, 
  Settings, AlertTriangle, RefreshCw, Power, Thermometer,
  CloudLightning, BarChart3, Menu, Bell, Search, Cpu, MessageSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Telemetry, HistoryPoint, SystemMode } from './types';
import { COLORS, INITIAL_TELEMETRY } from './constants';
import { analyzeSystemEfficiency } from './services/geminiService';
import StatCard from './components/StatCard';
import PowerFlow from './components/PowerFlow';

const App: React.FC = () => {
  const [telemetry, setTelemetry] = useState<Telemetry>(INITIAL_TELEMETRY);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [systemMode, setSystemMode] = useState<SystemMode>(SystemMode.HYBRID);
  const [aiAdvice, setAiAdvice] = useState<string>("Initializing system advisor...");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastAdviceUpdate, setLastAdviceUpdate] = useState<number>(0);

  // Simulation Logic
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTelemetry(prev => {
        // Random walk for values to simulate real fluctuations
        const deltaSolar = (Math.random() - 0.5) * 4;
        const deltaWind = (Math.random() - 0.5) * 6;
        const deltaLoad = (Math.random() - 0.4) * 5; // Slight bias towards higher load

        const newSolarP = Math.max(0, prev.solar.p + deltaSolar);
        const newWindP = Math.max(0, prev.wind.p + deltaWind);
        const newLoadP = Math.max(10, prev.load.active + deltaLoad);

        // Simple battery logic: excess power charges, deficit discharges
        const totalGen = newSolarP + newWindP;
        const balance = totalGen - newLoadP;
        const deltaSoc = balance * 0.001;
        const newSoc = Math.min(100, Math.max(0, prev.battery.soc + deltaSoc));

        const newTelemetry = {
          ...prev,
          solar: { ...prev.solar, p: newSolarP, irr: Math.max(0, prev.solar.irr! + deltaSolar * 5) },
          wind: { ...prev.wind, p: newWindP, speed: Math.max(0, prev.wind.speed! + deltaWind * 0.2) },
          battery: { 
            ...prev.battery, 
            soc: newSoc,
            status: balance > 0 ? 'Charging' : balance < -5 ? 'Discharging' : 'Idle'
          },
          load: { ...prev.load, active: newLoadP },
          timestamp: Date.now()
        };

        // Add to history
        setHistory(h => [
          ...h.slice(-29),
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            solarP: Number(newSolarP.toFixed(1)),
            windP: Number(newWindP.toFixed(1)),
            loadP: Number(newLoadP.toFixed(1)),
            batterySoc: Number(newSoc.toFixed(1))
          }
        ]);

        return newTelemetry;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // AI Advisor Call
  const triggerAiUpdate = useCallback(async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    const advice = await analyzeSystemEfficiency(telemetry);
    setAiAdvice(advice);
    setLastAdviceUpdate(Date.now());
    setIsAiLoading(false);
  }, [telemetry, isAiLoading]);

  // Update AI every 30 seconds or on first load
  useEffect(() => {
    const now = Date.now();
    if (now - lastAdviceUpdate > 30000 || lastAdviceUpdate === 0) {
      triggerAiUpdate();
    }
  }, [triggerAiUpdate, lastAdviceUpdate]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Zap className="text-yellow-400" fill="currentColor" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                HREMS <span className="text-slate-500 font-normal text-sm">v1.2.0-PROD</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Twin Active</span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            {['Overview', 'Storage', 'Sensors', 'Reports', 'Settings'].map(item => (
              <button key={item} className="px-5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 mr-4 px-4 border-r border-slate-800">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Uptime</p>
                <p className="text-xs font-mono">14d 05h 22m</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800">
              <Bell size={18} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/10" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Dashboard Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Production" value={(telemetry.solar.p + telemetry.wind.p).toFixed(1)} unit="W" icon={Activity} color={COLORS.inverter} trend={2.4} />
            <StatCard title="Solar Peak" value={telemetry.solar.p.toFixed(1)} unit="W" icon={Sun} color={COLORS.solar} trend={-1.2} />
            <StatCard title="Wind Yield" value={telemetry.wind.p.toFixed(1)} unit="W" icon={Wind} color={COLORS.wind} trend={5.8} />
            <StatCard title="Load Demand" value={telemetry.load.active.toFixed(1)} unit="W" icon={Zap} color={COLORS.load} trend={0.5} />
          </div>

          {/* Visualization Block */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Cpu size={16} /> Energy Distribution Flow
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`text-[10px] font-bold px-3 py-1 rounded border transition-all ${isSimulating ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {isSimulating ? 'SYNC: LIVE SIM' : 'SYNC: HARDWARE'}
                </button>
              </div>
            </div>
            <PowerFlow telemetry={telemetry} mode={systemMode} />
          </section>

          {/* Charts Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-bold">Generation vs Demand</h3>
                  <p className="text-xs text-slate-500">Real-time power curve analysis (2s sampling)</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400">Total Generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold text-slate-400">Total Demand</span>
                  </div>
               </div>
             </div>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={history}>
                    <defs>
                      <linearGradient id="genColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="loadColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `${val}W`} domain={[0, 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey={(p) => p.solarP + p.windP} stroke="#3B82F6" fillOpacity={1} fill="url(#genColor)" strokeWidth={2} />
                    <Area type="monotone" dataKey="loadP" stroke="#EF4444" fillOpacity={1} fill="url(#loadColor)" strokeWidth={2} strokeDasharray="5 5" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Advisor Card */}
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cpu size={120} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-400 uppercase tracking-widest">
                <MessageSquare size={16} /> Gemini Energy Advisor
              </h3>
              {isAiLoading && <RefreshCw size={14} className="animate-spin text-indigo-400" />}
            </div>
            <div className="min-h-[80px]">
              <p className="text-sm text-indigo-100/90 leading-relaxed italic">
                "{aiAdvice}"
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-500/10 flex justify-between items-center">
               <span className="text-[10px] text-indigo-400 font-mono">Model: gemini-3-flash</span>
               <button 
                 onClick={triggerAiUpdate}
                 className="text-[10px] font-bold text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-500 transition-colors"
                >
                 Refresh Analysis
               </button>
            </div>
          </div>

          {/* System Control Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
               <Settings size={16} /> Dispatch Controls
             </h3>
             <div className="grid grid-cols-2 gap-3">
               <button 
                  onClick={() => setSystemMode(SystemMode.HYBRID)}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${systemMode === SystemMode.HYBRID ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                >
                 <RefreshCw size={20} />
                 <span className="text-[10px] font-bold uppercase">Hybrid Mode</span>
               </button>
               <button 
                  onClick={() => setSystemMode(SystemMode.ECO_MODE)}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${systemMode === SystemMode.ECO_MODE ? 'bg-green-600/10 border-green-500 text-green-400' : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                >
                 <ShieldCheck size={20} />
                 <span className="text-[10px] font-bold uppercase">Eco Optimize</span>
               </button>
               <button className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-white flex flex-col items-center gap-2 transition-all">
                 <CloudLightning size={20} className="text-blue-400" />
                 <span className="text-[10px] font-bold uppercase">Priority Load</span>
               </button>
               <button className="p-4 rounded-xl border border-red-900/50 bg-red-900/10 text-red-400 hover:bg-red-900/20 flex flex-col items-center gap-2 transition-all">
                 <Power size={20} />
                 <span className="text-[10px] font-bold uppercase">Master Trip</span>
               </button>
             </div>
          </div>

          {/* Environmental Conditions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
               <Thermometer size={16} /> Site Environment
             </h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                 <div className="flex items-center gap-3">
                   <Sun size={14} className="text-yellow-400" />
                   <span className="text-xs text-slate-400">Irradiance</span>
                 </div>
                 <span className="text-sm font-mono text-white">{telemetry.solar.irr?.toFixed(0)} <span className="text-[10px] text-slate-500">W/m²</span></span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                 <div className="flex items-center gap-3">
                   <Wind size={14} className="text-blue-400" />
                   <span className="text-xs text-slate-400">Wind Speed</span>
                 </div>
                 <span className="text-sm font-mono text-white">{telemetry.wind.speed?.toFixed(1)} <span className="text-[10px] text-slate-500">m/s</span></span>
               </div>
               <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                 <div className="flex items-center gap-3">
                   <Thermometer size={14} className="text-orange-400" />
                   <span className="text-xs text-slate-400">Panel Temp</span>
                 </div>
                 <span className="text-sm font-mono text-white">{telemetry.solar.temp?.toFixed(1)} <span className="text-[10px] text-slate-500">°C</span></span>
               </div>
             </div>

             <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
               <AlertTriangle className="text-amber-500 shrink-0" size={18} />
               <div>
                 <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Advisory</h4>
                 <p className="text-[11px] text-amber-200/70 mt-1 leading-relaxed">
                   Atmospheric pressure dropping. Wind generation expected to spike in approx. 45 minutes. Ensure battery reserve at 40%.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 bg-slate-950 border-t border-slate-800 mt-10">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-medium">
          <p>© 2024 Hybrid Renewable Energy Management System • Dept. of Electrical Engineering</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Latency: 12ms
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              API Status: Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
