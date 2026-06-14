/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, User, Phone, Sparkles, LogIn, Lock, Scissors, Check, 
  Eye, EyeOff, Calendar, Award, ChevronDown, RefreshCw, AlertCircle, Info, Chrome
} from 'lucide-react';
import { UserRole, User as GLUser } from '../types';
import { supabase } from '../lib/supabase';
// @ts-ignore
import officialLogo from '../assets/images/princess_burland_logo_1781196879431.jpg';

interface AuthLayoutProps {
  onSuccess: (user: GLUser) => void;
}

export default function AuthLayout({ onSuccess }: AuthLayoutProps) {
  // Auth view tabs: 'login' | 'register' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  
  // Basic Fields
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<UserRole>('customer');

  // Optional Fields
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [gender, setGender] = useState<string>('Female');
  const [preferredStylist, setPreferredStylist] = useState<string>('Gloria Oduraa');
  const [showOptional, setShowOptional] = useState<boolean>(false);

  // Interaction UX states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password strength score calculation (0 to 3)
  const [pwdStrength, setPwdStrength] = useState<{ score: number; label: string; color: string }>({ 
    score: 0, label: 'Unentered', color: 'bg-zinc-700' 
  });

  // Calculate password strength dynamically
  useEffect(() => {
    if (!password) {
      setPwdStrength({ score: 0, label: 'Unentered', color: 'bg-zinc-700' });
      return;
    }
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;

    let label = 'Weak';
    let color = 'bg-red-500';
    if (score === 2) {
      label = 'Moderate';
      color = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Strong Royalty Grade';
      color = 'bg-emerald-500';
    }

    setPwdStrength({ score, label, color });
  }, [password]);

  // Handle Form Submission (Sign Up / Login / Reset)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    // Dynamic warning message in case user runs in a sandbox env with default settings
    const isSandboxMock = !((import.meta as any).env?.VITE_SUPABASE_URL) || ((import.meta as any).env?.VITE_SUPABASE_URL).includes('placeholder-project');

    if (authMode === 'register') {
      // Validations
      if (password !== confirmPassword) {
        setFeedback({ type: 'error', message: 'Passwords do not match. Please verify your typing.' });
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setFeedback({ type: 'error', message: 'Password must be at least 6 characters per Supabase security requirements.' });
        setLoading(false);
        return;
      }

      try {
        let authUserId = `usr-${Math.random().toString(36).substring(2, 10)}`;
        
        if (isSandboxMock) {
          console.warn('[Supabase Mock Simulation Active] Signing up locally in sandbox mode.');
        } else {
          // 1. SignUp to Supabase
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                phone: phoneNumber,
              }
            }
          });

          if (error) throw error;
          if (data?.user?.id) {
            authUserId = data.user.id;

            // 2. Insert profile record into public.profiles
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authUserId,
                full_name: fullName,
                email: email,
                phone: phoneNumber,
                date_of_birth: dateOfBirth || null,
                gender: gender,
                preferred_stylist: preferredStylist,
                preferred_services: [],
                preferred_time: null,
                profile_picture: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`
              });

            if (profileError) {
              console.warn('[Supabase Profile Insert Error]', profileError);
              // We do not throw to block verification email display
            }
          }
        }

        // 3. Register user in the local Express server database to maintain roles & app session state
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            fullName, 
            role, 
            phoneNumber,
            avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn('Sync with localized server backend warned:', errData.error);
        }

        const newUserResponseData = await response.json();

        setFeedback({ 
          type: 'success', 
          message: isSandboxMock 
            ? 'Account Registered successfully! (Sandbox fallback mode bypassed verification email confirmation)' 
            : 'Royalty Account created! Please check your email inbox to verify your account.' 
        });

        setLoading(false);

        // For testing/mocking flow immediate usage if needed
        if (isSandboxMock) {
          setTimeout(() => {
            onSuccess({
              id: authUserId,
              email: email,
              fullName: fullName || 'Valued Glam Guest',
              role: role,
              phoneNumber: phoneNumber || undefined,
              avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`,
              createdAt: new Date().toISOString()
            });
          }, 1500);
        }

      } catch (err: any) {
        console.error('Sign Up failure:', err);
        setFeedback({ type: 'error', message: err.message || 'Failed to create your account.' });
        setLoading(false);
      }

    } else if (authMode === 'login') {
      try {
        let loggedInUser: GLUser | null = null;

        if (isSandboxMock) {
          console.info('[Supabase Mock Login Active] Local authentication search in progress.');
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          console.log('[Supabase Sign In successful]', data);
        }

        // Fetch corresponding user database entry on localized Express db as session authority
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (response.ok) {
          loggedInUser = await response.json();
        } else {
          // If not registered in local postgres yet, build a standard customer entry on the fly
          const fallbackReg = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              fullName: email.split('@')[0],
              role: 'customer',
              phoneNumber: '+2330000000'
            })
          });
          if (fallbackReg.ok) {
            loggedInUser = await fallbackReg.json();
          }
        }

        if (loggedInUser) {
          setLoading(false);
          onSuccess(loggedInUser);
        } else {
          throw new Error('Customer account registration failed on localized backend.');
        }

      } catch (err: any) {
        console.error('Sign In failure:', err);
        setFeedback({ 
          type: 'error', 
          message: err.message || 'Authenticating failed. Kindly verify your email and password.' 
        });
        setLoading(false);
      }

    } else if (authMode === 'forgot-password') {
      try {
        if (isSandboxMock) {
          setFeedback({ 
            type: 'success', 
            message: 'Sandbox simulation email recovery message initiated!' 
          });
        } else {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
          });
          if (error) throw error;
          setFeedback({ 
            type: 'success', 
            message: 'Luxury Reset instructions sent! Please examine your email inbox.' 
          });
        }
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Password reset request failed.' });
      } finally {
        setLoading(false);
      }
    }
  };

  // Google OAuth Flow
  const handleGoogleSignIn = async () => {
    const isSandboxMock = !((import.meta as any).env?.VITE_SUPABASE_URL) || ((import.meta as any).env?.VITE_SUPABASE_URL).includes('placeholder-project');
    
    if (isSandboxMock) {
      setFeedback({ 
        type: 'error', 
        message: 'Google Sign In is unavailable when Supabase environment variables are not configure. Using simulated logs instead.' 
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'OAuth error.' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-[#121212] border border-[#D4AF37]/40 rounded-3xl p-6 md:p-8 shadow-2xl relative text-white">
      {/* Golden Highlight Border */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] rounded-t-3xl"></div>
      
      {/* Salon Brand Title Headers */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex relative">
          <img 
            src={officialLogo} 
            alt="Princess Burland Salon Logo" 
            className="w-20 h-20 rounded-full object-cover border-2 border-[#D4AF37] shadow-xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] p-1.5 rounded-full border border-[#121212]">
            <Scissors className="w-3.5 h-3.5 text-black" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-widest font-serif uppercase">
            PRINCESS BURLAND
          </h2>
          <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-mono font-bold mt-1">
            Luxury Beauty Suite & Auth Gate
          </p>
        </div>
      </div>

      {/* Dynamic Tab Selector (Only if not in forgot-password tab) */}
      {authMode !== 'forgot-password' && (
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-[#D4AF37]/15 mb-6">
          <button
            onClick={() => {
              setAuthMode('login');
              setFeedback(null);
            }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 ${
              authMode === 'login'
                ? 'bg-[#D4AF37] text-black font-black shadow-lg shadow-[#D4AF37]/10'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Sleek Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setFeedback(null);
            }}
            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 ${
              authMode === 'register'
                ? 'bg-[#D4AF37] text-black font-black shadow-lg shadow-[#D4AF37]/10'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Royalty Sign Up
          </button>
        </div>
      )}

      {/* Notification Toast Stream */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/40 text-red-400 animate-shake'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="leading-relaxed">{feedback.message}</p>
        </div>
      )}

      {/* Core Auth Forms */}
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        
        {authMode === 'register' && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-mono mb-1.5 font-bold">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input 
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ama Serwaa Kojo"
                className="w-full bg-black/60 border border-[#D4AF37]/20 text-sm py-2.5 px-3.5 pl-10 text-white rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-semibold transition"
              />
              <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-mono mb-1.5 font-bold">
            Email Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="royal@pricessburland.com"
              className="w-full bg-black/60 border border-[#D4AF37]/20 text-sm py-2.5 px-3.5 pl-10 text-white rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-semibold transition"
            />
            <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {authMode === 'register' && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-mono mb-1.5 font-bold">
              MoMo Wallet (WhatsApp Number) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input 
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0244123456"
                className="w-full bg-black/60 border border-[#D4AF37]/20 text-sm py-2.5 px-3.5 pl-10 text-white rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-semibold transition font-mono"
              />
              <Phone className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {authMode !== 'forgot-password' && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-mono mb-1.5 font-bold">
                Security Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-[#D4AF37]/20 text-sm py-2.5 px-3.5 pl-10 text-white rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-semibold transition font-mono"
                />
                <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60 hover:text-[#D4AF37] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password strength indicator bar */}
              {authMode === 'register' && password && (
                <div className="mt-2 text-[10px] flex items-center justify-between font-mono">
                  <div className="flex items-center gap-1">
                    <span>STRENGTH:</span>
                    <span className="font-bold text-[#D4AF37]">{pwdStrength.label}</span>
                  </div>
                  <div className="w-24 bg-white/10 h-1.5 rounded-full overflow-hidden flex">
                    <div className={`h-full ${pwdStrength.color}`} style={{ width: `${(pwdStrength.score / 3) * 100}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-mono mb-1.5 font-bold">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/60 border border-[#D4AF37]/20 text-sm py-2.5 px-3.5 pl-10 text-white rounded-xl focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-semibold transition font-mono"
                  />
                  <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Dynamic Expandable Optional Fields Ribbon */}
        {authMode === 'register' && (
          <div className="bg-black/20 rounded-xl p-3 border border-[#D4AF37]/10">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-white/80 hover:text-white uppercase tracking-wider font-mono focus:outline-none"
            >
              <span>🎁 Optional Profile Preferences</span>
              <ChevronDown className={`w-4 h-4 text-[#D4AF37] transition duration-300 ${showOptional ? 'rotate-180' : ''}`} />
            </button>

            {showOptional && (
              <div className="mt-4 pt-4 border-t border-[#D4AF37]/10 space-y-3 animate-fade-in">
                
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#D4AF37] font-mono mb-1 font-bold">Date of Birth</label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full bg-black/60 border border-[#D4AF37]/20 text-xs py-2 px-3 pl-9 text-white rounded-lg focus:outline-none focus:border-[#D4AF37] font-semibold"
                    />
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#D4AF37] font-mono mb-1 font-bold">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Female', 'Male', 'Non-binary'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-1.5 rounded-lg text-[11px] font-semibold transition ${
                          gender === g 
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]' 
                            : 'bg-black/60 border border-[#D4AF37]/10 hover:border-white/20'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[#D4AF37] font-mono mb-1 font-bold">Preferred Master Hair Braider</label>
                  <div className="relative">
                    <select
                      value={preferredStylist}
                      onChange={(e) => setPreferredStylist(e.target.value)}
                      className="w-full bg-black/70 border border-[#D4AF37]/20 text-xs py-2 px-3 pl-9 text-white rounded-lg focus:outline-none focus:border-[#D4AF37] font-semibold appearance-none cursor-pointer"
                    >
                      <option value="Gloria Oduraa">Gloria Oduraa (Master Braid Specialist)</option>
                      <option value="Selasi Kojo">Selasi Kojo (Boho butterfly specialist)</option>
                      <option value="Adjoa Boakye">Adjoa Boakye (Geometric designs & stitch)</option>
                    </select>
                    <Award className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                    <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          id="btn-auth-submit"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-lg relative overflow-hidden transition active:scale-[98%] cursor-pointer hover:opacity-90"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Authenticating Suite Suite...</span>
            </span>
          ) : (
            <span>
              {authMode === 'login' ? 'Proceed To Luxury Suite' : authMode === 'register' ? 'Register Royalty Account' : 'Request Password Reset'}
            </span>
          )}
        </button>

      </form>

      {/* Alternative Social Logins (Google) */}
      {authMode !== 'forgot-password' && (
        <div className="mt-6 pt-5 border-t border-[#D4AF37]/10 text-center">
          <p className="text-[9px] font-mono tracking-widest uppercase text-white/50 mb-3">Or continue with luxury integrations</p>
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 bg-zinc-900 border border-[#D4AF37]/15 hover:border-[#D4AF37]/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Chrome className="w-4 h-4 text-white" />
            <span>Sign In with google</span>
          </button>
        </div>
      )}

      {/* Nav Link Helpers (Register / Login / Reset toggles) */}
      <div className="mt-6 text-center text-xs space-y-2">
        {authMode === 'login' && (
          <div className="flex justify-between items-center px-1 font-sans text-xs">
            <button
              onClick={() => setAuthMode('forgot-password')}
              className="text-[#D4AF37] hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className="text-white/60 hover:text-white hover:underline focus:outline-none font-bold"
            >
              Create Royalty Account
            </button>
          </div>
        )}

        {authMode === 'register' && (
          <p className="text-white/60">
            Already have a Princess Burland suite account?{' '}
            <button
              onClick={() => setAuthMode('login')}
              className="text-[#D4AF37] font-black hover:underline focus:outline-none"
            >
              Login Here
            </button>
          </p>
        )}

        {authMode === 'forgot-password' && (
          <p className="text-white/60">
            Remembered credentials?{' '}
            <button
              onClick={() => setAuthMode('login')}
              className="text-[#D4AF37] font-black hover:underline focus:outline-none"
            >
              Back to LogIn
            </button>
          </p>
        )}
      </div>

      {/* Demystified Sandbox Guide box */}
      <div className="mt-8 pt-6 border-t border-dashed border-[#D4AF37]/15 text-[11px] text-zinc-400 leading-relaxed text-center font-sans bg-black/30 p-4 rounded-xl">
        <p className="font-bold text-[#D4AF37] font-mono uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#D4AF37]" /> Demo Integration Alert
        </p>
        <p>No password needed for local sandbox inspection! Access matched profiles directly with your choice email:</p>
        <div className="mt-2 text-center text-[10px] font-mono grid grid-cols-1 gap-1 text-zinc-300">
          <p>Ama Serwaa: <code className="text-[#D4AF37] select-all font-bold">customer@work.com</code></p>
          <p>Admin Director: <code className="text-[#D4AF37] select-all font-bold">admin@burlandbookings.com</code></p>
          <p>Expert Braider: <code className="text-[#D4AF37] select-all font-bold">gloria@burlandbookings.com</code></p>
        </div>
      </div>
    </div>
  );
}
