import React, { useEffect, useState } from 'react';
import type { Exam, Question } from '../types';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

interface ExamStudyScreenProps {
  exam: Exam;
  onBack: () => void;
}

const ExamStudyScreen: React.FC<ExamStudyScreenProps> = ({ exam, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('questions')
          .select('*, options (*)')
          .eq('exam_id', exam.id)
          .order('id', { ascending: true });
        if (error) throw error;
        const formatted = (data || []).map((q: any) => ({ ...q, options: q.options || [] }));
        setQuestions(formatted);
      } catch (e) {
        console.error('Error fetching study questions:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [exam.id]);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col">
      <header className="bg-white dark:bg-zinc-950 shadow-sm sticky top-0 z-10 w-full p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 truncate flex-grow text-right mr-4">مذاكرة: {exam.name}</h1>
        <button onClick={onBack} className="text-zinc-700 dark:text-zinc-300 flex-shrink-0" aria-label="Back">
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-grow p-4 md:p-6 w-full max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64"><Spinner /></div>
        ) : questions.length > 0 ? (
          questions.map((q, i) => (
            <div key={q.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm">
              <div className="mb-6 text-right">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">السؤال {i + 1}</p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{q.question_text}</p>
              </div>
              {q.question_image_url && (
                <div className="my-4 flex justify-center">
                  <img src={q.question_image_url} alt="Question" className="max-w-full h-auto rounded-lg shadow-sm" />
                </div>
              )}
              <div className="space-y-3">
                {q.options.map((o) => (
                  <div key={o.id} className={`w-full text-right p-4 rounded-lg border-2 transition-all duration-200 font-medium flex items-center justify-between ${o.is_correct ? 'bg-green-50 dark:bg-green-950/50 border-green-400 dark:border-green-700 text-zinc-800 dark:text-zinc-200' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200'}`}>
                    <span>{o.option_text}</span>
                    {o.is_correct && <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-500" filled />}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm text-center text-zinc-600 dark:text-zinc-400">لا توجد أسئلة.</div>
        )}
      </main>
    </div>
  );
};

export default ExamStudyScreen;
