import React, { useState, useEffect } from 'react';

function Asignador() {
  const [personal, setPersonal] = useState([]);
  const [locales, setLocales] = useState([]);
  const [agenteSel, setAgenteSel] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Carga de Personal con manejo de errores
   fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-asignado')
      .then(res => res.json())
      .then(data => {
        setPersonal(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando personal:", err);
        setCargando(false);
      });

    // Carga de Locales
    fetch('/centros_votacion_este2.json')
      .then(res => res.json())
      .then(data => setLocales(data.features || []));
  }, []);

  const vincular = async (local) => {
    if (!agenteSel) return alert("Seleccione un efectivo primero");
    const confirmacion = window.confirm(`¿Asignar ${local.properties.NOMBRE_DEL} al ${agenteSel.grado} ${agenteSel.apellidos_nombres}?`);
    if (confirmacion) {
      try {
        const res = await fetch('https://backend-elecciones-pnp-2026.onrender.com/asignar-local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cip: agenteSel.cip, nombre_local: local.properties.NOMBRE_DEL })
        });
        if (res.ok) alert("✅ Vínculo realizado con éxito.");
      } catch (e) { alert("Error al conectar con el servidor."); }
    }
  };

  if (cargando) return <div style={{padding: '20px'}}>⌛ Conectando con la base de datos de inteligencia...</div>;

  return (
    <div style={{ display: 'flex', height: '100%', gap: '15px', padding: '15px', backgroundColor: '#f4f4f4' }}>
      <div style={{ flex: 1, backgroundColor: 'white', padding: '15px', overflowY: 'auto', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h3 style={{ borderBottom: '2px solid #2e7d32', color: '#00251a' }}>👤 PERSONAL PNP</h3>
        {personal.length === 0 && <p>No se encontraron datos de personal.</p>}
        {personal.map(p => (
          <div key={p.cip} onClick={() => setAgenteSel(p)} 
               style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '8px', cursor: 'pointer', borderRadius: '4px',
                        background: agenteSel?.cip === p.cip ? '#e8f5e9' : 'white',
                        borderLeft: agenteSel?.cip === p.cip ? '5px solid #2e7d32' : '1px solid #ddd' }}>
            <b>{p.grado} {p.apellidos_nombres}</b><br/>
            <small>CIP: {p.cip} | {p.distrito_servicio}</small>
          </div>
        ))}
      </div>
      
      <div style={{ flex: 1, backgroundColor: 'white', padding: '15px', overflowY: 'auto', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h3 style={{ borderBottom: '2px solid #2e7d32', color: '#00251a' }}>🏢 LOCALES DISPONIBLES</h3>
        {!agenteSel && <p style={{color: '#666'}}>Seleccione un efectivo a la izquierda para ver locales.</p>}
        {agenteSel && locales.filter(l => l.properties.DISTRITO__ === agenteSel.distrito_servicio).map(l => (
          <div key={l.properties.OBJECTID} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{l.properties.NOMBRE_DEL}</span>
            <button onClick={() => vincular(l)} style={{ background: '#1b5e20', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>VINCULAR</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Asignador;
