import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🎨 CONFIGURACIÓN DE ICONO ESTÉTICO (Estilo Pin de Inteligencia)
const iconoEstetico = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Icono de locación elegante
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [30, 30]
});

function App() {
  const [centrosVotacion, setCentrosVotacion] = useState(null);
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("TODOS");
  const centroZonaEste = [-12.043, -76.915];

  useEffect(() => {
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => setCentrosVotacion(data))
      .catch(err => console.error("Error en carga:", err));
  }, []);

  const filtrarLocales = (feature) => {
    if (distritoSeleccionado === "TODOS") return true;
    return feature.properties && feature.properties.DISTRITO__ === distritoSeleccionado;
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      
      // 📑 FICHA TÉCNICA DEL LOCAL (Popup)
      layer.bindPopup(`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; width: 220px;">
          <div style="background-color: #004d40; color: white; padding: 8px; border-radius: 4px 4px 0 0; text-align: center;">
            <strong style="font-size: 14px;">LOCAL ID: ${p.OBJECTID}</strong>
          </div>
          <div style="padding: 10px; border: 1px solid #004d40; border-top: none; border-radius: 0 0 4px 4px; background: white;">
            <b style="color: #0d47a1; font-size: 13px;">${p.NOMBRE_DEL}</b><br/>
            <hr style="margin: 8px 0; border: 0.5px solid #eee"/>
            <div style="font-size: 12px; line-height: 1.6;">
              <b>📍 Dirección:</b> ${p.DIRECCIÓN || 'No registrada'}<br/>
              <b>🗳️ Mesas:</b> <span style="color: #d32f2f; font-weight: bold;">${p.MESAS}</span><br/>
              <b>👥 Votantes:</b> <span style="color: #d32f2f; font-weight: bold;">${p.ELECTORES}</span>
            </div>
          </div>
        </div>
      `);

      // 🏷️ ETIQUETA FLOTANTE (Nombre del local siempre visible al acercar)
      layer.bindTooltip(`
        <div style="background: white; border: 1px solid #004d40; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #004d40; font-size: 9px;">
          ${p.NOMBRE_DEL}
        </div>`, 
        { permanent: true, direction: 'top', offset: [0, -20], opacity: 0.9 }
      );
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#004d40', color: 'white', padding: '15px', textAlign: 'center', zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
        <h2 style={{ margin: 0, letterSpacing: '1px' }}>🛡️ SISTEMA DE MONITOREO ELECTORAL - ZONA ESTE 2</h2>
        <div style={{ marginTop: '10px' }}>
          <select 
            value={distritoSeleccionado}
            onChange={(e) => setDistritoSeleccionado(e.target.value)}
            style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
          >
            <option value="TODOS">🌐 TODA LA JURISDICCIÓN</option>
            <option value="ATE">ATE</option>
            <option value="LA MOLINA">LA MOLINA</option>
            <option value="SAN LUIS">SAN LUIS</option>
            <option value="SANTA ANITA">SANTA ANITA</option>
            <option value="CIENEGUILLA">CIENEGUILLA</option>
          </select>
        </div>
      </header>

      <MapContainer center={centroZonaEste} zoom={13} style={{ flex: 1 }} preferCanvas={true}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Visión Satelital (ISR)">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </LayersControl.BaseLayer>

          {centrosVotacion && (
            <LayersControl.Overlay checked name="Centros de Votación">
              <GeoJSON 
                key={distritoSeleccionado}
                data={centrosVotacion} 
                filter={filtrarLocales}
                onEachFeature={onEachFeature}
                pointToLayer={(feature, latlng) => L.marker(latlng, { icon: iconoEstetico })}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default App;
