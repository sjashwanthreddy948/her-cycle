import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { db } from '../../lib/db';
import { AppNotification } from '../../types/database';
import { 
  Heart, 
  ChevronDown, 
  User, 
  Settings, 
  Shield, 
  Key, 
  HeartHandshake, 
  LogOut, 
  Bell, 
  Check, 
  Sparkles,
  Calendar,
  BarChart3,
  BookOpen,
  PlusCircle
} from 'lucide-react';

export const DesktopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const { partnerLink } = useCycle();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    async function loadNotifs() {
      try {
        const list = await db.getNotifications(user!.id);
        setNotifications(list);
      } catch (e) {
        console.debug('Error loading notifications:', e);
      }
    }
    loadNotifs();
    const interval = setInterval(loadNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const isPartner = user.role === 'partner';
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await db.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const womanNavItems = [
    { label: 'Home', path: '/woman/home' },
    { label: 'Calendar', path: '/woman/calendar' },
    { label: 'Track', path: '/woman/log' },
    { label: 'Insights', path: '/woman/insights' },
    { label: 'Partner', path: '/woman/partner' },
    { label: 'Resources', path: '/woman/phases' },
  ];

  const partnerNavItems = [
    { label: 'Home', path: '/partner/home' },
    { label: 'Calendar', path: '/partner/calendar' },
    { label: 'Support', path: '/partner/support' },
    { label: 'Profile', path: '/partner/profile' },
  ];

  const navItems = isPartner ? partnerNavItems : womanNavItems;

  return (
    <header className="sticky top-4 z-50 w-full px-4 mb-4 select-none">
      <div className="max-w-5xl mx-auto bg-black/95 backdrop-blur-xl text-white rounded-full px-4 sm:px-6 py-2.5 shadow-2xl border border-white/10 flex items-center justify-between transition-all">
        
        {/* Left: Brand Logo + Menstrual/Wellness Icon */}
        <div 
          onClick={() => navigate(isPartner ? '/partner/home' : '/woman/home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-rose-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-base tracking-tight font-display text-white">
              Her<span className="text-rose-400">Cycle</span>
            </span>
            <span className="text-[10px] text-rose-300 font-medium hidden sm:inline tracking-wider uppercase">
              {isPartner ? 'Partner' : 'Sanctuary'}
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                  isActive 
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Notifications & Profile Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(prev => !prev)}
              className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-gray-900 rounded-3xl shadow-float border border-rose-100 p-4 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-xs text-gray-900">Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 py-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center italic">No new notifications</p>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-2.5 rounded-2xl hover:bg-rose-50/50 cursor-pointer transition ${!notif.read ? 'bg-rose-50/70 font-medium' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-gray-900">{notif.title}</p>
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{notif.body}</p>
                        <span className="text-[9px] text-gray-400 block mt-1">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile User Pill + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 transition border border-white/10 text-left group"
              aria-label="User menu"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-400"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-rose-500/80 text-white flex items-center justify-center text-xs font-bold">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
              )}
              <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden md:inline">
                {user.full_name.split(' ')[0]}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-3xl shadow-float border border-rose-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2.5 border-b border-gray-100 mb-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{user.full_name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                    {user.role}
                  </span>
                </div>

                <div className="space-y-0.5 text-xs font-medium text-gray-700">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(isPartner ? '/partner/profile' : '/woman/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition text-left"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(isPartner ? '/partner/profile' : '/woman/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition text-left"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/woman/privacy');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition text-left"
                  >
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span>Privacy & Data</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(isPartner ? '/partner/profile' : '/woman/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition text-left"
                  >
                    <Key className="w-4 h-4 text-gray-400" />
                    <span>Change Password</span>
                  </button>

                  {!isPartner && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/woman/partner');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition text-left"
                    >
                      <HeartHandshake className="w-4 h-4 text-gray-400" />
                      <span>Partner Sharing</span>
                    </button>
                  )}

                  <div className="pt-1 border-t border-gray-100 mt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-red-50 text-red-600 font-semibold transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
