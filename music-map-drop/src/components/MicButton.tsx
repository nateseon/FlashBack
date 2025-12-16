import { useState } from 'react';

interface MicButtonProps {
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export const MicButton = ({ onStartRecording, onStopRecording }: MicButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = () => {
    if (isRecording) {
      setIsRecording(false);
      onStopRecording?.();
      console.log('녹음 중지');
    } else {
      setIsRecording(true);
      onStartRecording?.();
      console.log('녹음 시작');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative w-16 h-16 rounded-full
        flex items-center justify-center
        transition-all duration-300
        ${isRecording 
          ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
          : 'bg-primary-600 hover:bg-primary-700 shadow-lg'
        }
      `}
    >
      {/* 글로우 효과 */}
      {isRecording && (
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
      )}
      
      {/* 링 효과 */}
      {isRecording && (
        <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-pulse" />
      )}

      {/* 마이크 아이콘 */}
      <svg
        className={`w-8 h-8 text-white ${isRecording ? 'animate-pulse' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  );
};

