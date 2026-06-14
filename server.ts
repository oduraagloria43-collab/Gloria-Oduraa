/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import db from './server/db.ts';
import { BookingStatus, PaymentMethod } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup basic parsers
  app.use(express.json());

  // ------------------------------------------------------------------
  // 1. HEALTHCHECK & STATUS SYSTEM
  // ------------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      database: 'cloud_sql_postgresql_drizzle',
      timestamp: new Date().toISOString()
    });
  });

  // ------------------------------------------------------------------
  // 2. AUTHENTICATION SERVICE FLOW (Register, Login, Me)
  // ------------------------------------------------------------------
  app.post('/api/auth/register', async (req, res) => {
    const { email, fullName, role, phoneNumber, avatarUrl } = req.body;
    
    if (!email || !fullName || !role) {
      return res.status(400).json({ error: 'Email, Full Name, and Role are mandatory parameters.' });
    }

    try {
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email address already exists.' });
      }

      const defaultAvatarUrl = avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`;

      const newUser = await db.createUser({
        email,
        fullName,
        role: role as any,
        phoneNumber,
        avatarUrl: defaultAvatarUrl
      });

      console.log(`[GlamBook Auth] Registered new user ${newUser.fullName} (${newUser.role})`);
      res.status(201).json(newUser);
    } catch (err: any) {
      console.error('Error in register endpoint:', err);
      res.status(500).json({ error: 'Failed to create user.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide email credentials.' });
    }

    try {
      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'No user account registered with this email address.' });
      }

      console.log(`[GlamBook Auth] User logged in: ${user.fullName} (${user.role})`);
      res.json(user);
    } catch (err: any) {
      console.error('Error in login endpoint:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      // Return logged-in customer as default or based on Query string
      const emailQuery = req.query.email as string;
      if (emailQuery) {
        const user = await db.getUserByEmail(emailQuery);
        if (user) return res.json(user);
      }
      
      // Default fallback to first customer
      const allUsers = await db.getUsers();
      const defaultCust = allUsers.find(u => u.role === 'customer') || allUsers[0];
      res.json(defaultCust);
    } catch (err: any) {
      console.error('Error in auth/me endpoint:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/auth/users', async (req, res) => {
    try {
      res.json(await db.getUsers());
    } catch (err: any) {
      console.error('Error in auth/users:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ------------------------------------------------------------------
  // 3. SALON SERVICES SERVICE
  // ------------------------------------------------------------------
  app.get('/api/services', async (req, res) => {
    try {
      res.json(await db.getServices());
    } catch (err) {
      console.error('Error fetching services:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/services', async (req, res) => {
    const { name, description, price, duration, imageUrl, category } = req.body;
    if (!name || !price || !duration || !category) {
      return res.status(400).json({ error: 'Service Name, Price, Duration, and Category are required.' });
    }
    try {
      const newService = await db.createService({
        name,
        description: description || '',
        price: Number(price),
        duration: Number(duration),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
        category
      });
      res.status(201).json(newService);
    } catch (err: any) {
      console.error('Error creating service:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const updated = await db.updateService(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Service not found.' });
      }
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating service:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await db.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Service not found or already deleted.' });
      }
      res.json({ success: true, message: 'Service removed successfully.' });
    } catch (err: any) {
      console.error('Error deleting service:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ------------------------------------------------------------------
  // 4. STYLISTS MANAGEMENT
  // ------------------------------------------------------------------
  app.get('/api/stylists', async (req, res) => {
    try {
      res.json(await db.getStylists());
    } catch (err) {
      console.error('Error fetching stylists:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/stylists', async (req, res) => {
    const { name, specialties, avatarUrl, bio, isAvailable } = req.body;
    if (!name || !specialties) {
      return res.status(400).json({ error: 'Stylist Name and specialties array are required.' });
    }
    try {
      const newStylist = await db.createStylist({
        name,
        specialties: Array.isArray(specialties) ? specialties : [specialties],
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        bio: bio || 'Professional hairstylist ready to upgrade your look.',
        isAvailable: isAvailable !== false
      });
      res.status(201).json(newStylist);
    } catch (err: any) {
      console.error('Error creating stylist:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/stylists/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const updated = await db.updateStylist(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Stylist profile not found.' });
      }
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating stylist:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ------------------------------------------------------------------
  // 5. BOOKINGS WITH ANTI-DOUBLE-BOOKING ENGINE
  // ------------------------------------------------------------------
  app.get('/api/bookings', async (req, res) => {
    const { customerId, stylistId, status } = req.query;
    try {
      let bList = await db.getBookings();

      if (customerId) {
        bList = bList.filter(b => b.customerId === customerId);
      }
      if (stylistId) {
        bList = bList.filter(b => b.stylistId === stylistId);
      }
      if (status) {
        bList = bList.filter(b => b.status === status);
      }

      res.json(bList);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/bookings/check-slot', async (req, res) => {
    const { stylistId, date, timeSlot } = req.query;
    if (!stylistId || !date || !timeSlot) {
      return res.status(400).json({ error: 'stylistId, date, and timeSlot parameters are mandatory.' });
    }

    try {
      const available = await db.isSlotAvailable(stylistId as string, date as string, timeSlot as string);
      res.json({ available, stylistId, date, timeSlot });
    } catch (err) {
      console.error('Error checking slot:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    const { 
      customerId, customerName, customerPhone, customerEmail,
      serviceId, serviceName, servicePrice, stylistId, stylistName,
      date, timeSlot, notes, bookingType, homeServiceAddress
    } = req.body;

    if (!customerId || !serviceId || !stylistId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Required booking variables missing.' });
    }

    try {
      // Double booking protection guard!
      const isFree = await db.isSlotAvailable(stylistId, date, timeSlot);
      if (!isFree) {
        return res.status(409).json({ 
          error: 'Double-Booking Conflict: This slot has just been secured by another client. Please select a different time slot.' 
        });
      }

      const newBooking = await db.createBooking({
        customerId,
        customerName: customerName || 'Valued Glam Client',
        customerPhone: customerPhone || '+2330000000',
        customerEmail: customerEmail || 'client@glambook.com',
        serviceId,
        serviceName,
        servicePrice: Number(servicePrice),
        stylistId,
        stylistName,
        date,
        timeSlot,
        notes: notes || '',
        bookingType: bookingType || 'Walk-In',
        homeServiceAddress: homeServiceAddress || ''
      });
      console.log(`[GlamBook Booking] Realized booking: ${newBooking.id} on ${newBooking.date} at ${newBooking.timeSlot}`);
      res.status(201).json(newBooking);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/bookings/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    try {
      const updated = await db.updateBookingStatus(id, status as BookingStatus);
      if (!updated) {
        return res.status(404).json({ error: 'Booking not found.' });
      }
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/bookings/:id/reminders', async (req, res) => {
    const { id } = req.params;
    const { reminderSmsEnabled, reminderEmailEnabled } = req.body;

    if (reminderSmsEnabled === undefined || reminderEmailEnabled === undefined) {
      return res.status(400).json({ error: 'reminderSmsEnabled and reminderEmailEnabled are required parameters.' });
    }

    try {
      const updated = await db.updateBookingReminders(id, Boolean(reminderSmsEnabled), Boolean(reminderEmailEnabled));
      if (!updated) {
        return res.status(404).json({ error: 'Booking not found.' });
      }
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating reminders:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ------------------------------------------------------------------
  // 6. PAYMENT SYSTEMS SIMULATION
  // ------------------------------------------------------------------
  app.get('/api/payments', async (req, res) => {
    try {
      res.json(await db.getPayments());
    } catch (err) {
      console.error('Error fetching payments:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/payments', async (req, res) => {
    const { bookingId, customerId, customerName, amount, paymentMethod, phoneNumber } = req.body;

    if (!bookingId || !customerId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Required payment transaction parameters missing.' });
    }

    try {
      const newPayment = await db.createPayment({
        bookingId,
        customerId,
        customerName: customerName || 'Valued Glam Client',
        amount: Number(amount),
        paymentMethod: paymentMethod as PaymentMethod,
        phoneNumber
      });

      console.log(`[GlamBook Pay] Transaction successful for receipt ${newPayment.receiptNumber} GHS${newPayment.amount}`);
      res.status(201).json(newPayment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ------------------------------------------------------------------
  // 7. PUBLIC & SERVICE REVIEWS
  // ------------------------------------------------------------------
  app.get('/api/reviews', async (req, res) => {
    const { stylistId } = req.query;
    try {
      let reviewsList = await db.getReviews();
      if (stylistId) {
        reviewsList = reviewsList.filter(r => r.stylistId === stylistId);
      }
      res.json(reviewsList);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    const { bookingId, customerId, customerName, stylistId, stylistName, serviceId, serviceName, rating, comment } = req.body;

    if (!bookingId || !stylistId || !rating) {
      return res.status(400).json({ error: 'Required parameters missing (bookingId, stylistId, rating).' });
    }

    try {
      const newReview = await db.createReview({
        bookingId,
        customerId: customerId || 'cust-anon',
        customerName: customerName || 'Anonymous',
        stylistId,
        stylistName: stylistName || 'Stylist',
        serviceId: serviceId || 's-general',
        serviceName: serviceName || 'General Service',
        rating: Number(rating),
        comment: comment || ''
      });

      res.status(201).json(newReview);
    } catch (err: any) {
      console.error('Error creating review:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ------------------------------------------------------------------
  // 8. NOTIFICATION ALERTS & LOGS
  // ------------------------------------------------------------------
  app.get('/api/notifications', async (req, res) => {
    try {
      res.json(await db.getNotifications());
    } catch (err) {
      console.error('Error fetching notifications:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ------------------------------------------------------------------
  // 9. VACATION MANAGEMENT & STYLIST SCHEDULES
  // ------------------------------------------------------------------
  app.get('/api/availability', async (req, res) => {
    try {
      res.json(await db.getAvailability());
    } catch (err) {
      console.error('Error fetching availability:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/availability', async (req, res) => {
    const { stylistId, date, isAvailable, reason } = req.body;
    if (!stylistId || !date) {
      return res.status(400).json({ error: 'stylistId and date are required.' });
    }
    try {
      const updated = await db.setStylistAvailability({
        stylistId,
        date,
        isAvailable: isAvailable !== false,
        reason
      });
      res.json(updated);
    } catch (err: any) {
      console.error('Error setting availability:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ------------------------------------------------------------------
  // 10. EXECUTIVE REVENUE & CUSTOMER ANALYTICS FOR ADMIN
  // ------------------------------------------------------------------
  app.get('/api/admin/analytics', async (req, res) => {
    try {
      const stats = await db.getDashboardAnalytics();
      res.json(stats);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ------------------------------------------------------------------
  // 11. SUPABASE/POSTGRESQL TECHNICAL EXPORT SCHEMAS
  // ------------------------------------------------------------------
  app.get('/api/admin/sql-schema', (req, res) => {
    const ddlScript = `
-- ===================================================================
-- GLAMBOOK GHANA PRODUCTION RELATIONAL DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Generated on: ${new Date().toISOString()}
-- ===================================================================

-- Enable UUID Extension if not default
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Linked with Supabase Auth or Custom Server Identity)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'stylist', 'admin')),
    phone_number VARCHAR(30),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SERVICES TABLES
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL, -- in minutes
    image_url TEXT,
    category VARCHAR(100) NOT NULL
);

