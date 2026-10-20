import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Gem, Crown, Users, User as UserIcon } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { currentRoute, navigateTo, t, tasksRemainingToday } = useApp();

  const tabs = [
    {
      id: '/pages/index/index',
      label: t.tabs.home || 'Mina',
      icon: Home,
    },
    {
      id: '/pages/tasks/index',
      label: 'Lucro 24h',
      icon: Gem,
    },
    {
      id: '/pages/vip/index',
      label: 'Planos VIP',
      icon: Crown,
    },
    {
      id: '/pages/team/index',
      label: t.tabs.team || 'Equipe',
      icon: Users,
    },
    {
      id: '/pages/mine/index',
      label: t.tabs.mine || 'Cofre',
      icon: UserIcon,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-2 py-2 flex items-center justify-around shadow-lg">
      {tabs.map(tab => {
        const isActive = currentRoute === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-all duration-200 ${
              isActive ? 'text-sky-600 scale-105' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span
              className={`text-[10px] mt-1 transition-colors ${
                isActive ? 'text-sky-700 font-black' : 'text-slate-500 font-semibold'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full shadow-xs" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
