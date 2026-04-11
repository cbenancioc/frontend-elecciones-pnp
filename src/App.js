import React, { useState } from 'react';
import VisorTactico from './VisorTactico'; // Llama al mapa
import Asignador from './Asignador';       // Llama al administrador

function App() {
  const [pestaña, setPestaña] = useState('mapa');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Barra de Navegación Superior */}
      <nav style={{ 
        backgroundColor: '#00251a', 
        padding: '10px', 
        display: 'flex', 
        gap: '20px', 
        justifyContent: 'center',
        borderBottom: '2px solid #ffeb3b',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
      }}>
        <button 
          onClick={() => setPestaña('mapa')}
          style={{ 
            background: pestaña === 'mapa' ? '#2e7d32' : 'transparent', 
            color: 'white', 
            border: '1px solid white', 
            padding: '10px 25px', 
            cursor: 'pointer', 
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          📍 VISOR TÁCTICO
        </button>
        <button 
          onClick={() => setPestaña('admin')}
          style={{ 
            background: pestaña === 'admin' ? '#2e7d32' : 'transparent', 
            color: 'white', 
            border: '1px solid white', 
            padding: '10px 25px', 
            cursor: 'pointer', 
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          ⚙️ ADMINISTRACIÓN DE PERSONAL
        </button>
      </nav>

      {/* Contenido Dinámico */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {pestaña === 'mapa' ? <VisorTactico /> : <Asignador />}
      </div>
    </div>
  );
}

export default App;
