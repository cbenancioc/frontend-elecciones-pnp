import React, { useState, useEffect } from 'react';

function App() {
  const [estado, setEstado] = useState('📡 Conectando con el Cuartel General en Render...');

  useEffect(() => {
    // Aquí está la antena apuntando directamente a su servidor en la nube
    fetch('https://backend-elecciones-pnp-2026.onrender.com/')
      .then(respuesta => respuesta.text())
      .then(datos => setEstado('✅ ¡Conexión Establecida con el Servidor!'))
      .catch(error => setEstado('❌ Error de comunicación con la base de datos.'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛡️ Sistema de Elecciones PNP 2026</h1>
      <h2>Panel de Control Central</h2>
      <div style={{ 
        padding: '20px', 
        border: '2px solid #ccc', 
        borderRadius: '10px', 
        display: 'inline-block',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>Estado de la Red:</h3>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: estado.includes('✅') ? 'green' : 'red' }}>
          {estado}
        </p>
      </div>
    </div>
  );
}

export default App;