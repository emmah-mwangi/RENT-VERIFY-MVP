# 🔧 Troubleshooting Guide

## 💻 Development Issues

### Issue: "npm: command not found"
**Cause:** Node.js not installed  
**Fix:**
1. Download from [nodejs.org](https://nodejs.org)
2. Install LTS version (v18+)
3. Restart terminal and try again

```bash
node -v    # Should show v18.x.x or higher
npm -v     # Should show 9.x.x or higher
```

### Issue: "Cannot GET /" in browser
**Cause:** Vite dev server not running  
**Fix:**
```bash
cd app
npm run dev
# Wait for "ready in XXX ms"
# Then open http://localhost:5173
```

### Issue: API requests return 404/500
**Cause:** Backend not running  
**Fix:**
```bash
# In another terminal
cd Back-End
npm start
# Should show "Server running on port 5000"
```

### Issue: "EADDRINUSE: address already in use :::5173"
**Cause:** Port 5173 already in use  
**Fix:**
```bash
# Kill the process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5173
kill -9 <PID>

# Or use different port:
npm run dev -- --port 5174
```

### Issue: Login/signup shows "Signup failed" or "Login failed"
**Cause:** Backend API error  
**Fix:**
1. Check browser console (F12) for error message
2. Verify backend is running (`localhost:5000`)
3. Test API directly:
```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com","phone":"+1234567890","password":"test123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@test.com","password":"test123"}'
```

### Issue: Dashboard loads but no receipts appear
**Cause:** API endpoint not implemented  
**Fix:**
1. Check if `GET /api/receipts` endpoint exists
2. Verify token is being sent: `Authorization: Bearer <token>`
3. Check browser console for exact error

---

## 🏗️ Build Issues

### Issue: "npm ERR! code ERESOLVE" during npm install
**Cause:** Dependency conflict  
**Fix:**
```bash
# Use npm 7+ with --legacy-peer-deps flag
npm install --legacy-peer-deps

# Or use npm ci
npm ci
```

### Issue: "build command not found"
**Cause:** package.json scripts not set up  
**Fix:**
```bash
# Verify package.json has scripts:
cat package.json | grep -A 5 '"scripts"'

# Should show:
# "build": "vite build"
# "dev": "vite"
```

### Issue: "cannot find module 'vite'"
**Cause:** Vite not installed  
**Fix:**
```bash
npm install vite --save-dev
# Or reinstall everything:
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Android Issues

### Issue: "capacitor command not found"
**Cause:** Capacitor CLI not installed  
**Fix:**
```bash
npm install -g @capacitor/cli
# Or use npx:
npx cap --version
```

### Issue: "Android SDK not found"
**Cause:** Android SDK path not set  
**Fix:**

**Windows:**
```bash
set ANDROID_SDK_ROOT=%APPDATA%\Android\sdk
echo %ANDROID_SDK_ROOT%
```

**macOS:**
```bash
export ANDROID_SDK_ROOT=~/Library/Android/sdk
echo $ANDROID_SDK_ROOT
```

**Linux:**
```bash
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
echo $ANDROID_SDK_ROOT
```

Make permanent by adding to `.bashrc` or `.zshrc`

### Issue: "Gradle sync failed" in Android Studio
**Cause:** Gradle cache corrupted  
**Fix:**
```bash
cd android
./gradlew clean
./gradlew sync
# Or in Android Studio:
# File → Invalidate Caches → Restart
```

### Issue: "White screen" when app launches on Android
**Cause:** dist/ not built or synced  
**Fix:**
```bash
npm run build        # Build dist/
npm run cap:sync     # Sync to Android
npm run cap:run      # Rebuild and run
```

### Issue: App crashes on startup
**Cause:** JavaScript error  
**Fix:**
1. Open Logcat in Android Studio:
   - View → Tool Windows → Logcat
2. Filter for errors: `filter:E`
3. Check browser console when running web version

### Issue: "Cannot find jdk1.8.0_65"
**Cause:** Java not installed or wrong version  
**Fix:**
```bash
java -version
javac -version

# Should be 11+:
# openjdk version "11.0.x"
```

Install from [oracle.com](https://www.oracle.com/java/technologies/downloads/) or:
```bash
# macOS
brew install openjdk@11

# Windows (chocolatey)
choco install openjdk11
```

---

## 🏪 Google Play Store Issues

### Issue: "Invalid APK/AAB"
**Cause:** Wrong file type or not signed  
**Fix:**
- Must be `.aab` file (not `.apk`)
- Must be signed with valid certificate
- Check file: `file app-release.aab`

### Issue: "Version code too low"
**Cause:** Already uploaded higher version  
**Fix:**
1. Increment version code in `capacitor.config.json`
2. Rebuild with higher code
3. Upload again

### Issue: "App rejected - Crashes on startup"
**Cause:** Bug in app or configuration  
**Fix:**
1. Test locally on Android device/emulator
2. Check logs via Android Studio Logcat
3. Fix bug and rebuild
4. Resubmit

### Issue: "Signing certificate expired"
**Cause:** Certificate validity period ended  
**Fix:**
1. Generate new certificate
2. Update in Android Studio signing config
3. Rebuild release APK/AAB
4. Upload to Play Store

Note: **Never lose your private key!** Keep `.jks` file safe.

### Issue: "App blocked - malware detected"
**Cause:** Google Play Protect flagged it  
**Fix:**
1. Review app code for suspicious activity
2. Ensure no:
   - Unauthorized file access
   - Permission abuse
   - Undisclosed data collection
3. Resubmit after fixes
4. Contact Google if false positive

---

## 🔐 Security Issues

### Issue: "localStorage token exposed"
**Cause:** XSS vulnerability  
**Fix:**
1. Sanitize user input (don't inject HTML)
2. Use Content Security Policy headers
3. Consider sessionStorage for logout on tab close

### Issue: "CORS error in browser"
**Cause:** Backend not configured for CORS  
**Fix:**

In `Back-End/server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

### Issue: "API key exposed in frontend"
**Cause:** Credentials in source code  
**Fix:**
1. Use environment variables only
2. Never commit `.env` file
3. Add to `.gitignore`
4. Use `.env.example` as template

---

## 📊 Performance Issues

### Issue: "App slow to load"
**Cause:** Large bundle size  
**Fix:**
1. Run production build: `npm run build`
2. Check bundle size: `npm run build -- --report`
3. Remove unused dependencies
4. Use code splitting for pages

### Issue: "Dashboard takes 5+ seconds to load"
**Cause:** Slow API response  
**Fix:**
1. Check backend performance
2. Optimize database queries
3. Add pagination to receipts table
4. Cache responses locally

### Issue: "High battery drain on mobile"
**Cause:** Excessive polling or wake locks  
**Fix:**
1. Remove background tasks
2. Don't poll API constantly
3. Use event listeners instead of timers
4. Test with Android Profiler

---

## 🧪 Testing

### Test Login Flow
```bash
# 1. Start backend
cd Back-End && npm start

# 2. Start frontend
cd app && npm run dev

# 3. In browser, test:
# - Sign up with new email
# - Log in with email/password
# - Should redirect to dashboard
# - Check localStorage has token: console.log(localStorage.getItem('token'))
```

### Test API Integration
```javascript
// In browser console:
fetch('/api/receipts', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(console.log)
```

### Test Android Build
```bash
npm run build
npm run cap:sync
npm run cap:open

# In Android Studio:
# 1. Select device
# 2. Click Run (Shift+F10)
# 3. Wait for app to build and launch
# 4. Test all features
```

---

## 📝 Checking Logs

### Browser Console Logs
```javascript
// Press F12 in browser
// Go to Console tab
// Look for errors in red

// Frontend logs will show here:
// - API errors
// - JavaScript errors
// - Network requests
```

### Backend Logs
```bash
# Terminal where backend is running shows:
# - API requests
# - Database errors
# - Authentication issues
```

### Android Logs (Logcat)
```
Android Studio → View → Tool Windows → Logcat

Filter for:
- JavaScript errors: filter:js
- Native crashes: filter:E (errors)
- App output: tag:RentVerifier
```

### Build Logs
```bash
# See detailed build output:
npm run build -- --debug
npm run cap:sync -- --verbose
```

---

## 🆘 Emergency Fixes

### App completely broken
```bash
# Nuclear option - reinstall everything:
cd app
rm -rf node_modules dist android
rm package-lock.json

npm install
npm run build
npm run dev  # Test locally first
```

### Stuck with circular dependency error
```bash
npm install --legacy-peer-deps
npm dedupe
```

### Can't connect to backend at all
```bash
# Test backend directly:
curl http://localhost:5000/api/auth/login -X POST

# If no response, backend might be:
# - Not started
# - Listening on different port
# - Crashed

# Restart:
cd Back-End
npm start
```

### Android emulator won't run
```bash
# In Android Studio:
# 1. Tools → Device Manager
# 2. Delete existing emulator
# 3. Create → Pixel 4a, API 30
# 4. Try again

# Or test on physical device:
# - Enable USB debugging
# - Connect phone
# - Select device in Android Studio
```

---

## 📞 When All Else Fails

1. **Check documentation first**
   - README.md
   - DEPLOYMENT_GUIDE.md
   - ANDROID_PLAY_STORE_GUIDE.md

2. **Search for error message**
   - Google: "error message"
   - Stack Overflow

3. **Review recent changes**
   - What did you change last?
   - Revert if it broke things
   - Use git diff to compare

4. **Clear cache & reinstall**
   - `npm clean-install`
   - Delete `node_modules`
   - Clear browser cache (Ctrl+Shift+Delete)

5. **Create minimal test case**
   - Simplify to reproduce error
   - Test with hardcoded values
   - Check if it's environmental

6. **Read the actual error**
   - Many errors are self-explanatory
   - Look for suggestions in error message
   - Check stack trace for line number

---

## ✅ Verification Steps

After each step, verify:
```bash
# 1. Install
npm install       # No errors?

# 2. Dev build
npm run dev       # Can you access localhost:5173?

# 3. Login
Enter test@test.com / password  # Does it work?

# 4. Dashboard
See receipts list?  # Yes?

# 5. Production build
npm run build     # dist/ folder created?

# 6. Android
npm run cap:sync  # Android project updated?
npm run cap:open  # Android Studio opens?

# All green? You're ready! 🚀
```

---

Good luck! Most issues are solved by reading error messages carefully. 💪
