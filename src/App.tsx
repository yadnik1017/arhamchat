/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { ChatListView } from './components/ChatListView';
import { ChatWindowView } from './components/ChatWindowView';
import { Conversation } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, MessageSquare, MessageCircle, Bell, Plus, ChevronDown, ArrowLeft, LogOut } from 'lucide-react';

function MainContent() {
  const { user, loading, isConfigured, signOut } = useAuth();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-50 text-brand">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
        <div className="max-w-md w-full glass p-8 rounded-2xl shadow-sm bg-white text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-4">Configuration Required</h2>
          <p className="text-neutral-600 mb-6 leading-relaxed">
            Please add your Supabase credentials to the <strong>Secrets</strong> panel in AI Studio:
          </p>
          <div className="space-y-3 text-left bg-neutral-50 p-4 rounded-xl border border-neutral-100 font-mono text-xs text-neutral-500">
            <p>VITE_SUPABASE_URL</p>
            <p>VITE_SUPABASE_ANON_KEY</p>
          </div>
          <p className="mt-6 text-sm text-neutral-400 italic">Apps reset after changes are applied.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
       {/* Top Navigation */}
       <nav className="flex flex-wrap items-center justify-between px-6 py-3 bg-white border-b border-neutral-100 shrink-0">
             <div className="flex items-center gap-2">
                <div className="text-brand font-bold text-2xl flex items-center gap-2 tracking-tight">
                   <MessageCircle className="w-8 h-8 text-neutral-900" />
                   Arham Chat
                </div>
             </div>

             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-2 py-1.5">
                   <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-neutral-100">
                     <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}`} alt="Profile" className="w-full h-full object-cover" />
                   </div>
                   <div className="hidden sm:flex items-center gap-1 text-[15px] font-semibold text-neutral-900">
                      {user?.email?.split('@')[0]}
                   </div>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-red-600 transition-colors bg-neutral-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
             </div>
       </nav>

       {/* Main Content Area */}
       <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={`w-full md:w-[320px] lg:w-[350px] shrink-0 border-r border-neutral-100 bg-white flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
            <ChatListView 
              onSelectConversation={setActiveConversation} 
              activeConversationId={activeConversation?.id}
            />
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col bg-[#F9F9F9] relative ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
            <AnimatePresence mode="wait">
              {activeConversation ? (
                <motion.div 
                  key={activeConversation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col"
                >
                  <ChatWindowView 
                    conversation={activeConversation} 
                    onBack={() => setActiveConversation(null)}
                  />
                </motion.div>
              ) : (
                <div className="flex-1 items-center justify-center flex flex-col text-neutral-400">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-neutral-300" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-700 mb-1">Select a chat to start</h2>
                  <p className="text-sm">Choose from your existing conversations.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
       </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
