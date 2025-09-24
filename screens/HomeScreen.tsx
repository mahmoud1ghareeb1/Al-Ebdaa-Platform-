

import React, { useState, useEffect } from 'react';
import type { Lecture, View, StudentProfile } from '../types';
import { supabase } from '../lib/supabase';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import ClipboardListIcon from '../components/icons/ClipboardListIcon';
import CameraIcon from '../components/icons/CameraIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import TrophyIcon from '../components/icons/TrophyIcon';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import PlayIcon from '../components/icons/PlayIcon';
import { HomeScreenSkeleton } from '../components/Skeletons';


const HomeScreen: React.FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
  const [loading, setLoading] = useState(true);
  const [unwatchedLectures, setUnwatchedLectures] = useState<Lecture[]>([]);
  const [student, setStudent] = useState<(StudentProfile & {rank: number}) | null>(null);
  const [performancePercentage, setPerformancePercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        // Fetch lectures, views, profile, and rank
        const [lecturesRes, viewsRes, profileRes, honorBoardRes, totalStudentsRes] = await Promise.all([
            supabase.from('lectures').select('*').order('created_at', { ascending: false }).limit(4),
            supabase.from('lecture_views').select('lecture_id').eq('user_id', user.id),
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('honor_board').select('rank').eq('id', user.id).single(),
            supabase.from('profiles').select('id', { count: 'exact', head: true })
        ]);
        
        if (lecturesRes.error) throw lecturesRes.error;
        if (viewsRes.error) throw viewsRes.error;
        if (profileRes.error) throw profileRes.error;
        // A student might not be on the honor board, so honorBoardRes.error is not critical
        
        if (!profileRes.data) {
          throw new Error("Student profile not found.");
        }

        // Calculate unwatched lectures
        const watchedIds = new Set(viewsRes.data.map(v => v.lecture_id));
        const unwatched = lecturesRes.data.filter(lec => !watchedIds.has(lec.id));
        setUnwatchedLectures(unwatched);

        // Set student data, handling cases where rank might not exist
        const rank = honorBoardRes.data?.rank;
        setStudent({ ...profileRes.data, rank: rank ?? 0 });

        // Calculate performance percentage only if rank is available
        const totalStudents = totalStudentsRes.count ?? 1;
        if (rank && totalStudents > 0) {
          const percentage = Math.max(0, 100 - (((rank - 1) / totalStudents) * 100));
          setPerformancePercentage(Math.round(percentage));
        } else {
            setPerformancePercentage(0);
        }

      } catch (error) {
        console.error("Error fetching home screen data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const gridItems = [
    { label: 'الكتب والمذكرات', icon: BookOpenIcon, view: 'notes' as View },
    { label: 'الاختبارات', icon: ClipboardListIcon, view: 'exams' as View },
    { label: 'صور السبورة', icon: CameraIcon, view: 'photos' as View },
    { label: 'الدرجات والنتائج', icon: ChartBarIcon, view: 'grades' as View },
    { label: 'الواجب ورسائل المدرس', icon: BriefcaseIcon, view: 'homework' as View },
    { label: 'لوحة الشرف', icon: TrophyIcon, view: 'honorBoard' as View },
  ];
  
  if (loading) return <HomeScreenSkeleton />;

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg shadow-blue-500/5 dark:shadow-black/20 text-center">
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
          <span className="text-blue-600 dark:text-blue-500">"</span>
          مستقبلك بين يديك، والعلم هو مفتاحك.
          <span className="text-blue-600 dark:text-blue-500">"</span>
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">الحصص غير المشاهدة</h2>
          <button onClick={() => setActiveView('lectures')} className="flex items-center text-sm text-blue-600 dark:text-blue-500 font-semibold">
            عرض الكل <ChevronLeftIcon />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {unwatchedLectures.length > 0 ? unwatchedLectures.map((lecture) => (
            <div key={lecture.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-md dark:shadow-black/20 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
              <div className="relative">
                <img src={lecture.thumbnail_url} alt={lecture.title} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <PlayIcon className="w-8 h-8 text-white" filled />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{lecture.title}</h3>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <CheckCircleIcon className="w-4 h-4 ml-1 text-slate-400 dark:text-slate-500" />
                  <span>لم تتم المشاهدة</span>
                </div>
              </div>
            </div>
          )) : <p className="text-center text-slate-500 dark:text-slate-400 w-full py-8 col-span-full">لقد شاهدت جميع الحصص!</p>}
        </div>
      </div>
      
      {student && (
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg shadow-blue-500/5 dark:shadow-black/20">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">مستواك العام حسب متوسط دفعتك</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                    يا {student.full_name?.split(' ')[0] || 'طالبنا'}! جيد جدًا! {student.rank > 0 ? `ترتيبك هو ${student.rank}.` : 'ليس لديك ترتيب بعد.'} استمر في العمل الجاد لتصل إلى هدفك.
                </p>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">مؤشر أدائك:</p>
            </div>
            <div className="relative">
                <div className="w-2 h-2 rounded-full bg-red-500 absolute -top-1 -right-1 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-red-500 absolute -top-1 -right-1"></div>
                <TrophyIcon className="w-6 h-6 text-amber-400" filled />
            </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mt-3">
          <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" style={{ width: `${performancePercentage}%` }}></div>
        </div>
         <p className="text-left text-sm font-bold text-blue-600 dark:text-blue-500 mt-1">{performancePercentage}%</p>
      </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gridItems.map((item) => (
          <button key={item.label} onClick={() => setActiveView(item.view)} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-md dark:shadow-black/20 flex flex-col items-center justify-center space-y-2 text-center transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1">
            <item.icon className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;