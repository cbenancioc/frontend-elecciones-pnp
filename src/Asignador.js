import React, { useState, useEffect } from 'react';

function Asignador() {
  const [personal, setPersonal] = useState([]);
  const [locales, setLocales] = useState([]);
  const [agenteSel, setAgenteSel] = useState(null);

  useEffect(() => {
    fetch('https://backend-elecciones-pnp-2026.onrender.com/personal-asignado').then(res => res.json()).then(setData => setPersonal(Array.isArray(setData) ? setData : []));
    fetch('/centros_votacion_este2.json').then(res => res.json()).then(data => setLocales(data.features));
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', height: '100%' }}>
      <h2 style={{ color: '#00251a' }}>⚙️ PANEL DE ASIGNACIÓN</h2>
      <p>Seleccione un efectivo para vincularlo a un local de votación.</p>
      {/* Lista simple para probar carga */}
      <div style={{ border: '1px solid #ccc', padding: '10px' }}>
        {personal.length > 0 ? `Total personal cargado: ${personal.length}` : "Cargando personal..."}
      </div>
    </div>
  );
}

export default Asignador;
