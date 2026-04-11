import React, { useState } from 'react';
import VisorTactico from './VisorTactico'; 
import Asignador from './Asignador';

function App() {
  const [pestaña, setPestaña] = useState('mapa');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a' }}>
      {/* BARRA DE COMANDO SUPERIOR */}
      <nav style={{ 
        backgroundColor: '#00251a', 
        padding: '12px', 
        display: 'flex', 
        gap: '20px', 
        justifyContent: 'center',
        borderBottom: '3px solid #ffeb3b',
        zIndex: 2000 
      }}>
        <button 
          onClick={() => setPestaña('mapa')}
          style={{ 
            background: pestaña === 'mapa' ? '#2e7d32' : 'transparent', 
            color: 'white', border: '1px solid white', padding: '10px 25px', 
            cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' 
          }}
        >📍 VISOR TÁCTICO</button>
        
        <button 
          onClick={() => setPestaña('admin')}
          style={{ 
            background: pestaña === 'admin' ? '#2e7d32' : 'transparent', 
            color: 'white', border: '1px solid white', padding: '10px 25px', 
            cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' 
          }}
        >⚙️ ASIGNACIÓN DE PERSONAL</button>
      </nav>

      {/* ÁREA DE OPERACIONES */}
      <div style={{ flex: 1, position: 'relative' }}>
        {pestaña === 'mapa' ? <VisorTactico /> : <Asignador />}
      </div>
    </div>
  );
}

export default App;
