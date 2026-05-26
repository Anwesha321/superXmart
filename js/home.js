import { auth, db, rtdb, dbRef, push, set, get, onChildAdded, onValue, update, off, onAuthStateChanged, signOut, doc, getDoc, collection, getDocs, setDoc, addDoc, onSnapshot, query, orderBy, where, serverTimestamp } from './firebaseConfig.js';
import { showToast } from './toast.js';
import { uploadToCloudinary, CLOUDINARY_FOLDER } from './cloudinary.js';

// Setup Profile Dropdown Toggle
const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const notifBtn = document.getElementById('notifBtn');
const notifDropdown = document.getElementById('notifDropdown');

if (profileBtn && dropdownMenu) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
        if (notifDropdown) notifDropdown.classList.remove('active');
    });
}

if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
        if (dropdownMenu) dropdownMenu.classList.remove('active');
    });
}

document.addEventListener('click', (e) => {
    if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== profileBtn) {
        dropdownMenu.classList.remove('active');
    }
    if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBtn) {
        notifDropdown.classList.remove('active');
    }
});

async function loadFirestoreProducts() {
    const mainGrid = document.getElementById('main-grid');
    if (mainGrid) {
        mainGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                <div class="spinner" style="display: inline-block; border-color: var(--primary-color); border-top-color: transparent;"></div>
                <p style="color: var(--text-secondary); margin-top: 1rem;">Syncing live marketplace...</p>
            </div>
        `;
    }

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let products = [];
        querySnapshot.forEach((doc) => {
            // Exclude any remaining dummy/mock products by checking their id structure (mock items had ids 'p1', 'p2' etc.)
            if (!doc.id.startsWith('p') || doc.id.startsWith('cp_')) {
                products.push({ id: doc.id, ...doc.data() });
            }
        });

        window.allProductsList = products;

        // Cache locally for fallback
        localStorage.setItem('superx_custom_posts', JSON.stringify(window.allProductsList));
        renderProducts();
    } catch (error) {
        console.error("Firestore sync error, loading from local storage cache:", error);
        window.allProductsList = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');
        renderProducts();
    }
}

// Listen to Auth State changes to populate user data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        let displayName = user.displayName || user.email.split('@')[0];
        let roleName = "User";
        window.currentUserRole = 'buyer';
        window.currentUserVerificationStatus = 'approved';

        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                displayName = data.name || displayName;
                roleName = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "User";
                window.currentUserRole = data.role || 'buyer';
                window.currentUserVerificationStatus = data.verificationStatus || 'approved';

                // Display Admin link if the user is admin
                const adminPortalLink = document.getElementById('adminPortalLink');
                if (adminPortalLink) {
                    if (data.role === 'admin' || user.email === 'admin@superxmart.com') {
                        adminPortalLink.style.display = 'flex';
                    } else {
                        adminPortalLink.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }

        // Special handling for hardcoded admin
        if (user.email === 'admin@superxmart.com') {
            window.currentUserRole = 'admin';
            const adminPortalLink = document.getElementById('adminPortalLink');
            if (adminPortalLink) adminPortalLink.style.display = 'flex';
        }

        const email = user.email;
        const photoURL = user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
        document.getElementById('userName').textContent = displayName;
        document.getElementById('dropdownName').textContent = `${displayName} (${roleName})`;
        document.getElementById('dropdownEmail').textContent = email;
        if (document.getElementById('profileImg')) {
            document.getElementById('profileImg').src = photoURL;
        }
        window.currentUserData = { name: displayName, avatar: photoURL };

        // Sync products with Firestore
        loadFirestoreProducts();

        // Real-time notifications and unread chats
        listenToNotifications(user.uid);
        listenToUnreadChats(user.uid);
    } else {
        window.currentUserData = { name: 'Guest', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Guest' };
        window.currentUserRole = 'buyer';

        // Clear real-time listeners on logout/no auth
        if (notificationsListenerRef) {
            off(notificationsListenerRef);
            notificationsListenerRef = null;
        }
        if (unreadChatsListenerRef) {
            off(unreadChatsListenerRef);
            unreadChatsListenerRef = null;
        }
        loadNotifications(); // reset layout to default
    }
});

// Logout Handling
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            if (notificationsListenerRef) {
                off(notificationsListenerRef);
                notificationsListenerRef = null;
            }
            if (unreadChatsListenerRef) {
                off(unreadChatsListenerRef);
                unreadChatsListenerRef = null;
            }
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            showToast('Error signing out', 'error');
        }
    });
}

// -------------------------------------------------------------
// MARKETPLACE LOGIC
// -------------------------------------------------------------

const MOCK_PRODUCTS = [];

// Build a product card — defined at module scope so all code can access it
const buildCard = (p) => `
    <div class="premium-card" style="cursor: pointer;" onclick="openProductModal('${p.id}')">
        <div class="post-image-container">
            <img src="${p.image}" alt="${p.title}" class="product-img">
            <div class="badges">
                ${p.verified ? '<div class="badge verified"><i class="fa-solid fa-shield-check"></i> Verified</div>' : ''}
            </div>
        </div>
        <div class="post-content">
            <div class="card-header-flex">
                <h3 class="product-title">${p.title}</h3>
            </div>
            <div class="product-price">₹${Number(p.price).toLocaleString('en-IN')}</div>
            <div class="product-meta">
                <span><i class="fa-solid fa-location-dot"></i> ${p.location}</span>
            </div>
            <div class="card-actions-row" style="margin-top: 15px; display: flex; gap: 10px;">
    <button class="btn btn-primary" style="flex: 1; padding: 10px; font-size: 13px;" onclick="event.stopPropagation(); addToCart('${p.id}')">
        <i class="fa-solid fa-cart-plus"></i> Add
    </button>
    <button class="btn" style="flex: 1; padding: 10px; font-size: 13px; background: rgba(59,130,246,0.06); color: var(--primary-color); border-radius: 12px; font-weight: 600;" onclick="event.stopPropagation(); openProductModal('${p.id}')">
        Details
    </button>

            </div>
        </div>
    </div>
`;

function renderProducts() {
    // Custom posts from localStorage
    const customPosts = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');

    // Apply category filter if active
    const filtered = window.currentCategoryFilter
        ? customPosts.filter(p => p.title.toLowerCase().includes(window.currentCategoryFilter.toLowerCase()))
        : customPosts;

    // Collect all products into one array
    let allProducts = [...filtered, ...MOCK_PRODUCTS];

    const mainGrid = document.getElementById('main-grid');
    if (mainGrid) {
        if (allProducts.length === 0) {
            mainGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fa-solid fa-store"></i>
                    </div>
                    <h3 class="empty-state-title">No Products Yet</h3>
                    <p class="empty-state-text">Be the first to list something! Tap the <strong>Create Post</strong> button to start selling.</p>
                    <button class="empty-state-btn" onclick="document.getElementById('fabCreatePost').click()">
                        <i class="fa-solid fa-plus"></i> Create Your First Post
                    </button>
                </div>
            `;
        } else {
            mainGrid.innerHTML = allProducts.map(buildCard).join('');
        }
    }
}

