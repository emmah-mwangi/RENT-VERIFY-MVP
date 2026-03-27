# 📋 Quick Reference - File Organization

## Folder Structure at a Glance

```
RENT-VERIFY MVP/
│
├── Back-End/                          ← Your Express API (unchanged)
│   ├── server.js                       # Main server
│   ├── routes/
│   │   ├── auth.js                     # /api/auth endpoints
│   │   └── receipts.js                 # /api/receipts endpoints
│   ├── db.js                           # Database
│   └── package.json
│
├── Front-End/                         ← Old HTML/CSS (reference only)
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   │   ├── style.css
│   │   └── dashboard.css
│   └── js/
│       ├── main.js
│       ├── auth.js
│       └── dashboard.js
│
└── app/                               ← NEW VITE APP (USE THIS!)
    ├── src/                           # Source code
    │   ├── index.html                 # HTML entry point
    │   ├── main.js                    # Initialize app & router
    │   ├── pages/                     # Page components
    │   │   ├── LoginPage.js           # Login + Signup
    │   │   └── DashboardPage.js       # Dashboard + Receipts
    │   ├── services/                  # Shared logic
    │   │   ├── api.js                 # API client
    │   │   └── router.js              # SPA router
    │   └── styles/
    │       └── main.css               # All CSS combined
    │
    ├── public/                        # Static files
    │   └── manifest.json              # PWA config
    │
    ├── android/                       # Android project (generated)
    │   └── app/
    │       └── release/
    │           └── app-release.aab    # To upload to Play Store
    │
    ├── Configuration Files
    │   ├── vite.config.js             # Build config
    │   ├── capacitor.config.json      # Mobile config
    │   ├── package.json               # Dependencies
    │   ├── .env.example               # Environment template
    │   └── .gitignore
    │
    └── Documentation
        ├── README.md                  # Quick start (2 min)
        ├── PROJECT_SUMMARY.md         # What was done
        ├── DEPLOYMENT_GUIDE.md        # Web + Android deploy
        ├── ANDROID_PLAY_STORE_GUIDE.md  # Play Store steps
        └── TROUBLESHOOTING.md         # Common issues
```

---

## 🚀 Quick Command Reference

### Development
```bash
# Start frontend
cd app && npm run dev
→ http://localhost:5173

# Start backend (separate terminal)
cd Back-End && npm start
→ http://localhost:5000

# Build for production
cd app && npm run build
→ Creates dist/ folder

# Preview production build
cd app && npm run preview
→ Test before deploying
```

### Android Development
```bash
# Build web + sync to Android
npm run build && npm run cap:sync

# Open in Android Studio
npm run cap:open

# Run on emulator/device
npm run cap:run

# Create release APK/AAB
# Android Studio: Build → Generate Signed Bundle/APK
```

### Deployment
```bash
# Web hosting (Vercel - recommended)
npm i -g vercel && vercel --prod

# Web hosting (Netlify)
npm i -g netlify-cli && netlify deploy --prod --dir=dist

# Android Play Store
# 1. Create signed APK/AAB
# 2. Upload to Google Play Console
# 3. Wait for review (24-48 hrs)
```

---

## 📱 Page Maps

### Login Page Flow
```
┌─────────────────────────────────┐
│  LoginPage.js                   │
├─────────────────────────────────┤
│ ┌─ Email & Password Form         │
│ │  └─ loginForm submit            │
│ │     └─ apiClient.login()        │
│ │        └─ token → localStorage  │
│ │           └─ navigate to /dashboard
│ │                                 │
│ └─ Create Account Link            │
│    └─ Opens signupModal           │
│       └─ signupForm submit        │
│          └─ apiClient.signup()    │
│             └─ Close modal        │
│                                   │
└─────────────────────────────────┘
```

### Dashboard Page Flow
```
┌──────────────────────────────────┐
│  DashboardPage.js                │
├──────────────────────────────────┤
│ ┌─ Header                         │
│ │  └─ Sign Out Button             │
│ │     └─ clearToken → /login      │
│ │                                 │
│ ├─ Stats Section (4 cards)        │
│ │  └─ Display from loadReceipts() │
│ │                                 │
│ ├─ SMS Panel                      │
│ │  └─ smsMessage textarea         │
│ │     └─ previewSmsBtn            │
│ │        └─ apiClient.parseReceipt()
│ │                                 │
│ ├─ Receipt Upload Panel           │
│ │  └─ form fields                 │
│ │     └─ addReceiptBtn            │
│ │        └─ apiClient.uploadReceipt()
│ │           └─ loadReceipts() [refresh]
│ │                                 │
│ └─ Receipts Table                 │
│    └─ loadReceipts()              │
│       └─ apiClient.getReceipts()  │
│          └─ Render table rows     │
│                                   │
└──────────────────────────────────┘
```

---

## 🔌 API Endpoints Expected

Your backend should have these endpoints:

### Authentication
```
POST /api/auth/signup
{
  fullName: string,
  email: string,
  phone: string,
  password: string
}
Response: { message: string }

POST /api/auth/login
{
  identifier: string (email or username),
  password: string
}
Response: { token: string, user: { id, email, fullName } }
```

