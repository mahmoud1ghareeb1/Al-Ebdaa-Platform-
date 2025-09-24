import React from 'react';
import MenuIcon from './icons/MenuIcon';
import { useTheme } from '../ThemeContext';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20 w-full mx-auto border-b border-zinc-200 dark:border-zinc-800">
      <div className="grid grid-cols-3 items-center p-4 h-16 px-4 md:px-6">
        <div className="flex justify-start">
            <button onClick={onMenuClick} className="text-zinc-700 dark:text-zinc-300 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Open menu">
                <MenuIcon />
            </button>
        </div>
        <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 text-center truncate">{title}</h1>
        <div className="flex justify-end">
            <button 
                onClick={toggleTheme} 
                className="text-zinc-700 dark:text-zinc-300 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? 
                    <SunIcon className="w-6 h-6 text-amber-400" /> : 
                    <MoonIcon className="w-6 h-6 text-zinc-700" />
                }
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;