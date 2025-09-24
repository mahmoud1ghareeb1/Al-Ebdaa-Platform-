import React, { useState, useEffect } from 'react';
import type { HonorStudent } from '../types';
import { supabase } from '../lib/supabase';
import { HonorBoardSkeleton } from '../components/Skeletons';
import Avatar from '../components/Avatar';

const rankMap: { [key: number]: string } = {
  1: 'الأول',
  2: 'الثاني',
  3: 'الثالث',
  4: 'الرابع',
  5: 'الخامس',
};

const RankIcon: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) return <span role="img" aria-label="gold medal">🥇</span>;
    if (rank === 2) return <span role="img" aria-label="silver medal">🥈</span>;
    if (rank === 3) return <span role="img" aria-label="bronze medal">🥉</span>;
    return null;
}

const HonorBoardScreen: React.FC = () => {
  const [students, setStudents] = useState<HonorStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHonorBoard = async () => {
      try {
        setLoading(true);
        // Step 1: Fetch main data from the honor_board view without the avatar_url
        const { data: honorData, error: honorError } = await supabase
          .from('honor_board')
          .select('id, full_name, total_score, rank')
          .order('rank')
          .order('total_score', { ascending: false })
          .limit(20);
        
        if (honorError) throw honorError;
        if (!honorData || honorData.length === 0) {
            setStudents([]);
            setLoading(false);
            return;
        }

        // Step 2: Get all student IDs from the result
        const studentIds = honorData.map(student => student.id);

        // Step 3: Fetch avatar_url for those students from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, avatar_url')
          .in('id', studentIds);

        if (profileError) throw profileError;

        // Step 4: Merge the two datasets
        const avatarUrlMap = new Map(profileData.map(p => [p.id, p.avatar_url]));
        const combinedData = honorData.map(student => ({
          ...student,
          avatar_url: avatarUrlMap.get(student.id) || '',
        }));

        setStudents(combinedData as HonorStudent[]);
      } catch (error) {
        // Log a more descriptive error message
        console.error('Error fetching honor board:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHonorBoard();
  }, []);

  if (loading) return <HonorBoardSkeleton />;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-lg dark:shadow-blue-900/30">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">لوحة الشرف</h2>
      
      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-bold px-4 py-2 border-b-2 border-slate-200 dark:border-blue-900/50">
        <span>الترتيب</span>
        <span>اسم الطالب</span>
        <span>المجموع</span>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-blue-900/50">
        {students.map((student) => (
          <div key={student.id} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse w-1/4">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rankMap[student.rank] || `الـ ${student.rank}`}</span>
                {student.rank <= 3 && <RankIcon rank={student.rank} />}
            </div>
            <div className="flex items-center space-x-3 space-x-reverse w-1/2 justify-end">
                <span className="text-slate-800 dark:text-slate-200 font-medium text-right truncate">{student.full_name}</span>
                <div className="flex-shrink-0">
                    <Avatar src={student.avatar_url} name={student.full_name} sizeClass="w-10 h-10" textClass="text-base" />
                </div>
            </div>
            <span className="w-1/4 text-left font-bold text-blue-600 dark:text-blue-400">{student.total_score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HonorBoardScreen;