### Receipts
```
GET /api/receipts
Headers: Authorization: Bearer <token>
Response: { receipts: [ { id, houseNumber, amount, paymentDate, receiptRef, status, receiptImage } ] }

POST /api/receipts/upload
Headers: Authorization: Bearer <token>
Body: FormData {
  houseNumber: string,
  amount: number,
  paymentDate: date,
  receiptRef: string (optional),
  receiptImage: File
}
Response: { id, message }

POST /api/receipts/parse
Headers: Authorization: Bearer <token>
{
  message: string (SMS text)
}
Response: { amount: number, from: string, date: string }
```

---

## 🎨 UI Component Maps

### CSS Classes Used
```
Login Page:
.auth-container       # Main container
.auth-card           # Card wrapper
.brand               # Logo section
.input-group         # Form field
.btn, .primary-btn   # Buttons
.modal               # Signup modal
.divider             # Separator
.switch-text         # Link to signup

Dashboard Page:
.header              # Top bar
.dashboard           # Main container
.stats-grid          # 4 stat cards
.stat-card           # Individual card
.action-panels       # Forms section
.panel               # Card
.panel-header        # Card header
.panel-content       # Card body
.verification-table  # Receipts table
.badge               # Status badge
.btn-signout         # Logout button
```

---

## 🔐 Authentication Flow

```
1. User enters email + password
   ↓
2. LoginPage.js → apiClient.login()
   ↓
3. POST /api/auth/login
   ↓
4. Backend validates & returns token
   ↓
5. LoginPage.js → localStorage.setItem('token', data.token)
   ↓
6. router.navigate('/dashboard')
   ↓
7. DashboardPage loads & fetches receipts
   ↓
8. All API requests include:
   Headers: { Authorization: `Bearer ${token}` }

Sign Out:
1. User clicks "Sign Out"
2. localStorage.removeItem('token')
3. router.navigate('/login')
4. Auth check fails → Back to login
```

---

## 📊 State Management

### localStorage
```javascript
// Token storage
localStorage.getItem('token')        // Get JWT
localStorage.setItem('token', jwt)   // Store JWT
localStorage.removeItem('token')     // Clear on logout

// Checked in:
// - router.isAuthenticated()
// - apiClient requests (Bearer header)
// - After login (LoginPage.js)
```

### No other state management needed!
- Pages are stateless
- Data fetched on demand
- Dashboard loads data in afterRender()

---

## 🏗️ Module Dependencies

```
main.js
├── Router (router.js)
├── LoginPage.js
│   └── apiClient (api.js)
├── DashboardPage.js
│   └── apiClient (api.js)
└── styles/main.css

api.js (standalone)
router.js (standalone)
```

**No external dependencies!** Pure vanilla JavaScript.

---

## 📈 Deployment Checklist by Platform

### Web (Vercel/Netlify/Traditional)
- [ ] API endpoints configured
- [ ] Environment variables set
- [ ] Build succeeds: `npm run build`
- [ ] dist/ folder created
- [ ] Deploy dist/ folder

### Android (Play Store)
- [ ] Capacitor setup: `npx cap add android`
- [ ] Web build: `npm run build`
- [ ] Sync files: `npm run cap:sync`
- [ ] Open: `npm run cap:open`
- [ ] Build release: Android Studio
- [ ] Sign with certificate
- [ ] Generate AAB
- [ ] Upload to Play Store
- [ ] Fill app listing
- [ ] Submit for review

---

## 🔄 Development Workflow

```
Day-to-day:
1. npm run dev           # Start dev server
2. Make changes to src/  # Edit components
3. Browser auto-reloads  # Vite hot reload
4. Test features        # F12 to debug
5. Repeat              # Continue coding

Before committing:
1. npm run build       # Test production build
2. Check console       # No errors?
3. Test critical paths  # Login → Dashboard
4. Git commit          # Save work

Before Play Store:
1. npm run build       # Production build
2. npm run cap:sync    # Sync to Android
3. npm run cap:open    # Build in Android Studio
4. Test on real device # Hardware testing
5. Generate APK/AAB    # Sign release
6. Upload to Play Store # Submit
```

---

## 💡 Pro Tips

1. **Use browser DevTools** (F12)
   - Console for errors
   - Network tab for API calls
   - Application tab for localStorage
   - Device toolbar for mobile testing

2. **Use Android Logcat** (Android Studio)
   - View → Tool Windows → Logcat
   - Filter for errors: `filter:E`
   - Find JavaScript errors & crashes

3. **Keep backend running**
   - Separate terminal window
   - Watch terminal output
   - Some errors only show there

4. **Test on real device when possible**
   - Emulator is slower
   - Device reveals real UX
   - Touch feels different
   - Check phone capabilities (camera, files)

5. **Version your releases**
   - Increment version code each time
   - Update CHANGELOG
   - Tag releases in git

---

## 🎯 Success Indicators

✅ **Dev Setup Works:**
- `npm run dev` starts without errors
- http://localhost:5173 loads
- Backend at localhost:5000 responds

✅ **Login Works:**
- Can sign up with new email
- Can log in with credentials
- Token appears in localStorage

✅ **Dashboard Works:**
- Page loads after login
- Receipts table displays
- Can upload files
- Can parse SMS
- Sign out clears token

✅ **Android Works:**
- `npm run build` succeeds
- `npm run cap:sync` syncs files
- Android Studio opens project
- App builds without errors
- App runs on emulator/device

✅ **Play Store Ready:**
- Release AAB/APK generated
- Signed with correct certificate
- Google Play Developer account created
- App listing filled out
- Privacy policy published
- Screenshots ready

🎉 **All green = Launch time!**

---

You're all set! Start with `npm run dev` and enjoy building! 🚀
