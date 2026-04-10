import React, { useState } from 'react';
import VisorMapa from './VisorMapa'; // Su código actual del mapa muévalo aquí o déjelo integrado
import Asignador from './Asignador';

function App() {
  const [pestaña, setPestaña] = useState('mapa');

  return (
    <div>
      {/* Barra de Navegación de Comando */}
      <nav style={{ backgroundColor: '#00251a', padding: '10px', display: 'flex', gap: '20px' }}>
        <button 
          onClick={() => setPestaña('mapa')}
          style={{ background: pestaña === 'mapa' ? '#2e7d32' : 'transparent', color: 'white', border: '1px solid white', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}
        >
          📍 VISOR TÁCTICO
        </button>
        <button 
          onClick={() => setPestaña('admin')}
          style={{ background: pestaña === 'admin' ? '#2e7d32' : 'transparent', color: 'white', border: '1px solid white', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}
        >
          ⚙️ ADMINISTRACIÓN DE PERSONAL
        </button>
      </nav>

      {/* Contenido Dinámico */}
      {pestaña === 'mapa' ? <VisorMapa /> : <Asignador />}
    </div>
  );
}

export default App;
