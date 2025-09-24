import React, { useState, useEffect } from 'react';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import FolderIcon from '../components/icons/FolderIcon';
import CameraIcon from '../components/icons/CameraIcon';
import type { PhotoSet, Photo } from '../types';
import { supabase } from '../lib/supabase';
import Spinner from '../components/Spinner';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import XIcon from '../components/icons/XIcon';

const EmptyState: React.FC<{ icon: React.ElementType; message: string }> = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 p-8 rounded-2xl h-64 shadow-lg dark:shadow-blue-900/30">
    <Icon className="w-16 h-16 text-zinc-400 dark:text-zinc-500 mb-4" />
    <p className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">{message}</p>
  </div>
);

const HomeworkScreen: React.FC = () => (
    <EmptyState icon={BookOpenIcon} message="لا يوجد واجبات لك الآن" />
);

const NotesScreen: React.FC = () => (
    <EmptyState icon={FolderIcon} message="لا يوجد كتب لك الآن" />
);

const ImageViewer: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-zinc-300 z-50" aria-label="Close image viewer">
                <XIcon className="w-8 h-8"/>
            </button>
            <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                <img src={imageUrl} alt="Full screen view" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            </div>
        </div>
    );
};

const PhotosScreen: React.FC = () => {
    const [photoSets, setPhotoSets] = useState<PhotoSet[]>([]);
    const [loadingSets, setLoadingSets] = useState(true);
    
    const [selectedSet, setSelectedSet] = useState<PhotoSet | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);

    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchPhotoSets = async () => {
            try {
                setLoadingSets(true);
                const { data, error } = await supabase
                    .from('photo_sets')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setPhotoSets(data);
            } catch (error) {
                console.error('Error fetching photo sets:', error);
            } finally {
                setLoadingSets(false);
            }
        };
        fetchPhotoSets();
    }, []);

    const handleViewPhotos = async (set: PhotoSet) => {
        setSelectedSet(set);
        try {
            setLoadingPhotos(true);
            const { data, error } = await supabase
                .from('photos')
                .select('*')
                .eq('photo_set_id', set.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setPhotos(data as Photo[]);
        } catch (error) {
            console.error(`Error fetching photos for set ${set.id}:`, error);
            setPhotos([]);
        } finally {
            setLoadingPhotos(false);
        }
    };
    
    const handleBackToSets = () => {
        setSelectedSet(null);
        setPhotos([]);
    };

    if (loadingSets) return <Spinner />;

    if (selectedSet) {
        return (
            <>
                {selectedImageUrl && <ImageViewer imageUrl={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />}
                <div className="flex items-center mb-6">
                    <button onClick={handleBackToSets} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" aria-label="Back to photo sets">
                        <ArrowRightIcon className="w-6 h-6"/>
                    </button>
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mr-4">{selectedSet.title}</h2>
                </div>
                {loadingPhotos ? <Spinner /> : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {photos.length > 0 ? photos.map(photo => (
                            <button key={photo.id} className="aspect-square bg-white dark:bg-zinc-900 rounded-lg shadow-md dark:shadow-blue-900/20 overflow-hidden group transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={() => setSelectedImageUrl(photo.image_url)}>
                                <img src={photo.image_url} alt={`Photo ${photo.id}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </button>
                        )) : (
                            <p className="col-span-full text-center text-zinc-500 dark:text-zinc-400 py-10">لا توجد صور في هذه المجموعة.</p>
                        )}
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            {photoSets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photoSets.map(set => (
                        <div key={set.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-md dark:shadow-blue-900/20 flex flex-col items-center justify-center text-center space-y-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <p className="font-bold text-zinc-800 dark:text-zinc-200">{set.title}</p>
                            <button onClick={() => handleViewPhotos(set)} className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                                <CameraIcon className="w-5 h-5 ml-2" />
                                عرض
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                 <EmptyState icon={CameraIcon} message="لا توجد صور متاحة الآن" />
            )}
        </>
    );
};

// This wrapper component is needed for React.lazy to work correctly with named exports
const MiscScreens: React.FC<{ screen: 'homework' | 'notes' | 'photos' }> = ({ screen }) => {
    switch (screen) {
        case 'homework':
            return <HomeworkScreen />;
        case 'notes':
            return <NotesScreen />;
        case 'photos':
            return <PhotosScreen />;
        default:
            return null;
    }
};

export default MiscScreens;