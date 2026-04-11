import React, { useState } from 'react';
import VisorTactico from './VisorTactico';
import Asignador from './Asignador';

function App() {
  const [pestaña, setPestaña] = useState('mapa');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ backgroundColor: '#00251a', padding: '15px', display: 'flex', gap: '20px', justifyContent: 'center', borderBottom: '3px solid #ffeb3b' }}>
        <button onClick={() => setPestaña('mapa')} style={{ background: pestaña === 'mapa' ? '#2e7d32' : 'transparent', color: 'white', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold', border: '1px solid white' }}>📍 MAPA</button>
        <button onClick={() => setPestaña('admin')} style={{ background: pestaña === 'admin' ? '#2e7d32' : 'transparent', color: 'white', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold', border: '1px solid white' }}>⚙️ ASIGNAR</button>
      </nav>
      <div style={{ flex: 1 }}>
        {pestaña === 'mapa' ? <VisorTactico /> : <Asignador />}
      </div>
    </div>
  );
}

export default App;
