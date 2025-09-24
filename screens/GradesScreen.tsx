

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { StudentProfile, ExamResult } from '../types';
import { GradesScreenSkeleton } from '../components/Skeletons';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import StarIcon from '../components/icons/StarIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import ClockIcon from '../components/icons/ClockIcon';
import Avatar from '../components/Avatar';


// Note: I'm combining data from `profiles` and `honor_board` here.
interface StudentGradeInfo extends StudentProfile {
  examCount: number;
  totalScore: number;
  rank: number;
}

interface GradesScreenProps {
    onReviewExam: (result: ExamResult) => void;
}

const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 text-right">
    <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
    <span className="text-slate-600 dark:text-slate-300 font-medium text-left">{value}</span>
  </div>
);

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string, color: string, iconColor: string }> = ({ icon: Icon, label, value, color, iconColor }) => (
    <div className={`${color} p-3 rounded-xl flex items-center space-x-3 space-x-reverse`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/20`}>
            <Icon className={`w-6 h-6 ${iconColor}`} filled />
        </div>
        <div className="text-right">
            <p className="text-sm text-white/80">{label}</p>
            <p className="font-bold text-white">{value}</p>
        </div>
    </div>
);

const GradesScreen: React.FC<GradesScreenProps> = ({ onReviewExam }) => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentGradeInfo | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const [profileRes, honorBoardRes, submissionsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('honor_board').select('total_score, rank').eq('id', user.id).single(),
          supabase.from('submissions').select(`
            id,
            created_at,
            score,
            solve_duration_minutes,
            exam_id,
            exams ( name, total_grade, end_date )
          `).eq('user_id', user.id)
        ]);

        if (profileRes.error) throw profileRes.error;
        // honorBoardRes.error is not critical if user is not ranked
        if (submissionsRes.error) throw submissionsRes.error;
        
        if (!profileRes.data) {
          throw new Error("Student profile could not be loaded.");
        }

        const profileData = profileRes.data;
        const honorData = honorBoardRes.data;
        const submissionsData = submissionsRes.data as any[];

        setStudent({
          ...profileData,
          examCount: submissionsData.length,
          totalScore: honorData?.total_score ?? 0,
          rank: honorData?.rank ?? 0,
        });
        
        // --- New logic to fetch question counts and calculate stats ---
        let detailedResults: ExamResult[] = [];
        if (submissionsData.length > 0) {
            const examIds = [...new Set(submissionsData.map(sub => sub.exam_id))];
            const { data: questionCountsData, error: countError } = await supabase
                .from('questions')
                .select('exam_id')
                .in('exam_id', examIds);

            if (countError) throw countError;
            
            const questionCountMap = questionCountsData.reduce((acc: { [key: number]: number }, { exam_id }) => {
                acc[exam_id] = (acc[exam_id] || 0) + 1;
                return acc;
            }, {});

            detailedResults = submissionsData.map(sub => {
                const totalQuestions = questionCountMap[sub.exam_id] || 0;
                const totalGrade = sub.exams.total_grade;
                const score = sub.score;

                let correctAnswers = 0;
                if (totalGrade > 0 && totalQuestions > 0) {
                    correctAnswers = Math.round((score * totalQuestions) / totalGrade);
                }
                const incorrectAnswers = totalQuestions - correctAnswers;

                return {
                    id: sub.id,
                    exam_id: sub.exam_id,
                    examName: sub.exams.name,
                    total_grade: totalGrade,
                    score: score,
                    solve_duration_minutes: sub.solve_duration_minutes,
                    created_at: sub.created_at,
                    examEndDate: sub.exams.end_date,
                    totalQuestions,
                    correctAnswers,
                    incorrectAnswers,
                };
            });
        }
        // --- End of new logic ---

        // Results are now shown immediately after submission.
        setExamResults(detailedResults);

      } catch (error) {
        console.error('Error fetching grades data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <GradesScreenSkeleton />;
  if (!student) return <p className="text-center text-red-500">Could not load student data.</p>;

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
      <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg dark:shadow-black/20 text-center space-y-4">
            <div className="w-24 h-24 rounded-full mx-auto border-4 border-slate-200 dark:border-slate-800 overflow-hidden">
                <Avatar src={student.avatar_url} name={student.full_name} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{student.full_name}</h2>
            <div className="text-right divide-y divide-slate-200 dark:divide-slate-800">
                <InfoRow label="اسم الطالب" value={student.full_name} />
                <InfoRow label="عدد الامتحانات" value={student.examCount} />
                <InfoRow label="عدد الدرجات الإجمالية" value={student.totalScore} />
                <InfoRow label="ترتيبك على الدفعة" value={student.rank > 0 ? student.rank : 'غير مصنف'} />
            </div>
          </div>
      </div>
      
      <div className="lg:col-span-8 mt-8 lg:mt-0">
        <h3 className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-slate-200">نتائج الاختبارات</h3>
        <div className="space-y-4">
          {examResults.length > 0 ? examResults.map((result) => (
            <div key={result.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-md dark:shadow-black/20 overflow-hidden">
              <div className="p-5">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-right">{result.examName}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <StatCard icon={StarIcon} label="الدرجة" value={`${result.score} / ${result.total_grade}`} color="bg-amber-500" iconColor="text-amber-300" />
                    <StatCard icon={CheckCircleIcon} label="الإجابات الصحيحة" value={`${result.correctAnswers}`} color="bg-green-500" iconColor="text-green-300" />
                    <StatCard icon={XCircleIcon} label="عدد الأخطاء" value={`${result.incorrectAnswers}`} color="bg-red-500" iconColor="text-red-300" />
                    <StatCard icon={ClockIcon} label="مدة الحل" value={`${result.solve_duration_minutes || '-'} دقيقة`} color="bg-blue-500" iconColor="text-blue-300" />
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-4">
                  تم التسليم في: {new Date(result.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                </p>

                <button 
                  onClick={() => onReviewExam(result)} 
                  className="w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <DocumentTextIcon className="w-5 h-5 ml-2" />
                  مراجعة الاختبار
                </button>
              </div>
            </div>
          )) : <div className="text-center text-slate-500 dark:text-slate-400 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">لا توجد نتائج متاحة للعرض حاليًا.</div>}
        </div>
      </div>
    </div>
  );
};

export default GradesScreen;