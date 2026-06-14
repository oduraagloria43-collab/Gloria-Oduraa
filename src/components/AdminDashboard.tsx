/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, User, Scissors, Landmark, Star, Plus, Shield, CheckCircle, 
  Trash2, Mail, MessageSquare, Database, FileCode2, Copy, BarChart3, TrendingUp, Settings,
  Download
} from 'lucide-react';
import { DashboardStats, Service, Stylist, Notification, Booking, Payment } from '../types';

export default function AdminDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'services' | 'stylists' | 'notifications' | 'schema'>('analytics');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // DDL script copy state
  const [schemaText, setSchemaText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  // New Service Forms
  const [newSName, setNewSName] = useState<string>('');
  const [newSDesc, setNewSDesc] = useState<string>('');
  const [newSPrice, setNewSPrice] = useState<number>(100);
  const [newSDuration, setNewSDuration] = useState<number>(45);
  const [newSCat, setNewSCat] = useState<string>('Haircut');
  const [newSImg, setNewSImg] = useState<string>('');

  // New Stylist Forms
  const [newStName, setNewStName] = useState<string>('');
  const [newStBio, setNewStBio] = useState<string>('');
  const [newStSpecialty, setNewStSpecialty] = useState<string>('');
  const [newStAvatar, setNewStAvatar] = useState<string>('');

  const fetchAdminData = () => {
    setLoading(true);
    const statsPromise = fetch('/api/admin/analytics').then(res => res.json());
    const servicesPromise = fetch('/api/services').then(res => res.json());
    const stylistsPromise = fetch('/api/stylists').then(res => res.json());
    const notifsPromise = fetch('/api/notifications').then(res => res.json());
    const schemaPromise = fetch('/api/admin/sql-schema').then(res => res.text());

    Promise.all([statsPromise, servicesPromise, stylistsPromise, notifsPromise, schemaPromise])
      .then(([sts, srvs, stls, ntfs, sch]) => {
        setStats(sts);
        setServices(srvs);
        setStylists(stls);
        setNotifications(ntfs.sort((a: Notification, b: Notification) => b.sentAt.localeCompare(a.sentAt)));
        setSchemaText(sch);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin panels data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSName || !newSPrice) return;
    
    const payload = {
      name: newSName,
      description: newSDesc,
      price: newSPrice,
      duration: newSDuration,
      category: newSCat,
      imageUrl: newSImg || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600'
    };

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to append luxury service record.');

      const created: Service = await res.json();
      setServices(prev => [...prev, created]);
      
      // Clear forms
      setNewSName('');
      setNewSDesc('');
      setNewSPrice(100);
      setNewSDuration(45);
      setNewSImg('');
      
      alert(`Success: ${created.name} registered inside booking catalog.`);
      fetchAdminData(); // sync stats analytics
    } catch (err) {
      console.error(err);
      alert('Fail: Could not submit service creation.');
    }
  };

  const handleDeleteService = async (sid: string) => {
    if (!window.confirm('Delete this service? Customers will no longer be able to schedule it.')) {
      return;
    }

    try {
      const res = await fetch(`/api/services/${sid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error processing service deletion.');

      setServices(prev => prev.filter(s => s.id !== sid));
      alert('Service removed successfully.');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Could not remove service. Relational constraints may apply.');
    }
  };

  const handleCreateStylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStName || !newStSpecialty) return;

    const payload = {
      name: newStName,
      bio: newStBio || 'Vetted hair stylist specialist and aesthetic consultant.',
      specialties: [newStSpecialty],
      avatarUrl: newStAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=30 w=150'
    };

    try {
      const res = await fetch('/api/stylists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error recruiting stylist.');

      const created: Stylist = await res.json();
      setStylists(prev => [...prev, created]);

      setNewStName('');
      setNewStBio('');
      setNewStSpecialty('');
      setNewStAvatar('');

      alert(`Success: ${created.name} onboarded into salon staff roster.`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Fail: Unable recruit stylist.');
    }
  };

  const handleToggleStylistAvailability = async (id: string, currentlyAvailable: boolean) => {
    try {
      const res = await fetch(`/api/stylists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentlyAvailable })
      });
      if (!res.ok) throw new Error('Error toggling availability.');

      const updated: Stylist = await res.json();
      setStylists(prev => prev.map(s => s.id === id ? { ...s, isAvailable: updated.isAvailable } : s));
      alert(`Stylist status set to: ${updated.isAvailable ? 'AVAILABLE' : 'BLOCKED/ON VACATION'}`);
    } catch (err) {
      console.error(err);
      alert('Fail: Could not toggle stylist status.');
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/payments')
      ]);

      if (!bookingsRes.ok || !paymentsRes.ok) {
        throw new Error('Failed to retrieve server data for report.');
      }

      const bookings: Booking[] = await bookingsRes.json();
      const payments: Payment[] = await paymentsRes.json();

      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const currentMonthName = monthNames[now.getMonth()];

      const monthlyBookings = bookings.filter(b => b.date.startsWith(currentYearMonth));

      const escapeCSV = (val: any) => {
        if (val === undefined || val === null) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = [
        'Appointment ID',
        'Date',
        'Time Slot',
        'Booking Type',
        'Home Address',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Service Requested',
        'Service Price (GHS)',
        'Expert Stylist',
        'Booking Status',
        'Payment Method',
        'Payment Status',
        'Transaction Ref',
        'Receipt Number',
        'Revenue Contribution (GHS)'
      ];

      const csvRows = [headers.join(',')];

      for (const bk of monthlyBookings) {
        const payment = payments.find(p => p.bookingId === bk.id || (bk.paymentId && p.id === bk.paymentId));
        const isPaid = payment && payment.status === 'completed';
        const isConfirmedOrCompleted = bk.status === 'confirmed' || bk.status === 'completed';
        const revenueVal = isPaid ? payment.amount : (isConfirmedOrCompleted ? bk.servicePrice : 0);

        const row = [
          bk.id,
          bk.date,
          bk.timeSlot,
          bk.bookingType || 'Walk-In',
          bk.homeServiceAddress || '',
          bk.customerName,
          bk.customerEmail,
          bk.customerPhone,
          bk.serviceName,
          bk.servicePrice,
          bk.stylistName,
          bk.status,
          payment ? payment.paymentMethod : 'N/A',
          payment ? payment.status : 'N/A',
          payment ? payment.transactionRef : 'N/A',
          payment ? payment.receiptNumber : 'N/A',
          revenueVal
        ];

        csvRows.push(row.map(escapeCSV).join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `princess-burland-report-${currentMonthName.toLowerCase()}-${now.getFullYear()}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV Export Error:', err);
      alert('Princess Burland Alert: Unable to compile or export CSV ledger reports.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title with administrator shield */}
      <div className="bg-black/40 border border-amber-500/15 p-6 rounded-3xl flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="bg-gradient-to-tr from-amber-500 to-amber-200 text-black p-3 rounded-2xl">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-mono">Administration Suite</span>
            <h2 className="text-2xl font-black text-white mt-1">Princess Burland HQ Control</h2>
          </div>
        </div>

        {/* Command Sub tabs controllers */}
        <div className="hidden lg:flex bg-neutral-900/60 p-1 rounded-xl border border-neutral-800">
          {[
            { id: 'analytics', label: 'Dashboard Stats', icon: BarChart3 },
            { id: 'services', label: 'Services Catalogue', icon: Scissors },
            { id: 'stylists', label: 'Stylist Roster', icon: User },
            { id: 'notifications', label: 'Outbox Logs', icon: Mail },
            { id: 'schema', label: 'SQL Export', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  activeSubTab === tab.id 
                    ? 'bg-amber-400 text-black font-black font-extrabold shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile subtabs */}
      <div className="lg:hidden flex space-x-1.5 overflow-x-auto pb-1 select-none">
        {[
          { id: 'analytics', label: 'Stats' },
          { id: 'services', label: 'Services' },
          { id: 'stylists', label: 'Stylists' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'schema', label: 'Postgres SQL' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
              activeSubTab === tab.id ? 'bg-amber-400 text-black' : 'bg-neutral-900 text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-4 font-mono">Syncing analytics database...</p>
        </div>
      ) : (
        <div>
          {/* -----------------------------------------------------------
              1. ANALYTICS & REVENUE GRAPHS
             ----------------------------------------------------------- */}
          {activeSubTab === 'analytics' && stats && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Monthly Ledger Export Panel */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/40 border border-neutral-900 p-5 rounded-2xl gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono text-amber-400">Monthly Ledger Export</h3>
                  <p className="text-gray-400 text-xs mt-1">Export current month's detailed appointments and associated revenue figures directly to a clean CSV file.</p>
                </div>
                <button
                  id="btn-admin-export-csv"
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-black text-xs font-black uppercase tracking-widest rounded-xl disabled:opacity-50 flex items-center justify-center transition cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  {exporting ? 'Compiling CSV...' : 'Export Month Ledger CSV'}
                </button>
              </div>

              {/* Counter Badges KPI */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/40 border border-neutral-900 rounded-2xl p-5 text-center hover:border-amber-500/10 transition">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block font-mono">Total Bookings</span>
                  <span className="text-3xl font-black text-white font-mono block mt-2">{stats.totalAppointments}</span>
                  <span className="text-[9px] text-green-500 mt-1 font-semibold flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +14.5% This Week
                  </span>
                </div>

                <div className="bg-black/40 border border-neutral-900 rounded-2xl p-5 text-center hover:border-amber-500/10 transition">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block font-mono">Total Clients</span>
                  <span className="text-3xl font-black text-amber-400 font-mono block mt-2">{stats.totalCustomers}</span>
                  <span className="text-[9px] text-zinc-500 mt-1 font-mono uppercase">RETENTION CAP</span>
                </div>

                <div className="bg-black/40 border border-neutral-900 rounded-2xl p-5 text-center hover:border-amber-500/10 transition">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block font-mono">Gross Revenues</span>
                  <span className="text-3xl font-black text-amber-300 font-mono block mt-2">GHS {stats.totalRevenue}</span>
                  <span className="text-[9px] text-green-400 mt-1 font-semibold flex items-center justify-center">
                    Simulated Momo Cleared
                  </span>
                </div>

                <div className="bg-black/40 border border-neutral-900 rounded-2xl p-5 text-center hover:border-amber-500/10 transition">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block font-mono">Average Satisfaction</span>
                  <span className="text-3xl font-black text-amber-400 font-mono block mt-2 flex items-center justify-center">
                    4.9 <Star className="w-5 h-5 fill-amber-400 text-amber-400 ml-1.5" />
                  </span>
                  <span className="text-[9px] text-zinc-500 mt-1 font-mono uppercase">140+ Client feedbacks</span>
                </div>
              </div>

              {/* Dynamic Responsive SVG-based executive dashboard charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Chart A: Daily Booking volumes / Revenue trend lines */}
                <div className="bg-black/40 border border-neutral-900 p-6 rounded-3xl space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-mono">Income Revenue Curves (Past 10 Days)</h4>
                  
                  {/* SVG Line Graph */}
                  <div className="h-60 relative w-full pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="#1c1917" strokeDasharray="3,3" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="#1c1917" strokeDasharray="3,3" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="#1c1917" strokeDasharray="3,3" />
                      
                      {/* Curve Line for daily bookings revenue */}
                      <path
                        d="M 10,180 Q 80,110 150,140 T 300,70 T 450,40 T 490,20"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="animate-draw-line"
                      />
                      
                      {/* Gradient flow under curve */}
                      <path
                        d="M 10,180 Q 80,110 150,140 T 300,70 T 450,40 T 490,20 L 490,200 L 10,200 Z"
                        fill="url(#goldGradient)"
                        opacity="0.08"
                      />

                      {/* Defs block */}
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#121212" />
                        </linearGradient>
                      </defs>

                      {/* Highlights */}
                      <circle cx="150" cy="140" r="4.5" fill="#f59e0b" />
                      <circle cx="300" cy="70" r="4.5" fill="#f59e0b" />
                      <circle cx="490" cy="20" r="5" fill="#34d399" />
                    </svg>

                    {/* Value indicators */}
                    <div className="absolute top-2 right-4 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      GHS {stats.totalRevenue} PEAK
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono uppercase">
                    <span>June 1</span>
                    <span>June 4</span>
                    <span>June 7</span>
                    <span>Today (June 10)</span>
                  </div>
                </div>

                {/* Chart B: Category Share percentages / Bar histograms */}
                <div className="bg-black/40 border border-neutral-900 p-6 rounded-3xl space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-mono">Popular Services Demand share</h4>

                  <div className="space-y-3 pt-2">
                    {stats.popularServices.slice(0, 5).map((srv, idx) => {
                      const maxCount = stats.popularServices[0]?.count || 1;
                      const percentage = Math.round((srv.count / maxCount) * 100);
                      
                      return (
                        <div key={srv.serviceName} className="space-y-1.5 text-xs">
                          <div className="flex justify-between font-medium">
                            <span className="text-white font-bold">{srv.serviceName}</span>
                            <span className="text-amber-400 font-mono font-bold">{srv.count} sessions</span>
                          </div>
                          <div className="w-full bg-neutral-900/50 h-3 rounded-full overflow-hidden border border-neutral-900/40">
                            <div 
                              className="bg-amber-400 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Therapist Stylist productivity ranks */}
              <div className="bg-black/40 border border-neutral-900 p-6 rounded-3xl">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest font-mono mb-4">Therapists Productivity Leaderboards</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.topStylists.map((sty) => (
                    <div key={sty.stylistName} className="p-4 bg-black rounded-2xl border border-neutral-950 flex flex-col justify-between">
                      <h5 className="font-bold text-white text-sm">{sty.stylistName}</h5>
                      <div className="flex justify-between items-center mt-3 text-xs">
                        <span className="text-zinc-500 font-mono">Appointments:</span>
                        <span className="font-extrabold text-amber-400 font-mono">{sty.count}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-zinc-500 font-mono">Feedback Rating:</span>
                        <span className="text-amber-400 font-bold font-mono">★ {sty.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* -----------------------------------------------------------
              2. SERVICES CRUD CATALOGUE
             ----------------------------------------------------------- */}
          {activeSubTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              {/* Form to create service */}
              <div className="lg:col-span-4 bg-black/60 border border-neutral-900 rounded-3xl p-6 h-fit">
                <h3 className="text-base font-bold text-white uppercase tracking-widest font-mono mb-4">Register New Service</h3>
                
                <form onSubmit={handleCreateService} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Service Name</label>
                    <input 
                      type="text" required value={newSName} onChange={(e) => setNewSName(e.target.value)}
                      placeholder="e.g. Traditional Twist Braids"
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Category</label>
                    <select 
                      value={newSCat} onChange={(e) => setNewSCat(e.target.value)}
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="Hair Braiding">Hair Braiding</option>
                      <option value="Hair Treatment">Hair Treatment</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Price (GHS)</label>
                      <input 
                        type="number" required value={newSPrice} onChange={(e) => setNewSPrice(Number(e.target.value))}
                        className="w-full bg-black border border-neutral-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Duration (Mins)</label>
                      <input 
                        type="number" required value={newSDuration} onChange={(e) => setNewSDuration(Number(e.target.value))}
                        className="w-full bg-black border border-neutral-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Description</label>
                    <textarea 
                      value={newSDesc} onChange={(e) => setNewSDesc(e.target.value)}
                      placeholder="Luxurious service details..."
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Unsplash/CDN Image URL</label>
                    <input 
                      type="text" value={newSImg} onChange={(e) => setNewSImg(e.target.value)}
                      placeholder="https://images.unsplash.com/photo..."
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <button
                    id="btn-admin-submit-service"
                    type="submit"
                    className="w-full py-2.5 bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-amber-500 transition cursor-pointer"
                  >
                    Add Service
                  </button>
                </form>
              </div>

              {/* Service list overview with deletion action */}
              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-base font-bold text-gray-400 uppercase tracking-widest font-mono pb-1 border-b border-neutral-900">Catalogue Management ({services.length} registered entries)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(s => (
                    <div key={s.id} className="p-4 bg-black/40 rounded-2xl border border-neutral-900 flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-amber-500/10 border border-amber-500/15 text-amber-500 px-2 py-0.5 rounded uppercase font-mono font-bold tracking-wider">{s.category}</span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{s.name}</h4>
                        <div className="flex space-x-2.5 pt-1 text-[11px] font-mono font-medium text-gray-400">
                          <span>GHS {s.price}</span>
                          <span className="text-zinc-700">|</span>
                          <span>{s.duration} Mins</span>
                        </div>
                      </div>
                      <button 
                        id={`btn-delete-srv-${s.id}`}
                        onClick={() => handleDeleteService(s.id)}
                        className="p-1.5 bg-neutral-950 hover:bg-red-950/20 text-neutral-600 hover:text-red-400 rounded-lg Transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------
              3. STYLIST ROSTER LIST MANAGERS
             ----------------------------------------------------------- */}
          {activeSubTab === 'stylists' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Form to Recruit Stylist */}
              <div className="lg:col-span-4 bg-black/60 border border-neutral-900 rounded-3xl p-6 h-fit">
                <h3 className="text-base font-bold text-white uppercase tracking-widest font-mono mb-4">Recruit Stylist Expert</h3>
                
                <form onSubmit={handleCreateStylist} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Full Name</label>
                    <input 
                      type="text" required value={newStName} onChange={(e) => setNewStName(e.target.value)}
                      placeholder="e.g. Adwoa Osei"
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Primary Specialty (Service category name)</label>
                    <input 
                      type="text" required value={newStSpecialty} onChange={(e) => setNewStSpecialty(e.target.value)}
                      placeholder="e.g. Hair Braiding or Nails"
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Specialist Bio</label>
                    <textarea 
                      value={newStBio} onChange={(e) => setNewStBio(e.target.value)}
                      placeholder="Therapist personal alignment bio..."
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400 min-h-[85px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Avatar Image URL</label>
                    <input 
                      type="text" value={newStAvatar} onChange={(e) => setNewStAvatar(e.target.value)}
                      placeholder="https://images.unsplash.com/photo..."
                      className="w-full bg-black border border-neutral-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <button
                    id="btn-submit-recruit-stylist"
                    type="submit"
                    className="w-full py-2.5 bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-amber-500 transition cursor-pointer"
                  >
                    Add Stylist
                  </button>
                </form>
              </div>

              {/* Stylists roster display and operational buttons */}
              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-base font-bold text-gray-400 uppercase tracking-widest font-mono pb-1 border-b border-neutral-900">Active Stylist Roster ({stylists.length} onboarded staff)</h3>

                <div className="space-y-3.5">
                  {stylists.map(sty => (
                    <div key={sty.id} className="p-4 bg-black/40 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={sty.avatarUrl} alt={sty.name} referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/20"
                        />
                        <div>
                          <h4 className="font-bold text-white text-base">{sty.name}</h4>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold font-mono mt-0.5">Rating: ★ {sty.rating} ({sty.reviewsCount} reviews)</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {sty.specialties.map(spec => (
                              <span key={spec} className="bg-neutral-900 text-gray-300 text-[9px] font-semibold px-2 py-0.5 rounded border border-neutral-950">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 self-end sm:self-auto">
                        <span className={`px-2 py-1 rounded text-[10px] font-mono tracking-wider font-bold ${
                          sty.isAvailable ? 'text-green-400 bg-green-500/5' : 'text-red-400 bg-red-500/5'
                        }`}>
                          {sty.isAvailable ? 'ACTIVE AVAILABLE' : 'VACATION BLOCK'}
                        </span>

                        <button
                          id={`btn-toggle-availability-${sty.id}`}
                          onClick={() => handleToggleStylistAvailability(sty.id, sty.isAvailable)}
                          className="px-3 py-1.5 bg-neutral-900 text-[10px] text-gray-300 font-bold uppercase rounded-lg border border-neutral-800 hover:text-white transition"
                        >
                          Toggle Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* -----------------------------------------------------------
              4. NOTIFICATIONS OUTBOX AUDIT LOGS
             ----------------------------------------------------------- */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-amber-500 uppercase tracking-widest font-mono">Simulated Platform Message Outbox Logs</h3>
                <p className="text-gray-400 text-xs mt-0.5">Live monitoring audits of client/therapist Twilio SMS and SMTP alerts logs issued during transactions.</p>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-gray-600 italic">Outbox transactions are currently clear.</p>
              ) : (
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                  {notifications.map(notf => (
                    <div key={notf.id} className="p-4 bg-black/40 border border-neutral-900 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold rounded ${
                            notf.type === 'sms' ? 'bg-amber-400 text-black' : 'bg-neutral-900 text-amber-400'
                          }`}>
                            {notf.type.toUpperCase()}
                          </span>
                          <span className="text-gray-400">Recipient: <b>{notf.recipient}</b></span>
                        </div>
                        <span className="text-gray-500 font-mono text-[10px]">{new Date(notf.sentAt).toLocaleTimeString()}</span>
                      </div>

                      <h4 className="text-sm font-bold text-white tracking-tight">{notf.title}</h4>
                      <p className="text-zinc-400 text-xs italic leading-relaxed bg-black p-3 rounded-xl border border-neutral-950">"{notf.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -----------------------------------------------------------
              5. SUPABASE POSTGRESQL RELATIONAL SQL EXPORTER
             ----------------------------------------------------------- */}
          {activeSubTab === 'schema' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center">
                    <Database className="w-5 h-5 text-amber-400 mr-2" /> Supabase Relational Schema Exporter
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">Ready-to-run DDL copy code script containing users, stylists, services, bookings, payments and relational indexes constraints.</p>
                </div>
                
                <button
                  id="btn-copy-postgresql-schema"
                  onClick={handleCopySchema}
                  className="px-4 py-2 bg-amber-400 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 cursor-pointer flex items-center transition"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
                </button>
              </div>

              {/* Ready DDL View Code container */}
              <div className="relative bg-black rounded-3xl border border-neutral-900 overflow-hidden">
                <div className="bg-neutral-950 px-4 py-2.5 text-xs text-gray-500 font-mono flex items-center justify-between border-b border-neutral-900">
                  <span>Supabase_Schema_Generate.sql</span>
                  <span className="text-green-500 font-bold uppercase tracking-wider">PostgreSQL v15</span>
                </div>
                <pre className="p-5 text-[11px] text-amber-500/80 font-mono leading-relaxed overflow-x-auto overflow-y-auto max-h-[380px]">
                  <code>{schemaText}</code>
                </pre>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
