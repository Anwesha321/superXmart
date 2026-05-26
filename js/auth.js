import { 
    auth, db, storage,
    googleProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail,
    sendEmailVerification,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signOut,
    doc, setDoc, getDoc,
    ref, uploadBytes, getDownloadURL
} from './firebaseConfig.js';
import { showToast } from './toast.js';
import { uploadToCloudinary } from './cloudinary.js';

// Setup Show/Hide Password toggles
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', (e) => {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Helper for button loading state
const setLoading = (btnId, isLoading) => {
    const btn = document.getElementById(btnId);
    if(btn) {
        if(isLoading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }
};

// --- BUYER SIGNUP ---
const signupBuyerForm = document.getElementById('signupBuyerForm');
if (signupBuyerForm) {
    signupBuyerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('buyerName').value;
        const email = document.getElementById('buyerEmail').value;
        const phone = document.getElementById('buyerPhone').value;
        const password = document.getElementById('buyerPassword').value;
        const confirmPassword = document.getElementById('buyerConfirmPassword').value;

        if (password !== confirmPassword) {
            return showToast('Passwords do not match.', 'error');
        }

        setLoading('signupBuyerBtn', true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            try {
                await sendEmailVerification(userCredential.user);
            } catch (verifError) {
                console.warn("Email verification could not be sent:", verifError);
            }
            
            // Save to Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                name,
                email,
                phone,
                role: 'buyer',
                createdAt: new Date().toISOString()
            });

            showToast('Account created successfully! 🎉', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            let message = 'An error occurred during signup.';
            if (error.code === 'auth/email-already-in-use') message = 'Email is already in use.';
            if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
            showToast(message, 'error');
        } finally {
            setLoading('signupBuyerBtn', false);
        }
    });
}

// --- SELLER SIGNUP ---
const signupSellerForm = document.getElementById('signupSellerForm');
if (signupSellerForm) {
    signupSellerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('sellerName').value;
        const phone = document.getElementById('sellerPhone').value;
        const email = document.getElementById('sellerEmail').value;
        const password = document.getElementById('sellerPassword').value;
        const confirmPassword = document.getElementById('sellerConfirmPassword').value;
        const address = document.getElementById('sellerAddress').value;
        const idType = document.getElementById('sellerIdType').value;
        const idFrontFile = document.getElementById('idFront').files[0];
        const idBackFile = document.getElementById('idBack').files[0];

        if (password !== confirmPassword) {
            return showToast('Passwords do not match.', 'error');
        }
        if (!idFrontFile || !idBackFile) {
            return showToast('Please upload both Front and Back images of your Government ID.', 'error');
        }

        setLoading('signupSellerBtn', true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            try {
                await sendEmailVerification(userCredential.user);
            } catch (verifError) {
                console.warn("Email verification could not be sent:", verifError);
            }
            
            // Upload Documents to Cloudinary
            let idFrontMeta = null;
            let idBackMeta = null;
            try {
                showToast('Uploading documents to Cloudinary...', 'info');
                idFrontMeta = await uploadToCloudinary(idFrontFile);
                idBackMeta = await uploadToCloudinary(idBackFile);
            } catch (error) {
                showToast('Failed to upload ID Documents. Please try again.', 'error');
                setLoading('signupSellerBtn', false);
                return;
            }

            // Save to Firestore — store full Cloudinary metadata + convenient URL fields
            await setDoc(doc(db, "users", uid), {
                uid, name, email, phone, address, idType,
                // Plain URL strings (used by admin panel for href links)
                idFrontUrl: idFrontMeta.secure_url,
                idBackUrl: idBackMeta.secure_url,
                // Full Cloudinary metadata objects (public_id, dimensions, format, etc.)
                idFrontMeta: idFrontMeta,
                idBackMeta: idBackMeta,
                role: 'seller',
                verificationStatus: 'pending',
                createdAt: new Date().toISOString()
            });

            // Show Popup Modal
            const modal = document.getElementById('successModal');
            if (modal) modal.style.display = 'flex';
            await signOut(auth); // Sign out since under review
            
        } catch (error) {
            let message = 'An error occurred during signup.';
            if (error.code === 'auth/email-already-in-use') message = 'Email is already in use.';
            showToast(message, 'error');
        } finally {
            setLoading('signupSellerBtn', false);
        }
    });
}

// --- LOGIN HANDLING ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        setLoading('loginBtn', true);
        try {
            const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistenceType);
            
            showToast('Verifying credentials...', 'info');
            await signInWithEmailAndPassword(auth, email, password);
            
            // Note: Centralized redirection & role guards are handled in authGuard.js
            
        } catch (error) {
            console.error("Login error:", error);
            let message = 'An error occurred during login.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'Invalid email or password.';
            }
            showToast(message, 'error');
            setLoading('loginBtn', false);
        }
    });
}

// --- FORGOT PASSWORD ---
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        
        setLoading('resetBtn', true);
        try {
            await sendPasswordResetEmail(auth, email);
            showToast('Password reset email sent!', 'success');
        } catch (error) {
            let message = 'Failed to send reset email.';
            if (error.code === 'auth/user-not-found') message = 'No user found with this email.';
            showToast(message, 'error');
        } finally {
            setLoading('resetBtn', false);
        }
    });
}

