import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Conversation, Message } from '../types';
import { cn } from '../lib/utils';

interface ChatWindowViewProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatWindowView({ conversation, onBack }: ChatWindowViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversation.id) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content,
    });

    if (error) {
      console.error('Error sending message:', error);
      // Optional: re-set input on error
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F9F9F9] relative overflow-hidden">
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-neutral-200 bg-white z-10 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 -ml-2 text-neutral-500 hover:bg-neutral-50 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="w-11 h-11 bg-neutral-200 rounded-full overflow-hidden shrink-0 border border-neutral-100 relative">
             <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${conversation.other_participant?.email}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-lg text-neutral-900 leading-tight tracking-tight">
              {conversation.other_participant?.email?.split('@')[0] || 'User'}
            </h3>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scroll-smooth bg-[#F9F9F9]"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex items-end gap-3",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                 {!isMe && (
                   <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mb-4 border border-neutral-100">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${conversation.other_participant?.email}`} className="w-full h-full object-cover" />
                   </div>
                 )}
                 <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className={cn(
                       "px-5 py-3.5 text-[15px] shadow-sm relative",
                       isMe ? "bg-black text-white rounded-[20px] rounded-br-sm" : "bg-neutral-100 text-neutral-800 rounded-[20px] rounded-bl-sm"
                    )}>
                      {msg.content}
                      <div className={cn(
                        "text-[10px] absolute -bottom-5 w-max font-medium opacity-60",
                        isMe ? "right-1 text-neutral-500" : "left-1 text-neutral-500"
                      )}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                 </div>
                 {isMe && (
                   <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mb-4 border border-neutral-100">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}`} className="w-full h-full object-cover" />
                   </div>
                 )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input */}
      <footer className="px-8 pb-8 pt-4 bg-[#F9F9F9] shrink-0 border-t-0">
        <form 
          onSubmit={handleSendMessage}
          className="bg-white rounded-full flex items-center p-2 px-4 shadow-sm border border-neutral-200"
        >
          <button type="button" className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors" title="Attach file">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask anything from here"
            className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-neutral-400 px-3 min-w-0"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
