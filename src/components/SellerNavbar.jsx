import React, { useState } from 'react';
import { FaBell, FaSearch, FaCircle, FaShop, FaChevronDown } from 'react-icons/fa6';

export default function SellerNavbar({ profile, notifications, onMarkRead, onClearAll }) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-10 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#030614]/80 backdrop-blur-md">
      {/* Search Bar Input */}
      <div className="relative w-72 max-w-xs md:max-w-none">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
        <input 
          type="text" 
          placeholder="Search listing, sales, chats..." 
          className="w-full bg-slate-950/40 border border-white/5 rounded-full pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
      </div>

      {/* Action Controls & Profile Menu */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2.5 rounded-full border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer relative"
          >
            <FaBell className="text-sm" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifDropdown(false)} />
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/5 bg-[#080d22] backdrop-blur-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-40 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <h4 className="font-extrabold text-sm text-slate-200">Alerts</h4>
                  <div className="flex gap-2">
                    <button onClick={onMarkRead} className="text-[10px] font-bold text-cyan-400 hover:underline">Read All</button>
                    <button onClick={onClearAll} className="text-[10px] font-bold text-rose-400 hover:underline">Clear</button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-2.5 rounded-xl border transition-all text-[11px] ${
                          notif.read 
                            ? 'bg-slate-950/20 border-white/5 text-slate-400' 
                            : 'bg-cyan-950/20 border-cyan-500/20 text-slate-200'
                        }`}
                      >
                        <div className="flex justify-between font-bold mb-1">
                          <span className={notif.read ? 'text-slate-300' : 'text-cyan-400'}>{notif.title}</span>
                          <span className="opacity-60 text-[9px]">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Card & Online badge */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          <div className="relative">
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} 
              alt="Shop Logo" 
              className="w-9 h-9 rounded-full border border-cyan-400/20 bg-slate-800"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#030614] flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-black text-slate-100 flex items-center gap-1">
              <span>{profile.name}</span>
              <FaShop className="text-[10px] text-cyan-400" />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-extrabold tracking-wide">
              <FaCircle className="text-[5px]" />
              <span>SHOP ONLINE</span>
            </div>
          </div>
          <FaChevronDown className="text-[10px] text-slate-500 hidden sm:block" />
        </div>

      </div>
    </header>
  );
}
