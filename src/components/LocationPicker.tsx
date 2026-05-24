import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

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
  const urlRegex1 = /@(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/;
  const match1 = input.match(urlRegex1);
  if (match1) {
    const lat = parseFloat(match1[1]);
    const lng = parseFloat(match1[3]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

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

interface LocationPickerProps {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat,
  initialLng,
  onLocationChange
}) => {
  const { theme } = useApp();
  const [urlInput, setUrlInput] = useState('');
  const [parseError, setParseError] = useState('');
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  // Inicializar mapa nativo una sola vez
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const startLat = initialLat || 21.2185;
    const startLng = initialLng || -99.4735;

    // Crear el mapa nativo de Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 15,
      zoomControl: true,
    });

    // Cargar capa de azulejos (tiles)
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    let tileLayer: L.TileLayer;

    if (mapboxToken) {
      const styleId = theme === 'light' ? 'light-v11' : 'dark-v11';
      tileLayer = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      });
    } else {
      const tileUrl = theme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
      });
    }
    tileLayer.addTo(map);

    // Crear marcador arrastrable
    const marker = L.marker([startLat, startLng], {
      draggable: true,
      icon: providerEditIcon
    }).addTo(map);

    // Escuchar el arrastre del pin
    marker.on('dragend', () => {
      const latLng = marker.getLatLng();
      onLocationChange(latLng.lat, latLng.lng);
      setUrlInput(`${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`);
      setParseError('');
    });

    // Escuchar clics en el mapa para mover el pin
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
      setUrlInput(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
      setParseError('');
    });

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    // Forzar recalcular tamaño tras montar para evitar cortes y pantallas grises
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // Sincronizar coordenadas desde el padre
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const targetLat = initialLat || 21.2185;
    const targetLng = initialLng || -99.4735;
    
    if (mapInstanceRef.current && markerInstanceRef.current) {
      const marker = markerInstanceRef.current;
      const map = mapInstanceRef.current;
      const currentLatLng = marker.getLatLng();
      
      if (currentLatLng.lat !== targetLat || currentLatLng.lng !== targetLng) {
        marker.setLatLng([targetLat, targetLng]);
        map.setView([targetLat, targetLng], map.getZoom());
      }
    }
    
    setUrlInput(`${targetLat.toFixed(6)}, ${targetLng.toFixed(6)}`);
  }, [initialLat, initialLng]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Manejar el cambio de tema de los mapas dinámicamente
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    // Remover todas las capas de azulejos existentes
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Añadir nueva capa con el tema correcto
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    let tileLayer: L.TileLayer;

    if (mapboxToken) {
      const styleId = theme === 'light' ? 'light-v11' : 'dark-v11';
      tileLayer = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      });
    } else {
      const tileUrl = theme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
      });
    }
    tileLayer.addTo(map);
  }, [theme]);

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    if (!val.trim()) {
      setParseError('');
      return;
    }
    const coords = parseCoordinates(val);
    if (coords) {
      if (mapInstanceRef.current && markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([coords.lat, coords.lng]);
        mapInstanceRef.current.setView([coords.lat, coords.lng], mapInstanceRef.current.getZoom());
      }
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

      {/* Contenedor del Mapa Nativo */}
      <div style={{ height: '320px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--bg-dark-card-border)' }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 5 }} />
      </div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
        * Arrastra el marcador verde o haz clic en cualquier parte del mapa para marcar tu ubicación exacta.
      </div>
    </div>
  );
};

export default LocationPicker;
