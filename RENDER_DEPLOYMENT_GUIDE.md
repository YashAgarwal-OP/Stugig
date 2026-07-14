# StuGig Render Deployment Guide

## Problem Diagnosis

If signup is failing on Render, it's likely due to one of these issues:

### 1. Frontend can't reach backend (most common)
- **Symptom**: Browser console shows network errors, 404, or "Failed to fetch"
- **Fix**: Set `VITE_API_URL` in frontend service environment variables

### 2. Backend can't connect to MongoDB
- **Symptom**: Server logs show "querySrv ENOTFOUND" or connection timeout
- **Fix**: Verify MongoDB Atlas connection string and IP whitelist

### 3. Missing environment variables
- **Symptom**: 500 errors, or specific features failing
- **Fix**: Set all required env vars in Render dashboard

---

## Step-by-Step Deployment

### Part 1: MongoDB Atlas Setup (if not done)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (if you don't have one)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/stugig?retryWrites=true&w=majority`)
5. Replace `<password>` with your actual database password
6. **Important**: Go to **Network Access** → Click **"Add IP Address"** → Select **"Allow access from anywhere"** (0.0.0.0/0)
   - This is required for Render's dynamic IPs

### Part 2: Backend Service Setup

1. **Push code to GitHub** (already done ✓)

2. **Create Backend Web Service** in Render:
   - Dashboard → "New" → "Web Service"
   - Connect your GitHub repo: `YashAgarwal-OP/Stugig`
   - Settings:
     - **Name**: `stugig-backend`
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Set Environment Variables** for backend:
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/stugig?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-key-at-least-32-chars-long
   JWT_EXPIRE=30d
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=(leave empty for now, add after setting up webhook)
   CLIENT_URL=https://stugig.onrender.com
   STRIPE_SUCCESS_URL=https://stugig.onrender.com/payment/success
   STRIPE_CANCEL_URL=https://stugig.onrender.com/payment
   GEMINI_API_KEY=your_gemini_api_key_if_using_ai_features
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   EMAIL_FROM="StuGig" <noreply@stugig.com>
   ```

4. **Deploy** and wait for it to complete
5. **Copy the backend URL** (e.g., `https://stugig-backend.onrender.com`)

### Part 3: Frontend Static Site Setup

1. **Create Static Site** in Render:
   - Dashboard → "New" → "Static Site"
   - Connect the same GitHub repo
   - Settings:
     - **Name**: `stugig-frontend` (or just `stugig`)
     - **Root Directory**: `client`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Set Environment Variables** for frontend:
   ```
   VITE_API_URL=https://stugig-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

3. **Deploy** the frontend

4. **Update Backend CLIENT_URL**:
   - Go back to your backend service
   - Update `CLIENT_URL` env var to your frontend URL (e.g., `https://stugig.onrender.com`)
   - Manually redeploy the backend

### Part 4: Verification

1. **Check backend health**:
   - Visit: `https://stugig-backend.onrender.com/api/health`
   - Should return: `{"success":true,"message":"StuGig API is running"}`

2. **Check frontend**:
   - Visit your frontend URL
   - Open browser DevTools → Network tab
   - Try to signup
   - Check if requests go to the correct backend URL

3. **Check backend logs** in Render:
   - Click on backend service → "Logs"
   - Look for connection errors or failed requests

---

## Common Errors and Fixes

### Error: "Network Error" or "Failed to fetch" in browser

**Cause**: Frontend can't reach backend
**Fix**: 
- Verify `VITE_API_URL` is set correctly in frontend service
- Rebuild frontend after changing env vars (Render → Manual Deploy)
- Check backend URL is accessible: `https://your-backend.onrender.com/api/health`

### Error: "querySrv ENOTFOUND" in backend logs

**Cause**: MongoDB connection string is wrong or IP not whitelisted
**Fix**:
- Verify `MONGO_URI` is correct (check for typos)
- In MongoDB Atlas → Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)
- Wait 2-3 minutes after whitelist change

### Error: "JWT malformed" or auth failures

**Cause**: JWT_SECRET mismatch or not set
**Fix**:
- Verify `JWT_SECRET` is set in backend env vars
- Make sure it's the same value every time (don't change it between deploys)

### Error: CORS errors in browser console

**Cause**: Backend CORS not allowing frontend domain
**Fix**: Already handled in code - backend allows `.onrender.com` domains

### Error: Signup works but no welcome email

**Cause**: Email credentials not set or incorrect
**Fix**: This is non-blocking - app works without email. To fix:
- Use Gmail with [App Password](https://support.google.com/accounts/answer/185833)
- Set `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` in backend

---

## Testing Signup After Deployment

1. Go to your frontend URL
2. Click "Sign Up"
3. Fill in the form
4. Open browser DevTools → Console
5. Look for any error messages

### If signup fails:

**Check browser console for:**
- Network tab: Is the request going to the right URL?
- Console tab: Any JavaScript errors?
- Response: What status code? (400, 401, 500?)

**Check Render backend logs:**
- Go to Render dashboard → stugig-backend → Logs
- Look for error messages when you attempt signup
- Common issues:
  - MongoDB connection errors
  - Missing environment variables
  - Validation errors

---

## Quick Troubleshooting Commands

```bash
# Test backend health
curl https://stugig-backend.onrender.com/api/health

# Test signup endpoint
curl -X POST https://stugig-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "freelancer"
  }'
```

If the curl commands work but the browser doesn't, it's a frontend configuration issue (likely `VITE_API_URL`).

---

## Need More Help?

Share the following information:

1. **Backend logs** from Render (click "Logs" in backend service)
2. **Browser console errors** (press F12 → Console tab when signup fails)
3. **Network tab response** (F12 → Network → click the failed signup request)

This will help diagnose the exact issue.
