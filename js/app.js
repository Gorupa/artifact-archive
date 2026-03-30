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

// --- 2. DATA SYNC ---
async function fetchData() {
    grid.innerHTML = `<p style="text-align:center; color:#666; width:100%;">Opening archives...</p>`;
    try {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, { items: [] });
            collection = [];
        } else {
            collection = snap.data().items || [];
        }
        checkMilestones();
        renderGrid();
    } catch (e) {
        grid.innerHTML = `<p style="color:red; text-align:center; width:100%;">Failed to load data. Ensure Firestore rules are set.</p>`;
    }
}

// --- 3. DYNAMIC FORM & MILESTONES ---
window.openAddModal = function() {
    document.getElementById('modal-add').classList.add('active');
    toggleFormFields();
}

window.toggleFormFields = function() {
    const type = document.getElementById('inp-type').value;
    document.getElementById('group-currency').classList.remove('active');
    document.getElementById('group-pop').classList.remove('active');

    if (type === 'Coin' || type === 'Note') document.getElementById('group-currency').classList.add('active');
    if (type === 'Card') document.getElementById('group-pop').classList.add('active');
}

function checkMilestones() {
    const count = collection.length;
    const lDiary = document.getElementById('lock-diary');
    const lBox = document.getElementById('lock-box');
    const lSuit = document.getElementById('lock-suitcase');

    if (count >= 5) lDiary.classList.add('unlocked');
    if (count >= 15) lBox.classList.add('unlocked');
    if (count >= 30) lSuit.classList.add('unlocked');
}

document.querySelectorAll('.container-lock').forEach(el => {
    el.addEventListener('click', () => {
        if (!el.classList.contains('unlocked')) {
            alert("Log more items to unlock this storage container!");
            return;
        }
        document.querySelectorAll('.container-lock').forEach(c => c.classList.remove('active-container'));
        el.classList.add('active-container');
        document.body.setAttribute('data-container', el.getAttribute('data-target'));
    });
});

// --- 4. RARITY ENGINE ---
function calculateRarity(qty, value, condition) {
    let score = 0;
    if (qty === 1) score += 50;
    if (qty > 1 && qty < 5) score += 20;
    if (value > 5000) score += 30;
    if (value > 20000) score += 50;
    if (condition === "Mint") score += 20;

    if (score >= 100) return { label: "🏆 GRAIL", class: "rare-grail" };
    if (score >= 70) return { label: "🔷 RARE", class: "rare-rare" };
    if (score >= 40) return { label: "🟢 UNCOMMON", class: "rare-uncommon" };
    return { label: "⚪ COMMON", class: "rare-common" };
}

// --- 5. TACTILE RENDERING ---
function renderGrid() {
    grid.innerHTML = '';
    let totalValue = 0;

    if (collection.length === 0) {
        grid.innerHTML = `<p style="text-align:center; color:#666; grid-column:1/-1; padding:40px;">No items logged yet. Begin your archive.</p>`;
    }

    collection.forEach((item, index) => {
        totalValue += Number(item.value);
        const rarity = calculateRarity(item.qty, item.value, item.condition);
        
        let physicalHtml = "";

        if (item.type === "Coin") {
            physicalHtml = `
                <div class="item-coin">
                    <div class="coin-flag">${item.flag || '🌍'}</div>
                    <div class="coin-value">${item.denom || '-'}</div>
                </div>`;
        } else if (item.type === "Note") {
            physicalHtml = `
                <div class="item-note">
                    <div class="note-corners"><span>${item.denom || ''}</span><span>${item.denom || ''}</span></div>
                    <div class="note-center">${item.flag || '🌍'}</div>
                    <div class="note-corners"><span>${item.denom || ''}</span><span>${item.denom || ''}</span></div>
                </div>`;
        } else if (item.type === "Card") {
            physicalHtml = `
                <div class="item-sticker">
                    <div class="sticker-franchise">${item.franchise || item.name}</div>
                </div>`;
        } else if (item.type === "Stamp") {
            physicalHtml = `
                <div class="item-stamp">
                    <div class="stamp-inner">${item.flag || '✉️'}</div>
                </div>`;
        }

        const div = document.createElement('div');
        div.className = "item-wrapper";
        div.innerHTML = `
            <div class="item-qty">${item.qty}x</div>
            ${physicalHtml}
            <div class="item-rarity ${rarity.class}">${rarity.label}</div>
            
            <div class="item-details-tag">
                <div class="item-name">${item.name}</div>
                <div class="item-meta">${item.year || 'Unknown'} • ${item.condition}</div>
                <div class="item-meta" style="color:var(--accent);">₹${Number(item.value).toLocaleString()}</div>
                <button onclick="removeItem(${index})" style="background:none; border:none; color:var(--danger); font-size:12px; font-weight:600; cursor:pointer; margin-top:4px;">Remove</button>
            </div>
        `;
        grid.appendChild(div);
    });

    document.getElementById('total-value').innerText = `₹${totalValue.toLocaleString()}`;
}

// --- 6. LOGGING NEW ITEMS ---
document.getElementById('save-btn').addEventListener('click', async () => {
    const type = document.getElementById('inp-type').value;
    const name = document.getElementById('inp-name').value;
    const qty = parseInt(document.getElementById('inp-qty').value) || 1;
    const condition = document.getElementById('inp-cond').value;
    const value = parseInt(document.getElementById('inp-value').value) || 0;
    const year = document.getElementById('inp-year').value;

    if (!name) return alert("Item requires a name.");

    let newItem = { type, name, qty, condition, value, year };

    if (type === 'Coin' || type === 'Note') {
        newItem.flag = document.getElementById('inp-flag').value;
        newItem.denom = document.getElementById('inp-denom').value;
    } else if (type === 'Card') {
        newItem.franchise = document.getElementById('inp-franchise').value;
    }

    collection.push(newItem);

    try {
        await updateDoc(doc(db, "users", currentUser.uid), { items: collection });
        document.getElementById('modal-add').classList.remove('active');
        
        document.getElementById('inp-name').value = '';
        document.getElementById('inp-value').value = '';
        document.getElementById('inp-qty').value = '1';
        document.getElementById('inp-flag').value = '';
        document.getElementById('inp-denom').value = '';
        document.getElementById('inp-franchise').value = '';
        document.getElementById('inp-year').value = '';
        
        checkMilestones();
        renderGrid();
    } catch (e) { alert("Error saving to Archives."); }
});

window.removeItem = async (index) => {
    if(confirm("Delete this item from your archives?")) {
        collection.splice(index, 1);
        await updateDoc(doc(db, "users", currentUser.uid), { items: collection });
        checkMilestones();
        renderGrid();
    }
}
