import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaBolt, FaShieldHalved, FaUserShield, FaCreditCard, FaLock, FaCircleCheck } from 'react-icons/fa6';
import ProductCard from './components/ProductCard';
import ChatPanel from './components/ChatPanel';
import FeaturesBar from './components/FeaturesBar';

export default function App() {
  const [activeChatProduct, setActiveChatProduct] = useState(null);
  const [activeBuyProduct, setActiveBuyProduct] = useState(null);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Products Data
  const products = [
    {
      id: 'prod-hp-laptop',
      title: 'Laptop hp ProBook 15 G9',
      price: '₹68,000',
      location: 'Kolkata',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600',
      rating: 4.5,
      trustScore: 96,
      category: 'Laptops & PCs',
      description: 'HP ProBook 15 G9 in absolute brand new condition. Powered by 12th Gen Intel Core i7, 16GB RAM, and 512GB ultra-fast NVMe SSD. Perfect for developers, creators, and students. Purchased 8 months ago, holds original bill, box, and manufacturer charger. Zero issues, selling due to an upgrade.'
    },
    {
      id: 'prod-cyber-kb',
      title: 'Cyberpunk Mechanical Keyboard',
      price: '₹14,500',
      location: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      trustScore: 99,
      category: 'Peripherals',
      description: 'Limited edition customized 75% mechanical keyboard with hot-swappable tactile Gateron Oil King switches, premium translucent cyber-neon dye-sub keycaps, CNC-milled heavy aluminum body, and dynamic per-key addressable RGB backlighting. Box, keycap puller, and coiled coiled type-C cable included.'
    },
    {
      id: 'prod-sony-wh',
      title: 'Sony WH-1000XM5 Studio ANC',
      price: '₹24,900',
      location: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      rating: 4.6,
      trustScore: 94,
      category: 'Audio Wearables',
      description: 'Industry-leading noise-canceling headphones, Sony WH-1000XM5. Flawless audio response, dual processor high-performance ANC, and up to 30 hours of continuous battery backup. Comes in a hard-shell premium protective case, premium auxiliary cable, and original box packaging.'
    }
  ];

  // Helper to trigger floating success/info notification toasts
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleConfirmCheckout = () => {
    setIsProcessingCheckout(true);
    setTimeout(() => {
      setIsProcessingCheckout(false);
      setShowCheckoutSuccess(true);
      addToast(`🎉 Secure payment initialized for ${activeBuyProduct.title}!`, 'success');
      setTimeout(() => {
        setShowCheckoutSuccess(false);
        setActiveBuyProduct(null);
      }, 3500);
    }, 2000);
  };

  return (
    <div className="relative min-h-screen text-slate-200 overflow-x-hidden flex flex-col font-sans">
      
      {/* 🌌 Premium Ambient Moving Glow Blobs */}
      <div className="absolute top-[10%] left-[5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none animate-float-1" />
      <div className="absolute top-[40%] right-[10%] w-[250px] md:w-[450px] h-[250px] md:h-[450px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-float-2" />
      <div className="absolute bottom-[10%] left-[20%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none animate-pulse-glow" />

      {/* 🚀 Header */}
      <nav className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <a 
          href="../index.html" 
          className="flex items-center gap-2 font-black text-lg md:text-xl text-white tracking-wider cursor-pointer hover:text-cyan-400 transition-colors"
        >
          <FaBolt className="text-cyan-400" />
          <span>SUPERX MART</span>
        </a>

        <a
          href="../index.html"
          className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all shadow-lg hover:shadow-cyan-500/10"
        >
          <FaArrowLeft className="text-xs" />
          <span>Back to Marketplace</span>
        </a>
      </nav>

      {/* 🎯 Main Showcase Body */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        
        {/* Intro Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] inline-flex items-center gap-2">
            <FaShieldHalved /> Premium UI Component Showcase
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Cyberpunk Glassmorphism <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,234,255,0.2)]">
              Product Card Experience
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-lg mx-auto">
            Experience OLX-style listings redefined with next-generation fintech aesthetics, active micro-animations, and live-simulated secure transactions.
          </p>
        </div>

        {/* Govt ID / Scam Detection Features Bar */}
        <FeaturesBar />

        {/* Product Cards Showcase Grid */}
        <div className="w-full flex flex-wrap gap-8 justify-center items-stretch py-8">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onChatClick={() => setActiveChatProduct(prod)}
              onBuyClick={() => {
                setActiveBuyProduct(prod);
                addToast(`Escrow Secure checkout opened for ${prod.title}!`, 'info');
              }}
            />
          ))}
        </div>
      </main>

      {/* 📄 Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 bg-slate-950/40 text-center text-slate-500 text-xs mt-auto">
        <p className="mb-2">Powered by React, Tailwind CSS, & Framer Motion.</p>
        <p>&copy; 2026 SuperX Mart. All rights reserved. Precision Designed for Visual Wow.</p>
      </footer>

      {/* 💬 Live Active Chat Modal */}
      <ChatPanel
        isOpen={!!activeChatProduct}
        onClose={() => {
          addToast("Conversation closed", "info");
          setActiveChatProduct(null);
        }}
        product={activeChatProduct || products[0]}
      />

      {/* 🛒 Secure Escrow Cyber Checkout Modal */}
      <AnimatePresence>
        {activeBuyProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setActiveBuyProduct(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md p-6 rounded-3xl border border-emerald-500/20 bg-[#060a16] shadow-[0_20px_50px_rgba(16,185,129,0.15)] space-y-5"
            >
              {/* Escrow Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                  <FaUserShield className="text-2xl animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold text-white">SuperX Escrow Guarantee</h3>
                <p className="text-xs text-slate-400">
                  Your funds are held securely in a smart contract escrow until you inspect the product in a Safe Meeting Zone and verify its condition.
                </p>
              </div>

              {/* Product Meta */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/50 border border-white/5">
                <img 
                  src={activeBuyProduct.image} 
                  alt={activeBuyProduct.title} 
                  className="w-14 h-14 rounded-lg object-cover border border-white/10" 
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Purchase Listing</div>
                  <h4 className="text-sm font-bold text-slate-100 truncate">{activeBuyProduct.title}</h4>
                  <div className="text-xs text-slate-400 font-semibold">{activeBuyProduct.location}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-semibold">Total Price</div>
                  <div className="text-base font-extrabold text-white">{activeBuyProduct.price}</div>
                </div>
              </div>

              {/* Checkout Progress Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5"><FaCircleCheck className="text-emerald-400" /> Seller Verification Checked</span>
                  <span className="text-emerald-400">100% Secure</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5"><FaCircleCheck className="text-emerald-400" /> Smart Scam Risk Probability</span>
                  <span className="text-emerald-400">0.01% (Extremely Safe)</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5"><FaCircleCheck className="text-emerald-400" /> Free Meeting Escrow Protection</span>
                  <span className="text-emerald-400">Included</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                {showCheckoutSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-center text-sm flex items-center justify-center gap-2"
                  >
                    <FaCircleCheck className="text-lg animate-bounce" />
                    <span>Payment Held in Escrow Successfully!</span>
                  </motion.div>
                ) : (
                  <>
                    <button
                      onClick={handleConfirmCheckout}
                      disabled={isProcessingCheckout}
                      className="w-full py-3.5 rounded-full font-bold text-sm tracking-wide text-white bg-gradient-to-r from-emerald-400 to-teal-600 hover:from-emerald-500 hover:to-teal-700 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessingCheckout ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Securing Channel...</span>
                        </>
                      ) : (
                        <>
                          <FaLock className="text-xs" />
                          <span>🔒 Deposit & Secure Transaction</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveBuyProduct(null)}
                      disabled={isProcessingCheckout}
                      className="w-full py-3.5 rounded-full font-semibold text-sm text-slate-400 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 active:scale-98 transition-all cursor-pointer"
                    >
                      Cancel Purchase
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🍞 Glow Toast Manager */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              className={`p-3.5 rounded-xl text-xs font-bold shadow-2xl border flex items-center gap-2 pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                  : toast.type === 'info'
                  ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300'
                  : 'bg-red-950/80 border-red-500/30 text-red-300'
              }`}
            >
              <FaBolt className={toast.type === 'success' ? 'text-emerald-400' : 'text-cyan-400'} />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
