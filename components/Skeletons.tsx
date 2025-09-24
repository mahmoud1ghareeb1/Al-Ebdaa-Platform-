import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md ${className}`} />
);

export const LectureCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md dark:shadow-black/20 overflow-hidden">
        <Skeleton className="w-full h-40" />
        <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);

export const HomeScreenSkeleton: React.FC = () => (
    <div className="space-y-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg dark:shadow-black/20 text-center space-y-2">
            <Skeleton className="h-5 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto" />
        </div>
        <div>
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl shadow-md dark:shadow-black/20 overflow-hidden">
                        <Skeleton className="w-full h-32" />
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg dark:shadow-black/20 space-y-3">
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-2.5 w-full mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-md dark:shadow-black/20 flex flex-col items-center justify-center space-y-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    </div>
);


const GradeCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md dark:shadow-black/20 overflow-hidden p-5 space-y-4">
        <Skeleton className="h-5 w-1/2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
        </div>
        <Skeleton className="h-12 rounded-lg" />
    </div>
);


export const GradesScreenSkeleton: React.FC = () => (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg dark:shadow-black/20 text-center space-y-4">
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <div className="text-right space-y-3 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </div>
        <div className="lg:col-span-8 mt-8 lg:mt-0 space-y-4">
            <Skeleton className="h-6 w-1/3 mx-auto mb-4" />
            <GradeCardSkeleton />
            <GradeCardSkeleton />
        </div>
    </div>
);

const HonorBoardRowSkeleton: React.FC = () => (
    <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-2 space-x-reverse w-1/4">
             <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center space-x-3 space-x-reverse w-1/2 justify-end">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <Skeleton className="h-5 w-12" />
    </div>
);


export const HonorBoardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-lg dark:shadow-black/20">
        <Skeleton className="h-7 w-1/3 mx-auto mb-6" />
        <div className="flex justify-between items-center px-4 py-2 border-b-2 border-slate-200 dark:border-slate-800">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 10 }).map((_, i) => <HonorBoardRowSkeleton key={i} />)}
        </div>
    </div>
);
