# StuGig — Student Freelance Marketplace

A full-stack freelance marketplace where students offer services, post job requests, bid on tasks, communicate in real-time, and complete payments. Think Fiverr/Upwork, built for campus life.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Vite |
| State | React Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Bcrypt |
| Real-time | Socket.io |
| Payments | Stripe (sandbox / production) |
| Email | Nodemailer (SMTP — SendGrid / Resend) |
| AI | Google Gemini (with keyword-fallback mock) |

---

## Project Structure

```
stugig/
├── backend/          ← Express API + Socket.io server
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/        ← notify.js, sendEmail.js
│   ├── config/
│   ├── uploads/      ← local image storage (dev only)
│   ├── server.js
│   └── .env.example
├── client/           ← Vite + React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│   └── .env.example
└── render.yaml       ← One-click Render deployment
```

---

## Local Development

### Prerequisites
- Node.js v18+
- MongoDB running locally on `localhost:27017` (or a MongoDB Atlas URI)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in your values
npm run dev               # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env      # add your Stripe publishable key
npm run dev               # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to `localhost:5000` automatically — no CORS issues.

### 3. Run Backend Tests

```bash
cd backend
npm test
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for signing JWTs |
| `JWT_EXPIRE` | Token lifetime (e.g. `30d`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_SUCCESS_URL` | Redirect URL after successful payment |
| `STRIPE_CANCEL_URL` | Redirect URL after cancelled payment |
| `GEMINI_API_KEY` | Google Gemini API key (AI features) |
| `CLIENT_URL` | Frontend URL for CORS + email links |
| `EMAIL_HOST` | SMTP host (e.g. `smtp.sendgrid.net`) |
| `EMAIL_PORT` | SMTP port (587 or 465) |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password / API key |
| `EMAIL_FROM` | Sender address |

### Frontend (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |
| `VITE_API_URL` | Backend URL (production only — leave empty in dev) |

---

## Deploying to Render

This project includes a `render.yaml` Blueprint for one-click deployment.

### Steps

1. **Push to GitHub** — make sure both `backend/` and `client/` directories are committed.

2. **Create a MongoDB Atlas cluster** (free tier works):
   - Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
   - Add a database user and whitelist `0.0.0.0/0` (Render IPs)
   - Copy the connection string

3. **Deploy on Render**:
   - Go to [render.com](https://render.com) → New → Blueprint
   - Connect your GitHub repo
   - Render reads `render.yaml` and creates `stugig-backend` + `stugig-frontend`

4. **Set secret environment variables** in each service's Render dashboard:

   **stugig-backend:**
   ```
   MONGO_URI          = mongodb+srv://...
   JWT_SECRET         = <long random string>
   STRIPE_SECRET_KEY  = sk_test_...
   STRIPE_WEBHOOK_SECRET = whsec_...
   GEMINI_API_KEY     = ...
   CLIENT_URL         = https://stugig-frontend.onrender.com
   STRIPE_SUCCESS_URL = https://stugig-frontend.onrender.com/payment/success
   STRIPE_CANCEL_URL  = https://stugig-frontend.onrender.com/payment
   EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS / EMAIL_FROM (optional)
   ```

   **stugig-frontend:**
   ```
   VITE_API_URL                = https://stugig-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY = pk_test_...
   ```

5. **Redeploy the frontend** after setting `VITE_API_URL` so the build bakes in the correct backend URL.

6. **Set up Stripe webhooks** in the Stripe Dashboard:
   - Endpoint: `https://stugig-backend.onrender.com/api/payments/webhook`
   - Event: `payment_intent.succeeded`
   - Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET`

---

## Key Features

- **Roles** — Freelancer, Client, Admin (each with separate dashboards and permissions)
- **Jobs** — Post, browse, filter by category/budget, full-text search, pagination
- **Bidding** — Submit proposals, AI Bidding Assistant (Gemini), accept/reject with auto-notifications
- **Payments** — Stripe PaymentIntent, **15% platform commission** enforced server-side only
- **Chat** — Real-time Socket.io messaging per job thread, typing indicators
- **Notifications** — Real-time bell + DB persistence, auto-expiry after 60 days
- **Services** — Freelancers list gig-style services; clients browse and contact
- **Portfolio** — Image uploads, project URLs, displayed on public profiles
- **Reviews** — Multi-criterion rating (communication, quality, timeliness), avg auto-recalculated
- **AI Matchmaker** — Gemini scores job/freelancer compatibility; falls back to keyword overlap
- **Admin Panel** — Revenue charts, activity feed, user suspend/delete
- **Email** — Welcome, bid accepted, payment received/confirmed, password reset

---

## Known Limitations

- **File storage** — Uploaded images are stored in `backend/uploads/` on disk. On Render's free tier the filesystem is ephemeral; swap multer's disk storage for Cloudinary or S3 for persistence.
- **Stripe webhooks in dev** — Use the Stripe CLI: `stripe listen --forward-to localhost:5000/api/payments/webhook`
- **AI cold start** — Gemini calls add ~1–2s latency. The keyword fallback is instant.
