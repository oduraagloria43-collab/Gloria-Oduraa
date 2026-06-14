/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, User, Scissors, Star, CheckCircle, XCircle, AlertCircle, 
  Trash2, MessageSquare, Plus, RefreshCw, ChevronDown, Bell, Mail,
  Award, Gift, Sparkles, Trophy, Share2, Copy
} from 'lucide-react';
import { Booking, Review } from '../types';

interface CustomerDashboardProps {
  customerId: string;
  customerName: string;
  onChangeTab: (tab: string) => void;
}

export default function CustomerDashboard({ customerId, customerName, onChangeTab }: CustomerDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Review Modal States
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [targetBooking, setTargetBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [completedReviews, setCompletedReviews] = useState<string[]>([]); // list of bookingIds reviewed

  // Toggle Reminder parameters
  const [togglingReminders, setTogglingReminders] = useState<string | null>(null);

  // Loyalty active tier tooltip
  const [activeTierTooltip, setActiveTierTooltip] = useState<string | null>(null);

  // Appointment Share States
  const [sharingBooking, setSharingBooking] = useState<Booking | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string>('');

  const generateShareText = (bk: Booking, type: 'general' | 'twitter' | 'whatsapp' | 'facebook' | 'link') => {
    const baseUrl = window.location.origin;
    if (type === 'link') {
      return `${baseUrl}/booking?service=${encodeURIComponent(bk.serviceName)}&stylist=${encodeURIComponent(bk.stylistName)}`;
    }
    if (type === 'twitter') {
      return `Just scheduled my next master hair session at Princess Burland Saloon! Styled by ${bk.stylistName} for ${bk.serviceName} on ${bk.date}. Highly tracking crown reward points! 👑💫`;
    }
    if (type === 'whatsapp') {
      return `Hey! I've booked a luxury beauty appointment at *Princess Burland Saloon*! ✨💇‍♀️\n\n*Service:* ${bk.serviceName}\n*Expert Stylist:* ${bk.stylistName}\n*When:* ${bk.date} at ${bk.timeSlot}\n\nCheck them out and claim status perks: ${baseUrl}`;
    }
    if (type === 'facebook') {
      return `Feeling excited for my self-care session at Princess Burland Saloon! ✨ I am getting a custom ${bk.serviceName} styled by the expert ${bk.stylistName} on ${bk.date} at ${bk.timeSlot}. Let's glow! ❤️💅`;
    }
    return `I scheduled a luxury hair design session at Princess Burland Saloon! ✨👑\n\nStyle: ${bk.serviceName}\nExpert Stylist: ${bk.stylistName}\nDate: ${bk.date} at ${bk.timeSlot}\n\nJoin the Royal Burland Crown Club for priority lookbooks and premium status rewards! 💇‍♀️💖`;
  };

  const handleCopyShare = (bk: Booking, type: 'general' | 'twitter' | 'whatsapp' | 'facebook' | 'link') => {
    const text = generateShareText(bk, type);
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setShareCopied(true);
    setTimeout(() => {
      setShareCopied(false);
      setCopiedType('');
    }, 2000);
  };

  const handleToggleReminder = async (bookingId: string, type: 'sms' | 'email', currentSms: boolean, currentEmail: boolean) => {
    setTogglingReminders(`${bookingId}-${type}`);
    const nextSmsValue = type === 'sms' ? !currentSms : currentSms;
    const nextEmailValue = type === 'email' ? !currentEmail : currentEmail;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/reminders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reminderSmsEnabled: nextSmsValue,
          reminderEmailEnabled: nextEmailValue
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update reminders.');
      }

      const updated = await res.json();
      setBookings(prev => prev.map(bk => bk.id === bookingId ? updated : bk));
    } catch (err) {
      console.error(err);
      alert('Princess Burland Alert: Unable to save custom reminder configurations. Please try again.');
    } finally {
      setTogglingReminders(null);
    }
  };

  const fetchCustomerBookings = () => {
    setLoading(true);
    fetch(`/api/bookings?customerId=${customerId}`)
      .then(res => res.json())
      .then(data => {
        // Sort bookings by date descending
        const sorted = data.sort((a: Booking, b: Booking) => b.date.localeCompare(a.date));
        setBookings(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setErrorMessage('Failed to access your booking schedule records. Please test again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomerBookings();
    
    // Check which bookings have already been reviewed
    fetch('/api/reviews')
      .then(res => res.json())
      .then((data: Review[]) => {
        const reviewedIds = data
          .filter(r => r.customerId === customerId)
          .map(r => r.bookingId);
        setCompletedReviews(reviewedIds);
      })
      .catch(err => console.error(err));
  }, [customerId]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this luxurious booking? This action is irreversible.')) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!res.ok) {
        throw new Error('Server returned cancellation error.');
      }

      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );

      // Trigger automatic SMS log on cancellation
      alert('Princess Burland Alert: Your appointment was cancelled. Automatic confirmation has been logged to the Notifications outbox.');
    } catch (err) {
      console.error(err);
      alert('Failed to cancel appointment. Please retry.');
    }
  };

  const handleReviewTrigger = (booking: Booking) => {
    setTargetBooking(booking);
    setRating(5);
    setComment('');
    setIsReviewOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBooking) return;
    setSubmittingReview(true);

    const payload = {
      bookingId: targetBooking.id,
      customerId,
      customerName,
      stylistId: targetBooking.stylistId,
      stylistName: targetBooking.stylistName,
      serviceId: targetBooking.serviceId,
      serviceName: targetBooking.serviceName,
      rating,
      comment
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to record review.');

      setCompletedReviews(prev => [...prev, targetBooking.id]);
      setIsReviewOpen(false);
      setTargetBooking(null);
      setSubmittingReview(false);
      alert('Thank you for writing an elegant review! Stylist rating score average updated.');
    } catch (err) {
      console.error(err);
      alert('Failed to save review. Please try again.');
      setSubmittingReview(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-150';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-150';
      case 'rejected':
        return 'bg-neutral-100 text-neutral-500 border-neutral-200';
      default:
        // pending
        return 'bg-gold/5 text-gold border-gold/10';
    }
  };

  // Calculate Loyalty Points Dynamics
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const activeCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending' || !b.status).length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
  
  const loyaltyPoints = (completedCount * 150) + (activeCount * 100) + (cancelledCount * 20);

  // Determine Tiers & Boundaries
  let currentTier = 'Bronze Crown';
  let nextTier = 'Silver Tiara';
  let minPointsForNext = 300;
  let tierProgressPercent = 0;
  let tierBenefit = 'Access to professional calendar logs & 24h custom SMS/Email reminders.';
  let nextTierBenefit = '5% discount on custom braids steam detangling & complementary hot-oil treatment.';
  let tierColor = 'from-amber-600 to-amber-800 text-amber-100 border-amber-600/30';

  if (loyaltyPoints >= 1000) {
    currentTier = 'Diamond Crown';
    nextTier = 'MAXIMUM TIER REACHED';
    minPointsForNext = 1000;
    tierProgressPercent = 100;
    tierBenefit = '15% off all hairstyles, master Gloria priority bookings & complimentary hair treatment kit.';
    nextTierBenefit = '';
    tierColor = 'from-blue-600 via-indigo-600 to-purple-700 text-blue-50 border-indigo-500/30';
  } else if (loyaltyPoints >= 600) {
    currentTier = 'Gold Diadem';
    nextTier = 'Diamond Crown';
    minPointsForNext = 1000;
    tierProgressPercent = ((loyaltyPoints - 600) / (1000 - 600)) * 100;
    tierBenefit = '10% discount on stitch cornrows & complimentary premium champagne or wine glass.';
    nextTierBenefit = '15% off all hairstyles, master Gloria priority bookings & complimentary hair treatment kit.';
    tierColor = 'from-amber-400 via-yellow-500 to-amber-500 text-charcoal border-yellow-400/40';
  } else if (loyaltyPoints >= 300) {
    currentTier = 'Silver Tiara';
    nextTier = 'Gold Diadem';
    minPointsForNext = 600;
    tierProgressPercent = ((loyaltyPoints - 300) / (600 - 300)) * 100;
    tierBenefit = '5% discount on custom braids steam detangling & complementary hot-oil treatment.';
    nextTierBenefit = '10% discount on stitch cornrows & complimentary premium champagne or wine glass.';
    tierColor = 'from-slate-400 to-slate-600 text-slate-150 border-slate-300/30';
  } else {
    currentTier = 'Bronze Crown';
    nextTier = 'Silver Tiara';
    minPointsForNext = 300;
    tierProgressPercent = (loyaltyPoints / 300) * 100;
  }

  return (
    <div className="space-y-8">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-gold/15 p-6 rounded-xl shadow-xs animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-charcoal tracking-tight">My Appointments Suite</h2>
          <p className="text-charcoal/70 text-xs mt-1">Hello {customerName}. View your historic and upcoming appointments, or set custom reminders.</p>
        </div>
        <button
          onClick={() => onChangeTab('booking')}
          className="mt-4 md:mt-0 flex items-center bg-gold hover:bg-gold/90 text-charcoal px-4.5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[3]" /> Book New Appointment
        </button>
      </div>

      {/* Princess Burland luxury loyalty club */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white border border-gold/15 rounded-2xl overflow-hidden shadow-xs">
        {/* Left / Center: Progress details and graphic slider */}
        <div className="lg:col-span-2 p-6 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-charcoal/5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gold-dark font-bold tracking-widest uppercase bg-gold/5 px-2 py-0.5 rounded border border-gold/15">
                👑 ROYAL BURLAND CROWN CLUB
              </span>
              <h3 className="text-xl font-bold font-serif italic text-charcoal">Your Loyalty Standing</h3>
              <p className="text-xs text-charcoal/60">
                Earn premium status points for every hairstyle booked. Earn 100 points for scheduling and 150 points upon successful salon treatments.
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="p-3 bg-gradient-to-br from-gold/10 to-gold/20 rounded-full border border-gold/30">
                <Award className="w-6 h-6 text-gold" />
              </div>
            </motion.div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end text-xs font-sans">
              <div>
                <span className="text-[10px] text-charcoal/50 block font-semibold uppercase tracking-wider">Current Tier</span>
                <span className="text-base font-extrabold text-gold-dark flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-gold animate-pulse" /> {currentTier}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-charcoal/50 block font-semibold uppercase tracking-wider">Points Balance</span>
                <span className="font-mono text-base font-bold text-charcoal">
                  <span className="text-gold font-extrabold">{loyaltyPoints}</span>
                  {nextTier !== 'MAXIMUM TIER REACHED' && <span className="text-charcoal/40 text-xs"> / {minPointsForNext} pts</span>}
                </span>
              </div>
            </div>

            {/* Loyalty level progress visual bar with interactive timeline nodes */}
            <div className="relative py-8 px-4 bg-beige/15 border border-gold/5 rounded-2xl">
              <div className="relative w-full bg-beige h-3.5 rounded-full border border-gold/10 p-0.5 shadow-inner">
                
                {/* Active progress color fill with premium entry animation */}
                <motion.div 
                  className={`h-full rounded-full bg-gradient-to-r ${tierColor} relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(5, (loyaltyPoints / 1000) * 100))}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_2s_linear_infinite]" />
                </motion.div>

                {/* Interactive Milestone Nodes */}
                {[
                  { id: 'bronze', name: 'Bronze Crown', points: 0, percentage: 0, icon: '👑', perks: 'Free access to digital calendar logs, appointment re-schedulers & 24h custom SMS/Email reminders.' },
                  { id: 'silver', name: 'Silver Tiara', points: 300, percentage: 30, icon: '✨', perks: 'Complementary hot-oil scalp therapy treatment & 5% price discount on custom braids steam detangling.' },
                  { id: 'gold', name: 'Gold Diadem', points: 600, percentage: 60, icon: '🎖️', perks: 'Complimentary chilled glass of premier champagne/wine & 10% price discount on geometric/stitch cornrows.' },
                  { id: 'diamond', name: 'Diamond Crown', points: 1000, percentage: 100, icon: '💎', perks: '15% price discount on all hairstyles, chief stylist Gloria priority salon booking queues & custom aftercare kit.' }
                ].map((tierNode) => {
                  const isUnlocked = loyaltyPoints >= tierNode.points;
                  const isCurrent = (tierNode.id === 'bronze' && loyaltyPoints < 300) ||
                                    (tierNode.id === 'silver' && loyaltyPoints >= 300 && loyaltyPoints < 600) ||
                                    (tierNode.id === 'gold' && loyaltyPoints >= 600 && loyaltyPoints < 1000) ||
                                    (tierNode.id === 'diamond' && loyaltyPoints >= 1000);
                  const isTooltipActive = activeTierTooltip === tierNode.id;

                  return (
                    <div 
                      key={tierNode.id} 
                      className="absolute top-1/2" 
                      style={{ left: `${tierNode.percentage}%` }}
                    >
                      {/* Trigger circle badge button */}
                      <motion.div 
                        onMouseEnter={() => setActiveTierTooltip(tierNode.id)}
                        onMouseLeave={() => setActiveTierTooltip(null)}
                        onClick={() => setActiveTierTooltip(activeTierTooltip === tierNode.id ? null : tierNode.id)}
                        whileHover={{ scale: 1.25, zIndex: 30 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer select-none -translate-x-1/2 -translate-y-1/2 transition-all duration-300 relative z-20 ${
                          isUnlocked 
                            ? 'bg-white border-2 border-gold text-gold shadow-md' 
                            : 'bg-beige-light border border-charcoal/20 text-charcoal/40 hover:border-gold/50'
                        } ${isCurrent ? 'ring-4 ring-gold/30' : ''}`}
                      >
                        <span className="text-xs">{tierNode.icon}</span>

                        {isUnlocked && (
                          <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-bold shadow-xs">
                            ✓
                          </div>
                        )}
                      </motion.div>

                      {/* Under-the-bar visual labels */}
                      <div 
                        className="absolute left-0 -translate-x-1/2 pt-5 text-center whitespace-nowrap z-10 cursor-pointer"
                        onMouseEnter={() => setActiveTierTooltip(tierNode.id)}
                        onMouseLeave={() => setActiveTierTooltip(null)}
                        onClick={() => setActiveTierTooltip(activeTierTooltip === tierNode.id ? null : tierNode.id)}
                      >
                        <span className={`block text-[9px] font-mono leading-none tracking-tight font-bold ${
                          isUnlocked ? 'text-gold-dark' : 'text-charcoal/40'
                        } ${isCurrent ? 'underline decoration-gold text-gold font-extrabold' : ''}`}>
                          {tierNode.name}
                        </span>
                        <span className="block text-[8px] font-mono text-charcoal/50 font-medium">
                          ({tierNode.points} pts)
                        </span>
                      </div>

                      {/* Tooltip containing locked/unlocked state and perks */}
                      <AnimatePresence>
                        {isTooltipActive && (
                          <motion.div 
                            initial={{ opacity: 0, y: 12, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.92 }}
                            transition={{ type: "spring", stiffness: 380, damping: 24 }}
                            className="absolute bottom-5 left-0 -translate-x-1/2 z-40 w-52 md:w-64 bg-charcoal text-white text-left p-3.5 rounded-xl shadow-2xl border border-gold/35 pointer-events-none"
                          >
                            {/* Caret arrow */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-charcoal rotate-45 border-r border-b border-gold/30" />
                            
                            <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
                              <span className="text-sm">{tierNode.icon}</span>
                              <div>
                                <h4 className="text-xs font-bold text-gold font-serif italic leading-tight">{tierNode.name}</h4>
                                <p className="text-[8.5px] font-mono text-white/50 leading-none mt-0.5">
                                  {isUnlocked ? '✓ Achieved Active Tier' : `Locked — Requires ${tierNode.points} pts`}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-[10px] text-white/90 leading-relaxed font-sans font-medium">
                              {tierNode.perks}
                            </p>
                            <div className="text-[8px] font-mono text-gold/80 mt-1.5 italic text-right font-bold uppercase tracking-wider">
                              {loyaltyPoints >= tierNode.points ? 'Benefit Unlocked!' : `${tierNode.points - loyaltyPoints} points left`}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Perks description panel */}
            <div className="bg-beige/60 border border-gold/10 p-3.5 rounded-xl flex gap-3 items-start">
              <Gift className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="block text-[10px] font-mono text-gold-dark font-bold uppercase tracking-wider">
                  Active Tier Privileges
                </span>
                <p className="text-xs text-charcoal/85 leading-relaxed font-semibold">
                  {tierBenefit}
                </p>
                {nextTier !== 'MAXIMUM TIER REACHED' && (
                  <p className="text-[10px] text-charcoal/50 leading-relaxed italic border-t border-gold/5 pt-1.5 mt-1.5">
                    🔓 Unlock progress: <span className="font-bold text-gold-dark">{minPointsForNext - loyaltyPoints} pts</span> until <span className="font-bold text-gold-dark">{nextTier}</span> — {nextTierBenefit}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side bento-like mini tracker values card */}
        <div className="p-6 bg-beige/40 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-charcoal/50 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-gold shadow-sm" /> Tier Milestones
            </h4>
            <div className="space-y-3 pt-1">
              <div className="flex gap-2.5 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${loyaltyPoints >= 1000 ? 'bg-gold animate-ping' : 'bg-charcoal/20'}`} />
                <div className="text-[11px] font-sans">
                  <span className={`block font-extrabold ${loyaltyPoints >= 1000 ? 'text-gold-dark' : 'text-charcoal/70'}`}>Diamond (1000+ pts)</span>
                  <span className="text-charcoal/50 block leading-tight">15% discount + priority queueing with master Gloria.</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start border-t border-charcoal/5 pt-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${loyaltyPoints >= 600 && loyaltyPoints < 1000 ? 'bg-gold animate-ping' : loyaltyPoints >= 600 ? 'bg-gold' : 'bg-charcoal/20'}`} />
                <div className="text-[11px] font-sans">
                  <span className={`block font-extrabold ${loyaltyPoints >= 600 ? 'text-gold-dark' : 'text-charcoal/70'}`}>Gold (600 - 999 pts)</span>
                  <span className="text-charcoal/50 block leading-tight">10% off stitch styles + glass of champagne/wine.</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start border-t border-charcoal/5 pt-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${loyaltyPoints >= 300 && loyaltyPoints < 600 ? 'bg-gold animate-ping' : loyaltyPoints >= 300 ? 'bg-gold' : 'bg-charcoal/20'}`} />
                <div className="text-[11px] font-sans">
                  <span className={`block font-extrabold ${loyaltyPoints >= 300 ? 'text-gold-dark' : 'text-charcoal/70'}`}>Silver (300 - 599 pts)</span>
                  <span className="text-charcoal/50 block leading-tight">5% off steam treatments + complementary hot-oil.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white border border-gold/10 rounded-xl flex justify-between items-center text-center">
            <div>
              <span className="block text-[8px] font-mono text-charcoal/40 uppercase font-semibold">Active Bookings</span>
              <span className="text-sm font-bold text-charcoal">{activeCount}</span>
            </div>
            <div className="border-l border-charcoal/10 h-6" />
            <div>
              <span className="block text-[8px] font-mono text-charcoal/40 uppercase font-semibold">Hairstyles Completed</span>
              <span className="text-bold text-sm text-gold font-extrabold">{completedCount}</span>
            </div>
            <div className="border-l border-charcoal/10 h-6" />
            <div>
              <span className="block text-[8px] font-mono text-charcoal/40 uppercase font-semibold">Changes Logged</span>
              <span className="text-sm font-semibold text-charcoal/60">{cancelledCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Points History Log / Ledger */}
      <div className="bg-white border border-gold/15 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-charcoal/5 pb-4 gap-3">
          <div>
            <h3 className="text-lg font-bold font-serif italic text-charcoal flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold-dark" /> Loyalty History Ledger
            </h3>
            <p className="text-charcoal/60 text-xs mt-0.5">Timeline of royal rewards earned per custom hair service appointment transaction.</p>
          </div>
          <div className="self-start sm:self-auto bg-gold/5 text-gold-dark border border-gold/15 text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" /> Total: {loyaltyPoints} Rewards Points
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-6 text-charcoal/50 text-xs italic font-semibold font-sans">
            No active points transactions found yet. Schedule your first appointment to build up status!
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-charcoal/5 text-charcoal/50 text-[10px] uppercase tracking-wider font-mono font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Service Booked</th>
                  <th className="py-2.5 px-3">Stylist</th>
                  <th className="py-2.5 px-3">Activity Status</th>
                  <th className="py-2.5 px-3 text-right">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5 text-xs">
                {bookings.map((bk) => {
                  let pointsEarned = 0;
                  let pointsColor = "text-charcoal/40";
                  let reasonText = "No points awarded";

                  if (bk.status === 'completed') {
                    pointsEarned = 150;
                    pointsColor = "text-gold font-bold";
                    reasonText = "Style Completed Treatment";
                  } else if (bk.status === 'confirmed' || bk.status === 'pending' || !bk.status) {
                    pointsEarned = 100;
                    pointsColor = "text-gold font-bold";
                    reasonText = "Appointment Reserved";
                  } else if (bk.status === 'cancelled') {
                    pointsEarned = 20;
                    pointsColor = "text-charcoal/60 font-medium";
                    reasonText = "Cancellation Retainer Points";
                  }

                  const formattedStatus = bk.status 
                    ? bk.status.charAt(0).toUpperCase() + bk.status.slice(1)
                    : 'Pending';

                  return (
                    <tr key={`loyalty-tx-${bk.id}`} className="hover:bg-beige/30 transition">
                      <td className="py-3 px-3 font-mono font-semibold text-charcoal/80">
                        {bk.date}
                      </td>
                      <td className="py-3 px-3 font-serif italic text-sm font-bold text-charcoal">
                        {bk.serviceName}
                      </td>
                      <td className="py-3 px-3 text-charcoal/70 font-sans">
                        {bk.stylistName}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-charcoal/80 text-[11px] font-sans">
                            {reasonText}
                          </span>
                          <span className="text-[9px] text-charcoal/40 uppercase font-mono">
                            Status: {formattedStatus}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-3 text-right font-mono text-sm ${pointsColor}`}>
                        +{pointsEarned} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-charcoal/50 text-xs uppercase tracking-widest mt-4 font-mono">Syncing Schedules...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white border border-charcoal/10 rounded-xl p-6">
          <Calendar className="w-16 h-16 text-charcoal/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-charcoal font-serif italic">No Appointments Found</h3>
          <p className="text-charcoal/60 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">You have not scheduled any appointments yet on Princess Burland bookings. Explore our premier style selection menu below!</p>
          <button
            onClick={() => onChangeTab('booking')}
            className="mt-5 px-5 py-2.5 bg-charcoal hover:bg-charcoal/90 text-white rounded text-xs font-bold uppercase tracking-widest transition"
          >
            Schedule Style Right Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(bk => {
            const isCompleted = bk.status === 'completed';
            const isCancelled = bk.status === 'cancelled';
            const isRejected = bk.status === 'rejected';
            const canCancel = !isCompleted && !isCancelled && !isRejected;
            const alreadyReviewed = completedReviews.includes(bk.id);

            return (
              <div
                key={bk.id}
                id={`booking-list-item-${bk.id}`}
                className="bg-white border border-charcoal/10 rounded-xl overflow-hidden hover:border-gold/30 transition-all duration-300 flex flex-col shadow-xs"
              >
                {/* Details layout */}
                <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-3 md:space-y-0 md:flex md:items-center md:space-x-8">
                    {/* Styling Indicator banner */}
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-gold/5 text-gold rounded border border-gold/10 flex-shrink-0">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[8px] font-mono uppercase tracking-wider text-gold font-bold">Service Requested</span>
                        <h4 className="text-base font-bold font-serif italic text-charcoal mt-0.5">{bk.serviceName}</h4>
                        <p className="text-xs text-gold font-mono font-bold mt-0.5">GHS {bk.servicePrice}.00</p>
                      </div>
                    </div>

                    {/* Stylist Match */}
                    <div className="flex items-center space-x-2 border-t md:border-t-0 md:border-l border-charcoal/5 pt-2.5 md:pt-0 md:pl-8">
                      <User className="w-4 h-4 text-charcoal/40" />
                      <div>
                        <span className="block text-[8px] font-mono tracking-wider text-gold uppercase font-bold">Expert Stylist</span>
                        <span className="text-xs font-bold text-charcoal">{bk.stylistName}</span>
                      </div>
                    </div>

                    {/* Date, Time scheduled */}
                    <div className="flex items-center space-x-2 border-t md:border-t-0 md:border-l border-charcoal/5 pt-2.5 md:pt-0 md:pl-8">
                      <Calendar className="w-4 h-4 text-gold" />
                      <div>
                        <span className="block text-[8px] font-mono tracking-wider text-gold uppercase font-bold">Scheduled Slot</span>
                        <span className="text-xs font-bold text-charcoal">{bk.date} at <b className="text-gold font-mono">{bk.timeSlot}</b></span>
                      </div>
                    </div>

                    {/* Booking Type / Address display */}
                    <div className="flex items-center space-x-2 border-t md:border-t-0 md:border-l border-charcoal/5 pt-2.5 md:pt-0 md:pl-8">
                      <div className="px-2 py-1 bg-charcoal/5 text-charcoal text-[9px] font-mono tracking-wider uppercase font-bold rounded">
                        {bk.bookingType || 'Walk-In'}
                      </div>
                      {bk.bookingType === 'Home Service' && bk.homeServiceAddress && (
                        <div className="max-w-[150px]">
                          <span className="block text-[8px] font-mono tracking-wider text-charcoal/45 uppercase font-bold">Location Address</span>
                          <span className="block text-[10px] font-semibold text-charcoal/75 truncate" title={bk.homeServiceAddress}>
                            {bk.homeServiceAddress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status operations indicator */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end border-t border-charcoal/5 pt-3 md:pt-0 md:border-t-0">
                    <span className={`px-2.5 py-1 text-[10px] font-bold leading-none uppercase rounded border ${getStatusStyle(bk.status)}`}>
                      {bk.status}
                    </span>

                    {/* Share Booking Button */}
                    <button
                      id={`btn-share-bk-${bk.id}`}
                      onClick={() => setSharingBooking(bk)}
                      className="px-2.5 py-1.5 bg-white text-gold hover:bg-gold/5 border border-gold/25 rounded text-[10px] font-bold uppercase transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      title="Share reservation or post details"
                    >
                      <Share2 className="w-3.5 h-3.5 text-gold-dark" /> Share Visit
                    </button>

                    {/* Cancellations */}
                    {canCancel && (
                      <button
                        id={`btn-cancel-bk-${bk.id}`}
                        onClick={() => handleCancelBooking(bk.id)}
                        className="px-3 py-1.5 bg-white text-red-600 hover:bg-red-50 border border-red-500/10 rounded text-[10px] font-bold uppercase transition shadow-sm cursor-pointer"
                      >
                        Cancel Setup
                      </button>
                    )}

                    {/* Reviews placement after Completed appointments */}
                    {isCompleted && !alreadyReviewed && (
                      <button
                        id={`btn-review-${bk.id}`}
                        onClick={() => handleReviewTrigger(bk)}
                        className="px-3 py-1.5 bg-gold text-charcoal hover:bg-gold/90 rounded text-[10px] font-bold uppercase transition flex items-center shadow-xs cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-charcoal mr-1" /> Write Review
                      </button>
                    )}

                    {alreadyReviewed && (
                      <span className="text-[10px] text-charcoal/40 italic flex items-center font-semibold">
                        <CheckCircle className="w-3.5 h-3.5 text-gold mr-1.5" /> Reviewed & Posted
                      </span>
                    )}
                  </div>
                </div>

                {/* 24-Hour Custom SMS & Email Reminders Toggle Block */}
                {canCancel && (
                  <div className="bg-beige border-t border-charcoal/5 px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2.5">
                      <Bell className="w-4 h-4 text-gold" />
                      <div>
                        <span className="block text-[9px] font-mono tracking-widest text-gold uppercase font-bold">24-Hour Reminder Config</span>
                        <p className="text-[10px] text-charcoal/60 leading-relaxed font-semibold">Set automatic notifications 24 hours prior to appointment slot.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      {/* SMS Reminder Toggle */}
                      <label className="relative flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          disabled={togglingReminders === `${bk.id}-sms`}
                          checked={!!bk.reminderSmsEnabled}
                          onChange={() => handleToggleReminder(bk.id, 'sms', !!bk.reminderSmsEnabled, !!bk.reminderEmailEnabled)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-charcoal/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-gold relative transition"></div>
                        <div className="flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider font-mono">
                          <MessageSquare className="w-3 h-3 text-gold" />
                          <span className={bk.reminderSmsEnabled ? 'text-gold' : 'text-charcoal/50'}>SMS Alerts</span>
                        </div>
                        {togglingReminders === `${bk.id}-sms` && (
                          <div className="w-2.5 h-2.5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </label>

                      {/* Email Reminder Toggle */}
                      <label className="relative flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          disabled={togglingReminders === `${bk.id}-email`}
                          checked={!!bk.reminderEmailEnabled}
                          onChange={() => handleToggleReminder(bk.id, 'email', !!bk.reminderSmsEnabled, !!bk.reminderEmailEnabled)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-charcoal/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-gold relative transition"></div>
                        <div className="flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider font-mono">
                          <Mail className="w-3 h-3 text-gold" />
                          <span className={bk.reminderEmailEnabled ? 'text-gold' : 'text-charcoal/50'}>Email Alerts</span>
                        </div>
                        {togglingReminders === `${bk.id}-email` && (
                          <div className="w-2.5 h-2.5 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </label>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------
          FEEDBACK GOLD REVIEW PANEL MODAL
         ------------------------------------------------------------- */}
      <AnimatePresence>
        {isReviewOpen && targetBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-beige border border-gold/20 rounded-xl max-w-md w-full p-6 space-y-6 shadow-xl relative"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gold"></div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold font-serif italic text-charcoal tracking-tight">Review Your Experience</h3>
                <p className="text-charcoal/60 text-xs mt-1">Reviewing expert stylist <b>{targetBooking.stylistName}</b> for <b>{targetBooking.serviceName}</b></p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                
                {/* Star selector */}
                <div className="flex flex-col items-center">
                  <label className="text-[10px] uppercase tracking-wider text-gold font-mono font-bold mb-2">Assign Treat Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(starNum => {
                      const isFilled = hoverRating >= starNum || (hoverRating === 0 && rating >= starNum);
                      return (
                        <button
                          key={starNum}
                          id={`btn-star-${starNum}`}
                          type="button"
                          onClick={() => setRating(starNum)}
                          onMouseEnter={() => setHoverRating(starNum)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 focus:outline-none transition transform hover:scale-110 cursor-pointer"
                        >
                          <Star className={`w-8 h-8 ${isFilled ? 'fill-gold text-gold' : 'text-charcoal/20'}`} />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs text-gold font-bold font-mono mt-2 uppercase">
                    {rating === 5 ? 'Excellent 5/5' : rating === 4 ? 'Great 4/5' : rating === 3 ? 'Good 3/5' : rating === 2 ? 'Fair 2/5' : 'Poor 1/5'}
                  </span>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-charcoal/50 font-mono font-bold mb-2">Your Comments</label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell others about the custom braids density, shading precision, warm hospitality..."
                    className="w-full bg-white border border-charcoal/10 focus:border-gold text-charcoal rounded-md p-3.5 text-xs focus:outline-none min-h-[100px] shadow-sm font-sans"
                  />
                </div>

                <div className="flex space-x-2.5 pt-2">
                  <button
                    type="button"
                    disabled={submittingReview}
                    onClick={() => setIsReviewOpen(false)}
                    className="flex-1 py-2.5 bg-white hover:bg-neutral-50 text-charcoal/75 rounded text-xs font-bold uppercase border border-charcoal/10 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-luxury-review"
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 py-2.5 bg-gold text-charcoal font-bold text-xs uppercase tracking-wider rounded hover:bg-gold/90 transition flex items-center justify-center disabled:opacity-50 cursor-pointer"
                  >
                    {submittingReview ? 'Saving Review...' : 'Publish Feedback'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          LUXURY SHARE VISIT / SOCIAL TEMPLATE MODAL
         ------------------------------------------------------------- */}
      <AnimatePresence>
        {sharingBooking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div 
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-beige border border-gold/20 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold via-gold-dark to-gold"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono text-gold-dark font-bold tracking-widest uppercase bg-gold/5 px-2.5 py-1 rounded border border-gold/15">
                    ✨ ROYAL INVITE & SOCIALS
                  </span>
                  <h3 className="text-xl font-bold font-serif italic text-charcoal mt-1.5 leading-tight">
                    Share Your Upcoming Style Session
                  </h3>
                  <p className="text-charcoal/60 text-xs mt-0.5">
                    Let your loved ones track your crown styling or inspire them with custom templates.
                  </p>
                </div>
                <button 
                  onClick={() => setSharingBooking(null)}
                  className="text-charcoal/40 hover:text-charcoal p-1 rounded-full hover:bg-charcoal/5 transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                
                {/* Service info summary */}
                <div className="bg-white border border-gold/10 p-4 rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <h4 className="text-sm font-bold font-serif italic text-charcoal">{sharingBooking.serviceName}</h4>
                    <p className="text-[10px] text-charcoal/60 mt-0.5">
                      with expert stylist <span className="font-semibold text-charcoal">{sharingBooking.stylistName}</span>
                    </p>
                    <p className="text-[10px] text-gold font-mono font-bold mt-1">
                      {sharingBooking.date} at {sharingBooking.timeSlot}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase bg-gold/10 text-gold-dark px-2 py-0.5 rounded font-bold">
                      GHS {sharingBooking.servicePrice}
                    </span>
                  </div>
                </div>

                {/* Share templates & quick actions */}
                <div className="space-y-3.5">
                  {[
                    {
                      id: 'general',
                      label: 'Generic Summary Post',
                      icon: '📝',
                      desc: 'Fully formatted session text with tags.'
                    },
                    {
                      id: 'whatsapp',
                      label: 'WhatsApp Status / MSG',
                      icon: '💬',
                      desc: 'Rich text summary using markdown asterisks (*).'
                    },
                    {
                      id: 'twitter',
                      label: 'Twitter / X Post Template',
                      icon: '🐦',
                      desc: 'Compact catchy teaser with crown emojis.'
                    },
                    {
                      id: 'facebook',
                      label: 'Facebook Status Quote',
                      icon: '👥',
                      desc: 'Warm and friendly self-care quote style.'
                    },
                    {
                      id: 'link',
                      label: 'Direct Look-up Style Link',
                      icon: '🔗',
                      desc: 'Direct website routing link to this specific design catalog.'
                    },
                  ].map((item) => {
                    const isCopied = shareCopied && copiedType === item.id;
                    const textForPreview = generateShareText(sharingBooking, item.id as any);

                    return (
                      <div 
                        key={item.id}
                        className="bg-white/80 border border-charcoal/5 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-gold/25 hover:bg-white transition"
                      >
                        <div className="space-y-1 max-w-[70%] text-left">
                          <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                            <span>{item.icon}</span> {item.label}
                          </span>
                          <p className="text-[10px] text-charcoal/50 leading-tight">
                            {item.desc}
                          </p>
                          <p className="text-[10px] font-mono text-charcoal/70 bg-beige/35 p-1.5 rounded border border-charcoal/5 leading-normal max-h-16 overflow-y-auto whitespace-pre-wrap mt-1">
                            {textForPreview}
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleCopyShare(sharingBooking, item.id as any)}
                          className={`px-3 py-2 rounded text-[10px] uppercase tracking-wider font-bold transition flex items-center justify-center gap-1.5 shadow-xs w-full md:w-auto ${
                            isCopied 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-charcoal hover:bg-charcoal/90 text-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Template
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>

              <div className="border-t border-charcoal/5 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSharingBooking(null)}
                  className="px-5 py-2 bg-charcoal text-white hover:bg-charcoal/90 text-xs font-bold uppercase tracking-widest rounded transition cursor-pointer"
                >
                  Close Sharing Studio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
