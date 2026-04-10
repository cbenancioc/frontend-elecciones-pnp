import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- CONFIGURACIÓN DE ICONOGRAFÍA TÁCTICA ---
const iconoLocal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// --- COMPONENTE CONTROLADOR DE ZOOM ---
function ZoomHandler({ setZoom }) {
  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });
  return null;
}

function App() {
  const [dataFull, setDataFull] = useState(null);
  const [dataPersonal, setDataPersonal] = useState([]);
  const [distritosActivos, setDistritosActivos] = useState(["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"]);
  const [idBuscado, setIdBuscado] = useState("");
  const [zoomLevel, setZoomLevel] = useState(12);
  const mapRef = useRef(null);

  const distritosZonaEste = ["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"];
  const centroZonaEste = [-12.043, -76.915];

  // Función de limpieza de texto para cruce de datos (Blindaje de vinculación)
  const limpiarTexto = (t) => (t || "").toString().toUpperCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

  useEffect(() => {
    // 1. Carga de Locales
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.features) setDataFull(data);
      })
      .catch(err => console.error("Error locales:", err));

    // 2. Carga de Personal desde Backend
    fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-asignado')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDataPersonal(data);
      })
      .catch(err => console.error("Error personal:", err));
  }, []);

  const localesFiltrados = useMemo(() => {
    if (!dataFull || !dataFull.features) return [];
    return dataFull.features.filter(f => 
      f.properties && 
      f.properties.DISTRITO__ && 
      distritosActivos.includes(limpiarTexto(f.properties.DISTRITO__))
    );
  }, [dataFull, distritosActivos]);

  const localizarID = () => {
    if (!dataFull || !mapRef.current || !idBuscado) return;
    const local = dataFull.features.find(f => f.properties.OBJECTID.toString() === idBuscado);
    if (local) {
      const coords = [local.geometry.coordinates[1], local.geometry.coordinates[0]];
      mapRef.current.flyTo(coords, 18);
    }
  };

  const manejarCheck = (dist) => {
    setDistritosActivos(prev => 
      prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist]
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px 20px', zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🛡️ COMANDO ELECTORAL - ZONA ESTE 2</h2>
            <small>DIRIN PNP - INTELIGENCIA</small>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
            <label><b>ID LOCAL: </b></label>
            <input 
              type="number" 
              value={idBuscado}
              onChange={(e) => setIdBuscado(e.target.value)}
              style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '80px' }}
            />
            <button
