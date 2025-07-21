import React from 'react';
import { X, PlayCircle } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-lg w-full relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110 transform"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <PlayCircle className="relative w-20 h-20 text-blue-600 mx-auto" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Demo Video Coming Soon!
          </h3>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            We're crafting an amazing demo video that showcases the incredible journey our students take. 
            It will be available very soon!
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 transform shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
