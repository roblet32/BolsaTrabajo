import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

// Corregir bug de iconos de Leaflet en compilaciones de Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
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

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat,
  initialLng,
  onLocationChange
}) => {
  const { theme } = useApp();
  const [position, setPosition] = useState<L.LatLngExpression>([
    initialLat || 21.2185,
    initialLng || -99.4735
  ]);

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
        }
      },
    }),
    [onLocationChange]
  );

  // Mapa eventos para hacer clic y mover el pin
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  };

  useEffect(() => {
    setPosition([initialLat || 21.2185, initialLng || -99.4735]);
  }, [initialLat, initialLng]);

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
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
            const cartoStyle = theme === 'light' ? 'voyager' : 'dark_all';
            return (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={`https://{s}.basemaps.cartocdn.com/rastertiles/${cartoStyle}/{z}/{x}/{y}{r}.png`}
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
        <MapEvents />
      </MapContainer>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
        * Arrastra el marcador o haz clic en cualquier parte del mapa para marcar tu ubicación exacta.
      </div>
    </div>
  );
};
export default LocationPicker;