// -------------------------------------------------------------
// NOTIFICATIONS ENGINE
// -------------------------------------------------------------
// -------------------------------------------------------------
// NOTIFICATIONS ENGINE
// -------------------------------------------------------------
let notificationsListenerRef = null;

function loadNotifications() {
    const notifList = document.getElementById('notifList');
    if (notifList) {
        notifList.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
            <i class="fa-solid fa-bell" style="font-size: 2rem; opacity: 0.15; margin-bottom: 1rem;"></i>
            <p style="font-size: 13px; font-weight: 500;">Please log in to view notifications</p>
        </div>
    `;
    }
    const badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
}

function listenToNotifications(uid) {
    if (notificationsListenerRef) {
        off(notificationsListenerRef);
    }

    const notifsRef = dbRef(rtdb, `user_notifications/${uid}`);
    notificationsListenerRef = notifsRef;

    onValue(notifsRef, (snapshot) => {
        const notifList = document.getElementById('notifList');
        const badge = document.getElementById('notifBadge');
        const data = snapshot.val();

        if (!data) {
            if (badge) badge.style.display = 'none';
            if (notifList) {
                notifList.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <i class="fa-solid fa-bell" style="font-size: 2rem; opacity: 0.15; margin-bottom: 1rem;"></i>
                <p style="font-size: 13px; font-weight: 500;">No new notifications</p>
            </div>
        `;
            }
            return;
        }

        const keys = Object.keys(data);
        const notifs = keys.map(k => data[k]);
        notifs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        const unreadCount = notifs.filter(n => !n.read).length;
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        if (notifList) {
            notifList.innerHTML = notifs.map(n => {
                const timeStr = n.timestamp ? new Date(n.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Just now';
                return `
          <div class="notif-item ${n.read ? 'read' : 'unread'}" style="cursor: pointer;" onclick="handleNotificationClick('${n.chatId || ''}', '${n.productId || ''}')">
              <div class="notif-icon"><i class="fa-solid ${n.type === 'chat' ? 'fa-comment-dots' : 'fa-circle-question'}"></i></div>
              <div class="notif-content">
                  <h5 style="margin-bottom: 0.2rem; font-size: 0.9rem;">${n.title}</h5>
                  <p style="font-size: 0.8rem; color: var(--text-secondary);">${n.message}</p>
                  <small style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.4rem; display: block;">
                      ${timeStr}
                  </small>
              </div>
              ${!n.read ? '<div class="unread-dot"></div>' : ''}
          </div>
        `;
            }).join('');
        }
    });
}

window.handleNotificationClick = function (chatId, productId) {
    if (chatId) {
        openChatInbox();
        openChatConversation(chatId);
    } else if (productId) {
        openProductModal(productId);
    }
};

document.getElementById('markAllReadBtn')?.addEventListener('click', async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
        const notifsRef = dbRef(rtdb, `user_notifications/${uid}`);
        const snapshot = await get(notifsRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const updates = {};
            Object.keys(data).forEach(k => {
                updates[`user_notifications/${uid}/${k}/read`] = true;
            });
            await update(dbRef(rtdb), updates);
        }
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
});

document.getElementById('clearAllBtn')?.addEventListener('click', async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
        const notifsRef = dbRef(rtdb, `user_notifications/${uid}`);
        await set(notifsRef, null);
    } catch (err) {
        console.error('Error clearing notifications:', err);
    }
});

// -------------------------------------------------------------
// MODAL & COMMENTS
// -------------------------------------------------------------
let currentModalInquiryUnsubscribe = null;

