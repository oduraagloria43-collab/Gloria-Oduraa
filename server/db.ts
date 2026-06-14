/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  User, Service, Stylist, Booking, Payment, Review, Notification, 
  StylistAvailability, BusinessHours, DashboardStats, BookingStatus, PaymentMethod 
} from '../src/types';
import { INITIAL_SERVICES, INITIAL_STYLISTS, BUSINESS_HOURS } from '../src/data/servicesData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  services: Service[];
  stylists: Stylist[];
  bookings: Booking[];
  payments: Payment[];
  reviews: Review[];
  notifications: Notification[];
  availability: StylistAvailability[];
  businessHours: BusinessHours[];
}

class GlamBookDatabase {
  private data: DatabaseSchema = {
    users: [],
    services: [],
    stylists: [],
    bookings: [],
    payments: [],
    reviews: [],
    notifications: [],
    availability: [],
    businessHours: []
  };

  constructor() {
    this.init();
  }

  private init() {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        console.log('[GlamBook DB] Loaded persistent database from file.');
        return;
      } catch (err) {
        console.error('[GlamBook DB] Error reading database file. Initializing with defaults.', err);
      }
    }

    // Default Initialization
    this.data.services = [...INITIAL_SERVICES];
    this.data.stylists = [...INITIAL_STYLISTS];
    this.data.businessHours = [...BUSINESS_HOURS];

    // Seed mock Admin & Stylists users
    this.data.users = [
      {
        id: 'user-admin-1',
        email: 'admin@glambook.com.gh',
        fullName: 'GlamBook Executive Admin',
        role: 'admin',
        phoneNumber: '+233 55 123 4567',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
        createdAt: new Date('2026-01-10').toISOString()
      },
      {
        id: 'user-gloria',
        email: 'gloria@glambook.com.gh',
        fullName: 'Gloria Oduraa',
        role: 'stylist',
        phoneNumber: '+233 54 888 7777',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        createdAt: new Date('2026-01-15').toISOString()
      },
      {
        id: 'user-customer-demo',
        email: 'customer@work.com',
        fullName: 'Ama Serwaa Kojo',
        role: 'customer',
        phoneNumber: '+233 24 111 2222',
        avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=300',
        createdAt: new Date('2026-05-01').toISOString()
      }
    ];

    // Let's seed some realistic historical bookings & reviews to feed our beautiful charts!
    this.seedHistoricalData();
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[GlamBook DB] Failed to persist database onto disk.', err);
    }
  }

  private seedHistoricalData() {
    console.log('[GlamBook DB] Seeding analytical stats database data...');
    const pastDates = [
      '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05',
      '2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09', '2026-06-10'
    ];

    const customerTemplates = [
      { name: 'Kofi Mensah', email: 'kofi@gh.com', phone: '+233 24 000 1111' },
      { name: 'Abena Mansa', email: 'abena@gh.com', phone: '+233 27 000 2222' },
      { name: 'Yaw Asante', email: 'yaw@gh.com', phone: '+233 55 000 3333' },
      { name: 'Akosua Darko', email: 'akosua@gh.com', phone: '+233 20 000 4444' },
      { name: 'Ekow Amissah', email: 'ekow@gh.com', phone: '+233 24 000 5555' }
    ];

    let bookingCounter = 1;
    let paymentCounter = 1;
    let reviewCounter = 1;

    // Create a robust set of completed and pending bookings
    pastDates.forEach((dateString, dayIndex) => {
      // 3 completed jobs and 1 cancelled or pending job per day
      for (let index = 0; index < 3; index++) {
        const client = customerTemplates[(dayIndex + index) % customerTemplates.length];
        const service = this.data.services[(dayIndex * 2 + index) % this.data.services.length];
        const stylist = this.data.stylists[(dayIndex + index) % this.data.stylists.length];
        const timeSlot = `${10 + index * 2}:30`;

        const bId = `bk-past-${bookingCounter++}`;
        const pId = `pay-past-${paymentCounter++}`;

        const booking: Booking = {
          id: bId,
          customerId: `cust-mock-${bookingCounter}`,
          customerName: client.name,
          customerPhone: client.phone,
          customerEmail: client.email,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          stylistId: stylist.id,
          stylistName: stylist.name,
          date: dateString,
          timeSlot: timeSlot,
          status: 'completed',
          notes: 'Regular maintenance appointment.',
          paymentId: pId,
          createdAt: new Date(`${dateString}T08:00:00Z`).toISOString()
        };

        const payment: Payment = {
          id: pId,
          bookingId: bId,
          customerId: booking.customerId,
          customerName: booking.customerName,
          amount: booking.servicePrice,
          paymentMethod: index % 2 === 0 ? 'MTN Mobile Money' : 'Visa',
          phoneNumber: index % 2 === 0 ? client.phone : undefined,
          status: 'completed',
          transactionRef: `tx-momo-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          receiptNumber: `REC-2026-${1000 + paymentCounter}`,
          createdAt: new Date(`${dateString}T${timeSlot}:00Z`).toISOString()
        };

        this.data.bookings.push(booking);
        this.data.payments.push(payment);

        // Leave a beautiful review 70% of the time
        if (Math.random() < 0.7) {
          const rId = `rev-past-${reviewCounter++}`;
          const review: Review = {
            id: rId,
            bookingId: bId,
            customerId: booking.customerId,
            customerName: booking.customerName,
            stylistId: stylist.id,
            stylistName: stylist.name,
            serviceId: service.id,
            serviceName: service.name,
            rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
            comment: `Absolutely wonderful work with the ${service.name}! Stylist was incredibly pleasant.`,
            createdAt: new Date(`${dateString}T18:00:00Z`).toISOString()
          };
          this.data.reviews.push(review);
        }
      }
    });

    // Let's add some upcoming simulated future bookings
    const futureDates = ['2026-06-11', '2026-06-12', '2026-06-13'];
    futureDates.forEach((dateString, dayIndex) => {
      const client = customerTemplates[dayIndex % customerTemplates.length];
      const service = this.data.services[dayIndex % this.data.services.length];
      const stylist = this.data.stylists[dayIndex % this.data.stylists.length];
      
      const bId = `bk-fut-${bookingCounter++}`;
      
      const booking: Booking = {
        id: bId,
        customerId: 'user-customer-demo', // link to our default logged-in customer demo
        customerName: 'Ama Serwaa Kojo',
        customerPhone: '+233 24 111 2222',
        customerEmail: 'customer@work.com',
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        stylistId: stylist.id,
        stylistName: stylist.name,
        date: dateString,
        timeSlot: '11:00',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      this.data.bookings.push(booking);
    });
  }

  // --- USERS ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- SERVICES ---
  getServices(): Service[] {
    return this.data.services;
  }

  getServiceById(id: string): Service | undefined {
    return this.data.services.find(s => s.id === id);
  }

  createService(service: Omit<Service, 'id'>): Service {
    const newService: Service = {
      ...service,
      id: `s-${Math.random().toString(36).substring(2, 9)}`
    };
    this.data.services.push(newService);
    this.save();
    return newService;
  }

  updateService(id: string, updated: Partial<Service>): Service | null {
    const index = this.data.services.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.services[index] = { ...this.data.services[index], ...updated };
    this.save();
    return this.data.services[index];
  }

  deleteService(id: string): boolean {
    const prevLen = this.data.services.length;
    this.data.services = this.data.services.filter(s => s.id !== id);
    if (this.data.services.length < prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- STYLISTS ---
  getStylists(): Stylist[] {
    return this.data.stylists;
  }

  getStylistById(id: string): Stylist | undefined {
    return this.data.stylists.find(s => s.id === id);
  }

  createStylist(stylist: Omit<Stylist, 'id' | 'rating' | 'reviewsCount'>): Stylist {
    const newStylist: Stylist = {
      ...stylist,
      id: `sty-${Math.random().toString(36).substring(2, 9)}`,
      rating: 5.0,
      reviewsCount: 0
    };
    this.data.stylists.push(newStylist);
    // Also create a linked user account for stylist logins
    this.createUser({
      email: `${stylist.name.toLowerCase().replace(/\s+/g, '')}@glambook.com.gh`,
      fullName: stylist.name,
      role: 'stylist',
      avatarUrl: stylist.avatarUrl
    });
    this.save();
    return newStylist;
  }

  updateStylist(id: string, updated: Partial<Stylist>): Stylist | null {
    const index = this.data.stylists.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.stylists[index] = { ...this.data.stylists[index], ...updated };
    this.save();
    return this.data.stylists[index];
  }

  // --- BOOKING LOGIC WITH AVOIDANCE OF DOUBLE-BOOKING ---
  getBookings(): Booking[] {
    return this.data.bookings;
  }

  isSlotAvailable(stylistId: string, date: string, timeSlot: string): boolean {
    // 1. Check if stylist has blocked vacancy or unavailability
    const isBlocked = this.data.availability.some(
      av => av.stylistId === stylistId && av.date === date && !av.isAvailable
    );
    if (isBlocked) return false;

    // 2. Check for active/confirmed/pending bookings for this stylist at this date & time to prevent double-booking!
    const isDoubleBooked = this.data.bookings.some(
      bk => bk.stylistId === stylistId && 
            bk.date === date && 
            bk.timeSlot === timeSlot && 
            ['confirmed', 'pending', 'completed'].includes(bk.status)
    );

    return !isDoubleBooked;
  }

  createBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt'>): Booking {
    // Check double-booking double proof
    const isAvailable = this.isSlotAvailable(booking.stylistId, booking.date, booking.timeSlot);
    if (!isAvailable) {
      throw new Error(`Stylist is already booked or unavailable at ${booking.date} ${booking.timeSlot}`);
    }

    const newBooking: Booking = {
      ...booking,
      id: `bk-${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending', // Starts pending until payment completed or admin/stylist confirms
      createdAt: new Date().toISOString()
    };

    this.data.bookings.push(newBooking);
    this.save();

    // Spawn an automation simulated notification
    this.createNotification({
      userId: booking.customerId,
      role: 'customer',
      type: 'email',
      recipient: booking.customerEmail,
      title: 'GlamBook Ghana: Booking Received!',
      message: `Hi ${booking.customerName}, your booking request for ${booking.serviceName} with stylist ${booking.stylistName} on ${booking.date} at ${booking.timeSlot} GHS${booking.servicePrice} is successfully registered and pending final payment. Thank you!`
    });

    this.createNotification({
      userId: booking.stylistId,
      role: 'stylist',
      type: 'sms',
      recipient: booking.customerPhone, // simulate sending to stylist/client phone
      title: 'New Booking Offer!',
      message: `GlamBook Notification: You have a new appointment request from ${booking.customerName} for ${booking.serviceName} on ${booking.date} at ${booking.timeSlot}. Please confirm.`
    });

    return newBooking;
  }

  updateBookingStatus(id: string, status: BookingStatus): Booking | null {
    const booking = this.data.bookings.find(b => b.id === id);
    if (!booking) return null;

    booking.status = status;
    this.save();

    // Create custom notification alerts for states
    let templateMsg = '';
    if (status === 'confirmed') {
      templateMsg = `Hi ${booking.customerName}, your request for ${booking.serviceName} on ${booking.date} at ${booking.timeSlot} with ${booking.stylistName} is CONFIRMED. We look forward to treating you like royalty!`;
    } else if (status === 'completed') {
      templateMsg = `Hi ${booking.customerName}, we hope you loved your service! Please log back into GlamBook to write a review of ${booking.stylistName}. Enjoy your radiant new look!`;
    } else if (status === 'cancelled') {
      templateMsg = `Notification: GlamBook appointment of ${booking.serviceName} on ${booking.date} has been cancelled successfully.`;
    } else if (status === 'rejected') {
      templateMsg = `Hi ${booking.customerName}, unfortunately stylist ${booking.stylistName} is unavailable on ${booking.date} at ${booking.timeSlot}. Your booking has been declined and money has been initiated for refund. Let's try booking another timing!`;
    }

    if (templateMsg) {
      this.createNotification({
        userId: booking.customerId,
        role: 'customer',
        type: 'sms',
        recipient: booking.customerPhone,
        title: `Booking Update: ${status.toUpperCase()}`,
        message: templateMsg
      });
    }

    return booking;
  }

  updateBookingReminders(id: string, reminderSmsEnabled: boolean, reminderEmailEnabled: boolean): Booking | null {
    const booking = this.data.bookings.find(b => b.id === id);
    if (!booking) return null;

    booking.reminderSmsEnabled = reminderSmsEnabled;
    booking.reminderEmailEnabled = reminderEmailEnabled;
    this.save();

    this.createNotification({
      userId: booking.customerId,
      role: 'customer',
      type: 'email',
      recipient: booking.customerEmail,
      title: 'GlamBook: 24-Hour Reminder Updated',
      message: `Dear ${booking.customerName}, your 24-hour reminder settings for your appointment on ${booking.date} at ${booking.timeSlot} were successfully updated. SMS reminder: ${reminderSmsEnabled ? 'Enabled' : 'Disabled'}, Email reminder: ${reminderEmailEnabled ? 'Enabled' : 'Disabled'}.`
    });

    return booking;
  }

  // --- PAYMENTS ---
  getPayments(): Payment[] {
    return this.data.payments;
  }

  createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'status' | 'transactionRef' | 'receiptNumber'>): Payment {
    const transactionRef = `TX-GHP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Math.random().toString(36).substring(2, 11)}`,
      status: 'completed', // immediately marked completed for Momo simulation!
      transactionRef,
      receiptNumber,
      createdAt: new Date().toISOString()
    };

    this.data.payments.push(newPayment);

    // Update the linked booking status to 'confirmed' upon payments!
    const booking = this.data.bookings.find(b => b.id === paymentData.bookingId);
    if (booking) {
      booking.status = 'confirmed';
      booking.paymentId = newPayment.id;
    }

    this.save();

    // Spawn Receipt Notifications
    this.createNotification({
      userId: paymentData.customerId,
      role: 'customer',
      type: 'email',
      recipient: booking?.customerEmail || 'customer@customer.com',
      title: 'Payment Receipt: GlamBook Ghana',
      message: `Dear ${paymentData.customerName},\n\nWe have successfully received GHS ${paymentData.amount} via ${paymentData.paymentMethod} for booking ${paymentData.bookingId}.\nReceipt Number: ${receiptNumber}\nTx Ref: ${transactionRef}\n\nThank you for choosing luxury. See you soon!`
    });

    return newPayment;
  }

  // --- REVIEWS ---
  getReviews(): Review[] {
    return this.data.reviews;
  }

  createReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.push(newReview);

    // Recalculate average rating of Stylist
    const stylistReviews = this.data.reviews.filter(r => r.stylistId === review.stylistId);
    const sumRatings = stylistReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((sumRatings / stylistReviews.length).toFixed(1));

    const stylistIndex = this.data.stylists.findIndex(s => s.id === review.stylistId);
    if (stylistIndex !== -1) {
      this.data.stylists[stylistIndex].rating = avgRating;
      this.data.stylists[stylistIndex].reviewsCount = stylistReviews.length;
    }

    this.save();
    return newReview;
  }

  // --- NOTIFICATIONS ---
  getNotifications(): Notification[] {
    return this.data.notifications;
  }

  createNotification(notif: Omit<Notification, 'id' | 'sentAt' | 'status'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Math.random().toString(36).substring(2, 9)}`,
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  // --- AVAILABILITY (VACATIONS, BLOCKED DATES) ---
  getAvailability(): StylistAvailability[] {
    return this.data.availability;
  }

  setStylistAvailability(availability: Omit<StylistAvailability, 'id'>): StylistAvailability {
    const existIndex = this.data.availability.findIndex(
      av => av.stylistId === availability.stylistId && av.date === availability.date
    );

    if (existIndex !== -1) {
      // Modify existing
      this.data.availability[existIndex].isAvailable = availability.isAvailable;
      this.data.availability[existIndex].reason = availability.reason;
      this.save();
      return this.data.availability[existIndex];
    } else {
      // Create new blocker
      const newAv: StylistAvailability = {
        ...availability,
        id: `av-${Math.random().toString(36).substring(2, 9)}`
      };
      this.data.availability.push(newAv);
      this.save();
      return newAv;
    }
  }

  // --- BUSINESS HOURS ---
  getBusinessHours(): BusinessHours[] {
    return this.data.businessHours;
  }

  updateBusinessHours(hours: BusinessHours[]): BusinessHours[] {
    this.data.businessHours = hours;
    this.save();
    return this.data.businessHours;
  }

  // --- ANALYTICS ENGINE FOR EXECUTIVE INSIGHTS ---
  getDashboardAnalytics(): DashboardStats {
    // 1. Total Count metrics
    const totalAppointments = this.data.bookings.length;
    
    // Unique list of customers
    const uniqueCustIds = new Set(this.data.bookings.map(b => b.customerId));
    const totalCustomers = uniqueCustIds.size || this.data.users.filter(u => u.role === 'customer').length;

    // Summing Revenue
    const totalRevenue = this.data.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    // 2. Booking status breakdown
    const bookingStatusBreakdown: Record<BookingStatus, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0
    };
    this.data.bookings.forEach(b => {
      if (bookingStatusBreakdown[b.status] !== undefined) {
        bookingStatusBreakdown[b.status]++;
      }
    });

    // 3. Popular Services and revenues
    const serviceMap: Record<string, { count: number; revenue: number }> = {};
    this.data.bookings.forEach(b => {
      // Only include valid service bookings count
      if (!serviceMap[b.serviceName]) {
        serviceMap[b.serviceName] = { count: 0, revenue: 0 };
      }
      serviceMap[b.serviceName].count++;
      if (b.status === 'completed' || b.status === 'confirmed') {
        serviceMap[b.serviceName].revenue += b.servicePrice;
      }
    });
    const popularServices = Object.entries(serviceMap).map(([serviceName, value]) => ({
      serviceName,
      ...value
    })).sort((a, b) => b.count - a.count);

    // 4. Top Performing Stylists
    const stylistPerfMap: Record<string, { count: number; rating: number; sumRatings: number; reviewCount: number }> = {};
    
    // Seed existing stylists so everyone displays on chart
    this.data.stylists.forEach(s => {
      stylistPerfMap[s.id] = { count: 0, rating: s.rating, sumRatings: 0, reviewCount: 0 };
    });

    this.data.bookings.forEach(b => {
      if (stylistPerfMap[b.stylistId]) {
        stylistPerfMap[b.stylistId].count++;
      }
    });

    this.data.reviews.forEach(r => {
      if (stylistPerfMap[r.stylistId]) {
        stylistPerfMap[r.stylistId].reviewCount++;
        stylistPerfMap[r.stylistId].sumRatings += r.rating;
      }
    });

    const topStylists = this.data.stylists.map(s => {
      const perf = stylistPerfMap[s.id];
      const actualRating = perf && perf.reviewCount > 0 
        ? parseFloat((perf.sumRatings / perf.reviewCount).toFixed(1)) 
        : s.rating;
      return {
        stylistName: s.name,
        count: perf ? perf.count : 0,
        rating: actualRating
      };
    }).sort((a, b) => b.count - a.count);

    // 5. Daily analytics breakdown
    const dailyMap: Record<string, { count: number; revenue: number }> = {};
    this.data.bookings.forEach(b => {
      const dateStr = b.date; // YYYY-MM-DD
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { count: 0, revenue: 0 };
      }
      dailyMap[dateStr].count++;
      if (b.status === 'completed' || b.status === 'confirmed') {
        dailyMap[dateStr].revenue += b.servicePrice;
      }
    });
    const dailyBookings = Object.entries(dailyMap).map(([date, val]) => ({
      date,
      ...val
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 6. Monthly analytics breakdown
    const monthlyMap: Record<string, { count: number; revenue: number }> = {};
    this.data.bookings.forEach(b => {
      const monthStr = b.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { count: 0, revenue: 0 };
      }
      monthlyMap[monthStr].count++;
      if (b.status === 'completed' || b.status === 'confirmed') {
        monthlyMap[monthStr].revenue += b.servicePrice;
      }
    });
    const monthlyBookings = Object.entries(monthlyMap).map(([month, val]) => ({
      month,
      ...val
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalAppointments,
      totalCustomers,
      totalRevenue,
      bookingStatusBreakdown,
      popularServices,
      topStylists,
      dailyBookings,
      monthlyBookings
    };
  }
}

export const dbData = new GlamBookDatabase();
export default dbData;
