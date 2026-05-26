import React from 'react';
import { FaBagShopping, FaStore, FaEye, FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';

export default function SellerAnalytics() {
  
  // Custom Earnings Line Data mapped to SVG coordinates (X, Y)
  // X points represent weeks: 1, 2, 3, 4, 5, 6, 7
  // Y points represent earnings: mapped to height coordinates
  const svgWidth = 500;
  const svgHeight = 200;
  const pathPoints = "0,150 83,140 166,110 249,120 332,60 415,80 500,20";
  const areaPoints = "0,150 83,140 166,110 249,120 332,60 415,80 500,20 500,200 0,200";

  const trafficSources = [
    { label: 'SuperX Ad Boosted', value: '48%', color: 'bg-cyan-400' },
    { label: 'OLX Organic Feed', value: '32%', color: 'bg-blue-500' },
    { label: 'Google Search Traffic', value: '12%', color: 'bg-indigo-500' },
    { label: 'Direct Shares', value: '8%', color: 'bg-slate-600' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-extrabold text-white">📈 Store Analytics</h2>
        <p className="text-xs text-slate-400">Track earnings, traffic sources, and listing performance metrics.</p>
      </div>

      {/* Grid: SVG Earnings Line Chart and Target Radial Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Earnings Trend */}
        <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-[#060b1e]/85 backdrop-blur-xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Earnings Analytics</span>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <span>₹1,42,000 Total Sales</span>
                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <FaArrowTrendUp /> +18.5%
                </span>
              </h3>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 text-[9px] font-bold rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">Weekly</span>
              <span className="px-2.5 py-1 text-[9px] font-bold rounded-md bg-white/5 border border-white/5 text-slate-500">Monthly</span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="relative pt-4 w-full">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-44 overflow-visible"
            >
              <defs>
                {/* Gradient for Earnings Fill */}
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                {/* Gradient for Line stroke */}
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3" />

              {/* Shaded Area */}
              <polygon points={areaPoints} fill="url(#chartGradient)" />

              {/* Earnings Path Line */}
              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3.5"
                points={pathPoints}
              />

              {/* Pulsing Highlight dot */}
              <circle cx="500" cy="20" r="6" fill="#6366f1" className="animate-pulse" />
              <circle cx="500" cy="20" r="1.5" fill="#ffffff" />
            </svg>
            
            {/* Week Labels */}
            <div className="flex justify-between text-[9px] text-slate-500 font-bold px-1.5 pt-2 border-t border-white/5">
              <span>Wk 1</span>
              <span>Wk 2</span>
              <span>Wk 3</span>
              <span>Wk 4</span>
              <span>Wk 5</span>
              <span>Wk 6</span>
              <span>Wk 7 (Current)</span>
            </div>
          </div>
        </div>

        {/* Conversion Radial Targets */}
        <div className="rounded-3xl border border-white/5 bg-[#060b1e]/85 backdrop-blur-xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Conversion Goal</span>
            <h3 className="text-base font-extrabold text-slate-100">82% Sales Target</h3>
          </div>

          {/* SVG Circular arc */}
          <div className="py-4 flex items-center justify-center relative">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="transparent"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="transparent"
                stroke="url(#lineGradient)"
                strokeWidth="10"
                strokeDasharray={282.6}
                strokeDashoffset={282.6 * (1 - 0.82)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-white">82%</span>
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Complete</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-center font-medium leading-relaxed">
            Highly optimized. 4 out of 5 buyer inquiries lead to successful local escrow handshakes.
          </p>
        </div>

      </div>

      {/* Traffic source indicators and detailed logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Traffic Channels */}
        <div className="rounded-3xl border border-white/5 bg-[#060b1e]/85 backdrop-blur-xl p-5 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-sm tracking-wide text-slate-200">Lead Traffic Origin</h3>
          
          <div className="space-y-3.5">
            {trafficSources.map((source, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-300">{source.label}</span>
                  <span className="text-cyan-400">{source.value}</span>
                </div>
                {/* Progress bar container */}
                <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full ${source.color}`} 
                    style={{ width: source.value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ESCROW Health Index */}
        <div className="rounded-3xl border border-white/5 bg-[#060b1e]/85 backdrop-blur-xl p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-black tracking-wider uppercase">Security & Reliability</span>
            <h3 className="font-extrabold text-sm text-slate-200">SuperX Trust Metrics</h3>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
              <span className="text-xs font-bold">Seller Escrow Score</span>
              <span className="text-sm font-black">98.5% (Excellent)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400">
              <span className="text-xs font-bold">Safe Zones Compliancy</span>
              <span className="text-sm font-black">100% Verified</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
              <span className="text-xs font-bold">AI Fraud False Alerts</span>
              <span className="text-sm font-black">0% Risk</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