window.openProductModal = function (productId) {
    const p = getProductById(productId);
    if (!p) return;

    const isSeller = auth.currentUser && p.sellerId === auth.currentUser.uid;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="modal-layout">
            <div class="modal-img">
                <img src="${p.image}" alt="${p.title}">
                ${p.verified ? '<div class="verified-badge"><i class="fa-solid fa-check-circle"></i> Verified</div>' : ''}
            </div>
            <div class="modal-info">
                <h2>${p.title}</h2>
                <div class="modal-price">₹${p.price.toLocaleString('en-IN')}</div>
                <div class="modal-location"><i class="fa-solid fa-location-dot"></i> ${p.location}</div>
                
                <hr style="border-color: var(--glass-border); margin: 1.5rem 0;">
                
                <!-- Show inquiry submission only if current user is not the seller -->
                ${!isSeller ? `
                    <h3>Ask a Question</h3>
                    <form id="commentForm" class="comment-form">
                        <textarea id="commentText" placeholder="Write your inquiry here..." required style="width: 100%; min-height: 80px; padding: 12px; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--glass-bg); color: var(--text-primary); outline: none; resize: vertical; margin-bottom: 10px; font-size: 14px;"></textarea>
                        <button type="submit" class="btn btn-primary" style="border-radius: 12px; width: 100%; padding: 10px;">Send Inquiry</button>
                    </form>
                ` : `
                    <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 12px; padding: 12px; font-size: 13.5px; color: var(--text-secondary); text-align: center; margin-bottom: 20px;">
                        <i class="fa-solid fa-circle-info" style="color: #3b82f6; margin-right: 6px;"></i> You are the seller of this product listing.
                    </div>
                `}

                <div class="comments-section" style="margin-top: 1.5rem;">
                    <h4 id="inquiriesTitle">Inquiries (Loading...)</h4>
                    <div class="comments-list" id="inquiriesList" style="margin-top: 1rem; max-height: 280px; overflow-y: auto; padding-right: 4px;">
                        <!-- Real-time inquiries injected here -->
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('productModal').classList.add('active');

    // Set up real-time listener for inquiries
    const inquiriesRef = dbRef(rtdb, `inquiries/${productId}`);
    if (currentModalInquiryUnsubscribe) {
        off(currentModalInquiryUnsubscribe);
        currentModalInquiryUnsubscribe = null;
    }
    currentModalInquiryUnsubscribe = inquiriesRef;

    onValue(inquiriesRef, (snapshot) => {
        const listEl = document.getElementById('inquiriesList');
        const titleEl = document.getElementById('inquiriesTitle');
        if (!listEl) return;

        const data = snapshot.val();
        if (!data) {
            if (titleEl) titleEl.textContent = 'Inquiries (0)';
            listEl.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center; padding: 20px 0;">Be the first to ask about this product!</p>';
            return;
        }

        const keys = Object.keys(data);
        const inquiries = keys.map(k => data[k]);
        inquiries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        if (titleEl) titleEl.textContent = `Inquiries (${inquiries.length})`;

        listEl.innerHTML = inquiries.map(c => {
            const timeStr = c.timestamp ? new Date(c.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Just now';
            const answerTimeStr = c.answerTimestamp ? new Date(c.answerTimestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : '';

            return `
                <div class="inquiry-item" style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 14px; border-radius: 12px; margin-bottom: 12px;">
                    <!-- Question Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-circle-question" style="color: #3b82f6; font-size: 15px;"></i>
                            <span style="font-weight: 700; font-size: 13.5px; color: var(--text-primary);">${c.buyerName}</span>
                        </div>
                        <span style="font-size: 10.5px; color: var(--text-muted);">${timeStr}</span>
                    </div>
                    <!-- Question Text -->
                    <div style="font-size: 13px; color: var(--text-secondary); margin-left: 23px; margin-bottom: 10px; line-height: 1.4; word-break: break-word;">
                        ${c.text}
                    </div>
                    
                    <!-- Answer or Reply Input -->
                    ${c.answered ? `
                        <!-- Seller's Answer -->
                        <div class="seller-answer" style="background: rgba(16, 185, 129, 0.05); border-left: 3px solid #10b981; padding: 8px 12px; border-radius: 4px 8px 8px 4px; margin-left: 23px;">
                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 12px;"></i>
                                <span style="font-weight: 700; font-size: 11.5px; color: #10b981;">Seller's Answer</span>
                                <span style="font-size: 10px; color: var(--text-muted); margin-left: auto;">${answerTimeStr}</span>
                            </div>
                            <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.4; word-break: break-word;">
                                ${c.answer}
                            </div>
                        </div>
                    ` : (isSeller ? `
                        <!-- Seller Reply Input -->
                        <div style="margin-left: 23px; margin-top: 8px; display: flex; gap: 8px;">
                            <input type="text" id="replyInput_${c.id}" placeholder="Type your answer..." style="flex: 1; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.15); color: var(--text-primary); font-size: 12px; outline: none;" />
                            <button class="btn btn-primary" onclick="submitInquiryReply('${productId}', '${c.id}', document.getElementById('replyInput_${c.id}').value)" style="padding: 6px 10px; font-size: 11px; border-radius: 8px;">
                                Reply
                            </button>
                        </div>
                    ` : `
                        <!-- Pending Badge for Buyer -->
                        <div style="margin-left: 23px; font-size: 11px; color: #f59e0b; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-clock"></i> Waiting for seller's reply...
                        </div>
                    `)}
                </div>
            `;
        }).join('');
    });

    // Handle Comment Submit (Inquiry)
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const textEl = document.getElementById('commentText');
            if (!textEl) return;
            const text = textEl.value.trim();
            if (!text) return;

            if (!auth.currentUser) {
                showToast('Please sign in to ask a question.', 'error');
                return;
            }

            const buyerName = window.currentUserData?.name || auth.currentUser.displayName || auth.currentUser.email.split('@')[0];
            const sellerId = p.sellerId || 'unknown_seller';

            textEl.value = '';

            try {
                // Generate unique inquiry ID
                const newInquiryRef = push(dbRef(rtdb, `inquiries/${productId}`));
                const inquiryId = newInquiryRef.key;

                const inquiryData = {
                    id: inquiryId,
                    productId: productId,
                    productTitle: p.title,
                    buyerId: auth.currentUser.uid,
                    buyerName: buyerName,
                    text: text,
                    timestamp: Date.now(),
                    answer: '',
                    answerTimestamp: 0,
                    answered: false,
                    sellerId: sellerId
                };

                // Save inquiry
                await set(newInquiryRef, inquiryData);

                // Create Notification for the Seller
                const notifId = 'inq_' + Date.now();
                const notifRef = dbRef(rtdb, `user_notifications/${sellerId}/${notifId}`);
                await set(notifRef, {
                    id: notifId,
                    title: `New Inquiry on ${p.title}`,
                    message: `${buyerName}: ${text}`,
                    timestamp: Date.now(),
                    read: false,
                    productId: productId,
                    type: 'inquiry'
                });

                showToast('Inquiry sent to seller! 🚀', 'success');

            } catch (err) {
                console.error('Error sending inquiry:', err);
                showToast('Failed to send inquiry.', 'error');
            }
        });
    }
};

