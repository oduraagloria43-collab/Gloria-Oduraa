import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Percent, Copy, Check, Clock, Sparkles, ChevronLeft, ChevronRight, 
  Gift, Flame, Scissors, BadgePercent, ArrowRight
} from 'lucide-react';

interface AdvertSlide {
  id: string;
  image: string;
  tag: string;
  title: string;
  highlight: string;
  code: string;
  description: string;
  badge: string;
  badgeColor: string;
}

const ADVERT_SLIDES: AdvertSlide[] = [
  {
    id: 'braids-discount',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=900',
    tag: 'ULTIMATE CORNER BRAIDS',
    title: 'The Queen\'s African Braids Promo',
    highlight: '20% OFF ALL FEED-INS',
    code: 'GLAMBRAID20',
    description: 'Bespoke Accra knotless braids, professional Ghana feed-ins, custom crown closures and protective hair washes performed by Gloria Oduraa.',
    badge: 'Limited Slots Left',
    badgeColor: 'bg-rose-500 text-white animate-pulse'
  },
  {
    id: 'momo-cashback',
    image: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=900',
    tag: 'INTEGRATED MOBILE WALLETS',
    title: 'Weekend Mobile Money Braids Cashback',
    highlight: 'GHS 30 CASHBACK CREDITED',
    code: 'MOMOPAY30',
    description: 'Settle your premium stitch braiding or bohemian curls service via MoMo (MTN or Telecel) and get flat cashback credited instantly.',
    badge: 'Weekend Special',
    badgeColor: 'bg-amber-500 text-white'
  },
  {
    id: 'braids-hydration',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=900',
    tag: 'SCALP HYDRO-DETOX',
    title: 'Steam Wash & Hydration Therapy Add-on',
    highlight: 'GHS 50 STEAM WASHOVER',
    code: 'STEAMCARE',
    description: 'Protect your natural hair underneath. Instantly unlock a complimentary premium shea butter conditioner wash with any custom braids appointment booked this month.',
    badge: 'Must-Have Addon',
    badgeColor: 'bg-emerald-500 text-white'
  }
];

interface AdvertCarouselProps {
  onApplyPromo?: (code: string) => void;
  onBookNow?: () => void;
}

export default function AdvertCarousel({ onApplyPromo, onBookNow }: AdvertCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 45 });

  // Carousel slide cycling logic
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % ADVERT_SLIDES.length);
    }, 7000); // cycle slower so users have plenty of time to read and interact
    return () => clearInterval(slideInterval);
  }, []);

  // Ticking countdown timer for "flash discount urge"
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset countdown to preserve attractive loop state
          return { hours: 4, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onApplyPromo) {
      onApplyPromo(code);
    }
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const slide = ADVERT_SLIDES[currentIdx];  return (
    <div className="relative bg-ivory border border-blush/40 rounded-3xl shadow-xl overflow-hidden mt-8 max-w-7xl mx-auto">
      {/* Decorative Upper Border Wave */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blush-dark via-gold to-gold-dark z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[400px] md:min-h-[420px]">
        
        {/* L-Column: Gorgeous, Styled African Styling Imagery */}
        <div className="lg:col-span-2 relative h-[220px] lg:h-auto overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          </AnimatePresence>
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-charcoal/85 via-charcoal/30 to-transparent" />
          
          {/* Real-time Dynamic Floating Badge on the image */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full font-bold shadow-md inline-flex items-center gap-1.5 ${slide.badgeColor}`}>
              <Flame className="w-3.5 h-3.5" />
              {slide.badge}
            </span>
          </div>

          {/* Flash Clock Countdown overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gold animate-pulse" />
            <div className="text-[10px] font-mono leading-none">
              <span className="text-blush font-bold uppercase tracking-wider block text-[8px] mb-0.5">ENDS SOON</span>
              <span className="font-bold">
                {timeLeft.hours.toString().padStart(2, '0')}h : {timeLeft.minutes.toString().padStart(2, '0')}m : {timeLeft.seconds.toString().padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>

        {/* R-Column: Interactive Advert Details with Promo Action */}
        <div className="lg:col-span-3 p-6 md:p-10 flex flex-col justify-between bg-gradient-to-br from-ivory via-blush-light to-gold-light/20 relative">
          
          {/* Decorative Sparkle asset background */}
          <div className="absolute right-4 top-4 text-gold/20 pointer-events-none select-none">
            <Sparkles className="w-24 h-24 stroke-[1]" />
          </div>

          <div>
            {/* Tag Info */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blush-dark/10 text-blush-dark px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border border-blush-dark/20">
                {slide.tag}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                <BadgePercent className="w-3.5 h-3.5 text-gold" /> Advertising Unit
              </span>
            </div>

            {/* Slider Content Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-3"
              >
                <h3 className="text-xl md:text-2xl font-bold font-serif italic text-zinc-800 tracking-tight leading-snug">
                  {slide.title}
                </h3>
                
                {/* Big Bold Headline Callout */}
                <p className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-gold-dark">
                  {slide.highlight}
                </p>

                <p className="text-sm text-zinc-650 leading-relaxed font-sans max-w-xl">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Golden/Pink Interactive Actions and Dots Controls */}
          <div className="mt-8 space-y-6">
            
            {/* Promo Code Copy Terminal */}
            <div className="bg-white border border-blush/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden group">
              <div className="absolute left-0 inset-y-0 w-1 bg-gold" />
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blush-light rounded-xl text-blush-dark">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-mono">PROMOTIONAL CODE</span>
                  <span className="text-base font-extrabold font-mono text-zinc-700 select-all tracking-wider">
                    {slide.code}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id={`btn-copy-${slide.id}`}
                  onClick={(e) => handleCopyCode(e, slide.code)}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 border cursor-pointer ${
                    copiedCode === slide.code 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/10'
                      : 'bg-zinc-800 text-white border-zinc-800 hover:bg-gold hover:border-gold shadow-sm'
                  }`}
                >
                  {copiedCode === slide.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Code Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Promo Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Slider controls footer */}
            <div className="flex items-center justify-between pt-2 border-t border-blush/20">
              
              {/* Slides Dots Navigation */}
              <div className="flex space-x-1.5 items-center select-none">
                {ADVERT_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className="focus:outline-none"
                    aria-label={`Go to advert ${idx + 1}`}
                  >
                    <div className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIdx ? 'w-5 bg-gold' : 'w-2 bg-blush hover:bg-blush-dark/30'
                    }`} />
                  </button>
                ))}
              </div>

              {/* Direct Booking Launch Button */}
              <div className="flex items-center space-x-3">
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentIdx((prev) => (prev - 1 + ADVERT_SLIDES.length) % ADVERT_SLIDES.length)}
                    className="p-1.5 rounded-lg border border-blush/20 bg-white text-gold hover:bg-gold-light transition cursor-pointer"
                    aria-label="Previous Promo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentIdx((prev) => (prev + 1) % ADVERT_SLIDES.length)}
                    className="p-1.5 rounded-lg border border-blush/20 bg-white text-gold hover:bg-gold-light transition cursor-pointer"
                    aria-label="Next Promo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {onBookNow && (
                  <button
                    onClick={onBookNow}
                    className="px-4.5 py-2.5 bg-gold hover:bg-gold-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Claim & Book
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Autoplay Active Slide Growing Timer Bar */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-100">
        <motion.div
          key={currentIdx}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 7, ease: 'linear' }}
          className="h-full bg-gold"
        />
      </div>

    </div>
  );
}
