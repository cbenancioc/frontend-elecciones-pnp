import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconografía Táctica
const iconoLocal = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

function ZoomHandler({ setZoom }) {
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });
  return null;
}

function VisorTactico() { // Nombre de función corregido
  const [dataFull, setDataFull] = useState(null);
  const [dataPersonal, setDataPersonal] = useState([]);
  const [distritosActivos, setDistritosActivos] = useState(["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"]);
  const [idBuscado, setIdBuscado] = useState("");
  const [zoomLevel, setZoomLevel] = useState(12);
  const mapRef = useRef(null);

  const distritosZonaEste = ["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"];
  const centroZonaEste = [-12.043, -76.915];

  // Limpieza de texto para vinculación blindada
  const limpiarTexto = (t) => (t || "").toString().toUpperCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

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
      f.properties && f.properties.DISTRITO__ && distritosActivos.includes(limpiarTexto(f.properties.DISTRITO__))
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px 20px', zIndex: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>📍 MONITOR DE LOCALES</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            {distritosZonaEste.map(d => (
              <label key={d} style={{ fontSize: '11px', cursor: 'pointer' }}>
                <input type="checkbox" checked={distritosActivos.includes(d)} onChange={() => setDistritosActivos(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} /> {d}
              </label>
            ))}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '4px' }}>
          <input type="number" placeholder="ID" value={idBuscado} onChange={(e) => setIdBuscado(e.target.value)} style={{ width: '60px', padding: '4px' }} />
          <button onClick={localizarID} style={{ marginLeft: '5px', padding: '4px 10px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: 'none' }}>IR</button>
        </div>
      </header>

      <MapContainer center={centroZonaEste} zoom={12} style={{ flex: 1 }} ref={mapRef}>
        <ZoomHandler setZoom={setZoomLevel} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /></LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelital"><TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" /></LayersControl.BaseLayer>
          
          <GeoJSON 
            key={`${distritosActivos.join(',')}-${zoomLevel > 14}`} 
            data={{ type: "FeatureCollection", features: localesFiltrados }}
            pointToLayer={(f, l) => {
              const m = L.marker(l, { icon: iconoLocal });
              if (zoomLevel > 14) m.bindTooltip(`<b>${f.properties.NOMBRE_DEL}</b>`, { permanent: true, direction: 'right', opacity: 0.85 });
              return m;
            }}
            onEachFeature={(f, layer) => {
              const p = f.properties;
              const efectivos = dataPersonal.filter(e => {
                const nDB = limpiarTexto(e.nombre_local_asignado);
                const nJSON = limpiarTexto(p.NOMBRE_DEL);
                return nDB === nJSON || nDB.includes(nJSON) || nJSON.includes(nDB);
              });

              layer.bindPopup(`
                <div style="min-width:200px">
                  <div style="background:#00251a; color:white; padding:5px; text-align:center"><b>ID: ${p.OBJECTID}</b></div>
                  <div style="padding:10px">
                    <strong style="color:#0d47a1">${p.NOMBRE_DEL}</strong><hr/>
                    <p style="background:#f1f8e9; padding:5px; font-weight:bold; text-align:center; margin:5px 0">🛡️ FUERZA PNP</p>
                    ${efectivos.length > 0 ? efectivos.map(e => `<b>${e.grado} ${e.apellidos_nombres}</b><br/>CIP: ${e.cip}<br/>`).join('<hr/>') : 'Sin personal asignado'}
                  </div>
                </div>`);
            }}
          />
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default VisorTactico; // Export corregido
