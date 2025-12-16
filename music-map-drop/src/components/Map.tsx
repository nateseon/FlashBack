import { useNavigate } from 'react-router-dom';
import { APIProvider, AdvancedMarker, Map, Marker } from '@vis.gl/react-google-maps';
import type { MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import type { MusicDrop } from '../types/music';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;

if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.error('⚠️ Google Maps API key is missing or not set!');
  console.error('Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
}

interface MapComponentProps {
  drops?: MusicDrop[];
}

export const MapComponent = ({ drops = [] }: MapComponentProps) => {
  const navigate = useNavigate();
  const defaultCenter = { lat: 47.6205, lng: -122.3493 };

  const handleMarkerClick = (dropId: string) => {
    navigate(`/card/${dropId}`);
  };

  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>⚠️ Google Maps API Key Missing</h2>
        <p>Please set VITE_GOOGLE_MAPS_API_KEY in your .env file</p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Check the console for more details
        </p>
      </div>
    );
  }

  const MarkerComponent = MAP_ID ? AdvancedMarker : Marker;

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={MAP_ID}
          onCameraChanged={(ev: MapCameraChangedEvent) =>
            console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
          }
        >
          {drops.map((drop) => (
            <MarkerComponent
              key={drop.id}
              position={drop.location}
              title={drop.song.trackName}
              onClick={() => handleMarkerClick(drop.id)}
            >
              {MAP_ID && (
                <div
                  className="flex flex-col items-center cursor-pointer"
                  style={{ transform: 'translate(-50%, -100%)' }}
                >
                  <div className="relative w-12 h-12 rounded-full bg-gray-800 border-2 border-primary-500 shadow-lg overflow-hidden">
                    <img
                      src={drop.song.artworkUrl100 || '/vite.svg'}
                      alt={drop.song.trackName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/vite.svg';
                      }}
                    />
                    <div className="absolute w-3 h-3 rounded-full bg-gray-900 border border-gray-700 z-10 inset-0 m-auto" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full shadow-md whitespace-nowrap max-w-[120px] truncate">
                    {drop.song.trackName}
                  </div>
                </div>
              )}
            </MarkerComponent>
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};
