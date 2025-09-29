import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SunIcon from '../components/icons/SunIcon';
import MoonIcon from '../components/icons/MoonIcon';
import { useTheme } from '../ThemeContext';
import { cacheGet, cacheSet } from '../lib/cache';

interface IntroScreenProps {
  onContinue: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onContinue }) => {
  const { theme, toggleTheme } = useTheme();
  const [count, setCount] = useState<number | null>(() => cacheGet<number>('students:count'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCount = async () => {
      try {
        setLoading(true);
        const { count, error } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
        if (error) throw error;
        if (typeof count === 'number') {
          setCount(count);
          cacheSet('students:count', count, 1000 * 60 * 60 * 24);
        }
      } catch (e) {
        console.error('Error fetching users count:', e);
      } finally {
        setLoading(false);
      }
    };
    if (count == null) loadCount();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={toggleTheme} className="text-zinc-700 dark:text-zinc-300 p-2 rounded-full bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" aria-label="Toggle theme">
          {theme === 'dark' ? <SunIcon className="w-6 h-6 text-amber-400" /> : <MoonIcon className="w-6 h-6 text-zinc-700" />}
        </button>
      </div>

      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg shadow-zinc-400/10 dark:shadow-blue-900/30">
        <div className="flex flex-col items-center gap-3 mb-4">
          <img src="https://cdn.builder.io/api/v1/image/assets%2F44ea46af043947d6ac3e6b970a38b3d7%2Fe5aa813644d74d0390e3497f36ad5e4f?format=png&width=96" alt="شعار منصة الإبداع" className="w-16 h-16 rounded-xl object-cover" />
          <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-200">منصة الإبداع</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-300 leading-7 mb-6">
          منصة تعليمية متكاملة تقدم محاضرات، اختبارات، متابعة نتائج ولوحة شرف.
          صُممت لتسهيل التعلم الذكي ومتابعة التقدم بطريقة بسيطة وسريعة.
        </p>
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-6 text-zinc-700 dark:text-zinc-200">
          <p className="text-sm">عدد الطلاب المسجلين</p>
          <p className="text-3xl font-extrabold mt-1">{loading && count == null ? '...' : (count ?? 0)}</p>
        </div>
        <button onClick={onContinue} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          ابدأ الآن
        </button>
      </div>
    </div>
  );
};

export default IntroScreen;
