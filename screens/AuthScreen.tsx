import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { StudentProfile } from '../types';
import { useTheme } from '../ThemeContext';
import SunIcon from '../components/icons/SunIcon';
import MoonIcon from '../components/icons/MoonIcon';

const AuthScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');
  const [studentClass, setStudentClass] = useState<'الصف الأول الثانوى' | 'الصف الثانى الثانوى' | 'الصف الثالث الثانوى'>('الصف الثالث الثانوى');
  const [group, setGroup] = useState<'مجموعة 1' | 'مجموعة 2' | 'ابو حماد'>('مجموعة 1');

  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
     try {
      setLoading(true);
      setError(null);
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("Sign up successful, but no user data returned.");

      // Insert profile data
      const profileData: Omit<StudentProfile, 'id' | 'avatar_url'> = {
          full_name: fullName,
          student_code: studentCode,
          phone_number: phoneNumber,
          parent_phone_number: parentPhoneNumber,
          class: studentClass,
          group: group,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ ...profileData, id: data.user.id }) // Using update as a user profile row is created by a trigger
        .eq('id', data.user.id);
      
      if (profileError) {
          // You might want to handle this case, e.g., by deleting the created user
          console.error("Auth user created, but profile insertion failed:", profileError);
          throw profileError;
      }
      
      // With email confirmation disabled in Supabase, the user is logged in automatically.
      // The onAuthStateChange listener in App.tsx will detect the new session and switch views.
      // No alert or redirection is needed here.
      
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  }

  const formFields = [
    { id: 'email', label: 'البريد الإلكتروني', type: 'email', value: email, setter: setEmail, autoComplete: 'email' },
    { id: 'password', label: 'كلمة المرور', type: 'password', value: password, setter: setPassword, autoComplete: isSignUp ? 'new-password' : 'current-password' },
  ];
  
  const signUpFields = [
    { id: 'fullName', label: 'الاسم بالكامل', type: 'text', value: fullName, setter: setFullName, autoComplete: 'name' },
    { id: 'studentCode', label: 'كود الطالب', type: 'text', value: studentCode, setter: setStudentCode, autoComplete: 'off' },
    { id: 'phoneNumber', label: 'رقم التليفون', type: 'tel', value: phoneNumber, setter: setPhoneNumber, autoComplete: 'tel' },
    { id: 'parentPhoneNumber', label: 'رقم ولي الأمر', type: 'tel', value: parentPhoneNumber, setter: setParentPhoneNumber, autoComplete: 'tel' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-sky-950 flex flex-col justify-center items-center p-4">
       <div className="absolute top-4 right-4 z-10">
            <button 
                onClick={toggleTheme} 
                className="text-slate-700 dark:text-slate-300 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? 
                    <SunIcon className="w-6 h-6 text-amber-400" /> : 
                    <MoonIcon className="w-6 h-6 text-slate-700" />
                }
            </button>
        </div>
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg shadow-slate-400/10 dark:shadow-blue-900/30">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">منصة الإبداع</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول للمتابعة'}</p>
        </div>
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          {formFields.map(field => (
             <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right">
                  {field.label}
                </label>
                <div className="mt-1">
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    required
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
          ))}

          {isSignUp && (
            <>
              {signUpFields.map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right">{field.label}</label>
                    <input id={field.id} type={field.type} value={field.value} onChange={(e) => field.setter(e.target.value)} required className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"/>
                  </div>
              ))}
              <div>
                <label htmlFor="studentClass" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right">الصف الدراسي</label>
                <select id="studentClass" value={studentClass} onChange={(e) => setStudentClass(e.target.value as any)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right">
                    <option>الصف الثالث الثانوى</option>
                    <option>الصف الثانى الثانوى</option>
                    <option>الصف الأول الثانوى</option>
                </select>
              </div>
              <div>
                <label htmlFor="group" className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right">المجموعة</label>
                <select id="group" value={group} onChange={(e) => setGroup(e.target.value as any)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right">
                    <option>مجموعة 1</option>
                    <option>مجموعة 2</option>
                    <option>ابو حماد</option>
                </select>
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'جاري...' : (isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول')}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-400 font-medium">
                {isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;