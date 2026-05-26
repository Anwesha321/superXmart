import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaXmark, FaCheckDouble, FaCircle } from 'react-icons/fa6';

export default function ChatPanel({ isOpen, onClose, product }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize messages when chat opens
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'seller',
          text: `Hi! Thank you for your interest in my ${product.title || 'HP Laptop'}. How can I help you today?`,
          timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: 'welcome-2',
          sender: 'seller',
          text: `It is in absolute pristine condition, located in ${product.location || 'Kolkata'}, and listed at ₹${Number(product.price || 68000).toLocaleString('en-IN')}. I am available for a meet-up in a Safe Meeting Zone nearby.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [isOpen, product]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Send message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newUserMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    const userQuestion = inputText.trim().toLowerCase();
    setInputText('');

    // Trigger seller simulated smart reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = "I'm currently online! Let me know if you want to meet up for a live inspection. We can meet in a safe public zone.";
      
      if (userQuestion.includes('price') || userQuestion.includes('negotiable') || userQuestion.includes('discount')) {
        replyText = "The price of ₹68,000 is quite reasonable considering the brand-new condition, but I can offer a very minor discount (₹1,000 - ₹2,000) if we finalize the deal today.";
      } else if (userQuestion.includes('location') || userQuestion.includes('meet') || userQuestion.includes('where')) {
        replyText = `I am based in ${product.location || 'Kolkata'}. We can meet at a local police station or a verified Safe Meeting Zone like Salt Lake Sector V for a risk-free deal.`;
      } else if (userQuestion.includes('spec') || userQuestion.includes('ram') || userQuestion.includes('processor') || userQuestion.includes('storage')) {
        replyText = "It has an Intel Core i7 12th Gen processor, 16GB high-speed DDR4 RAM, 512GB NVMe SSD, and Intel Iris Xe Graphics. The performance is incredibly fast!";
      } else if (userQuestion.includes('condition') || userQuestion.includes('scratch') || userQuestion.includes('damage')) {
        replyText = "There are zero scratches or dents. It was sparingly used as a backup laptop for work, and battery health is at 94% with original bill and charger included.";
      } else if (userQuestion.includes('warranty') || userQuestion.includes('bill')) {
        replyText = "Yes, I have the original GST purchase invoice. The official warranty expired 2 months ago, but the laptop is working perfectly like a brand new machine.";
      } else if (userQuestion.includes('hello') || userQuestion.includes('hi') || userQuestion.includes('hey')) {
        replyText = "Hey! Let me know what information you need about the laptop. I can also send you high-resolution photos.";
      }

      const newSellerMsg = {
        id: `seller-${Date.now()}`,
        sender: 'seller',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newSellerMsg]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md h-[550px] flex flex-col rounded-3xl border border-cyan-500/20 bg-[#080d22]/90 backdrop-blur-2xl shadow-[0_20px_50px_-10px_rgba(0,234,255,0.15)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=Rajesh`}
                    alt="Seller"
                    className="w-10 h-10 rounded-full border border-cyan-400/20 bg-slate-800"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#080d22] flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5 text-sm md:text-base">
                    <span>Rajesh Kumar</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      Govt ID Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
                    <FaCircle className="text-[6px]" />
                    <span>Online Status • Active response</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            {/* Product Meta Header Banner */}
            <div className="flex items-center gap-3 p-3 bg-cyan-950/10 border-b border-white/5">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-slate-950/40 relative">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Product Inquiry</div>
                <div className="text-sm font-bold text-slate-200 truncate">{product.title}</div>
                <div className="text-xs text-slate-400 font-semibold">{product.price} • {product.location}</div>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                        isMe
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-60 font-semibold">
                        <span>{msg.timestamp}</span>
                        {isMe && <FaCheckDouble className="text-[10px] text-cyan-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Loader */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/60 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                    <span className="text-[11px] text-cyan-400 font-semibold mr-1">Rajesh is typing</span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/5 bg-slate-950/20 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about price, specs, meet-up zones..."
                className="flex-1 bg-slate-950/50 border border-white/10 rounded-full px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim()
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
