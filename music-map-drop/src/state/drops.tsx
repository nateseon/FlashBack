import React, { createContext, useContext, useMemo, useState } from 'react';
import type { MusicDrop } from '../types/music';

type DropsContextValue = {
  drops: MusicDrop[];
  addDrop: (drop: MusicDrop) => void;
  getDropById: (id: string) => MusicDrop | undefined;
};

const DropsContext = createContext<DropsContextValue | null>(null);

const mockDrops: MusicDrop[] = [
  {
    id: 'mock_1',
    song: {
      trackId: 1440935467,
      trackName: 'Midnight City',
      artistName: 'M83',
      collectionName: "Hurry Up, We're Dreaming",
      artworkUrl100:
        'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/9c/99/5a/9c995a83-8394-7f23-8c23-4e3b2c4e3b2c/source/100x100bb.jpg',
      releaseDate: '2011-10-17T07:00:00Z',
    },
    text: 'First date song',
    tags: ['romantic', 'night'],
    location: { lat: 47.6205, lng: -122.3493 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock_2',
    song: {
      trackId: 1503211878,
      trackName: 'Blinding Lights',
      artistName: 'The Weeknd',
      collectionName: 'After Hours',
      artworkUrl100:
        'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/a1/2b/3a/a12b3a4f-5c5d-8e8f-9a9b-0c0d1e2f3a4b/source/100x100bb.jpg',
      releaseDate: '2019-11-29T08:00:00Z',
    },
    text: 'Always listen when driving',
    tags: ['energetic', 'night'],
    location: { lat: 47.6062, lng: -122.3321 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock_3',
    song: {
      trackId: 209315681,
      trackName: 'Electric Feel',
      artistName: 'MGMT',
      collectionName: 'Oracular Spectacular',
      artworkUrl100:
        'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/b2/c3/4d/b2c34d5e-6f6g-9h9i-0j0k-1l2m3n4o5p6q/source/100x100bb.jpg',
      releaseDate: '2008-06-10T07:00:00Z',
    },
    text: 'Memory from a party',
    tags: ['happy', 'energetic'],
    location: { lat: 47.6097, lng: -122.3331 },
    createdAt: new Date().toISOString(),
  },
];

export function DropsProvider({ children }: { children: React.ReactNode }) {
  const [drops, setDrops] = useState<MusicDrop[]>(mockDrops);

  const value = useMemo<DropsContextValue>(() => {
    return {
      drops,
      addDrop: (drop) => {
        setDrops((prev) => [drop, ...prev]);
      },
      getDropById: (id) => drops.find((d) => d.id === id),
    };
  }, [drops]);

  return <DropsContext.Provider value={value}>{children}</DropsContext.Provider>;
}

export function useDrops() {
  const ctx = useContext(DropsContext);
  if (!ctx) throw new Error('useDrops must be used within DropsProvider');
  return ctx;
}


