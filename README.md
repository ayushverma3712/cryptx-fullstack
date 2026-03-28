A full-stack web application for encrypting and decrypting images, audio, and video files using **AES-256-CBC** encryption, built with **Node.js + Express + Firebase + React**.

---

## 🏗️ Architecture

```
cryptx-fullstack/
├── server/                   ← Node.js + Express Backend
│   ├── index.js              ← Entry point
│   ├── .env.example          ← Environment template
│   ├── config/
│   │   ├── firebase.js       ← Firebase Admin SDK
│   │   └── email.js          ← Nodemailer (OTP + Reset emails)
│   ├── middleware/
│   │   └── auth.js           ← JWT verification middleware
│   └── routes/
│       ├── auth.js           ← Register, Login, OTP, Reset, Profile
│       └── history.js        ← File operation history CRUD
│
└── client/                   ← React Frontend
    ├── public/index.html
    └── src/
        ├── App.js            ← Router + all routes
        ├── index.js          ← Entry point
        ├── index.css         ← Global dark theme styles
        ├── context/
        │   └── AuthContext.js ← Global auth state
        ├── utils/
        │   ├── api.js        ← Axios with JWT interceptor
        │   └── crypto.js     ← AES-256-CBC encrypt/decrypt
        ├── components/
        │   ├── AppLayout.js  ← Sidebar + responsive layout
        │   ├── Sidebar.js    ← Navigation
        │   ├── DropZone.js   ← File drag-and-drop
        │   └── ProtectedRoute.js ← Auth guards
        └── pages/
            ├── AuthPage.js       ← Login + Register + Forgot
            ├── VerifyEmail.js    ← 6-digit OTP input
            ├── ResetPassword.js  ← Password reset via token
            ├── Dashboard.js      ← Stats + recent activity
            ├── EncryptPage.js    ← Encrypt image/audio/video
            ├── DecryptPage.js    ← Decrypt .enc files
            ├── HistoryPage.js    ← File history with filters
            ├── ProfilePage.js    ← User profile + stats
            └── SettingsPage.js   ← Change password + settings
```

---

## ⚙️ Setup Instructions

### Step 1 — Firebase Setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add Project"** → name it `cryptx`
3. Go to **Authentication** → **Sign-in method** → Enable **Email/Password**
4. Go to **Firestore Database** → **Create database** → Start in **Test mode**
5. Go to **Project Settings** → **Service Accounts** → **Generate New Private Key**
6. Download the JSON file — you'll need values from it for `.env`

### Step 2 — Gmail App Password (for emails)
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. **Security** → **2-Step Verification** (enable if not already)
3. **Security** → **App passwords** → Select **Mail** → **Other** → name it `CryptX`
4. Copy the 16-character password shown

### Step 3 — Server Setup
```bash
cd server

# Copy and fill the environment file
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
JWT_SECRET=your_very_long_random_secret_here

# From Firebase service account JSON:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Gmail:
EMAIL_USER=your.gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   ← 16-char app password
EMAIL_FROM="CryptX Security <your.gmail@gmail.com>"

CLIENT_URL=http://localhost:3000
OTP_EXPIRY_MINUTES=10
```

```bash
npm install
npm run dev      # Starts on http://localhost:5000
```

### Step 4 — Client Setup
```bash
cd client
npm install
npm start        # Starts on http://localhost:3000
```

### Step 5 — Firestore Indexes
When you first use the History filter, Firebase may ask you to create a composite index. Click the link in the browser console or server log and create it.

You need one index on collection `fileHistory`:
- Fields: `uid` (Ascending) + `operation` (Ascending) + `createdAt` (Descending)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📝 **Register** | Full name, email, password with strength meter |
| 📧 **Email OTP** | 6-digit code sent via Gmail, 10-min expiry, 5-attempt lock |
| 🔑 **Login / Logout** | JWT-based sessions, 7-day expiry |
| 🔒 **Forgot Password** | Secure reset link via email, 1-hour expiry |
| 🔐 **Change Password** | Re-authenticate + bcrypt update |
| 👤 **User Profile** | Edit name, view stats, security info |
| 🖼️ **Encrypt Image** | JPG, PNG, GIF, WebP, BMP, SVG, TIFF |
| 🎵 **Encrypt Audio** | MP3, WAV, OGG, AAC, FLAC, M4A |
| 🎬 **Encrypt Video** | MP4, AVI, MOV, MKV, WebM, FLV |
| 🔓 **Decrypt** | Any CryptX .enc file with correct password |
| 📋 **File History** | Per-user log, filter by operation, delete entries |
| 📊 **Dashboard** | Stats: total encryptions, decryptions, data processed |
| ⚙️ **Settings** | Change password, view system config |

---

## 🔒 Security Details

- **AES-256-CBC** — 256-bit key, Cipher Block Chaining mode
- **PBKDF2** — Password-based key derivation, 1000 iterations, random salt
- **Random IV** — Unique 128-bit initialization vector per encryption
- **bcrypt** — Password hashing with cost factor 12
- **JWT** — Server-side validated, 7-day expiry
- **Rate limiting** — 20 auth attempts per 15 min, 3 OTP requests per minute
- **Helmet.js** — HTTP security headers
- **Local processing** — Files never leave the user's browser

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS (dark theme), Google Fonts |
| Encryption | CryptoJS (AES-256-CBC + PBKDF2) |
| HTTP Client | Axios with JWT interceptor |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| Auth | bcryptjs + JSON Web Tokens |
| Email | Nodemailer + Gmail SMTP |
| Security | Helmet, express-rate-limit, express-validator |

---

## 👥 Team

| Name | Roll No | Role |
|---|---|---|
| Ayush Verma   | 230213648 | Team Lead |
| Shivansh Garg | 23021145  | Developer |
| Rani Kumari   | 230121829 | Developer |
| Tanuja Bhatt  | 230223711 | Developer |

**Institution:** Graphic Era University  
**Team ID:** CYBER-IV-T073  
**Team Name:** CryptX
