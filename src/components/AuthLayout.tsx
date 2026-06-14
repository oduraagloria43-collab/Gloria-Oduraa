/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, User, Phone, Sparkles, LogIn, Lock, Scissors, Check } from 'lucide-react';
import { UserRole, User as GLUser } from '../types';
// @ts-ignore
import officialLogo from '../assets/images/princess_burland_logo_1781196879431.jpg';

interface AuthLayoutProps {
  onSuccess: (user: GLUser) => void;
}

export default function AuthLayout({ onSuccess }: AuthLayoutProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { email, fullName, role, phoneNumber } 
      : { email };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Authentication error.');
      }

      const userResult: GLUser = await response.json();
      setLoading(false);
      onSuccess(userResult);
    } catch (err: any) {
      console.error(err);
      setFeedback(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-ivory border border-blush/40 rounded-3xl p-6 md:p-8 shadow-xl relative">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold via-blush to-blush-dark"></div>
      
      {/* Brand logo top spacing */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex relative">
          <img 
            src={officialLogo} 
            alt="Princess Burland Saloon Logo" 
            className="w-16 h-16 rounded-full object-cover border-2 border-gold shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-1 -right-1 bg-gold p-1 rounded-full border border-white">
            <Scissors className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-charcoal tracking-widest uppercase">PRINCESS BURLAND BOOKINGS</h2>
          <p className="text-[9px] text-gold-dark uppercase tracking-[0.2em] font-mono mt-0.5">Luxury Beauty Suite Access</p>
        </div>
      </div>

      {feedback && (
        <div className="mb-5 bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-600 text-center animate-shake">
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name input for registration */}
        {isRegister && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gold-dark font-mono mb-1.5 font-bold">Full Name</label>
            <div className="relative">
              <input 
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ama S. Kojo"
                className="w-full bg-white border border-blush/30 text-sm py-2.5 px-3.5 pl-10 text-charcoal rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold"
              />
              <User className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Email credential inputs */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gold-dark font-mono mb-1.5 font-bold">Email Address</label>
          <div className="relative">
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@burlandbookings.com"
              className="w-full bg-white border border-blush/30 text-sm py-2.5 px-3.5 pl-10 text-charcoal rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold"
            />
            <Mail className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Phone number and role inputs for registration */}
        {isRegister && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gold-dark font-mono mb-1.5 font-bold">Phone (MoMo Wallet Number)</label>
              <div className="relative">
                <input 
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0244123456"
                  className="w-full bg-white border border-blush/30 text-sm py-2.5 px-3.5 pl-10 text-charcoal rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold font-mono"
                />
                <Phone className="w-4 h-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </>
        )}

        <button
          id="btn-submit-auth"
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-gold via-blush-dark to-blush text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-gold/10 active:scale-95 transition cursor-pointer"
        >
          {loading ? 'Authenticating...' : isRegister ? 'Register Suite Account' : 'Security LogIn'}
        </button>
      </form>

      {/* Account switch options */}
      <div className="mt-6 text-center text-xs text-charcoal/60">
        <span>{isRegister ? 'Already have a Princess Burland account?' : 'New salon customer?'} </span>
        <button
          id="auth-toggle-register-login"
          onClick={() => setIsRegister(!isRegister)}
          className="text-gold-dark font-black hover:underline focus:outline-none"
        >
          {isRegister ? 'LogIn Here' : 'Register Here'}
        </button>
      </div>

      {/* Demo prefilled guides */}
      <div className="mt-8 pt-6 border-t border-dashed border-blush/30 text-[11px] text-zinc-500 leading-relaxed text-center">
        <p className="font-bold text-zinc-700 font-mono uppercase tracking-wider mb-2">💡 Demo Credentials Hint</p>
        <p>No password needed for sandbox testing! Log in directly using email:</p>
        <div className="mt-2 text-center text-[10px] font-mono grid grid-cols-1 gap-1">
          <p>Client: <code className="text-gold-dark select-all font-bold">customer@work.com</code> (Ama Serwaa)</p>
          <p>Admin: <code className="text-gold-dark select-all font-bold">admin@burlandbookings.com</code></p>
          <p>Braider: <code className="text-gold-dark select-all font-bold">gloria@burlandbookings.com</code> (Gloria)</p>
        </div>
      </div>

    </div>
  );
}
