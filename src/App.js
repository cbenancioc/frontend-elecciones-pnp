import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconografía Táctica
const iconoLocal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [20, 32], // Tamaño ajustado para evitar saturación
  iconAnchor: [10, 32],
  popupAnchor: [1, -34],
});

function App() {
  const [centrosVotacion, setCentrosVotacion] = useState(null);
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("TODOS");
  const centroZonaEste = [-12.043, -76.915];

  useEffect(() => {
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => {
        // Validación de datos recibidos
        if (data && data.geometries) {
          setCentrosVotacion(data);
        }
      })
      .catch(err => console.error("Falla en enlace de datos:", err));
  }, []);

  // FILTRO TÁCTICO: Solo procesa si el distrito coincide
  const filtrarLocales = (feature) => {
    if (distritoSeleccionado === "TODOS") return true;
    // Compara el distrito del JSON con el seleccionado
    return feature.properties && feature.properties.DISTRITO__ === distritoSeleccionado;
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      layer.bindPopup(`
        <div style="text-align:center; font-family:Arial">
          <b style="color:#1b5e20">ID: ${p.OBJECTID}</b><br/>
          <strong>${p.NOMBRE_DEL}</strong><br/>
          <hr/>
          <b>Dirección:</b> ${p.DIRECCIÓN}<br/>
          <b>Mesas:</b> ${p.MESAS} | <b>Votantes:</b> ${p.ELECTORES}
        </div>
      `);
      
      // Etiqueta flotante con el nombre (Visible al acercar o permanente)
      layer.bindTooltip(`${p.NOMBRE_DEL}`, {
        permanent: false, 
        direction: 'top',
        opacity: 0.7
      });
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px', textAlign: 'center', zIndex: 1000, boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>🛡️ MONITOREO ZONA ESTE 2 - ELECCIONES 2026</h2>
        
        <div style={{ marginTop: '8px' }}>
          <label style={{ fontSize: '0.9rem' }}>Jurisdicción: </label>
          <select 
            value={distritoSeleccionado}
            onChange={(e) => setDistritoSeleccionado(e.target.value)}
            style={{ padding: '4px', borderRadius: '4px', fontWeight: 'bold', border: 'none' }}
          >
            <option value="TODOS">MOSTRAR TODA LA ZONA</option>
            <option value="ATE">ATE</option>
            <option value="LA MOLINA">LA MOLINA</option>
            <option value="SAN LUIS">SAN LUIS</option>
            <option value="SANTA ANITA">SANTA ANITA</option>
            <option value="CIENEGUILLA">CIENEGUILLA</option>
          </select>
        </div>
      </header>

      <MapContainer 
        center={centroZonaEste} 
        zoom={13} 
        style={{ flex: 1, width: '100%' }}
        preferCanvas={true} // MEJORA CRÍTICA: Usa el motor gráfico de la PC para manejar los 752 puntos
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Vista ISR (Satelital)">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </LayersControl.BaseLayer>

          {centrosVotacion && (
            <LayersControl.Overlay checked name="Locales de Votación">
              <GeoJSON 
                key={distritoSeleccionado} // Refresca la capa sin tumbar el mapa
                data={centrosVotacion} 
                filter={filtrarLocales}
                onEachFeature={onEachFeature}
                pointToLayer={(feature, latlng) => L.marker(latlng, { icon: iconoLocal })}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default App;
