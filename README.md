# StuGig

StuGig is a student-focused freelance marketplace where students can offer services, post job requests, bid on tasks, communicate securely, and complete payments with ratings and reviews. It is tailored for academic and peer-to-peer work, operating similarly to Fiverr/Upwork.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, axios
- **State Management:** Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens) + Bcrypt
- **Real-time Communication:** Socket.io (for chat and typing indicators)
- **Payments:** Stripe (sandbox mode)

## Setup Instructions

### Prerequisites
- **Node.js** (v18+)
- **MongoDB**: Must be running locally on `localhost:27017` (or provide a remote URI in your `.env` file).
- **Stripe Account**: Needed for payment processing in test mode.

### 1. Server Setup (Backend)
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required secrets (JWT secret, Stripe secret key, Stripe webhook secret)
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### 2. Client Setup (Frontend)
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Stripe publishable test key
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client will run on `http://localhost:5173`.*

## Test Accounts

The following accounts can be used to test the end-to-end flow:
- **Client:** `c1@test.com` (Password: `Client2`)
- **Freelancer:** `yash@gamil.com` (Password: `Yash`)

## Known Limitations / Future Improvements

- **AI Matchmaker Onboarding:** Currently, there is no skills-onboarding nudge for new freelancers. If a freelancer has no skills registered, the AI matchmaker will yield low match scores.
- **Smart Bidding Assistant:** The suggested price range is currently wide (often spanning the entire client budget) rather than being specifically data-driven based on historical project data.
- **Local Payment Webhooks:** Payment status requires Stripe CLI webhook forwarding in local development (`stripe listen --forward-to localhost:5000/api/payments/webhook`). Without this, payments succeed on Stripe but remain "Pending" in the app's transaction history.
- **Public Profile Completion:** Public profiles have no default content prompting freelancers to fill in a bio or upload a portfolio.
