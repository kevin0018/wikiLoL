const request = require('supertest');
const express = require('express');

// Mock the getAccountByRiotId function
// This is a simple mock that returns a resolved promise with fake data
// to simulate the behavior of the actual function.
jest.mock('../src/app/getAccountByRiotIdService', () => ({
    getAccountByRiotId: jest.fn().mockResolvedValue({
        puuid: 'fake-puuid',
        gameName: 'Juan',
        tagLine: 'EUW'
    })
}));

const { getAccountByRiotId } = require('../src/app/getAccountByRiotIdService');
const routes = require('../src/interfaces/routes');

describe('GET /api/account', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api', routes);
    });

    it('should return 400 if gameName or tagLine is missing', async () => {
        const res = await request(app).get('/api/account?gameName=Juan');
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Faltan parámetros gameName o tagLine.');
    });

    it('should return 200 and account info with valid params', async () => {
        const res = await request(app).get('/api/account?gameName=Juan&tagLine=EUW');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('puuid', 'fake-puuid');
        expect(getAccountByRiotId).toHaveBeenCalledWith('Juan', 'EUW');
    });
});