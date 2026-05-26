import { db, auth, signOut, collection, getDocs, doc, updateDoc } from './firebaseConfig.js';
import { showToast } from './toast.js';

// Admin Logout
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'login.html';
    });
}

// Load Sellers
const loadSellers = async () => {
    const tbody = document.getElementById('sellersTableBody');
    if (!tbody) return;

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const sellers = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.role === 'seller') {
                sellers.push({ id: doc.id, ...data });
            }
        });

        if (sellers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem;">No sellers found.</td></tr>';
            return;
        }

        tbody.innerHTML = sellers.map(seller => `
            <tr>
                <td><strong>${seller.name}</strong></td>
                <td>
                    ${seller.email}<br>
                    <small style="color: var(--text-secondary);">${seller.phone}</small>
                </td>
                <td style="max-width: 200px;">
                    <small>${seller.address}</small>
                </td>
                <td>
                    <span style="font-size: 0.8rem; font-weight: 600;">${seller.idType}</span><br>
                    ${seller.idDocumentUrl ? `
                        <a href="${seller.idDocumentUrl}" target="_blank" class="id-link">View Document</a>
                    ` : `
                        <a href="${seller.idFrontUrl || '#'}" target="_blank" class="id-link">View Front</a> | 
                        <a href="${seller.idBackUrl || '#'}" target="_blank" class="id-link">View Back</a>
                    `}
                </td>
                <td>
                    <span class="status-badge status-${seller.verificationStatus || 'pending'}">
                        ${seller.verificationStatus || 'pending'}
                    </span>
                </td>
                <td>
                    ${seller.verificationStatus === 'pending' ? `
                        <button class="action-btn btn-approve" onclick="updateSellerStatus('${seller.id}', 'approved')">Approve</button>
                        <button class="action-btn btn-reject" onclick="updateSellerStatus('${seller.id}', 'rejected')">Reject</button>
                    ` : `
                        <button class="action-btn" disabled style="opacity: 0.5; background: var(--text-secondary);">Processed</button>
                    `}
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Error loading sellers:", error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--danger);">Error loading sellers.</td></tr>';
    }
};

// Expose update function to global scope for inline onclick handlers
window.updateSellerStatus = async (uid, status) => {
    if (!confirm(`Are you sure you want to mark this seller as ${status}?`)) return;
    
    try {
        const sellerRef = doc(db, "users", uid);
        await updateDoc(sellerRef, {
            verificationStatus: status
        });
        showToast(`Seller successfully ${status}.`, 'success');
        loadSellers(); // Reload table
    } catch (error) {
        console.error("Error updating status:", error);
        showToast('Error updating status.', 'error');
    }
};

// Init
auth.onAuthStateChanged((user) => {
    if (user && user.email === "admin@superxmart.com") {
        loadSellers();
    }
});
