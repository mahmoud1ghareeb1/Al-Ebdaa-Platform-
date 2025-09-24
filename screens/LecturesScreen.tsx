
import React, { useState, useEffect } from 'react';
import type { Lecture } from '../types';
import { supabase } from '../lib/supabase';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import PlayIcon from '../components/icons/PlayIcon';
import { LectureCardSkeleton } from '../components/Skeletons';

const LectureCard: React.FC<{ lecture: Lecture; onSelect: (lecture: Lecture) => void }> = ({ lecture, onSelect }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md dark:shadow-black/20 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1" onClick={() => onSelect(lecture)}>
    <div className="relative group">
      <img src={lecture.thumbnail_url} alt={lecture.title} className="w-full h-40 object-cover" />
       <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayIcon className="w-12 h-12 text-white" filled />
        </div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">{lecture.title}</h3>
      <div className={`flex items-center text-xs mt-3 ${lecture.watched ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <CheckCircleIcon className="w-4 h-4 ml-1" filled={lecture.watched} />
        <span>{lecture.watched ? 'تمت المشاهدة' : 'لم تتم المشاهدة'}</span>
      </div>
    </div>
  </div>
);

interface LecturesScreenProps {
    onSelectLecture: (lecture: Lecture) => void;
}

const LecturesScreen: React.FC<LecturesScreenProps> = ({ onSelectLecture }) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const [lecturesRes, viewsRes] = await Promise.all([
          supabase.from('lectures').select('*').order('created_at', { ascending: false }),
          supabase.from('lecture_views').select('lecture_id').eq('user_id', user.id)
        ]);

        if (lecturesRes.error) throw lecturesRes.error;
        if (viewsRes.error) throw viewsRes.error;

        const watchedIds = new Set(viewsRes.data.map(v => v.lecture_id));
        const allLectures = lecturesRes.data.map(lec => ({
          ...lec,
          watched: watchedIds.has(lec.id),
        }));
        
        setLectures(allLectures);

      } catch (error) {
        console.error('Error fetching lectures:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  if (loading) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <LectureCardSkeleton key={i} />)}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {lectures.map((lecture) => (
        <LectureCard key={lecture.id} lecture={lecture} onSelect={onSelectLecture} />
      ))}
    </div>
  );
};

export default LecturesScreen;