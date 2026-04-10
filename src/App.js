import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ICONO PROFESIONAL TÁCTICO
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
      .then(data => setDataFull(data))
      .catch(err => console.error("Error en despliegue:", err));
  }, []);

  // LÓGICA DE FILTRADO MULTIDISTRITO
  const localesFiltrados = useMemo(() => {
    if (!dataFull) return { type: "FeatureCollection", features: [] };
    return {
      type: "FeatureCollection",
      features: dataFull.features.filter(f => distritosActivos.includes(f.properties.DISTRITO__))
    };
  }, [dataFull, distritosActivos]);

  // MANIOBRA DE LOCALIZACIÓN POR ID
  const localizarID = () => {
    if (!dataFull || !mapRef || !idBuscado) return;
    const local = dataFull.features.find(f => f.properties.OBJECTID.toString() === idBuscado);
    if (local) {
      const coords = [local.geometry.coordinates[1], local.geometry.coordinates[0]];
      mapRef.flyTo(coords, 18);
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
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '15px', zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🛡️ COMANDO ELECTORAL 2026 - ZONA ESTE 2</h2>
            <small>ESTADO MAYOR - INTELIGENCIA PNP</small>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', marginTop: '5px' }}>
            <label><b>ID LOCAL: </b></label>
            <input 
              type="number" 
              placeholder="Ej: 450" 
              value={idBuscado}
              onChange={(e) => setIdBuscado(e.target.value)}
              style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '80px' }}
            />
            <button onClick={localizarID} style={{ marginLeft: '8px', padding: '6px 15px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>VER DATOS</button>
          </div>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '8px', background: '#003d33', borderRadius: '6px' }}>
          <b>FILTRAR JURISDICCIÓN:</b>
          {distritosZonaEste.map(dist => (
            <label key={dist} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="checkbox" checked={distritosActivos.includes(dist)} onChange={() => manejarCheck(dist)} /> {dist}
            </label>
          ))}
        </div>
      </header>

      <MapContainer center={centroZonaEste} zoom={13} style={{ flex: 1 }} ref={setMapRef} preferCanvas={true}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Visión Satelital ISR">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </LayersControl.BaseLayer>

          {dataFull && (
            <LayersControl.Overlay checked name="Centros de Votación">
              <GeoJSON 
                key={JSON.stringify(distritosActivos)}
                data={localesFiltrados}
                pointToLayer={(feature, latlng) => {
                  const marcador = L.marker(latlng, { icon: iconoLocal });
                  // ETIQUETA PERMANENTE CON NOMBRE (Su orden)
                  marcador.bindTooltip(`<div style="font-weight:bold; color:#004d40; font-size:9px">${feature.properties.NOMBRE_DEL}</div>`, {
                    permanent: true,
                    direction: 'right',
                    offset: [10, -15],
                    opacity: 0.8
                  });
                  return marcador;
                }}
                onEachFeature={(feature, layer) => {
                  const p = feature.properties;
                  layer.bindPopup(`
                    <div style="min-width:220px; font-family:Arial">
                      <div style="background:#1b5e20; color:white; padding:5px; text-align:center; border-radius:4px 4px 0 0">
                        <b>DETALLE DE LOCAL [ID: ${p.OBJECTID}]</b>
                      </div>
                      <div style="padding:10px; border:1px solid #1b5e20; border-top:none">
                        <strong style="font-size:14px; color:#0d47a1">${p.NOMBRE_DEL}</strong><br/>
                        <hr style="margin:8px 0; border:0.1px solid #eee"/>
                        <b>📍 Dirección:</b> ${p.DIRECCIÓN}<br/>
                        <b>🗳️ Mesas:</b> ${p.MESAS} | <b>👥 Votantes:</b> ${p.ELECTORES}<br/>
                        <b>🚩 Distrito:</b> ${p.DISTRITO__}
                      </div>
                    </div>
                  `);
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
