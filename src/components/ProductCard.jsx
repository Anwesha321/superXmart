import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldHalved, FaCircleCheck, FaStar, FaLocationDot, FaCartShopping, FaCommentDots, FaClock } from 'react-icons/fa6';
import FeaturesBar from './FeaturesBar';

export default function ProductCard({ product, onChatClick, onBuyClick }) {
  // Generate stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < floor) {
        stars.push(<FaStar key={i} className="text-amber-400 text-xs" />);
      } else if (i === floor && rating % 1 !== 0) {
        stars.push(<FaStar key={i} className="text-amber-400/70 text-xs" />);
      } else {
        stars.push(<FaStar key={i} className="text-slate-600 text-xs" />);
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -10,
        boxShadow: "0 25px 50px -12px rgba(0, 234, 255, 0.15), 0 0 30px -5px rgba(59, 130, 246, 0.2)"
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative w-[340px] md:w-[370px] rounded-[25px] border border-cyan-500/20 bg-[#060b1e]/85 backdrop-blur-xl p-5 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] group"
    >
      {/* Dynamic Cyan Ambient Light Inside Card */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />

      {/* Blurred image background inside the card (top portion behind product) */}
      <div className="absolute top-0 left-0 right-0 h-[220px] overflow-hidden pointer-events-none rounded-[25px] z-0">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover img-blur-bg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060b1e]/70 to-[#060b1e] z-1" />
      </div>

      {/* Top Features Bar */}
      <div className="relative z-10 w-full mb-3 flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
          <FaShieldHalved className="text-[10px]" /> Verified
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold bg-slate-950/40 px-2 py-0.5 rounded-md border border-white/5">
          <FaClock className="text-[9px]" /> 2 hrs ago
        </span>
      </div>

      {/* Product Image Frame */}
      <div className="relative z-10 w-full h-[200px] rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40 group-hover:border-cyan-400/40 transition-colors duration-500 shadow-inner">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
        
        {/* Floating Category Badge */}
        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider text-slate-300 bg-slate-950/80 backdrop-blur-sm border border-white/10">
          {product.category || 'Electronics'}
        </div>
      </div>

      {/* Bottom Product Info */}
      <div className="relative z-10 mt-4 space-y-3">
        {/* Title and Trust Score */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate pr-2">
            {product.title}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Trust Score</span>
            <span className="text-xs font-extrabold text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              {product.trustScore || 95}%
            </span>
          </div>
        </div>

        {/* Price & Rating */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {product.price}
          </span>
          <div className="flex items-center gap-1.5 bg-slate-950/30 px-2 py-1 rounded-lg border border-white/5">
            <div className="flex gap-0.5">
              {renderStars(product.rating || 4.5)}
            </div>
            <span className="text-xs font-bold text-slate-300">{product.rating || '4.5'}</span>
          </div>
        </div>

        {/* Location & Seller Verification Badge */}
        <div className="flex justify-between items-center py-2 border-y border-white/5 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <FaLocationDot className="text-cyan-500/90 text-sm" />
            {product.location}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <FaCircleCheck className="text-[10px]" /> Verified Seller
          </span>
        </div>

        {/* Buttons Panel */}
        <div className="space-y-2.5 pt-1 flex flex-col items-center">
          {/* Primary Button: Buy Now */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBuyClick}
            className="w-full py-3 rounded-full font-bold text-sm tracking-wide text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 neon-glow-cyan neon-glow-cyan-hover flex items-center justify-center gap-2 border border-cyan-300/20 shadow-lg cursor-pointer transition-all duration-300"
          >
            <FaCartShopping className="text-base" />
            <span>🛒 Buy Now</span>
          </motion.button>

          {/* Secondary Button: Chat Seller */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onChatClick}
            className="w-full py-3 rounded-full font-semibold text-sm tracking-wide text-white bg-white/5 backdrop-blur-md border border-white/10 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-600/20 hover:border-cyan-500/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
          >
            <FaCommentDots className="text-base" />
            <span>💬 Chat Seller</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
