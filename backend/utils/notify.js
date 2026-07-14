/**
 * notify.js
 * Helper to create a Notification document and emit it to the
 * recipient via Socket.io in real-time (if they are connected).
 *
 * Usage:
 *   const notify = require('../utils/notify');
 *   await notify(io, { userId, type, message, link });
 *
 * `io` is the Socket.io Server instance attached to app.locals.io
 * in server.js.  Falls back gracefully if io is not available.
 */

const Notification = require('../models/Notification');

/**
 * @param {import('socket.io').Server|null} io  - Socket.io server instance
 * @param {object} payload
 * @param {string} payload.userId   - Recipient user _id (string or ObjectId)
 * @param {string} payload.type     - Notification type enum value
 * @param {string} payload.message  - Human-readable notification text
 * @param {string} [payload.link]   - Optional deep-link path (e.g. '/jobs/:id')
 */
const notify = async (io, { userId, type, message, link = '' }) => {
  try {
    const notification = await Notification.create({ userId, type, message, link });

    // Emit real-time event to the recipient's personal room
    // Each connected socket joins a room named after their userId in server.js
    if (io) {
      io.to(`user:${userId.toString()}`).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    // Non-fatal — log but never throw so the calling action still completes
    console.error('[notify] Failed to create notification:', err.message);
  }
};

module.exports = notify;
