# 🚀 Project Setup Guide (Celestia Web)

Follow these steps to set up the project on a **NEW PC**.

## 1. Prerequisites
Install these first:
- **Node.js** (LTS Version): [Download](https://nodejs.org/)
- **Git**: [Download](https://git-scm.com/)
- **Android Studio**: [Download](https://developer.android.com/studio) (Required for mobile app)

---

## 2. Terminal Commands (Step-by-Step)

### A. Clone & Install
Open your terminal (PowerShell or Command Prompt) and run:

```bash
# 1. Clone the repository (skip if you just copied the folder)
git clone <YOUR_REPO_URL>
cd celestia-web

# 2. Install all dependencies
npm install
```

### B. Setup Environment
You need the secret keys. Create a `.env` file in the root folder:

```bash
# Windows PowerShell command to create the file (or just create it manually)
New-Item -Path .env -ItemType File
```

**Paste inside `.env`:**
*(Copy the content from your existing `.env` file on the old PC)*

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# ... other keys
```

### C. Initialize Mobile (Android)
This links your web code to the Android project.

```bash
# 1. Build the web assets
npm run build

# 2. Sync with Capacitor (CRITICAL STEP)
npx cap sync
```

---

## 3. Running the App

### Web (Browser)
```bash
npm run dev
```

### Mobile (Android)
```bash
npx cap open android
```
*This opens Android Studio. Wait for the sync to finish, then click the **Green Play Button**.*

---

## ✅ Troubleshooting
- **"Android platform not added"**: Run `npx cap add android`
- **Gradle Errors**: Make sure JDK 17 is selected in Android Studio (Settings > Build Tools > Gradle).
