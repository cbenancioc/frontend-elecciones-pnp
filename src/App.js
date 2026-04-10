import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconoLocal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function App() {
  const [centrosVotacion, setCentrosVotacion] = useState(null);
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("TODOS");
  const centroZonaEste = [-12.043, -76.915];

  useEffect(() => {
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => setCentrosVotacion(data))
      .catch(err => console.error("Error cargando locales:", err));
  }, []);

  // Función para filtrar los locales por distrito seleccionado
  const filtrarLocales = (feature) => {
    if (distritoSeleccionado === "TODOS") return true;
    return feature.properties.DISTRITO__ === distritoSeleccionado;
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      layer.bindPopup(`
        <div style="text-align:center; min-width:200px">
          <b style="color:#1b5e20">ID: ${p.OBJECTID}</b><br/>
          <strong>${p.NOMBRE_DEL}</strong><br/>
          <hr/>
          <b>Mesas:</b> ${p.MESAS} | <b>Votantes:</b> ${p.ELECTORES}
        </div>
      `);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px', textAlign: 'center', zIndex: 1000 }}>
        <h2 style={{ margin: 0 }}>🛡️ MONITOREO ZONA ESTE 2 - ELECCIONES 2026</h2>
        
        {/* FILTRO DE DISTRITOS (Su orden) */}
        <div style={{ marginTop: '10px' }}>
          <label><b>Seleccionar Jurisdicción: </b></label>
          <select 
            onChange={(e) => setDistritoSeleccionado(e.target.value)}
            style={{ padding: '5px', borderRadius: '5px', fontWeight: 'bold' }}
          >
            <option value="TODOS">TODOS LOS DISTRITOS</option>
            <option value="ATE">ATE</option>
            <option value="LA MOLINA">LA MOLINA</option>
            <option value="SAN LUIS">SAN LUIS</option>
            <option value="SANTA ANITA">SANTA ANITA</option>
            <option value="CIENEGUILLA">CIENEGUILLA</option>
          </select>
        </div>
      </header>

      <MapContainer center={centroZonaEste} zoom={13} style={{ height: '100%', width: '100%' }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          
          {centrosVotacion && (
            <LayersControl.Overlay checked name="Locales de Votación">
              <GeoJSON 
                key={distritoSeleccionado} // Obliga al mapa a refrescarse al cambiar distrito
                data={centrosVotacion} 
                filter={filtrarLocales}
                onEachFeature={onEachFeature}
                pointToLayer={(feature, latlng) => {
                  const marcador = L.marker(latlng, { icon: iconoLocal });
                  
                  // ETIQUETA CON NOMBRE DEL LOCAL (Su orden)
                  marcador.bindTooltip(
                    `<div style="font-weight:bold; color:#0d47a1; font-size:10px; max-width:120px; white-space: normal;">
                      ${feature.properties.NOMBRE_DEL}
                    </div>`, 
                    { permanent: true, direction: 'top', offset: [0, -10], opacity: 0.8 }
                  );
                  return marcador;
                }}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default App;
