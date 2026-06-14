/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Scissors, Compass, Star, ChevronRight, ChevronLeft, Phone, MessageSquare, Clipboard, 
  MapPin, Clock, Calendar, Check, ExternalLink, Bookmark, HelpCircle, Heart, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Service, Stylist, Booking, Review, UserRole } from './types';
import Navbar from './components/Navbar';
import BookingWizard from './components/BookingWizard';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthLayout from './components/AuthLayout';
import AdvertCarousel from './components/AdvertCarousel';
import FAQSection from './components/FAQSection';
import ContactPage from './components/ContactPage';
import HairstyleGallery from './components/HairstyleGallery';

const CAROUSEL_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1640552327092-be224ca4293f?auto=format&fit=crop&q=80&w=1200',
    tag: 'PRINCESS BURLAND SIGNATURE',
    title: 'Exquisite African Braids',
    accentTitle: 'Queen Crown Artistry',
    description: 'Bespoke master braids, lightweight knotless styles, detailed feed-ins, and luxury twists crafted perfectly by Principal Braid Expert Gloria Oduraa.'
  },
  {
    image: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=1200',
    tag: 'KNOTLESS & BOHEMIAN SPECIALTY',
    title: 'Premium Painless Knotless',
    accentTitle: 'Graceful Protective Curls',
    description: 'Zero-tension root parting meets gorgeous bohemian curly cascades. Experience lightweight, high-durability braiding styled specifically to preserve your hairline.'
  },
  {
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200',
    tag: 'SENEGALESE TWISTS & LOCS',
    title: 'Elite Rope Twists & Locs',
    accentTitle: 'Royal Glow Protective Crowns',
    description: 'Masterfully spun Senegalese twists, gorgeous butterfly locs, and distressed textures crafted only with silky-soft, itch-free organic fibers.'
  },
  {
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
    tag: 'SCALP DETOX & MAINTENANCE',
    title: 'Restorative Steam Wash',
    accentTitle: 'Braids Hydration Care',
    description: 'Deep organic scalp wash, steam treatment, and perimeter touch-ups that refresh your hairlines without having to unbraid your beautiful protective crown.'
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [user, setUser] = useState<User | null>(null);
  
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Carousel auto-cycling setup
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlide]);
  
  // Data lists populated from server
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [stylistsList, setStylistsList] = useState<Stylist[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [triggerSync, setTriggerSync] = useState<number>(0);

  // Filter states for Services catalog
  const [servicesCategoryFilter, setServicesCategoryFilter] = useState<string>('all');
  const [servicesSearchQuery, setServicesSearchQuery] = useState<string>('');

  // Sync user state on boot
  useEffect(() => {
    // Check local storage for persistent session first
    const saved = localStorage.getItem('princess_burland_user');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && data.email) {
          setUser(data);
          setCurrentRole(data.role);
          return;
        }
      } catch (e) {
        console.warn('Error reading princess_burland_user from localStorage', e);
      }
    }
    
    // Otherwise, do not auto-login to let new users sign up/sign in.
    setUser(null);
  }, []);

  // Fetch Services, Stylists, and Reviews data lists
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServicesList(data))
      .catch(err => console.error(err));

    fetch('/api/stylists')
      .then(res => res.json())
      .then(data => setStylistsList(data))
      .catch(err => console.error(err));

    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => setReviewsList(data.sort((a: Review, b: Review) => b.createdAt.localeCompare(a.createdAt))))
      .catch(err => console.error(err));
  }, [triggerSync, currentTab]);

  const handleRoleChange = (selectedRole: UserRole) => {
    setCurrentRole(selectedRole);
    // Find first user with that role in database or log out current
    fetch('/api/auth/users')
      .then(res => res.json())
      .then((users: User[]) => {
        const matchingUser = users.find(u => u.role === selectedRole);
        if (matchingUser) {
          setUser(matchingUser);
          localStorage.setItem('princess_burland_user', JSON.stringify(matchingUser));
        } else {
          // Fallback mockup registered user
          const mockEmail = selectedRole === 'admin' ? 'admin@burlandbookings.com' : `${selectedRole}@work.com`;
          fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: mockEmail })
          })
            .then(res => res.json())
            .then(u => {
              setUser(u);
              localStorage.setItem('princess_burland_user', JSON.stringify(u));
            })
            .catch(err => console.error(err));
        }
      });
  };

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentRole(authenticatedUser.role);
    localStorage.setItem('princess_burland_user', JSON.stringify(authenticatedUser));
    if (authenticatedUser.role === 'admin') {
      setCurrentTab('admin');
    } else if (authenticatedUser.role === 'stylist') {
      setCurrentTab('stylist');
    } else {
      setCurrentTab('booking');
    }
    setTriggerSync(prev => prev + 1);
  };

  const handleDisconnect = () => {
    setUser(null);
    localStorage.removeItem('princess_burland_user');
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen bg-beige text-charcoal flex flex-col justify-between selection:bg-gold selection:text-white">
      
      {/* 1. ELEGANT GOLD GLASS NAVBAR */}
      <Navbar 
        currentRole={currentRole}
        onChangeRole={handleRoleChange}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        currentUser={user}
        onDisconnect={handleDisconnect}
      />

      {/* 2. CORE LAYOUT ROUTES */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HOMEPAGE VIEW */}
        {currentTab === 'home' && (
          <div className="space-y-12 animate-fade-in">
            
            {/* HERO COMPONENT WITH STYLISH ANIMATED CAROUSEL */}
            <div className="relative rounded-2xl overflow-hidden border border-gold/15 bg-charcoal shadow-xl h-[470px] md:h-[500px]">
              
              {/* Background Images with AnimatePresence */}
              <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="absolute inset-0 bg-cover bg-center brightness-[0.24] saturate-[0.88]"
                    style={{ backgroundImage: `url(${CAROUSEL_SLIDES[activeSlide].image})` }}
                  />
                </AnimatePresence>
                {/* Clean soft gradient overlay for readability and gorgeous lighting */}
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-transparent pointer-events-none" />
              </div>

              {/* Slidable/fading text content and buttons */}
              <div className="relative z-10 px-6 py-12 md:p-14 max-w-3xl flex flex-col justify-between h-full select-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-4 md:space-y-5"
                  >
                    <span className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/25 text-gold px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase font-mono">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping"></span>
                      <span>{CAROUSEL_SLIDES[activeSlide].tag}</span>
                    </span>
                    
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif italic text-white leading-tight tracking-tight">
                      {CAROUSEL_SLIDES[activeSlide].title} <br/>
                      <span className="text-gold">{CAROUSEL_SLIDES[activeSlide].accentTitle}</span>
                    </h1>
                    
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans">
                      {CAROUSEL_SLIDES[activeSlide].description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setCurrentTab('booking')}
                    className="px-6 py-3 bg-gold hover:bg-gold/90 text-white font-bold text-xs uppercase tracking-wider rounded transition duration-200 shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Schedule Luxury Appointment
                  </button>
                  <button 
                    onClick={() => setCurrentTab('services')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded text-xs font-bold uppercase tracking-wider transition text-center"
                  >
                    Explore Service Menu
                  </button>
                </div>
              </div>

              {/* Carousel Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide(prev => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-gold hover:scale-105 text-white border border-white/10 transition cursor-pointer flex items-center justify-center"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-gold hover:scale-105 text-white border border-white/10 transition cursor-pointer flex items-center justify-center"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Minimal floating stats block */}
              <div className="absolute right-6 bottom-6 hidden lg:flex space-x-4 bg-black/50 backdrop-blur-md p-3.5 rounded border border-white/10 z-10 text-white">
                <div>
                  <span className="text-[8px] text-white/50 tracking-wider uppercase font-mono">SPECIALISTS</span>
                  <p className="text-[11px] font-bold mt-0.5">4 Verified Stylists</p>
                </div>
                <div className="border-l border-white/15 pl-4">
                  <span className="text-[8px] text-white/50 tracking-wider uppercase font-mono">SATISFACTION</span>
                  <p className="text-[11px] font-bold text-gold mt-0.5">★ 4.9 Score</p>
                </div>
              </div>

              {/* Carousel Dots Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2 select-none">
                {CAROUSEL_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className="group relative focus:outline-none"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeSlide ? 'w-6 bg-gold' : 'w-2 bg-white/40 hover:bg-white/60'
                    }`} />
                  </button>
                ))}
              </div>

              {/* Autoplay Active Slide Growing Timer Bar */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-20">
                <motion.div
                  key={activeSlide}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                  className="h-full bg-gold"
                />
              </div>

            </div>

            {/* SIGNATURE LOOKBOOK EXHIBIT / HAIRSTYLE PLACEMENT */}
            <HairstyleGallery onBookNow={() => setCurrentTab('booking')} />

            {/* QUICK FEATURE ITEMS WITH BENEFITS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Zero Calendar Clash', text: 'Live relational timing grids verify therapist vacancy states dynamically prior to checkout, preventing double-bookings.', icon: Calendar },
                { title: 'Secured MoMo Systems', text: 'Integrated simulator for MTN Mobile Money, Telecel, AirtelTigo, and VISA payments with receipt printing.', icon: Scissors },
                { title: 'SMS Transaction Logs', text: 'Simulated Twilio carrier outbox alerts sent immediately to client and stylist phones upon scheduling confirmations.', icon: MessageSquare }
              ].map((obj, i) => {
                const Icon = obj.icon;
                return (
                  <div key={i} className="p-5 bg-white border border-charcoal/5 rounded shadow-sm hover:border-gold/20 transition duration-200 space-y-3">
                    <div className="p-2.5 bg-gold/5 text-gold border border-gold/10 rounded w-fit">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-charcoal font-serif italic">{obj.title}</h3>
                    <p className="text-charcoal/70 text-xs leading-relaxed">{obj.text}</p>
                  </div>
                );
              })}
            </div>

            {/* HAND-CRAFTED PROMOTIONAL ADVERT CAROUSEL */}
            <div className="py-2">
              <div className="text-center mb-6">
                <span className="text-blush-dark text-xs font-mono font-bold tracking-widest uppercase bg-blush-light px-2.5 py-1 rounded border border-blush/30">HOT TRENDING PROMOTIONS & DEALS</span>
                <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-2">Princess Burland Premium Flash Deals</h2>
                <p className="text-charcoal/70 text-xs mt-2 max-w-xl mx-auto font-sans">
                  Browse our seasonal luxury bundles, copy a secret promotion key, and claim automatic benefits during your checkout scheduling.
                </p>
              </div>
              <AdvertCarousel 
                onBookNow={() => setCurrentTab('booking')}
                onApplyPromo={(code) => {
                  console.log("Promo applied:", code);
                  // We can log or store this in state if needed or show a quick notice
                }}
              />
            </div>

            {/* HOW IT WORKS SEGMENT */}
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-gold text-xs font-mono font-bold tracking-widest uppercase">THE PRINCESS BURLAND PROCESS</span>
                <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-1">How To Secure Your Appointment</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { num: '01', title: 'Choose Treatment', desc: 'Filter our premium catalog of cuts, custom braids, extensions, gels, or skin restoration.' },
                  { num: '02', title: 'Match Expert Therapist', desc: 'Explore specialized bios and rating averages to handcheck your matched stylist.' },
                  { num: '03', title: 'Assign Time Slot', desc: 'Secure an open timing. Double-booking conflict triggers are dynamically blocked.' },
                  { num: '04', title: 'Secured Momo Check', desc: 'Submit wallet authorization or card details, and print your formal receipt.' }
                ].map((s, i) => (
                  <div key={i} className="p-5 bg-white border border-charcoal/5 rounded relative overflow-hidden group hover:border-gold/30 transition duration-200">
                    <span className="text-3xl font-serif font-bold text-gold/10 group-hover:text-gold/20 absolute right-4 top-4 transition-colors">
                      {s.num}
                    </span>
                    <h4 className="font-bold text-charcoal text-sm mt-1">{s.title}</h4>
                    <p className="text-charcoal/60 text-xs mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SUITE ADDRESS & SPA HOURS DETAILS */}
            <div className="bg-blush-light rounded-xl border border-blush/35 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-charcoal shadow-sm">
              <div className="space-y-3">
                <h3 className="text-lg font-bold font-serif italic text-gold-dark tracking-tight">Visit Princess Burland Accra Suite</h3>
                <div className="space-y-2 text-xs text-charcoal/80">
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 text-gold-dark mr-2.5 flex-shrink-0" />
                    Nyamekye, Lapaz, Suite 204, Accra, Ghana
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 text-gold-dark mr-2.5 flex-shrink-0" />
                    +233 (0) 54 888 7777 / +233 (0) 55 123 4567
                  </p>
                  <p className="flex items-center">
                    <Clock className="w-4 h-4 text-gold-dark mr-2.5 flex-shrink-0" />
                    Salon Hours: Mon - Sat: 9:00 AM - 8:00 PM | Sun: Closed
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setCurrentTab('booking')}
                className="px-5 py-3 bg-gold hover:bg-gold-dark border border-gold-dark/20 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Launch Booking Wizard
              </button>
            </div>

            {/* COLLAPSIBLE FAQ ACCORDION SECTION */}
            <FAQSection />

          </div>
        )}

        {/* SERVICES CATALOGUE VIEW */}
        {currentTab === 'services' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <span className="text-gold text-xs font-mono font-bold tracking-widest uppercase">CATALOGUE MENU</span>
              <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-1">Luxurious Service Selections</h2>
              <p className="text-charcoal/70 text-xs mt-2.5 max-w-2xl mx-auto leading-relaxed font-sans">Browse our treatment menu. Premium natural hair conditioners, imported gels, and bridal contouring items are included inside prices.</p>
            </div>

            {(() => {
              const getsServiceCategoryGroup = (srv: Service) => {
                const name = (srv.name || '').toLowerCase();
                if (name.includes('twist') || name.includes('locs')) {
                  return 'twists-locs';
                }
                if (name.includes('detox') || name.includes('treatment') || name.includes('wash') || name.includes('touch') || name.includes('refresh') || name.includes('edge')) {
                  return 'treatments';
                }
                return 'braids';
              };

              const countAll = servicesList.length;
              const countBraids = servicesList.filter(s => getsServiceCategoryGroup(s) === 'braids').length;
              const countTwistsLocs = servicesList.filter(s => getsServiceCategoryGroup(s) === 'twists-locs').length;
              const countTreatments = servicesList.filter(s => getsServiceCategoryGroup(s) === 'treatments').length;

              const filtered = servicesList.filter(srv => {
                const query = servicesSearchQuery.toLowerCase().trim();
                if (query) {
                  const matchName = srv.name.toLowerCase().includes(query);
                  const matchDesc = srv.description.toLowerCase().includes(query);
                  const matchCat = srv.category.toLowerCase().includes(query);
                  if (!matchName && !matchDesc && !matchCat) return false;
                }
                
                if (servicesCategoryFilter === 'all') return true;
                return getsServiceCategoryGroup(srv) === servicesCategoryFilter;
              });

              return (
                <div className="space-y-6">
                  {/* SEARCH & FILTER CONTROLS BAR */}
                  <div className="bg-white border border-charcoal/5 rounded-2xl p-4 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                      
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
                        <input 
                           type="text"
                          value={servicesSearchQuery}
                          onChange={(e) => setServicesSearchQuery(e.target.value)}
                          placeholder="Search knotless, goddess braids, stitch, rope twists..."
                          className="w-full bg-beige border border-charcoal/10 rounded-xl py-2.5 pl-9 pr-8 text-xs text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-sans font-medium"
                        />
                        {servicesSearchQuery && (
                          <button 
                            onClick={() => setServicesSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-charcoal/40 hover:text-charcoal"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Summary indicator count */}
                      <div className="text-[10px] font-mono text-charcoal/50 flex items-center justify-between md:justify-end gap-2 px-1">
                        <span>MATCHED MENUS:</span>
                        <span className="font-bold text-gold-dark bg-gold-light px-2 py-0.5 rounded border border-gold/15">
                          {filtered.length} of {servicesList.length} protective styles
                        </span>
                      </div>
                    </div>

                    {/* Category Tabs Ribbon */}
                    <div className="border-t border-charcoal/5 pt-3">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        
                        {[
                          { id: 'all', label: 'All Protective Styles', count: countAll, icon: '✨' },
                          { id: 'braids', label: 'Classic Braids & Stitch', count: countBraids, icon: '👑' },
                          { id: 'twists-locs', label: 'Elite Twists & Locs', count: countTwistsLocs, icon: '💫' },
                          { id: 'treatments', label: 'Wash, Scalp & Touch-Up', count: countTreatments, icon: '🧴' },
                        ].map(tab => {
                          const isActive = servicesCategoryFilter === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setServicesCategoryFilter(tab.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold transition whitespace-nowrap cursor-pointer active:scale-95 ${
                                isActive 
                                  ? 'bg-gold text-white border border-gold shadow-sm font-bold' 
                                  : 'bg-beige hover:bg-gold-light/30 border border-charcoal/10 text-charcoal/80'
                              }`}
                            >
                              <span>{tab.icon}</span>
                              <span>{tab.label}</span>
                              <span className={`text-[9px] px-1.5 py-0.1 rounded-full font-mono ${
                                isActive ? 'bg-white/20 text-white' : 'bg-charcoal/5 text-charcoal/60'
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          );
                        })}

                      </div>
                    </div>
                  </div>

                  {/* SERVICES LIST GRID */}
                  {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filtered.map(srv => {
                        const sGroup = getsServiceCategoryGroup(srv);
                        const isBraid = sGroup === 'braids';
                        const isTwistLocs = sGroup === 'twists-locs';
                        const isTreatment = sGroup === 'treatments';
                        
                        return (
                          <div 
                            key={srv.id} 
                            className="bg-white border border-charcoal/5 rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-md duration-300 transition flex flex-col justify-between"
                          >
                            <div className="relative h-44 overflow-hidden group">
                              <img 
                                src={srv.imageUrl} alt={srv.name} referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                              />
                              <div className="absolute top-3 left-3 bg-charcoal/90 text-gold font-mono text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-lg uppercase border border-gold/15 shadow-sm">
                                {srv.category}
                              </div>
                              <div className="absolute bottom-3 right-3 bg-gold text-white font-sans text-xs font-bold px-3 py-1 rounded-full shadow-md border border-gold-dark/20">
                                GHS {srv.price}
                              </div>

                              {/* Categorized Ribbon overlay */}
                              <div className="absolute top-3 right-3 flex gap-1">
                                {isBraid && (
                                  <span className="text-[9px] font-mono bg-amber-500/95 text-white px-2 py-0.5 rounded-lg font-bold">👑 Braids</span>
                                )}
                                {isTwistLocs && (
                                  <span className="text-[9px] font-mono bg-rose-500/95 text-white px-2 py-0.5 rounded-lg font-bold">💫 Twists & Locs</span>
                                )}
                                {isTreatment && (
                                  <span className="text-[9px] font-mono bg-emerald-500/95 text-white px-2 py-0.5 rounded-lg font-bold">🌿 Scalp Care</span>
                                )}
                              </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <h3 className="text-base font-bold font-serif italic text-charcoal">{srv.name}</h3>
                                <p className="text-charcoal/70 text-xs mt-1.5 leading-relaxed line-clamp-3 font-sans">
                                  {srv.description}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-charcoal/5 flex justify-between items-center text-xs">
                                <span className="text-charcoal/50 font-mono text-[11px] flex items-center font-semibold">
                                  <Clock className="w-3.5 h-3.5 text-gold mr-1" /> {srv.duration} Mins
                                </span>
                                <button 
                                  onClick={() => setCurrentTab('booking')}
                                  className="text-gold hover:text-gold-dark font-sans font-bold uppercase tracking-wider text-[10px] flex items-center cursor-pointer transition-colors"
                                >
                                  Book Selected <ChevronRight className="w-3 h-3 ml-0.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* EMPTY RESULTS VIEW */
                    <div className="p-12 text-center bg-white border border-charcoal/5 rounded-3xl space-y-4 max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-full bg-gold-light text-gold text-sm font-serif italic flex items-center justify-center mx-auto border border-gold/15">
                        🔍
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold font-serif italic text-charcoal">No Services Found</h4>
                        <p className="text-[11px] text-charcoal/60 leading-relaxed font-sans">
                          We couldn't trace any services matching search query <b>"{servicesSearchQuery}"</b> under category <b>"{servicesCategoryFilter}"</b>.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setServicesSearchQuery('');
                          setServicesCategoryFilter('all');
                        }}
                        className="px-4 py-2 bg-gold hover:bg-gold-dark text-white text-[10px] uppercase font-bold tracking-wider rounded-xl transition cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* BOOKING WIZARD VIEW */}
        {currentTab === 'booking' && (
          <div className="space-y-8 animate-fade-in">
            <BookingWizard 
              customerId={user?.id || 'guest'}
              customerName={user?.fullName || ''}
              customerPhone={user?.phoneNumber || ''}
              customerEmail={user?.email || ''}
              onSuccess={() => setTriggerSync(prev => prev + 1)}
            />
          </div>
        )}

        {/* MY APPOINTMENTS VIEW */}
        {currentTab === 'my-appointments' && (
          <div className="space-y-8 animate-fade-in">
            {user ? (
              <CustomerDashboard 
                customerId={user.id}
                customerName={user.fullName}
                currentUser={user}
                onUpdateUser={(updated: any) => {
                  setUser(updated);
                  localStorage.setItem('princess_burland_user', JSON.stringify(updated));
                }}
                onChangeTab={setCurrentTab}
              />
            ) : (
              <div className="space-y-4 max-w-md mx-auto px-4 py-8 bg-white border border-charcoal/5 rounded shadow-sm">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold font-serif italic text-charcoal">Authenticate to View Appointments</h2>
                  <p className="text-xs text-charcoal/60">Enter email to view your customer appointment history.</p>
                </div>
                <AuthLayout onSuccess={handleLoginSuccess} />
              </div>
            )}
          </div>
        )}

        {/* REVIEWS GRID STREAM LISTING */}
        {currentTab === 'reviews' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <span className="text-gold text-xs font-mono font-bold tracking-widest uppercase">CLIENT FEEDBACK PORTAL</span>
              <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-1">Accra Beauties Verified Reviews</h2>
              <p className="text-charcoal/70 text-xs mt-2.5 max-w-xl mx-auto leading-relaxed">See honest ratings left by our valued salon client base. All reviews are logged securely directly from transaction booking IDs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsList.map(rev => (
                <div key={rev.id} className="p-5 bg-white border border-charcoal/5 rounded shadow-sm space-y-3 hover:border-gold/25 transition duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold font-serif italic text-charcoal text-base leading-none">{rev.customerName}</h4>
                      <p className="text-[10px] text-charcoal/50 mt-1">Treatment: <b className="text-gold font-mono">{rev.serviceName}</b> by {rev.stylistName}</p>
                    </div>
                    
                    <div className="flex space-x-0.5 text-gold">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-gold text-gold' : 'text-charcoal/10'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-charcoal/80 text-xs italic leading-relaxed bg-beige p-3 rounded border border-charcoal/5 file:font-sans">
                    "{rev.comment}"
                  </p>

                  <div className="text-[9px] text-charcoal/40 font-mono flex items-center justify-between">
                    <span>TRANSACTION VERIFIED</span>
                    <span>{new Date(rev.createdAt).toISOString().split('T')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT PAGE VIEW */}
        {currentTab === 'contact' && (
          <ContactPage />
        )}

        {/* SECURE SUITE SIGN-UP / AUTHENTICATION GATE */}
        {currentTab === 'auth' && (
          <div className="space-y-8 animate-fade-in py-6">
            <AuthLayout onSuccess={handleLoginSuccess} />
          </div>
        )}



        {/* ADMIN EXECUTIVE BOARD VIEW */}
        {currentTab === 'admin' && (
          <div className="space-y-8 animate-fade-in">
            {user && currentRole === 'admin' ? (
              <AdminDashboard />
            ) : (
              <div className="space-y-4 max-w-md mx-auto px-4 py-8 bg-white border border-charcoal/5 rounded shadow-sm">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold font-serif italic text-charcoal">Admin Director Console Access</h2>
                  <p className="text-xs text-charcoal/60 leading-relaxed font-sans">Admin privileges are required. Please switch the role simulator to <b>Director Admin</b>, or log in with administrator credentials.</p>
                </div>
                <AuthLayout onSuccess={handleLoginSuccess} />
              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. PREMIUM DEEP PINK CARD FOOTER */}
      <footer className="bg-ivory border-t border-blush/30 py-10 mt-16 text-charcoal/50 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Scissors className="w-4 h-4 text-gold" />
            <span className="font-bold text-charcoal tracking-[0.15em] font-serif uppercase">Princess Burland Bookings</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed text-charcoal/70 font-sans">
            Registered and verified salon grooming suites operation in Osu, Accra. Fully persistent client calendar allocations with built-in timing check-guards.
          </p>
          <div className="text-[10px] font-mono text-charcoal/40">
            © {new Date().getFullYear()} Princess Burland bookings Ltd. Managed meticulously with high-density timing checks.
          </div>
        </div>
      </footer>

    </div>
  );
}
