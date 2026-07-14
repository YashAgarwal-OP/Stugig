import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import DashboardShell from '../components/organisms/DashboardShell';
import { ConversationListItem, MessageBubble, TypingIndicator, ChatInputBar } from '../components/organisms/Chat';
import Button from '../components/atoms/Button';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import LeaveReviewModal from '../components/organisms/LeaveReviewModal';

// Simple SVG Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
);
const PostJobIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ServicesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const JobsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const MessagesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const PaymentsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);

const clientNavItems = [
  { label: 'Dashboard', to: '/dashboard/client', icon: <DashboardIcon /> },
  { label: 'Post a Job', to: '/jobs/new', icon: <PostJobIcon /> },
  { label: 'Browse Services', to: '/services', icon: <ServicesIcon /> },
  { label: 'Messages', to: '/messages', icon: <MessagesIcon /> },
  { label: 'Payments', to: '/payment', icon: <PaymentsIcon /> },
];

const freelancerNavItems = [
  { label: 'Dashboard', to: '/dashboard/freelancer', icon: <DashboardIcon /> },
  { label: 'Browse Services', to: '/services', icon: <ServicesIcon /> },
  { label: 'Find Jobs', to: '/jobs', icon: <JobsIcon /> },
  { label: 'Messages', to: '/messages', icon: <MessagesIcon /> },
  { label: 'Payments', to: '/payment', icon: <PaymentsIcon /> },
];

