import React, { useState } from 'react';
import { FaCloudArrowUp, FaPlus, FaCheck, FaLocationCrosshairs } from 'react-icons/fa6';

export default function SellerAddProduct({ onAddProduct, onAddToast, onTabChange }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Kolkata');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Laptops & PCs');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick select mockup images to make uploader fun and fully functional!
  const mockupImages = [
    { label: 'Laptop', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600' },
    { label: 'Keyboard', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600' },
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600' },
    { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || !location) {
      onAddToast('⚠️ Please fill in all required fields!', 'info');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const finalImage = imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600';
      const newProd = {
        id: `prod-${Date.now()}`,
        title,
        price: `₹${Number(price).toLocaleString('en-IN')}`,
        location,
        image: finalImage,
        rating: 4.5,
        trustScore: 95,
        views: 12,
        chats: 0,
        status: 'Active',
        category,
        description: description || 'No product description provided.'
      };

      onAddProduct(newProd);
      setIsSubmitting(false);
      
      // Clean form fields
      setTitle('');
      setPrice('');
      setDescription('');
      setImageUrl('');

      onAddToast('🚀 New Product Published Successfully', 'success');
      // Redirect to Listings Tab
      onTabChange('listings');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-extrabold text-white">🚀 Publish New Product</h2>
        <p className="text-xs text-slate-400">Fill in details and list your item securely in the local market.</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl border border-white/5 bg-[#060b1e]/85 backdrop-blur-xl space-y-6 shadow-2xl">
        
        {/* Upload Drop Zone / Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400">Product Photography</label>
          
          {imageUrl ? (
            <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-cyan-500/30 group">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => setImageUrl('')}
                className="absolute top-3 right-3 px-3 py-1 text-[10px] font-bold rounded-full bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition-all"
              >
                Clear Image
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-6 bg-[#040816] flex flex-col items-center justify-center text-center space-y-3 transition-all">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl">
                <FaCloudArrowUp className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-200">Drag & Drop Product Image</h4>
                <p className="text-[10px] text-slate-500 mt-1">Accepts PNG, JPG, or direct web URLs</p>
              </div>
              
              {/* Quick Image Selectors */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {mockupImages.map((mock) => (
                  <button
                    key={mock.label}
                    type="button"
                    onClick={() => setImageUrl(mock.url)}
                    className="px-2.5 py-1 text-[9px] font-bold rounded-md bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
                  >
                    + {mock.label} Photo
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct Link Input */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Or paste direct image URL (https://...)" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-950/40 border border-white/5 rounded-xl pl-4 pr-12 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Product Title *</label>
            <input 
              type="text" 
              placeholder="e.g. Laptop hp core i7 16GB" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Selling Price (₹) *</label>
            <input 
              type="number" 
              placeholder="e.g. 68000" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Category *</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#050917] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="Laptops & PCs">Laptops & PCs</option>
              <option value="Electronics">Electronics</option>
              <option value="Properties">Properties</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Peripherals">Peripherals</option>
              <option value="Audio Wearables">Audio Wearables</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Location *</label>
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
          <label className="block text-xs font-bold text-slate-400 mb-1.5">Item Description</label>
          <textarea 
            placeholder="Provide conditions, accessories, warranty, and collection details..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
          />
        </div>

        {/* Submit Panel */}
        <div className="pt-2 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => onTabChange('listings')}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            Discard Ad
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/20 hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <>
                <FaPlus />
                <span>🚀 Publish Listing</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
