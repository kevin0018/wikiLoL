const request = require('supertest');
const express = require('express');

// Mock de la capa app para aislar el test del endpoint
jest.mock('../src/app/getChampionDataService', () => ({
    getChampionData: jest.fn(),
}));

const { getChampionData } = require('../src/app/getChampionDataService');
const routes = require('../src/interfaces/routes');

describe('GET /champion', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api', routes);
    });

    it('debe devolver 200 y los datos de los campeones si los parámetros son válidos', async () => {
        // Simula la respuesta del servicio
        const mockChampionData = {
            data: {
                Aatrox: { id: "Aatrox", name: "Aatrox" },
                Ahri: { id: "Ahri", name: "Ahri" }
            },
            type: "champion",
            version: "15.10.1"
        };
        getChampionData.mockResolvedValue(mockChampionData);

        const res = await request(app).get('/api/champion?locale=es_ES&version=15.10.1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockChampionData);
        expect(getChampionData).toHaveBeenCalledWith('es_ES', '15.10.1');
    });

    it('debe devolver 500 si ocurre un error en el servicio', async () => {
        getChampionData.mockRejectedValue(new Error('DataDragon API error: 500'));
        const res = await request(app).get('/api/champion?locale=es_ES&version=15.10.1');
        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});