document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('productModal').classList.remove('active');
    if (currentModalInquiryUnsubscribe) {
        off(currentModalInquiryUnsubscribe);
        currentModalInquiryUnsubscribe = null;
    }
});
document.getElementById('productModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'productModal') {
        document.getElementById('productModal').classList.remove('active');
        if (currentModalInquiryUnsubscribe) {
            off(currentModalInquiryUnsubscribe);
            currentModalInquiryUnsubscribe = null;
        }
    }
});


// -------------------------------------------------------------
// CATEGORY FILTER LOGIC
// -------------------------------------------------------------
const categoryBtn = document.getElementById('categoryBtn');
const categoryMenu = document.getElementById('categoryMenu');

if (categoryBtn && categoryMenu) {
    categoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryMenu.style.display = categoryMenu.style.display === 'block' ? 'none' : 'block';
        // close other dropdowns
        if (notifDropdown) notifDropdown.classList.remove('active');
        if (dropdownMenu) dropdownMenu.classList.remove('active');
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
        if (categoryMenu && !categoryMenu.contains(e.target) && e.target !== categoryBtn) {
            categoryMenu.style.display = 'none';
        }
    });

    // category selection handling – simple client‑side filter
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const selected = item.textContent.trim();
            // store selected category for renderProducts
            window.currentCategoryFilter = selected;
            // close menu
            categoryMenu.style.display = 'none';
            renderProducts();
        });
    });
}

// Extend renderProducts to respect the category filter
const originalRenderProducts = renderProducts;
renderProducts = function () {
    const customPosts = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');
    // simple demo: filter only the custom posts (no real categories stored yet)
    const filtered = window.currentCategoryFilter ? customPosts.filter(p => p.title.toLowerCase().includes(window.currentCategoryFilter.toLowerCase())) : customPosts;
    const allProducts = [...filtered, ...MOCK_PRODUCTS];
    const mainGrid = document.getElementById('main-grid');
    if (mainGrid) {
        if (allProducts.length === 0) {
            mainGrid.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-store"></i></div><h3 class="empty-state-title">No Products Yet</h3><p class="empty-state-text">Be the first to list something! Tap the <strong>Create Post</strong> button to start selling.</p><button class="empty-state-btn" onclick="document.getElementById('fabCreatePost').click()"><i class="fa-solid fa-plus"></i> Create Your First Post</button></div>`;
        } else {
            mainGrid.innerHTML = allProducts.map(buildCard).join('');
        }
    }
};

// Sell buttons — checks if user is verified seller or admin before opening modal
const handleCreatePostOpen = () => {
    if (!auth.currentUser) {
        showToast('Please sign in to create a post.', 'error');
        return;
    }
    if (window.currentUserRole === 'admin' || (window.currentUserRole === 'seller' && window.currentUserVerificationStatus === 'approved')) {
        document.getElementById('createPostModal').classList.add('active');
    } else if (window.currentUserRole === 'seller' && window.currentUserVerificationStatus !== 'approved') {
        showToast(`Your Seller account status is pending approval. Please wait for an Admin to verify your account.`, 'error');
    } else {
        showToast('Only registered and verified Sellers can post products. Register as a Seller to start selling!', 'error');
    }
};

document.getElementById('sellBtn')?.addEventListener('click', handleCreatePostOpen);
document.getElementById('fabCreatePost')?.addEventListener('click', handleCreatePostOpen);

document.getElementById('closeCreatePostModal')?.addEventListener('click', () => {
    document.getElementById('createPostModal').classList.remove('active');
});

