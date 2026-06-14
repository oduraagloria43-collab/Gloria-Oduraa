/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'stylist' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number; // in GHS
  duration: number; // in minutes (e.g. 30, 60, 90)
  imageUrl: string;
  category: string;
}

export interface Stylist {
  id: string;
  name: string;
  specialties: string[]; // service names or categories
  avatarUrl: string;
  rating: number;
  reviewsCount: number;
  bio: string;
  isAvailable: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  stylistId: string;
  stylistName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  status: BookingStatus;
  notes?: string;
  paymentId?: string;
  createdAt: string;
  reminderSmsEnabled?: boolean;
  reminderEmailEnabled?: boolean;
  bookingType?: 'Walk-In' | 'Home Service';
  homeServiceAddress?: string;
}

export type PaymentMethod = 'MTN Mobile Money' | 'Telecel Cash' | 'AirtelTigo Money' | 'Visa' | 'Mastercard' | 'PayPal';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string; // for Mobile Money
  status: PaymentStatus;
  transactionRef: string;
  receiptNumber: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  stylistId: string;
  stylistName: string;
  serviceId: string;
  serviceName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  role: UserRole;
  type: 'sms' | 'email';
  recipient: string; // Phone or Email address
  title: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'failed';
}

export interface StylistAvailability {
  id: string;
  stylistId: string;
  date: string; // YYYY-MM-DD
  isAvailable: boolean; // false if blocked/holiday
  reason?: string; // "Vacation", "Sick Leave"
}

export interface BusinessHours {
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  openTime: string; // "HH:MM"
  closeTime: string; // "HH:MM"
  isClosed: boolean;
}

export interface DashboardStats {
  totalAppointments: number;
  totalCustomers: number;
  totalRevenue: number;
  bookingStatusBreakdown: Record<BookingStatus, number>;
  popularServices: { serviceName: string; count: number; revenue: number }[];
  topStylists: { stylistName: string; count: number; rating: number }[];
  dailyBookings: { date: string; count: number; revenue: number }[];
  monthlyBookings: { month: string; count: number; revenue: number }[];
}
