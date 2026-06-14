/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scissors, Shield, Sparkles, User, RefreshCw, MessageSquare, Clipboard, Star, MapPin } from 'lucide-react';
import { UserRole, User as GLUser } from '../types';
// @ts-ignore
import officialLogo from '../assets/images/princess_burland_logo_1781196879431.jpg';

interface NavbarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
  currentUser: GLUser | null;
  onDisconnect?: () => void;
}

export default function Navbar({ currentRole, onChangeRole, currentTab, onChangeTab, currentUser, onDisconnect }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-blush-dark border-b border-blush shadow-sm text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Header */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onChangeTab('home')}>
            <div className="relative group">
              <img 
                src={officialLogo} 
                alt="Princess Burland Saloon Official Logo"
                className="w-[52px] h-[52px] rounded-full object-cover border-2 border-gold shadow-md group-hover:scale-105 transition-transform duration-200"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-0.5 -right-0.5 bg-gold p-0.5 rounded-full border border-white group-hover:rotate-12 transition-transform duration-200">
                <Scissors className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white text-base md:text-lg font-serif italic tracking-widest uppercase font-bold leading-none">Princess Burland</h1>
              <div className="text-gold text-[9px] tracking-[0.2em] uppercase mt-1 font-mono font-bold">Saloon</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-3 h-full">
            {(() => {
              const items = [
                { id: 'home', label: 'Home', icon: Sparkles },
                { id: 'services', label: 'Services', icon: Scissors },
                { id: 'booking', label: 'Book Appointment', icon: Clipboard },
                { id: 'my-appointments', label: 'My Appointments', icon: User },
                { id: 'reviews', label: 'Client Reviews', icon: Star },
                { id: 'contact', label: 'Contact & Location', icon: MapPin },
              ];
              if (!currentUser) {
                items.push({ id: 'auth', label: 'Join Suite', icon: Sparkles });
              }
              return items;
            })().map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onChangeTab(tab.id)}
                  className={`flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 h-full ${
                    isActive
                      ? 'border-gold text-white bg-white/10 font-bold'
                      : 'border-transparent text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5 text-gold" />
                  {tab.label}
                </button>
              );
            })}

            {/* Quick Link to Admin Panel if User is Admin */}
            {currentRole === 'admin' && (
              <button
                id="nav-tab-admin"
                onClick={() => onChangeTab('admin')}
                className={`flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border border-white/20 rounded ${
                  currentTab === 'admin'
                    ? 'bg-gold text-white font-bold'
                    : 'text-white bg-white/10 hover:bg-white/20'
                }`}
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Admin Panel
              </button>
            )}


          </nav>

          {/* Interactive Role Switching controls for testing demo */}
          <div className="flex items-center space-x-3">
            
            {/* Simulation Header for iframe testing */}
            <div className="flex items-center space-x-2 bg-black/20 px-3 py-1 rounded border border-white/10">
              <RefreshCw className="w-3 h-3 text-gold animate-spin-slow" />
              <div className="text-left font-sans">
                <span className="block text-[8px] uppercase tracking-wider text-white/50 font-mono">Role Simulator</span>
                <select
                  id="navbar-role-simulator"
                  value={currentRole}
                  onChange={(e) => {
                    const nextRole = e.target.value as UserRole;
                    onChangeRole(nextRole);
                    if (nextRole === 'admin') onChangeTab('admin');
                    else onChangeTab('booking');
                  }}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer p-0 m-0 border-0"
                >
                  <option value="customer" className="bg-blush-dark text-white">Client Mode</option>
                  <option value="admin" className="bg-blush-dark text-white">Director Admin</option>
                </select>
              </div>
            </div>

            {/* Profile Avatar / Quick Info */}
            <div className="flex items-center space-x-2">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                alt={currentUser?.fullName || 'Glamour Guest'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-white/30"
              />
              <div className="hidden lg:block text-left">
                <p className="text-[11px] font-bold text-white line-clamp-1 leading-none">{currentUser?.fullName || 'Glamour Guest'}</p>
                <p className="text-[8px] text-white/80 font-mono uppercase tracking-widest mt-1">Role: {currentRole}</p>
              </div>
              {currentUser && onDisconnect && (
                <button
                  id="btn-navbar-sign-out"
                  onClick={onDisconnect}
                  className="bg-black/30 border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-lg transition duration-200 cursor-pointer ml-1"
                >
                  Sign Out
                </button>
              )}
            </div>
            
          </div>

        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex space-x-1 justify-around py-2 bg-blush border-t border-blush-dark px-2 overflow-x-auto">
        {(() => {
          const items = [
            { id: 'home', label: 'Home', icon: Sparkles },
            { id: 'services', label: 'Services', icon: Scissors },
            { id: 'booking', label: 'Book', icon: Clipboard },
            { id: 'my-appointments', label: 'Schedules', icon: User },
            { id: 'contact', label: 'Contact', icon: MapPin },
          ];
          if (!currentUser) {
            items.push({ id: 'auth', label: 'Join Suite', icon: Sparkles });
          }
          return items;
        })().map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3.5 rounded-lg text-[10px] font-semibold transition-all ${
                isActive ? 'text-white bg-white/20 font-bold' : 'text-blush-light hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {tab.label}
            </button>
          );
        })}
        {currentRole === 'admin' && (
          <button
            onClick={() => onChangeTab('admin')}
            className={`flex flex-col items-center py-1 px-3.5 rounded-lg text-[10px] font-semibold transition-all ${
              currentTab === 'admin' ? 'text-white bg-white/20 font-bold' : 'text-blush-light'
            }`}
          >
            <Shield className="w-4 h-4 mb-0.5" />
            Admin
          </button>
        )}

      </div>
    </header>
  );
}
