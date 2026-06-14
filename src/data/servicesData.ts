/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, Stylist, BusinessHours } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's-goddess-braids',
    name: 'Ghana Goddess Braids',
    description: 'Stunning premium feeder braids styled with professional goddess curls. Restorative natural oils and high-quality extensions included in session.',
    price: 350,
    duration: 180,
    imageUrl: 'https://images.unsplash.com/photo-1640552327092-be224ca4293f?auto=format&fit=crop&q=80&w=600',
    category: 'Hair Braiding'
  },
  {
    id: 's-knotless-braids',
    name: 'Knotless Box Braids (Medium/Smedium)',
    description: 'State-of-the-art featherweight knotless braids, offering absolute zero tension at the root. Delivers custom aesthetic parting and pristine sleek finishes.',
    price: 480,
    duration: 240,
    imageUrl: 'https://images.unsplash.com/photo-1605497746445-97d1b0a9eedb?auto=format&fit=crop&q=80&w=600',
    category: 'Hair Braiding'
  },
  {
    id: 's-boho-braids',
    name: 'Bohemian Curls Box Braids',
    description: 'Classic box braids intermeshed with high-grade, voluminous bohemian curly strands. Extremely romantic, lightweight protective styling.',
    price: 450,
    duration: 210,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    category: 'Hair Braiding'
  },
  {
    id: 's-stitch-braids',
    name: 'Feed-in Stitch Cornrows',
    description: 'Highly detailed, razor-sharp stitch braiding designs. Includes full scalp moisturizing treatments to maintain hair follicles.',
    price: 280,
    duration: 125,
    imageUrl: 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=600',
    category: 'Hair Braiding'
  },
  {
    id: 's-twists',
    name: 'Elite Senegalese & Rope Twists',
    description: 'Sleek, perfectly rolled rope twists utilizing silky-soft kanekalon fibres. High durability, low-maintenance protective crown.',
    price: 390,
    duration: 160,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    category: 'Hair Braiding'
  },
  {
    id: 's-locs',
    name: 'Boho Butterfly & Distressed Locs',
    description: 'Beautiful, textured distressed locs with soft butterfly bubbles. Provides an elegant royal aesthetic with high end longevity.',
    price: 430,
    duration: 195,
    imageUrl: 'https://images.unsplash.com/photo-1610992015732-2449b76344cc?auto=format&fit=crop&q=80&w=600',
    category: 'Hair Braiding'
  },
  {
    id: 's-braids-detox',
    name: 'Luxury Protective Style Steam Wash',
    description: 'Specialized deep cleansing scalp wash, dynamic apple cider vinegar detox, and deep steam hydration treatment without unbraiding your protective crowns.',
    price: 180,
    duration: 60,
    imageUrl: 'https://images.unsplash.com/photo-1519415510236-8a37f204c4ae?auto=format&fit=crop&q=80&w=600',
    category: 'Hair Treatment'
  },
  {
    id: 's-braids-touchup',
    name: 'Perimeter Touch-Up & Edge Refresh',
    description: 'Elegantly neatens and re-braids the perimeter rows (front & back hairlines) to completely revive older braids. Completed with organic edge styling.',
    price: 150,
    duration: 45,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df490651e56c?auto=format&fit=crop&q=80&w=600',
    category: 'Hair Treatment'
  }
];

export const INITIAL_STYLISTS: Stylist[] = [
  {
    id: 'sty-gloria',
    name: 'Gloria Oduraa',
    specialties: ['Ghana Goddess Braids', 'Knotless Box Braids (Medium/Smedium)', 'Hair Treatment'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewsCount: 148,
    bio: 'Founder of Princess Burland bookings, with over 10 years of professional braiding experience. Hair natural care specialist who speaks English and Twi.',
    isAvailable: true
  },
  {
    id: 'sty-abena',
    name: 'Abena Mansah',
    specialties: ['Elite Senegalese & Rope Twists', 'Knotless Box Braids (Medium/Smedium)'],
    avatarUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    reviewsCount: 92,
    bio: '保护性造型 (protective styling) artisan with a deep focus on protective rope twists and neat Senegalese textures that grow natural hair.',
    isAvailable: true
  },
  {
    id: 'sty-selasi',
    name: 'Selasi Kojo',
    specialties: ['Bohemian Curls Box Braids', 'Boho Butterfly & Distressed Locs'],
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviewsCount: 110,
    bio: 'Bohemian and locs specialist dedicated to custom curly texturizing and distressed protective wraps.',
    isAvailable: true
  },
  {
    id: 'sty-adjoa',
    name: 'Adjoa Boakye',
    specialties: ['Feed-in Stitch Cornrows', 'Perimeter Touch-Up & Edge Refresh'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviewsCount: 75,
    bio: 'High precision cornrow parting designer with 6 years of expertise in stitches, geometric parting lines, and edge control styling.',
    isAvailable: true
  }
];

export const BUSINESS_HOURS: BusinessHours[] = [
  { dayOfWeek: 0, openTime: '00:00', closeTime: '00:00', isClosed: true }, // Sunday
  { dayOfWeek: 1, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Monday
  { dayOfWeek: 2, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Tuesday
  { dayOfWeek: 3, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Wednesday
  { dayOfWeek: 4, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Thursday
  { dayOfWeek: 5, openTime: '09:00', closeTime: '20:00', isClosed: false }, // Friday
  { dayOfWeek: 6, openTime: '09:00', closeTime: '20:00', isClosed: false }  // Saturday
];

export const TIME_SLOTS: string[] = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:10', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];
