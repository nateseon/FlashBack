import { useState } from 'react';
import { searchMusic } from '../api/itunes';
import type { ItunesSong } from '../types/music';

interface MusicSearchProps {
  onSongSelect?: (song: ItunesSong) => void;
}

export const MusicSearch = ({ onSongSelect }: MusicSearchProps) => {
  const [term, setTerm] = useState('');
  const [songs, setSongs] = useState<ItunesSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;

    setIsLoading(true);
    const results = await searchMusic(term);
    setSongs(results);
    setIsLoading(false);
  };

  const handleSongClick = (song: ItunesSong) => {
    onSongSelect?.(song);
  };

  return (
    <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-[90%] max-w-md bg-gray-800/95 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 z-30">
      {/* search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search for a song or artist 🎵"
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 text-white text-sm sm:text-base rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
        >
          {isLoading ? '...' : 'Search'}
        </button>
      </form>

      {/* result list */}
      {songs.length > 0 && (
        <div className="mt-3 sm:mt-4 max-h-[60vh] sm:max-h-96 overflow-y-auto space-y-2 -mx-3 sm:-mx-4 px-3 sm:px-4">
          {songs.map((song) => (
            <div
              key={song.trackId}
              onClick={() => handleSongClick(song)}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700/50 active:bg-gray-700 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors touch-manipulation"
            >
              <img 
                src={song.artworkUrl100} 
                alt={song.trackName} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-xs sm:text-sm truncate">
                  {song.trackName}
                </div>
                <div className="text-gray-400 text-xs truncate">
                  {song.artistName}
                </div>
              </div>
              {song.previewUrl && (
                <a 
                  href={song.previewUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-400 hover:text-primary-300 text-lg sm:text-xl flex-shrink-0"
                >
                  ▶️
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};