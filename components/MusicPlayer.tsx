import React, { useState, useRef, useEffect } from 'react';

interface MusicPlayerProps {
  musicSrc: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ musicSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(musicSrc);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musicSrc]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Play music with user interaction requirement
      audioRef.current.play().catch(error => {
        console.error("Failed to play music:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={toggleMusic}
      className="absolute top-6 left-6 z-50 p-3 bg-black/70 backdrop-blur-sm border border-[#D4AF37]/50 rounded-full shadow-lg hover:bg-black/80 transition-all duration-300 group"
      aria-label="Toggle music"
    >
      {/* Snowflake Icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${isPlaying ? 'text-[#D4AF37] animate-pulse' : 'text-gray-400'} transition-colors duration-300`}
      >
        <path
          d="M12 2L12 22M12 2L10 4M12 2L14 4M12 22L10 20M12 22L14 20M2 12L22 12M2 12L4 10M2 12L4 14M22 12L20 10M22 12L20 14M4.93 4.93L19.07 19.07M4.93 4.93L6.34 6.34M4.93 4.93L6.34 3.52M19.07 19.07L17.66 17.66M19.07 19.07L17.66 20.48M19.07 4.93L4.93 19.07M19.07 4.93L17.66 6.34M19.07 4.93L17.66 3.52M4.93 19.07L6.34 17.66M4.93 19.07L6.34 20.48"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        {isPlaying ? '关闭音乐' : '播放音乐'}
      </div>
    </button>
  );
};