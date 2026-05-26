import React from 'react';
import { 
  FaGauge, FaStore, FaPlus, 
  FaCommentDots, FaChartLine, FaGear, 
  FaRightFromBracket, FaBolt 
} from 'react-icons/fa6';

export default function SellerSidebar({ activeTab, onTabChange, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaGauge },
    { id: 'listings', label: 'My Listings', icon: FaStore },
    { id: 'add-product', label: 'Add Product', icon: FaPlus },
    { id: 'messages', label: 'Messages', icon: FaCommentDots, badge: 2 },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'settings', label: 'Settings', icon: FaGear },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#040817]/90 backdrop-blur-2xl flex flex-col h-screen sticky top-0 z-20">
      {/* Brand logo header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <FaBolt className="text-white text-lg animate-pulse" />
        </div>
        <div>
          <h1 className="font-black text-slate-100 tracking-wider text-base">SUPERX</h1>
          <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">Seller Panel</span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all group cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`text-base transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span>{item.label}</span>
              </div>
              
              {/* Optional Inbox Badge */}
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/5 bg-slate-950/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <FaRightFromBracket className="text-base" />
          <span>Log out Shop</span>
        </button>
      </div>
    </aside>
  );
}
