

import React, { useState, useEffect } from 'react';
import type { Exam } from '../types';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';

interface ExamsScreenProps {
    onStartExam: (exam: Exam) => void;
}

const ExamCard: React.FC<{ exam: Exam; onStartExam: (exam: Exam) => void; type: 'available' | 'missed' | 'taken' }> = ({ exam, onStartExam, type }) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'غير محدد';
        return new Date(dateString).toLocaleString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const statusPill = {
        missed: <span className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">فاتك</span>,
        taken: <span className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">تم الحل</span>,
        available: <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">متاح</span>,
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-md dark:shadow-blue-900/20 transition-all duration-300 hover:shadow-xl dark:hover:shadow-blue-700/30 hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{exam.name}</h3>
                {statusPill[type]}
            </div>
            <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">متاح من:</span> {formatDate(exam.start_date)}</p>
                <p><span className="font-semibold text-slate-700 dark:text-slate-300">ينتهي في:</span> {formatDate(exam.end_date)}</p>
            </div>
            {type === 'available' && (
                <div className="mt-4">
                    <button onClick={() => onStartExam(exam)} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-500/20 dark:shadow-lg dark:shadow-blue-400/30">
                        بدء الاختبار
                    </button>
                </div>
            )}
        </div>
    );
};

const ExamsScreen: React.FC<ExamsScreenProps> = ({ onStartExam }) => {
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [missedExams, setMissedExams] = useState<Exam[]>([]);
  const [takenExams, setTakenExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const [examsRes, submissionsRes] = await Promise.all([
          supabase.from('exams').select('*').order('start_date', { ascending: false }),
          supabase.from('submissions').select('exam_id').eq('user_id', user.id)
        ]);

        if (examsRes.error) throw examsRes.error;
        if (submissionsRes.error) throw submissionsRes.error;

        const submittedExamIds = new Set(submissionsRes.data.map(s => s.exam_id));
        const now = new Date();

        const available: Exam[] = [];
        const missed: Exam[] = [];
        const taken: Exam[] = [];

        examsRes.data.forEach(exam => {
          if (submittedExamIds.has(exam.id)) {
            taken.push(exam);
            return;
          }
          const endDate = exam.end_date ? new Date(exam.end_date) : null;
          if (endDate && endDate > now) {
            available.push(exam);
          } else if (endDate && endDate < now) {
            missed.push(exam);
          } else if (!endDate) { // if no end date assume it's available
            available.push(exam);
          }
        });

        setAvailableExams(available);
        setMissedExams(missed);
        setTakenExams(taken);

      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) return <Spinner />;
  
  const ExamSection: React.FC<{ title: string; exams: Exam[]; type: 'available' | 'missed' | 'taken'; onStartExam: (exam: Exam) => void; emptyMessage: string }> = ({ title, exams, type, onStartExam, emptyMessage }) => (
    <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{title}</h2>
        {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map(exam => <ExamCard key={exam.id} exam={exam} onStartExam={onStartExam} type={type} />)}
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm text-center text-slate-500 dark:text-slate-400">
                {emptyMessage}
            </div>
        )}
    </div>
  );

  return (
    <div className="space-y-8">
        <ExamSection 
            title="اختبارات متاحة"
            exams={availableExams}
            type="available"
            onStartExam={onStartExam}
            emptyMessage="لا توجد اختبارات متاحة حالياً."
        />
        <ExamSection 
            title="امتحانات فاتتك"
            exams={missedExams}
            type="missed"
            onStartExam={onStartExam}
            emptyMessage="ليس لديك امتحانات فائتة."
        />
        <ExamSection 
            title="امتحانات تم حلها"
            exams={takenExams}
            type="taken"
            onStartExam={onStartExam}
            emptyMessage="لم تقم بحل أي امتحانات بعد."
        />
    </div>
  );
};

export default ExamsScreen;