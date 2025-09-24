
import React from 'react';
const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.211 2.211 0 0 1 6.827 3.185l.54 1.62a2.21 2.21 0 0 0 1.53 1.53l1.62.54a2.21 2.21 0 0 1 0 2.989l-1.62.54a2.21 2.21 0 0 0-1.53 1.53l-.54 1.62a2.21 2.21 0 0 1-2.989 0l-.54-1.62a2.21 2.21 0 0 0-1.53-1.53l-1.62-.54a2.21 2.21 0 0 1 0-2.989l1.62-.54a2.21 2.21 0 0 0 1.53-1.53l.54-1.62Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);
export default CameraIcon;
