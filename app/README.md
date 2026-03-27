# 🚀 Quick Start Guide

## ⚡ Get Running in 2 Minutes

### 1. Install Dependencies
```bash
cd app
npm install
```

### 2. Start Backend (in another terminal)
```bash
cd Back-End
npm start
# Runs on http://localhost:5000
```

### 3. Start Frontend Dev Server
```bash
cd app
npm run dev
# Runs on http://localhost:5173
```

### 4. Open in Browser
Go to: **http://localhost:5173**

---

## 📱 Build for Android Play Store

### 1. Install Capacitor (first time only)
```bash
cd app
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. Build Web & Add Android
```bash
npm run build           # Build for production
npx cap add android     # Create Android project (first time)
npm run cap:sync        # Sync web files to Android
```

### 3. Open in Android Studio
```bash
npm run cap:open
```

### 4. Build Release APK/AAB
In Android Studio:
- **Build** → **Generate Signed Bundle / APK...**
- Select **Android App Bundle** (for Play Store)
- Choose your signing key
- Build complete → upload to Play Store

---

## 📁 Project Structure

```
RENT-VERIFY MVP/
├── Back-End/              ← Your Node.js + Express API
├── Front-End/             ← Old HTML/CSS (reference only)
└── app/                   ← NEW Vite App (use this!)
    ├── src/
    │   ├── index.html     ← Entry point
    │   ├── main.js        ← App router
    │   ├── pages/         ← Login & Dashboard
    │   ├── services/      ← API client & router
    │   └── styles/        ← Combined CSS
    ├── public/            ← PWA manifest
    ├── android/           ← Android project (generated)
    └── DEPLOYMENT_GUIDE.md ← Full instructions
```

---

## ✨ Features Implemented

✅ **Login/Signup** with backend integration  
✅ **Dashboard** with stats & receipt management  
✅ **SMS parsing** for payment verification  
✅ **File uploads** for receipt images  
✅ **Responsive design** (mobile, tablet, desktop)  
✅ **SPA routing** (no page reloads)  
✅ **PWA ready** (installable on home screen)  
✅ **Capacitor** (ready for Play Store)  

---

## 🔑 Key Differences from Original

| Original | New Vite App |
|----------|-------------|
| HTML files scattered | Organized `pages/` structure |
| Global JS variables | Modular services |
| No routing | SPA routing included |
| Manual API calls | Centralized `api.js` service |
| Inline CSS | Combined stylesheet |

**Your original design & logic are preserved** - only restructured!

---

## 🎯 Next Steps

1. **Test login/signup** - Make sure backend is running
2. **Try dashboard** - Upload receipts, verify payments
3. **Test on mobile** - Run Android app on emulator or phone
4. **Configure Play Store** - Add app icon, screenshots, description
5. **Deploy** - Upload AAB to Google Play Console

---

## 💡 Tips

- **Vite is FAST** - Hot reload for instant changes
- **No build step for development** - Just save and reload
- **Android builds take ~2-3 min** - First build is slowest
- **Keep backend running** - API proxy won't work otherwise

---

## ❓ Issues?

Check `DEPLOYMENT_GUIDE.md` for troubleshooting section!
