import { useParams, useNavigate } from 'react-router-dom';
import { useDrops } from '../state/drops';

export const CardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDropById } = useDrops();

  const drop = id ? getDropById(id) : undefined;
  if (!drop) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center p-6 text-center text-gray-300">
        Drop not found.
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 active:text-white hover:text-white transition-colors touch-manipulation p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Drop Details</h1>
        </div>

        {/* 앨범 아트 */}
        <div className="flex justify-center">
          <img
            src={(drop.song.artworkUrl100 || '/vite.svg').replace('100x100', '600x600')}
            alt={drop.song.trackName}
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl object-cover shadow-2xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/vite.svg';
            }}
          />
        </div>

        {/* 곡 정보 */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{drop.song.trackName}</h2>
          <p className="text-lg sm:text-xl text-gray-400">{drop.song.artistName}</p>
          <p className="text-xs sm:text-sm text-gray-500">{drop.song.collectionName}</p>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 justify-center">
          {drop.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600/20 text-primary-400 rounded-full text-xs sm:text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 텍스트 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Memory</h3>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{drop.text}</p>
        </div>

        {/* 위치 정보 */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Location</h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            {drop.location.lat.toFixed(6)}, {drop.location.lng.toFixed(6)}
          </p>
        </div>

        {/* 날짜 */}
        <div className="text-center text-gray-500 text-sm">
          {new Date(drop.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
};

