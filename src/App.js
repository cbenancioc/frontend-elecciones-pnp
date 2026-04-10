const alHacerClicEnLocal = (feature, layer) => {
    if (feature.properties) {
      const p = feature.properties;
      
      layer.bindPopup(`
        <div style="text-align:center; font-family:Arial; min-width:230px">
          <b style="color:#1b5e20; font-size:11px">LOCAL DE VOTACIÓN [ID: ${p.OBJECTID || 'S/N'}]</b><br/>
          <strong style="font-size:14px; color:#0d47a1">${p.NOMBRE_DEL || 'SIN NOMBRE'}</strong><br/>
          <hr style="border:0.5px solid #eee"/>
          <div style="text-align:left; font-size:11px">
            <b>📍 Distrito:</b> ${p.DISTRITO__ || 'No especificado'}<br/>
            <b>🏠 Dirección:</b> ${p.DIRECCIÓN || 'No especificada'}<br/>
            <b>🗳️ Mesas:</b> ${p.MESAS || '0'} | <b>👥 Votantes:</b> ${p.ELECTORES || '0'}<br/>
            <hr style="border:0.5px solid #eee"/>
            <p style="color:#d32f2f; font-weight:bold; text-align:center; margin:5px 0">PERSONAL DE INTELIGENCIA</p>
            <b>👤 Responsable:</b> Buscando asignación...<br/>
          </div>
          <button style="cursor:pointer; background:#1a237e; color:white; border:none; padding:8px; border-radius:3px; width:100%; margin-top:10px" 
                  onclick="alert('Enviando alerta al agente responsable...')">
            SOLICITAR REPORTE ACTUAL
          </button>
        </div>
      `);
    }
  };
