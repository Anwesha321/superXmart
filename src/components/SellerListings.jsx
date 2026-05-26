import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPen, FaTrash, FaRocket, FaEye, FaComment, FaLocationDot, FaPlus, FaCheck, FaTriangleExclamation } from 'react-icons/fa6';

export default function SellerListings({ products, onUpdateProduct, onDeleteProduct, onAddToast, onTabChange }) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [boostedListings, setBoostedListings] = useState({});

  // Form states for editing
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditPrice(product.price.replace('₹', '').replace(/,/g, ''));
    setEditLocation(product.location);
    setEditDescription(product.description || '');
    setEditImage(product.image);
    setEditCategory(product.category || 'Electronics');
    setEditStatus(product.status || 'Active');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle || !editPrice || !editLocation) return;

    const updated = {
      ...editingProduct,
      title: editTitle,
      price: `₹${Number(editPrice).toLocaleString('en-IN')}`,
      location: editLocation,
      description: editDescription,
      image: editImage,
      category: editCategory,
      status: editStatus
    };

    onUpdateProduct(updated);
    setEditingProduct(null);
    onAddToast('✏️ Listing Updated Successfully', 'success');
  };

  const handleDeleteConfirm = () => {
    onDeleteProduct(deletingProduct.id);
    setDeletingProduct(null);
    onAddToast('🗑️ Item Deleted Successfully', 'danger');
  };

  const handleBoostClick = (prodId) => {
    if (boostedListings[prodId]) {
      onAddToast('🚀 This listing is already boosted!', 'info');
      return;
    }

    setBoostedListings(prev => ({ ...prev, [prodId]: true }));
    
    // Simulate updating product views count immediately!
    const product = products.find(p => p.id === prodId);
    if (product) {
      onUpdateProduct({
        ...product,
        views: (product.views || 0) + 120, // Add views for booster
      });
    }
    onAddToast('📈 Ad Boosted! Reaching 10x more local buyers', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header with quick create post */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-extrabold text-white">Your Listed Ads</h2>
          <p className="text-xs text-slate-400">Edit, boost, or delete your active product inventory.</p>
        </div>
        <button 
          onClick={() => onTabChange('add-product')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-all cursor-pointer"
        >
          <FaPlus />
          <span>Add Product</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-slate-950/20">
          <FaStore className="text-4xl text-slate-600 mx-auto mb-4 opacity-30" />
          <h3 className="text-slate-400 font-bold">No active listings in your shop</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            Draft and publish a product image, title, and local pricing to start receiving buyer handshakes.
          </p>
          <button 
            onClick={() => onTabChange('add-product')}
            className="mt-4 px-5 py-2.5 rounded-full font-bold text-xs uppercase text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer"
          >
            Create Post
          </button>
        </div>
      ) : (
        /* Listings Cards Grid */
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {products.map((prod) => {
              const isBoosted = boostedListings[prod.id];
              return (
                <motion.div
                  key={prod.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, scale: 1.02, boxShadow: '0 8px 30px rgba(0,212,255,0.3)' }}
                  className={`relative rounded-3xl p-4 bg-[#060b1e]/85 backdrop-blur-xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all group ${
                    isBoosted 
                      ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                      : 'border-white/5 hover:border-cyan-500/20 hover:shadow-[0_8px_30px_rgba(0,212,255,0.3)]'
                  }`}
                >
                  {/* Floating Category Badge */}
                  <div className="absolute top-6 left-6 z-10 flex gap-1.5 items-center">
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-slate-300 bg-slate-950/80 border border-white/10 backdrop-blur-sm">
                      {prod.category || 'Electronics'}
                    </span>
                    {prod.status === 'Sold' ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/20 border border-rose-500/30">
                        Sold
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Top image panel */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/5 bg-slate-950/40">
                    <img 
                      src={prod.image} 
                      alt={prod.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                    />
                    {isBoosted && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                        📈 Boosted
                      </div>
                    )}
                  </div>

                  {/* Core details */}
                  <div className="mt-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                        {prod.title}
                      </h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-lg font-black text-white">{prod.price}</span>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <FaLocationDot className="text-cyan-500 text-[11px]" />
                          {prod.location}
                        </span>
                      </div>
                    </div>

                    {/* Stats metrics */}
                    <div className="flex justify-between items-center py-2 border-y border-white/5 text-[10px] text-slate-400 font-bold mt-2">
                      <span className="flex items-center gap-1">
                        <FaEye className="text-slate-500 text-xs" />
                        <span>{prod.views || 0} Views</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FaComment className="text-slate-500 text-xs" />
                        <span>{prod.chats || 0} Buyer Chats</span>
                      </span>
                    </div>

                    {/* Card action controls */}
                    <div className="grid grid-cols-3 gap-2 pt-3">
                      <button 
                        onClick={() => handleEditClick(prod)}
                        className="py-2.5 rounded-xl border border-white/10 hover:border-cyan-500/30 bg-white/5 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FaPen className="text-[10px]" />
                        <span>Edit</span>
                      </button>

                      <button 
                        onClick={() => setDeletingProduct(prod)}
                        className="py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FaTrash className="text-[10px]" />
                        <span>Delete</span>
                      </button>

                      <button 
                        onClick={() => handleBoostClick(prod.id)}
                        disabled={isBoosted}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isBoosted 
                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400/70 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 border border-cyan-300/10 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        }`}
                      >
                        <FaRocket className="text-[10px]" />
                        <span>{isBoosted ? 'Boosted' : 'Boost'}</span>
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ✏️ Edit Item Modal — Premium two-panel redesign */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(2,5,18,0.88)', backdropFilter:'blur(12px)'}}>
            <div className="absolute inset-0" onClick={() => setEditingProduct(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative z-10 w-full max-w-2xl rounded-[28px] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #07111f 0%, #04091a 60%, #060c21 100%)',
                border: '1px solid rgba(0,212,255,0.22)',
                boxShadow: '0 0 60px rgba(0,212,255,0.12), 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,212,255,0.1)'
              }}
            >
              {/* Ambient glow blob */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)'}} />

              {/* ── Header ── */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5" style={{borderBottom:'1px solid rgba(0,212,255,0.12)'}}>
                <h2 className="text-xl font-black tracking-widest uppercase" style={{color:'#00d4ff', textShadow:'0 0 20px rgba(0,212,255,0.5)', letterSpacing:'0.15em'}}>EDIT ITEM</h2>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base transition-all"
                  style={{border:'1.5px solid rgba(0,212,255,0.35)', color:'#00d4ff', background:'rgba(0,212,255,0.07)'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(0,212,255,0.18)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(0,212,255,0.07)'}
                >✕</button>
              </div>

              {/* ── Body: two-panel layout ── */}
              <form onSubmit={handleSaveEdit}>
                <div className="flex gap-0">

                  {/* LEFT PANEL — image preview */}
                  <div className="w-56 flex-shrink-0 p-6 flex flex-col gap-4" style={{borderRight:'1px solid rgba(0,212,255,0.10)'}}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{color:'rgba(0,212,255,0.6)'}}>PRODUCT IMAGE PREVIEW</p>

                    <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[140px]" style={{border:'1px solid rgba(0,212,255,0.2)', background:'rgba(0,20,40,0.6)'}}>
                      <img
                        src={editImage || editingProduct.image}
                        alt={editTitle}
                        className="w-full h-full object-cover"
                        style={{minHeight:'140px', maxHeight:'160px'}}
                        onError={e => { e.target.src = editingProduct.image; }}
                      />
                      {/* Subtle overlay */}
                      <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(4,9,26,0.6) 0%, transparent 60%)'}} />
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-200 truncate">{editTitle || editingProduct.title}</p>
                      <p className="text-[10px] font-semibold mt-0.5" style={{color:'rgba(0,212,255,0.5)'}}>400×400px</p>
                    </div>

                    {/* Change Image — URL input toggle */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('changeImgInput').classList.toggle('hidden')}
                        className="w-full py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                        style={{border:'1.5px solid rgba(0,212,255,0.45)', color:'#00d4ff', background:'rgba(0,212,255,0.07)', letterSpacing:'0.1em'}}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(0,212,255,0.18)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(0,212,255,0.07)'}
                      >CHANGE IMAGE</button>
                      <input
                        id="changeImgInput"
                        type="text"
                        placeholder="Paste image URL…"
                        className="hidden w-full px-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none transition-all"
                        style={{background:'rgba(0,20,40,0.7)', border:'1px solid rgba(0,212,255,0.25)', color:'#e2e8f0'}}
                        value={editImage}
                        onChange={e => setEditImage(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* RIGHT PANEL — form fields */}
                  <div className="flex-1 p-6 space-y-4">

                    {/* Product Title */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(0,212,255,0.6)'}}>PRODUCT TITLE</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        required
                        placeholder="Enter product title…"
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 focus:outline-none transition-all"
                        style={{background:'rgba(0,20,40,0.6)', border:'1px solid rgba(0,212,255,0.22)', color:'#e2e8f0'}}
                        onFocus={e=>e.target.style.border='1px solid rgba(0,212,255,0.7)'}
                        onBlur={e=>e.target.style.border='1px solid rgba(0,212,255,0.22)'}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(0,212,255,0.6)'}}>DESCRIPTION</label>
                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe your item…"
                        className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-100 focus:outline-none transition-all resize-none"
                        style={{background:'rgba(0,20,40,0.6)', border:'1px solid rgba(0,212,255,0.22)', color:'#e2e8f0'}}
                        onFocus={e=>e.target.style.border='1px solid rgba(0,212,255,0.7)'}
                        onBlur={e=>e.target.style.border='1px solid rgba(0,212,255,0.22)'}
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(0,212,255,0.6)'}}>PRICE</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{color:'rgba(0,212,255,0.7)'}}>₹</span>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          required
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm text-slate-100 focus:outline-none transition-all"
                          style={{background:'rgba(0,20,40,0.6)', border:'1px solid rgba(0,212,255,0.22)', color:'#e2e8f0'}}
                          onFocus={e=>e.target.style.border='1px solid rgba(0,212,255,0.7)'}
                          onBlur={e=>e.target.style.border='1px solid rgba(0,212,255,0.22)'}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(0,212,255,0.6)'}}>LOCATION</label>
                      <select
                        value={editLocation}
                        onChange={e => setEditLocation(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all appearance-none"
                        style={{background:'rgba(0,20,40,0.6)', border:'1px solid rgba(0,212,255,0.22)', color:'#e2e8f0'}}
                        onFocus={e=>e.target.style.border='1px solid rgba(0,212,255,0.7)'}
                        onBlur={e=>e.target.style.border='1px solid rgba(0,212,255,0.22)'}
                      >
                        {['Mumbai','Delhi','Bangalore','Hyderabad','Kolkata','Chennai','Pune','Ahmedabad','Jaipur','Lucknow','California, USA','New York, USA','London, UK'].map(city => (
                          <option key={city} value={city} style={{background:'#04091a'}}>{city}</option>
                        ))}
                        {!['Mumbai','Delhi','Bangalore','Hyderabad','Kolkata','Chennai','Pune','Ahmedabad','Jaipur','Lucknow','California, USA','New York, USA','London, UK'].includes(editLocation) && editLocation && (
                          <option value={editLocation} style={{background:'#04091a'}}>{editLocation}</option>
                        )}
                      </select>
                    </div>

                    {/* Category + Status row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(0,212,255,0.6)'}}>CATEGORY</label>
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none appearance-none"
                          style={{background:'rgba(0,20,40,0.6)', border:'1px solid rgba(0,212,255,0.22)', color:'#e2e8f0'}}
                        >
                          {['Laptops & PCs','Electronics','Properties','Vehicles','Peripherals','Audio Wearables','Fashion','Books','Sports','Home & Garden'].map(c => (
                            <option key={c} value={c} style={{background:'#04091a'}}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{color:'rgba(0,212,255,0.6)'}}>STATUS</label>
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none appearance-none"
                          style={{background:'rgba(0,20,40,0.6)', border:'1px solid rgba(0,212,255,0.22)', color:'#e2e8f0'}}
                        >
                          <option value="Active" style={{background:'#04091a'}}>Active</option>
                          <option value="Sold" style={{background:'#04091a'}}>Sold</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ── Footer buttons ── */}
                <div className="flex items-center justify-end gap-4 px-8 py-5" style={{borderTop:'1px solid rgba(0,212,255,0.10)'}}>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-7 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                    style={{border:'1px solid rgba(255,255,255,0.12)', color:'rgba(200,210,230,0.7)', background:'rgba(255,255,255,0.04)', letterSpacing:'0.1em'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.09)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                  >CANCEL</button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all"
                    style={{background:'linear-gradient(90deg, #00c8ff 0%, #0070ff 100%)', color:'#fff', letterSpacing:'0.1em', boxShadow:'0 0 20px rgba(0,180,255,0.35), 0 4px 15px rgba(0,80,220,0.4)'}}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 35px rgba(0,200,255,0.6), 0 4px 20px rgba(0,80,220,0.5)'}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow='0 0 20px rgba(0,180,255,0.35), 0 4px 15px rgba(0,80,220,0.4)'}
                  >SAVE CHANGES</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🗑️ Delete Confirmation Modal — Premium redesign */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(2,5,18,0.88)', backdropFilter:'blur(12px)'}}>
            <div className="absolute inset-0" onClick={() => setDeletingProduct(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 40 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative z-10 w-full max-w-sm rounded-[28px] overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, #0f050d 0%, #12040f 100%)',
                border: '1px solid rgba(244,63,94,0.28)',
                boxShadow: '0 0 50px rgba(244,63,94,0.14), 0 30px 60px rgba(0,0,0,0.7)'
              }}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4" style={{borderBottom:'1px solid rgba(244,63,94,0.12)'}}>
                <h2 className="text-lg font-black uppercase tracking-widest" style={{color:'#f43f5e', textShadow:'0 0 20px rgba(244,63,94,0.5)', letterSpacing:'0.15em'}}>DELETE ITEM</h2>
              </div>

              {/* Product preview */}
              <div className="px-6 pt-5 pb-2 space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-2xl" style={{background:'rgba(244,63,94,0.05)', border:'1px solid rgba(244,63,94,0.15)'}}>
                  <img src={deletingProduct.image} alt={deletingProduct.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" style={{border:'1px solid rgba(244,63,94,0.2)'}} />
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-100 leading-tight truncate">{deletingProduct.title}</p>
                    <p className="text-xs font-bold mt-0.5" style={{color:'rgba(244,63,94,0.7)'}}>{deletingProduct.price} · {deletingProduct.location}</p>
                  </div>
                </div>

                {/* Warning icon */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{background:'rgba(244,63,94,0.1)', border:'1.5px solid rgba(244,63,94,0.25)'}}>
                  <FaTriangleExclamation className="text-2xl" style={{color:'#f43f5e', filter:'drop-shadow(0 0 8px rgba(244,63,94,0.6))'}} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white">Are you sure?</h3>
                  <p className="text-xs leading-relaxed" style={{color:'rgba(200,200,220,0.6)'}}>
                    This listing will be permanently removed and cannot be recovered.
                  </p>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="grid grid-cols-2 gap-3 px-6 py-5" style={{borderTop:'1px solid rgba(244,63,94,0.10)'}}>
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  style={{border:'1px solid rgba(255,255,255,0.12)', color:'rgba(200,210,230,0.7)', background:'rgba(255,255,255,0.04)', letterSpacing:'0.1em'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.09)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                >NO, KEEP</button>
                <button
                  onClick={handleDeleteConfirm}
                  className="py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  style={{background:'linear-gradient(90deg, #f43f5e 0%, #be123c 100%)', color:'#fff', letterSpacing:'0.1em', boxShadow:'0 0 20px rgba(244,63,94,0.35)'}}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 35px rgba(244,63,94,0.6)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='0 0 20px rgba(244,63,94,0.35)'}
                >YES, DELETE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
