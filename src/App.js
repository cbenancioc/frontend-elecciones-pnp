import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const iconoLocal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

function ZoomHandler({ setZoom }) {
  useMapEvents({ zoomend: (e) => setZoom(e.target.getZoom()) });
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
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => { if (data && data.features) setDataFull(data); });

    fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-asignado')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDataPersonal(data); });
  }, []);

  const localesFiltrados = useMemo(() => {
    if (!dataFull) return [];
    return dataFull.features.filter(f => 
      f.properties && f.properties.DISTRITO__ && distritosActivos.includes(f.properties.DISTRITO__.toUpperCase().trim())
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

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px 20px', zIndex: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h2 style={{ margin: 0 }}>🛡️ COMANDO ELECTORAL - ZONA ESTE 2</h2><small>DIRIN PNP</small></div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px' }}>
            <input type="number" value={idBuscado} onChange={(e) => setIdBuscado(e.target.value)} style={{ padding: '5px', width: '70px' }} placeholder="ID" />
            <button onClick={localizarID} style={{ marginLeft: '5px', padding: '5px 10px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: 'none' }}>BUSCAR</button>
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
          {distritosZonaEste.map(dist => (
            <label key={dist}><input type="checkbox" checked={distritosActivos.includes(dist)} onChange={() => setDistritosActivos(prev => prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist])} /> {dist}</label>
          ))}
        </div>
      </header>
      <MapContainer center={centroZonaEste} zoom={12} style={{ flex: 1 }} ref={mapRef} preferCanvas={true}>
        <ZoomHandler setZoom={setZoomLevel} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /></LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelital"><TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" /></LayersControl.BaseLayer>
          <GeoJSON key={`${distritosActivos.join(',')}-${zoomLevel > 14}`} data={{ type: "FeatureCollection", features: localesFiltrados }}
            pointToLayer={(f, l) => {
              const m = L.marker(l, { icon: iconoLocal });
              if (zoomLevel > 14) m.bindTooltip(`<b>${f.properties.NOMBRE_DEL}</b>`, { permanent: true, direction: 'right', opacity: 0.85 });
              return m;
            }}
            onEachFeature={(f, layer) => {
              const p = f.properties;
              const efectivos = dataPersonal.filter(e => e.nombre_local_asignado?.toUpperCase().trim() === p.NOMBRE_DEL?.toUpperCase().trim());
              layer.bindPopup(`
                <div style="min-width:230px">
                  <div style="background:#00251a; color:white; padding:5px; text-align:center"><b>ID: ${p.OBJECTID}</b></div>
                  <div style="padding:10px">
                    <strong style="color:#0d47a1">${p.NOMBRE_DEL}</strong><hr/>
                    <b>🛡️ PERSONAL:</b><br/>
                    ${efectivos.length > 0 ? efectivos.map(e => `• ${e.grado} ${e.apellidos_nombres}<br/>`).join('') : 'Sin asignar'}
                  </div>
                </div>`);
            }}
          />
        </LayersControl>
      </MapContainer>
    </div>
  );
}
export default App;
