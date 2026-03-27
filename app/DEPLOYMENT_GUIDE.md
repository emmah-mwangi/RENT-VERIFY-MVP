# 🚀 Rent Verifier - Production Deployment & Build Guide

## 📋 Project Structure

```
app/
├── src/
│   ├── index.html              # HTML entry point
│   ├── main.js                 # App router & initialization
│   ├── pages/
│   │   ├── LoginPage.js        # Login & signup page
│   │   └── DashboardPage.js    # Main dashboard
│   ├── services/
│   │   ├── api.js              # Backend API client
│   │   └── router.js           # SPA routing
│   └── styles/
│       └── main.css            # All styles (login + dashboard)
├── public/
│   └── manifest.json           # PWA manifest
├── android/                    # Capacitor Android project (generated)
├── capacitor.config.json       # Capacitor config
├── vite.config.js             # Vite build config
└── package.json               # Dependencies & scripts
```

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 16+ (check: `node -v`)
- npm or yarn
- Java JDK 11+ (for Android builds)
- Android Studio with SDK (for Play Store builds)

### 1. Install Dependencies

```bash
cd app
npm install
# or
yarn install
```

### 2. Configure Backend URL

Edit `src/services/api.js` if needed:
```javascript
const API_BASE = '/api'; // Uses proxy in vite.config.js for dev
```

For production, update `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-production-backend.com',
      changeOrigin: true,
    }
  }
}
```

---

## 🏃 Development

### Run Dev Server

```bash
npm run dev
```

**Output:**
```
  VITE v5.0.0  ready in 100 ms

  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in browser.

**Note:** Backend must be running on `http://localhost:5000`:
```bash
cd ../Back-End
npm start
```

---

## 📦 Web Build (Production)

### Build Web App

```bash
npm run build
```

**Output:**
- `dist/` folder contains production-ready files
- Optimized and minified JavaScript/CSS
- Ready for deployment

### Preview Build Locally

```bash
npm run preview
```

### Deployment Options

#### **Option 1: Vercel (Recommended - Free)**
```bash
npm i -g vercel
vercel login
vercel --prod
```

#### **Option 2: Netlify**
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

#### **Option 3: Traditional Hosting (AWS S3, Azure, GCP)**
Upload `dist/` folder to your static hosting service.

**Environment Variables for Production:**
- Create `.env.production` with backend URL
- Configure CORS on backend if hosting separately

---

## 📱 Mobile App (Capacitor + Android)

### Step 1: Initialize Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
```

### Step 2: Add Android Platform

```bash
npx cap add android
```

**Creates:** `android/` folder with Android project

### Step 3: Build & Sync

```bash
npm run build        # Build web assets
npm run cap:sync     # Sync web files to Android
```

### Step 4: Open Android Studio

```bash
npm run cap:open     # Opens Android Studio with project
```

### Step 5: Run on Emulator/Device

In Android Studio:
1. Select device (emulator or connected phone)
2. Click **Run** button (or `Shift+F10`)
3. App opens on device

---

## 🏪 Deploy to Google Play Store

### Prerequisites
1. **Google Play Developer Account** ($25 one-time fee)
2. **Signing Certificate** (keystore file)
3. **App Icon & Screenshots**

### Step 1: Generate Signing Certificate

```bash
cd android
```

If you don't have a keystore:
```bash
keytool -genkey -v -keystore rent-verifier-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias rent-verifier-key
```

**Save the .jks file and password securely!**

### Step 2: Configure Signing in Android Studio

1. Open `android/` in Android Studio
2. Go to **Build** → **Generate Signed Bundle/APK**
3. Select **Android App Bundle** (for Play Store)
4. Select your keystore file
5. Enter keystore password and key password
6. Choose **Release** build type
7. Click **Create**

**Output:** `android/app/release/app-release.aab`

### Step 3: Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create App**
3. Fill in:
   - App name: "Rent Verifier"
   - Category: Business/Productivity
   - Content rating
   - Privacy policy
   - Screenshots (min 2)
   - App icon (512x512px)

### Step 4: Upload AAB & Configure Release

1. Navigate to **Release** → **Production**
2. Click **Create New Release**
3. Upload `app-release.aab`
4. Fill in:
   - Version code: (auto-increments)
   - Release notes: "Initial release"
5. Review & publish

### Step 5: Testing

**Internal Testing Track** (before public release):
1. Go to **Testing** → **Internal testing**
2. Upload AAB
3. Add testers
4. Testers get link to install from Play Store

---

## 🔐 Environment Configuration

### Development (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_ENV=development
```

### Production (.env.production)
```env
VITE_API_URL=https://your-production-backend.com
VITE_ENV=production
```

### Using in Code
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot GET /" in browser
**Fix:** Make sure Vite dev server is running (`npm run dev`)

### Issue: API requests failing
**Fix:** 
- Backend must be running on port 5000
- Check CORS headers in backend
- Verify `vite.config.js` proxy

### Issue: Android build fails
**Fix:**
```bash
cd android
./gradlew clean build
```

### Issue: White screen on Android
**Fix:**
1. Check browser console for errors
2. Increase `minSdkVersion` in `capacitor.config.json`
3. Verify `dist/` is built before syncing

---

## 📊 Version Management

### Update App Version

1. **Web & Android versioning** (in `package.json`):
```json
{
  "version": "1.0.0"
}
```

2. **Android specific** (in `capacitor.config.json`):
```json
{
  "appVersion": "1.0.0",
  "appBuild": 1
}
```

For Android Play Store:
- **Version Code** (internal): auto-increments
- **Version Name**: "1.0.0"

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install & Build
        run: |
          cd app
          npm install
          npm run build
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npx vercel --prod --token $VERCEL_TOKEN
```

---

## 📲 PWA Features

Your app is also a Progressive Web App! Users can:
1. **Install on home screen** (mobile)
2. **Offline support** (with Service Worker - add later)
3. **Push notifications** (with Service Worker - add later)

Install prompt appears automatically on compatible browsers.

---

## ✅ Pre-Launch Checklist

- [ ] Backend API URLs configured correctly
- [ ] All env variables set
- [ ] Auth token handling working
- [ ] Dashboard loads and fetches receipts
- [ ] File uploads work
- [ ] SMS parsing works
- [ ] Sign out clears token
- [ ] Mobile responsive tested
- [ ] Android app builds without errors
- [ ] Signed APK/AAB generated
- [ ] Play Store listing complete
- [ ] Privacy policy published
- [ ] Terms of service published

---

## 📞 Support

For issues:
1. Check browser/Android console for errors
2. Verify backend is running
3. Check network requests in DevTools
4. Review Android Studio logcat for native errors

---

## 🎉 You're Ready!

Your Rent Verifier app is production-ready for both web and Android!

**Next Steps:**
1. Test thoroughly on devices
2. Gather feedback from beta testers
3. Launch on Play Store
4. Monitor analytics and crashes
5. Plan feature updates
