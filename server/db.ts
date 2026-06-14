import { db } from '../src/db/index.ts';
import { 
  users, services, stylists, bookings, payments, reviews, notifications, availability 
} from '../src/db/schema.ts';
import { eq, and, desc, or } from 'drizzle-orm';
import { 
  User, Service, Stylist, Booking, Payment, Review, Notification, 
  StylistAvailability, BusinessHours, DashboardStats, BookingStatus, PaymentMethod 
} from '../src/types';
import { INITIAL_SERVICES, INITIAL_STYLISTS, BUSINESS_HOURS } from '../src/data/servicesData.ts';

function mapUser(u: any): User {
  return {
    id: u.uid,
    email: u.email,
    fullName: u.fullName || '',
    role: u.role as any,
    phoneNumber: u.phoneNumber || undefined,
    avatarUrl: u.avatarUrl || undefined,
    createdAt: u.createdAt ? u.createdAt.toISOString() : new Date().toISOString()
  };
}

function mapService(s: any): Service {
  return {
    id: s.id,
    name: s.name,
    description: s.description || '',
    price: s.price,
    duration: s.duration,
    imageUrl: s.imageUrl || '',
    category: s.category
  };
}

function mapStylist(st: any): Stylist {
  return {
    id: st.id,
    name: st.name,
    specialties: st.specialties || [],
    avatarUrl: st.avatarUrl || '',
    rating: st.rating || 5.0,
    reviewsCount: st.reviewsCount || 0,
    bio: st.bio || '',
    isAvailable: st.isAvailable ?? true
  };
}

function mapBooking(b: any): Booking {
  return {
    id: b.id,
    customerId: b.customerId,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    customerEmail: b.customerEmail,
    serviceId: b.serviceId || '',
    serviceName: b.serviceName,
    servicePrice: b.servicePrice,
    stylistId: b.stylistId || '',
    stylistName: b.stylistName,
    date: b.date,
    timeSlot: b.timeSlot,
    status: b.status as any,
    notes: b.notes || '',
    paymentId: b.paymentId || undefined,
    createdAt: b.createdAt ? b.createdAt.toISOString() : new Date().toISOString(),
    reminderSmsEnabled: b.reminderSmsEnabled ?? false,
    reminderEmailEnabled: b.reminderEmailEnabled ?? false,
    bookingType: b.bookingType as any,
    homeServiceAddress: b.homeServiceAddress || ''
  };
}

function mapPayment(p: any): Payment {
  return {
    id: p.id,
    bookingId: p.bookingId || '',
    customerId: p.customerId,
    customerName: p.customerName,
    amount: p.amount,
    paymentMethod: p.paymentMethod as any,
    phoneNumber: p.phoneNumber || undefined,
    status: p.status as any,
    transactionRef: p.transactionRef,
    receiptNumber: p.receiptNumber,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString()
  };
}

function mapReview(r: any): Review {
  return {
    id: r.id,
    bookingId: r.bookingId || '',
    customerId: r.customerId,
    customerName: r.customerName,
    stylistId: r.stylistId || '',
    stylistName: r.stylistName || '',
    serviceId: r.serviceId || '',
    serviceName: r.serviceName || '',
    rating: r.rating,
    comment: r.comment || '',
    createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
  };
}

function mapNotification(n: any): Notification {
  return {
    id: n.id,
    userId: n.userId,
    role: n.role as any,
    type: n.type as any,
    recipient: n.recipient,
    title: n.title,
    message: n.message,
    sentAt: n.sentAt ? n.sentAt.toISOString() : new Date().toISOString(),
    status: n.status as any
  };
}

function mapAvailability(a: any): StylistAvailability {
  return {
    id: a.id,
    stylistId: a.stylistId || '',
    date: a.date,
    isAvailable: a.isAvailable ?? false,
    reason: a.reason || undefined
  };
}

