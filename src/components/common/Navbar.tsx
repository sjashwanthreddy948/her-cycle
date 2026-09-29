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
    id: string;
    to: string;
    label: string;
    icon: typeof Home;
    isMain?: boolean;
  }

  const womanLinks: NavItem[] = [
    { id: 'nav-woman-home', to: '/woman/home', label: 'Home', icon: Home },
    { id: 'nav-woman-calendar', to: '/woman/calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'nav-woman-log', to: '/woman/log', label: 'Log', icon: PlusCircle, isMain: true },
    { id: 'nav-woman-insights', to: '/woman/insights', label: 'Insights', icon: BarChart3 },
    { id: 'nav-woman-profile', to: '/woman/profile', label: 'Profile', icon: User },
  ];

  const partnerLinks: NavItem[] = [
    { id: 'nav-partner-home', to: '/partner/home', label: 'Home', icon: Home },
    { id: 'nav-partner-calendar', to: '/partner/calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'nav-partner-support', to: '/partner/support', label: 'Support', icon: HeartHandshake },
    { id: 'nav-partner-profile', to: '/partner/profile', label: 'Profile', icon: User },
  ];

  const links = isPartner ? partnerLinks : womanLinks;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-rose-100 shadow-[0_-4px_25px_rgba(244,63,94,0.08)] pb-safe touch-manipulation pointer-events-auto"
    >
      <div className="max-w-md mx-auto grid grid-flow-col auto-cols-fr items-center px-1 sm:px-2 py-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isMain = link.isMain;

          return (
            <NavLink
              key={link.to}
              id={link.id}
              to={link.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center relative py-1 px-1 sm:px-2 rounded-2xl transition-all duration-200 select-none min-h-[52px]
                ${isActive 
                  ? 'text-rose-600 font-bold' 
                  : 'text-gray-400 hover:text-gray-700 font-medium'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isMain ? (
                    <div className={`
                      -mt-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90
                      ${isActive 
                        ? 'bg-rose-500 text-white shadow-rose-300 ring-4 ring-[#FFF5F7]' 
                        : 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'
                      }
                    `}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                  ) : (
                    <div className="relative p-0.5">
                      <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                    </div>
                  )}
                  <span className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate max-w-full text-center ${isMain ? 'font-bold text-rose-600' : ''}`}>
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
