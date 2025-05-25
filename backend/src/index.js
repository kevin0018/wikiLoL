import process from 'node:process';
import express from 'express';
import cors from 'cors';
import routes from './interfaces/routes.js';
import assetsProxy from "./api/assetsProxy.js";

// Load environment variables
await process.loadEnvFile();

// Import the routes
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use("/api/assets", assetsProxy);

// Start the server
app.listen(PORT, () => {
    console.log(`Backend corriendo en http://localhost:${PORT}`);
});

