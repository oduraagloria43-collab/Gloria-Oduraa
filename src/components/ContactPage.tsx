import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Compass, 
  Navigation, 
  Sparkles, 
  ChevronRight, 
  HelpCircle,
  MessageSquare,
  BookmarkCheck,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactInquiry {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  bookingId?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactInquiry>({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
    bookingId: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedMapLandmark, setSelectedMapLandmark] = useState<string>('suite');
  const [currentDay, setCurrentDay] = useState<number>(1); // Mon-Sun (1-7)
  const [currentTimeHour, setCurrentTimeHour] = useState<number>(12);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(true);

  // Set real-time parameters for local business hours highlights
  useEffect(() => {
    const now = new Date();
    // getDay returns 0 for Sunday, 1 for Monday,... 6 for Saturday.
    // map to our 1 (Mon) - 7 (Sun)
    const day = now.getDay() === 0 ? 7 : now.getDay();
    setCurrentDay(day);
    setCurrentTimeHour(now.getHours());

    // Salon hours: Mon-Sat 9:00 AM - 8:00 PM (9 - 20), Sun Closed
    if (day === 7) {
      setIsOpenNow(false);
    } else {
      setIsOpenNow(now.getHours() >= 9 && now.getHours() < 20);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate luxury API network roundtrip
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Optional: keep form memory as a reference or reset
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: '',
      bookingId: ''
    });
    setIsSubmitted(false);
  };

  // Landmark details for our interactive location vector grid
  const mapLandmarks = {
    suite: {
      name: "Princess Burland Beauty Suite 204",
      desc: "Nyamekye, Lapaz. Centered conveniently near the main road with dedicated client parking.",
      color: "border-gold bg-gold text-white"
    },
    osuCastle: {
      name: "George Bush Motorway (N1)",
      desc: "Providing lightning-fast highway connectivity to our Lapaz suite location.",
      color: "border-charcoal/20 bg-white text-charcoal/80"
    },
    oxfordSt: {
      name: "Nyamekye Junction & Lapaz Market",
      desc: "2-minute walk from our gate. Extremely busy shopping, food, and local bus terminal zone.",
      color: "border-charcoal/20 bg-white text-charcoal/80"
    },
    park: {
      name: "Accra Luxury Grooming Valet Lounge",
      desc: "Secure private underground parking reserved specifically for your VIP scheduling.",
      color: "border-charcoal/20 bg-white text-charcoal/80"
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10 animate-fade-in">
      
      {/* 1. BRAND HERO INTRO */}
      <div className="text-center space-y-3">
        <span className="text-gold-dark text-xs font-mono font-bold tracking-widest uppercase bg-blush-light px-3.5 py-1.5 rounded-full border border-blush/30 inline-flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 animate-spin-slow text-gold" />
          ACCRA NYAMEKYE LAPAZ HQ
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold font-serif italic text-charcoal mt-1">
          Salon Location & Contact Portal
        </h2>
        <p className="text-charcoal/70 text-sm max-w-2xl mx-auto leading-relaxed">
          Locate our premier beauty lounge at Nyamekye, Lapaz, verify operational hours for Walk-In and Home Service styling, and securely submit direct inquiries to our executive staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 2. DIRECT CONTACT CHANNELS & BUSINESS HOURS (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Business Card */}
          <div className="bg-ivory border border-blush/35 rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/10 to-transparent pointer-events-none rounded-bl-full" />
            
            <h3 className="text-md font-serif italic font-bold text-gold-dark mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold flex-shrink-0 animate-pulse" />
              Corporate Registry
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white rounded-xl border border-blush/25 text-gold flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal uppercase tracking-wider text-[10px] font-mono">Physical Address</h4>
                  <p className="text-charcoal/85 mt-1 leading-normal font-sans">
                    Princess Burland Beauty Suite<br />
                    Nyamekye, Lapaz<br />
                    Suite 204, Second Floor<br />
                    Accra, Ghana
                  </p>
                  <span className="inline-block mt-2 text-[9px] font-mono font-bold text-gold-dark bg-gold-light px-2 py-0.5 rounded border border-gold/10">
                    📍 Nyamekye-Lapaz Commercial Zone
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white rounded-xl border border-blush/25 text-gold flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal uppercase tracking-wider text-[10px] font-mono">Active Phone Channels</h4>
                  <p className="text-charcoal/85 mt-1 font-mono font-semibold">
                    +233 (0) 54 888 7777 <span className="text-[10px] text-zinc-400 font-normal font-sans">(Hotline / WhatsApp)</span>
                  </p>
                  <p className="text-charcoal/85 mt-0.5 font-mono font-semibold">
                    +233 (0) 55 123 4567 <span className="text-[10px] text-zinc-400 font-normal font-sans">(Direct Suite Desk)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white rounded-xl border border-blush/25 text-gold flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal uppercase tracking-wider text-[10px] font-mono">Email Communications</h4>
                  <p className="text-charcoal/85 mt-1 font-sans">
                    General: <a href="mailto:info@burlandbookings.com" className="text-gold-dark font-semibold hover:underline">info@burlandbookings.com</a>
                  </p>
                  <p className="text-charcoal/85 mt-0.5 font-sans">
                    Management: <a href="mailto:management@burlandbookings.com" className="text-gold-dark font-semibold hover:underline">gloria@burlandbookings.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours List */}
          <div className="bg-white border border-blush/20 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-serif italic font-bold text-charcoal flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                Operational Hours
              </h3>
              
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                isOpenNow ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {isOpenNow ? '● OPEN NOW' : '○ CLOSED NOW'}
              </span>
            </div>

            <p className="text-[11px] text-charcoal/60 leading-normal mb-4 font-sans">
              Our master braiders and stylists accept scheduled appointments as well as physical Walk-Ins. Surcharge for home dispatch applies solely to selected off-site slots.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Monday', time: '9:00 AM - 8:00 PM', num: 1 },
                { label: 'Tuesday', time: '9:00 AM - 8:00 PM', num: 2 },
                { label: 'Wednesday', time: '9:00 AM - 8:00 PM', num: 3 },
                { label: 'Thursday', time: '9:00 AM - 8:00 PM', num: 4 },
                { label: 'Friday', time: '9:00 AM - 8:00 PM', num: 5 },
                { label: 'Saturday', time: '9:00 AM - 8:00 PM', num: 6 },
                { label: 'Sunday', time: 'CLOSED', num: 7 },
              ].map(day => {
                const isCurrent = currentDay === day.num;
                return (
                  <div 
                    key={day.num} 
                    className={`flex justify-between items-center px-3 py-2 rounded-xl transition ${
                      isCurrent 
                        ? 'bg-gold-light border border-gold/30 text-gold-dark font-semibold' 
                        : 'bg-zinc-50/50 text-charcoal/80 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-sans">
                      {isCurrent && <ChevronRight className="w-3.5 h-3.5 text-gold animate-pulse" />}
                      {day.label}
                    </span>
                    <span className="font-mono text-[11px]">
                      {day.time}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-blush-light p-3 rounded-2xl border border-blush/30 mt-4 text-[10px] text-charcoal/70 flex items-start gap-2">
              <span className="text-base select-none leading-none mt-0.5">ℹ️</span>
              <p className="leading-relaxed">
                <b>Holiday Warning:</b> Bookings during high-demand Ghanaian public holidays (e.g., Independence Day or Christmas Suite Seasons) must be secured at least 3 days in advance.
              </p>
            </div>
          </div>

        </div>

        {/* 3. INTERACTIVE CONTACT INQUIRY FORM (7 Vols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-blush/25 rounded-3xl p-6 md:p-8 shadow-xs relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold via-blush to-blush-dark" />
            
            <div className="mb-6">
              <h3 className="text-xl font-bold font-serif italic text-charcoal">Direct Security Desk Form</h3>
              <p className="text-[11px] text-charcoal/60 mt-1">Submit your specific questions, custom bridal catalog requests, corporate group reservations, or service inquiries.</p>
            </div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="contact-form"
                  onSubmit={handleFormSubmit} 
                  className="space-y-4 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gold-dark uppercase tracking-wider font-mono mb-1">Your Name</label>
                      <input 
                        type="text"
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="E.g. Ama Serwaa Kojo"
                        className="w-full bg-beige border border-charcoal/10 rounded-xl py-2.5 px-3.5 text-charcoal focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold font-sans text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gold-dark uppercase tracking-wider font-mono mb-1">Email Address</label>
                      <input 
                        type="email"
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="E.g. ama@work.com"
                        className="w-full bg-beige border border-charcoal/10 rounded-xl py-2.5 px-3.5 text-charcoal focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold font-sans text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gold-dark uppercase tracking-wider font-mono mb-1">Phone Number</label>
                      <input 
                        type="tel"
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="E.g. 0244 123 456"
                        className="w-full bg-beige border border-charcoal/10 rounded-xl py-2.5 px-3.5 text-charcoal focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gold-dark uppercase tracking-wider font-mono mb-1">Inquiry Topic</label>
                      <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full bg-beige border border-charcoal/10 rounded-xl py-2.5 px-3.5 text-charcoal focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold font-sans text-xs cursor-pointer"
                      >
                        <option value="General Inquiry">General Query & Information</option>
                        <option value="Bridal Beauty Booking">Specialized Bridal/Group Booking</option>
                        <option value="Home Service Request">Home Delivery Service Scope</option>
                        <option value="Career & Partnerships">Management / Stylist Career</option>
                        <option value="Feedback / Complaint">Booking Modification Request</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gold-dark uppercase tracking-wider font-mono mb-1">Existing Booking ID <span className="text-zinc-400 font-normal">(Optional)</span></label>
                    <input 
                      type="text"
                      name="bookingId"
                      value={formData.bookingId}
                      onChange={handleInputChange}
                      placeholder="E.g. BRLND-98436"
                      className="w-full bg-beige border border-charcoal/10 rounded-xl py-2.5 px-3.5 text-charcoal focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold font-mono text-xs uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gold-dark uppercase tracking-wider font-mono mb-1">Write Your Inquiry Description</label>
                    <textarea 
                      required
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Provide precise details regarding your hair design parameters or event dates..."
                      className="w-full bg-beige border border-charcoal/10 rounded-xl py-2.5 px-3.5 text-charcoal focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-semibold font-sans text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gold hover:bg-gold-dark text-white font-bold uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 disabled:scale-100 disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>routing ticket to desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Secured Inquiry Ticket</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gold-light/50 border border-gold/30 rounded-2xl p-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto border border-gold/20">
                    <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-serif italic text-gold-dark">Inquiry Successfully Dispatch Ticket Received!</h4>
                    <p className="text-[11px] text-zinc-600 mt-2.5 leading-relaxed font-sans max-w-md mx-auto">
                      Dear <b>{formData.name}</b>, we have generated standard ticket <b>#BRLND-FAQ-{Math.floor(1000 + Math.random() * 9000)}</b> for your query. 
                      A senior stylist or manager at <b>{formData.email}</b> will communicate with you in less than 2 hours.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gold/10 text-left font-mono text-[10px] text-charcoal/70 space-y-1 max-w-sm mx-auto">
                    <p><b>Recipient:</b> Princess Burland Concierge</p>
                    <p><b>Topic:</b> {formData.subject}</p>
                    <p><b>Callback No:</b> {formData.phone}</p>
                    {formData.bookingId && <p><b>Associated Schedule:</b> {formData.bookingId}</p>}
                  </div>

                  <button 
                    onClick={resetForm}
                    className="px-4 py-2 bg-charcoal hover:bg-zinc-800 text-white rounded-xl text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. SALON LOCATION MAP BLOCK WITH INTERACTIVE SENSORY VECTOR PATHS */}
          <div className="bg-beige border border-blush/30 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-blush/20 pb-3">
              <div>
                <h3 className="text-sm font-bold font-serif italic text-charcoal flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-gold" />
                  Premium Salon Interactive Vector Map
                </h3>
                <p className="text-[10px] text-charcoal/50 mt-0.5">Click map coordinates or markers to identify Osu local landmark details & parking layout.</p>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] font-mono leading-none bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg p-2 font-bold select-none">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>DESK GPS TRACKING: ACTIVE</span>
              </div>
            </div>

            {/* Simulated Luxury Vector Map Layout */}
            <div className="relative bg-zinc-950 h-64 md:h-72 rounded-2xl overflow-hidden border border-charcoal/10 shadow-inner group">
              {/* Map grid coordinate decorations */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
              
              {/* Compass Rosette Background */}
              <div className="absolute -right-10 -bottom-10 text-white/5 opacity-10 pointer-events-none select-none">
                <Compass className="w-48 h-48 stroke-[1]" />
              </div>

              {/* District Street Road Networks (Gold & Silver glowing vector line segments) */}
              <div className="absolute inset-0">
                {/* George Bush N1 Highway */}
                <div className="absolute top-[35%] inset-x-0 h-1 bg-white/10" />
                <div className="absolute top-[35%] left-10 text-[8px] font-mono font-bold text-white/30 uppercase tracking-widest pointer-events-none">
                  George Bush Motorway (N1)
                </div>

                {/* Gyamfi Road */}
                <div className="absolute left-[30%] inset-y-0 w-1 bg-white/10" />

                {/* Nyamekye Road Belt */}
                <div className="absolute top-[60%] inset-x-0 h-1.5 bg-gold/15 border-y border-gold/10" />
                <div className="absolute top-[62%] right-10 text-[8px] font-mono font-bold text-gold/35 uppercase tracking-[0.2em] pointer-events-none">
                  Nyamekye Lapaz Road
                </div>

                {/* Local Area Info */}
                <div className="absolute bottom-0 inset-x-0 h-8 bg-sky-950/40 border-t border-sky-900/30 flex items-center justify-center">
                  <span className="text-[8px] font-mono font-bold text-sky-800/60 uppercase tracking-[0.4em] pointer-events-none">Lapaz Commercial & Transit District</span>
                </div>
              </div>

              {/* Interactive POI Markers on Accra Suite GIS Grid */}
              <button 
                onClick={() => setSelectedMapLandmark('suite')}
                className="absolute top-[55%] left-[55%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10 focus:outline-none"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-10 w-10 rounded-full bg-gold/30 animate-ping opacity-75"></span>
                  <div className="p-2.5 bg-gold text-white border border-gold-dark rounded-full shadow-lg relative transition-all duration-300 group-hover:scale-110">
                    <MapPin className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
                <span className="bg-gold text-white text-[8px] font-mono font-bold tracking-widest uppercase mt-1.5 px-2 py-0.5 rounded shadow-sm border border-gold-dark">
                  PRINCESS BURLAND SUITE
                </span>
              </button>

              <button 
                onClick={() => setSelectedMapLandmark('osuCastle')}
                className="absolute bottom-12 left-[25%] flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100 transition z-10 focus:outline-none"
              >
                <div className="p-1.5 bg-zinc-800 text-zinc-300 border border-white/10 rounded-full shadow-md">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full" />
                </div>
                <span className="text-[8px] text-zinc-400 font-mono tracking-wider mt-1 select-none">
                  George Bush Hwy (N1)
                </span>
              </button>

              <button 
                onClick={() => setSelectedMapLandmark('oxfordSt')}
                className="absolute top-[40%] left-[80%] flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100 transition z-10 focus:outline-none"
              >
                <div className="p-1.5 bg-zinc-800 text-gold border border-gold/20 rounded-full shadow-md">
                  <div className="w-2 h-2 bg-gold  rounded-full" />
                </div>
                <span className="text-[8px] text-zinc-400 font-mono tracking-wider mt-1 select-none">
                  Nyamekye Junction
                </span>
              </button>

              <button 
                onClick={() => setSelectedMapLandmark('park')}
                className="absolute top-[68%] left-[40%] flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100 transition z-10 focus:outline-none"
              >
                <div className="p-1.5 bg-zinc-900 text-emerald-400 border border-emerald-950 rounded-full shadow-md">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <span className="text-[8px] text-zinc-400 font-mono tracking-wider mt-1 select-none">
                  VIP Valet Parking
                </span>
              </button>

              {/* Dynamic Coordinate read-out display overlay */}
              <div className="absolute top-3 left-3 bg-zinc-900/95 border border-white/5 p-2 rounded-lg font-mono text-[8px] text-white/50 space-y-0.5 select-none z-10 pointer-events-none md:block hidden">
                <p className="text-gold font-bold">LAT: 5° 36' 45" N</p>
                <p className="text-gold font-bold">LNG: 0° 14' 58" W</p>
                <p>SCALE: 1:15,000 LAPAZ METRO</p>
              </div>
            </div>

            {/* Map explanation descriptor panel */}
            <div className="bg-zinc-50 border border-charcoal/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs">
                <span className="text-[8px] font-mono tracking-wider text-gold-dark font-bold uppercase block mb-1">SELECTED MAP PIN DATALINK</span>
                <p className="font-bold text-charcoal font-serif italic text-sm">{mapLandmarks[selectedMapLandmark as keyof typeof mapLandmarks].name}</p>
                <p className="text-charcoal/70 text-[11px] mt-0.5 leading-normal">{mapLandmarks[selectedMapLandmark as keyof typeof mapLandmarks].desc}</p>
              </div>
              <button 
                onClick={() => setSelectedMapLandmark('suite')}
                className="text-[10px] font-bold font-mono tracking-wider text-gold-dark hover:underline flex-shrink-0 flex items-center gap-1 uppercase"
              >
                Re-Center maps 🔄
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
