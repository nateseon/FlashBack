import React, { useState } from 'react';
import { searchMusic } from '../api/itunes';
import type { ItunesSong } from '../types/music';
import type { Drop } from '../types/drop';

type DropCreatorProps = {
  onAddDrop: (drop: Drop) => void;
  onGeolocationError?: (error: GeolocationPositionError) => void;
};

export const DropCreator = ({ onAddDrop, onGeolocationError }: DropCreatorProps) => {
  // 1. State Management (Search + Selected Song + Input Form)
  const [term, setTerm] = useState('');
  const [songs, setSongs] = useState<ItunesSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState<ItunesSong | null>(null); // Currently selected song
  
  // User Input State
  const [comment, setComment] = useState('');
  const [mood, setMood] = useState('happy');

  // 2. Music Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setIsLoading(true);
    const results = await searchMusic(term);
    setSongs(results);
    setIsLoading(false);
  };

  // 3. Drop Save Handler (Core Feature! - local state only)
  const handleSaveDrop = async () => {
    if (!selectedSong) return;
    setIsLoading(true);

    // Get current location (Browser built-in feature)
    if (!navigator.geolocation) {
      alert("Browser does not support geolocation.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const newDrop: Drop = {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
            title: selectedSong.trackName,
            artist: selectedSong.artistName,
            coverUrl: selectedSong.artworkUrl100,
            previewUrl: selectedSong.previewUrl,
            text: comment,
            mood: mood,
            lat: latitude,
            lng: longitude,
            createdAt: Date.now(),
          };

          // Add to local state via parent handler
          onAddDrop(newDrop);

          alert("🎉 Memory dropped locally! (map + list updated)");
          
          // Reset (Back to search screen)
          setSelectedSong(null);
          setTerm('');
          setSongs([]);
          setComment('');
        } catch (error) {
          console.error("Save Failed:", error);
          alert("Failed to save drop. Please try again.");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Location Error:", error);
        if (onGeolocationError) {
          onGeolocationError(error);
        } else {
          alert("Cannot retrieve location. Please enable GPS!");
        }
        setIsLoading(false);
      }
    );
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000
    }}>
      
      {/* CASE 1: No song selected (Search Screen) */}
      {!selectedSong ? (
        <>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search for a song or artist 🎵"
              style={{
                flex: 1, padding: '12px', borderRadius: '8px', 
                border: '1px solid #ddd', fontSize: '16px'
              }}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                padding: '0 20px', backgroundColor: '#FF2D55', color: 'white',
                border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {isLoading ? '...' : 'Search'}
            </button>
          </form>

          {songs.length > 0 && (
            <div style={{ marginTop: '16px', maxHeight: '400px', overflowY: 'auto' }}>
              {songs.map((song) => (
                <div 
                  key={song.trackId} 
                  onClick={() => setSelectedSong(song)} // Switch to selection mode on click
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 0', borderBottom: '1px solid #eee', cursor: 'pointer'
                  }}
                >
                  <img src={song.artworkUrl100} alt={song.trackName} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.trackName}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{song.artistName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* CASE 2: Song selected (Creation Screen) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Selected Song Display (includes Cancel button) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
            <img src={selectedSong.artworkUrl100} alt="cover" style={{ width: '40px', height: '40px', borderRadius: '4px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{selectedSong.trackName}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{selectedSong.artistName}</div>
            </div>
            <button onClick={() => setSelectedSong(null)} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#999', cursor: 'pointer' }}>✕ Cancel</button>
          </div>

          {/* Comment Input */}
          <textarea
            placeholder="Share your story about this song..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: '100%', height: '80px', padding: '10px',
              borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'none'
            }}
          />

          {/* Mood Selection */}
          <select 
            value={mood} 
            onChange={(e) => setMood(e.target.value)}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
          >
            <option value="happy">😄 Happy</option>
            <option value="sad">😢 Sad</option>
            <option value="calm">☕️ Calm</option>
            <option value="excited">🔥 Excited</option>
            <option value="romantic">💕 Romantic</option>
            <option value="angry">😠 Angry</option>
            <option value="melancholy">🌧️ Melancholy</option>
            <option value="nostalgic">📷 Nostalgic</option>
            <option value="confident">💪 Confident</option>
            <option value="dreamy">✨ Dreamy</option>
            <option value="lonely">🌙 Lonely</option>
            <option value="energetic">⚡ Energetic</option>
            <option value="peaceful">🕊️ Peaceful</option>
            <option value="hopeful">🌈 Hopeful</option>
          </select>

          {/* Save Button */}
          <button 
            onClick={handleSaveDrop}
            disabled={isLoading}
            style={{
              width: '100%', padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#007bff', // Grey when loading
              color: 'white', border: 'none', borderRadius: '8px',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
            }}
          >
            {isLoading ? 'Saving...' : 'Drop Here ✨'}
          </button>
        </div>
      )}
    </div>
  );
};