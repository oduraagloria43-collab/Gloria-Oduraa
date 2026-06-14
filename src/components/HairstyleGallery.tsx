import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Clock, Sparkles, Calendar, DollarSign, X } from 'lucide-react';

interface Hairstyle {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  price: string;
  time: string;
  lifespan: string;
  tag: string;
}

const HAIRSTYLES: Hairstyle[] = [
  {
    id: 'l1',
    name: 'Sleek Bohemian Knotless',
    category: 'Knotless',
    image: 'https://images.unsplash.com/photo-1640552327092-be224ca4293f?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-lightweight root base transitioning to lush bohemian curly extensions. Experience zero scalp tension and a lightweight luxury protective crown.',
    price: '450',
    time: '4-5 hrs',
    lifespan: '6-8 weeks',
    tag: 'MOST POPULAR'
  },
  {
    id: 'l2',
    name: 'Royal Geometric Stitch Cornrows',
    category: 'Stitch & Cornrows',
    image: 'https://images.unsplash.com/photo-1620331320310-f14d334fc908?auto=format&fit=crop&q=80&w=800',
    description: 'Micro-precision stitch sections sporting flawless feed-ins. Styled meticulously to deliver a symmetric, neat, and highly defined hairline.',
    price: '300',
    time: '2-3 hrs',
    lifespan: '4-5 weeks',
    tag: 'EXQUISITE'
  },
  {
    id: 'l3',
    name: 'Jumbo Block Part Box Braids',
    category: 'Classic Box',
    image: 'https://images.unsplash.com/photo-1605980776566-0486c3ac7617?auto=format&fit=crop&q=80&w=800',
    description: 'Bold, heavy-density aesthetic with perfect square parting grids. This high-durability classic protective style provides maximum scalp ventilation.',
    price: '350',
    time: '3 hrs',
    lifespan: '8-10 weeks',
    tag: 'ULTRA DURABLE'
  },
  {
    id: 'l4',
    name: 'Soft Wispy Butterfly Locs',
    category: 'Twists & Locs',
    image: 'https://images.unsplash.com/photo-1595959183075-c1d09e77dfd2?auto=format&fit=crop&q=80&w=800',
    description: 'Distressed loop textures skillfully wrapped around a soft braid core. These rustic protective locs are incredibly lightweight, fluffy, and water-friendly.',
    price: '480',
    time: '4 hrs',
    lifespan: '8-12 weeks',
    tag: 'TRENDING'
  },
  {
    id: 'l5',
    name: 'Divine Senegalese Twists',
    category: 'Twists & Locs',
    image: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&q=80&w=800',
    description: 'Precision hand-spun rope twists crafted from organic premium fiber. It features sleek root partings and curls gracefully cascading at the shoulder tips.',
    price: '400',
    time: '3.5 hrs',
    lifespan: '6-8 weeks',
    tag: 'ROYALTY BRAND'
  },
  {
    id: 'l6',
    name: 'Fulani Feed-In Crown with Beads',
    category: 'Stitch & Cornrows',
    image: 'https://images.unsplash.com/photo-1620331307300-60a53b53c613?auto=format&fit=crop&q=80&w=800',
    description: 'Intricately patterned scalp designs with symmetric side drops, accessorized beautifully with custom wooden, metallic, or cowrie-shell bead endings.',
    price: '380',
    time: '3 hrs',
    lifespan: '4-6 weeks',
    tag: 'CULTURAL SIGNATURE'
  }
];

const CATEGORIES = ['All Styles', 'Knotless', 'Stitch & Cornrows', 'Twists & Locs', 'Classic Box'];

interface HairstyleGalleryProps {
  onBookNow: () => void;
}

