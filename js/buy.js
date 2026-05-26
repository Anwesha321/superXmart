// ═══════════════════════════════════════════════════════════
// SuperX Mart – Buy Page JavaScript (ES Module)
// Premium Marketplace with Live Firestore Sync, Search, Filter,
// Favorites, Purchase Modal, and Persistent Buyer-Seller Chat
// ═══════════════════════════════════════════════════════════

import { auth, db, rtdb, dbRef, push, set, onChildAdded, onValue, update, off, onAuthStateChanged, collection, getDocs, doc, setDoc, getDoc, addDoc, onSnapshot, query, orderBy, where, serverTimestamp } from './firebaseConfig.js';
import { showToast } from './toast.js';

// ── State ──
let allProducts = [];
let favorites = JSON.parse(localStorage.getItem('superx_favorites') || '[]');
let currentFilter = 'all';
let searchQuery = '';
let activeChatProductId = null;

// ── Skeleton Loader ──
function renderSkeletons(count = 8) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skel-img"></div>
        <div class="skel-body">
          <div class="skel-line w80"></div>
          <div class="skel-line w40"></div>
          <div class="skel-line w60"></div>
        </div>
      </div>
    `;
  }
  grid.innerHTML = html;
}

// ── Render Stars ──
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
  if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
  for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star"></i>';
  return html;
}

// ── Build Product Card ──
function buildCard(p) {
  const isFav = favorites.includes(p.id);
  const displayPrice = typeof p.price === 'number' ? '₹' + p.price.toLocaleString('en-IN') : p.price;
  
  return `
    <div class="product-card" data-id="${p.id}" data-category="${p.category}">
      <div class="img-wrap">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <div class="card-badges">
          ${p.verified ? '<span class="badge verified"><i class="fa-solid fa-shield-halved"></i> Verified</span>' : ''}
          ${p.trustScore >= 90 ? '<span class="badge trust"><i class="fa-solid fa-star"></i> Trust ' + p.trustScore + '</span>' : ''}
        </div>
        <button class="fav-btn ${isFav ? 'liked' : ''}" onclick="window.toggleFav(event, '${p.id}')">
          <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
        </button>
        <div class="time-badge"><i class="fa-regular fa-clock"></i> ${p.time || 'Just now'}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${p.title}</div>
        <div class="card-price">${displayPrice}</div>
        <div class="card-meta">
          <span class="location"><i class="fa-solid fa-location-dot"></i> ${p.location}</span>
        </div>
        <div class="seller-row">
          <div class="seller-info">
            <i class="fa-solid fa-circle-check"></i> Verified Seller
          </div>
          <div class="rating">
            ${renderStars(p.rating || 5)} ${p.rating || 5}
          </div>
        </div>
      </div>
      <div class="hover-overlay">
        <button class="overlay-btn primary" onclick="event.stopPropagation(); window.openBuyModal('${p.id}');">
          <i class="fa-solid fa-cart-shopping"></i> Buy Now
        </button>
        <button class="overlay-btn primary" style="margin-top:8px; background: rgba(0,200,255,0.2); color:var(--text-primary);" onclick="event.stopPropagation(); window.openChatModal('${p.id}');">
          <i class="fa-solid fa-comment-dots"></i> Chat Seller
        </button>
      </div>
    </div>
  `;
}

// ── Load Products from Firestore ──
async function loadProductsFromFirestore() {
  let products = [];
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
      if (!doc.id.startsWith('p') || doc.id.startsWith('cp_')) {
        products.push({ id: doc.id, ...doc.data() });
      }
    });
  } catch (error) {
    console.warn("Could not read products collection, trying posts collection:", error);
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      querySnapshot.forEach((doc) => {
        if (!doc.id.startsWith('p') || doc.id.startsWith('cp_')) {
          products.push({ id: doc.id, ...doc.data() });
        }
      });
    } catch (err2) {
      console.error("Failed to load products from posts collection as well:", err2);
    }
  }

  if (products.length === 0) {
    console.log("No products found in Firestore. Using local fallback cache...");
    // Filter dummy products from local storage cache too if they exist
    const cached = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');
    allProducts = cached.filter(p => !p.id.startsWith('p') || p.id.startsWith('cp_'));
  } else {
    allProducts = products;
  }

  // Cache locally
  localStorage.setItem('superx_custom_posts', JSON.stringify(allProducts));
  renderProducts();
}

// ── Render Products ──
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = [...allProducts];

  // Category filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.category === currentFilter);
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  // Update count
  const countSpan = document.getElementById('resultsCount');
  if (countSpan) {
    countSpan.textContent = filtered.length + ' product' + (filtered.length !== 1 ? 's' : '');
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 48px; color: var(--text-muted); margin-bottom: 20px; display: block;"></i>
        <h3 style="color: var(--text-secondary); font-size: 18px; margin-bottom: 8px;">No products found</h3>
        <p style="color: var(--text-muted); font-size: 14px;">Try a different search or filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(buildCard).join('');
}

// ── Toggle Favorite ──
window.toggleFav = function(e, id) {
  e.stopPropagation();
  const idx = favorites.indexOf(id);
  if (idx > -1) {
    favorites.splice(idx, 1);
    showToast('Removed from favorites!', 'info');
  } else {
    favorites.push(id);
    showToast('Added to favorites!', 'success');
  }
  localStorage.setItem('superx_favorites', JSON.stringify(favorites));
  renderProducts();
};

// ── Buy Modal Logic ──
window.openBuyModal = function(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailBody');
  if (!modal || !body) return;

  const displayPrice = typeof product.price === 'number' ? '₹' + product.price.toLocaleString('en-IN') : product.price;
  
  body.innerHTML = `
    <div style="text-align:center; padding: 20px;">
      <h2 style="color: var(--neon-blue, #3b82f6); margin-bottom: 10px; font-weight: 700; font-size: 1.5rem;">Confirm Purchase</h2>
      <img src="${product.image}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 12px; margin-bottom: 15px; border: 1px solid var(--glass-border);" />
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 5px;">${product.title}</h3>
      <h1 style="color: #10b981; margin: 15px 0; font-size: 2rem; font-weight: 800;">${displayPrice}</h1>
      <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem; line-height: 1.5;">
        Location: <strong>${product.location}</strong> <br/> 
        Seller Rating: <strong>${product.rating || 5}</strong> <i class="fa-solid fa-star" style="color:#f59e0b; font-size:12px;"></i>
      </p>
      
      <button class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 16px; background: #10b981; color: white; border: none; border-radius: 12px; font-weight: bold; cursor:pointer; transition: all 0.3s;" onclick="window.confirmPurchase('${product.id}')">
        Confirm & Pay ${displayPrice}
      </button>
    </div>
  `;
  
  modal.style.display = 'flex';
};

window.confirmPurchase = function(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  // Close modal
  const modal = document.getElementById('detailModal');
  if (modal) modal.style.display = 'none';

  // Show premium success toast
  showToast(`Purchase initiated successfully! You bought ${product.title.split(' — ')[0]}. 🚀`, 'success');
};

// Handle closing detail modal
document.getElementById('closeDetailModal')?.addEventListener('click', () => {
  const modal = document.getElementById('detailModal');
  if (modal) modal.style.display = 'none';
});

// ── Persistent Chat Module — Real-Time DB ──
let chatListenerRef = null;

// Generate a deterministic chat ID from buyer + seller + product
function getChatId(buyerId, sellerId, productId) {
  return `${buyerId}_${sellerId}_${productId}`;
}

window.openChatModal = async function(productId) {
  const user = auth.currentUser;
  if (!user) {
    showToast('Please sign in to chat with the seller!', 'error');
    return;
  }

  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  // Determine the seller — use product.sellerId if present, else fallback
  const sellerId = product.sellerId || 'unknown_seller';
  const sellerName = product.sellerName || 'Seller';
  const buyerId = user.uid;
  const buyerName = user.displayName || user.email?.split('@')[0] || 'Buyer';

  if (sellerId === buyerId) {
    showToast('You cannot chat with yourself!', 'info');
    return;
  }

  activeChatProductId = productId;

  // Open chat modal
  const chatModal = document.getElementById('chatModal');
  if (chatModal) chatModal.style.display = 'flex';

  // Update chat header
  const chatBody = document.getElementById('chatBody');
  if (chatBody) {
    let headerEl = document.getElementById('chatHeader');
    if (!headerEl) {
      headerEl = document.createElement('div');
      headerEl.id = 'chatHeader';
      headerEl.style.cssText = 'padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:10px; display:flex; align-items:center; gap:10px;';
      chatBody.insertBefore(headerEl, chatBody.firstChild);
    }
    headerEl.innerHTML = `
      ${product.image ? `<img src="${product.image}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" />` : ''}
      <div>
        <div style="font-weight:700; font-size:13px;">${product.title?.split(' — ')[0] || 'Product'}</div>
        <div style="font-size:11px; color:var(--text-secondary);">Chatting with ${sellerName}</div>
      </div>
    `;
  }

  const chatId = getChatId(buyerId, sellerId, productId);
  
  // Write/ensure metadata exists in RTDB under user_chats fan-out path
  const metadata = {
    chatId,
    buyerId,
    buyerName,
    sellerId,
    sellerName,
    productId,
    productTitle: product.title || '',
    productImage: product.image || '',
    createdAt: new Date().toISOString(),
    lastMessage: 'Chat started by buyer',
    lastMessageTime: new Date().toISOString(),
    unread: false
  };

  try {
    const updates = {};
    updates[`user_chats/${buyerId}/${chatId}`] = metadata;
    updates[`user_chats/${sellerId}/${chatId}`] = metadata;
    await update(dbRef(rtdb), updates);
  } catch (err) {
    console.error('Error saving chat metadata:', err);
  }

  const messagesDiv = document.getElementById('chatMessages');
  if (messagesDiv) {
    messagesDiv.innerHTML = `
      <div style="text-align:center; color:var(--text-secondary); padding:40px 20px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:10px;"></i>
        <p style="font-size:13px;">Loading conversation...</p>
      </div>
    `;
  }

  // Unsubscribe previous listener
  if (chatListenerRef) {
    off(chatListenerRef);
    chatListenerRef = null;
  }
  
  // Listen to messages in real-time via RTDB onValue
  chatListenerRef = dbRef(rtdb, `chats/${chatId}/messages`);
  onValue(chatListenerRef, (snapshot) => {
    if (!messagesDiv) return;
    
    const data = snapshot.val();
    if (!data) {
      messagesDiv.innerHTML = `
        <div style="text-align:center; color:var(--text-secondary); padding:40px 20px;">
          <i class="fa-solid fa-comments" style="font-size:36px; opacity:0.2; margin-bottom:12px; display:block;"></i>
          <p style="font-size:14px; font-weight:500;">No messages yet. Ask the seller about this listing!</p>
        </div>
      `;
      return;
    }

    const currentUid = auth.currentUser?.uid;
    const keys = Object.keys(data);
    const messagesHtml = keys.map(k => {
      const msg = data[k];
      const isMe = msg.senderId === currentUid;
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      
      return `
        <div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:12px;">
          <div style="max-width:75%; padding:10px 14px; border-radius:16px; font-size:13.5px; line-height:1.4;
                      background:${isMe ? 'var(--neon-blue, #00c8ff)' : 'rgba(255,255,255,0.06)'};
                      color:${isMe ? 'var(--navy, #0a0a2a)' : 'var(--text-primary)'};
                      border-bottom-${isMe ? 'right' : 'left'}-radius:4px;
                      border:1px solid ${isMe ? 'transparent' : 'var(--glass-border, rgba(255,255,255,0.08))'};">
            <div style="font-weight:700; font-size:11px; margin-bottom:3px; opacity:0.85;">
              ${isMe ? 'You' : (msg.senderName || 'Seller')}
            </div>
            <div style="word-break:break-word;">${msg.text}</div>
            <div style="font-size:9px; text-align:right; margin-top:4px; opacity:0.65; font-weight:500;">
              ${timeStr}
            </div>
          </div>
        </div>
      `;
    }).join('');

    messagesDiv.innerHTML = messagesHtml;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, (err) => {
    console.error('Error listening to RTDB chat messages:', err);
    if (messagesDiv) {
      messagesDiv.innerHTML = `
        <div style="text-align:center; color:#ef4444; padding:40px 20px;">
          <i class="fa-solid fa-circle-exclamation" style="font-size:32px; margin-bottom:12px; display:block;"></i>
          <p style="font-size:13.5px; font-weight:500;">Failed to load messages.</p>
          <p style="font-size:11px; opacity:0.7; margin-top:4px;">${err.message || 'Permission denied'}</p>
        </div>
      `;
    }
  });
};

// Close chat modal
document.getElementById('closeChatModal')?.addEventListener('click', () => {
  const chatModal = document.getElementById('chatModal');
  if (chatModal) chatModal.style.display = 'none';
  activeChatProductId = null;
  if (chatListenerRef) {
    off(chatListenerRef);
    chatListenerRef = null;
  }
});

// Send message to RTDB
window.sendChatMessage = async function() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text || !activeChatProductId || !auth.currentUser) return;

  const user = auth.currentUser;
  const product = allProducts.find(p => p.id === activeChatProductId);
  if (!product) return;

  const sellerId = product.sellerId || 'unknown_seller';
  const chatId = getChatId(user.uid, sellerId, activeChatProductId);

  input.value = '';

  try {
    const messagesRef = dbRef(rtdb, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      senderId: user.uid,
      senderName: user.displayName || user.email?.split('@')[0] || 'Buyer',
      text: text,
      timestamp: Date.now()
    });

    // Update metadata preview
    const updates = {};
    updates[`user_chats/${user.uid}/${chatId}/lastMessage`] = text;
    updates[`user_chats/${user.uid}/${chatId}/lastMessageTime`] = new Date().toISOString();
    updates[`user_chats/${user.uid}/${chatId}/unread`] = false;
    updates[`user_chats/${sellerId}/${chatId}/lastMessage`] = text;
    updates[`user_chats/${sellerId}/${chatId}/lastMessageTime`] = new Date().toISOString();
    updates[`user_chats/${sellerId}/${chatId}/unread`] = true;
    
    await update(dbRef(rtdb), updates);

    // Also write a real-time notification to the seller's notifications!
    const notifId = 'chat_' + Date.now();
    const notifRef = dbRef(rtdb, `user_notifications/${sellerId}/${notifId}`);
    await set(notifRef, {
      id: notifId,
      title: `New Message from ${user.displayName || user.email?.split('@')[0] || 'Buyer'}`,
      message: text,
      timestamp: Date.now(),
      read: false,
      productId: activeChatProductId,
      chatId: chatId,
      type: 'chat'
    });

  } catch (err) {
    console.error('Error sending message:', err);
    showToast('Failed to send message.', 'error');
  }
};

// Send message triggers
document.getElementById('sendChatBtn')?.addEventListener('click', window.sendChatMessage);
document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    window.sendChatMessage();
  }
});

// ── Filter Chips ──
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    renderProducts();
  });
});

// ── Search Bar Input ──
const searchInput = document.getElementById('buySearch');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderProducts();
  });
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  renderSkeletons(8);
  
  // Authenticate & Load
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Logged in user verified on buy catalog:", user.email);
    } else {
      console.log("Exploring buy catalog as Guest user");
    }
    loadProductsFromFirestore();
  });
});
