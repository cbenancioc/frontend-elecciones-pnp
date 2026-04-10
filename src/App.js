const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE CONEXIÓN (PUENTE DIRECTO)
const pool = new Pool({
    connectionString: "postgresql://postgres.fdexkgchsrzclllpxsrf:Ybena230297PNP@aws-1-sa-east-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

// RUTA 1: VERIFICACIÓN DE ESTADO
app.get('/', (req, res) => {
    res.send('SERVIDOR PNP OPERATIVO');
});

// RUTA 2: EXTRACCIÓN DE PUNTOS CRÍTICOS (PARA EL MAPA)
app.get('/puntos-criticos', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM puntos_criticos');
        res.json(resultado.rows);
    } catch (err) {
        console.error("Error en base de datos:", err.message);
        res.status(500).json({ error: "Error al obtener puntos tácticos" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🛡️ SERVIDOR C.C. OPERACIONES INICIADO EN PUERTO ${PORT}`);
    console.log(`=============================================`);
});

// VERIFICACIÓN DE CONEXIÓN INICIAL
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log("❌ Error de conexión:", err.message);
    } else {
        console.log("✅ ¡Conectado exitosamente a PostgreSQL (Modo Confianza)!");
    }
});
