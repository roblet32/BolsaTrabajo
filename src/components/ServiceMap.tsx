import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { Profile, getDistanceKm } from '../services/db';

// Configuración de iconos personalizados de color
const clientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const plumberIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const electricianIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const carpenterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultProviderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Función helper para seleccionar el icono de categoría
const getProviderIcon = (categories: string[]) => {
  if (categories.includes('plomería')) return plumberIcon;
  if (categories.includes('electricidad')) return electricianIcon;
  if (categories.includes('carpintería')) return carpenterIcon;
  return defaultProviderIcon;
};

// Componente controlador para reajustar el mapa y recalcular su tamaño de forma robusta
const MapController: React.FC<{ coords: { lat: number; lng: number } }> = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    // Forzar redibujado de Leaflet para prevenir que se renderice vacío o cortado
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    map.setView([coords.lat, coords.lng], map.getZoom());
  }, [coords, map]);

  return null;
};

interface ServiceMapProps {
  filteredProfiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
}

export const ServiceMap: React.FC<ServiceMapProps> = ({
  filteredProfiles,
  onSelectProfile
}) => {
  const { clientLocation, searchDistance, setActiveContact, setCurrentView, theme, user } = useApp();

  // Validación de coordenadas del cliente con fallback para evitar crashes en Leaflet
  const lat = typeof clientLocation?.lat === 'number' && !isNaN(clientLocation.lat) ? clientLocation.lat : 21.2185;
  const lng = typeof clientLocation?.lng === 'number' && !isNaN(clientLocation.lng) ? clientLocation.lng : -99.4735;

  const handleQuickChat = (p: Profile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setActiveContact(p);
    setCurrentView('chats');
  };

  return (
    <div className="map-panel glass-card">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
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

        {/* Marcador del Cliente */}
        <Marker position={[lat, lng]} icon={clientIcon}>
          <Popup>
            <div style={{ color: 'var(--text-dark-primary)', fontWeight: 'bold' }}>Tu Ubicación Actual</div>
          </Popup>
        </Marker>

        {/* Círculo que representa el Radio de Búsqueda */}
        <Circle
          center={[lat, lng]}
          radius={searchDistance * 1000} // Convertir Km a Metros
          pathOptions={{
            color: '#14b8a6',
            fillColor: '#14b8a6',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '5, 5'
          }}
        />

        {/* Marcadores de los Prestadores de Servicios */}
        {filteredProfiles.map((p) => {
          const pLat = typeof p.lat === 'number' && !isNaN(p.lat) ? p.lat : null;
          const pLng = typeof p.lng === 'number' && !isNaN(p.lng) ? p.lng : null;
          if (pLat === null || pLng === null) return null;

          const distance = getDistanceKm(
            lat,
            lng,
            pLat,
            pLng
          );

          return (
            <Marker
              key={p.id}
              position={[pLat, pLng]}
              icon={getProviderIcon(p.categories)}
            >
              <Popup>
                <div style={{ minWidth: '180px', color: 'var(--text-dark-primary)', padding: '0.2rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-dark-primary)', fontWeight: 'bold' }}>
                    {p.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: '#14b8a6', fontWeight: '700', marginBottom: '0.25rem' }}>
                    {p.categories.join(', ')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0', fontSize: '0.8rem' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {p.rating}</span>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>${p.rate}/hr</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    📍 A <strong>{distance} km</strong> de ti
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onSelectProfile(p)}
                      style={{
                        flex: 1,
                        background: '#0f766e',
                        border: 'none',
                        color: 'white',
                        padding: '0.35rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Ver Perfil
                    </button>
                    <button
                      onClick={(e) => handleQuickChat(p, e)}
                      style={{
                        flex: 1,
                        background: '#4f46e5',
                        border: 'none',
                        color: 'white',
                        padding: '0.35rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Chatear
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapController coords={{ lat, lng }} />
      </MapContainer>
    </div>
  );
};
export default ServiceMap;