// On page load, handle redirect result
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            // User signed in via redirect!
            const docRef = doc(db, "users", result.user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                // Create a buyer role automatically for Google users
                const displayName = result.user.displayName || result.user.email.split('@')[0] || 'Google User';
                await setDoc(docRef, {
                    uid: result.user.uid,
                    name: displayName,
                    email: result.user.email,
                    role: 'buyer',
                    createdAt: new Date().toISOString()
                });
            }

            showToast(`Welcome ${result.user.displayName || 'User'}! 🎉`, 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        }
    } catch (error) {
        console.error("Redirect auth error:", error);
        if (error.code && error.code !== 'auth/popup-blocked') {
            let message = 'Google authentication redirect failed.';
            if (error.code === 'auth/operation-not-allowed') {
                message = 'Google Sign-In is not enabled in Firebase Console. Please enable it.';
            } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
                message = "Google Sign-in is not supported on 'file://' protocol. Please run on a local server.";
            } else if (error.code === 'auth/unauthorized-domain') {
                message = "Domain not authorized! Please open the app via 'http://localhost:5500' instead of '127.0.0.1', or add '127.0.0.1' to Authorized Domains in Firebase console.";
            }
            showToast(message, 'error');
        }
    }
});

// --- GOOGLE LOGIN ---
const handleGoogleAuth = async (btnId) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const originalContent = btn.innerHTML;
        try {
            btn.innerHTML = '<span class="spinner" style="display:inline-block; border-color:var(--text-primary); border-top-color:transparent;"></span>';
            btn.disabled = true;

            // Check if running on local file system (Google sign-in won't work on file:// protocol)
            if (window.location.protocol === 'file:') {
                showToast("Google Authentication is not supported under the 'file://' protocol. Please run via a local web server.", 'error');
                btn.innerHTML = originalContent;
                btn.disabled = false;
                return;
            }

            let result;
            try {
                result = await signInWithPopup(auth, googleProvider);
            } catch (popupError) {
                console.warn("Popup blocked or failed, attempting redirect:", popupError);
                if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user' || popupError.code === 'auth/cancelled-popup-request') {
                    showToast('Popup blocked. Redirecting to Google Sign-In...', 'info');
                    await signInWithRedirect(auth, googleProvider);
                    return;
                } else if (popupError.code === 'auth/operation-not-supported-in-this-environment') {
                    try {
                        showToast('Popup not supported. Attempting redirect...', 'info');
                        await signInWithRedirect(auth, googleProvider);
                        return;
                    } catch (redirectError) {
                        console.error("Redirect also failed:", redirectError);
                        showToast("Google Sign-In is not supported under 'file://'. Please run the app on a local server.", 'error');
                        btn.innerHTML = originalContent;
                        btn.disabled = false;
                        return;
                    }
                } else {
                    throw popupError;
                }
            }
            
            // Check if user exists in Firestore
            const docRef = doc(db, "users", result.user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                // Create a buyer role automatically for Google users
                const displayName = result.user.displayName || result.user.email.split('@')[0] || 'Google User';
                await setDoc(docRef, {
                    uid: result.user.uid,
                    name: displayName,
                    email: result.user.email,
                    role: 'buyer',
                    createdAt: new Date().toISOString()
                });
            }

            showToast(`Welcome ${result.user.displayName || 'User'}! 🎉`, 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } catch (error) {
            console.error("Google auth error:", error);
            let message = 'Google authentication failed.';
            if (error.code === 'auth/operation-not-allowed') {
                message = 'Google Sign-In is not enabled in Firebase Console. Please enable it.';
            } else if (error.code === 'auth/network-request-failed') {
                message = 'Network error. Please check your internet connection.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                message = 'An account already exists with the same email but different login credentials.';
            } else if (error.code === 'auth/unauthorized-domain') {
                message = "Domain not authorized! Please open the app via 'http://localhost:5500' instead of '127.0.0.1', or add '127.0.0.1' to Authorized Domains in Firebase console.";
            }
            showToast(message, 'error');
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    });
};

handleGoogleAuth('googleLoginBtn');
handleGoogleAuth('googleSignupBtn');

// --- DYNAMIC STATUS PARAM HANDLING ---
const urlParams = new URLSearchParams(window.location.search);
const status = urlParams.get('status');
const unverifiedAlert = document.getElementById('unverifiedAlert');
if (unverifiedAlert && status) {
    unverifiedAlert.style.display = 'block';
    const alertText = unverifiedAlert.querySelector('p');
    const resendBtn = document.getElementById('resendVerificationBtn');
    
    if (status === 'pending') {
        if (alertText) alertText.textContent = "Your Seller account status is pending approval. Please wait for an Admin to verify your account.";
        if (resendBtn) resendBtn.style.display = 'none';
        unverifiedAlert.style.borderColor = 'var(--accent-blue, #3b82f6)';
        unverifiedAlert.style.background = 'rgba(59, 130, 246, 0.1)';
        alertText.style.color = 'var(--accent-blue, #3b82f6)';
    } else if (status === 'rejected') {
        if (alertText) alertText.textContent = "Your Seller registration has been rejected. Please register with a different account or contact support.";
        if (resendBtn) resendBtn.style.display = 'none';
        unverifiedAlert.style.borderColor = 'var(--danger, #ef4444)';
        unverifiedAlert.style.background = 'rgba(239, 68, 68, 0.1)';
        alertText.style.color = '#ef4444';
    }
}
