import React, { useState, useEffect } from 'react';

const Asignador = () => {
  const [personal, setPersonal] = useState([]);
  const [locales, setLocales] = useState([]);
  const [agenteSel, setAgenteSel] = useState(null);
  const [distritoFiltro, setDistritoFiltro] = useState("ATE");

  useEffect(() => {
    fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-asignado')
      .then(res => res.json()).then(data => setPersonal(Array.isArray(data) ? data : []));
    
    fetch('/centros_votacion_este2.json')
      .then(res => res.json()).then(data => setLocales(data.features));
  }, []);

  const asignarLocal = async (local) => {
    if (!agenteSel) return alert("⚠️ Seleccione un efectivo policial primero.");
    
    const confirmacion = window.confirm(`¿Asignar "${local.properties.NOMBRE_DEL}" al ${agenteSel.grado} ${agenteSel.apellidos_nombres}?`);
    
    if (confirmacion) {
      try {
        const response = await fetch('https://backend-elecciones-pnp-2026.onrender.com/asignar-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cip: agenteSel.cip,
            nombre_local: local.properties.NOMBRE_DEL
          })
        });
        if (response.ok) alert("✅ Asignación exitosa. El mapa se actualizará automáticamente.");
      } catch (err) {
        alert("❌ Error de conexión con el servidor.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', gap: '15px', padding: '15px', backgroundColor: '#f0f2f5' }}>
      {/* LISTA DE PERSONAL */}
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <h3 style={{ color: '#00251a', borderBottom: '2px solid #2e7d32' }}>👤 FUERZA POLICIAL</h3>
        <select value={distritoFiltro} onChange={(e) => setDistritoFiltro(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          {["ATE", "LA MOLINA", "SANTA ANITA", "SAN LUIS", "CIENEGUILLA"].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {personal.filter(p => p.distrito_servicio === distritoFiltro).map(p => (
          <div key={p.cip} onClick={() => setAgenteSel(p)} 
               style={{ padding: '10px', margin: '8px 0', borderRadius: '5px', cursor: 'pointer', border: '1px solid #ddd',
                        backgroundColor: agenteSel?.cip === p.cip ? '#e8f5e9' : 'white',
                        borderLeft: agenteSel?.cip === p.cip ? '5px solid #2e7d32' : '1px solid #ddd' }}>
            <b>{p.grado} {p.apellidos_nombres}</b><br/><small>CIP: {p.cip}</small>
          </div>
        ))}
      </div>

      {/* LISTA DE LOCALES */}
      <div style={{ flex: 2, backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <h3 style={{ color: '#00251a', borderBottom: '2px solid #2e7d32' }}>🏢 LOCALES - {distritoFiltro}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {locales.filter(l => l.properties.DISTRITO__ === distritoFiltro).map(l => (
            <div key={l.properties.OBJECTID} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '5px', background: '#fafafa' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{l.properties.NOMBRE_DEL}</span><br/>
              <button onClick={() => asignarLocal(l)} style={{ marginTop: '5px', backgroundColor: '#1b5e20', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '10px' }}>VINCULAR</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Asignador;
