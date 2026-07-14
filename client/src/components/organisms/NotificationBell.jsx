import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Button from '../atoms/Button';

export default function NotificationBell() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await client.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Setup Socket & Fetch Initial Data
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    fetchNotifications();

    // Connect to the same origin — Vite proxy forwards /socket.io to the backend
    socketRef.current = io(window.location.origin, {
      auth: { token },
      path: '/socket.io',
    });

    socketRef.current.on('notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isAuthenticated, token]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await client.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    if (!notif.read) {
      try {
        await client.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Helper to format relative time
  const timeAgo = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#464555] hover:text-[#3525cd] transition-colors rounded-full hover:bg-[#f8f9fa] flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#e7e8e9] overflow-hidden z-50">
          <div className="p-3 border-b border-[#e7e8e9] flex justify-between items-center bg-[#f8f9fa]">
            <h3 className="font-bold font-headline text-[#191c1d] text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[#3525cd] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#777587] text-sm font-body">
                You're all caught up!
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b border-[#e7e8e9] last:border-b-0 cursor-pointer transition-colors ${notif.read ? 'bg-white hover:bg-[#f8f9fa]' : 'bg-[#f4f3ff] hover:bg-[#eae8ff]'}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className={`text-sm font-body ${notif.read ? 'text-[#464555]' : 'text-[#191c1d] font-semibold'}`}>
                        {notif.message}
                      </p>
                      <span className="text-xs text-[#777587] mt-1 block font-label">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-[#3525cd] shrink-0 mt-1.5"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
