import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import type { MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import type { Drop } from '../types/drop';

console.log('VITE key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// Debug: surface the key detection in devtools (remove for production)
console.log("VITE_GOOGLE_MAPS_API_KEY =", API_KEY);

// Debug: Check if API key is loaded (remove in production)
if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.error('⚠️ Google Maps API key is missing or not set!');
  console.error('Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
}

type MapComponentProps = {
  drops: Drop[];
  center: { lat: number; lng: number };
};

export const MapComponent = ({ drops, center }: MapComponentProps) => {
  // initial location fallback: Seattle
  const defaultCenter = { lat: 47.6205, lng: -122.3493 };
  
  // Show error message if API key is missing
  if (!API_KEY || API_KEY === 'VITE_GOOGLE_MAPS_API_KEY') {
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

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Map
          defaultCenter={defaultCenter}
          center={center || defaultCenter}
          defaultZoom={13}
          gestureHandling={'greedy'} // improve mobile touch experience
          disableDefaultUI={true}    // hide default UI
          onCameraChanged={(ev: MapCameraChangedEvent) =>
            console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
          }
        >
          {drops.map((drop) => (
            <Marker
              key={drop.id}
              position={{ lat: drop.lat, lng: drop.lng }}
              title={drop.title}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
};