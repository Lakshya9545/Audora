'use client';

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

interface AudioContextType {
  audioUrl: string | null;
  postTitle: string | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  playAudio: (url: string | null, title: string | null) => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, []);

  const playAudio = (url: string | null, title: string | null) => {
    setAudioUrl(url);
    setPostTitle(title);
    if (audioRef.current && url) {
      audioRef.current.src = url;
      audioRef.current.play();
    } else if (audioRef.current && !url) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const value = {
    audioUrl,
    postTitle,
    isPlaying,
    duration,
    currentTime,
    playAudio,
    togglePlayPause,
    seek,
  };

  return (
    <AudioContext.Provider value={value}>
      <audio ref={audioRef} />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
