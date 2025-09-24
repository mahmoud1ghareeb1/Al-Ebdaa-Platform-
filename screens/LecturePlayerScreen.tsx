
import React, { useEffect } from 'react';
import type { Lecture } from '../types';
import { supabase } from '../lib/supabase';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

interface LecturePlayerScreenProps {
  lecture: Lecture;
  onBack: () => void;
}

const getYouTubeEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    let videoId = null;
    
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        videoId = urlObj.searchParams.get('v');
      }
    } catch (e) {
      console.error("Invalid URL for YouTube video", e);
      return null;
    }

    if (!videoId) return null;
    
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      iv_load_policy: '3',
      showinfo: '0',
      controls: '1',
      autoplay: '1',
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};


const LecturePlayerScreen: React.FC<LecturePlayerScreenProps> = ({ lecture, onBack }) => {

  useEffect(() => {
    const markAsWatched = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('lecture_views')
          .upsert({ lecture_id: lecture.id, user_id: user.id });

        if (error && error.code !== '23505') {
            throw error;
        }
      } catch (error) {
        console.error("Error marking lecture as watched:", error);
      }
    };
    
    markAsWatched();
  }, [lecture.id]);

  const embedUrl = getYouTubeEmbedUrl(lecture.video_url);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black flex flex-col">
      <header className="bg-white dark:bg-slate-950 shadow-sm sticky top-0 z-10 w-full p-4">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate flex-grow text-right mr-4">{lecture.title}</h1>
            <button onClick={onBack} className="text-slate-700 dark:text-slate-300 flex-shrink-0">
              <ArrowRightIcon className="w-6 h-6" />
            </button>
        </div>
      </header>
      
      <main className="flex-grow w-full max-w-4xl mx-auto">
        <div className="w-full aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lecture.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white p-4 text-center">
              <p>رابط الفيديو غير صالح أو غير متوفر.</p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-950">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3 text-right">{lecture.title}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-right">
            هنا وصف تفصيلي للمحاضرة. يمكنك التركيز على النقاط الرئيسية التي تم تغطيتها في الفيديو لفهم أفضل. استمتع بالمشاهدة!
          </p>
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-5 h-5 ml-2" filled />
            <span className="font-semibold">تم تسجيل هذه المحاضرة كمشاهدة.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LecturePlayerScreen;