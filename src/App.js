import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ICONO ESTÉTICO TÁCTICO
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
  const [localSeleccionado, setLocalSeleccionado] = useState("");
  const [mapRef, setMapRef] = useState(null);

  const distritosDisponibles = ["ATE", "LA MOLINA", "SAN LUIS", "SANTA ANITA", "CIENEGUILLA"];
  const centroZonaEste = [-12.043, -76.915];

  useEffect(() => {
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => setDataFull(data))
      .catch(err => console.error("Error en carga:", err));
  }, []);

  // FILTRADO DINÁMICO MULTIDISTRITO
  const featureFiltradas = useMemo(() => {
    if (!dataFull || !dataFull.features) return [];
    return dataFull.features.filter(f => distritosActivos.includes(f.properties.DISTRITO__));
  }, [dataFull, distritosActivos]);

  // FUNCIÓN PARA SALTAR A UN LOCAL (BUSCADOR)
  const irALocal = (id) => {
    if (!dataFull || !mapRef) return;
    const local = dataFull.features.find(f => f.properties.OBJECTID.toString() === id);
    if (local) {
      const coords = [local.geometry.coordinates[1], local.geometry.coordinates[0]];
      mapRef.flyTo(coords, 18);
    }
  };

  const toggleDistrito = (dist) => {
    setDistritosActivos(prev => 
      prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist]
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#00251a', color: 'white', padding: '15px', zIndex: 1000, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🛡️ SISTEMA DE GEORREFERENCIACIÓN ELECTORAL 2026</h2>
            <small>DIRIN PNP - ZONA ESTE 2</small>
          </div>
          
          {/* BUSCADOR DE LOCAL POR ID */}
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
            <label>🔎 <b>BUSCAR LOCAL (ID): </b></label>
            <input 
              type="text" 
              placeholder="Ej: 105" 
              onChange={(e) => setLocalSeleccionado(e.target.value)}
              style={{ padding: '5px', borderRadius: '4px', border: 'none', width: '80px' }}
            />
            <button 
              onClick={() => irALocal(localSeleccionado)}
              style={{ marginLeft: '5px', padding: '5px 10px', cursor: 'pointer', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px' }}
            >IR</button>
          </div>
        </div>

        {/* FILTROS MULTIDISTRITO */}
        <div style={{ marginTop: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#003d33', padding: '10px', borderRadius: '5px' }}>
          <b>FILTRAR JURISDICCIÓN:</b>
          {distritosDisponibles.map(dist => (
            <label key={dist} style={{ cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={distritosActivos.includes(dist)} 
                onChange={() => toggleDistrito(dist)} 
              /> {dist}
            </label>
          ))}
        </div>
      </header>

      <MapContainer center={centroZonaEste} zoom={13} style={{ flex: 1 }} ref={setMapRef}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Táctico">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Visión Satelital">
            <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
          </LayersControl.BaseLayer>

          {dataFull && (
            <GeoJSON 
              key={JSON.stringify(distritosActivos)}
              data={{ type: "FeatureCollection", features: featureFiltradas }}
              pointToLayer={(feature, latlng) => {
                const marcador = L.marker(latlng, { icon: iconoLocal });
                // ETIQUETA DE NOMBRE JUNTO AL ICONO (Su orden)
                marcador.bindTooltip(`<b>${feature.properties.NOMBRE_DEL}</b>`, {
                  permanent: true,
                  direction: 'right',
                  offset: [10, -20],
                  className: 'label-tactica'
                });
                return marcador;
              }}
              onEachFeature={(feature, layer) => {
                const p = feature.properties;
                layer.bindPopup(`
                  <div style="min-width:200px">
                    <b style="color:#004d40">ID LOCAL: ${p.OBJECTID}</b><br/>
                    <strong style="font-size:1.1em">${p.NOMBRE_DEL}</strong><br/>
                    <hr/>
                    <b>📍 Dirección:</b> ${p.DIRECCIÓN}<br/>
                    <b>🗳️ Mesas:</b> ${p.MESAS} | <b>👥 Votantes:</b> ${p.ELECTORES}
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
