/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Calendar, Clock, CreditCard, ChevronRight, AlertCircle, 
  Smartphone, ShieldCheck, Mail, Heart, ArrowLeft, Star, FileText, Check,
  Home, MapPin
} from 'lucide-react';
import { Service, Stylist, Booking, PaymentMethod } from '../types';
import { TIME_SLOTS } from '../data/servicesData';
// @ts-ignore
import officialLogo from '../assets/images/princess_burland_logo_1781196879431.jpg';

interface BookingWizardProps {
  onSuccess: (booking: Booking) => void;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export default function BookingWizard({ onSuccess, customerId = 'guest', customerName = '', customerPhone = '', customerEmail = '' }: BookingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);

  // Guest details states
  const [guestName, setGuestName] = useState<string>(customerName);
  const [guestPhone, setGuestPhone] = useState<string>(customerPhone);
  const [guestEmail, setGuestEmail] = useState<string>(customerEmail);

  // Synchronize with parent auth state shift if dynamic logging in occurs
  useEffect(() => {
    if (customerName) setGuestName(customerName);
    if (customerPhone) setGuestPhone(customerPhone);
    if (customerEmail) setGuestEmail(customerEmail);
  }, [customerName, customerPhone, customerEmail]);
  
  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bookingType, setBookingType] = useState<'Walk-In' | 'Home Service'>('Walk-In');
  const [homeServiceAddress, setHomeServiceAddress] = useState<string>('');
  
  // Categorization
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  
  // Time Slot checking states
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [checkingSlots, setCheckingSlots] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN Mobile Money');
  const [momoNumber, setMomoNumber] = useState<string>(customerPhone || '0244123456');

  // Sync MoMo wallet display number to phone input
  useEffect(() => {
    if (guestPhone) {
      setMomoNumber(guestPhone);
    }
  }, [guestPhone]);

  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [payingState, setPayingState] = useState<boolean>(false);
  
  // Successful Completed States
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [createdReceipt, setCreatedReceipt] = useState<any>(null);

  // Initialize service & stylist data on load
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        const uniqueCats = ['All', ...Array.from(new Set(data.map((s: Service) => s.category))) as string[]];
        setCategories(uniqueCats);
      })
      .catch(err => console.error('Error fetching services:', err));

    fetch('/api/stylists')
      .then(res => res.json())
      .then(data => setStylists(data))
      .catch(err => console.error('Error fetching stylists:', err));

    // Default chosen date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Fetch occupied slots for selected stylist & date to dynamically block time slots
  useEffect(() => {
    if (selectedStylist && selectedDate) {
      setCheckingSlots(true);
      fetch(`/api/bookings?stylistId=${selectedStylist.id}&date=${selectedDate}`)
        .then(res => res.json())
        .then((data: Booking[]) => {
          // Map out booked non-cancelled slots
          const booked = data
            .filter(b => b.status !== 'cancelled' && b.status !== 'rejected')
            .map(b => b.timeSlot);
          setBookedSlots(booked);
          setCheckingSlots(false);
        })
        .catch(err => {
          console.error('Error fetching active bookings list:', err);
          setCheckingSlots(false);
        });
    }
  }, [selectedStylist, selectedDate]);

  // Handle service category click filter
  const filteredServices = activeCategory === 'All' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  // Next step click validations
  const handleServiceSelect = (service: Service) => {
    if (bookingType === 'Home Service' && !homeServiceAddress.trim()) {
      setErrorMessage('Please enter your home address or location details to proceed with a Home Service booking.');
      return;
    }
    setErrorMessage('');
    setSelectedService(service);
    // Find best stylists that specialize in this service category
    const matchingStylist = stylists.find(sty => sty.specialties.includes(service.category));
    if (matchingStylist) {
      setSelectedStylist(matchingStylist);
    } else {
      setSelectedStylist(stylists[0] || null);
    }
    setStep(2);
  };

  const handleStep3Transition = () => {
    if (!selectedStylist) {
      setErrorMessage('Please select an expert stylist to proceed.');
      return;
    }
    setErrorMessage('');
    setStep(3);
  };

  const handleStep4Transition = () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Please choose a valid booking date and unoccupied time slot.');
      return;
    }
    
    // Check if Sunday (getDay() is 0 for Sunday in UTC/local - we parse input date cleanly)
    // input type="date" values are of format YYYY-MM-DD
    const dateParts = selectedDate.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // 0-indexed month
      const day = parseInt(dateParts[2], 10);
      const parsedDate = new Date(year, month, day);
      if (parsedDate.getDay() === 0) {
        setErrorMessage('We are closed on Sundays. Please select an available date from Monday to Saturday (9:00 AM - 8:00 PM).');
        return;
      }
    }

    setErrorMessage('');
    setStep(4);
  };

  // Secure payment and booking generation
  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayingState(true);
    setErrorMessage('');

    // Pre-flight double booking checking
    try {
      const checkRes = await fetch(`/api/bookings/check-slot?stylistId=${selectedStylist?.id}&date=${selectedDate}&timeSlot=${selectedTime}`);
      const checkData = await checkRes.json();
      
      if (!checkData.available) {
        setErrorMessage('Double-Booking Notice: This slot is no longer available. Please click back and select a different slot.');
        setPayingState(false);
        return;
      }

      // Step A: Register the Booking request on server (Returns booking object under 'pending' state)
      const finalPrice = (selectedService?.price || 0) + (bookingType === 'Home Service' ? 50 : 0);
      const bookingPayload = {
        customerId: customerId || 'guest',
        customerName: guestName || 'Guest Client',
        customerPhone: guestPhone || momoNumber || '+2330000000',
        customerEmail: guestEmail || 'guest@glambook.com',
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        servicePrice: finalPrice,
        stylistId: selectedStylist?.id,
        stylistName: selectedStylist?.name,
        date: selectedDate,
        timeSlot: selectedTime,
        notes: notes || '',
        bookingType,
        homeServiceAddress: bookingType === 'Home Service' ? homeServiceAddress : ''
      };

      const bookResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      if (!bookResponse.ok) {
        const errorData = await bookResponse.json();
        throw new Error(errorData.error || 'Server error creating booking.');
      }

      const bookingResult: Booking = await bookResponse.json();

      // Step B: Simulate dynamic gateway network delays
      await new Promise(resolve => setTimeout(resolve, 3100));

      // Step C: Execute API Payment (triggers automated receipt, notification outboxes and auto-confirms booking)
      const paymentPayload = {
        bookingId: bookingResult.id,
        customerId: customerId || 'guest',
        customerName: guestName || 'Guest Client',
        amount: finalPrice,
        paymentMethod,
        phoneNumber: paymentMethod.includes('Money') ? momoNumber : undefined
      };

      const payResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload)
      });

      if (!payResponse.ok) {
        throw new Error('Payment processing returned transactional gateway exception.');
      }

      const receiptResult = await payResponse.json();

      // Update local state with successfully confirmed objects
      bookingResult.status = 'confirmed';
      bookingResult.paymentId = receiptResult.id;

      setCreatedBooking(bookingResult);
      setCreatedReceipt(receiptResult);
      setPayingState(false);
      setStep(5);
      
      // Bubble notification update
      onSuccess(bookingResult);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Checkout failed. Please inspect details and retry.');
      setPayingState(false);
    }
  };

  const resetWizard = () => {
    setSelectedService(null);
    setSelectedStylist(null);
    setSelectedTime('');
    setNotes('');
    setCreatedBooking(null);
    setCreatedReceipt(null);
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-charcoal/10 rounded overflow-hidden shadow-sm">
      
      {/* Wizard Progress Stepper bar header */}
      <div className="bg-gold px-6 py-4 border-b border-gold-dark flex flex-nowrap items-center justify-between overflow-x-auto select-none">
        {[
          { num: 1, text: 'Select Service' },
          { num: 2, text: 'Choose Stylist' },
          { num: 3, text: 'Date & Time' },
          { num: 4, text: 'Checkout' },
          { num: 5, text: 'Confirmation' }
        ].map((s) => (
          <div key={s.num} className="flex items-center flex-shrink-0 space-x-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
              step >= s.num 
                ? 'bg-white text-gold font-bold shadow-sm' 
                : 'bg-white/20 text-white/60 border border-white/5'
            }`}>
              {step > s.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-semibold hidden md:inline transition-colors duration-300 ${
              step >= s.num ? 'text-white font-bold' : 'text-white/50'
            }`}>
              {s.text}
            </span>
            {s.num < 5 && <ChevronRight className="w-3.5 h-3.5 text-white/20 hidden md:block" />}
          </div>
        ))}
      </div>

      <div className="p-6 md:p-8 bg-beige">
        {errorMessage && (
          <div id="booking-wizard-error" className="mb-6 bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded flex items-center space-x-3 text-sm animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* -------------------------------------------------------------
            STEP 1: SERVICE SELECTOR
           ------------------------------------------------------------- */}
        {step === 1 && (
          <div>
            <div className="mb-6 text-center">
              <span className="text-gold text-xs font-mono font-bold tracking-widest uppercase bg-gold/10 px-3 py-1 rounded border border-gold/15">STEP 1</span>
              <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-2.5">Select a Salon Service</h2>
              <p className="text-charcoal/70 text-xs mt-1">Choose from our curated menu of luxury care services. Premium products included.</p>
            </div>

            {/* Booking Type Selector */}
            <div className="mb-8 max-w-2xl mx-auto bg-blush-light border border-blush/20 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-mono font-bold uppercase text-gold tracking-wider mb-3 text-center">1. Select Booking Side</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Walk-In Card */}
                <div 
                  onClick={() => {
                    setBookingType('Walk-In');
                    setErrorMessage('');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 select-none ${
                    bookingType === 'Walk-In'
                      ? 'bg-gold text-white border-gold-dark shadow-md scale-[1.01]'
                      : 'bg-white text-charcoal/70 border-blush/30 hover:border-gold'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${bookingType === 'Walk-In' ? 'bg-white text-gold font-bold' : 'bg-blush-light text-blush-dark'}`}>
                    <Home className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold font-serif italic ${bookingType === 'Walk-In' ? 'text-white' : 'text-charcoal'}`}>Walk-In Service</h4>
                    <p className="text-[11px] leading-normal opacity-90 mt-1">Visit our beauty suite at Accra Luxury Grooming Lounge. Clean, pristine setup with dedicated therapists.</p>
                    <span className={`inline-block text-[9px] font-mono font-bold tracking-wider uppercase mt-2 ${bookingType === 'Walk-In' ? 'text-gold-light' : 'text-gold-dark font-bold'}`}>Regular Salon Pricing</span>
                  </div>
                </div>

                {/* Home Service Card */}
                <div 
                  onClick={() => {
                    setBookingType('Home Service');
                    setErrorMessage('');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 select-none ${
                    bookingType === 'Home Service'
                      ? 'bg-gold text-white border-gold-dark shadow-md scale-[1.01]'
                      : 'bg-white text-charcoal/70 border-blush/30 hover:border-gold'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${bookingType === 'Home Service' ? 'bg-white text-gold font-bold' : 'bg-blush-light text-blush-dark'}`}>
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold font-serif italic ${bookingType === 'Home Service' ? 'text-white' : 'text-charcoal'}`}>Home Service</h4>
                    <p className="text-[11px] leading-normal opacity-90 mt-1">We come directly to your residence, villa, or office suite! Full grooming comfort in your space.</p>
                    <span className={`inline-block text-[9px] font-mono font-bold tracking-wider uppercase mt-2 ${bookingType === 'Home Service' ? 'text-gold-light' : 'text-gold-dark font-bold'}`}>+ GHS 50.00 Travel Surcharge</span>
                  </div>
                </div>
                
              </div>

              {/* Conditional Location / Address Field */}
              {bookingType === 'Home Service' && (
                <div className="mt-4 pt-4 border-t border-charcoal/10 space-y-2 animate-fade-in">
                  <label className="block text-xs font-mono font-bold text-gold uppercase tracking-wider">Specify Your House Address / Residence Location</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      value={homeServiceAddress}
                      onChange={(e) => {
                        setHomeServiceAddress(e.target.value);
                        if (e.target.value.trim() && errorMessage.includes('home address')) {
                          setErrorMessage('');
                        }
                      }}
                      placeholder="E.g. House No. 12, Ring Road East, Cantonments, Accra"
                      className="w-full bg-white border border-charcoal/10 focus:border-gold text-charcoal rounded py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-gold font-sans font-medium"
                    />
                    <MapPin className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-charcoal/50 leading-relaxed">Our driver & therapist team will locate you securely using GPS positioning based on this address coordinate detail.</p>
                </div>
              )}
            </div>

            <div className="mb-4 text-center">
              <h3 className="text-xs font-mono font-bold uppercase text-gold tracking-wider">2. Select a Salon Service</h3>
            </div>

            {/* Category horizontal scroller */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
                    activeCategory === cat
                      ? 'bg-gold text-charcoal border-gold font-bold'
                      : 'bg-white text-charcoal/70 border-charcoal/5 hover:border-gold/30 shadow-xs'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services elegant grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map(srv => (
                <div 
                  key={srv.id}
                  id={`srv-card-${srv.id}`}
                  onClick={() => handleServiceSelect(srv)}
                  className="group relative bg-white border border-charcoal/5 rounded overflow-hidden hover:border-gold/30 transition-all duration-200 shadow-sm cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={srv.imageUrl} 
                      alt={srv.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 brightness-95"
                    />
                    <div className="absolute top-3 left-3 bg-charcoal/90 text-gold text-[9px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded border border-gold/20">
                      {srv.category}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-gold text-charcoal text-xs font-bold px-2.5 py-0.5 rounded">
                      GHS {srv.price}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-charcoal font-serif italic group-hover:text-gold transition-colors">{srv.name}</h3>
                      <p className="text-charcoal/70 text-xs mt-1.5 line-clamp-2 leading-relaxed font-sans">{srv.description}</p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-charcoal/5 flex items-center justify-between text-xs text-charcoal/40 font-medium">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 text-gold mr-1.5" />
                        {srv.duration} Minutes
                      </span>
                      <span className="text-gold group-hover:translate-x-1 transition-transform flex items-center font-bold uppercase tracking-wider text-[9px]">
                        Select Style <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            STEP 2: CHOOSE STYLIST
           ------------------------------------------------------------- */}
        {step === 2 && (
          <div>
            <div className="mb-6 text-center relative">
              <button 
                onClick={() => setStep(1)} 
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-xs text-charcoal/70 hover:text-charcoal font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              <span className="text-gold text-xs font-mono font-bold tracking-widest uppercase bg-gold/10 px-3 py-1 rounded border border-gold/15">STEP 2</span>
              <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-2.5">Select Preferred Stylist</h2>
              <p className="text-charcoal/70 text-xs mt-1">Each of our experts has been hand-selected and verified to deliver a luxurious experience.</p>
            </div>

            {/* Stylists List rendering */}
            <div className="space-y-4">
              {stylists.map(sty => {
                const isSpecialist = selectedService ? sty.specialties.includes(selectedService.category) : false;
                const isSelected = selectedStylist?.id === sty.id;
                
                return (
                  <div
                    key={sty.id}
                    id={`sty-card-${sty.id}`}
                    onClick={() => setSelectedStylist(sty)}
                    className={`p-4 rounded flex flex-col md:flex-row items-center border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gold/5 border-gold shadow-sm'
                        : 'bg-white border-charcoal/5 hover:border-gold/20'
                    }`}
                  >
                    <div className="relative mb-4 md:mb-0 md:mr-5">
                      <img 
                        src={sty.avatarUrl} 
                        alt={sty.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gold/40"
                      />
                      {isSpecialist && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gold text-charcoal text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded whitespace-nowrap shadow-sm">
                          Service Match
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-charcoal font-serif italic flex items-center justify-center md:justify-start">
                            {sty.name}
                            {isSelected && <CheckCircle className="w-4 h-4 text-gold ml-2" />}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start space-x-1 mt-0.5 text-xs text-gold">
                            <Star className="w-3.5 h-3.5 fill-gold text-gold" style={{ stroke: 'none' }} />
                            <span className="font-bold">{sty.rating}</span>
                            <span className="text-charcoal/55 font-mono">({sty.reviewsCount} reviews)</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 md:mt-0 flex flex-wrap gap-1.5 justify-center">
                          {sty.specialties.map(spec => (
                            <span key={spec} className="bg-beige border border-charcoal/5 text-charcoal/70 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-charcoal/70 text-xs mt-2 leading-relaxed max-w-xl font-sans">{sty.bio}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-charcoal/5 flex justify-end">
              <button
                id="btn-confirm-stylist"
                onClick={handleStep3Transition}
                disabled={!selectedStylist}
                className="px-5 py-2.5 bg-charcoal hover:bg-charcoal/90 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-sm disabled:opacity-40 cursor-pointer flex items-center"
              >
                Schedule Appointment <ChevronRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            STEP 3: DATE & TIME GRID SLOT CHOICE
           ------------------------------------------------------------- */}
        {step === 3 && (
          <div>
            <div className="mb-6 text-center relative">
              <button 
                onClick={() => setStep(2)} 
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-xs text-charcoal/70 hover:text-charcoal font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              <span className="text-gold text-xs font-mono font-bold tracking-widest uppercase bg-gold/10 px-3 py-1 rounded border border-gold/15">STEP 3</span>
              <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-2.5">Schedule Date & Time</h2>
              <p className="text-charcoal/70 text-xs mt-1">Select an open slot. Double-booking is strictly prohibited under our live calendar engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Date Select and selected synopsis */}
              <div className="md:col-span-4 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold font-mono mb-2">1. Choose Date</label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime(''); // clear slot selection on date shift
                      }}
                      min={new Date().toISOString().split('T')[0]} // no past dates allowed!
                      className="w-full bg-white border border-charcoal/10 focus:border-gold hover:border-charcoal/30 text-charcoal rounded py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-gold font-mono"
                    />
                    <Calendar className="w-3.5 h-3.5 text-gold absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                 <div className="p-4 bg-white border border-charcoal/5 rounded shadow-xs">
                  <h4 className="text-xs font-bold uppercase text-charcoal/50 tracking-wider">Appointment Overview</h4>
                  
                  <div className="mt-2.5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Styling:</span>
                      <span className="font-bold text-charcoal font-serif">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Stylist:</span>
                      <span className="font-bold text-charcoal">{selectedStylist?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Duration:</span>
                      <span className="font-bold text-gold">{selectedService?.duration} Mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/70">Price:</span>
                      <span className="font-bold text-gold font-mono">GHS {selectedService?.price}</span>
                    </div>
                  </div>
                </div>

                {/* DEDICATED BUSINESS HOURS SPACE */}
                <div className="p-4 bg-gold-light/40 border border-gold/15 rounded-xl shadow-xs space-y-2">
                  <h4 className="text-[10px] font-mono font-bold uppercase text-gold-dark tracking-wider flex items-center gap-1">
                    <span>🕒</span> Business Hours
                  </h4>
                  <div className="text-[11px] space-y-1">
                    <div className="flex justify-between text-charcoal/85">
                      <span>Mon – Sat:</span>
                      <span className="font-bold">9:00 AM – 8:00 PM</span>
                    </div>
                    <div className="flex justify-between text-rose-800">
                      <span>Sunday:</span>
                      <span className="font-bold uppercase">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Time selector */}
              <div className="md:col-span-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-gold font-mono">2. Choose Available Time</label>
                  {checkingSlots && <span className="text-[10px] text-gold font-bold animate-pulse">Syncing vacancies...</span>}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.filter(slot => slot >= '09:00' && slot <= '20:00').map(slot => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedTime === slot;
                    
                    return (
                      <button
                        key={slot}
                        id={`slot-${slot}`}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-1 rounded text-xs font-semibold text-center transition-all cursor-pointer ${
                          isBooked 
                            ? 'bg-neutral-100 text-neutral-300 border border-neutral-200 line-through cursor-not-allowed'
                            : isSelected
                              ? 'bg-gold text-charcoal font-bold shadow-xs'
                              : 'bg-white text-charcoal/80 border border-charcoal/10 hover:border-gold/50'
                        }`}
                      >
                        {slot}
                        {isBooked && <span className="block text-[8px] font-mono tracking-wide text-neutral-300 font-bold uppercase mt-0.5">Booked</span>}
                        {!isBooked && !isSelected && <span className="block text-[8px] font-mono tracking-wide text-gold/60 mt-0.5">Free</span>}
                        {!isBooked && isSelected && <span className="block text-[8px] font-mono tracking-wide text-charcoal/85 mt-0.5">Selected</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-white rounded border border-charcoal/5 flex items-center space-x-2 text-[10px] text-charcoal/50 leading-relaxed font-sans">
                  <AlertCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <p>Bookings are automatically locked inside our real-time database schema to protect styling calendars.</p>
                </div>
              </div>

            </div>

            {/* Note addition */}
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wider text-gold font-mono mb-2">Add Special Notes or Requests (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., extensions color density preference, scalp allergies, hot water wash specifications..."
                className="w-full bg-white border border-charcoal/10 focus:border-gold text-charcoal rounded p-3 text-xs focus:outline-none min-h-[70px] font-sans"
              />
            </div>

            <div className="mt-6 pt-5 border-t border-charcoal/5 flex justify-between">
              <button 
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-white text-charcoal/70 hover:text-charcoal rounded border border-charcoal/10 text-xs font-bold uppercase transition"
              >
                Back
              </button>
              
              <button
                id="btn-confirm-datetime"
                onClick={handleStep4Transition}
                disabled={!selectedTime || !selectedDate}
                className="px-5 py-2.5 bg-charcoal hover:bg-charcoal/90 text-white font-bold text-xs uppercase tracking-widest rounded transition shadow-sm disabled:opacity-40 cursor-pointer flex items-center"
              >
                Proceed to Checkout <ChevronRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            STEP 4: SECURED checkout PORTAL
           ------------------------------------------------------------- */}
        {step === 4 && (
          <div>
            <div className="mb-6 text-center relative">
              <button 
                onClick={() => setStep(3)} 
                disabled={payingState}
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-xs text-charcoal/70 hover:text-charcoal font-bold disabled:pointer-events-none"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
              <span className="text-gold text-xs font-mono font-bold tracking-widest uppercase bg-gold/10 px-3 py-1 rounded border border-gold/15">STEP 4</span>
              <h2 className="text-2xl font-bold font-serif italic text-charcoal mt-2.5">Secure Payment Portal</h2>
              <p className="text-charcoal/70 text-xs mt-1">Accepting local Mobile Money and online bank cards directly into our verified account merchant.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Order total list summary on right */}
              <div className="md:col-span-5 bg-white rounded border border-charcoal/10 p-5 space-y-4 shadow-xs">
                <h3 className="text-xs font-bold uppercase text-gold tracking-wider font-mono">Premium Styling Summary</h3>
                
                <div className="space-y-3 text-xs text-charcoal/80">
                  <div className="flex justify-between items-start">
                    <span>Service:</span>
                    <span className="font-bold text-charcoal text-right max-w-[150px] font-serif">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expert Stylist:</span>
                    <span className="font-bold text-charcoal">{selectedStylist?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date scheduled:</span>
                    <span className="font-bold text-charcoal font-mono">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time appointed:</span>
                    <span className="font-bold text-charcoal font-mono">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service duration:</span>
                    <span className="font-semibold text-gold">{selectedService?.duration} mins</span>
                  </div>
                  <div className="flex justify-between border-t border-charcoal/5 pt-2">
                    <span>Booking Type:</span>
                    <span className="font-bold text-gold">{bookingType}</span>
                  </div>
                  {bookingType === 'Home Service' && (
                    <>
                      <div className="flex justify-between">
                        <span>Home Travel Fee:</span>
                        <span className="font-semibold text-gold">GHS 50.00</span>
                      </div>
                      <div className="flex flex-col text-[10px] text-charcoal/50 leading-relaxed border-t border-dashed border-charcoal/10 pt-1.5 mt-1">
                        <span className="font-bold uppercase text-[8px] text-gold tracking-wider">Service Destination:</span>
                        <span className="font-medium text-charcoal truncate">{homeServiceAddress}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t border-charcoal/5 pt-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-charcoal">Merchant Total Price:</span>
                    <span className="font-bold text-lg text-gold font-mono">GHS {(selectedService?.price || 0) + (bookingType === 'Home Service' ? 50 : 0)}.00</span>
                  </div>
                </div>

                <div className="p-3 bg-beige border border-gold/5 rounded flex items-center space-x-2 text-[10px] text-charcoal/60 leading-relaxed font-sans">
                  <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0" />
                  <p>Guaranteed customer satisfaction. 24-hour hassle-free customer cancellation policy applies.</p>
                </div>
              </div>

              {/* Form entries for Mobile Money vs Visa and processing spinner */}
              <form onSubmit={handlePaymentSubmission} className="md:col-span-7 space-y-4">
                
                {/* Guest Contact Details card if not authenticated */}
                {customerId === 'guest' && (
                  <div className="p-4 bg-white rounded-2xl border border-blush/35 shadow-xs space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase text-gold tracking-wider flex items-center justify-between">
                      <span>1. Contact & Notification Settings</span>
                      <span className="text-[9px] font-mono font-normal lowercase text-charcoal/40 bg-zinc-100 px-2 py-0.5 rounded">booking as guest</span>
                    </h3>
                    <p className="text-[10px] text-charcoal/50 leading-relaxed font-sans">
                      Enter contact details so we can dispatch your automated booking receipts and live Twilio SMS carrier reminders.
                    </p>
                    
                    <div className="space-y-3 text-xs font-sans">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gold-dark font-mono mb-1">Your Full Name</label>
                        <input 
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="E.g. Ama Serwaa Kojo"
                          className="w-full bg-beige border border-charcoal/10 focus:border-gold text-charcoal rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gold font-sans font-semibold"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gold-dark font-mono mb-1 font-sans">Phone Number</label>
                          <input 
                            type="tel"
                            required
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="E.g. 0548887777"
                            className="w-full bg-beige border border-charcoal/10 focus:border-gold text-charcoal rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gold font-mono font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gold-dark font-mono mb-1 font-sans">Email Address</label>
                          <input 
                            type="email"
                            required
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="E.g. ama@gmail.com"
                            className="w-full bg-beige border border-charcoal/10 focus:border-gold text-charcoal rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-gold font-sans font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gold font-mono mb-2">{customerId === 'guest' ? '2. Choose Payment Gateway' : 'Choose Payment Gateway'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'MTN Mobile Money', label: 'MTN MoMo', logo: '💛' },
                      { id: 'Telecel Cash', label: 'Telecel', logo: '❤️' },
                      { id: 'AirtelTigo Money', label: 'AirtelTigo', logo: '💙' },
                      { id: 'Visa', label: 'Visa Card', logo: '💳' },
                      { id: 'Mastercard', label: 'Mastercard', logo: '🏦' },
                      { id: 'PayPal', label: 'PayPal Log', logo: '🌍' }
                    ].map(pay => {
                      const isSelected = paymentMethod === pay.id;
                      return (
                        <button
                          key={pay.id}
                          type="button"
                          onClick={() => setPaymentMethod(pay.id as PaymentMethod)}
                          className={`p-2.5 rounded border text-[10px] font-bold flex items-center justify-start space-x-1.5 transition cursor-pointer ${
                            isSelected 
                              ? 'bg-gold text-charcoal border-gold shadow-xs' 
                              : 'bg-white text-charcoal/70 border-charcoal/5 hover:border-gold/30'
                          }`}
                        >
                          <span className="text-sm">{pay.logo}</span>
                          <span>{pay.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Fields based on wallet vs card */}
                {paymentMethod.includes('Money') ? (
                  <div className="p-4 bg-white rounded border border-charcoal/10 space-y-3 shadow-xs">
                    <div>
                      <label className="block text-xs text-gold uppercase tracking-wider font-mono mb-1.5">MoMo Wallet Number</label>
                      <div className="relative">
                        <input 
                          type="tel"
                          required
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                          placeholder="e.g. 0244123456"
                          className="w-full bg-beige border border-charcoal/10 focus:border-gold text-charcoal rounded py-2 px-3 pl-9 text-xs focus:outline-none font-mono font-bold"
                        />
                        <Smartphone className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-[10px] text-charcoal/50 mt-1.5 leading-relaxed font-sans">A push authorization prompt will be issued directly to this subscriber wallet pin code.</p>
                    </div>
                  </div>
                ) : paymentMethod === 'PayPal' ? (
                  <div className="p-4 bg-white rounded border border-charcoal/10 space-y-3 shadow-xs font-sans">
                    <div>
                      <label className="block text-xs text-gold uppercase tracking-wider font-mono mb-1.5">PayPal Account Email</label>
                      <div className="relative">
                        <input 
                          type="email"
                          required
                          placeholder="your-paypal@email.com"
                          className="w-full bg-beige border border-charcoal/10 focus:border-gold text-charcoal rounded py-2 px-3 pl-9 text-xs focus:outline-none font-mono"
                        />
                        <Mail className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded security-card border border-charcoal/10 space-y-3 shadow-xs font-sans">
                    <div>
                      <label className="block text-xs text-gold uppercase tracking-wider font-mono mb-1.5 font-bold">Global Card Number</label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                          placeholder="4111 2222 3333 4444"
                          className="w-full bg-beige border border-charcoal/10 focus:border-gold text-charcoal rounded py-2 px-3 pl-9 text-xs focus:outline-none font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-charcoal/50 mb-1 font-bold uppercase tracking-wider">Expiry Date (MM/YY)</label>
                        <input 
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                          placeholder="12/28"
                          className="w-full bg-beige border border-charcoal/10 focus:border-gold text-charcoal rounded py-2 px-3 text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-charcoal/50 mb-1 font-bold uppercase tracking-wider font-sans">CVV Code</label>
                        <input 
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          placeholder="***"
                          className="w-full bg-beige border border-charcoal/10 focus:border-gold text-charcoal rounded py-2 px-3 text-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Live transaction loading overlay screen */}
                {payingState ? (
                  <div className="flex flex-col items-center justify-center p-5 bg-gold/5 border border-gold/20 rounded animate-pulse text-sans">
                    <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin"></div>
                    <h4 className="text-xs font-bold text-charcoal mt-3 uppercase tracking-wider font-mono">Routing Secure Payment...</h4>
                    <p className="text-[10px] text-charcoal/75 text-center mt-1 max-w-sm leading-relaxed">Contacting payment API gateway. Please authorize push notifications on your terminal.</p>
                  </div>
                ) : (
                  <button
                    id="btn-submit-booking-payment"
                    type="submit"
                    className="w-full py-3 bg-charcoal hover:bg-charcoal/90 text-white font-bold text-xs uppercase tracking-[0.15em] rounded shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    Authorize Luxury Payment (GHS {(selectedService?.price || 0) + (bookingType === 'Home Service' ? 50 : 0)})
                  </button>
                )}
              </form>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            STEP 5: SUCCESSFUL CONFIRMATION LOGS & RECEIPT
           ------------------------------------------------------------- */}
        {step === 5 && createdBooking && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-gold p-3 rounded-full shadow-sm mb-3.5">
                <Check className="w-8 h-8 text-charcoal stroke-[3.5]" />
              </div>
              <h2 className="text-2xl font-bold font-serif italic text-charcoal tracking-tight">Booking Secured</h2>
              <p className="text-gold text-xs font-mono tracking-wider uppercase mt-1">PRINCESS BURLAND TRANSACTION COMPLETED</p>
              <p className="text-charcoal/70 text-xs mt-2 max-w-md mx-auto leading-relaxed">
                Thank you! Your luxury appointment has been registered and verified inside Princess Burland bookings databases. See receipt below.
              </p>
            </div>

            {/* Premium thermal styled Receipt card */}
            <div className="max-w-md mx-auto bg-charcoal border border-gold/20 rounded shadow-md overflow-hidden relative text-white">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gold"></div>
              
              <div className="p-5 space-y-5">
                <div className="flex flex-col items-center pt-1 space-y-2">
                  <img 
                    src={officialLogo} 
                    alt="Princess Burland Saloon Logo" 
                    className="w-12 h-12 rounded-full object-cover border border-gold/40 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-center">
                    <h3 className="text-base font-serif italic tracking-widest uppercase text-gold">Princess Burland</h3>
                    <p className="text-[9px] text-white/50 uppercase tracking-widest font-mono mt-0.5">Accra Luxury Beauty Suite</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-white/10 pt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40 font-mono">Receipt Number:</span>
                    <span className="font-bold text-white font-mono">{createdReceipt?.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-mono">Transaction Ref:</span>
                    <span className="font-bold text-white font-mono uppercase">{createdReceipt?.transactionRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-mono">Booking ID:</span>
                    <span className="font-semibold text-white font-mono">{createdBooking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-mono">Booking date:</span>
                    <span className="font-bold text-white">{createdBooking.date} • {createdBooking.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-mono">Therapist Stylist:</span>
                    <span className="font-bold text-gold">{createdBooking.stylistName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-mono">Treatment service:</span>
                    <span className="font-semibold text-white text-right max-w-[200px] font-serif">{createdBooking.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-mono">Payment Channel:</span>
                    <span className="font-bold text-white">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-mono">Booking Side:</span>
                    <span className="font-bold text-gold">{createdBooking.bookingType || 'Walk-In'}</span>
                  </div>
                  {(createdBooking.bookingType || bookingType) === 'Home Service' && (createdBooking.homeServiceAddress || homeServiceAddress) && (
                    <div className="flex flex-col text-[10px] text-white/50 border-t border-dashed border-white/10 pt-1 mt-1 text-left">
                      <span className="font-bold uppercase text-[8px] text-gold tracking-wider">Service Location:</span>
                      <span className="font-medium text-white break-words">{createdBooking.homeServiceAddress || homeServiceAddress}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-white/10 pt-3 text-center">
                  <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block">VALUABLE BILLING SUM</span>
                  <span className="text-2xl font-bold text-gold font-mono mt-0.5 block">GHS {createdBooking.servicePrice}.00</span>
                </div>
              </div>

              {/* simulated wavy receipt bottom edge */}
              <div className="h-2 bg-charcoal flex space-x-1 items-end justify-center pb-1 select-none pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-beige rounded-full border border-charcoal"></div>
                ))}
              </div>
            </div>

            {/* Notification logs dispatch panel */}
            <div id="booking-notification-panel" className="bg-white border border-charcoal/10 rounded p-5 max-w-xl mx-auto space-y-3 shadow-xs">
              <h3 className="text-xs font-bold uppercase text-gold font-mono tracking-wider flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-gold" /> Outbox Reminders Dispatch
              </h3>
              
              <div className="space-y-2">
                <div className="bg-beige border border-charcoal/5 rounded p-3 text-xs space-y-1.5">
                  <span className="text-[9px] uppercase font-bold text-gold tracking-wider bg-gold/10 px-2 py-0.5 rounded font-mono">SMS Notification Deliverable</span>
                  <p className="text-charcoal/80 italic font-sans">"Hi {guestName || createdBooking.customerName}, your booking request for {selectedService?.name} with {selectedStylist?.name} is successfully CONFIRMED on {selectedDate} at {selectedTime}. Wallet GHS {selectedService?.price} paid. See you soon!"</p>
                  <div className="flex items-center space-x-1.5 text-[9px] text-green-600 font-mono uppercase font-bold pt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Transmitted to {momoNumber || guestPhone} via Twilio MoMo SMS Gateway</span>
                  </div>
                </div>

                <div className="bg-beige border border-charcoal/5 rounded p-3 text-xs space-y-1.5">
                  <span className="text-[9px] uppercase font-bold text-gold tracking-wider bg-gold/10 px-2 py-0.5 rounded font-mono">Email Notification Deliverable</span>
                  <p className="text-charcoal/80 italic font-sans">"Dear {guestName || createdBooking.customerName},\nWe have successfully received GHS {selectedService?.price} via {paymentMethod} for booking ID {createdBooking.id}."</p>
                  <div className="flex items-center space-x-1.5 text-[9px] text-green-600 font-mono uppercase font-bold pt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Dispatched copy to {guestEmail || createdBooking.customerEmail} via MailHost server</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset control */}
            <div className="text-center pt-2">
              <button
                id="btn-reset-booking-wizard"
                onClick={resetWizard}
                className="px-5 py-2.5 bg-charcoal hover:bg-charcoal/90 text-white font-bold text-xs uppercase tracking-widest rounded transition cursor-pointer shadow-sm"
              >
                Book Another Service
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
