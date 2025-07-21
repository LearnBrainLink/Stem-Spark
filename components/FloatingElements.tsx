import React from 'react';
import { Rocket, Award, BookOpen, Users, Video, Briefcase } from 'lucide-react';

export const FloatingElements: React.FC = () => {
  const elements = [
    { Icon: Rocket, delay: '0s', position: 'top-20 left-10' },
    { Icon: Award, delay: '2s', position: 'top-40 right-20' },
    { Icon: BookOpen, delay: '4s', position: 'bottom-40 left-20' },
    { Icon: Users, delay: '1s', position: 'bottom-20 right-10' },
    { Icon: Video, delay: '3s', position: 'top-60 left-1/4' },
    { Icon: Briefcase, delay: '5s', position: 'bottom-60 right-1/3' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((element, index) => (
        <div
          key={index}
          className={`absolute ${element.position} animate-bounce opacity-10`}
          style={{ animationDelay: element.delay, animationDuration: '3s' }}
        >
          <element.Icon className="w-8 h-8 text-blue-400" />
        </div>
      ))}
    </div>
  );
};
