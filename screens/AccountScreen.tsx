

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { StudentProfile } from '../types';
import type { Session } from '@supabase/supabase-js';
import Spinner from '../components/Spinner';
import Avatar from '../components/Avatar';
import ConfirmationModal from '../components/ConfirmationModal';


declare const html2canvas: any;

const InputField: React.FC<{ label: string; value: string; readOnly?: boolean }> = ({ label, value, readOnly = true }) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 text-right">{label}</label>
        <input 
            type="text" 
            value={value || ''} 
            readOnly={readOnly}
            className="w-full bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" 
        />
    </div>
);

const AccountScreen: React.FC<{session: Session}> = ({session}) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
        setUploading(true);
        
        // --- New Strategy: Upload new file, delete old one ---
        const fileExt = file.name.split('.').pop() || 'png';
        const newFileName = `avatar-${Date.now()}.${fileExt}`;
        const newFilePath = `${session.user.id}/${newFileName}`;

        // 1. Upload the new file. This is always an INSERT.
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(newFilePath, file, {
                contentType: file.type || 'image/png',
                upsert: false,
            });

        if (uploadError) {
            // Re-throw to be caught by the generic catch block
            throw uploadError;
        }

        // 2. Get the new public URL and add a timestamp to bust browser cache
        const { data: newUrlData } = supabase.storage.from('avatars').getPublicUrl(newFilePath);
        const newPublicUrl = `${newUrlData.publicUrl}?t=${new Date().getTime()}`;

        // 3. Update the user's profile with the new avatar URL
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: newPublicUrl })
            .eq('id', session.user.id);
        
        if (updateError) {
            // If profile update fails, try to clean up the newly uploaded file
            await supabase.storage.from('avatars').remove([newFilePath]);
            throw updateError;
        }

        // 4. Delete the old avatar file from storage, if it exists and is different
        if (profile.avatar_url) {
            try {
                const oldUrl = new URL(profile.avatar_url);
                // Path is /storage/v1/object/public/avatars/USER_ID/FILENAME.EXT
                const oldFilePath = oldUrl.pathname.split('/avatars/')[1];
                if (oldFilePath && oldFilePath !== newFilePath) {
                    await supabase.storage.from('avatars').remove([oldFilePath]);
                }
            } catch (e) {
                console.warn("Could not parse or delete old avatar. This is non-critical.", e);
                // Don't fail the entire process if cleanup fails.
            }
        }
        
        // 5. Update the UI optimistically
        setProfile({ ...profile, avatar_url: newPublicUrl });

    } catch (error: any) {
        console.error('Error uploading avatar:', error);
        let userMessage = 'فشل رفع الصورة. حدث خطأ غير متوقع.';
        if (error.message) {
            if (error.message.includes('security policy')) {
                userMessage = 'فشل رفع الصورة: ليس لديك الصلاحية اللازمة. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.';
            } else if (error.message.toLowerCase().includes('already exists')) {
                 userMessage = 'فشل رفع الصورة: الملف موجود بالفعل. يرجى إعادة المحاولة.';
            } else {
                userMessage = `فشل رفع الصورة: ${error.message}`;
            }
        }
        alert(userMessage);
    } finally {
        setUploading(false);
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    }
  };


  const handleSaveCard = async () => {
    if (!accountRef.current || isSaving) return;

    const bodyBackgroundColor = window.getComputedStyle(document.body).backgroundColor;

    setIsSaving(true);
    try {
      const canvas = await html2canvas(accountRef.current, {
          useCORS: true, // Handles cross-origin images like the avatar
          backgroundColor: bodyBackgroundColor, // Ensures dark/light mode background is captured
          scale: 2, // Increase resolution for better quality
      });
      const link = document.createElement('a');
      link.download = `بطاقة-الطالب-${profile?.student_code || 'profile'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating student card:', error);
      alert('حدث خطأ أثناء إنشاء بطاقة الطالب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) return <Spinner />;
  if (!profile) return <p className="text-center text-red-500">Could not load profile.</p>;

  return (
    <>
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleSignOut}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
      />
      <div ref={accountRef} className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg dark:shadow-blue-900/30 flex flex-col items-center space-y-4">
              <div className="relative">
                <button onClick={triggerAvatarUpload} className="rounded-full border-4 border-slate-200 dark:border-blue-800 block" disabled={uploading}>
                    <Avatar src={profile.avatar_url} name={profile.full_name} />
                </button>
                {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}
              </div>
              <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                  disabled={uploading}
              />
              <button onClick={triggerAvatarUpload} disabled={uploading} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 dark:shadow-lg dark:shadow-blue-400/30 disabled:opacity-50">
                  {uploading ? 'جاري الرفع...' : 'تغيير صورة الملف الشخصي'}
              </button>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg dark:shadow-blue-900/30 space-y-4">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                  <InputField label="الاسم" value={profile.full_name} />
                  <InputField label="الكود" value={profile.student_code} />
              </div>
               <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                  <InputField label="رقم التليفون" value={profile.phone_number} />
                  <InputField label="رقم ولي الأمر" value={profile.parent_phone_number} />
              </div>
               <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                  <InputField label="الصف الدراسي" value={profile.class} />
                  <InputField label="المجموعة" value={profile.group} />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse pt-4">
                  <button
                      onClick={handleSaveCard}
                      disabled={isSaving}
                      className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md shadow-green-500/20 dark:shadow-lg dark:shadow-green-400/30 disabled:opacity-50 disabled:cursor-wait"
                  >
                      {isSaving ? 'جاري الحفظ...' : 'حفظ بطاقة الطالب'}
                  </button>
                  <button 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full bg-red-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                      تسجيل الخروج
                  </button>
              </div>
          </div>
      </div>
    </>
  );
};

export default AccountScreen;