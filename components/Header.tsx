import React from 'react';
import MenuIcon from './icons/MenuIcon';
import { useTheme, toggleTheme } from '../hooks/useTheme';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const theme = useTheme();

  return (
    <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-20 w-full mx-auto border-b border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-3 items-center p-4 h-16 px-4 md:px-6">
        <div className="flex justify-start">
            <button onClick={onMenuClick} className="text-slate-700 dark:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <MenuIcon />
            </button>
        </div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 text-center truncate">{title}</h1>
        <div className="flex justify-end">
            <button 
                onClick={toggleTheme} 
                className="text-slate-700 dark:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? 
                    <SunIcon className="w-6 h-6 text-amber-400" /> : 
                    <MoonIcon className="w-6 h-6 text-slate-700" />
                }
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
