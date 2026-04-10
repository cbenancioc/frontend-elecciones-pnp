import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono para Agentes de Inteligencia
const iconoAgente = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function App() {
  const [centrosVotacion, setCentrosVotacion] = useState(null);
  const [agentes, setAgentes] = useState([]);
  const centroEste2 = [-12.043, -76.915]; // Punto medio aproximado de la Zona Este 2

  useEffect(() => {
    // 1. CARGA DE CENTROS DE VOTACIÓN (ARCHIVO SUBIDO)
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => setCentrosVotacion(data))
      .catch(err => console.error("Error cargando locales:", err));

    // 2. CARGA DE PERSONAL (DESDE EL BACKEND)
    fetch('https://backend-elecciones-pnp-2026.onrender.com/puntos-criticos') 
      .then(res => res.json())
      .then(data => setAgentes(data))
      .catch(err => console.error("Error cargando personal:", err));
  }, []);

  // Estilo visual para los Centros de Votación
  const estiloCentros = {
    fillColor: "#2e7d32",
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5
  };

  const alHacerClicEnLocal = (feature, layer) => {
    if (feature.properties && feature.properties.nombre_local) {
      layer.bindPopup(`
        <div style="text-align:center">
          <b style="color:#1b5e20">LOCAL DE VOTACIÓN</b><br/>
          ${feature.properties.nombre_local}<br/>
          <hr/>
          <b>Distrito:</b> ${feature.properties.distrito}<br/>
          <button onclick="alert('Abriendo Formulario de Reporte...')">Generar Reporte de Agente</button>
        </div>
      `);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#1a237e', color: 'white', padding: '12px', textAlign: 'center', zIndex: 1000 }}>
        <h3 style={{ margin: 0 }}>🛡️ MONITOREO ELECCIONES 2026 - ZONA ESTE 2 (DIRIN PNP)</h3>
      </header>

      <MapContainer center={centroEste2} zoom={12} style={{ height: '100%', width: '100%' }}>
        <LayersControl position="topright">
          
          <LayersControl.BaseLayer checked name="Mapa Vectorial">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Vista Satelital ISR (Google)">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </LayersControl.BaseLayer>

          {/* CAPA GEOJSON: CENTROS DE VOTACIÓN */}
          {centrosVotacion && (
            <LayersControl.Overlay checked name="Locales de Votación">
              <GeoJSON data={centrosVotacion} style={estiloCentros} onEachFeature={alHacerClicEnLocal} />
            </LayersControl.Overlay>
          )}

          {/* CAPA DE PERSONAL: AGENTES ASIGNADOS */}
          <LayersControl.Overlay checked name="Agentes en Servicio">
            <>
              {agentes.map(agente => (
                <Marker key={agente.id} position={[agente.latitud, agente.longitud]} icon={iconoAgente}>
                  <Popup>
                    <b>Agente Responsable:</b><br/>
                    {agente.nombre}<br/>
                    <b>Estado:</b> Operativo
                  </Popup>
                </Marker>
              ))}
            </>
          </LayersControl.Overlay>

        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default App;
