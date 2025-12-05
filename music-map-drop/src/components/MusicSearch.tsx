import { useState } from 'react';
import { searchMusic } from '../api/itunes';
import type { ItunesSong } from '../types/music';

export const MusicSearch = () => {
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

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)', // slightly transparent
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000 // above the map
    }}>
      {/* search form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search for a song or artist 🎵"
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            padding: '0 20px',
            backgroundColor: '#FF2D55', // iTunes pink red
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {isLoading ? '...' : 'Search'}
        </button>
      </form>

      {/* result list */}
      {songs.length > 0 && (
        <div style={{ marginTop: '16px', maxHeight: '400px', overflowY: 'auto' }}>
          {songs.map((song) => (
            <div key={song.trackId} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: '1px solid #eee',
              cursor: 'pointer'
            }}>
              <img 
                src={song.artworkUrl100} 
                alt={song.trackName} 
                style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.trackName}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {song.artistName}
                </div>
              </div>
              {/* preview button (Optional) */}
              <a 
                href={song.previewUrl} 
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()} // prevent parent event
                style={{ fontSize: '20px', textDecoration: 'none' }}
              >
                ▶️
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};