import React, { useRef } from 'react';
import { TreeMode } from '../types';

interface UIOverlayProps {
  mode: TreeMode;
  onToggle: () => void;
  onPhotosUpload: (photos: string[]) => void;
  hasPhotos: boolean;
  onReplacePhotos?: () => void; // New prop for replacing photos
  photoDisplayMode?: 'random' | 'sequential'; // New prop for photo display mode
  onPhotoDisplayModeChange?: (mode: 'random' | 'sequential') => void; // New prop for changing display mode
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  mode, 
  onToggle, 
  onPhotosUpload, 
  hasPhotos, 
  onReplacePhotos,
  photoDisplayMode = 'random',
  onPhotoDisplayModeChange
}) => {
  const isFormed = mode === TreeMode.FORMED;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const photoUrls: string[] = [];
    const readers: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });

      readers.push(promise);
    }

    Promise.all(readers).then((urls) => {
      onPhotosUpload(urls);
    });
  };

  const handleReplacePhotos = () => {
    // Clear current photos by calling replace function
    if (onReplacePhotos) {
      onReplacePhotos();
    }
    // Then trigger file selection
    fileInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5E6BF] to-[#D4AF37] font-serif drop-shadow-lg tracking-wider text-center">
          Merry Christmas
        </h1>
      </header>

      {/* Control Panel */}
      {/* <div className="flex flex-col items-center mb-8 pointer-events-auto">
        <button
          onClick={onToggle}
          className={`
            group relative px-12 py-4 border-2 border-[#D4AF37] 
            bg-black/50 backdrop-blur-md overflow-hidden transition-all duration-500
            hover:shadow-[0_0_30px_#D4AF37] hover:border-[#fff]
          `}
        >
          <div className={`absolute inset-0 bg-[#D4AF37] transition-transform duration-500 ease-in-out origin-left ${isFormed ? 'scale-x-0' : 'scale-x-100'} opacity-10`}></div>
          
          <span className="relative z-10 font-serif text-xl md:text-2xl text-[#D4AF37] tracking-[0.2em] group-hover:text-white transition-colors">
            {isFormed ? 'UNLEASH CHAOS' : 'RESTORE ORDER'}
          </span>
        </button>
        
        <p className="mt-4 text-[#F5E6BF] font-serif text-xs opacity-50 tracking-widest text-center max-w-md">
          {isFormed 
            ? "A magnificent assembly of the finest ornaments. Truly spectacular." 
            : "Creative potential unleashed. Waiting to be made great again."}
        </p>
      </div> */}

      {/* Decorative Corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37] opacity-50"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37] opacity-50"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37] opacity-50"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37] opacity-50"></div>
      
      {/* Photo Upload Button - Bottom Right Corner */}
      <div className="absolute bottom-8 right-8 z-20 pointer-events-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={hasPhotos ? handleReplacePhotos : handleUploadClick}
          className="p-3 bg-black/70 backdrop-blur-sm border border-[#D4AF37]/50 rounded-full shadow-lg hover:bg-black/80 transition-all duration-300 group"
          aria-label={hasPhotos ? "替换照片" : "上传照片"}
        >
          {/* Photo Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#D4AF37] group-hover:text-white transition-colors duration-300"
          >
            <path
              d="M12 9C13.66 9 15 7.66 15 6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6C9 7.66 10.34 9 12 9Z"
              fill="currentColor"
            />
            <path
              d="M12 11C9.67 11 4 12.17 4 14.5V17H20V14.5C20 12.17 14.33 11 12 11Z"
              fill="currentColor"
            />
            <path
              d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
              fill="currentColor"
            />
          </svg>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            {hasPhotos ? '替换照片' : '上传照片'}
          </div>
        </button>
      </div>
      
      {/* Photo Display Mode Selector - Only show when photos are uploaded */}
      {hasPhotos && (
        <div className="absolute bottom-8 right-20 z-20 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm border border-[#D4AF37]/50 rounded-lg shadow-lg p-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPhotoDisplayModeChange && onPhotoDisplayModeChange('random')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  photoDisplayMode === 'random' 
                    ? 'bg-[#D4AF37] text-black' 
                    : 'text-[#D4AF37] hover:bg-[#D4AF37]/20'
                }`}
              >
                随机
              </button>
              <button
                onClick={() => onPhotoDisplayModeChange && onPhotoDisplayModeChange('sequential')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  photoDisplayMode === 'sequential' 
                    ? 'bg-[#D4AF37] text-black' 
                    : 'text-[#D4AF37] hover:bg-[#D4AF37]/20'
                }`}
              >
                顺序
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};