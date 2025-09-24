import React, { useState, useEffect, Suspense } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AuthScreen from './screens/AuthScreen';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { View, Lecture, Exam, ExamResult } from './types';
import Spinner from './components/Spinner';

// Lazy load screens
const HomeScreen = React.lazy(() => import('./screens/HomeScreen'));
const LecturesScreen = React.lazy(() => import('./screens/LecturesScreen'));
const ExamsScreen = React.lazy(() => import('./screens/ExamsScreen'));
const GradesScreen = React.lazy(() => import('./screens/GradesScreen'));
const AccountScreen = React.lazy(() => import('./screens/AccountScreen'));
const HonorBoardScreen = React.lazy(() => import('./screens/HonorBoardScreen'));
const ProfileMenuScreen = React.lazy(() => import('./screens/ProfileMenuScreen'));
const MiscScreens = React.lazy(() => import('./screens/MiscScreens'));
const LecturePlayerScreen = React.lazy(() => import('./screens/LecturePlayerScreen'));
const ExamStartScreen = React.lazy(() => import('./screens/ExamStartScreen'));
const ExamInProgressScreen = React.lazy(() => import('./screens/ExamInProgressScreen'));
const ExamResultsScreen = React.lazy(() => import('./screens/ExamResultsScreen'));
const ExamReviewScreen = React.lazy(() => import('./screens/ExamReviewScreen'));

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('home');
  const [isMenuOpen, setMenuOpen] = useState(false);

  // New state for modal-like screens
  const [playingLecture, setPlayingLecture] = useState<Lecture | null>(null);
  const [startingExam, setStartingExam] = useState<Exam | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examResult, setExamResult] = useState<{ exam: Exam; score: number; totalQuestions: number; correctAnswers: number; } | null>(null);
  const [reviewingExam, setReviewingExam] = useState<ExamResult | null>(null);


  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  const viewTitles: { [key in View]: string } = {
    home: 'منصة الإبداع',
    lectures: 'الحصص والمحاضرات',
    exams: 'الاختبارات',
    grades: 'الدرجات والنتائج',
    account: 'حسابي',
    honorBoard: 'لوحة الشرف',
    homework: 'الواجبات',
    notes: 'المذكرات المتاحة',
    photos: 'صور متاحة',
  };
  
  const renderContent = () => {
    if (!session) return null; // Should not happen if logic is correct
    
    // Render modal screens if active
    if (reviewingExam) {
        return <ExamReviewScreen 
            examResult={reviewingExam} 
            onBack={() => setReviewingExam(null)} 
        />;
    }
    if (examResult) {
        return <ExamResultsScreen 
            result={examResult} 
            onBackToGrades={() => { setExamResult(null); setActiveView('grades'); }} 
        />;
    }
    if (activeExam) {
        return <ExamInProgressScreen 
            exam={activeExam} 
            onFinish={(result) => { 
                setActiveExam(null); 
                setExamResult(result); 
            }} 
        />;
    }
    if (startingExam) {
        return <ExamStartScreen 
            exam={startingExam} 
            onStart={(exam) => { setStartingExam(null); setActiveExam(exam); }} 
            onBack={() => setStartingExam(null)} 
        />;
    }
    if (playingLecture) {
        return <LecturePlayerScreen lecture={playingLecture} onBack={() => setPlayingLecture(null)} />;
    }

    // Render main content based on activeView
    switch (activeView) {
      case 'home':
        return <HomeScreen setActiveView={setActiveView} />;
      case 'lectures':
        return <LecturesScreen onSelectLecture={setPlayingLecture} />;
      case 'exams':
        return <ExamsScreen onStartExam={setStartingExam} />;
      case 'grades':
        return <GradesScreen onReviewExam={setReviewingExam} />;
      case 'account':
        return <AccountScreen session={session}/>;
      case 'honorBoard':
        return <HonorBoardScreen />;
      case 'homework':
        return <MiscScreens screen="homework" />;
      case 'notes':
        return <MiscScreens screen="notes" />;
      case 'photos':
        return <MiscScreens screen="photos" />;
      default:
        return <HomeScreen setActiveView={setActiveView} />;
    }
  };

  const renderApp = () => {
    if (loading) {
      return <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center items-center"><p>Loading...</p></div>;
    }
    
    if (!session) {
      return <AuthScreen />;
    }

    const isModalScreenActive = !!(playingLecture || startingExam || activeExam || examResult || reviewingExam);

    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col max-w-7xl mx-auto shadow-2xl shadow-slate-400/20 dark:shadow-black/50">
      {!isModalScreenActive && <Header title={viewTitles[activeView]} onMenuClick={() => setMenuOpen(true)} />}
      <main className={`flex-grow overflow-y-auto ${!isModalScreenActive ? 'pb-24 px-4 md:px-6 pt-4' : ''}`}>
          <Suspense fallback={<Spinner />}>
              {renderContent()}
          </Suspense>
      </main>
      {!isModalScreenActive && <BottomNav activeView={activeView} setActiveView={setActiveView} />}
      {!isModalScreenActive && (
          <Suspense fallback={null}>
              <ProfileMenuScreen 
                  isOpen={isMenuOpen} 
                  onClose={() => setMenuOpen(false)} 
                  setActiveView={(view) => {
                      setActiveView(view);
                      setMenuOpen(false);
                  }}
              />
          </Suspense>
      )}
      </div>
    );
  };

  return renderApp();
};

export default App;