# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER DEVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │   WEB BROWSER        │      │   ANDROID DEVICE     │        │
│  │  (Desktop/Mobile)    │      │   (Play Store App)   │        │
│  │                      │      │                      │        │
│  │ ┌─────────────────┐  │      │ ┌─────────────────┐  │        │
│  │ │  Vite App       │  │      │ │  React Native   │  │        │
│  │ │  (dist/)        │  │      │ │  + Capacitor    │  │        │
│  │ │                 │  │      │ │                 │  │        │
│  │ │ • LoginPage.js  │  │      │ │ (Same code!)    │  │        │
│  │ │ • Dashboard.js  │  │      │ │                 │  │        │
│  │ │ • main.css      │  │      │ │ APK/AAB file    │  │        │
│  │ └─────────────────┘  │      │ └─────────────────┘  │        │
│  └──────────┬───────────┘      └──────────┬───────────┘        │
│             │                              │                    │
│             └──────────────┬───────────────┘                    │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR SERVER (Backend)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Node.js + Express (localhost:5000)             │    │
│  │                                                        │    │
│  │  ┌─────────────────┐    ┌──────────────────────┐      │    │
│  │  │   auth routes   │    │  receipts routes     │      │    │
│  │  │                 │    │                      │      │    │
│  │  │ POST /signup    │    │ POST /upload         │      │    │
│  │  │ POST /login     │    │ GET /                │      │    │
│  │  │                 │    │ POST /parse          │      │    │
│  │  └────────┬────────┘    └──────────┬───────────┘      │    │
│  │           │                        │                  │    │
│  │           └────────────┬───────────┘                  │    │
│  │                        │                              │    │
│  └────────────────────────┼──────────────────────────────┘    │
│                           │                                    │
│                           ▼                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           SQLite Database                              │    │
│  │                                                        │    │
│  │  • users table (email, password hash)                  │    │
│  │  • receipts table (house, amount, date, image)        │    │
│  │  • verification results                               │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

```
src/
│
├── index.html (Entry Point)
│   │
│   └── Loads: main.js
│
├── main.js (App Initialization)
│   │
│   ├── Imports: Router
│   ├── Imports: LoginPage, DashboardPage
│   ├── Registers routes:
│   │   ├── /login → LoginPage
│   │   └── /dashboard → DashboardPage
│   │
│   └── Initializes: router.init()
│
├── pages/
│   │
│   ├── LoginPage.js
│   │   ├── Renders: Login form + Signup modal
│   │   ├── On submit: apiClient.login()
│   │   ├── On signup: apiClient.signup()
│   │   └── On success: navigate to /dashboard
│   │
│   └── DashboardPage.js
│       ├── Renders: Stats + Forms + Table
│       ├── On load: loadReceipts()
│       ├── SMS Preview: apiClient.parseReceipt()
│       ├── Upload Receipt: apiClient.uploadReceipt()
│       └── Sign out: Clear token → /login
│
├── services/
│   │
│   ├── router.js
│   │   ├── register(path, component)
│   │   ├── navigate(path)
│   │   ├── render(pageComponent)
│   │   └── isAuthenticated()
│   │
│   └── api.js
│       ├── signup(name, email, phone, password)
│       ├── login(email, password)
│       ├── getReceipts()
│       ├── uploadReceipt(formData)
│       └── parseReceipt(smsText)
│
└── styles/
    │
    └── main.css
        ├── Auth page styles (login, signup modal)
        ├── Dashboard styles (header, cards, table)
        ├── Responsive design (mobile-first)
        └── Dark theme + accent colors
```

---

## Data Flow Diagram

### Login Flow
```
User enters email + password
         │
         ▼
┌─────────────────────┐
│  LoginPage.js       │
│  loginForm submit   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  apiClient.login()  │
│  POST /api/auth/    │
│       login         │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Express Backend    │
│  Validate password  │
│  Generate JWT       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Response: { token: "jwt..." }
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  LoginPage.js       │
│  localStorage.      │
│  setItem('token')   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  router.navigate    │
│  ('/dashboard')     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  DashboardPage.js   │
│  afterRender() →    │
│  loadReceipts()     │
└─────────────────────┘
```

### API Request Flow
```
Page Component
    │
    ├─ Has token? → localStorage.getItem('token')
    │
    ▼
┌──────────────────────────────┐
│  apiClient.request()         │
│  method: GET/POST/etc.       │
│  headers: {                  │
│    'Content-Type': 'json'    │
│    'Authorization':          │
│      'Bearer {token}'        │
│  }                           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Vite Dev Server             │
│  (proxy to localhost:5000)   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Express Backend             │
│  Verify token               │
│  Execute endpoint            │
│  Query database              │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Response JSON               │
│  { data: ... }               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  apiClient returns data      │
│  Page processes & renders    │
└──────────────────────────────┘
```

---

## Component Hierarchy

