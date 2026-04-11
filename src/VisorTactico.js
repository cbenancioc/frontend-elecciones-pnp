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

function VisorTactico() {
  const [dataFull, setDataFull] = useState(null);
  const [dataPersonal, setDataPersonal] = useState([]);
  const [distritosActivos, setDistritosActivos] = useState(["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"]);
  const [zoomLevel, setZoomLevel] = useState(12);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch('/centros_votacion_este2.json').then(res => res.json()).then(setDataFull);
    fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-asignado').then(res => res.json()).then(setDataPersonal);
  }, []);

  const localesFiltrados = useMemo(() => {
    if (!dataFull) return [];
    return dataFull.features.filter(f => distritosActivos.includes(f.properties.DISTRITO__.toUpperCase().trim()));
  }, [dataFull, distritosActivos]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={[-12.043, -76.915]} zoom={12} style={{ height: '100%', width: '100%' }} ref={mapRef}>
        <ZoomHandler setZoom={setZoomLevel} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {dataFull && <GeoJSON data={{ type: "FeatureCollection", features: localesFiltrados }} 
          pointToLayer={(f, l) => L.marker(l, { icon: iconoLocal })}
          onEachFeature={(f, layer) => {
            const p = f.properties;
            const efectivos = dataPersonal.filter(e => (e.nombre_local_asignado || "").toUpperCase() === p.NOMBRE_DEL.toUpperCase());
            layer.bindPopup(`<b>${p.NOMBRE_DEL}</b><br/>🛡️ PERSONAL: ${efectivos.length > 0 ? efectivos.map(e => e.apellidos_nombres).join(', ') : 'Sin asignar'}`);
          }}
        />}
      </MapContainer>
    </div>
  );
}

export default VisorTactico;
