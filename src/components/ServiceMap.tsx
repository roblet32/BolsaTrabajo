import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { Profile, getDistanceKm } from '../services/db';

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

const getProviderIcon = (categories: string[]) => {
  if (categories.includes('plomería')) return plumberIcon;
  if (categories.includes('electricidad')) return electricianIcon;
  if (categories.includes('carpintería')) return carpenterIcon;
  return defaultProviderIcon;
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clientMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const providersGroupRef = useRef<L.LayerGroup | null>(null);

  const clientLat = typeof clientLocation?.lat === 'number' && !isNaN(clientLocation.lat) ? clientLocation.lat : 21.2185;
  const clientLng = typeof clientLocation?.lng === 'number' && !isNaN(clientLocation.lng) ? clientLocation.lng : -99.4735;

  const handleQuickChat = (p: Profile) => {
    if (!user) {
      setCurrentView('auth');
      return;
    }
    setActiveContact(p);
    setCurrentView('chats');
  };

  // 1. Inicializar el mapa nativo una sola vez
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Crear mapa
    const map = L.map(mapContainerRef.current, {
      center: [clientLat, clientLng],
      zoom: 14,
      zoomControl: true
    });

    mapInstanceRef.current = map;

    // Crear grupo para marcadores de proveedores
    const providersGroup = L.layerGroup().addTo(map);
    providersGroupRef.current = providersGroup;

    // Crear marcador del cliente
    const clientMarker = L.marker([clientLat, clientLng], { icon: clientIcon })
      .addTo(map)
      .bindPopup('<div style="color: var(--text-dark-primary); font-weight: bold; padding: 0.1rem;">Tu Ubicación Actual</div>');
    clientMarkerRef.current = clientMarker;

    // Crear círculo del radio de búsqueda
    const circle = L.circle([clientLat, clientLng], {
      radius: searchDistance * 1000,
      color: '#14b8a6',
      fillColor: '#14b8a6',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '5, 5'
    }).addTo(map);
    circleRef.current = circle;

    // Forzar redimensionado tras un leve retraso para evitar pantallas grises
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      clientMarkerRef.current = null;
      circleRef.current = null;
      providersGroupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // 2. Escuchar el cambio de tema de los mapas dinámicamente
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remover capas de azulejos existentes
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Agregar capa correcta con el tema seleccionado
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

  // 3. Sincronizar posición del cliente y radio de búsqueda cuando cambien
  useEffect(() => {
    if (mapInstanceRef.current && clientMarkerRef.current && circleRef.current) {
      const map = mapInstanceRef.current;
      const clientMarker = clientMarkerRef.current;
      const circle = circleRef.current;

      clientMarker.setLatLng([clientLat, clientLng]);
      circle.setLatLng([clientLat, clientLng]);
      circle.setRadius(searchDistance * 1000);

      map.setView([clientLat, clientLng], map.getZoom());
    }
  }, [clientLat, clientLng, searchDistance]);

  // 4. Sincronizar los marcadores de los proveedores y sus clicks reactivos en popups
  useEffect(() => {
    if (!mapInstanceRef.current || !providersGroupRef.current) return;
    const map = mapInstanceRef.current;
    const providersGroup = providersGroupRef.current;

    // Limpiar marcadores anteriores
    providersGroup.clearLayers();

    // Crear nuevos marcadores
    filteredProfiles.forEach((p) => {
      const pLat = typeof p.lat === 'number' && !isNaN(p.lat) ? p.lat : null;
      const pLng = typeof p.lng === 'number' && !isNaN(p.lng) ? p.lng : null;
      if (pLat === null || pLng === null) return;

      const distance = getDistanceKm(clientLat, clientLng, pLat, pLng);

      const badgesHtml = p.categories
        .map(cat => `<span style="background: rgba(20, 184, 166, 0.15); color: #14b8a6; padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.65rem; font-weight: bold; text-transform: capitalize;">${cat}</span>`)
        .join(' ');

      const previewBadgeHtml = p.isActive === false
        ? `<span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.65rem; font-weight: bold;">Vista Previa</span>`
        : '';

      const popupContent = `
        <div style="min-width: 190px; color: var(--text-dark-primary); padding: 0.2rem; font-family: var(--font-body);">
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.95rem; color: white; font-weight: bold; display: flex; align-items: center; gap: 0.35rem; justify-content: space-between;">
            <span>${p.name}</span>
            ${previewBadgeHtml}
          </h4>
          <div style="display: flex; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
            ${badgesHtml}
          </div>
          <div style="display: flex; justify-content: space-between; margin: 0.5rem 0; font-size: 0.8rem; font-weight: bold;">
            <span style="color: #fbbf24;">★ ${p.rating}</span>
            <span style="color: #fbbf24;">$${p.rate}/hr</span>
          </div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.75rem;">
            📍 A <strong>${distance} km</strong> de ti
          </div>
          <div style="display: flex; gap: 0.4rem;">
            <button id="pop-view-${p.id}" style="flex: 1; background: #0f766e; border: none; color: white; padding: 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer; transition: background 0.2s;">Ver Perfil</button>
            <button id="pop-chat-${p.id}" style="flex: 1; background: #4f46e5; border: none; color: white; padding: 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold; cursor: pointer; transition: background 0.2s;">Chatear</button>
          </div>
        </div>
      `;

      const marker = L.marker([pLat, pLng], { icon: getProviderIcon(p.categories) })
        .addTo(providersGroup)
        .bindPopup(popupContent);

      // Vincular eventos click una vez que el popup se abre en el mapa nativo
      marker.on('popupopen', () => {
        const popupElement = map.getContainer().querySelector('.leaflet-popup');
        if (!popupElement) return;

        const viewBtn = popupElement.querySelector(`#pop-view-${p.id}`);
        const chatBtn = popupElement.querySelector(`#pop-chat-${p.id}`);

        if (viewBtn) {
          viewBtn.addEventListener('click', () => {
            onSelectProfile(p);
            map.closePopup();
          });
        }
        if (chatBtn) {
          chatBtn.addEventListener('click', () => {
            handleQuickChat(p);
            map.closePopup();
          });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProfiles, clientLat, clientLng]);

  return (
    <div className="map-panel glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 5 }} />
    </div>
  );
};

export default ServiceMap;
