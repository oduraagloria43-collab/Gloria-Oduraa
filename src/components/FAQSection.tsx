import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Calendar, Scissors, CreditCard, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  id: string;
  category: 'booking' | 'prep' | 'payment';
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'policy-cancel',
    category: 'booking',
    question: 'What is your cancellation and rescheduling policy?',
    answer: 'We appreciate cancellations or rescheduling requests at least 24 hours prior to your scheduled time. Since slots are tightly monitored to avoid calendar overlaps, late changes within 24 hours may incur a 10% processing fee. You can cancel or modify your session directly through your Client Dashboard.',
    icon: Calendar,
  },
  {
    id: 'policy-late',
    category: 'booking',
    question: 'How early should I arrive, and what if I am running late?',
    answer: 'To enjoy our complete pampering experience, please arrive 10 minutes prior to your allocated slot at our Osu Suite. We offer a 15-minute grace period. If you are running late, please call our hotline instantly. Late arrivals beyond 15 minutes may require adjusting or rescheduling your treatment so we do not inconvenience subsequent client allocations.',
    icon: Clock,
  },
  {
    id: 'prep-braids',
    category: 'prep',
    question: 'How should I prep my hair before arriving for my braiding appointment?',
    answer: 'For our signature knotless braids or custom parting lines, we strongly recommend arriving with clean, freshly washed, fully detangled, and blow-dried hair with no heavy oils or waxes applied. If you prefer a professional wash, deep conditioning, and blow-dry service beforehand, please select this service add-on when booking so we can block the necessary extra time.',
    icon: Scissors,
  },
  {
    id: 'prep-braids-extensions',
    category: 'prep',
    question: 'Are braiding extensions, scalp care foods, or organic finishing oils included?',
    answer: 'Yes! High-grade soft braiding hair extensions, premium herbal scalp food, and organic shea butter finishing oils are fully covered in our price catalog. Feel free to specify your preferred color tones (such as Natural, #1B, #27, or ombre gold) in the checkout notes card when completing your hair schedule.',
    icon: HelpCircle,
  },
  {
    id: 'payment-methods',
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We operate a secure cashless suite. We accept MTN Mobile Money (MoMo), Telecel Cash, AirtelTigo Money, and major debit/credit cards (VISA/Mastercard). All payments are routed through our secured checkout portal, which includes dynamic billing receipts with a print layout ready for your records.',
    icon: CreditCard,
  },
  {
    id: 'payment-home-surcharge',
    category: 'payment',
    question: 'How is the Home Service Travel Surcharge calculated?',
    answer: 'To summon our senior stylists to your residence, luxury suite, or office in Greater Accra, we apply a standard GHS 50.00 travel surcharge. This amount covers transportation, kit alignment, and setup logistics, and is automatically itemized in your checkout booking receipt prior to payment authorization.',
    icon: MapPin,
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'booking' | 'prep' | 'payment'>('all');

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const filteredFaqs = FAQ_DATA.filter(faq => {
    if (activeFilter === 'all') return true;
    return faq.category === activeFilter;
  });

  return (
    <div id="faq-section-container" className="py-12 bg-ivory/50 rounded-3xl border border-blush/20 p-6 md:p-10 max-w-7xl mx-auto mt-12 shadow-xs">
      
      {/* Header Accent */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-gold-dark text-xs font-mono font-bold tracking-widest uppercase bg-blush-light px-2.5 py-1 rounded border border-blush/30">
          HAVE COMPANION QUESTIONS?
        </span>
        <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-1">
          Frequently Asked Questions
        </h2>
        <p className="text-charcoal/70 text-xs max-w-lg mx-auto leading-relaxed">
          Need clarifications prior to securing your beauty scheduler slot? Find essential guidelines regarding your luxury treatment experience below.
        </p>
      </div>

      {/* Filter Tabs for FAQ topics */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 select-none">
        {[
          { id: 'all', label: 'All Queries' },
          { id: 'booking', label: 'Booking & Policies' },
          { id: 'prep', label: 'Service & Prep' },
          { id: 'payment', label: 'Payment & Surcharges' },
        ].map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                setOpenId(null); // Close opened ones on category change
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gold text-white shadow-md'
                  : 'bg-white text-charcoal/70 border border-blush/30 hover:border-gold'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FAQs Collapsible Accordion Grid/List */}
      <div className="max-w-3xl mx-auto space-y-3.5">
        <AnimatePresence initial={false}>
          {filteredFaqs.map(faq => {
            const isOpen = openId === faq.id;
            const IconComponent = faq.icon;
            
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl transition-all duration-350 overflow-hidden ${
                  isOpen
                    ? 'border-gold bg-white shadow-md'
                    : 'border-blush/20 bg-white/70 hover:bg-white hover:border-blush/60'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-xl border transition-colors ${
                      isOpen
                        ? 'bg-gold-light text-gold border-gold/30'
                        : 'bg-blush-light text-blush-dark border-blush/25'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold font-serif text-charcoal tracking-tight">
                      {faq.question}
                    </span>
                  </div>
                  
                  {/* Toggle Arrow with smooth rotation */}
                  <div className={`p-1.5 rounded-full transition-colors ${
                    isOpen ? 'bg-gold-light text-gold-dark' : 'text-charcoal/40 bg-zinc-50'
                  }`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Collapsible Answer Block with dynamic scale-fade transition */}
                <AnimatePresence duration={0.25}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-charcoal/80 leading-relaxed border-t border-dashed border-blush/10">
                        <div className="bg-ivory-dark/60 p-4 rounded-xl border border-blush/10">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </AnimatePresence>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-8 text-charcoal/50 text-xs">
            No query items found in this section.
          </div>
        )}
      </div>

    </div>
  );
}