document.getElementById('createPostForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('cpTitle').value.trim();
    const price = document.getElementById('cpPrice').value;
    const location = document.getElementById('cpLocation').value.trim();
    const imageInput = document.getElementById('cpImage');
    let imageUrl = '';
    let imageMeta = null;

    // --- Upload image to Cloudinary ---
    if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        try {
            showToast('Uploading image to Cloudinary...', 'info');
            imageMeta = await uploadToCloudinary(file);
            imageUrl = imageMeta.secure_url;
            showToast('Image uploaded! Saving listing...', 'success');
        } catch (error) {
            showToast('Failed to upload image. Please try again.', 'error');
            return;
        }
    }

    // Sanitize Cloudinary metadata — remove undefined values for Firestore
    const cloudinaryMeta = imageMeta ? {
        secure_url: imageMeta.secure_url || '',
        public_id: imageMeta.public_id || '',
        asset_id: imageMeta.asset_id || '',
        format: imageMeta.format || '',
        width: imageMeta.width || 0,
        height: imageMeta.height || 0,
        bytes: imageMeta.bytes || 0,
        resource_type: imageMeta.resource_type || 'image',
        created_at: imageMeta.created_at || new Date().toISOString(),
        folder: imageMeta.folder || CLOUDINARY_FOLDER
    } : null;

    const newPost = {
        id: 'cp_' + Date.now(),
        title,
        price: Number(price),
        location,
        image: imageUrl,
        cloudinaryMeta: cloudinaryMeta,   // full Cloudinary metadata stored in Firestore
        sellerId,                          // owner UID — required by Firestore security rules
        sellerName,
        verified: true,
        category: 'electronics',
        time: 'Just now',
        createdAt: new Date().toISOString(),
        trustScore: 90,
        rating: 4.5,
        description: title
    };

    try {
        // Write listing to live Firestore "products" collection
        await setDoc(doc(db, "products", newPost.id), newPost);

        // Keep local cache in sync
        const customPosts = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');
        customPosts.unshift(newPost);
        localStorage.setItem('superx_custom_posts', JSON.stringify(customPosts));

        document.getElementById('createPostModal').classList.remove('active');
        document.getElementById('createPostForm').reset();
        showToast('Post created successfully! 🎉', 'success');

        // Refresh product grid from Firestore
        await loadFirestoreProducts();

    } catch (err) {
        console.error('Failed to save post to Firestore:', err);

        if (err.code === 'permission-denied' || (err.message && err.message.includes('permission'))) {
            // Firestore rules not yet updated — save locally so seller keeps their post
            const customPosts = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');
            customPosts.unshift(newPost);
            localStorage.setItem('superx_custom_posts', JSON.stringify(customPosts));

            document.getElementById('createPostModal').classList.remove('active');
            document.getElementById('createPostForm').reset();
            renderProducts();

            showToast(
                'Post saved locally. ⚠️ Update Firestore rules in Firebase Console to publish it live.',
                'error'
            );
        } else {
            showToast('Could not save post — check your internet connection.', 'error');
        }
    }
});


// -------------------------------------------------------------
// CART LOGIC
// -------------------------------------------------------------
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');

cartBtn?.addEventListener('click', () => {
    cartSidebar.classList.add('open');
});

closeCartBtn?.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
});

document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('superx_cart') || '[]');
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }

    // Clear cart
    localStorage.removeItem('superx_cart');

    // Close sidebar
    document.getElementById('cartSidebar')?.classList.remove('open');

    // Show success toast
    showToast('Purchase successful! Thank you for shopping with SuperX Mart. 🎉', 'success');

    // Re-render cart UI
    renderCart();
});

function getProductById(id) {
    const customPosts = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');
    return [...customPosts, ...MOCK_PRODUCTS].find(p => p.id === id);
}

window.addToCart = function (productId) {
    const p = getProductById(productId);
    if (!p) return;

    let cart = JSON.parse(localStorage.getItem('superx_cart') || '[]');
    // Check if already in cart
    if (cart.find(item => item.id === productId)) {
        showToast('Item already in cart!', 'error');
        return;
    }

    cart.push(p);
    localStorage.setItem('superx_cart', JSON.stringify(cart));
    showToast('Added to cart!', 'success');
    renderCart();
};

