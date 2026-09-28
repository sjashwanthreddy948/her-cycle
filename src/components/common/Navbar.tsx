import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Calendar as CalendarIcon, 
  PlusCircle, 
  BarChart3, 
  User, 
  HeartHandshake 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isPartner = user.role === 'partner';

  interface NavItem {
    to: string;
    label: string;
    icon: typeof Home;
    isMain?: boolean;
  }

  const womanLinks: NavItem[] = [
    { to: '/woman/home', label: 'Home', icon: Home },
    { to: '/woman/calendar', label: 'Calendar', icon: CalendarIcon },
    { to: '/woman/log', label: 'Log', icon: PlusCircle, isMain: true },
    { to: '/woman/insights', label: 'Insights', icon: BarChart3 },
    { to: '/woman/profile', label: 'Profile', icon: User },
  ];

  const partnerLinks: NavItem[] = [
    { to: '/partner/home', label: 'Home', icon: Home },
    { to: '/partner/calendar', label: 'Calendar', icon: CalendarIcon },
    { to: '/partner/support', label: 'Support', icon: HeartHandshake },
    { to: '/partner/profile', label: 'Profile', icon: User },
  ];

  const links = isPartner ? partnerLinks : womanLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-rose-100 shadow-[0_-4px_20px_rgba(244,63,94,0.06)] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isMain = link.isMain;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center relative py-1 px-3 rounded-2xl transition-all duration-200 select-none
                ${isActive 
                  ? 'text-rose-500 font-semibold' 
                  : 'text-gray-400 hover:text-gray-600 font-medium'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isMain ? (
                    <div className={`
                      -mt-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95
                      ${isActive 
                        ? 'bg-rose-500 text-white shadow-rose-300 ring-4 ring-[#FFF5F7]' 
                        : 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'
                      }
                    `}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                  ) : (
                    <div className="relative p-1">
                      <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                    </div>
                  )}
                  <span className={`text-[11px] mt-0.5 tracking-tight ${isMain ? 'font-semibold text-rose-500' : ''}`}>
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
