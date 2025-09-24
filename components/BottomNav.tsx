import React from 'react';
import HomeIcon from './icons/HomeIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import PlayIcon from './icons/PlayIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import UserCircleIcon from './icons/UserCircleIcon';
import type { View } from '../types';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'home', icon: HomeIcon, label: 'الرئيسية' },
    { id: 'exams', icon: ClipboardListIcon, label: 'الاختبارات' },
    { id: 'lectures', icon: PlayIcon, label: 'المحاضرات' },
    { id: 'grades', icon: ChartBarIcon, label: 'النتائج' },
    { id: 'account', icon: UserCircleIcon, label: 'حسابي' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-20 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`flex flex-col items-center justify-center text-center w-full transition-colors duration-200 group ${
                isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
              }`}
            >
              <item.icon className="w-7 h-7 mb-1" filled={isActive} />
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;