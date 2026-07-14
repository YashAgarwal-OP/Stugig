# 🚨 Quick Fix: Frontend Build Failed

## Error:
```
Empty build command; skipping build
Publish directory dist does not exist!
Build failed
```

## Root Cause:
The frontend static site was created without a build command, so npm never installed dependencies or built the React app.

## ✅ Solution:

### Step 1: Update Build Settings
1. Go to Render dashboard: https://dashboard.render.com/
2. Click on your **frontend/static site service** (probably named "stugig" or "stugig-frontend")
3. Click **"Settings"** in the left sidebar
4. Scroll to **"Build & Deploy"** section

### Step 2: Set Build Command
In the **Build Command** field, enter:
```bash
npm install && npm run build
```

### Step 3: Verify Publish Directory
In the **Publish Directory** field, make sure it says:
```
dist
```

### Step 4: Set Environment Variables
1. Scroll to **"Environment Variables"** section
2. Add these variables if they're not already there:

**VITE_API_URL**
```
https://your-backend-name.onrender.com
```
(Replace with your actual backend URL - get it from your backend service page)

**VITE_STRIPE_PUBLISHABLE_KEY**
```
pk_test_your_stripe_publishable_key
```
(Get from Stripe dashboard → Developers → API keys)

### Step 5: Save and Deploy
1. Click **"Save Changes"** at the bottom
2. Render will automatically trigger a redeploy
3. **OR** manually trigger: **"Manual Deploy"** → **"Clear build cache & deploy"**

### Step 6: Wait for Build
- Build takes 3-5 minutes
- Watch the logs for any errors
- When complete, status will show **"Live"** with green indicator

---

## 🔍 What the Build Command Does:

```bash
npm install          # Installs all dependencies from package.json
&&                   # Then (only if previous succeeded)
npm run build        # Runs Vite build to create optimized production files
```

This creates a `dist/` directory with your compiled React app:
```
dist/
  ├── index.html
  ├── assets/
  │   ├── index-abc123.js
  │   └── index-abc123.css
  └── ...
```

Render then serves files from this `dist/` directory.

---

## ✅ Verification:

After the build succeeds:

1. **Visit your frontend URL** (e.g., https://stugig.onrender.com)
2. **Homepage should load** without errors
3. **Open DevTools** (F12) → Console tab
4. **No errors** about missing files
5. **Try signup** to test backend connection

---

## 🐛 If Build Still Fails:

Check the build logs for specific errors:

### Common Issues:

**1. Node version mismatch**
```
error: package.json specifies engines.node >=18.0.0
```
**Fix**: Render should auto-detect from package.json, but you can explicitly set it in Settings → "Node Version"

**2. Missing dependencies**
```
error: Cannot find module 'react'
```
**Fix**: Verify `package.json` includes all dependencies. Run `npm install` locally to test.

**3. Build errors (TypeScript/Vite)**
```
error: TS2307: Cannot find module
```
**Fix**: Fix the errors in your code, push to GitHub, and Render will auto-deploy.

**4. Environment variable needed at build time**
```
error: VITE_API_URL is not defined
```
**Fix**: Env vars starting with `VITE_` must be set in Render's environment variables **before** building.

---

## 📞 Still Stuck?

Share the **build logs** from Render:
1. Click on your frontend service
2. Click **"Logs"** tab
3. Copy the error messages
4. Share them for specific help

---

## 💡 Alternative: Use Blueprint

If manual setup keeps failing, delete the services and use Blueprint:

1. Render dashboard → Your services → **"..."** → **"Delete"**
2. Go to **"New"** → **"Blueprint"**
3. Select your repo: `YashAgarwal-OP/Stugig`
4. Render reads `render.yaml` and sets everything automatically
5. Then just add the secret environment variables

This is more reliable than manual setup!
