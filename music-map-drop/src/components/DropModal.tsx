import { useState, useEffect } from 'react';
import type { ItunesSong, MusicDrop } from '../types/music';

interface DropModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSong: ItunesSong | null;
  onDrop: (drop: MusicDrop) => void;
}

const TAGS = ['chill', 'sad', 'night', 'happy', 'romantic', 'energetic', 'nostalgic'];

export const DropModal = ({ isOpen, onClose, selectedSong, onDrop }: DropModalProps) => {
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때만 텍스트와 태그 초기화 (위치는 유지)
      setText('');
      setSelectedTags([]);
      setLocationError(null);
      
      // 위치가 없을 때만 위치 가져오기
      if (!location) {
        // 현재 위치 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const loc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setLocation(loc);
              setLocationError(null);
            },
            (error) => {
              setLocationError('Unable to get location.');
              // 기본값으로 시애틀 위치 사용
              const defaultLoc = { lat: 47.6205, lng: -122.3493 };
              setLocation(defaultLoc);
            }
          );
        } else {
          setLocationError('Geolocation is not supported.');
          const defaultLoc = { lat: 47.6205, lng: -122.3493 };
          setLocation(defaultLoc);
        }
      }
    }
    // 모달이 닫힐 때는 상태를 유지 (다음에 열 때 초기화됨)
  }, [isOpen]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDrop = () => {
    if (!selectedSong) {
      return;
    }
    
    if (!location) {
      return;
    }

    const newDrop: MusicDrop = {
      id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      song: selectedSong,
      text,
      tags: selectedTags,
      location,
      createdAt: new Date().toISOString(),
    };

    onDrop(newDrop);
    
    // 초기화
    setText('');
    setSelectedTags([]);
    
    // 모달 닫기 (약간의 딜레이를 주어 상태 업데이트가 완료되도록)
    setTimeout(() => {
      onClose();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-end"
        onClick={onClose}
      >
        {/* 모달 */}
        <div
          className="w-full bg-gray-800 rounded-t-3xl sm:rounded-t-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Drop Music</h2>
              <button
                onClick={onClose}
                className="text-gray-400 active:text-white hover:text-white transition-colors touch-manipulation p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 선택된 곡 카드 */}
            {selectedSong && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-700/50 rounded-xl">
                <img
                  src={selectedSong.artworkUrl100 || '/vite.svg'}
                  alt={selectedSong.trackName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0 bg-gray-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/vite.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm sm:text-base font-semibold truncate">{selectedSong.trackName}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{selectedSong.artistName}</p>
                </div>
              </div>
            )}

            {/* 텍스트 입력 */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Share Your Memory
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share a memory with this song..."
                className="w-full h-28 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 text-white text-sm sm:text-base rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 태그 선택 */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Select Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 active:bg-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 위치 정보 */}
            {location && (
              <div className="text-xs text-gray-400">
                Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            )}
            {locationError && (
              <div className="text-xs text-yellow-400">{locationError}</div>
            )}

            {/* 등록 버튼 (Week1에서는 서버 저장이 아니라 로컬 상태에 추가) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDrop();
              }}
              disabled={!selectedSong || !location}
              className="w-full py-2.5 sm:py-3 bg-primary-600 active:bg-primary-700 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-base sm:text-lg font-bold rounded-lg transition-colors touch-manipulation"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

