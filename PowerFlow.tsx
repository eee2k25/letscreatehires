
import React from 'react';
import { Sun, Wind, Battery, Zap, Cpu } from 'lucide-react';
import { Telemetry, SystemMode } from '../types';
import { COLORS } from '../constants';

interface PowerFlowProps {
  telemetry: Telemetry;
  mode: SystemMode;
}

const PowerFlow: React.FC<PowerFlowProps> = ({ telemetry, mode }) => {
  const isSolarActive = telemetry.solar.p > 5;
  const isWindActive = telemetry.wind.p > 5;
  const isCharging = (telemetry.solar.p + telemetry.wind.p) > telemetry.load.active && telemetry.battery.soc < 100;

  return (
    <div className="relative w-full h-96 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Connection Paths */}
        {/* Solar to Inverter */}
        <path d="M 120 120 L 300 180" stroke={COLORS.solar} strokeWidth="2" fill="none" className={isSolarActive ? "animate-flow" : "opacity-20"} />
        {/* Wind to Inverter */}
        <path d="M 120 280 L 300 220" stroke={COLORS.wind} strokeWidth="2" fill="none" className={isWindActive ? "animate-flow" : "opacity-20"} />
        {/* Inverter to Load */}
        <path d="M 500 200 L 680 120" stroke={COLORS.load} strokeWidth="2" fill="none" className="animate-flow-fast" />
        {/* Inverter to Battery */}
        <path d="M 500 200 L 680 280" stroke={COLORS.battery} strokeWidth="2" fill="none" className={isCharging ? "animate-flow" : "opacity-20"} />
      </svg>

      <div className="relative z-10 grid grid-cols-3 gap-x-24 gap-y-16 items-center">
        {/* Left Side: Sources */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center group">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-500 ${isSolarActive ? 'bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
              <Sun className={isSolarActive ? "text-yellow-400" : "text-slate-500"} size={32} />
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-tighter text-yellow-500/80">Solar Array</span>
            <span className="text-xs font-mono">{telemetry.solar.p.toFixed(0)}W</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-500 ${isWindActive ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
              <Wind className={isWindActive ? "text-blue-400" : "text-slate-500"} size={32} />
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-tighter text-blue-500/80">Wind Turbine</span>
            <span className="text-xs font-mono">{telemetry.wind.p.toFixed(0)}W</span>
          </div>
        </div>

        {/* Center: Inverter/Brain */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-purple-600/20 flex items-center justify-center border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] relative">
            <div className="absolute inset-0 rounded-full border border-purple-400/30 animate-ping opacity-20" />
            <Cpu className="text-purple-400" size={40} />
          </div>
          <div className="mt-3 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">Smart Inverter</span>
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-1 rounded mt-1">
              <span className="text-[10px] font-mono text-purple-200">EFF: {telemetry.inverter.eff}%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Storage & Consumption */}
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center justify-center">
              <Zap className="text-red-400" size={32} />
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-tighter text-red-500/80">System Load</span>
            <span className="text-xs font-mono">{telemetry.load.active.toFixed(0)}W</span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border transition-all duration-500 ${telemetry.battery.soc > 20 ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}>
              <Battery className={telemetry.battery.soc > 20 ? "text-green-400" : "text-red-400"} size={32} />
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-tighter text-green-500/80">Storage</span>
            <span className="text-xs font-mono">{telemetry.battery.soc}% SOC</span>
          </div>
        </div>
      </div>

      {/* Floating Status Badge */}
      <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-800 rounded-full px-4 py-1 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-semibold text-slate-300 tracking-widest uppercase">{mode} ACTIVE</span>
      </div>
    </div>
  );
};

export default PowerFlow;
