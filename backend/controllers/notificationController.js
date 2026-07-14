const Notification = require('../models/Notification');

// @desc    Get all notifications for the authenticated user (newest first)
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // cap at 50 for the dropdown

    res.status(200).json(notifications);
  } catch (error) {
    console.error('[Notifications] getNotifications error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Users can only update their own notifications
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('[Notifications] markRead error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications for the user as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[Notifications] markAllRead error:', error);
    res.status(500).json({ message: error.message });
  }
};
