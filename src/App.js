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

  // FUNCIÓN CRÍTICA: Normaliza el texto para encontrar coincidencias (quita puntos, espacios y números de IE)
  const normalizarParaCruce = (texto) => {
    return (texto || "")
      .toString()
      .toUpperCase()
      .replace(/\./g, "")      // Quita puntos (I.E. -> IE)
      .replace(/I\s*E/g, "")   // Quita la sigla IE
      .replace(/\s+/g, "")     // Quita todos los espacios
      .trim();
  };

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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px 20px', zIndex: 1000, boxShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h2 style={{ margin: 0, fontSize: '1.2rem' }}>🛡️ COMANDO ELECTORAL - ZONA ESTE 2</h2><small>INTELIGENCIA PNP</small></div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px' }}>
            <input type="number" value={idBuscado} onChange={(e) => setIdBuscado(e.target.value)} style={{ padding: '5px', width: '70px' }} placeholder="ID" />
            <button onClick={localizarID} style={{ marginLeft: '5px', padding: '5px 10px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: 'none', fontWeight: 'bold' }}>BUSCAR</button>
          </div>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.8rem', background: '#003d33', padding: '5px', borderRadius: '4px' }}>
          {distritosZonaEste.map(dist => (
            <label key={dist} style={{ cursor: 'pointer' }}><input type="checkbox" checked={distritosActivos.includes(dist)} onChange={() => setDistritosActivos(prev => prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist])} /> {dist}</label>
          ))}
        </div>
      </header>

      <MapContainer center={centroZonaEste} zoom={12} style={{ flex: 1 }} ref={mapRef} preferCanvas={true}>
        <ZoomHandler setZoom={setZoomLevel} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /></LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelital"><TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" /></LayersControl.BaseLayer>
          
          <GeoJSON 
            key={`${distritosActivos.join(',')}-${zoomLevel > 14}`} 
            data={{ type: "FeatureCollection", features: localesFiltrados }}
            pointToLayer={(f, l) => {
              const m = L.marker(l, { icon: iconoLocal });
              if (zoomLevel > 14) m.bindTooltip(`<b>${f.properties.NOMBRE_DEL}</b>`, { permanent: true, direction: 'right', offset: [10, -15], opacity: 0.85 });
              return m;
            }}
            onEachFeature={(f, layer) => {
              const p = f.properties;
              
              // VINCULACIÓN INTELIGENTE: Compara el "ADN" de los nombres
              const efectivos = dataPersonal.filter(e => {
                const adnDB = normalizarParaCruce(e.nombre_local_asignado);
                const adnJSON = normalizarParaCruce(p.NOMBRE_DEL);
                return adnDB.includes(adnJSON) || adnJSON.includes(adnDB);
              });

              layer.bindPopup(`
                <div style="min-width:240px">
                  <div style="background:#00251a; color:white; padding:8px; text-align:center; border-radius:4px 4px 0 0"><b>ID LOCAL: ${p.OBJECTID}</b></div>
                  <div style="padding:12px; border:1px solid #00251a; border-top:none; background:#fff">
                    <strong style="color:#0d47a1">${p.NOMBRE_DEL}</strong><br/><small>📍 ${p.DIRECCIÓN}</small>
                    <hr/><p style="background:#e8f5e9; color:#1b5e20; padding:5px; font-weight:bold; text-align:center; margin:5px 0">🛡️ PERSONAL PNP</p>
                    ${efectivos.length > 0 ? efectivos.map(e => `
                      <div style="margin-bottom:8px; padding:6px; border-left:4px solid #2e7d32; background:#f9f9f9">
                        <b>${e.grado} ${e.apellidos_nombres}</b><br/>
                        <small>CIP: ${e.cip} | Tel: ${e.telefono}</small>
                      </div>`).join('') : '<div style="color:red; text-align:center">Sin personal asignado</div>'}
                    <hr/><small>🗳️ Mesas: ${p.MESAS} | 👥 Electores: ${p.ELECTORES}</small>
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
