const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');
const Message = require('./models/Message');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

// ── Create HTTP server and attach Socket.io ───────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests from CLIENT_URL, or any onrender.com subdomain,
      // or localhost in development (and no-origin requests like curl/Postman)
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const allowed = [clientUrl, /\.onrender\.com$/, /localhost/];
      if (!origin || allowed.some(p => typeof p === 'string' ? p === origin : p.test(origin))) {
        callback(null, true);
      } else {
        callback(null, true); // permissive for now — tighten after confirming URLs
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Expose io to all controllers via req.app.locals.io
app.locals.io = io;

// ── Socket.io JWT authentication middleware ───────────────────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_stugig');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// ── Socket.io connection handler ──────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.user.name} (${socket.user._id})`);

  // Join a personal room so targeted notifications can be delivered
  socket.join(`user:${socket.user._id.toString()}`);

  // Join a job conversation room
  socket.on('join-conversation', (jobId) => {
    socket.join(`job:${jobId}`);
    console.log(`[Socket] ${socket.user.name} joined room job:${jobId}`);
  });

  // Leave a job conversation room
  socket.on('leave-conversation', (jobId) => {
    socket.leave(`job:${jobId}`);
  });

  // Send a message
  socket.on('send-message', async ({ conversationId, receiverId, content }) => {
    try {
      if (!conversationId || !receiverId || !content?.trim()) return;

      const message = await Message.create({
        jobId: conversationId,
        senderId: socket.user._id,
        receiverId,
        content: content.trim()
      });

      const populated = await Message.findById(message._id)
        .populate('senderId', 'name profilePhotoUrl')
        .populate('receiverId', 'name profilePhotoUrl');

      // Emit to everyone in the room (including sender for confirmation)
      io.to(`job:${conversationId}`).emit('new-message', populated);
    } catch (err) {
      console.error('[Socket] send-message error:', err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ conversationId }) => {
    socket.to(`job:${conversationId}`).emit('user-typing', {
      userId: socket.user._id,
      name: socket.user.name
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.user.name}`);
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`StuGig Server running on port ${PORT}`);
});

// Handle unhandled promise rejections — log but don't exit in production
// (Render will restart the instance on a real crash; exiting on every rejection
//  causes a crash loop on free tier when external services are unreachable)
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    server.close(() => process.exit(1));
  }
});
