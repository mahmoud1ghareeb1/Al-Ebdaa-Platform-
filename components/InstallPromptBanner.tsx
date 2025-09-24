import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const InstallPromptBanner: React.FC = () => {
  const { canInstall, promptInstall, dismiss } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-3 flex items-center gap-3">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F44ea46af043947d6ac3e6b970a38b3d7%2Fe5aa813644d74d0390e3497f36ad5e4f?format=png&width=64"
          alt="شعار التطبيق"
          className="w-10 h-10 rounded-xl object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">ثبت تطبيق منصة الإبداع</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">تثبيت سريع على جهازك للوصول السهل.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={dismiss} className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">لاحقًا</button>
          <button onClick={promptInstall} className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white dark:bg-blue-500">تثبيت على الهاتف</button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptBanner;
