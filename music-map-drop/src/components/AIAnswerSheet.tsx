import { useEffect, useState } from 'react';
import type { ItunesSong } from '../types/music';
import { searchMusic } from '../api/itunes';

interface AIAnswerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations?: ItunesSong[];
  title?: string;
}

export const AIAnswerSheet = ({
  isOpen,
  onClose,
  recommendations,
  title = 'AI Recommendations: Chill Songs'
}: AIAnswerSheetProps) => {
  const [songs, setSongs] = useState<ItunesSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (recommendations && recommendations.length > 0) {
        setSongs(recommendations);
      } else {
        setIsLoading(true);
        searchMusic('chill songs').then(results => {
          setSongs(results);
          setIsLoading(false);
        }).catch(error => {
          console.error('Failed to fetch AI recommendations:', error);
          setSongs([]);
          setIsLoading(false);
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, recommendations]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-3xl z-50 max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col animate-slide-up safe-area-bottom">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 active:text-white hover:text-white transition-colors touch-manipulation p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-400">Loading recommendations...</div>
          ) : songs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              No recommendations available.
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {songs.map((song) => (
                <div
                  key={song.trackId}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-700/50 active:bg-gray-700 hover:bg-gray-700 rounded-xl transition-colors cursor-pointer touch-manipulation"
                >
                  <img
                    src={song.artworkUrl100 || '/vite.svg'}
                    alt={song.trackName}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/vite.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm sm:text-base font-semibold truncate">{song.trackName}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{song.artistName}</p>
                  </div>
                  {song.previewUrl && (
                    <a
                      href={song.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary-400 active:text-primary-300 hover:text-primary-300 flex-shrink-0"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
