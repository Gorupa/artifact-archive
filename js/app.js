// js/app.js
import { auth, provider, db } from "./firebase-config.js";
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const viewLogin = document.getElementById('view-login');
const viewApp = document.getElementById('view-app');
const grid = document.getElementById('grid');

let currentUser = null;
let collection = [];

// --- 1. AUTHENTICATION & PROFILE ---
document.getElementById('login-btn').addEventListener('click', () => signInWithPopup(auth, provider));
document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Clean, simple profile UI
        document.getElementById('user-name').innerText = user.displayName.split(' ')[0];
        document.getElementById('user-avatar').src = user.photoURL;
        
        viewLogin.classList.remove('active');
        viewApp.classList.add('active');
        await fetchData();
    } else {
        currentUser = null;
        viewApp.classList.remove('active');
        viewLogin.classList.add('active');
    }
});

// --- 2. FIRESTORE DATA SYNC ---
async function fetchData() {
    grid.innerHTML = `<p style="text-align:center; color:#666; width:100%;">Dusting off the desk...</p>`;
    try {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, { items: [] });
            collection = [];
        } else {
            collection = snap.data().items || [];
        }
        renderGrid();
    } catch (e) {
        grid.innerHTML = `<p style="color:red; text-align:center; width:100%;">Failed to load data. Ensure Firestore rules are set.</p>`;
    }
}

// --- 3. THE RARITY ENGINE ---
// Analyzes the artifact to generate collector jargon
function calculateRarity(qty, value, condition) {
    let score = 0;
    if (qty === 1) score += 50;
    if (qty > 1 && qty < 5) score += 20;
    if (value > 5000) score += 30;
    if (value > 20000) score += 50;
    if (condition === "Mint") score += 20;

    if (score >= 100) return { label: "🏆 GRAIL PIECE", class: "rare-grail" };
    if (score >= 70) return { label: "🔷 RARE", class: "rare-rare" };
    if (score >= 40) return { label: "🟢 UNCOMMON", class: "rare-uncommon" };
    return { label: "⚪ COMMON", class: "rare-common" };
}

// --- 4. TACTILE RENDERING ---
function renderGrid() {
    grid.innerHTML = '';
    let totalValue = 0;

    if (collection.length === 0) {
        grid.innerHTML = `<p style="text-align:center; color:#666; grid-column:1/-1; padding:40px;">No items logged yet. Add your first piece.</p>`;
    }

    collection.forEach((item, index) => {
        totalValue += Number(item.value);
        
        // 1. Determine the physical CSS shape
        let shapeClass = "";
        if (item.type === "Coin") shapeClass = "item-coin";
        if (item.type === "Note") shapeClass = "item-note";
        if (item.type === "Sticker") shapeClass = "item-sticker";

        // 2. Predict Rarity Jargon
        const rarity = calculateRarity(item.qty, item.value, item.condition);

        // 3. Build the physical element
        const div = document.createElement('div');
        div.className = "item-wrapper";
        div.innerHTML = `
            <div class="item-qty">${item.qty}x</div>
            <div class="${shapeClass}">
                <div class="item-name">${item.name}</div>
            </div>
            <div class="item-rarity ${rarity.class}">${rarity.label}</div>
            
            <div style="margin-top: 24px; text-align: center; width: 100%;">
                <p style="font-size: 13px; color: var(--text-muted); font-weight: 600;">${item.condition} • ₹${Number(item.value).toLocaleString()}</p>
                <button onclick="removeItem(${index})" style="background:none; border:none; color:var(--danger); font-size:12px; font-weight:600; cursor:pointer; margin-top:4px;">Remove</button>
            </div>
        `;
        grid.appendChild(div);
    });

    document.getElementById('total-value').innerText = `₹${totalValue.toLocaleString()}`;
}

// --- 5. LOGGING NEW ITEMS ---
document.getElementById('save-btn').addEventListener('click', async () => {
    const name = document.getElementById('inp-name').value;
    const qty = parseInt(document.getElementById('inp-qty').value) || 1;
    const type = document.getElementById('inp-type').value;
    const condition = document.getElementById('inp-cond').value;
    const value = parseInt(document.getElementById('inp-value').value) || 0;

    if (!name) return alert("Item requires a name.");

    collection.push({ name, qty, type, condition, value });

    try {
        await updateDoc(doc(db, "users", currentUser.uid), { items: collection });
        document.getElementById('modal-add').classList.remove('active');
        
        // Reset form
        document.getElementById('inp-name').value = '';
        document.getElementById('inp-value').value = '';
        document.getElementById('inp-qty').value = '1';
        
        renderGrid();
    } catch (e) { alert("Error saving to desk."); }
});

window.removeItem = async (index) => {
    if(confirm("Delete this item from your desk?")) {
        collection.splice(index, 1);
        await updateDoc(doc(db, "users", currentUser.uid), { items: collection });
        renderGrid();
    }
}