```
App (main.js)
│
├── Router
│   │
│   ├─ /login
│   │   │
│   │   └── LoginPage
│   │       ├── HTML Template
│   │       │   ├── Brand Header
│   │       │   ├── Email Input
│   │       │   ├── Password Input
│   │       │   ├── Sign In Button
│   │       │   ├── Divider
│   │       │   ├── Google Sign In
│   │       │   ├── Create Account Link
│   │       │   └── Signup Modal
│   │       │       ├── Name Input
│   │       │       ├── Email Input
│   │       │       ├── Phone Input
│   │       │       ├── Password Input
│   │       │       ├── Confirm Password
│   │       │       └── Create Button
│   │       │
│   │       └── Event Handlers (afterRender)
│   │           ├── loginForm.submit → apiClient.login()
│   │           ├── signupForm.submit → apiClient.signup()
│   │           └── Modal controls
│   │
│   └─ /dashboard
│       │
│       └── DashboardPage
│           ├── Header
│           │   ├── Brand Logo
│           │   └── Sign Out Button
│           │
│           ├── Stats Section
│           │   ├── Card: Total Received
│           │   ├── Card: Verified
│           │   ├── Card: Suspicious
│           │   └── Card: Not Found
│           │
│           ├── SMS Panel
│           │   ├── Textarea (SMS input)
│           │   └── Button: Preview (→ apiClient.parseReceipt)
│           │
│           ├── Upload Panel
│           │   ├── House Number Input
│           │   ├── Amount Input
│           │   ├── Payment Date Input
│           │   ├── Receipt Ref Input
│           │   ├── File Upload
│           │   └── Button: Add Receipt (→ apiClient.uploadReceipt)
│           │
│           └── Verification Table
│               ├── Header Row (House, Amount, Date, Ref, Status)
│               └── Data Rows
│                   ├── Cell: House Number
│                   ├── Cell: Amount (KES)
│                   ├── Cell: Date
│                   ├── Cell: Ref
│                   ├── Cell: Status Badge
│                   └── Cell: Actions
```

---

## State Management

```
Global State (Minimal)
├── localStorage.token (JWT)
│   ├── Set on login
│   ├── Cleared on logout
│   └── Sent in API headers
│
├── window.location.pathname (Router state)
│   ├── Current page path
│   └── Used for navigation
│
└── DOM state (each component)
    ├── Form inputs
    ├── Table data
    ├── Modal visibility
    └── Button states

Note: NO Redux, Context, or state manager needed!
Simple is better.
```

---

## Build & Deployment Architecture

```
┌─ Development ──────────────────────┐
│                                    │
│  npm run dev                       │
│  ↓                                 │
│  Vite Dev Server (port 5173)      │
│  • Hot reload on file change      │
│  • Proxy to backend (5000)        │
│  • Source maps for debugging      │
│                                    │
└────────────────────────────────────┘
             │
             ▼
┌─ Production Web Build ─────────────┐
│                                    │
│  npm run build                     │
│  ↓                                 │
│  Vite bundles:                     │
│  • src/index.html                  │
│  • src/main.js                     │
│  • All imports (optimized)         │
│  • src/styles/main.css             │
│  ↓                                 │
│  Generates dist/ folder:           │
│  • index.html (optimized)          │
│  • assets/bundle-xxx.js (minified) │
│  • assets/style-xxx.css (minified) │
│                                    │
└────────────────────────────────────┘
             │
             ├─ Option 1: Vercel
             │   └─ npm deploy
             │
             ├─ Option 2: Netlify
             │   └─ npm deploy
             │
             └─ Option 3: Traditional
                 └─ Upload dist/ to server
                    (AWS S3, Azure, GCP, etc.)
```

```
┌─ Mobile Build ─────────────────────┐
│                                    │
│  npm run build (web assets)        │
│  ↓                                 │
│  npm run cap:sync                  │
│  ↓                                 │
│  Capacitor copies dist/ to:        │
│  • android/app/src/main/assets/www│
│  ↓                                 │
│  npm run cap:open                  │
│  ↓                                 │
│  Android Studio opens project      │
│  • Verifies gradle                 │
│  • Syncs dependencies              │
│  • Opens editor                    │
│  ↓                                 │
│  Build → Generate Signed Bundle    │
│  • Select keystore (cert)          │
│  • Sign release APK/AAB            │
│  ↓                                 │
│  Output: app-release.aab (~20MB)   │
│  ↓                                 │
│  Upload to Play Console            │
│  • Internal testing (72hrs)        │
│  • Closed beta (optional)          │
│  • Production release (24-48hrs)   │
│                                    │
└────────────────────────────────────┘
```

---

## Authentication & Authorization

