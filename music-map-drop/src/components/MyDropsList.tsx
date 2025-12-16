import { Link } from 'react-router-dom';
import type { MusicDrop } from '../types/music';

interface MyDropsListProps {
  drops: MusicDrop[];
}

export const MyDropsList = ({ drops }: MyDropsListProps) => {
  if (drops.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-20 sm:bottom-24 left-2 sm:left-4 right-2 sm:right-4 z-30 max-h-40 sm:max-h-48 overflow-y-auto">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 space-y-2 border border-gray-700 shadow-2xl">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-300 mb-2">My Drops</h3>
        <div className="space-y-1.5 sm:space-y-2">
          {drops.slice(0, 3).map((drop) => (
            <Link
              key={drop.id}
              to={`/card/${drop.id}`}
              className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-700/50 active:bg-gray-700 hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
            >
              <img
                src={drop.song.artworkUrl100 || '/vite.svg'}
                alt={drop.song.trackName}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 bg-gray-600"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/vite.svg';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs sm:text-sm font-medium truncate">{drop.song.trackName}</p>
                <p className="text-gray-400 text-xs truncate">{drop.song.artistName}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {drop.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 sm:px-2 py-0.5 bg-primary-600/20 text-primary-400 rounded text-[10px] sm:text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        {drops.length > 3 && (
          <p className="text-[10px] sm:text-xs text-gray-500 text-center pt-1 sm:pt-2">
            +{drops.length - 3} more
          </p>
        )}
      </div>
    </div>
  );
};

