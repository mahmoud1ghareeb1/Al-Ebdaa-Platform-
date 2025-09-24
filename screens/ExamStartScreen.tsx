import React, { useState, useEffect } from 'react';
import type { Exam } from '../types';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import ClockIcon from '../components/icons/ClockIcon';
import QuestionMarkCircleIcon from '../components/icons/QuestionMarkCircleIcon';
import CheckBadgeIcon from '../components/icons/CheckBadgeIcon';

interface ExamStartScreenProps {
  exam: Exam;
  onStart: (exam: Exam) => void;
  onBack: () => void;
}

const InfoCard: React.FC<{ icon: React.ElementType; label: string; value: string | number }> = ({ icon: Icon, label, value }) => (
    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className="font-bold text-blue-600 dark:text-blue-500">{value}</span>
    </div>
);


const ExamStartScreen: React.FC<ExamStartScreenProps> = ({ exam, onStart, onBack }) => {
    const [questionCount, setQuestionCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestionCount = async () => {
            try {
                setLoading(true);
                const { count, error } = await supabase
                    .from('questions')
                    .select('id', { count: 'exact', head: true })
                    .eq('exam_id', exam.id);
                
                if (error) throw error;
                setQuestionCount(count);
            } catch (error) {
                console.error("Error fetching question count:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionCount();
    }, [exam.id]);
  
  if (loading) {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
            <header className="bg-white dark:bg-slate-900 shadow-sm p-4 flex items-center justify-between">
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">جاري تحميل الاختبار...</h1>
                <button onClick={onBack} className="text-slate-700 dark:text-slate-300"><ArrowRightIcon className="w-6 h-6" /></button>
            </header>
            <main className="flex-grow flex items-center justify-center">
                <Spinner />
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
        <header className="bg-white dark:bg-slate-900 shadow-sm p-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate flex-grow text-right mr-4">{exam.name}</h1>
            <button onClick={onBack} className="text-slate-700 dark:text-slate-300 flex-shrink-0">
                <ArrowRightIcon className="w-6 h-6" />
            </button>
        </header>
        <main className="flex-grow p-6 flex flex-col justify-center items-center text-center">
            <div className="w-full max-w-md">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mb-2">تعليمات الاختبار</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">اقرأ التفاصيل التالية جيدًا قبل البدء.</p>
                <div className="space-y-4 text-right mb-10">
                    <InfoCard icon={ClockIcon} label="مدة الاختبار" value={`${exam.duration_minutes || 'غير محدد'} دقيقة`} />
                    <InfoCard icon={QuestionMarkCircleIcon} label="عدد الأسئلة" value={questionCount ?? '...'} />
                    <InfoCard icon={CheckBadgeIcon} label="الدرجة النهائية" value={exam.total_grade} />
                </div>

                <button 
                    onClick={() => onStart(exam)}
                    className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                    ابدأ الاختبار الآن
                </button>
            </div>
        </main>
    </div>
  );
};

export default ExamStartScreen;