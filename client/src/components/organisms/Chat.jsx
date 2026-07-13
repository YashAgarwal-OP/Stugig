import { Avatar } from '../atoms/Avatar';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';

// ConversationListItem — one thread in the left panel
export function ConversationListItem({ thread, active, onClick }) {
  const { jobTitle, otherUser, lastMessage, unread } = thread || {};
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        active ? 'bg-[#e2dfff]' : 'hover:bg-[#f3f4f5]'
      )}
    >
      <Avatar name={otherUser?.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-label text-[#191c1d] truncate">{otherUser?.name ?? 'User'}</p>
        <p className="text-xs text-[#777587] truncate">{jobTitle ?? ''}</p>
        <p className="text-xs text-[#464555] truncate mt-0.5">{lastMessage}</p>
      </div>
      {unread > 0 && (
        <span className="bg-[#3525cd] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{unread}</span>
      )}
    </button>
  );
}

// MessageBubble — single chat message
export function MessageBubble({ message, isOwn }) {
  const { text, createdAt, sender } = message || {};
  return (
    <div className={clsx('flex items-end gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {!isOwn && <Avatar name={sender?.name} size="xs" />}
      <div className={clsx(
        'max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 text-sm font-body',
        isOwn
          ? 'bg-[#3525cd] text-white rounded-br-sm'
          : 'bg-[#e7e8e9] text-[#191c1d] rounded-bl-sm'
      )}>
        {text}
        <p className={clsx('text-[10px] mt-0.5', isOwn ? 'text-[#c3c0ff]' : 'text-[#777587]')}>
          {createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </p>
      </div>
    </div>
  );
}

// TypingIndicator
export function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#777587] font-body px-2 py-1">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#777587] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <span>{name} is typing…</span>
    </div>
  );
}

// ChatInputBar
export function ChatInputBar({ onSend, onTyping, disabled }) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText('');
  };

  // If the job is completed, show a clear banner instead of a silent disabled input
  if (disabled) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-[#e7e8e9] bg-[#f8f9fa]">
        <svg className="w-4 h-4 text-[#777587] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-[#777587] font-body">
          This job is complete — messaging is closed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 p-4 border-t border-[#e7e8e9] bg-white">
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); onTyping?.(); }}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="Type a message…"
        rows={1}
        className="flex-1 rounded-xl border border-[#c7c4d8] px-4 py-2.5 text-sm text-[#191c1d] placeholder:text-[#777587] focus:outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 resize-none font-body"
      />
      <button
        onClick={submit}
        disabled={!text.trim()}
        className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center hover:bg-[#2419a0] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
      >
        <svg className="w-5 h-5 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      </button>
    </div>
  );
}
