const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── Stripe webhook MUST come before express.json() (needs raw body) ──────────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ── Standard middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Static file serving for uploads ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',              require('./routes/authRoutes'));
app.use('/api/jobs',              require('./routes/jobRoutes'));
app.use('/api/bids',              require('./routes/bidRoutes'));
app.use('/api/payments',          require('./routes/paymentRoutes'));
app.use('/api/users',             require('./routes/userRoutes'));
app.use('/api/services',          require('./routes/serviceRoutes'));
app.use('/api/portfolio',         require('./routes/portfolioRoutes'));
app.use('/api/reviews',           require('./routes/reviewRoutes'));
app.use('/api/messages',          require('./routes/messageRoutes'));
app.use('/api/admin',             require('./routes/adminRoutes'));
app.use('/api/matchmaker',        require('./routes/matchmakerRoutes'));
app.use('/api/bidding-assistant', require('./routes/biddingAssistantRoutes'));
app.use('/api/ai',                require('./routes/aiRoutes'));
app.use('/api/notifications',     require('./routes/notificationRoutes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'StuGig API is running' });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Multer file type error
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
