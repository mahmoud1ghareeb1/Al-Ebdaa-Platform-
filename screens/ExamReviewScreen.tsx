
import React, { useState, useEffect } from 'react';
import type { ExamResult, Question } from '../types';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';

interface ExamReviewScreenProps {
  examResult: ExamResult;
  onBack: () => void;
}

const ExamReviewScreen: React.FC<ExamReviewScreenProps> = ({ examResult, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('questions')
          .select('*, options (*)')
          .eq('exam_id', examResult.exam_id)
          .order('id', { ascending: true });

        if (error) throw error;

        const formattedQuestions = data.map((q: any) => ({ ...q, options: q.options || [] }))
        setQuestions(formattedQuestions as Question[]);
      } catch (error) {
        console.error('Error fetching review questions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (examResult.exam_id) {
        fetchQuestions();
    }
  }, [examResult.exam_id]);
  
  const getOptionClassName = (isCorrect: boolean) => {
    let baseClasses = 'w-full text-right p-4 rounded-lg border-2 transition-all duration-200 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-between';
    if (isCorrect) {
      return `${baseClasses} bg-green-50 dark:bg-green-950/50 border-green-400 dark:border-green-700`;
    }
    return `${baseClasses} bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700`;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 w-full p-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate flex-grow text-right mr-4">{examResult.examName}</h1>
        <button onClick={onBack} className="text-slate-700 dark:text-slate-300 flex-shrink-0">
          <ArrowRightIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-grow p-4 md:p-6 w-full max-w-4xl mx-auto space-y-4">
        {loading ? (
            <div className="flex justify-center items-center h-64"><Spinner /></div>
        ) : questions.length > 0 ? (
            questions.map((question, index) => (
                <div key={question.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
                    <div className="mb-6 text-right">
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-500 mb-2">
                            السؤال {index + 1}
                        </p>
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{question.question_text}</p>
                    </div>
                    {question.question_image_url && (
                        <div className="my-4 flex justify-center">
                            <img src={question.question_image_url} alt="Question" className="max-w-full h-auto rounded-lg shadow-sm" />
                        </div>
                    )}
                    <div className="space-y-3">
                        {question.options.map((option) => (
                            <div key={option.id} className={getOptionClassName(option.is_correct)}>
                                <span>{option.option_text}</span>
                                {option.is_correct && <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-500" filled />}
                            </div>
                        ))}
                    </div>
                </div>
            ))
        ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm text-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">لا توجد أسئلة</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">لم يتم العثور على أسئلة لهذا الاختبار.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default ExamReviewScreen;