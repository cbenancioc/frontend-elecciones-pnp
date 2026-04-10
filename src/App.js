import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono Estético Táctico
const iconoLocal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// COMPONENTE PARA DETECTAR ZOOM
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
  const [distritosActivos, setDistritosActivos] = useState(["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"]);
  const [idBuscado, setIdBuscado] = useState("");
  const [zoomLevel, setZoomLevel] = useState(12);
  const mapRef = useRef(null);

  const distritosZonaEste = ["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"];
  const centroZonaEste = [-12.043, -76.915];

  useEffect(() => {
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.features) setDataFull(data);
      })
      .catch(err => console.error("Error en despliegue:", err));
  }, []);

  const localesFiltrados = useMemo(() => {
    if (!dataFull || !dataFull.features) return [];
    return dataFull.features.filter(f => 
      f.properties && f.properties.DISTRITO__ && distritosActivos.includes(f.properties.DISTRITO__.toUpperCase())
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f0f0' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px 20px', zIndex: 1000, boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>🛡️ COMANDO ELECTORAL - ZONA ESTE 2</h2>
            <small>DIRIN PNP - INTELIGENCIA</small>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px' }}>
            <input 
              type="number" 
              placeholder="ID Local" 
              value={idBuscado}
              onChange={(e) => setIdBuscado(e.target.value)}
              style={{ padding: '5px', width: '70px', border: 'none', borderRadius: '4px' }}
            />
            <button onClick={localizarID} style={{ marginLeft: '5px', padding: '5px 10px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>BUSCAR</button>
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.85rem', background: '#003d33', padding: '8px', borderRadius: '4px' }}>
          {distritosZonaEste.map(dist => (
            <label key={dist} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input type="checkbox" checked={distritosActivos.includes(dist)} onChange={() => manejarCheck(dist)} /> {dist}
            </label>
          ))}
        </div>
      </header>

      <MapContainer 
        center={centroZonaEste} 
        zoom={12} 
        style={{ flex: 1 }} 
        ref={mapRef} 
        preferCanvas={true}
      >
        <ZoomHandler setZoom={setZoomLevel} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelital ISR">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </LayersControl.BaseLayer>

          {dataFull && (
            <GeoJSON 
              key={`${distritosActivos.join(',')}-${zoomLevel > 14}`} 
              data={{ type: "FeatureCollection", features: localesFiltrados }}
              pointToLayer={(feature, latlng) => {
                const marcador = L.marker(latlng, { icon: iconoLocal });
                
                // DINÁMICA DE ZOOM: Solo muestra nombres si el zoom es mayor a 14
                if (zoomLevel > 14) {
                  marcador.bindTooltip(`<b>${feature.properties.NOMBRE_DEL}</b>`, {
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
                layer.bindPopup(`
                  <div style="min-width:200px">
                    <b style="color:#1b5e20">ID: ${p.OBJECTID}</b><br/>
                    <strong style="color:#0d47a1">${p.NOMBRE_DEL}</strong><hr/>
                    <b>📍 Dirección:</b> ${p.DIRECCIÓN}<br/>
                    <b>🗳️ Mesas:</b> ${p.MESAS} | <b>👥 Electores:</b> ${p.ELECTORES}
                  </div>
                `);
              }}
            />
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default App;