class GlamBookDatabase {
  private businessHours: BusinessHours[] = [...BUSINESS_HOURS];

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Check if bookings are empty. If so, seed historical data!
      const existing = await db.select().from(bookings).limit(1);
      if (existing.length === 0) {
        await this.seedHistoricalData();
      }
    } catch (err) {
      console.error('[GlamBook DB Init Check Error]', err);
    }
  }

  private async seedHistoricalData() {
    console.log('[GlamBook DB] Seeding historical records into PostgreSQL...');
    try {
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

      // Retrieve loaded services and stylists from Postgres
      const currentServices = await db.select().from(services);
      const currentStylists = await db.select().from(stylists);

      if (currentServices.length === 0 || currentStylists.length === 0) {
        console.warn('Cannot seed historical bookings when services or stylists are empty.');
        return;
      }

      // Seed initial mock accounts
      await db.insert(users).values([
        {
          uid: 'user-admin-1',
          email: 'admin@glambook.com.gh',
          fullName: 'GlamBook Executive Admin',
          role: 'admin',
          phoneNumber: '+233 55 123 4567',
          avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300'
        },
        {
          uid: 'user-gloria',
          email: 'gloria@glambook.com.gh',
          fullName: 'Gloria Oduraa',
          role: 'stylist',
          phoneNumber: '+233 54 888 7777',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
        },
        {
          uid: 'user-customer-demo',
          email: 'customer@work.com',
          fullName: 'Ama Serwaa Kojo',
          role: 'customer',
          phoneNumber: '+233 24 111 2222',
          avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=300'
        }
      ]).onConflictDoNothing();

      let bookingCounter = 1;
      let paymentCounter = 1;

      for (let dayIndex = 0; dayIndex < pastDates.length; dayIndex++) {
        const dateString = pastDates[dayIndex];
        
        for (let index = 0; index < 3; index++) {
          const client = customerTemplates[(dayIndex + index) % customerTemplates.length];
          const svc = currentServices[(dayIndex * 2 + index) % currentServices.length];
          const sty = currentStylists[(dayIndex + index) % currentStylists.length];
          const timeSlot = `${10 + index * 2}:30`;

          const bId = `bk-past-${bookingCounter++}`;
          const pId = `pay-past-${paymentCounter++}`;
          const dummyCustId = `cust-mock-${bookingCounter}`;

          // Create Booking record
          await db.insert(bookings).values({
            id: bId,
            customerId: dummyCustId,
            customerName: client.name,
            customerPhone: client.phone,
            customerEmail: client.email,
            serviceId: svc.id,
            serviceName: svc.name,
            servicePrice: svc.price,
            stylistId: sty.id,
            stylistName: sty.name,
            date: dateString,
            timeSlot: timeSlot,
            status: 'completed',
            notes: 'Regular maintenance appointment.',
            paymentId: pId,
            createdAt: new Date(`${dateString}T08:00:00Z`)
          }).onConflictDoNothing();

          // Create corresponding payment
          await db.insert(payments).values({
            id: pId,
            bookingId: bId,
            customerId: dummyCustId,
            customerName: client.name,
            amount: svc.price,
            paymentMethod: index % 2 === 0 ? 'MTN Mobile Money' : 'Visa',
            phoneNumber: index % 2 === 0 ? client.phone : undefined,
            status: 'completed',
            transactionRef: `tx-momo-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            receiptNumber: `REC-2026-${1000 + paymentCounter}`,
            createdAt: new Date(`${dateString}T${timeSlot}:00Z`)
          }).onConflictDoNothing();

          // Leave a review 70% of the time
          if (Math.random() < 0.7) {
            await db.insert(reviews).values({
              id: `rev-past-${bookingCounter}`,
              bookingId: bId,
              customerId: dummyCustId,
              customerName: client.name,
              stylistId: sty.id,
              stylistName: sty.name,
              serviceId: svc.id,
              serviceName: svc.name,
              rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 Stars
              comment: `Absolutely wonderful work with the ${svc.name}! Stylist was incredibly pleasant.`,
              createdAt: new Date(`${dateString}T18:00:00Z`)
            }).onConflictDoNothing();
          }
        }
      }

      // Add upcoming bookings for default client
      const futureDates = ['2026-06-11', '2026-06-12', '2026-06-13'];
      for (let dayIndex = 0; dayIndex < futureDates.length; dayIndex++) {
        const dateString = futureDates[dayIndex];
        const svc = currentServices[dayIndex % currentServices.length];
        const sty = currentStylists[dayIndex % currentStylists.length];
        const bId = `bk-fut-${bookingCounter++}`;

        await db.insert(bookings).values({
          id: bId,
          customerId: 'user-customer-demo',
          customerName: 'Ama Serwaa Kojo',
          customerPhone: '+233 24 111 2222',
          customerEmail: 'customer@work.com',
          serviceId: svc.id,
          serviceName: svc.name,
          servicePrice: svc.price,
          stylistId: sty.id,
          stylistName: sty.name,
          date: dateString,
          timeSlot: '11:00',
          status: 'confirmed',
          createdAt: new Date()
        }).onConflictDoNothing();
      }

      console.log('[GlamBook DB] Seeding successful!');
    } catch (err) {
      console.error('[GlamBook DB Seeding failed]', err);
    }
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    try {
      const res = await db.select().from(users);
      return res.map(mapUser);
    } catch (err) {
      console.error('Error in getUsers:', err);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      const res = await db.select().from(users).where(eq(users.uid, id)).limit(1);
      return res.length > 0 ? mapUser(res[0]) : undefined;
    } catch (err) {
      console.error('Error in getUserById:', err);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const res = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return res.length > 0 ? mapUser(res[0]) : undefined;
    } catch (err) {
      console.error('Error in getUserByEmail:', err);
      return undefined;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const result = await db.insert(users).values({
        uid: `usr-${Math.random().toString(36).substring(2, 9)}`,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
        avatarUrl: userData.avatarUrl
      }).returning();
      return mapUser(result[0]);
    } catch (err) {
      console.error('Error in createUser:', err);
      throw err;
    }
  }

  // --- SERVICES ---
  async getServices(): Promise<Service[]> {
    try {
      const res = await db.select().from(services);
      return res.map(mapService);
    } catch (err) {
      console.error('Error in getServices:', err);
      return [];
    }
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    try {
      const res = await db.select().from(services).where(eq(services.id, id)).limit(1);
      return res.length > 0 ? mapService(res[0]) : undefined;
    } catch (err) {
      console.error('Error in getServiceById:', err);
      return undefined;
    }
  }

  async createService(svc: Omit<Service, 'id'>): Promise<Service> {
    try {
      const result = await db.insert(services).values({
        id: `s-${Math.random().toString(36).substring(2, 9)}`,
        name: svc.name,
        description: svc.description,
        price: svc.price,
        duration: svc.duration,
        imageUrl: svc.imageUrl,
        category: svc.category
      }).returning();
      return mapService(result[0]);
    } catch (err) {
      console.error('Error in createService:', err);
      throw err;
    }
  }

  async updateService(id: string, updated: Partial<Service>): Promise<Service | null> {
    try {
      const result = await db.update(services)
        .set({
          name: updated.name,
          description: updated.description,
          price: updated.price,
          duration: updated.duration,
          imageUrl: updated.imageUrl,
          category: updated.category
        })
        .where(eq(services.id, id))
        .returning();
      return result.length > 0 ? mapService(result[0]) : null;
    } catch (err) {
      console.error('Error in updateService:', err);
      return null;
    }
  }

  async deleteService(id: string): Promise<boolean> {
    try {
      const result = await db.delete(services).where(eq(services.id, id)).returning();
      return result.length > 0;
    } catch (err) {
      console.error('Error in deleteService:', err);
      return false;
    }
  }

  // --- STYLISTS ---
  async getStylists(): Promise<Stylist[]> {
    try {
      const res = await db.select().from(stylists);
      return res.map(mapStylist);
    } catch (err) {
      console.error('Error in getStylists:', err);
      return [];
    }
  }

  async getStylistById(id: string): Promise<Stylist | undefined> {
    try {
      const res = await db.select().from(stylists).where(eq(stylists.id, id)).limit(1);
      return res.length > 0 ? mapStylist(res[0]) : undefined;
    } catch (err) {
      console.error('Error in getStylistById:', err);
      return undefined;
    }
  }

  async createStylist(sty: Omit<Stylist, 'id' | 'rating' | 'reviewsCount'>): Promise<Stylist> {
    try {
      const stylistId = `sty-${Math.random().toString(36).substring(2, 9)}`;
      const result = await db.insert(stylists).values({
        id: stylistId,
        name: sty.name,
        specialties: sty.specialties,
        avatarUrl: sty.avatarUrl,
        rating: 5.0,
        reviewsCount: 0,
        bio: sty.bio,
        isAvailable: sty.isAvailable
      }).returning();

      // Create a linked user account for stylist logins
      await db.insert(users).values({
        uid: `usr-sty-${Math.random().toString(36).substring(2, 9)}`,
        email: `${sty.name.toLowerCase().replace(/\s+/g, '')}@glambook.com.gh`,
        fullName: sty.name,
        role: 'stylist',
        avatarUrl: sty.avatarUrl
      }).onConflictDoNothing();

      return mapStylist(result[0]);
    } catch (err) {
      console.error('Error in createStylist:', err);
      throw err;
    }
  }

  async updateStylist(id: string, updated: Partial<Stylist>): Promise<Stylist | null> {
    try {
      const result = await db.update(stylists)
        .set({
          name: updated.name,
          specialties: updated.specialties,
          avatarUrl: updated.avatarUrl,
          bio: updated.bio,
          isAvailable: updated.isAvailable
        })
        .where(eq(stylists.id, id))
        .returning();
      return result.length > 0 ? mapStylist(result[0]) : null;
    } catch (err) {
      console.error('Error in updateStylist:', err);
      return null;
    }
  }

  // --- BOOKING LOGIC WITH AVOIDANCE OF DOUBLE-BOOKING ---
  async getBookings(): Promise<Booking[]> {
    try {
      const res = await db.select().from(bookings);
      return res.map(mapBooking);
    } catch (err) {
      console.error('Error in getBookings:', err);
      return [];
    }
  }

  async isSlotAvailable(stylistId: string, date: string, timeSlot: string): Promise<boolean> {
    try {
      const isBlocked = await db.select().from(availability).where(
        and(
          eq(availability.stylistId, stylistId),
          eq(availability.date, date),
          eq(availability.isAvailable, false)
        )
      ).limit(1);

      if (isBlocked.length > 0) return false;

      const activeBooking = await db.select().from(bookings).where(
        and(
          eq(bookings.stylistId, stylistId),
          eq(bookings.date, date),
          eq(bookings.timeSlot, timeSlot),
          or(
            eq(bookings.status, 'confirmed'),
            eq(bookings.status, 'pending'),
            eq(bookings.status, 'completed')
          )
        )
      ).limit(1);

      return activeBooking.length === 0;
    } catch (err) {
      console.error('Error in isSlotAvailable:', err);
      return false;
    }
  }

  async createBooking(bData: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
    try {
      const isAvailable = await this.isSlotAvailable(bData.stylistId, bData.date, bData.timeSlot);
      if (!isAvailable) {
        throw new Error(`Stylist is already booked or unavailable at ${bData.date} ${bData.timeSlot}`);
      }

      const bookingId = `bk-${Math.random().toString(36).substring(2, 9)}`;
      const result = await db.insert(bookings).values({
        id: bookingId,
        customerId: bData.customerId,
        customerName: bData.customerName,
        customerPhone: bData.customerPhone,
        customerEmail: bData.customerEmail,
        serviceId: bData.serviceId,
        serviceName: bData.serviceName,
        servicePrice: bData.servicePrice,
        stylistId: bData.stylistId,
        stylistName: bData.stylistName,
        date: bData.date,
        timeSlot: bData.timeSlot,
        status: 'pending',
        notes: bData.notes,
        bookingType: bData.bookingType || 'Walk-In',
        homeServiceAddress: bData.homeServiceAddress,
        reminderSmsEnabled: bData.reminderSmsEnabled,
        reminderEmailEnabled: bData.reminderEmailEnabled
      }).returning();

      // Spawn automation notification alerts
      await this.createNotification({
        userId: bData.customerId,
        role: 'customer',
        type: 'email',
        recipient: bData.customerEmail,
        title: 'GlamBook Ghana: Booking Received!',
        message: `Hi ${bData.customerName}, your booking request for ${bData.serviceName} with stylist ${bData.stylistName} on ${bData.date} at ${bData.timeSlot} GHS${bData.servicePrice} is successfully registered and pending. Thank you!`
      });

      return mapBooking(result[0]);
    } catch (err) {
      console.error('Error in createBooking:', err);
      throw err;
    }
  }

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | null> {
    try {
      const result = await db.update(bookings)
        .set({ status })
        .where(eq(bookings.id, id))
        .returning();

      if (result.length === 0) return null;

      const booking = mapBooking(result[0]);

      // Create custom notification alerts
      let templateMsg = '';
      if (status === 'confirmed') {
        templateMsg = `Hi ${booking.customerName}, your request for ${booking.serviceName} on ${booking.date} at ${booking.timeSlot} with ${booking.stylistName} is CONFIRMED. We look forward to treating you like royalty!`;
      } else if (status === 'completed') {
        templateMsg = `Hi ${booking.customerName}, we hope you loved your service! Please write a review of ${booking.stylistName}. Enjoy your radiant new look!`;
      } else if (status === 'cancelled') {
        templateMsg = `Notification: GlamBook appointment of ${booking.serviceName} has been cancelled successfully.`;
      } else if (status === 'rejected') {
        templateMsg = `Hi ${booking.customerName}, unfortunately stylist ${booking.stylistName} is unavailable. Your booking has been declined and money has been initiated for refund.`;
      }

      if (templateMsg) {
        await this.createNotification({
          userId: booking.customerId,
          role: 'customer',
          type: 'sms',
          recipient: booking.customerPhone,
          title: `Booking Update: ${status.toUpperCase()}`,
          message: templateMsg
        });
      }

      return booking;
    } catch (err) {
      console.error('Error in updateBookingStatus:', err);
      return null;
    }
  }

  async updateBookingReminders(id: string, reminderSmsEnabled: boolean, reminderEmailEnabled: boolean): Promise<Booking | null> {
    try {
      const result = await db.update(bookings)
        .set({ reminderSmsEnabled, reminderEmailEnabled })
        .where(eq(bookings.id, id))
        .returning();

      if (result.length === 0) return null;
      const booking = mapBooking(result[0]);

      await this.createNotification({
        userId: booking.customerId,
        role: 'customer',
        type: 'email',
        recipient: booking.customerEmail,
        title: 'GlamBook: 24-Hour Reminder Updated',
        message: `Dear ${booking.customerName}, your 24-hour reminder settings for your appointment on ${booking.date} at ${booking.timeSlot} were successfully updated.`
      });

      return booking;
    } catch (err) {
      console.error('Error in updateBookingReminders:', err);
      return null;
    }
  }

  // --- PAYMENTS ---
  async getPayments(): Promise<Payment[]> {
    try {
      const res = await db.select().from(payments);
      return res.map(mapPayment);
    } catch (err) {
      console.error('Error in getPayments:', err);
      return [];
    }
  }

  async createPayment(pData: Omit<Payment, 'id' | 'createdAt' | 'status' | 'transactionRef' | 'receiptNumber'>): Promise<Payment> {
    try {
      const transactionRef = `TX-GHP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
      const paymentId = `pay-${Math.random().toString(36).substring(2, 11)}`;

      const result = await db.insert(payments).values({
        id: paymentId,
        bookingId: pData.bookingId,
        customerId: pData.customerId,
        customerName: pData.customerName,
        amount: pData.amount,
        paymentMethod: pData.paymentMethod,
        phoneNumber: pData.phoneNumber,
        status: 'completed',
        transactionRef,
        receiptNumber
      }).returning();

      // Update the linked booking status to 'confirmed' upon payments
      await db.update(bookings)
        .set({ status: 'confirmed', paymentId: paymentId })
        .where(eq(bookings.id, pData.bookingId));

      return mapPayment(result[0]);
    } catch (err) {
      console.error('Error in createPayment:', err);
      throw err;
    }
  }

  // --- REVIEWS ---
  async getReviews(): Promise<Review[]> {
    try {
      const res = await db.select().from(reviews);
      return res.map(mapReview);
    } catch (err) {
      console.error('Error in getReviews:', err);
      return [];
    }
  }

  async createReview(rev: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    try {
      const reviewId = `rev-${Math.random().toString(36).substring(2, 9)}`;
      const result = await db.insert(reviews).values({
        id: reviewId,
        bookingId: rev.bookingId,
        customerId: rev.customerId,
        customerName: rev.customerName,
        stylistId: rev.stylistId,
        stylistName: rev.stylistName,
        serviceId: rev.serviceId,
        serviceName: rev.serviceName,
        rating: rev.rating,
        comment: rev.comment
      }).returning();

      // Recalculate average rating of Stylist
      const stylistReviews = await db.select().from(reviews).where(eq(reviews.stylistId, rev.stylistId));
      if (stylistReviews.length > 0) {
        const sumRatings = stylistReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = parseFloat((sumRatings / stylistReviews.length).toFixed(1));
        await db.update(stylists)
          .set({ rating: avgRating, reviewsCount: stylistReviews.length })
          .where(eq(stylists.id, rev.stylistId));
      }

      return mapReview(result[0]);
    } catch (err) {
      console.error('Error in createReview:', err);
      throw err;
    }
  }

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<Notification[]> {
    try {
      const res = await db.select().from(notifications);
      return res.map(mapNotification);
    } catch (err) {
      console.error('Error in getNotifications:', err);
      return [];
    }
  }

  async createNotification(notif: Omit<Notification, 'id' | 'sentAt' | 'status'>): Promise<Notification> {
    try {
      const notificationId = `notif-${Math.random().toString(36).substring(2, 9)}`;
      const result = await db.insert(notifications).values({
        id: notificationId,
        userId: notif.userId,
        role: notif.role,
        type: notif.type,
        recipient: notif.recipient,
        title: notif.title,
        message: notif.message,
        status: 'sent'
      }).returning();
      return mapNotification(result[0]);
    } catch (err) {
      console.error('Error in createNotification:', err);
      throw err;
    }
  }

  // --- AVAILABILITY (VACATIONS, BLOCKED DATES) ---
  async getAvailability(): Promise<StylistAvailability[]> {
    try {
      const res = await db.select().from(availability);
      return res.map(mapAvailability);
    } catch (err) {
      console.error('Error in getAvailability:', err);
      return [];
    }
  }

  async setStylistAvailability(av: Omit<StylistAvailability, 'id'>): Promise<StylistAvailability> {
    try {
      const exist = await db.select().from(availability).where(
        and(
          eq(availability.stylistId, av.stylistId),
          eq(availability.date, av.date)
        )
      ).limit(1);

      if (exist.length > 0) {
        const result = await db.update(availability)
          .set({ isAvailable: av.isAvailable, reason: av.reason })
          .where(eq(availability.id, exist[0].id))
          .returning();
        return mapAvailability(result[0]);
      } else {
        const result = await db.insert(availability).values({
          id: `av-${Math.random().toString(36).substring(2, 9)}`,
          stylistId: av.stylistId,
          date: av.date,
          isAvailable: av.isAvailable,
          reason: av.reason
        }).returning();
        return mapAvailability(result[0]);
      }
    } catch (err) {
      console.error('Error in setStylistAvailability:', err);
      throw err;
    }
  }

  // --- BUSINESS HOURS ---
  getBusinessHours(): BusinessHours[] {
    return this.businessHours;
  }

  async updateBusinessHours(hours: BusinessHours[]): Promise<BusinessHours[]> {
    this.businessHours = hours;
    return this.businessHours;
  }

  // --- ANALYTICS ENGINE FOR EXECUTIVE INSIGHTS ---
  async getDashboardAnalytics(): Promise<DashboardStats> {
    try {
      const allBookings = await this.getBookings();
      const allPayments = await this.getPayments();
      const allReviews = await this.getReviews();
      const allStylists = await this.getStylists();
      const allUsers = await this.getUsers();

      const totalAppointments = allBookings.length;
      const uniqueCustIds = new Set(allBookings.map(b => b.customerId));
      const totalCustomers = uniqueCustIds.size || allUsers.filter(u => u.role === 'customer').length;

      const totalRevenue = allPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const bookingStatusBreakdown: Record<BookingStatus, number> = {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0
      };

      allBookings.forEach(b => {
        if (bookingStatusBreakdown[b.status] !== undefined) {
          bookingStatusBreakdown[b.status]++;
        }
      });

      const serviceMap: Record<string, { count: number; revenue: number }> = {};
      allBookings.forEach(b => {
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

      const stylistPerfMap: Record<string, { count: number; rating: number; sumRatings: number; reviewCount: number }> = {};
      
      allStylists.forEach(s => {
        stylistPerfMap[s.id] = { count: 0, rating: s.rating, sumRatings: 0, reviewCount: 0 };
      });

      allBookings.forEach(b => {
        if (stylistPerfMap[b.stylistId]) {
          stylistPerfMap[b.stylistId].count++;
        }
      });

      allReviews.forEach(r => {
        if (stylistPerfMap[r.stylistId]) {
          stylistPerfMap[r.stylistId].reviewCount++;
          stylistPerfMap[r.stylistId].sumRatings += r.rating;
        }
      });

      const topStylists = allStylists.map(s => {
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

      const dailyMap: Record<string, { count: number; revenue: number }> = {};
      allBookings.forEach(b => {
        const dateStr = b.date;
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

      const monthlyMap: Record<string, { count: number; revenue: number }> = {};
      allBookings.forEach(b => {
        const monthStr = b.date.substring(0, 7);
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
    } catch (err) {
      console.error('Error getting dashboard analytics:', err);
      return {
        totalAppointments: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        bookingStatusBreakdown: { pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0 },
        popularServices: [],
        topStylists: [],
        dailyBookings: [],
        monthlyBookings: []
      };
    }
  }
}

export const dbData = new GlamBookDatabase();
export default dbData;
