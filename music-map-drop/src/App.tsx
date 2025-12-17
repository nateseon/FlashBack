import './index.css';
import { useMemo, useState } from 'react';
import { MapComponent } from './components/Map';
import { DropCreator } from './components/DropCreator';
import type { Drop } from './types/drop';

const seedDrops: Drop[] = [
  {
    id: 'seoul-1',
    title: 'N Seoul Tower',
    artist: 'City Nights',
    mood: 'night',
    text: '남산 야경이 진짜 예술',
    lat: 37.5512,
    lng: 126.9882,
    createdAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: 'seoul-2',
    title: 'Seoul City Hall',
    artist: 'Rainy Mood',
    mood: 'calm',
    text: '비 오는 날의 시청 앞 느낌',
    lat: 37.5665,
    lng: 126.9780,
    createdAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'sea-1',
    title: 'Seattle Downtown',
    artist: 'Chill Vibes',
    mood: 'chill',
    text: 'Pike Place Market 근처 감성',
    lat: 47.6062,
    lng: -122.3321,
    createdAt: Date.now() - 1000 * 60 * 2,
  },
];

const MyDropsList = ({ drops, onSelect }: { drops: Drop[]; onSelect: (drop: Drop) => void; }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      maxHeight: '35vh',
      overflowY: 'auto',
      background: 'rgba(0,0,0,0.75)',
      color: 'white',
      padding: '12px 16px',
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>My Drops ({drops.length})</div>
      {drops.length === 0 && <div style={{ color: '#bbb' }}>No drops yet. Add one from the modal.</div>}
      {drops.map((drop) => (
        <div
          key={drop.id}
          onClick={() => onSelect(drop)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#ffde59'
          }}>
            LP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {drop.title}
            </div>
            <div style={{ fontSize: 12, color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {drop.artist || 'Unknown Artist'} · {drop.mood || 'mood'}
            </div>
            {drop.text && (
              <div style={{ fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {drop.text}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

function App() {
  const [myDrops, setMyDrops] = useState<Drop[]>(seedDrops);
  const initialCenter = useMemo(
    () => ({ lat: seedDrops[0].lat, lng: seedDrops[0].lng }),
    []
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(initialCenter);

  const handleAddDrop = (drop: Drop) => {
    setMyDrops((prev) => [drop, ...prev]);
    setMapCenter({ lat: drop.lat, lng: drop.lng });
  };

  const handleSelectDrop = (drop: Drop) => {
    setMapCenter({ lat: drop.lat, lng: drop.lng });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 1. map (background) */}
      <MapComponent drops={myDrops} center={mapCenter} />
      
      {/* 2. music search (floating above the map) */}
      <DropCreator onAddDrop={handleAddDrop} />

      {/* 3. my drops list (bottom sheet style) */}
      <MyDropsList drops={myDrops} onSelect={handleSelectDrop} />
    </div>
  );
}

export default App;