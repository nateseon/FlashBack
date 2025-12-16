import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicSearch } from '../components/MusicSearch';
import { DropModal } from '../components/DropModal';
import type { ItunesSong, MusicDrop } from '../types/music';
import { useDrops } from '../state/drops';

export const DropPage = () => {
  const navigate = useNavigate();
  const { addDrop } = useDrops();
  const [selectedSong, setSelectedSong] = useState<ItunesSong | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);

  const handleSongSelect = (song: ItunesSong) => {
    setSelectedSong(song);
    setIsDropModalOpen(true);
  };

  const handleDrop = (newDrop: MusicDrop) => {
    addDrop(newDrop);
    navigate('/');
  };

  return (
    <div className="relative w-full h-full bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Drop Music</h1>
          <p className="text-sm sm:text-base text-gray-400">Find a song to drop with your memory</p>
        </div>
        
        <MusicSearch onSongSelect={handleSongSelect} />
      </div>

      <DropModal
        isOpen={isDropModalOpen}
        onClose={() => setIsDropModalOpen(false)}
        selectedSong={selectedSong}
        onDrop={handleDrop}
      />
    </div>
  );
};