```
┌─────────────────────────────────────┐
│  User Not Authenticated             │
│  (No token in localStorage)         │
└────────────────┬────────────────────┘
                 │
                 ▼ (Automatic redirect)
         ┌──────────────────┐
         │  /login page     │
         │  (LoginPage.js)  │
         └──────────┬───────┘
                    │
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
    Login              Signup
    │                  │
    └─ Validate ──────┴─ Validate
    │                  │
    ├─ Email           ├─ Email unique?
    ├─ Password        ├─ Password match
    │                  └─ Fields filled
    │
    ▼                  ▼
    POST /api/auth/signup or /login
    │
    ▼
    Backend validates
    │
    ├─ If successful → Return JWT token
    │                  { token: "eyJ..." }
    │
    └─ If failed → Return error
                   { message: "Invalid..." }
                   │
                   ▼
                   Alert user
                   Stay on login page

User Authenticates
│
├─ localStorage.setItem('token', jwt)
│
└─ router.navigate('/dashboard')
  │
  ▼
  DashboardPage
  │
  ├─ Check router.isAuthenticated()
  │  └─ Return !!localStorage.getItem('token')
  │
  ├─ All API requests include:
  │  ├─ Headers: {
  │  │    'Authorization': `Bearer ${token}`
  │  │  }
  │
  └─ Load receipts & display
```

---

## File Upload Flow

```
User selects file
        │
        ▼
┌───────────────────┐
│ receiptImage      │
│ (File object)     │
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────────┐
│ DashboardPage.addReceiptBtn        │
│ Click handler                     │
└────────┬────────────────────────────┘
         │
         ├─ Get form fields:
         │  ├─ houseNumber
         │  ├─ amount
         │  ├─ paymentDate
         │  ├─ receiptRef
         │  └─ receiptImage
         │
         ▼
┌─────────────────────────────────┐
│ Validate form                   │
│ (Not empty, etc.)               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Create FormData                 │
│ append('houseNumber', value)    │
│ append('amount', value)         │
│ append('paymentDate', value)    │
│ append('receiptRef', value)     │
│ append('receiptImage', file)    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ apiClient.uploadReceipt()       │
│ POST /api/receipts/upload       │
│ Body: FormData (multipart)      │
│ Headers: Authorization: Bearer  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend                         │
│ - Parse FormData                │
│ - Validate inputs               │
│ - Save file to uploads/         │
│ - Store receipt in DB           │
│ - Return: { id, message }       │
└────────┬────────────────────────┘
         │
         ├─ If success
         │  │
         │  └─ Alert "Receipt added"
         │     Clear form
         │     loadReceipts() [refresh table]
         │
         └─ If error
            └─ Alert error message
               Form stays visible
```

---

## Page Navigation & Routing

```
Initial Load (http://localhost:5173/)
│
├─ Check: router.isAuthenticated()?
│  │
│  ├─ YES (token exists)
│  │  └─ Navigate to /dashboard
│  │     └─ Render DashboardPage
│  │
│  └─ NO (no token)
│     └─ Navigate to /login
│        └─ Render LoginPage

While Using App:
│
├─ User clicks link or button
│  │
│  └─ router.navigate(path)
│     │
│     ├─ Update window.history
│     ├─ Render new page
│     ├─ Call page.afterRender()
│     └─ Update DOM
│
└─ User uses browser back/forward
   │
   └─ popstate event
      └─ router.navigate(previous_path)
         └─ Render previous page
```

---

## Security Flow

```
Token Handling:
└─ User logs in → Backend returns JWT
   └─ LoginPage stores in localStorage
      └─ Every API request includes Bearer token
         └─ Backend validates token
            └─ Grants access to user data
               └─ User logs out → Token cleared
                  └─ Next request fails auth check
                     └─ User redirected to /login

Data Flow:
└─ User enters data
   └─ Form validation (client)
      └─ Send to API
         └─ Server validation (important!)
            └─ Sanitize inputs
               └─ Check authorization
                  └─ Process & store
                     └─ Return response

Token Expiry:
└─ Token created with expiration
   └─ After expiration, token invalid
      └─ API returns 401 Unauthorized
         └─ App should redirect to /login
            └─ User logs in again
               └─ Get new token

HTTPS:
└─ All production requests must use HTTPS
   └─ Browser won't allow Mixed Content
      └─ (HTTP iframe in HTTPS page)
         └─ Vite config must use https
            └─ Backend must use HTTPS
               └─ Tokens secure in transit
```

---

## Performance Considerations

```
Frontend Optimization:
├─ Vite minifies JS/CSS
├─ Code splitting ready
├─ Lazy loading ready
├─ CSS caching
└─ Efficient DOM updates

Network Optimization:
├─ API proxy reduces requests
├─ Gzip compression
├─ Efficient JSON responses
├─ Token in headers (not cookies for CORS)
└─ Single page app (no full reloads)

Mobile Optimization:
├─ Responsive CSS (mobile-first)
├─ Touch-friendly buttons
├─ Minimal bundle size
├─ Lazy image loading (with placeholders)
└─ Efficient local storage use

Caching Strategy:
├─ Browser cache (service worker ready)
├─ Vite hash filenames
├─ Long-term caching for assets
└─ API responses cacheable
```

---

**This architecture supports:**
- ✅ Web app development
- ✅ Android app packaging
- ✅ iOS app packaging (with Capacitor)
- ✅ PWA installation
- ✅ Offline support (with Service Worker)
- ✅ Cross-platform consistency

**Scaling ready for:**
- ✅ More pages (add to pages/ & router)
- ✅ More API endpoints (add to api.js)
- ✅ More features (modular structure)
- ✅ Multiple backends (config-driven)