window.removeFromCart = function (productId) {
    let cart = JSON.parse(localStorage.getItem('superx_cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('superx_cart', JSON.stringify(cart));
    renderCart();
};

// Delete a user‑created post (e.g., duplicate headphone)
window.removePost = function (postId) {
    // Only affect custom posts stored in localStorage
    const customPosts = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');
    const filtered = customPosts.filter(p => p.id !== postId);
    localStorage.setItem('superx_custom_posts', JSON.stringify(filtered));
    showToast('Post removed.', 'success');
    renderProducts();
};

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('superx_cart') || '[]');
    const badge = document.getElementById('cartBadge');

    if (cart.length > 0) {
        badge.textContent = cart.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }

    const cartItemsDiv = document.getElementById('cartItems');
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart-msg"><i class="fa-solid fa-cart-shopping" style="font-size: 28px; opacity: 0.15; display: block; margin-bottom: 12px;"></i>Your cart is empty</div>';
        document.getElementById('cartTotal').textContent = '₹0';
        return;
    }

    let total = 0;
    cartItemsDiv.innerHTML = cart.map(item => {
        total += Number(item.price);
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
                </div>
                <button class="remove-cart-item" onclick="removeFromCart('${item.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    document.getElementById('cartTotal').textContent = '₹' + total.toLocaleString('en-IN');
}

// Init
function dedupePosts() {
    // Retrieve custom posts
    const customPosts = JSON.parse(localStorage.getItem('superx_custom_posts') || '[]');
    const seen = {};
    const filtered = [];
    let removedCount = 0;
    customPosts.forEach(p => {
        const key = p.title.trim().toLowerCase();
        if (seen[key]) {
            // Duplicate found, skip it (remove)
            removedCount++;
        } else {
            seen[key] = true;
            filtered.push(p);
        }
    });
    if (removedCount > 0) {
        localStorage.setItem('superx_custom_posts', JSON.stringify(filtered));
        showToast(`${removedCount} duplicate post(s) removed.`, 'success');
        renderProducts();
    }
}

// ── Chat Inbox & Conversation for Sellers & Buyers ──
let inboxUnsubscribe = null;
let convoUnsubscribe = null;
let activeChatId = null;
let activeChatData = null;
let currentInboxTab = 'selling'; // 'selling' or 'buying'

// Open chat inbox sidebar
function openChatInbox() {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        showToast('Please sign in to view chats.', 'error');
        return;
    }
    const sidebar = document.getElementById('chatInboxSidebar');
    if (sidebar) sidebar.classList.add('open'); // slide in via CSS transition
    setupInboxListeners();
    loadInboxChats();
}

function setupInboxListeners() {
    const btnSell = document.getElementById('inboxTabSell');
    const btnBuy = document.getElementById('inboxTabBuy');

    if (btnSell && btnBuy) {
        btnSell.onclick = () => {
            if (currentInboxTab === 'selling') return;
            currentInboxTab = 'selling';
            btnSell.style.borderBottom = '2px solid #3b82f6';
            btnSell.style.color = '#3b82f6';
            btnSell.style.fontWeight = '700';
            btnBuy.style.borderBottom = '2px solid transparent';
            btnBuy.style.color = 'var(--text-secondary)';
            btnBuy.style.fontWeight = '600';
            loadInboxChats();
        };

        btnBuy.onclick = () => {
            if (currentInboxTab === 'buying') return;
            currentInboxTab = 'buying';
            btnBuy.style.borderBottom = '2px solid #3b82f6';
            btnBuy.style.color = '#3b82f6';
            btnBuy.style.fontWeight = '700';
            btnSell.style.borderBottom = '2px solid transparent';
            btnSell.style.color = 'var(--text-secondary)';
            btnSell.style.fontWeight = '600';
            loadInboxChats();
        };
    }
}

