import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// CORRECCIÓN TÁCTICA DE ÍCONOS
const iconoRojo = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function App() {
  const [puntos, setPuntos] = useState([]);
  const posicionLima = [-12.046374, -77.042793]; // Centro Histórico

  useEffect(() => {
    // RECONOCIMIENTO DE DATOS: Llamada al servidor en Render
    fetch('https://backend-elecciones-pnp-2026.onrender.com/puntos-criticos')
      .then(res => res.json())
      .then(data => {
        console.log("Datos recibidos:", data);
        setPuntos(data);
        Carga en la Bóveda: Una vez tenga el archivo centros_votacion_este2.json, lo subiremos a la carpeta public de su repositorio Frontend para que Leaflet lo dibuje como una capa oficial sobre el mapa satelital.
      })
      .catch(err => console.error("Falla en enlace de datos:", err));
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        backgroundColor: '#004d40', 
        color: 'white', 
        padding: '12px', 
        textAlign: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        zIndex: 1000 
      }}>
        <h2 style={{ margin: 0 }}>🛡️ SISTEMA DE GEORREFERENCIACIÓN OPERATIVA - PNP</h2>
      </header>

      <MapContainer center={posicionLima} zoom={13} style={{ height: '100%', width: '100%' }}>
        <LayersControl position="topright">
          
          {/* CAPA 1: MAPA CALLEJERO */}
          <LayersControl.BaseLayer checked name="Mapa de Calles">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          {/* CAPA 2: VISTA SATELITAL (GOOGLE) */}
          <LayersControl.BaseLayer name="Vista Satelital (ISR)">
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            />
          </LayersControl.BaseLayer>

          {/* CAPA DE INTELIGENCIA: MARCADORES */}
          <LayersControl.Overlay checked name="Puntos Críticos">
            <>
              {puntos.map(punto => (
                <Marker key={punto.id} position={[punto.latitud, punto.longitud]} icon={iconoRojo}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ color: '#d32f2f' }}>{punto.nombre}</strong><br/>
                      <hr/>
                      {punto.descripcion}<br/>
                      <strong>Nivel: {punto.nivel_riesgo}</strong>
                    </div>
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
