import { pgTable, text, integer, real, boolean, timestamp, doublePrecision, serial } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: text('role').notNull(), // 'customer', 'stylist', 'admin'
  phoneNumber: text('phone_number'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Services table
export const services = pgTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: doublePrecision('price').notNull(),
  duration: integer('duration').notNull(), // duration in minutes
  imageUrl: text('image_url'),
  category: text('category').notNull(),
});

// 3. Stylists table
export const stylists = pgTable('stylists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  specialties: text('specialties').array().notNull(), // text[]
  avatarUrl: text('avatar_url'),
  rating: real('rating').default(5.0),
  reviewsCount: integer('reviews_count').default(0),
  bio: text('bio'),
  isAvailable: boolean('is_available').default(true),
});

// 4. Bookings table
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email').notNull(),
  serviceId: text('service_id').references(() => services.id),
  serviceName: text('service_name').notNull(),
  servicePrice: doublePrecision('service_price').notNull(),
  stylistId: text('stylist_id').references(() => stylists.id),
  stylistName: text('stylist_name').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  timeSlot: text('time_slot').notNull(),
  status: text('status').default('pending'), // 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'
  notes: text('notes'),
  paymentId: text('payment_id'),
  bookingType: text('booking_type').default('Walk-In'),
  homeServiceAddress: text('home_service_address'),
  reminderSmsEnabled: boolean('reminder_sms_enabled').default(false),
  reminderEmailEnabled: boolean('reminder_email_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').references(() => bookings.id),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  amount: doublePrecision('amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  phoneNumber: text('phone_number'),
  status: text('status').default('completed'),
  transactionRef: text('transaction_ref').notNull().unique(),
  receiptNumber: text('receipt_number').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Reviews table
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').references(() => bookings.id),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  stylistId: text('stylist_id').references(() => stylists.id),
  stylistName: text('stylist_name'),
  serviceId: text('service_id').references(() => services.id),
  serviceName: text('service_name'),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  type: text('type').notNull(), // 'sms', 'email'
  recipient: text('recipient').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at').defaultNow(),
  status: text('status').default('sent'),
});

// 8. Availability table
export const availability = pgTable('availability', {
  id: text('id').primaryKey(),
  stylistId: text('stylist_id').references(() => stylists.id),
  date: text('date').notNull(),
  isAvailable: boolean('is_available').default(false),
  reason: text('reason'),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.customerId],
    references: [users.uid],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  stylist: one(stylists, {
    fields: [bookings.stylistId],
    references: [stylists.id],
  }),
}));
