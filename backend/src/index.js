// File: backend/src/index.js (Temporary debugging version, aligned with Vercel guide)

// --- BEGIN VERY EARLY DEBUG LOG ---
console.log('[DEBUG_INIT_VG] backend/src/index.js execution started (Vercel Guide alignment). Node version: 22.x');
// --- END VERY EARLY DEBUG LOG ---

import process from 'node:process';
import express from 'express';
// import cors from 'cors'; // Still commented out for minimal surface
// import routes from './interfaces/routes.js'; // Still commented out
// import assetsProxy from "./proxy/infra/RiotAssetsProxy.js"; // Still commented out

// await process.loadEnvFile(); // Still commented out
// console.log('[DEBUG_ENV_VG] process.loadEnvFile() line is commented out.');

const app = express();
const PORT = process.env.PORT || 3001;

console.log(`[DEBUG_CONFIG_VG] Express app initialized. Target PORT from env or default: ${PORT}.`);
console.log(`[DEBUG_ENV_CHECK_VG] Vercel-provided PORT: ${process.env.PORT}`);
console.log(`[DEBUG_ENV_CHECK_VG] RIOT_API_KEY from Vercel env: ${process.env.RIOT_API_KEY ? 'LOADED' : 'NOT LOADED or not set in Vercel dashboard'}`);

// app.use(cors()); // Still commented out
app.use(express.json());
console.log('[DEBUG_MIDDLEWARE_VG] express.json middleware applied.');

app.get('/', (req, res) => {
    console.log('[DEBUG_ROUTE_HIT_VG] Root path / was hit by a request.');
    res.status(200).send('¡Servidor de depuración (guía Vercel) está activo en la raíz!');
});

app.get('/ping-debug-literal', (req, res) => {
    console.log('[DEBUG_ROUTE_HIT_VG] /ping-debug-literal path was hit by a request.');
    res.status(200).send('¡Pong desde /ping-debug-literal (guía Vercel)!');
});

// app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`[DEBUG_LISTEN_VG] Servidor de depuración (guía Vercel) está escuchando en el puerto ${PORT}.`);
});

// --- KEY CHANGE FOR VERCEL GUIDE ALIGNMENT ---
// Export the Express app
export default app;
// --- END KEY CHANGE ---