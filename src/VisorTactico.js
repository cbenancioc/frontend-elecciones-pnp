import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconografía
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

// CAMBIO CRÍTICO: El nombre de la función debe ser VisorTactico
function VisorTactico() {
  const [dataFull, setDataFull] = useState(null);
  const [dataPersonal, setDataPersonal] = useState([]);
  const [distritosActivos, setDistritosActivos] = useState(["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"]);
  const [idBuscado, setIdBuscado] = useState("");
  const [zoomLevel, setZoomLevel] = useState(12);
  const mapRef = useRef(null);

  const distritosZonaEste = ["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"];
  
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
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>📍 VISOR DE LOCALES</h3>
          <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
            {distritosZonaEste.map(d => (
              <label key={d} style={{ fontSize: '10px' }}>
                <input type="checkbox" checked={distritosActivos.includes(d)} onChange={() => setDistritosActivos(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} /> {d}
              </label>
            ))}
          </div>
        </div>
        <div>
          <input type="number" placeholder="ID" value={idBuscado} onChange={(e) => setIdBuscado(e.target.value)} style={{ width: '50px' }} />
          <button onClick={localizarID} style={{ background: '#2e7d32', color: 'white', border: 'none', marginLeft: '5px' }}>IR</button>
        </div>
      </header>

      <MapContainer center={[-12.043, -76.915]} zoom={12} style={{ flex: 1 }} ref={mapRef}>
        <ZoomHandler setZoom={setZoomLevel} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {dataFull && <GeoJSON 
          key={`${distritosActivos.join(',')}-${zoomLevel > 14}`}
          data={{ type: "FeatureCollection", features: localesFiltrados }}
          pointToLayer={(f, l) => L.marker(l, { icon: iconoLocal })}
          onEachFeature={(f, layer) => {
            const p = f.properties;
            const efectivos = dataPersonal.filter(e => limpiarTexto(e.nombre_local_asignado) === limpiarTexto(p.NOMBRE_DEL));
            layer.bindPopup(`
              <div style="min-width:180px">
                <b>${p.NOMBRE_DEL}</b><hr/>
                🛡️ PERSONAL: ${efectivos.length > 0 ? efectivos.map(e => e.apellidos_nombres).join(', ') : 'Sin asignar'}
              </div>`);
          }}
        />}
      </MapContainer>
    </div>
  );
}

// CAMBIO CRÍTICO: Debe exportar VisorTactico
export default VisorTactico;
