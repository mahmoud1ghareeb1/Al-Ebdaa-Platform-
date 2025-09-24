import React from 'react';

interface AvatarProps {
  src: string | null | undefined;
  name: string | null | undefined;
  sizeClass?: string;
  textClass?: string;
}

const getInitials = (name: string = ''): string => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({ src, name, sizeClass = 'w-24 h-24', textClass = 'text-4xl' }) => {
  if (src) {
    return <img src={src} alt={name || 'User Avatar'} className={`${sizeClass} rounded-full object-cover w-full h-full`} />;
  }

  return (
    <div className={`${sizeClass} rounded-full bg-blue-600 flex items-center justify-center text-white font-bold ${textClass}`}>
      <span>{getInitials(name || '')}</span>
    </div>
  );
};

export default Avatar;
