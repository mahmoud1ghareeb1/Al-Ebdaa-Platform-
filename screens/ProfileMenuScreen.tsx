import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import XIcon from '../components/icons/XIcon';
import HomeIcon from '../components/icons/HomeIcon';
import ClipboardListIcon from '../components/icons/ClipboardListIcon';
import PlayIcon from '../components/icons/PlayIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import TrophyIcon from '../components/icons/TrophyIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import SunIcon from '../components/icons/SunIcon';
import MoonIcon from '../components/icons/MoonIcon';
import type { View, StudentProfile } from '../types';
import { useTheme } from '../ThemeContext';
import Avatar from '../components/Avatar';
import ConfirmationModal from '../components/ConfirmationModal';


interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: View) => void;
}

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
            theme === 'dark' ? 'bg-blue-600' : 'bg-zinc-300'
            }`}
            aria-label="Toggle dark mode"
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none relative inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                theme === 'dark' ? '-translate-x-6' : 'translate-x-0'
                }`}
            >
                {/* Light mode icon container */}
                <span
                    className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ${
                    theme === 'light' ? 'opacity-100 ease-in' : 'opacity-0 ease-out'
                    }`}
                >
                    <SunIcon className="h-4 w-4 text-amber-500" />
                </span>
                {/* Dark mode icon container */}
                <span
                    className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ${
                    theme === 'dark' ? 'opacity-100 ease-in' : 'opacity-0 ease-out'
                    }`}
                >
                    <MoonIcon className="h-4 w-4 text-blue-600" />
                </span>
            </span>
        </button>
    );
};


const ProfileMenuScreen: React.FC<ProfileMenuProps> = ({ isOpen, onClose, setActiveView }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && !profile) {
      const fetchProfile = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (error) throw error;
          setProfile(data);
        } catch (error) {
          console.error("Error fetching profile for menu:", error);
        }
      };
      fetchProfile();
    }
  }, [isOpen, profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const menuItems = [
    { label: 'الصفحة الرئيسية', icon: HomeIcon, view: 'home' as View },
    { label: 'الاختبارات', icon: ClipboardListIcon, view: 'exams' as View },
    { label: 'المحاضرات', icon: PlayIcon, view: 'lectures' as View, highlight: true },
    { label: 'الدرجات والنتائج', icon: ChartBarIcon, view: 'grades' as View },
    { label: 'لوحة الشرف', icon: TrophyIcon, view: 'honorBoard' as View },
  ];

  if (!isOpen) return null;

  return (
    <>
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
        <div className="fixed inset-0 flex justify-center items-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 relative flex flex-col items-center space-y-4">
              <button onClick={onClose} className="absolute top-4 left-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                  <XIcon />
              </button>
              <div className="border-4 border-zinc-200 dark:border-zinc-700 rounded-full overflow-hidden">
                <Avatar src={profile?.avatar_url} name={profile?.full_name} />
              </div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{profile?.full_name || '...'}</h2>
              
              <div className="w-full space-y-2 pt-4">
                  {menuItems.map(item => (
                      <button 
                          key={item.label}
                          onClick={() => setActiveView(item.view)}
                          className={`w-full flex items-center justify-end space-x-3 space-x-reverse text-right p-3 rounded-lg font-semibold transition-colors ${item.highlight ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                      >
                         <span>{item.label}</span>
                         <item.icon className="w-6 h-6" />
                      </button>
                  ))}
              </div>

              <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-end space-x-3 space-x-reverse text-right p-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                 <span>تسجيل الخروج</span>
                 <LogoutIcon className="w-6 h-6" />
              </button>

               <div className="flex items-center justify-center w-full pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                  <ThemeToggle />
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileMenuScreen;