// js/app.js
import { auth, provider, db } from "./firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const viewLogin = document.getElementById('view-login');
const viewApp = document.getElementById('view-app');
const grid = document.getElementById('artifact-grid');
let currentUser = null;
let collectionData = [];

// --- 1. AUTHENTICATION ---
document.getElementById('login-btn').addEventListener('click', async () => {
    try { await signInWithPopup(auth, provider); } 
    catch (error) { alert("Vault access denied: " + error.message); }
});

document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('profile-name').innerText = `Curator: ${user.displayName.split(' ')[0]}`;
        viewLogin.classList.remove('active');
        viewApp.classList.add('active');
        await fetchCollection();
    } else {
        currentUser = null;
        viewApp.classList.remove('active');
        viewLogin.classList.add('active');
    }
});

// --- 2. DATA FETCHING ---
async function fetchCollection() {
    grid.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">Opening archives...</p>`;
    try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
            await setDoc(userRef, { artifacts: [] });
            collectionData = [];
        } else {
            // We use a new array "artifacts" so we don't overwrite your credit card "deck"
            collectionData = docSnap.data().artifacts || []; 
        }
        renderCollection();
    } catch (e) {
        grid.innerHTML = `<p style="color: red;">Failed to access vault data.</p>`;
    }
}

// --- 3. RENDERING THE MUSEUM ---
function renderCollection() {
    grid.innerHTML = '';
    let totalValue = 0;

    if (collectionData.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; border: 1px dashed var(--border-subtle); border-radius: 8px;">
                <h3 class="serif" style="font-size: 24px; margin-bottom: 10px;">The display cases are empty.</h3>
                <p style="color: var(--text-muted);">Click 'Log Artifact' to catalog your first piece.</p>
            </div>`;
        document.getElementById('total-value').innerText = `₹0`;
        return;
    }

    collectionData.forEach((item, index) => {
        totalValue += Number(item.value);
        
        // Calculate Profit/Loss
        const profit = item.value - item.paid;
        let profitStr = profit >= 0 ? `<span style="color: #4ade80;">+₹${profit.toLocaleString()}</span>` : `<span style="color: #f87171;">-₹${Math.abs(profit).toLocaleString()}</span>`;

        const card = document.createElement('div');
        card.className = 'artifact-card';
        card.innerHTML = `
            <div class="artifact-category">${item.category}</div>
            <h2 class="artifact-name serif">${item.name}</h2>
            
            <div class="artifact-value">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Paid:</span>
                    <span>₹${Number(item.paid).toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Est. Value:</span>
                    <span class="value-highlight">₹${Number(item.value).toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                    <span>Return:</span>
                    <span>${profitStr}</span>
                </div>
            </div>
            <button onclick="deleteArtifact(${index})" class="btn-dark" style="width: 100%; margin-top: 20px; font-size: 12px; border-color: rgba(255,0,0,0.3);">Remove Artifact</button>
        `;
        grid.appendChild(card);
    });

    document.getElementById('total-value').innerText = `₹${totalValue.toLocaleString()}`;
}

// --- 4. SAVING & DELETING DATA ---
document.getElementById('save-btn').addEventListener('click', async () => {
    const name = document.getElementById('art-name').value;
    const category = document.getElementById('art-category').value;
    const paid = document.getElementById('art-paid').value || 0;
    const value = document.getElementById('art-value').value || 0;

    if (!name) return alert("Artifact needs a name.");

    collectionData.push({ name, category, paid: Number(paid), value: Number(value), dateAdded: Date.now() });

    try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { artifacts: collectionData }, { merge: true });
        document.getElementById('modal-add').classList.remove('active');
        
        // Clear inputs
        document.getElementById('art-name').value = '';
        document.getElementById('art-paid').value = '';
        document.getElementById('art-value').value = '';
        
        renderCollection();
    } catch (e) { alert("Failed to secure artifact: " + e.message); }
});

window.deleteArtifact = async (index) => {
    if(confirm("Permanently delete this artifact from the archive?")) {
        collectionData.splice(index, 1);
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { artifacts: collectionData });
        renderCollection();
    }
}
