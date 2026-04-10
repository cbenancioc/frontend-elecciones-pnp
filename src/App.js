import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconografía Táctica
const iconoLocal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function App() {
  const [centrosVotacion, setCentrosVotacion] = useState(null);
  const [personal, setPersonal] = useState([]);
  const centroZonaEste = [-12.043, -76.915]; // Foco en Ate/La Molina/San Luis

  useEffect(() => {
    // 1. Carga de Centros de Votación (752 locales detectados)
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => setCentrosVotacion(data))
      .catch(err => console.error("Falla en reconocimiento de locales:", err));

    // 2. Carga de Personal de Inteligencia (Desde Supabase vía Render)
    fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-este')
      .then(res => res.json())
      .then(data => setPersonal(data))
      .catch(err => console.error("Falla en enlace con personal:", err));
  }, []);

  // Función de Inteligencia de Local
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      
      // Buscamos si hay un agente asignado al distrito del local
      const agenteAsignado = personal.find(a => a.distrito_asignado.toUpperCase() === p.DISTRITO__.toUpperCase());

      layer.bindPopup(`
        <div style="text-align:center; font-family:Arial; min-width:240px">
          <header style="background:#1b5e20; color:white; padding:5px; margin-bottom:10px">
            <b style="font-size:12px">ID LOCAL: ${p.OBJECTID || 'S/N'}</b>
          </header>
          <strong style="font-size:14px; color:#0d47a1">${p.NOMBRE_DEL || 'SIN NOMBRE'}</strong><br/>
          <hr style="border:0.5px solid #eee"/>
          <div style="text-align:left; font-size:11px; line-height:1.5">
            <b>📍 Distrito:</b> ${p.DISTRITO__ || 'No especificado'}<br/>
            <b>🏠 Dirección:</b> ${p.DIRECCIÓN || 'No especificada'}<br/>
            <div style="background:#f5f5f5; padding:5px; margin-top:5px; border-radius:3px">
              <b>🗳️ Mesas:</b> ${p.MESAS || '0'} | <b>👥 Votantes:</b> ${p.ELECTORES || '0'}
            </div>
            <hr style="border:0.5px solid #eee"/>
            <p style="color:#d32f2f; font-weight:bold; text-align:center; margin:5px 0">INTELIGENCIA DIRIN</p>
            <b>👤 Responsable:</b> ${agenteAsignado ? agenteAsignado.agente_nombre : 'Pendiente de Asignación'}<br/>
            <b>📞 Contacto:</b> ${agenteAsignado ? agenteAsignado.celular : '---'}
          </div>
          <button style="cursor:pointer; background:#1a237e; color:white; border:none; padding:10px; border-radius:3px; width:100%; margin-top:10px; font-weight:bold" 
                  onclick="alert('Generando Reporte de Situación para el local ${p.OBJECTID}...')">
            SOLICITAR REPORTE DE AGENTE
          </button>
        </div>
      `);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '15px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.5)', zIndex: 1000 }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🛡️ PANEL DE CONTROL: MONITOREO ELECCIONES 2026</h2>
        <small>ZONA ESTE 2 - UNIDAD DE INTELIGENCIA PNP</small>
      </header>

      <MapContainer center={centroZonaEste} zoom={13} style={{ height: '100%', width: '100%' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Visión ISR (Satelital)">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </LayersControl.BaseLayer>

          {centrosVotacion && (
            <LayersControl.Overlay checked name="Locales de Votación">
              <GeoJSON 
                data={centrosVotacion} 
                onEachFeature={onEachFeature}
                pointToLayer={(feature, latlng) => L.marker(latlng, {icon: iconoLocal})}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default App;