export default function Messages() {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const navItems = user?.role === 'client' ? clientNavItems : freelancerNavItems;

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;
    // Connect to the same origin — Vite proxy forwards /socket.io to the backend
    socketRef.current = io(window.location.origin, {
      auth: { token },
      path: '/socket.io',
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketRef.current.on('new-message', (message) => {
      // jobId may be a populated object or a plain string depending on server populate
      const incomingJobId = message.jobId?._id?.toString() || message.jobId?.toString();
      if (activeConversation && incomingJobId === activeConversation) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
      // Re-fetch threads list to update latest messages
      fetchConversations();
    });

    socketRef.current.on('user-typing', ({ userId }) => {
      // Only show typing if it's the other user in the active thread
      if (activeConversation && userId !== user._id) {
        setTypingUser('Other user');
        setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [token, activeConversation]);

  // Fetch threads/conversations
  const fetchConversations = async () => {
    try {
      const res = await client.get('/messages');
      setConversations(res.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await client.get(`/messages/${activeConversation}`);
        setMessages(res.data || []);
        scrollToBottom();

        // Also fetch active Job details for the status actions
        const jobRes = await client.get(`/jobs/${activeConversation}`);
        setActiveJob(jobRes.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();

    // Join room
    if (socketRef.current) {
      socketRef.current.emit('join-conversation', activeConversation);
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (text) => {
    if (!socketRef.current || !activeConversation) return;

    // Find recipient — safely access latestMessage fields
    const activeThread = conversations.find(c => c._id === activeConversation);
    if (!activeThread?.latestMessage) return;

    const myId = (user._id || user.id).toString();
    
    // Determine the other user in this conversation
    const senderId = activeThread.latestMessage.senderId?._id?.toString() || activeThread.latestMessage.senderId?.toString();
    const receiverId = activeThread.latestMessage.receiverId?._id?.toString() || activeThread.latestMessage.receiverId?.toString();
    
    const otherUserId = senderId === myId ? receiverId : senderId;

    if (!otherUserId) {
      console.error('[handleSendMessage] Could not determine receiver ID');
      return;
    }

    socketRef.current.emit('send-message', {
      conversationId: activeConversation,
      receiverId: otherUserId,
      content: text
    });
  };

  const handleTyping = () => {
    if (socketRef.current && activeConversation) {
      socketRef.current.emit('typing', { conversationId: activeConversation });
    }
  };

  const markJobComplete = async () => {
    if (!activeConversation || !activeJob) return;
    try {
      await client.put(`/jobs/${activeConversation}/status`, { status: 'completed' });
      // Re-fetch job details
      const jobRes = await client.get(`/jobs/${activeConversation}`);
      setActiveJob(jobRes.data);
    } catch (err) {
      console.error('Error completing job:', err);
    }
  };

  return (
    <DashboardShell navItems={navItems}>
      <div className="max-w-[1440px] mx-auto h-[calc(100vh-160px)] flex bg-white rounded-2xl border border-[#e7e8e9] overflow-hidden shadow-sm">
        {/* Left Side: Threads List */}
        <div className="w-80 border-r border-[#e7e8e9] flex flex-col">
          <div className="p-4 border-b border-[#e7e8e9] bg-[#f8f9fa]">
            <h2 className="font-bold font-headline text-lg text-[#191c1d]">Chats & Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-[#e7e8e9]">
            {loading ? (
              <div className="text-center py-8 text-[#464555] font-body text-sm">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-[#464555] font-body text-sm px-4">No active conversations found. Apply to jobs to start a chat.</div>
            ) : (
              conversations.map((c) => {
                // Guard: skip threads with no latestMessage (shouldn't happen but be safe)
                if (!c.latestMessage?.senderId?._id) return null;
                const myId = (user._id || user.id).toString();
                const isSenderMe = myId === c.latestMessage.senderId._id.toString();
                const other = isSenderMe ? c.latestMessage.receiverId : c.latestMessage.senderId;
                const threadData = {
                  jobTitle: c.latestMessage.jobId?.title || 'Job Thread',
                  otherUser: other,
                  lastMessage: c.latestMessage.content,
                  unread: 0 // Mocked for MVP
                };
                return (
                  <ConversationListItem
                    key={c._id}
                    thread={threadData}
                    active={activeConversation === c._id}
                    onClick={() => setActiveConversation(c._id)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className="flex-1 flex flex-col bg-[#f8f9fa]">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#e7e8e9] bg-white flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-bold font-headline text-[#191c1d]">{activeJob?.title || 'Chat Details'}</h3>
                  <p className="text-xs text-[#777587] font-body mt-0.5 capitalize">Status: {activeJob?.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Complete Job CTA */}
                  {user.role === 'client' && activeJob?.status === 'in-progress' && (
                    <Button variant="accent" size="sm" onClick={markJobComplete}>
                      Mark Job as Complete
                    </Button>
                  )}
                  {/* Pay Freelancer CTA */}
                  {user.role === 'client' && activeJob?.status === 'completed' && (
                    <Button variant="primary" size="sm" onClick={() => window.location.href = `/payment?jobId=${activeConversation}`}>
                      Pay Freelancer
                    </Button>
                  )}
                  {/* Leave Feedback CTA */}
                  {activeJob?.status === 'completed' && (
                    <Button variant="secondary" size="sm" onClick={() => setReviewModalOpen(true)}>
                      Leave Feedback
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {messages.map((m) => (
                  <MessageBubble
                    key={m._id}
                    message={{
                      text: m.content,
                      createdAt: m.createdAt,
                      sender: m.senderId
                    }}
                    isOwn={(m.senderId?._id?.toString() || m.senderId?.toString()) === (user._id || user.id).toString()}
                  />
                ))}
                {typingUser && <TypingIndicator name={typingUser} />}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <ChatInputBar
                onSend={handleSendMessage}
                onTyping={handleTyping}
                disabled={activeJob?.status === 'completed'}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
              <svg className="w-12 h-12 text-[#777587]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h3 className="font-bold text-sm font-headline text-[#191c1d]">No Chat Selected</h3>
              <p className="text-xs text-[#464555] font-body">Select a conversation thread from the sidebar to view messages.</p>
            </div>
          )}
        </div>
      </div>

      {activeConversation && (
        <LeaveReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          jobId={activeConversation}
          revieweeId={(() => {
            const thread = conversations.find((c) => c._id === activeConversation);
            if (!thread?.latestMessage?.senderId?._id) return null;
            const myId = (user._id || user.id).toString();
            return myId === thread.latestMessage.senderId._id.toString()
              ? thread.latestMessage.receiverId?._id
              : thread.latestMessage.senderId._id;
          })()}
          onReviewSubmitted={async () => {
            // Re-fetch job info to reflect review state if needed
            const jobRes = await client.get(`/jobs/${activeConversation}`);
            setActiveJob(jobRes.data);
          }}
        />
      )}
    </DashboardShell>
  );
}
