# 🧳 The Collector's Archives

> **Your collection deserves a museum, not a cardboard box.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-artifact--archive.pages.dev-orange?style=for-the-badge)](https://artifact-archive.pages.dev/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=firebase)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

---

## 📖 About the Project

Most physical collections — from a 1918 Silver Rupee to a Holographic Charizard — spend their lives in dark boxes, binders, and forgotten spreadsheets. **The Collector's Archives** is the antidote.

It's a tactile, privacy-first digital vault for tracking coins, banknotes, stamps, and pop-culture artifacts. Items aren't rendered as rows in a table — they're rendered as the objects they are. Coins appear as metallic circles. Banknotes carry a textured paper finish. Trading cards shimmer with holographic gradients. The entire interface advances through gamified storage milestones as your collection grows, graduating from a simple *Diary* to a *Wooden Box* to a full *Vintage Suitcase*.

Underneath the aesthetics sits a real **Rarity Engine** — an algorithm that analyzes each item's quantity, market value, and condition to automatically assign collector-grade classifications, from `⚪ COMMON` all the way to `🏆 GRAIL`.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎨 **Tactile CSS Rendering** | Items are styled as physical objects — metallic coins, textured banknotes, holographic cards |
| 🔮 **The Rarity Engine** | Automatically classifies items as `COMMON`, `UNCOMMON`, `RARE`, or `GRAIL` based on scarcity and value |
| 🏆 **Storage Milestones** | Gamified progression unlocks new UI themes as your collection grows |
| 📋 **Adaptive Logging Forms** | Forms intelligently adapt per artifact type — denomination fields for coins, franchise fields for cards |
| 💰 **Real-Time Portfolio Value** | Tracks the total estimated market value of your entire collection |

---

## 🔒 Privacy Manifesto

Your collection is your private business — not ours. The Collector's Archives is built on a simple principle: **absolute data sovereignty**.

1. **No Tracking** — We do not track your items, your habits, or your browsing behavior.
2. **No Advertising** — No ads, no affiliate data pipelines, no third-party analytics.
3. **No Data Selling** — Your collection data is yours. Full stop.
4. **Encrypted Storage** — All data is securely encrypted and stored via Firebase.
5. **Regional Hosting** — Data is stored on Indian servers, keeping it close to home.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Pure HTML5, Vanilla JavaScript (ES6 Modules) |
| Styling | Custom CSS3 — Flexbox, Grid, CSS Variables for dynamic theming |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Firebase Firestore (NoSQL, real-time) |
| Deployment | Cloudflare Pages (global edge network) |

---

## 🚀 Getting Started

### Prerequisites

- A free [Firebase](https://firebase.google.com/) account
- [VS Code](https://code.visualstudio.com/) with the **Live Server** extension, or any local web server

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/gorupa/artifact-archive.git
cd artifact-archive
```

**2. Set up Firebase**

- Create a new project in the [Firebase Console](https://console.firebase.google.com/)
- Enable **Google Authentication** under *Build → Authentication → Sign-in method*
- Create a **Firestore Database** under *Build → Firestore Database*

**3. Configure Firestore Security Rules**

In the Firebase Console, navigate to *Firestore → Rules* and apply the following to ensure each user can only access their own data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**4. Add your Firebase config**

Open `js/firebase-config.js` and replace the placeholder values with the keys from your Firebase project settings:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**5. Launch**

Open `index.html` via the Live Server extension, or serve the directory with any local HTTP server. No build step. No package manager. No configuration beyond the above.

---

## 🤝 Contributing

Contributions are warmly welcomed. Whether you're improving the Rarity Engine logic, adding a new artifact category, or refining the CSS rendering — all pull requests are reviewed with care.

**To contribute:**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add: brief description of change'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main` with a clear description of what you've changed and why

For significant changes, please open an issue first to discuss the approach. This keeps efforts aligned and avoids duplicate work.

---

## 👤 Author

Built with purpose by [@gorupa](https://github.com/Gorupa).

If this project is useful to you, a ⭐ on the repository goes a long way.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
