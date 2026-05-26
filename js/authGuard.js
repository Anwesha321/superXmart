import { auth, db } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Check if current page is an auth page
const isAuthPage = window.location.pathname.includes('login.html') || 
                   window.location.pathname.includes('signup.html') || 
                   window.location.pathname.includes('signup-buyer.html') || 
                   window.location.pathname.includes('signup-seller.html') || 
                   window.location.pathname.includes('forgot-password.html');

const isAdminPage = window.location.pathname.includes('admin.html');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in. Fetch role and verification status from Firestore.
        let role = 'buyer'; // default fallback
        let status = 'approved'; // default fallback

        // Hardcoded admin credential check
        if (user.email === 'admin@superxmart.com') {
            role = 'admin';
            status = 'approved';
        } else {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    role = data.role || 'buyer';
                    status = data.verificationStatus || 'approved';
                }
            } catch (err) {
                console.error("Error fetching user role and status in authGuard:", err);
            }
        }

        // 1. Seller Verification Status Enforcement
        if (role === 'seller') {
            if (status === 'pending') {
                await signOut(auth);
                window.location.replace('login.html?status=pending');
                return;
            } else if (status === 'rejected') {
                await signOut(auth);
                window.location.replace('login.html?status=rejected');
                return;
            }
        }

        // 2. Route Protection based on Role
        if (isAdminPage && role !== 'admin') {
            window.location.replace('home.html');
            return;
        }

        if (!isAdminPage && role === 'admin' && !isAuthPage) {
            window.location.replace('admin.html');
            return;
        }

        // Dispatch global event so page can react to role
        window.dispatchEvent(new CustomEvent('userRoleLoaded', { detail: { role, status } }));

        // 3. Redirect if logged in user is on an auth page
        if (isAuthPage) {
            if (role === 'admin') {
                window.location.replace('admin.html');
            } else {
                window.location.replace('home.html');
            }
        }
    } else {
        // User is signed out. If trying to access protected pages, redirect to login.
        if (!isAuthPage) {
            window.location.replace('login.html');
        }
    }
});
