import { motion } from 'motion/react';
import { LogIn, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function LoginView() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('Account created successfully! You can now sign in.');
        setIsSignUp(false);
        setPassword('');
      }
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Panel */}
      <div className="w-full lg:w-[45%] xl:w-1/2 flex flex-col justify-center items-center p-5 sm:p-8 md:p-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px]"
        >
          {/* Texts */}
          <h1 className="text-[26px] sm:text-[30px] font-bold text-neutral-900 mb-1.5 tracking-tight">
            Hello, <span className={isSignUp ? '' : 'font-black'}>{isSignUp ? 'Welcome!' : 'Welcome Back!'}</span>
          </h1>
          <p className="text-[13px] text-neutral-500 mb-5 font-medium">
            {isSignUp ? 'Create an account to get started.' : "We're happy to see you again . let's Stay ahead of the game."}
          </p>

          {/* Social Logins */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors font-bold text-neutral-700 text-xs sm:text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.992 10.992 0 0012 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors font-bold text-neutral-700 text-xs sm:text-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.29-.88 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.61 1.54-1.33 2.97-2.53 4.1zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2.5 mb-3">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs font-semibold">Or Continue With</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-neutral-400 text-[14px] font-medium"
                placeholder="sadeghsadegi1999@gmail.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-neutral-400 text-[14px] font-medium tracking-widest"
                  placeholder="••••••••"
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end pt-1">
                <button type="button" className="text-xs font-bold text-neutral-900 hover:underline">Forgot Password?</button>
              </div>
            )}

            {error && <p className="text-xs sm:text-sm text-red-500 text-center">{error}</p>}
            {successMsg && <p className="text-xs sm:text-sm text-green-600 text-center">{successMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 hover:bg-neutral-900 transition-colors text-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'SIGN UP' : 'LOGIN')}
            </button>
          </form>

          <div className="mt-5 text-center text-[13px] text-neutral-500 font-medium">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMsg(null); }}
              className="font-bold text-neutral-900 hover:underline"
            >
              {isSignUp ? 'Log in' : 'Sign up for free'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:block lg:w-[55%] xl:w-1/2 relative bg-[#1c2317] overflow-hidden">
        {/* Deep greenish tint overlay like the reference */}
        <div className="absolute inset-0 bg-[#253224]/60 mix-blend-multiply z-10" />
        
        {/* Main image */}
        <img 
          src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=2835&auto=format&fit=crop" 
          alt="Style portrait" 
          className="absolute inset-0 w-full h-full object-cover grayscale-[30%]"
        />

        {/* Overlay gradient for text readability at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 lg:p-20 items-center">
          {/* Logo element */}
          <div className="flex items-center gap-4 mb-8">
            <svg width="60" height="36" viewBox="0 0 50 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C16.9143 0 21.1396 2.9554 23.0113 7.23439C20.4682 8.79092 18.8 11.5165 18.8 14.6C18.8 17.6536 20.4285 20.3541 22.9248 21.9317C20.9168 23.2389 16.6346 24 12 24ZM38 24C44.6274 24 50 18.6274 50 12C50 5.37258 44.6274 0 38 0C31.3726 0 26 5.37258 26 12C26 18.6274 31.3726 24 38 24Z" fill="white"/>
            </svg>
            <h2 className="text-white text-[32px] font-black tracking-tight uppercase">ARHAM CHAT.</h2>
          </div>

          <p className="text-white text-sm font-medium leading-loose max-w-[500px] text-center tracking-wider mb-14 opacity-90 mx-auto">
            "I'VE BEEN USING THIS CHAT APP FOR A FEW WEEKS. IT PROVIDES A TON OF USEFUL FEATURES AND I PARTICULARLY LIKE THE REAL-TIME UPDATES AND ALERTS."
          </p>

          <div className="flex gap-4 justify-center">
            <div className="w-10 h-[3px] bg-white rounded-full"></div>
            <div className="w-10 h-[3px] bg-white/30 rounded-full"></div>
            <div className="w-10 h-[3px] bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

