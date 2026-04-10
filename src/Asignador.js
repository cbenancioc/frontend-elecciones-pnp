import React, { useState, useEffect } from 'react';

const Asignador = () => {
  const [personal, setPersonal] = useState([]);
  const [locales, setLocales] = useState([]);
  const [agenteSel, setAgenteSel] = useState(null);
  const [distritoFiltro, setDistritoFiltro] = useState("ATE");

  useEffect(() => {
    // Carga de datos desde su Backend y JSON local
    fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-asignado')
      .then(res => res.json()).then(data => setPersonal(Array.isArray(data) ? data : []));
    
    fetch('/centros_votacion_este2.json')
      .then(res => res.json()).then(data => setLocales(data.features));
  }, []);

  const asignarLocal = async (local) => {
    if (!agenteSel) return alert("⚠️ Seleccione un efectivo policial primero.");
    
    const confirmacion = window.confirm(`¿Asignar el local "${local.properties.NOMBRE_DEL}" al ${agenteSel.grado} ${agenteSel.apellidos_nombres}?`);
    
    if (confirmacion) {
      // Aquí enviamos la actualización al Backend para guardar en Supabase
      try {
        const response = await fetch('https://backend-elecciones-pnp-2026.onrender.com/asignar-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cip: agenteSel.cip,
            nombre_local: local.properties.NOMBRE_DEL
          })
        });
        if (response.ok) alert("✅ Asignación exitosa.");
      } catch (err) {
        alert("❌ Error al conectar con el servidor.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '15px', padding: '15px', backgroundColor: '#f0f2f5' }}>
      
      {/* SECTOR 1: LISTA DE PERSONAL */}
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <h3 style={{ color: '#00251a', borderBottom: '2px solid #2e7d32' }}>👤 FUERZA POLICIAL</h3>
        <select onChange={(e) => setDistritoFiltro(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          <option value="ATE">ATE</option>
          <option value="LA MOLINA">LA MOLINA</option>
          <option value="SANTA ANITA">SANTA ANITA</option>
          <option value="SAN LUIS">SAN LUIS</option>
          <option value="CIENEGUILLA">CIENEGUILLA</option>
        </select>
        {personal.filter(p => p.distrito_servicio === distritoFiltro).map(p => (
          <div 
            key={p.cip} 
            onClick={() => setAgenteSel(p)}
            style={{ 
              padding: '10px', margin: '8px 0', borderRadius: '5px', cursor: 'pointer', border: '1px solid #ddd',
              backgroundColor: agenteSel?.cip === p.cip ? '#e8f5e9' : 'white',
              borderLeft: agenteSel?.cip === p.cip ? '5px solid #2e7d32' : '1px solid #ddd'
            }}
          >
            <b>{p.grado} {p.apellidos_nombres}</b><br/>
            <small>CIP: {p.cip} | Unidad: {p.unidad}</small>
          </div>
        ))}
      </div>

      {/* SECTOR 2: ASIGNACIÓN DE COLEGIOS */}
      <div style={{ flex: 2, backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <h3 style={{ color: '#00251a', borderBottom: '2px solid #2e7d32' }}>🏢 LOCALES DE VOTACIÓN - {distritoFiltro}</h3>
        {agenteSel ? (
          <p style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '5px' }}>
            Asignando a: <b>{agenteSel.grado} {agenteSel.apellidos_nombres}</b>
          </p>
        ) : <p>Seleccione un efectivo a la izquierda para asignar locales.</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {locales.filter(l => l.properties.DISTRITO__ === distritoFiltro).map(l => (
            <div key={l.properties.OBJECTID} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{l.properties.NOMBRE_DEL}</span>
              <button 
                onClick={() => asignarLocal(l)}
                style={{ marginTop: '5px', backgroundColor: '#1b5e20', color: 'white', border: 'none', padding: '5px', borderRadius: '3px', cursor: 'pointer' }}
              >
                VINCULAR
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Asignador;
