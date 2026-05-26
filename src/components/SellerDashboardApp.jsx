import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt } from 'react-icons/fa6';
import SellerSidebar from './SellerSidebar';
import SellerNavbar from './SellerNavbar';
import SellerDashboardHome from './SellerDashboardHome';
import SellerListings from './SellerListings';
import SellerAddProduct from './SellerAddProduct';
import SellerMessages from './SellerMessages';
import SellerAnalytics from './SellerAnalytics';
import SellerSettings from './SellerSettings';
import ChatPanel from './ChatPanel';

export default function SellerDashboardApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Shop profile state
  const [profile, setProfile] = useState({
    name: 'Rajesh Kumar',
    shopName: "Rajesh's Shop",
    email: 'rajesh@superxmart.com',
    location: 'Kolkata',
    bio: 'Verified premium seller on SuperX Mart. Offering high quality electronics and peripherals locally.'
  });

  // Local products state initialized with our showcase items
  const [products, setProducts] = useState([
    {
      id: 'prod-hp-laptop',
      title: 'Laptop hp ProBook 15 G9',
      price: '₹68,000',
      location: 'Kolkata',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600',
      rating: 4.5,
      trustScore: 96,
      views: 480,
      chats: 5,
      status: 'Active',
      category: 'Laptops & PCs',
      description: 'HP ProBook 15 G9 in absolute brand new condition. Powered by 12th Gen Intel Core i7, 16GB RAM, and 512GB ultra-fast NVMe SSD. Perfect for developers, creators, and students. Purchased 8 months ago, holds original bill, box, and manufacturer charger. Zero issues.'
    },
    {
      id: 'prod-cyber-kb',
      title: 'Cyberpunk Mechanical Keyboard',
      price: '₹14,500',
      location: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      trustScore: 99,
      views: 290,
      chats: 3,
      status: 'Active',
      category: 'Peripherals',
      description: 'Limited edition customized 75% mechanical keyboard with hot-swappable tactile Gateron Oil King switches, premium translucent cyber-neon keycaps.'
    },
    {
      id: 'prod-sony-wh',
      title: 'Sony WH-1000XM5 Studio ANC',
      price: '₹24,900',
      location: 'Bangalore',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      rating: 4.6,
      trustScore: 94,
      views: 310,
      chats: 1,
      status: 'Active',
      category: 'Audio Wearables',
      description: 'Industry-leading noise-canceling headphones, Sony WH-1000XM5. Flawless audio response, dual processor high-performance ANC.'
    }
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: '💬 New Bid Recieved',
      message: 'Animesh Ghosh is offering ₹64,000 for your HP Laptop. Tap to open chat.',
      timestamp: Date.now() - 300000,
      read: false
    },
    {
      id: 'notif-2',
      title: '🔒 Safe Zone Meeting Locked',
      message: 'Escrow holds verified. Safe meetup locked at Salt Lake Sector V police precinct.',
      timestamp: Date.now() - 3600000,
      read: true
    }
  ]);

  // Toast notifier helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleUpdateProduct = (updatedProd) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddProduct = (newProd) => {
    setProducts(prev => [newProd, ...prev]);
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleMarkNotifRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('🔕 All notifications marked read', 'info');
  };

  const handleClearNotifs = () => {
    setNotifications([]);
    addToast('🗑️ Notifications logs cleared', 'info');
  };

  const handleLogout = () => {
    addToast('🔒 Session Terminated. Redirecting...', 'info');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1200);
  };

  const handleChatOpen = (product) => {
    setSelectedProduct(product);
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="relative min-h-screen bg-[#020512] text-slate-200 overflow-x-hidden flex font-sans">
      
      {/* 🌌 Cyber Neon Ambient Moving Blobs */}
      <div className="absolute top-[15%] left-[10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none animate-float-1" />
      <div className="absolute bottom-[20%] right-[5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-blue-600/5 blur-[110px] pointer-events-none animate-float-2" />

      {/* ⬅ Sidebar Navigation Menu */}
      <SellerSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
      />

      {/* 💻 Right View Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <SellerNavbar 
          profile={profile} 
          notifications={notifications} 
          onMarkRead={handleMarkNotifRead}
          onClearAll={handleClearNotifs}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <SellerDashboardHome 
                  products={products} 
                  messages={notifications} 
                  onTabChange={setActiveTab}
                  profile={profile}
                />
              )}

              {activeTab === 'listings' && (
                <SellerListings 
                  products={products}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddToast={addToast}
                  onTabChange={setActiveTab}
                />
              )}

              {activeTab === 'add-product' && (
                <SellerAddProduct 
                  onAddProduct={handleAddProduct}
                  onAddToast={addToast}
                  onTabChange={setActiveTab}
                />
              )}

              {activeTab === 'messages' && (
                <SellerMessages 
                  products={products}
                  onAddToast={addToast}
                />
              )}

              {activeTab === 'analytics' && (
                <SellerAnalytics />
              )}

              {activeTab === 'settings' && (
                <SellerSettings 
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onAddToast={addToast}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 🍞 Glowing Toast Notification overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 25, x: 25 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -25, x: 25 }}
              className={`p-4 rounded-2xl text-xs font-bold border shadow-2xl flex items-center gap-2 pointer-events-auto ${
                toast.type === 'danger'
                  ? 'bg-rose-950/80 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                  : toast.type === 'info'
                  ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              }`}
            >
              <FaBolt className={toast.type === 'danger' ? 'text-rose-400' : (toast.type === 'info' ? 'text-cyan-400' : 'text-emerald-400')} />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
