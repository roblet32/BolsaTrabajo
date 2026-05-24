import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

// Corregir bug de iconos de Leaflet en compilaciones de Vite/React
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

// Icono personalizado para el prestador en edición
const providerEditIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-teal.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Función robusta para parsear coordenadas de textos y enlaces de Google Maps
const parseCoordinates = (input: string): { lat: number; lng: number } | null => {
  if (!input || !input.trim()) return null;

  // 1. Intentar buscar coordenadas directas como "lat, lng" o "lat lng" (ej. "21.2185, -99.4735")
  const directRegex = /^\s*(-?\d+(\.\d+)?)\s*[\s,]\s*(-?\d+(\.\d+)?)\s*$/;
  const directMatch = input.match(directRegex);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[3]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 2. Intentar buscar coordenadas en un URL de Google Maps (formato @lat,lng,zoom o q=lat,lng)
  // Ej: https://www.google.com/maps/@21.2185,-99.4735,15z
  const urlRegex1 = /@(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/;
  const match1 = input.match(urlRegex1);
  if (match1) {
    const lat = parseFloat(match1[1]);
    const lng = parseFloat(match1[3]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Ej: https://www.google.com/maps/place/21.2185,-99.4735
  const urlRegex2 = /[?&/](?:q|query|ll|saddr|daddr|place|center)=?(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/;
  const match2 = input.match(urlRegex2);
  if (match2) {
    const lat = parseFloat(match2[1]);
    const lng = parseFloat(match2[3]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // 3. Intentar extraer cualesquiera dos números decimales que parezcan coordenadas dentro de una URL de Maps
  const genericCoordsInUrl = /(-?\d+\.\d{3,})\s*,\s*(-?\d+\.\d{3,})/;
  const matchGeneric = input.match(genericCoordsInUrl);
  if (matchGeneric) {
    const lat = parseFloat(matchGeneric[1]);
    const lng = parseFloat(matchGeneric[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  return null;
};

interface MapEventsProps {
  onMapClick: (lat: number, lng: number) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Componente controlador para reajustar el mapa cuando cambian las coordenadas
const MapController: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);

  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat,
  initialLng,
  onLocationChange
}) => {
  const { theme } = useApp();
  const [position, setPosition] = useState<[number, number]>([
    initialLat || 21.2185,
    initialLng || -99.4735
  ]);
  const [urlInput, setUrlInput] = useState('');
  const [parseError, setParseError] = useState('');

  const markerRef = useRef<L.Marker>(null);

  // Manejar el arrastre del pin
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
          onLocationChange(latLng.lat, latLng.lng);
          setUrlInput(`${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`);
          setParseError('');
        }
      },
    }),
    [onLocationChange]
  );

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
    setUrlInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setParseError('');
  };

  // Sincronizar posición y campo de entrada cuando cambian externamente
  useEffect(() => {
    const targetLat = initialLat || 21.2185;
    const targetLng = initialLng || -99.4735;
    setPosition([targetLat, targetLng]);
    setUrlInput(`${targetLat.toFixed(6)}, ${targetLng.toFixed(6)}`);
  }, [initialLat, initialLng]);

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    if (!val.trim()) {
      setParseError('');
      return;
    }
    const coords = parseCoordinates(val);
    if (coords) {
      setPosition([coords.lat, coords.lng]);
      onLocationChange(coords.lat, coords.lng);
      setParseError('');
    } else {
      setParseError('No se encontraron coordenadas en el texto o enlace pegado.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {/* Campo de entrada para pegar link o coordenadas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-dark-primary)' }}>
          📍 Enlace de Google Maps o Coordenadas directas
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Pega un enlace de Google Maps o coordenadas (ej: 21.2185, -99.4735)"
            value={urlInput}
            onChange={handleUrlInputChange}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--bg-dark-card-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.8rem',
              color: 'var(--text-dark-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'var(--transition-fast)',
              width: '100%'
            }}
          />
        </div>
        {parseError && (
          <span style={{ fontSize: '0.75rem', color: '#f87171', display: 'block', marginTop: '0.1rem' }}>
            ⚠️ {parseError}
          </span>
        )}
      </div>

      {/* Contenedor del Mapa */}
      <div style={{ height: '320px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--bg-dark-card-border)' }}>
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {(() => {
            const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
            if (mapboxToken) {
              const styleId = theme === 'light' ? 'light-v11' : 'dark-v11';
              return (
                <TileLayer
                  attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                  url={`https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
                />
              );
            } else {
              const tileUrl = theme === 'light'
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
              return (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url={tileUrl}
                />
              );
            }
          })()}
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={providerEditIcon}
          />
          <MapEvents onMapClick={handleMapClick} />
          <MapController coords={position} />
        </MapContainer>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
        * Arrastra el marcador verde o haz clic en cualquier parte del mapa para marcar tu ubicación exacta.
      </div>
    </div>
  );
};

export default LocationPicker;
