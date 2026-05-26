import React, { useState } from 'react';
import { FaUserCheck, FaCircleCheck } from 'react-icons/fa6';

export default function SellerSettings({ profile, onUpdateProfile, onAddToast }) {
  const [name, setName] = useState(profile.name || 'Rajesh Kumar');
  const [shopName, setShopName] = useState(profile.shopName || "Rajesh's Shop");
  const [email, setEmail] = useState(profile.email || 'rajesh@superxmart.com');
  const [location, setLocation] = useState(profile.location || 'Kolkata');
  const [bio, setBio] = useState(profile.bio || 'Verified premium seller on SuperX Mart. Offering high quality electronics and peripherals locally.');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (!name || !shopName || !email) {
      onAddToast('⚠️ All contact details are required!', 'info');
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      onUpdateProfile({
        name,
        shopName,
        email,
        location,
        bio
      });
      setIsUpdating(false);
      onAddToast('🎉 Settings Updated Successfully', 'success');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-extrabold text-white">⚙️ Shop Settings</h2>
        <p className="text-xs text-slate-400">Configure your seller account, contact links, and store profiles.</p>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl border border-white/5 bg-[#060b1e]/85 backdrop-blur-xl space-y-6 shadow-2xl">
        
        {/* Verification Status Badge card */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
              <FaUserCheck />
            </div>
            <div>
              <div className="text-xs font-black text-slate-200">Govt ID Verified Merchant</div>
              <div className="text-[10px] text-slate-500">UIDAI & Aadhaar credentials locked</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1 uppercase tracking-widest">
            <FaCircleCheck /> Secured
          </span>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Seller Name *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Shop / Store Name *</label>
            <input 
              type="text" 
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Support Email *</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Home Location *</label>
            <select 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#050917] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Kolkata">Kolkata</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Delhi">Delhi</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5">Shop Description Bio</label>
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="3"
            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
          />
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-500/10 hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Config</span>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
