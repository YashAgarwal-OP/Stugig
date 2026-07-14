# 🚀 StuGig Deployment Checklist

Use this checklist to ensure a successful deployment to Render.

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- [ ] Created MongoDB Atlas account at https://cloud.mongodb.com/
- [ ] Created a free cluster
- [ ] Created database user with username and password
- [ ] Noted the password (you'll need it for connection string)
- [ ] Network Access → Add IP Address → **Allow access from anywhere (0.0.0.0/0)**
- [ ] Copied connection string (Database → Connect → Connect your application)
- [ ] Replaced `<password>` in connection string with actual password
- [ ] Tested connection string locally (optional)

### 2. Stripe Setup
- [ ] Created Stripe account at https://stripe.com
- [ ] Confirmed in **Test Mode** (toggle in dashboard)
- [ ] Copied **Secret Key** (starts with `sk_test_...`) from Developers → API keys
- [ ] Copied **Publishable Key** (starts with `pk_test_...`) from Developers → API keys
- [ ] Noted both keys securely

### 3. GitHub Setup
- [ ] Code pushed to GitHub repository
- [ ] Repository is accessible (public or Render has access)
- [ ] Latest changes committed and pushed
- [ ] Verified `render.yaml` is in root directory

### 4. Optional: Email Setup (Gmail)
- [ ] Gmail account ready
- [ ] 2-Factor Authentication enabled
- [ ] App Password created (https://support.google.com/accounts/answer/185833)
- [ ] App password noted (16-character password without spaces)

---

## 📦 Backend Deployment

### Step 1: Create Backend Service
- [ ] Logged into Render at https://render.com
- [ ] Clicked **"New"** → **"Web Service"**
- [ ] Connected GitHub account (if first time)
- [ ] Selected repository: `YashAgarwal-OP/Stugig`
- [ ] Configured service:
  - Name: `stugig-backend`
  - Root Directory: `backend`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance Type: `Free`

### Step 2: Set Backend Environment Variables
Click "Advanced" → "Add Environment Variable" and add each:

**Required:**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `MONGO_URI` = `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stugig?retryWrites=true&w=majority`
- [ ] `JWT_SECRET` = (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `JWT_EXPIRE` = `30d`
- [ ] `STRIPE_SECRET_KEY` = `sk_test_...`

**Update Later (after frontend deploys):**
- [ ] `CLIENT_URL` = `https://your-frontend.onrender.com`
- [ ] `STRIPE_SUCCESS_URL` = `https://your-frontend.onrender.com/payment/success`
- [ ] `STRIPE_CANCEL_URL` = `https://your-frontend.onrender.com/payment`

**Optional (email):**
- [ ] `EMAIL_HOST` = `smtp.gmail.com`
- [ ] `EMAIL_PORT` = `587`
- [ ] `EMAIL_USER` = `your-email@gmail.com`
- [ ] `EMAIL_PASS` = (Gmail app password)
- [ ] `EMAIL_FROM` = `StuGig <noreply@stugig.com>`

**Optional (AI features):**
- [ ] `GEMINI_API_KEY` = (from https://makersuite.google.com/app/apikey)
- [ ] `STRIPE_WEBHOOK_SECRET` = (leave empty for now)

### Step 3: Deploy Backend
- [ ] Clicked **"Create Web Service"**
- [ ] Waited for build to complete (5-10 minutes)
- [ ] Status shows **"Live"** with green indicator
- [ ] Copied backend URL (e.g., `https://stugig-backend.onrender.com`)
- [ ] Tested health endpoint: `https://your-backend.onrender.com/api/health`
- [ ] Health check returns: `{"success":true,"message":"StuGig API is running","database":{"connected":true}}`

---

## 🎨 Frontend Deployment

### Step 1: Create Static Site
- [ ] In Render dashboard, clicked **"New"** → **"Static Site"**
- [ ] Selected same repository: `YashAgarwal-OP/Stugig`
- [ ] Configured site:
  - Name: `stugig` (or `stugig-frontend`)
  - Root Directory: `client`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

### Step 2: Set Frontend Environment Variables
Add these environment variables:

- [ ] `VITE_API_URL` = `https://stugig-backend.onrender.com` (your backend URL from above)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (from Stripe dashboard)

⚠️ **CRITICAL**: Make sure `VITE_API_URL` does NOT have `/api` at the end!

### Step 3: Deploy Frontend
- [ ] Clicked **"Create Static Site"**
- [ ] Waited for build to complete (3-5 minutes)
- [ ] Status shows **"Live"**
- [ ] Copied frontend URL (e.g., `https://stugig.onrender.com`)

---

## 🔄 Post-Deployment Configuration

### Update Backend with Frontend URL
- [ ] Went back to backend service in Render
- [ ] Clicked **"Environment"** in left sidebar
- [ ] Updated these variables with your frontend URL:
  - [ ] `CLIENT_URL` = `https://stugig.onrender.com`
  - [ ] `STRIPE_SUCCESS_URL` = `https://stugig.onrender.com/payment/success`
  - [ ] `STRIPE_CANCEL_URL` = `https://stugig.onrender.com/payment`
- [ ] Clicked **"Save Changes"**
- [ ] Clicked **"Manual Deploy"** → **"Deploy latest commit"**
- [ ] Waited for redeploy to complete

---

## ✅ Verification Tests

### Backend Tests
- [ ] Health check works:
  ```bash
  curl https://stugig-backend.onrender.com/api/health
  ```
  Expected: `{"success":true,"database":{"connected":true}}`

- [ ] Test signup endpoint:
  ```bash
  node test-signup.js https://stugig-backend.onrender.com
  ```
  Expected: `✅ SUCCESS! Signup endpoint is working correctly.`

### Frontend Tests
- [ ] Visited frontend URL in browser
- [ ] Homepage loads without errors
- [ ] Opened browser DevTools (F12) → Console → No errors
- [ ] Opened Network tab
- [ ] Clicked "Sign Up"
- [ ] Filled form and submitted
- [ ] Network tab shows request to correct backend URL
- [ ] Signup succeeds and redirects to dashboard

### Full Flow Test
- [ ] Signed up as Freelancer
- [ ] Logged out
- [ ] Signed up as Client
- [ ] Client posted a job
- [ ] Logged out
- [ ] Logged in as Freelancer
- [ ] Browsed jobs and saw client's job
- [ ] Submitted a bid
- [ ] Logged in as Client
- [ ] Saw bid notification
- [ ] Accepted bid
- [ ] Chat works between client and freelancer

---

## 🐛 Troubleshooting

If signup fails, check in this order:

### 1. Backend Logs
- [ ] Render dashboard → Backend service → "Logs"
- [ ] Look for error messages when signup attempt is made
- [ ] Common errors:
  - `querySrv ENOTFOUND` → MongoDB connection issue
  - `MongoNetworkError` → MongoDB Atlas network access not configured
  - `JWT must be provided` → JWT_SECRET not set

### 2. Browser Console
- [ ] F12 → Console tab
- [ ] Look for JavaScript errors
- [ ] Common issues:
  - Network error → Frontend can't reach backend (check VITE_API_URL)
  - 404 error → Wrong backend URL
  - CORS error → Backend CORS config (already handled)

### 3. Network Tab
- [ ] F12 → Network tab
- [ ] Click on signup request
- [ ] Check:
  - Request URL: Should be `https://your-backend.onrender.com/api/auth/signup`
  - Status Code: Should be 201 for success
  - Response: Check error message if not success

### 4. Database Connection
- [ ] MongoDB Atlas → Network Access → Check 0.0.0.0/0 is allowed
- [ ] MongoDB Atlas → Database Access → Check user exists
- [ ] Backend env var → Verify MONGO_URI has correct password
- [ ] Test connection:
  ```bash
  curl https://stugig-backend.onrender.com/api/health
  ```
  Check `database.connected` is `true`

---

## 📝 Common Fixes

### "Network Error" in browser
**Solution**: Frontend can't reach backend
- [ ] Verify `VITE_API_URL` is set correctly in frontend env vars
- [ ] Rebuild frontend (Manual Deploy in Render)
- [ ] Confirm backend URL is accessible: visit `/api/health`

### "querySrv ENOTFOUND" in backend logs
**Solution**: MongoDB connection string issue
- [ ] Double-check `MONGO_URI` in backend env vars
- [ ] Verify password is correct (no typos)
- [ ] Check MongoDB Atlas Network Access allows 0.0.0.0/0
- [ ] Wait 2-3 minutes after whitelist change

### Signup succeeds but no welcome email
**Solution**: This is expected if email env vars aren't set
- [ ] This is non-critical - app works without email
- [ ] To fix: Add email credentials in backend env vars
- [ ] Use Gmail app password, not regular password

### "CORS policy" error in browser
**Solution**: This shouldn't happen (backend allows all .onrender.com)
- [ ] Check backend logs to confirm
- [ ] Verify backend `CLIENT_URL` is set correctly
- [ ] Restart backend service

---

## ✨ Success Criteria

You're done when:
- ✅ Backend health check returns database connected
- ✅ Frontend loads without console errors
- ✅ Signup creates new user and redirects to dashboard
- ✅ Can post jobs and submit bids
- ✅ Chat works between users
- ✅ Payments redirect to Stripe (test mode)

---

## 🎉 Deployment Complete!

Your StuGig app is now live at:
- **Frontend**: https://stugig.onrender.com
- **Backend**: https://stugig-backend.onrender.com

Share with users and start testing! 🚀

---

## 📞 Need Help?

If you're still stuck:
1. Re-read [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
2. Check all items in this checklist
3. Review error messages carefully
4. Search the error on Google/Stack Overflow
5. Open an issue on GitHub with:
   - Backend logs
   - Browser console errors
   - Network tab screenshot
   - Checklist items you've completed
