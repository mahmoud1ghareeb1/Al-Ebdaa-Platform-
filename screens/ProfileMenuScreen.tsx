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
import { useTheme, toggleTheme } from '../hooks/useTheme';
import Avatar from '../components/Avatar';
import ConfirmationModal from '../components/ConfirmationModal';


interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: View) => void;
}

const ThemeToggle: React.FC = () => {
    const theme = useTheme();

    return (
        <div className="flex items-center space-x-2 space-x-reverse">
            <SunIcon className={`w-6 h-6 transition-colors ${theme === 'light' ? 'text-amber-500' : 'text-slate-500'}`} />
            <button
                onClick={toggleTheme}
                className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                aria-label="Toggle dark mode"
            >
                <span
                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
                />
            </button>
             <MoonIcon className={`w-6 h-6 transition-colors ${theme === 'dark' ? 'text-blue-500' : 'text-slate-500'}`} />
        </div>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 relative flex flex-col items-center space-y-4">
              <button onClick={onClose} className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  <XIcon />
              </button>
              <div className="border-4 border-slate-200 dark:border-slate-800 rounded-full overflow-hidden">
                <Avatar src={profile?.avatar_url} name={profile?.full_name} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{profile?.full_name || '...'}</h2>
              
              <div className="w-full space-y-2 pt-4">
                  {menuItems.map(item => (
                      <button 
                          key={item.label}
                          onClick={() => setActiveView(item.view)}
                          className={`w-full flex items-center justify-end space-x-3 space-x-reverse text-right p-3 rounded-lg font-semibold transition-colors ${item.highlight ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
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

               <div className="flex items-center justify-center w-full pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
                  <ThemeToggle />
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileMenuScreen;
