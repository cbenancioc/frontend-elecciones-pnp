import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono Estético
const iconoLocal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

function App() {
  const [dataFull, setDataFull] = useState(null);
  const [distritosActivos, setDistritosActivos] = useState(["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"]);
  const [idBuscado, setIdBuscado] = useState("");
  const [mapRef, setMapRef] = useState(null);

  const distritosZonaEste = ["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"];
  const centroZonaEste = [-12.043, -76.915];

  useEffect(() => {
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          setDataFull(data);
        }
      })
      .catch(err => console.error("Error en despliegue:", err));
  }, []);

  // FILTRADO SEGURO: Evita que la pantalla se ponga en blanco
  const localesFiltrados = useMemo(() => {
    if (!dataFull || !dataFull.features) return [];
    return dataFull.features.filter(f => 
      f.properties && f.properties.DISTRITO__ && distritosActivos.includes(f.properties.DISTRITO__.toUpperCase())
    );
  }, [dataFull, distritosActivos]);

  const localizarID = () => {
    if (!dataFull || !mapRef || !idBuscado) return;
    const local = dataFull.features.find(f => f.properties.OBJECTID.toString() === idBuscado);
    if (local) {
      const coords = [local.geometry.coordinates[1], local.geometry.coordinates[0]];
      mapRef.flyTo(coords, 18);
    }
  };

  const manejarCheck = (dist) => {
    setDistritosActivos(prev => 
      prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist]
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f0f0' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px 20px', zIndex: 1000, boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>🛡️ COMANDO ELECTORAL - ZONA ESTE 2</h2>
            <small>INTELIGENCIA PNP</small>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px' }}>
            <input 
              type="number" 
              placeholder="ID Local" 
              value={idBuscado}
              onChange={(e) => setIdBuscado(e.target.value)}
              style={{ padding: '5px', width: '70px', border: 'none', borderRadius: '4px' }}
            />
            <button onClick={localizarID} style={{ marginLeft: '5px', padding: '5px 10px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>BUSCAR</button>
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', fontSize: '0.8rem', background: '#003d33', padding: '5px', borderRadius: '4px' }}>
          {distritosZonaEste.map(dist => (
            <label key={dist} style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={distritosActivos.includes(dist)} onChange={() => manejarCheck(dist)} /> {dist}
            </label>
          ))}
        </div>
      </header>

      <MapContainer 
        center={centroZonaEste} 
        zoom={12} 
        style={{ flex: 1 }} 
        whenCreated={setMapRef} 
        preferCanvas={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelital ISR">
            <TileLayer url="
