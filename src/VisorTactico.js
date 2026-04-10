import React, { useState } from 'react';
import VisorTactico from './VisorTactico'; // Deberá renombrar su App.js actual como VisorTactico.js o integrar el código aquí
import Asignador from './Asignador';

function App() {
  const [vista, setVista] = useState('mapa');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* BARRA DE COMANDO SUPERIOR */}
      <nav style={{ backgroundColor: '#00251a', padding: '10px', display: 'flex', gap: '20px', justifyContent: 'center', borderBottom: '2px solid #ffeb3b' }}>
        <button onClick={() => setVista('mapa')} style={{ background: vista === 'mapa' ? '#2e7d32' : 'transparent', color: 'white', border: '1px solid white', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          📍 VISOR TÁCTICO (MAPA)
        </button>
        <button onClick={() => setVista('admin')} style={{ background: vista === 'admin' ? '#2e7d32' : 'transparent', color: 'white', border: '1px solid white', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          ⚙️ ASIGNACIÓN DE PERSONAL
        </button>
      </nav>

      {/* CONTENIDO DINÁMICO */}
      <div style={{ flex: 1 }}>
        {vista === 'mapa' ? <VisorTactico /> : <Asignador />}
      </div>
    </div>
  );
}

export default VisorTactico;
