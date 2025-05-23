process.loadEnvFile();

const express = require('express');
const cors = require('cors');
const routes = require('./interfaces/routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Backend corriendo en http://localhost:${PORT}`);
});