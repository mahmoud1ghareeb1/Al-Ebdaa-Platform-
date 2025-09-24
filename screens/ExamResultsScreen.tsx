import React from 'react';
import type { Exam } from '../types';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import TrophyIcon from '../components/icons/TrophyIcon';

interface ExamResultsScreenProps {
  result: {
    exam: Exam;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  };
  onBackToGrades: () => void;
}

const ExamResultsScreen: React.FC<ExamResultsScreenProps> = ({ result, onBackToGrades }) => {
  const { exam, score, totalQuestions, correctAnswers } = result;
  const percentage = exam.total_grade > 0 ? Math.round((score / exam.total_grade) * 100) : 0;

  const getMotivationalMessage = () => {
    if (percentage >= 90) return "ممتاز! أداء استثنائي!";
    if (percentage >= 75) return "جيد جدًا! استمر في التقدم!";
    if (percentage >= 50) return "عمل جيد! يمكنك تحقيق المزيد بالتركيز.";
    return "لا تستسلم! كل محاولة هي خطوة نحو النجاح.";
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-sky-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl shadow-slate-400/10 dark:shadow-blue-900/30 space-y-6">
        <div className="flex justify-center">
            {percentage >= 75 ? 
                <TrophyIcon className="w-20 h-20 text-amber-400" filled/> : 
                <CheckCircleIcon className="w-20 h-20 text-blue-400" filled/>
            }
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">اكتمل الاختبار!</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">هذه هي نتيجتك في اختبار: <span className="font-bold">{exam.name}</span></p>

        <div className="bg-blue-50 dark:bg-slate-800 border-2 border-blue-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-baseline">
                <span className="text-slate-600 dark:text-slate-300 font-medium">درجتك النهائية</span>
                <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                    {score.toFixed(1)}<span className="text-2xl font-bold"> / {exam.total_grade}</span>
                </p>
            </div>
             <div className="w-full bg-blue-200 dark:bg-slate-700 rounded-full h-4">
                <div className="bg-blue-600 dark:bg-blue-400 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>

        <div className="text-md text-slate-700 dark:text-slate-300">
            <p>لقد أجبت بشكل صحيح على <span className="font-bold text-green-600 dark:text-green-400">{correctAnswers}</span> من أصل <span className="font-bold">{totalQuestions}</span> أسئلة.</p>
        </div>

        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{getMotivationalMessage()}</p>
        
        <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>ملاحظة: ستظهر نتيجتك في سجل الدرجات الخاص بك بعد انتهاء الموعد النهائي للاختبار للجميع.</p>
        </div>

        <button
          onClick={onBackToGrades}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md shadow-blue-500/20 dark:shadow-blue-400/20 hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          الاطلاع على سجل الدرجات
        </button>
      </div>
    </div>
  );
};

export default ExamResultsScreen;