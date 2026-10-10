import React, { useState } from 'react';
import { CollegeEvent, EventCategory, Registration, WaitlistEntry } from '../types';
import { EventCard } from '../components/EventCard';
import {
  Search,
  Filter,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Tag
} from 'lucide-react';

interface EventsPageProps {
  events: CollegeEvent[];
  myRegistrations: Registration[];
  myWaitlists: WaitlistEntry[];
  onViewDetails: (event: CollegeEvent) => void;
  onRegisterClick: (event: CollegeEvent) => void;
  onViewTicketClick: (reg: Registration) => void;
}

const CATEGORIES: Array<EventCategory | 'All Categories'> = [
  'All Categories',
  'Tech & Coding',
  'Academic & Seminar',
  'Cultural & Arts',
  'Workshop & Bootcamp',
  'Career & Networking'
];

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  myRegistrations,
  myWaitlists,
  onViewDetails,
  onRegisterClick,
  onViewTicketClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'slots' | 'popularity'>('date');

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || ev.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'open') {
      matchesStatus = ev.registeredCount < ev.capacity && ev.status !== 'cancelled' && ev.status !== 'completed';
    } else if (selectedStatus === 'waitlist') {
      matchesStatus = ev.registeredCount >= ev.capacity && ev.waitlistEnabled;
    } else if (selectedStatus === 'ongoing') {
      matchesStatus = ev.status === 'ongoing';
    } else if (selectedStatus === 'completed') {
      matchesStatus = ev.status === 'completed';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    if (sortBy === 'slots') {
      return (b.capacity - b.registeredCount) - (a.capacity - a.registeredCount);
    }
    if (sortBy === 'popularity') {
      return b.registeredCount - a.registeredCount;
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs uppercase tracking-widest font-extrabold text-cyan-400">
          Campus Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Explore College Events & Activities
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Browse upcoming academic conferences, hackathons, and cultural fests. Register to receive your instant digital pass.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by event title, hall, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status & Sort options */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Registration Open</option>
              <option value="waitlist">Waitlist Active</option>
              <option value="ongoing">Happening Now</option>
              <option value="completed">Past Events</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="date">Sort: Soonest Date</option>
              <option value="slots">Sort: Available Slots</option>
              <option value="popularity">Sort: Most Popular</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center text-slate-500">
          <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Events Match Your Filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try resetting your search query or selecting "All Categories" to view available campus listings.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const userReg = myRegistrations.find(
              (r) => r.eventId === event.id && r.status !== 'cancelled'
            );
            const userWaitlist = myWaitlists.find(
              (w) => w.eventId === event.id && w.status === 'waiting'
            );

            return (
              <EventCard
                key={event.id}
                event={event}
                userRegistration={userReg}
                userWaitlist={userWaitlist}
                onViewDetails={onViewDetails}
                onRegisterClick={onRegisterClick}
                onViewTicketClick={onViewTicketClick}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