function loadInboxChats() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const listEl = document.getElementById('chatInboxList');
    if (listEl) {
        listEl.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-secondary);">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:10px;"></i>
        <p style="font-size:13px;">Loading conversations...</p>
      </div>
    `;
    }

    const userChatsRef = dbRef(rtdb, `user_chats/${uid}`);
    if (inboxUnsubscribe) {
        off(inboxUnsubscribe);
        inboxUnsubscribe = null;
    }

    inboxUnsubscribe = userChatsRef;
    onValue(userChatsRef, (snapshot) => {
        if (!listEl) return;
        const data = snapshot.val();
        if (!data) {
            listEl.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--text-secondary);">
          <i class="fa-solid fa-comment-slash" style="font-size:32px; opacity:0.2; margin-bottom:10px; display:block;"></i>
          <p style="font-size:13px;">No conversations found in this tab.</p>
        </div>
      `;
            return;
        }

        const keys = Object.keys(data);
        const items = keys.map(k => data[k]);

        // Filter by role
        const filtered = items.filter(item => {
            if (currentInboxTab === 'selling') {
                return item.sellerId === uid;
            } else {
                return item.buyerId === uid;
            }
        });

        // Sort by lastMessageTime descending
        filtered.sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));

        if (filtered.length === 0) {
            listEl.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--text-secondary);">
          <i class="fa-solid fa-comment-slash" style="font-size:32px; opacity:0.2; margin-bottom:10px; display:block;"></i>
          <p style="font-size:13px;">No conversations found in this tab.</p>
        </div>
      `;
            return;
        }

        const chatsHtml = filtered.map(item => {
            const lastMsg = item.lastMessage || 'No messages yet';
            const time = item.lastMessageTime
                ? new Date(item.lastMessageTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                : '';
            const otherPartyName = currentInboxTab === 'selling'
                ? (item.buyerName || 'Buyer')
                : (item.sellerName || 'Seller');
            const prefix = currentInboxTab === 'selling' ? 'Buyer: ' : 'Seller: ';

            return `
        <div class="chat-list-item" data-chat-id="${item.chatId}" style="display:flex; align-items:center; gap:10px; padding:12px; cursor:pointer; border-bottom:1px solid var(--glass-border); transition:background 0.2s; border-radius:8px; margin-bottom:4px;">
          ${item.productImage ? `<img src="${item.productImage}" style="width:44px;height:44px;border-radius:8px;object-fit:cover; border:1px solid var(--glass-border);"/>` : ''}
          <div style="flex:1; min-width:0;">
            <div style="font-weight:700; font-size:13px; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${item.productTitle || 'Product'}
            </div>
            <div style="font-size:11px; color:#3b82f6; font-weight:600; margin-bottom:2px;">
              ${prefix}${otherPartyName}
            </div>
            <div style="font-size:11px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${lastMsg}
            </div>
          </div>
          <div style="font-size:10px; color:var(--text-muted); text-align:right; white-space:nowrap;">
            ${time}
          </div>
        </div>
      `;
        }).join('');

        listEl.innerHTML = chatsHtml;

        // Attach click listeners
        listEl.querySelectorAll('.chat-list-item').forEach(el => {
            el.addEventListener('click', () => {
                const chatId = el.getAttribute('data-chat-id');
                openChatConversation(chatId);
            });
            el.onmouseenter = () => { el.style.background = 'rgba(59, 130, 246, 0.05)'; };
            el.onmouseleave = () => { el.style.background = 'transparent'; };
        });
    }, (err) => {
        console.error('Chat inbox listener error:', err);
    });
}

// Close chat inbox sidebar
function closeChatInbox() {
    const sidebar = document.getElementById('chatInboxSidebar');
    if (sidebar) sidebar.classList.remove('open');
    if (inboxUnsubscribe) {
        off(inboxUnsubscribe);
        inboxUnsubscribe = null;
    }
}

// Open a conversation modal
function openChatConversation(chatId) {
    activeChatId = chatId;
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const chatDocRef = dbRef(rtdb, `user_chats/${uid}/${chatId}`);

    // Set unread to false for current user when opening conversation
    const unreadRef = dbRef(rtdb, `user_chats/${uid}/${chatId}/unread`);
    set(unreadRef, false).catch(err => console.error('Error resetting unread:', err));

    get(chatDocRef).then(snapshot => {
        if (!snapshot.exists()) return;
        activeChatData = snapshot.val();

        const isSeller = uid === activeChatData.sellerId;
        const otherPartyName = isSeller ? (activeChatData.buyerName || 'Buyer') : (activeChatData.sellerName || 'Seller');

        // Populate header
        const header = document.getElementById('chatConvoHeader');
        if (header) {
            header.innerHTML = `
        ${activeChatData.productImage ? `<img src="${activeChatData.productImage}" style="width:40px;height:40px;border-radius:6px;object-fit:cover; border:1px solid var(--glass-border);"/>` : ''}
        <div>
          <div style="font-weight:700; font-size:13px; color:var(--text-primary);">${activeChatData.productTitle || 'Product'}</div>
          <div style="font-size:11px; color:#3b82f6; font-weight:600;">Chatting with ${otherPartyName}</div>
        </div>`;
        }

        // Show modal
        const modal = document.getElementById('chatConvoModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
        }

        const msgsDiv = document.getElementById('chatConvoMessages');
        if (msgsDiv) {
            msgsDiv.innerHTML = `
        <div style="text-align:center; color:var(--text-secondary); padding:40px 20px;">
          <i class="fa-solid fa-spinner fa-spin" style="font-size:24px; margin-bottom:10px;"></i>
          <p style="font-size:13px;">Loading messages...</p>
        </div>
      `;
        }

        // Listen to messages in real-time via RTDB onValue
        const msgsRef = dbRef(rtdb, `chats/${chatId}/messages`);
        if (convoUnsubscribe) {
            off(convoUnsubscribe);
            convoUnsubscribe = null;
        }

        convoUnsubscribe = msgsRef;
        onValue(msgsRef, (snap) => {
            if (!msgsDiv) return;

            const data = snap.val();
            if (!data) {
                msgsDiv.innerHTML = `
          <div style="text-align:center; color:var(--text-secondary); padding:40px 20px;">
            <p style="font-size:13px;">No messages in this chat yet.</p>
          </div>
        `;
                return;
            }

            const currentUid = auth.currentUser?.uid;
            const keys = Object.keys(data);
            msgsDiv.innerHTML = keys.map(k => {
                const m = data[k];
                const isMe = m.senderId === currentUid;
                const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                return `
          <div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:12px;">
            <div style="max-width:75%; padding:10px 14px; border-radius:16px; font-size:13px; line-height:1.4;
                        background:${isMe ? 'var(--primary-color, #3b82f6)' : 'rgba(255,255,255,0.06)'};
                        color:${isMe ? 'white' : 'var(--text-primary)'};
                        border-bottom-${isMe ? 'right' : 'left'}-radius:4px;
                        border:1px solid ${isMe ? 'transparent' : 'var(--glass-border, rgba(255,255,255,0.08))'};">
              <div style="font-weight:700; font-size:10px; margin-bottom:3px; opacity:0.85;">
                ${isMe ? 'You' : (m.senderName || 'User')}
              </div>
              <div style="word-break:break-word;">${m.text}</div>
              <div style="font-size:8px; text-align:right; margin-top:4px; opacity:0.6; font-weight:500;">
                ${timeStr}
              </div>
            </div>
          </div>`;
            }).join('');

            msgsDiv.scrollTop = msgsDiv.scrollHeight;
        }, (error) => {
            console.error('Error listening to convo messages:', error);
        });
    }).catch(err => console.error('Error loading chat metadata:', err));
}

// Close conversation modal
function closeChatConversation() {
    const modal = document.getElementById('chatConvoModal');
    if (modal) modal.style.display = 'none';
    if (convoUnsubscribe) {
        off(convoUnsubscribe);
        convoUnsubscribe = null;
    }
    activeChatId = null;
    activeChatData = null;
}

// Send message (works for both seller and buyer role in conversation modal)
async function sendSellerMessage() {
    const input = document.getElementById('chatConvoInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text || !activeChatId || !activeChatData) return;
    const user = auth.currentUser;
    if (!user) return;

    input.value = '';

    const isSeller = user.uid === activeChatData.sellerId;
    const senderName = isSeller
        ? (user.displayName || user.email?.split('@')[0] || 'Seller')
        : (user.displayName || user.email?.split('@')[0] || 'Buyer');

    const recipientId = isSeller ? activeChatData.buyerId : activeChatData.sellerId;

    try {
        const messagesRef = dbRef(rtdb, `chats/${activeChatId}/messages`);
        const newMessageRef = push(messagesRef);

        await set(newMessageRef, {
            senderId: user.uid,
            senderName,
            text,
            timestamp: Date.now()
        });

        // Update metadata preview for both parties
        const updates = {};
        updates[`user_chats/${activeChatData.buyerId}/${activeChatId}/lastMessage`] = text;
        updates[`user_chats/${activeChatData.buyerId}/${activeChatId}/lastMessageTime`] = new Date().toISOString();
        updates[`user_chats/${activeChatData.buyerId}/${activeChatId}/unread`] = isSeller; // true if buyer is recipient
        updates[`user_chats/${activeChatData.sellerId}/${activeChatId}/lastMessage`] = text;
        updates[`user_chats/${activeChatData.sellerId}/${activeChatId}/lastMessageTime`] = new Date().toISOString();
        updates[`user_chats/${activeChatData.sellerId}/${activeChatId}/unread`] = !isSeller; // true if seller is recipient

        await update(dbRef(rtdb), updates);

        // Push notification to recipient
        const notifId = 'chat_' + Date.now();
        const notifRef = dbRef(rtdb, `user_notifications/${recipientId}/${notifId}`);
        await set(notifRef, {
            id: notifId,
            title: `New Message from ${senderName}`,
            message: text,
            timestamp: Date.now(),
            read: false,
            productId: activeChatData.productId || '',
            chatId: activeChatId,
            type: 'chat'
        });
    } catch (err) {
        console.error('Error sending convo message:', err);
        showToast('Failed to send message.', 'error');
    }
}

// Attach UI listeners for inbox & conversation UI
document.getElementById('chatInboxBtn')?.addEventListener('click', openChatInbox);
document.getElementById('closeChatInbox')?.addEventListener('click', closeChatInbox);
document.getElementById('closeChatConvo')?.addEventListener('click', closeChatConversation);
document.getElementById('chatConvoSendBtn')?.addEventListener('click', sendSellerMessage);
document.getElementById('chatConvoInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendSellerMessage(); });

// Real-time unread chats badge count listener
let unreadChatsListenerRef = null;

function listenToUnreadChats(uid) {
    if (unreadChatsListenerRef) {
        off(unreadChatsListenerRef);
    }
    const userChatsRef = dbRef(rtdb, `user_chats/${uid}`);
    unreadChatsListenerRef = userChatsRef;
    onValue(userChatsRef, (snapshot) => {
        const data = snapshot.val();
        let unreadCount = 0;
        if (data) {
            Object.keys(data).forEach(k => {
                if (data[k].unread === true) {
                    unreadCount++;
                }
            });
        }
        const badge = document.getElementById('chatInboxBadge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
                badge.style.alignItems = 'center';
                badge.style.justifyContent = 'center';
            } else {
                badge.style.display = 'none';
            }
        }
    });
}

// Global submit function for inquiry replies
window.submitInquiryReply = async function (productId, inquiryId, replyText) {
    if (!replyText || !replyText.trim()) {
        showToast('Please type a reply.', 'error');
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
        const inquiryRef = dbRef(rtdb, `inquiries/${productId}/${inquiryId}`);
        const snapshot = await get(inquiryRef);
        if (!snapshot.exists()) {
            showToast('Inquiry not found.', 'error');
            return;
        }

        const inquiryData = snapshot.val();

        // Update inquiry in RTDB
        await update(inquiryRef, {
            answer: replyText.trim(),
            answered: true,
            answerTimestamp: Date.now()
        });

        // Push notification to the buyer
        const notifId = 'ans_' + Date.now();
        const buyerId = inquiryData.buyerId;
        const notifRef = dbRef(rtdb, `user_notifications/${buyerId}/${notifId}`);
        await set(notifRef, {
            id: notifId,
            title: `Answer to inquiry on ${inquiryData.productTitle}`,
            message: `Seller replied: ${replyText.trim()}`,
            timestamp: Date.now(),
            read: false,
            productId: productId,
            type: 'inquiry'
        });

        showToast('Reply submitted! ✉️', 'success');

    } catch (err) {
        console.error('Error submitting reply:', err);
        showToast('Failed to submit reply.', 'error');
    }
};

// Ensure inbox badge updates based on unread counts
function updateChatInboxBadge() {
    const badge = document.getElementById('chatInboxBadge');
    if (badge) badge.style.display = 'none';
}

// Call badge updater after auth state change
onAuthStateChanged(auth, (user) => {
    if (user) {
        listenToUnreadChats(user.uid);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    loadNotifications();
    renderCart();
    // Remove duplicate posts (e.g., duplicated phone designs)
    dedupePosts();
});
