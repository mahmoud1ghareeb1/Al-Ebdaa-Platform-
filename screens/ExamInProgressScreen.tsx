
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Exam, Question } from '../types';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';

interface ExamInProgressScreenProps {
  exam: Exam;
  onFinish: (result: { exam: Exam; score: number; totalQuestions: number; correctAnswers: number; }) => void;
}

const ExamInProgressScreen: React.FC<ExamInProgressScreenProps> = ({ exam, onFinish }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration_minutes ? exam.duration_minutes * 60 : 0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Use refs for state/props that are needed in callbacks but shouldn't trigger re-renders or effects
  const answersRef = useRef(answers);
  answersRef.current = answers;
  
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const startTimeRef = useRef(new Date());

  const submittingRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const currentAnswers = answersRef.current;
        const currentQuestions = questionsRef.current;

        let correctAnswersCount = 0;
        currentQuestions.forEach(q => {
            const correctOption = q.options.find(o => o.is_correct);
            if (correctOption && currentAnswers[q.id] === correctOption.id) {
                correctAnswersCount += 1;
            }
        });

        const totalPointsPerQuestion = currentQuestions.length > 0 ? exam.total_grade / currentQuestions.length : 0;
        const score = correctAnswersCount * totalPointsPerQuestion;
        const finalScore = Math.round(score);
        
        const endTime = new Date();
        const solveDurationMinutes = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 60000);

        const { error } = await supabase.from('submissions').insert({
            exam_id: exam.id,
            user_id: user.id,
            score: finalScore,
            solve_duration_minutes: solveDurationMinutes,
        });

        if (error) throw error;
        
        onFinishRef.current({
            exam,
            score: finalScore,
            totalQuestions: currentQuestions.length,
            correctAnswers: correctAnswersCount,
        });

    } catch (error: any) {
        console.error('Error submitting exam:', error);
        // Stringify the error to avoid "[object Object]" and reveal the actual error structure.
        // This is crucial for diagnosing issues like RLS policy violations.
        alert(`حدث خطأ أثناء تسليم الاختبار:\n${JSON.stringify(error, null, 2)}`);
        submittingRef.current = false;
        setSubmitting(false);
    }
  }, [exam]); // Now only depends on `exam`, making it stable throughout the exam session.

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
        
        const formattedQuestions = data.map((q: any) => ({ ...q, options: q.options || [] }))
        setQuestions(formattedQuestions as Question[]);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [exam.id]);

  const autoSubmitTriggered = useRef(false);

  useEffect(() => {
    // The timer is now stable because `handleSubmit` is a stable dependency.
    if (exam.duration_minutes && !loading) {
        if (timeLeft <= 0) {
            if (!autoSubmitTriggered.current) {
                autoSubmitTriggered.current = true;
                handleSubmit();
            }
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [timeLeft, exam.duration_minutes, handleSubmit, loading]);

  const handleAnswerSelect = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center"><Spinner /></div>;
  }
  
  if (questions.length === 0) {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">لا توجد أسئلة</h2>
            <p className="text-slate-600 dark:text-slate-400 my-4">لا توجد أسئلة متاحة لهذا الاختبار حاليًا.</p>
            <button onClick={handleSubmit} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg">
                العودة
            </button>
        </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10 w-full p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate text-right flex-grow mr-4">{exam.name}</h1>
          {exam.duration_minutes && (
            <div className="font-mono text-lg font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-md">
                {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3">
            <div className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6 w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm">
            <div className="mb-6 text-right">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-500 mb-2">
                    السؤال {currentQuestionIndex + 1} من {questions.length}
                </p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{currentQuestion.question_text}</p>
            </div>
            {currentQuestion.question_image_url && (
                <div className="my-4 flex justify-center">
                    <img src={currentQuestion.question_image_url} alt="Question" className="max-w-full h-auto rounded-lg shadow-sm" />
                </div>
            )}
            <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                        className={`w-full text-right p-4 rounded-lg border-2 transition-all duration-200 text-slate-700 dark:text-slate-200 font-medium
                        ${answers[currentQuestion.id] === option.id 
                            ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/50' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-700'}`}
                    >
                        {option.option_text}
                    </button>
                ))}
            </div>
        </div>
      </main>
      
      <footer className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm shadow-top sticky bottom-0 z-10 w-full p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
             <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="py-2 px-6 rounded-lg font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                السابق
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
                 <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="py-2 px-6 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                    {submitting ? 'جاري التسليم...' : 'إنهاء الاختبار'}
                </button>
            ) : (
                <button
                    onClick={handleNext}
                    className="py-2 px-6 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                    التالي
                </button>
            )}
        </div>
      </footer>
    </div>
  );
};

export default ExamInProgressScreen;
