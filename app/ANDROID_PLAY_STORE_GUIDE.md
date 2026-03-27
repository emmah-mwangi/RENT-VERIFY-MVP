# 🤖 Android Play Store - Complete Guide

## 📋 Prerequisites

### System Requirements
- **OS:** Windows, macOS, or Linux
- **Java:** JDK 11 or higher
- **Android Studio:** Latest version (or Android SDK)
- **Node.js:** v16+ (already have this)

### Accounts & Certificates
1. **Google Play Developer Account** - $25 one-time
2. **Google Account** for signing
3. **Signing Certificate** (or create new one)

---

## 🔧 Step-by-Step Setup

### Step 1: Install Android Development Tools

#### Option A: Android Studio (Recommended)
1. Download from [android.google.com/studio](https://developer.android.com/studio)
2. Install and follow setup wizard
3. Select "Standard Installation"
4. Android Studio will install SDK, emulator, and tools

#### Option B: Command Line (Experts)
```bash
# macOS
brew install android-sdk

# Windows (with chocolatey)
choco install androidstudio

# Linux
# Install from your package manager
```

### Step 2: Initialize Project

```bash
cd app

# Install Capacitor (first time only)
npm install @capacitor/core @capacitor/cli @capacitor/android --save

# Initialize Capacitor
npx cap init
# Follow prompts:
# - App name: Rent Verifier
# - App ID: com.rentverifier.app
# - Directory: dist (default)

# Add Android platform
npx cap add android
# Creates: android/ folder
```

### Step 3: Build Web Assets

```bash
npm run build
# Creates optimized files in dist/
```

### Step 4: Sync to Android

```bash
npm run cap:sync
# Copies dist/ into Android project
```

### Step 5: Open in Android Studio

```bash
npm run cap:open
# Launches Android Studio with project
```

---

## 🔐 Create Signing Certificate

### For First-Time Release

```bash
cd android

# Generate keystore (replace with your details)
keytool -genkey -v -keystore rent-verifier-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias rent-verifier-key \
  -storepass your_store_password \
  -keypass your_key_password

# You'll be prompted for:
# - Your name (e.g., "John Doe")
# - Organization (e.g., "My Company")
# - City
# - State
# - Country code (e.g., "US")
```

**IMPORTANT:** Save the `.jks` file and passwords securely!

### Verify Certificate

```bash
keytool -list -v -keystore rent-verifier-release.jks -alias rent-verifier-key
# Paste store password when prompted
```

---

## 🏗️ Build Release APK/AAB

### Using Android Studio GUI

1. Open Android Studio (with android/ project)
2. Go to **Build** menu → **Generate Signed Bundle / APK...**
3. Choose **Android App Bundle** (required for Play Store)
4. Click **Next**
5. **Key store path:** Browse to `rent-verifier-release.jks`
6. **Key store password:** Enter your store password
7. **Key alias:** `rent-verifier-key`
8. **Key password:** Enter your key password
9. **Destination folder:** Keep default
10. Click **Create**

**Output:** `android/app/release/app-release.aab` (~10-20 MB)

### Using Command Line

```bash
cd android

# Build release AAB
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=../rent-verifier-release.jks \
  -Pandroid.injected.signing.store.password=your_store_password \
  -Pandroid.injected.signing.key.alias=rent-verifier-key \
  -Pandroid.injected.signing.key.password=your_key_password

# Output: app/release/app-release.aab
```

---

## 🏪 Google Play Console Setup

### 1. Create Developer Account

1. Go to [play.google.com/apps/publish](https://play.google.com/apps/publish)
2. Sign in with Google Account
3. Accept agreements
4. Pay $25 developer fee
5. Complete setup

### 2. Create App

1. Click **Create App**
2. Enter:
   - **App name:** "Rent Verifier"
   - **Language:** English
   - **Category:** Business or Productivity
   - **Type:** App
3. Click **Create app**

### 3. App Details (Fill Out ALL)

#### App Access
- Default: Users can access from anywhere

#### Content Rating
1. Go to **Content rating** (left sidebar)
2. Submit questionnaire
3. Google assigns rating (PEGI 3, 7, 12, etc.)

#### Target Audience
- Go to **Target audience and content**
- Select: Business/Productivity
- Ensure appropriate for your audience

#### Pricing & Distribution
- Go to **Pricing & distribution**
- Choose: **Free**
- Select countries (worldwide recommended)

### 4. Add Privacy Policy

1. Go to **App content**
2. Paste your **Privacy Policy URL**
   - Required for Play Store approval
   - Use free template from [termly.io](https://termly.io) or [privacypolicygenerator.info](https://www.privacypolicygenerator.info)

### 5. Upload Media

1. Go to **Store listing** (left sidebar)
2. **App icon** (512x512 PNG):
   - Simple, recognizable design
   - Place in `app/public/icon-512x512.png`
3. **Feature graphic** (1024x500 PNG):
   - Eye-catching banner
4. **Screenshots** (minimum 2):
   - Phone: 1080x1920 or 540x960 PNG
   - Show login, dashboard, receipts features
   - Tool: [placeit.net](https://placeit.net) for mockups
5. **Short description** (50 chars):
   - "Secure rent verification"
6. **Full description** (4000 chars):
```
Rent Verifier helps landlords and property managers verify rent payments with fraud prevention.

Features:
• Quick payment verification
• SMS parsing
• Receipt image storage
• Secure login
• Mobile & web access

Upload payment SMS or receipt images and get instant verification status.

Contact: support@rentverifier.com
```

### 6. Review Content Rating Again

1. Go to **Content rating**
2. Ensure rating is approved
3. Disclose any in-app purchases (if any)

---

## 📤 Submit to Play Store

### 1. Internal Testing First

1. Go to **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload `app-release.aab`
4. Add release notes: "Initial release"
5. Click **Review release**
6. Click **Start rollout to Internal testing**

**Wait 10-15 minutes** for build to process.

7. Send link to testers:
   - Go to **Testers** tab
   - Copy testing URL
   - Share with team via email

**Test thoroughly before production!**

### 2. Closed Testing (Beta)

1. Invite up to 500 testers
2. Gather feedback
3. Fix bugs if needed
4. Build new version with higher version code

### 3. Production Release

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload `app-release.aab` (new version)
4. Add release notes:
```
Version 1.0.0
- Initial release
- Login and signup
- Receipt verification
- Payment SMS parsing
```
5. Review all details:
   - ✅ Content rating
   - ✅ Privacy policy
   - ✅ Screenshots
   - ✅ Description
6. Click **Save & review**
7. Review for final time
8. Click **Release** → **Start rollout to Production**

**Review takes 24-48 hours usually!**

---

## 📊 Version Management

### Update Version for New Release

**Edit `capacitor.config.json`:**
```json
{
  "appVersion": "1.0.1",
  "appBuild": 2
}
```

**And `package.json`:**
```json
{
  "version": "1.0.1"
}
```

### Rules for Version Codes
- **First release:** 1
- **Second release:** 2
- **Hotfix:** 3
- **MUST increment for each Play Store upload**

---

## 🐛 Troubleshooting

### Build Fails: "SDK not found"
```bash
# Set Android SDK path
export ANDROID_SDK_ROOT=~/Library/Android/sdk  # macOS
export ANDROID_SDK_ROOT=$HOME/Android/Sdk      # Linux
export ANDROID_SDK_ROOT=%APPDATA%\Android\sdk  # Windows
```

### Error: "Gradle sync failed"
```bash
cd android
./gradlew clean
./gradlew sync
```

### White Screen on Android
1. Check browser console (F12 in Android)
2. Verify `dist/` is built
3. Check `capacitor.config.json` paths
4. Ensure API endpoint is accessible

### Upload fails: "Invalid APK/AAB"
- ✅ Must be `.aab` file (not `.apk`)
- ✅ Must be signed with correct certificate
- ✅ Version code must be higher than previous

### App rejected by Google Play
Common reasons:
- Missing privacy policy
- Insufficient content rating
- Broken login/signup
- Crashes on startup
- Not following content guidelines

**Solution:** Check rejection email, fix issues, resubmit

---

## 📈 After Launch

### Monitor
1. **Play Console Dashboard**
   - Downloads, ratings, crashes
   - User reviews
   - ANR (app not responding) data

2. **Set up Analytics**
   ```bash
   # Add to src/main.js
   import { Analytics } from '@capacitor/analytics';
   ```

3. **Monitor Crashes**
   - Android Studio: **Logcat**
   - Play Console: **Crashes & ANRs**

### Update App
1. Make code changes
2. Increment version code
3. Build release APK/AAB
4. Upload to Play Console
5. Stage update
6. Gradual rollout (25% → 50% → 100%)

---

## 📋 Checklist Before Launch

- [ ] App builds without errors
- [ ] Tested on Android 8+ (minSdkVersion 21)
- [ ] Login/signup works
- [ ] Dashboard loads
- [ ] Receipts display
- [ ] SMS parsing works
- [ ] File uploads work
- [ ] Sign out clears data
- [ ] No crashes or ANRs
- [ ] Responsive on all screen sizes
- [ ] Icons look good
- [ ] Screenshots showcase features
- [ ] Privacy policy published
- [ ] Description complete
- [ ] Content rating submitted
- [ ] Signed with release certificate
- [ ] AAB file ready for upload

---

## 🎉 You're Ready!

Your Rent Verifier app is ready for the Google Play Store!

**Timeline:**
- Setup: 2-4 hours
- Testing: 1-2 days
- Google review: 24-48 hours
- Live on Play Store! 🚀
