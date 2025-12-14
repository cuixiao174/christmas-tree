import React, { useRef, useState } from 'react';
import { TreeMode } from '../types';

interface UIOverlayProps {
  mode: TreeMode;
  onToggle: () => void;
  onPhotosUpload: (photos: string[]) => void;
  hasPhotos: boolean;
  onReplacePhotos?: () => void; // New prop for replacing photos
  photoDisplayMode?: 'random' | 'sequential'; // New prop for photo display mode
  onPhotoDisplayModeChange?: (mode: 'random' | 'sequential') => void; // New prop for changing display mode
  uploadedPhotos?: string[]; // New prop for uploaded photos
  photoLabels?: string[]; // New prop for photo labels array
  onPhotoLabelChange?: (index: number, label: string) => void; // New prop for changing individual photo label
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  mode, 
  onToggle, 
  onPhotosUpload, 
  hasPhotos, 
  onReplacePhotos,
  photoDisplayMode = 'random',
  onPhotoDisplayModeChange,
  uploadedPhotos = [],
  photoLabels = [],
  onPhotoLabelChange
}) => {
  const isFormed = mode === TreeMode.FORMED;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [tempLabelText, setTempLabelText] = useState(photoLabels[0] || "Happy Memories");
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);

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

  const handleEditLabel = () => {
    setIsEditingLabel(true);
  };

  const handleSaveLabel = () => {
    if (onPhotoLabelChange && editingPhotoIndex !== null) {
      onPhotoLabelChange(editingPhotoIndex, tempLabelText);
    }
    setEditingPhotoIndex(null);
    setTempLabelText("Happy Memories");
  };

  const handleCancelEdit = () => {
    setEditingPhotoIndex(null);
    setTempLabelText("Happy Memories");
  };

  const handlePhotoEdit = (index: number) => {
    setEditingPhotoIndex(index);
    setTempLabelText(photoLabels[index] || "Happy Memories");
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempLabelText(e.target.value);
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
      
      {/* Photo Label Editor - Bottom Left Corner */}
      {hasPhotos && (
        <div className="absolute bottom-8 left-8 z-20 pointer-events-auto">
          {/* Edit Button */}
          <button
            onClick={handleEditLabel}
            className="p-3 bg-black/70 backdrop-blur-sm border border-[#D4AF37]/50 rounded-full shadow-lg hover:bg-black/80 transition-all duration-300 group"
            aria-label="编辑照片标签"
          >
            {/* Edit Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#D4AF37] group-hover:text-white transition-colors duration-300"
            >
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="currentColor"
              />
            </svg>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              编辑照片标签
            </div>
          </button>
        </div>
      )}
      
      {/* Photo Edit Modal */}
      {isEditingLabel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-black/80 border border-[#D4AF37]/50 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-[#D4AF37]">编辑照片标签</h2>
                <button
                  onClick={() => setIsEditingLabel(false)}
                  className="p-2 rounded-full hover:bg-[#D4AF37]/20 transition-colors"
                  aria-label="关闭"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#D4AF37]">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="bg-black/50 border border-[#D4AF37]/30 rounded-lg p-3">
                    <div className="aspect-square mb-3 overflow-hidden rounded">
                      <img 
                        src={photo} 
                        alt={`照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {editingPhotoIndex === index ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={tempLabelText}
                          onChange={handleLabelChange}
                          className="w-full bg-black/50 text-white border border-[#D4AF37]/30 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#D4AF37]"
                          placeholder="输入标签文本"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveLabel}
                            className="flex-1 p-1 bg-[#D4AF37] text-black rounded text-sm hover:bg-[#D4AF37]/80 transition-colors"
                          >
                            保存
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 p-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[#D4AF37] text-sm text-center truncate">
                          {photoLabels[index] || "Happy Memories"}
                        </div>
                        <button
                          onClick={() => handlePhotoEdit(index)}
                          className="w-full p-1 border border-[#D4AF37]/30 rounded text-[#D4AF37] text-sm hover:bg-[#D4AF37]/20 transition-colors"
                        >
                          编辑
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
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