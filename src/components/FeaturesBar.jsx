import React from 'react';
import { FaShieldHalved, FaRobot, FaHandshake } from 'react-icons/fa6';

export default function FeaturesBar() {
  return (
    <div className="w-full max-w-[440px] md:max-w-none flex flex-wrap gap-2 justify-center items-center py-2 px-3 mb-4 rounded-xl border border-cyan-500/10 bg-slate-950/40 backdrop-blur-md">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
        <FaShieldHalved className="text-[11px]" />
        <span>Govt ID Verified</span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
        <FaRobot className="text-[11px]" />
        <span>AI Scam Detection</span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.05)]">
        <FaHandshake className="text-[11px]" />
        <span>Safe Meeting Zones</span>
      </div>
    </div>
  );
}