export default function HairstyleGallery({ onBookNow }: HairstyleGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Styles');
  const [activeHairstyle, setActiveHairstyle] = useState<Hairstyle | null>(null);

  const filteredStyles = HAIRSTYLES.filter(style => {
    if (selectedCategory === 'All Styles') return true;
    return style.category === selectedCategory;
  });

  return (
    <div className="space-y-8 py-4">
      {/* SECTION HEADER */}
      <div className="text-center space-y-2">
        <span className="text-gold text-xs font-mono font-bold tracking-widest uppercase bg-gold/5 px-2.5 py-1 rounded border border-gold/15">
          ✨ SIGNATURE BURLAND LOOKBOOK ✨
        </span>
        <h2 className="text-3xl font-bold font-serif italic text-charcoal">
          Explore Our Master Hairstyle Designs
        </h2>
        <p className="text-charcoal/70 text-xs max-w-2xl mx-auto leading-relaxed font-sans">
          Swipe or filter through some of our jaw-dropping premium braids and twists designed by principal salon expert Gloria Oduraa and team. Tap any style to review deep specifications and book instantly.
        </p>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex justify-center items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(category => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-gold text-white border border-gold shadow-md font-bold'
                  : 'bg-white hover:bg-gold-light/20 border border-charcoal/10 text-charcoal/80'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* GRID LAYOUT */}
      <motion.div 
        layout
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredStyles.map(style => (
            <motion.div
              layout
              key={style.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="group bg-white border border-charcoal/5 rounded-xl md:rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              {/* IMAGE WRAPPER */}
              <div className="relative h-44 sm:h-64 overflow-hidden bg-charcoal/5 cursor-pointer" onClick={() => setActiveHairstyle(style)}>
                <img
                  src={style.image}
                  alt={style.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* BLUR / DARK GRADIENT INTERACTIVE MASK */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-gold/90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                    <Eye className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Details & Fit</span><span className="xs:hidden">View</span>
                  </div>
                </div>

                {/* OVERLAY TAG */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-charcoal/90 text-gold font-mono text-[8px] sm:text-[9px] font-bold tracking-widest px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-lg uppercase border border-gold/15 shadow-sm">
                  {style.category}
                </div>

                {style.tag && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gold/95 text-white font-sans text-[8px] sm:text-[9px] font-bold tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-lg shadow-sm border border-gold-dark/20">
                    {style.tag}
                  </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex justify-between items-end z-10 group-hover:hidden transition-all duration-200">
                  <div className="bg-black/50 backdrop-blur-md px-1.5 sm:p-2 py-0.5 sm:py-1 rounded font-mono text-[9px] sm:text-[10px] text-white/90">
                    GHS {style.price}
                  </div>
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-sm sm:text-lg font-bold font-serif italic text-charcoal group-hover:text-gold transition-colors line-clamp-1 sm:line-clamp-none">
                    {style.name}
                  </h3>
                  <p className="text-charcoal/70 text-[10px] sm:text-xs leading-relaxed font-sans line-clamp-2">
                    {style.description}
                  </p>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-charcoal/5 flex justify-between items-center text-[10px] sm:text-xs">
                  <span className="text-charcoal/50 font-mono text-[9px] sm:text-[11px] flex items-center font-medium">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold mr-0.5 sm:mr-1" /> {style.time}
                  </span>
                  <button
                    onClick={() => setActiveHairstyle(style)}
                    className="text-gold hover:text-gold-dark font-sans font-bold uppercase tracking-wider text-[9px] sm:text-[10px] flex items-center"
                  >
                    View <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* HAIRSTYLE DETAIL LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeHairstyle && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveHairstyle(null)}
              className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-gold/15 relative z-10 grid grid-cols-1 md:grid-cols-2"
            >
              {/* Image Column */}
              <div className="relative h-60 md:h-full min-h-[280px]">
                <img
                  src={activeHairstyle.image}
                  alt={activeHairstyle.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-charcoal/90 text-gold font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-lg uppercase border border-gold/15">
                  {activeHairstyle.category}
                </div>
              </div>

              {/* Data Specifications Column */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Close trigger */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-gold font-bold tracking-widest uppercase">
                        {activeHairstyle.tag || 'SIGNATURE LOOK'}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold font-serif italic text-charcoal">
                        {activeHairstyle.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveHairstyle(null)}
                      className="p-1 px-2 hover:bg-beige rounded-full text-charcoal/50 hover:text-charcoal transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-charcoal/70 text-xs leading-relaxed font-sans">
                    {activeHairstyle.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="bg-beige/60 p-2.5 rounded-xl border border-charcoal/5">
                      <span className="text-[9px] text-charcoal/40 font-mono block uppercase">Base Pricing</span>
                      <span className="text-sm font-bold text-gold-dark">GHS {activeHairstyle.price}</span>
                    </div>
                    <div className="bg-beige/60 p-2.5 rounded-xl border border-charcoal/5">
                      <span className="text-[9px] text-charcoal/40 font-mono block uppercase">Hours Duration</span>
                      <span className="text-sm font-bold text-charcoal/80">{activeHairstyle.time}</span>
                    </div>
                    <div className="bg-beige/60 p-2.5 rounded-xl border border-charcoal/5">
                      <span className="text-[9px] text-charcoal/40 font-mono block uppercase">Perfect Lifespan</span>
                      <span className="text-sm font-bold text-charcoal/80">{activeHairstyle.lifespan}</span>
                    </div>
                    <div className="bg-beige/60 p-2.5 rounded-xl border border-charcoal/5 animate-pulse">
                      <span className="text-[9px] text-gold font-mono block uppercase font-bold">Recommended Care</span>
                      <span className="text-xs font-bold text-gold-dark flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Steam Detangle
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant Book action */}
                <button
                  onClick={() => {
                    setActiveHairstyle(null);
                    onBookNow();
                  }}
                  className="w-full bg-gold hover:bg-gold-dark text-white rounded-xl py-3 font-sans font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Calendar className="w-4 h-4" /> Schedule This Style Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Minimal Arrow Icon Helper
function ChevronRightIcon() {
  return (
    <svg className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}
