'use client';

import { useAudio } from '@/lib/AudioProvider';
import { Play, Pause, X } from 'lucide-react';

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const AudioPlayer = () => {
  const { 
    audioUrl, 
    postTitle, 
    isPlaying, 
    duration, 
    currentTime, 
    togglePlayPause, 
    seek, 
    playAudio 
  } = useAudio();

  const closePlayer = () => {
    playAudio(null, null);
  };

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 flex items-center justify-between z-50">
      <div className="flex items-center space-x-4 flex-grow">
        <button onClick={togglePlayPause} className="text-white">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="flex items-center space-x-2 flex-grow">
          <span className="text-white text-sm w-12 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-400 text-sm w-12">{formatTime(duration)}</span>
        </div>
        <div className="w-1/3">
          <p className="text-white font-semibold truncate">{postTitle || 'Audio'}</p>
        </div>
      </div>
      <button onClick={closePlayer} className="text-gray-400 hover:text-white ml-4">
        <X size={24} />
      </button>
    </div>
  );
};

export default AudioPlayer;