-- 3. STYLISTS TABLE
CREATE TABLE IF NOT EXISTS stylists (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    specialties TEXT[] NOT NULL,
    avatar_url TEXT,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    bio TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(100) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    service_id VARCHAR(50) REFERENCES services(id),
    service_name VARCHAR(150) NOT NULL,
    service_price DECIMAL(10, 2) NOT NULL,
    stylist_id VARCHAR(50) REFERENCES stylists(id),
    stylist_name VARCHAR(150) NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot TIME NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
    notes TEXT,
    payment_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id VARCHAR(100) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money', 'Visa', 'Mastercard', 'PayPal')),
    phone_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_ref VARCHAR(100) UNIQUE NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id VARCHAR(100) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    stylist_id VARCHAR(50) REFERENCES stylists(id),
    stylist_name VARCHAR(150),
    service_id VARCHAR(50) REFERENCES services(id),
    service_name VARCHAR(150),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. NOTIFICATIONS & OUTBOX
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('sms', 'email')),
    recipient VARCHAR(255) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(15) DEFAULT 'sent'
);

-- 8. SPECIAL AVAILABILITY & BLOCKED LEAVES
CREATE TABLE IF NOT EXISTS availability (
    id VARCHAR(50) PRIMARY KEY,
    stylist_id VARCHAR(50) REFERENCES stylists(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT FALSE,
    reason VARCHAR(255)
);

-- Create optimized Indexes to enforce timing constraints and accelerate reports
CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON bookings(appointment_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_bookings_stylist ON bookings(stylist_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_stylist ON reviews(stylist_id);
`;
    res.setHeader('Content-Type', 'text/plain');
    res.send(ddlScript);
  });

  // ------------------------------------------------------------------
  // 12. VITE DEV SERVER OR HIGH-PERFORMANCE STATIC INGRESS
  // ------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind server exclusively on port 3000 as mandated by AI Studio container ingress
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GlamBook Ghana] High-end server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[GlamBook Server Fatal Boot Error]', err);
});
