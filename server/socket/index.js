const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const initSocket = (io) => {
  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected via socket: ${socket.user.name} (${socket.user._id})`);

    // Join a conversation room (using jobId as conversationId)
    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.user._id} joined conversation ${conversationId}`);
    });

    // Handle sending a new message
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, receiverId, content, attachmentUrl } = data;
        
        // Save to database
        const message = new Message({
          conversationId, // Same as jobId based on our plan
          jobId: conversationId,
          senderId: socket.user._id,
          receiverId,
          content,
          attachmentUrl
        });
        
        await message.save();

        // Populate sender info before broadcasting
        await message.populate('senderId', 'name avatarUrl');
        
        // Broadcast to everyone in the room
        io.to(conversationId).emit('new-message', message);
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing status
    socket.on('typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user-typing', { userId: socket.user._id });
    });

    // Handle marking messages as read
    socket.on('mark-read', async ({ conversationId, messageIds }) => {
      try {
        if (messageIds && messageIds.length > 0) {
          await Message.updateMany(
            { _id: { $in: messageIds }, receiverId: socket.user._id },
            { $set: { readAt: new Date() } }
          );
          
          io.to(conversationId).emit('messages-read', {
            messageIds,
            readBy: socket.user._id,
            readAt: new Date()
          });
        }
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${socket.user._id}`);
    });
  });
};

module.exports = initSocket;
