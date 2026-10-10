import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  QrCode,
  Users,
  Award,
  Sparkles,
  Shield,
  Layers,
  HelpCircle,
  Menu,
  X,
  UserCheck,
  Zap,
  Mail,
  ChevronDown,
  History,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCreateEvent?: () => void;
  onOpenAuthModal?: (role?: 'student' | 'organizer') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreateEvent,
  onOpenAuthModal
}) => {
  const { user, usersList, role, switchUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItemClass = (tabName: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
      currentTab === tabName
        ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
                  Event<span className="text-cyan-400">Ease</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-medium tracking-wider uppercase">
                  College Operations Platform
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button onClick={() => setCurrentTab('events')} className={navItemClass('events')}>
              <Calendar className="w-4 h-4" />
              Discover Events
            </button>

            {/* Student specific */}
            <button onClick={() => setCurrentTab('student-registrations')} className={navItemClass('student-registrations')}>
              <QrCode className="w-4 h-4" />
              My Tickets
            </button>
            <button onClick={() => setCurrentTab('student-certificates')} className={navItemClass('student-certificates')}>
              <Award className="w-4 h-4" />
              Certificates
            </button>

            {/* Organizer & Admin items */}
            {(role === 'organizer' || role === 'admin') && (
              <>
                <div className="h-4 w-px bg-slate-800 mx-1" />
                <button onClick={() => setCurrentTab('organizer-dashboard')} className={navItemClass('organizer-dashboard')}>
                  <Layers className="w-4 h-4" />
                  Organizer Hub
                </button>
                <button onClick={() => setCurrentTab('scanner')} className={navItemClass('scanner')}>
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Live Scanner</span>
                </button>
                <button onClick={() => setCurrentTab('checkin-history')} className={navItemClass('checkin-history')}>
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>Scan History</span>
                </button>
                <button onClick={() => setCurrentTab('outbox')} className={navItemClass('outbox')}>
                  <Mail className="w-4 h-4" />
                  Outbox & Logs
                </button>
              </>
            )}

            {/* Admin only */}
            {role === 'admin' && (
              <button onClick={() => setCurrentTab('admin-portal')} className={navItemClass('admin-portal')}>
                <Shield className="w-4 h-4 text-amber-400" />
                Admin & Integrations
              </button>
            )}

            <button onClick={() => setCurrentTab('help')} className={navItemClass('help')}>
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
          </nav>

          {/* User Profile & Demo Persona Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-all text-left text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 font-bold border border-slate-700">
                  {user?.name.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-white leading-tight flex items-center gap-1.5">
                    {user?.name || 'Guest User'}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        role === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : role === 'organizer'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user?.email}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200">Switch Test Persona</p>
                    <p className="text-[10px] text-slate-400">Instantly test student, organizer, or admin experience</p>
                  </div>
                  <div className="py-1">
                    {usersList.slice(0, 5).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                          user?.id === u.id ? 'bg-cyan-500/15 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.department || u.email}</p>
                        </div>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300'
                              : u.role === 'organizer'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenAuthModal?.('student');
                      }}
                      className="w-full text-left py-1.5 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Student Sign-In Portal
                      </span>
                      <span className="text-[10px] text-cyan-400">Open →</span>
                    </button>

                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenAuthModal?.('organizer');
                      }}
                      className="w-full text-left py-1.5 px-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Organizer / Faculty Portal
                      </span>
                      <span className="text-[10px] text-purple-400">Open →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Switch Portal Button */}
            {role === 'student' ? (
              <button
                onClick={() => onOpenAuthModal?.('organizer')}
                className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-colors"
                title="Open Faculty & Organizer Portal"
              >
                <Shield className="w-3.5 h-3.5" />
                Organizer Portal
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal?.('student')}
                className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-colors"
                title="Switch to Student Attendee View"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student Portal
              </button>
            )}

            {/* Quick Action Button */}
            {(role === 'organizer' || role === 'admin') && onOpenCreateEvent && (
              <button
                onClick={onOpenCreateEvent}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all hover:scale-102"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                Create Event
              </button>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Flyout */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => {
              setCurrentTab('events');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            Discover Events
          </button>
          <button
            onClick={() => {
              setCurrentTab('student-registrations');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            My QR Tickets
          </button>
          <button
            onClick={() => {
              setCurrentTab('student-certificates');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            My Certificates
          </button>

          {(role === 'organizer' || role === 'admin') && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('organizer-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-cyan-300 hover:bg-slate-900"
              >
                Organizer Hub
              </button>
              <button
                onClick={() => {
                  setCurrentTab('scanner');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-emerald-400 hover:bg-slate-900"
              >
                Live QR Scanner
              </button>
              <button
                onClick={() => {
                  setCurrentTab('checkin-history');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-cyan-300 hover:bg-slate-900"
              >
                Check-In History Log
              </button>
              <button
                onClick={() => {
                  setCurrentTab('outbox');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Outbox & Delivery Logs
              </button>
            </>
          )}

          {role === 'admin' && (
            <button
              onClick={() => {
                setCurrentTab('admin-portal');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-amber-400 hover:bg-slate-900"
            >
              Admin & Integrations
            </button>
          )}

          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-400 mb-2 font-semibold">Active Persona: {user?.name} ({role})</p>
            <div className="grid grid-cols-3 gap-1">
              {usersList.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-[11px] p-1.5 rounded-lg border text-center font-medium ${
                    user?.id === u.id ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {u.role.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
