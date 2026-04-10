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

  useEffect(() => {
    // 1. Carga de Locales desde el GeoJSON (752+ registros)
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.features) setDataFull(data);
      })
      .catch(err => console.error("Error en despliegue de locales:", err));

    // 2. Carga de Fuerza Policial desde el Backend (Supabase)
    fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-asignado')
      .then(res => res.json())
      .then(data => setDataPersonal(data))
      .catch(err => console.error("Error en carga de personal:", err));
  }, []);

  // --- LÓGICA DE FILTRADO SEGURO ---
  const localesFiltrados = useMemo(() => {
    if (!dataFull || !dataFull.features) return [];
    return dataFull.features.filter(f => 
      f.properties && 
      f.properties.DISTRITO__ && 
      distritosActivos.includes(f.properties.DISTRITO__.toUpperCase().trim())
    );
  }, [dataFull, distritosActivos]);

  // --- MANIOBRA DE LOCALIZACIÓN POR ID ---
  const localizarID = () => {
    if (!dataFull || !mapRef.current || !idBuscado) return;
    const local = dataFull.features.find(f => f.properties.OBJECTID.toString() === idBuscado);
    if (local) {
      const coords = [local.geometry.coordinates[1], local.geometry.coordinates[0]];
      mapRef.current.flyTo(coords, 18);
    } else {
      alert("ID de Local no encontrado en la base de datos.");
    }
  };

  const manejarCheck = (dist) => {
    setDistritosActivos(prev => 
      prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist]
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      
      {/* CABECERA DE COMANDO */}
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px 20px', zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>🛡️ COMANDO ELECTORAL - ZONA ESTE 2</h2>
            <small>INTELIGENCIA DIRIN PNP - MONITOREO 2026</small>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
            <label><b>ID LOCAL: </b></label>
            <input 
              type="number" 
              placeholder="Ej: 450" 
              value={idBuscado}
              onChange={(e) => setIdBuscado(e.target.value)}
              style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '80px', fontWeight: 'bold' }}
            />
            <button 
              onClick={localizarID} 
              style={{ marginLeft: '10px', padding: '6px 15px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              BUSCAR
            </button>
          </div>
        </div>

        {/* FILTROS DE JURISDICCIÓN */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '8px', background: '#003d33', borderRadius: '5px' }}>
          <b style={{ color: '#ffeb3b' }}>FILTRAR JURISDICCIÓN:</b>
          {distritosZonaEste.map(dist => (
            <label key={dist} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
              <input type="checkbox" checked={distritosActivos.includes(dist)} onChange={() => manejarCheck(dist)} /> {dist}
            </label>
          ))}
        </div>
      </header>

      {/* MAPA TÁCTICO */}
      <MapContainer 
        center={centroZonaEste} 
        zoom={12} 
        style={{ flex: 1, width: '100%' }} 
        ref={mapRef} 
        preferCanvas={true}
      >
        <ZoomHandler setZoom={setZoomLevel} />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico (Vectorial)">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Visión ISR (Satelital)">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </LayersControl.BaseLayer>

          {dataFull && (
            <GeoJSON 
              key={`${distritosActivos.join(',')}-${zoomLevel > 14}`} 
              data={{ type: "FeatureCollection", features: localesFiltrados }}
              pointToLayer={(feature, latlng) => {
                const marcador = L.marker(latlng, { icon: iconoLocal });
                
                // Los nombres aparecen solo en zoom cercano para evitar saturación
                if (zoomLevel > 14) {
                  marcador.bindTooltip(`<div style="font-weight:bold; color:#004d40; font-size:10px">${feature.properties.NOMBRE_DEL}</div>`, {
                    permanent: true,
                    direction: 'right',
                    offset: [10, -15],
                    opacity: 0.85
                  });
                }
                return marcador;
              }}
              onEachFeature={(feature, layer) => {
                const p = feature.properties;
                
                // Cruce de datos con la Fuerza PNP de la Base de Datos
                const efectivos = dataPersonal.filter(e => 
                  e.nombre_local_asignado && e.nombre_local_asignado.toUpperCase().trim() === p.NOMBRE_DEL.toUpperCase().trim()
                );

                layer.bindPopup(`
                  <div style="min-width:260px; font-family:Arial">
                    <div style="background:#00251a; color:white; padding:8px; text-align:center; border-radius:4px 4px 0 0">
                      <b>FICHA TÉCNICA - ID: ${p.OBJECTID}</b>
                    </div>
                    <div style="padding:12px; border:1px solid #00251a; border-top:none; background:#fff">
                      <strong style="font-size:14px; color:#0d47a1">${p.NOMBRE_DEL}</strong><br/>
                      <small style="color:#666">📍 ${p.DIRECCIÓN}</small>
                      <hr style="margin:10px 0; border:0.5px solid #eee"/>
                      
                      <p style="background:#e8f5e9; color:#1b5e20; padding:5px; font-weight:bold; text-align:center; margin:5px 0; border-radius:3px">
                        🛡️ FUERZA PNP ASIGNADA
                      </p>

                      ${efectivos.length > 0 ? efectivos.map(e => `
                        <div style="margin-bottom:8px; padding:6px; border-left:4px solid #2e7d32; background:#
