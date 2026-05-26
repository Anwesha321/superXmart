import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBagShopping, FaStore, FaEye, FaComment, FaCommentDots, FaBolt, FaArrowRight, FaArrowTrendUp, FaPen, FaTrash } from 'react-icons/fa6';

export default function SellerDashboardHome({ products, messages, onTabChange, profile }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalChats = products.reduce((acc, p) => acc + (p.chats || 0), 0);

  const stats = [
    { label: 'Total Earnings', value: `₹1,42,000`, icon: FaBagShopping, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', change: '+18.5%' },
    { label: 'Active Listings', value: products.length, icon: FaStore, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', change: '+2 new' },
    { label: 'Product Views', value: totalViews, icon: FaEye, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', change: '+1,240' },
    { label: 'Chat Requests', value: messages.length + totalChats, icon: FaComment, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', change: 'Immediate reply' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Card */}
      <div className="p-6 md:p-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-blue-950/15 to-[#060b1e]/90 backdrop-blur-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_15px_30px_rgba(0,234,255,0.05)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/5 blur-[80px] group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
            Escrow Protected Shop
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{profile.shopName || 'Rajesh Kumar'}</span>!
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg leading-relaxed font-medium">
            Your verified premium shop status is active. All listings are monitored by SuperX AI scam protection engines for secure offline handshakes.
          </p>
        </div>
        <button 
          onClick={() => onTabChange('add-product')}
          className="px-5 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:scale-105 active:scale-98"
        >
          <FaBolt />
          <span>Quick Sell Item</span>
        </button>
      </div>

      {/* Grid Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return loading ? (
            /* Loading Skeleton */
            <div key={i} className="h-28 rounded-2xl border border-white/5 bg-slate-900/30 p-5 flex flex-col justify-between animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-slate-800 rounded"></div>
                <div className="w-8 h-8 rounded bg-slate-800"></div>
              </div>
              <div className="h-5 w-24 bg-slate-800 rounded"></div>
            </div>
          ) : (
            <div 
              key={i} 
              className="rounded-2xl border border-white/5 bg-[#060b1e]/60 p-5 flex flex-col justify-between shadow-md hover:border-cyan-500/10 hover:shadow-cyan-500/5 transition-all"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400">{stat.label}</span>
                <div className={`p-2 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <Icon className="text-xs" />
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-xl font-extrabold text-white tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <FaArrowTrendUp />
                  <span>{stat.change}</span>
                  <span className="text-slate-500 font-semibold ml-1">this month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout - Recent Activity and Rapid Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Listings Overview */}
        <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-[#050918]/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm tracking-wide text-slate-200">Active Listings Performance</h3>
            <button 
              onClick={() => onTabChange('listings')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Manage Products</span>
              <FaArrowRight className="text-[10px]" />
            </button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 3).map((prod) => (
              <div 
                key={prod.id} 
                className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-[#080d22]/40 hover:border-cyan-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={prod.image} alt={prod.title} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  <button
                    onClick={() => onChatClick(prod)}
                    className="p-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white transition-colors"
                  >
                    <FaCommentDots className="text-sm" />
                  </button>
                  <div>
                    <h4 className="text-xs font-black text-slate-100 truncate w-40 sm:w-60">{prod.title}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{prod.price} • {prod.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Views</span>
                    <span className="text-slate-300 font-black">{prod.views || 0}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Chats</span>
                    <span className="text-cyan-400 font-black">{prod.chats || 0}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    prod.status === 'Sold' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  }`}>
                    {prod.status || 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="rounded-3xl border border-white/5 bg-[#050918]/70 p-5 space-y-4">
          <h3 className="font-extrabold text-sm tracking-wide text-slate-200">Store Quick Shortcuts</h3>
          
          <div className="space-y-2.5">
            <button 
              onClick={() => onTabChange('add-product')}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-cyan-500/10 bg-cyan-950/5 hover:bg-cyan-950/15 text-cyan-300 text-left transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-all text-sm">
                <FaBolt />
              </div>
              <div>
                <div className="text-xs font-black text-slate-100">Publish New Ad</div>
                <div className="text-[10px] text-slate-400">Instantly draft and post details</div>
              </div>
            </button>

            <button 
              onClick={() => onTabChange('messages')}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-indigo-500/10 bg-indigo-950/5 hover:bg-indigo-950/15 text-indigo-300 text-left transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-all text-sm">
                <FaComment />
              </div>
              <div>
                <div className="text-xs font-black text-slate-100">Inbox Chat Hub</div>
                <div className="text-[10px] text-slate-400">Negotiate with active leads</div>
              </div>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
