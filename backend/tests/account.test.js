jest.mock('../src/infra/riotApi', () => ({
    getAccountByRiotId: jest.fn().mockResolvedValue({
        puuid: 'fake-puuid',
        gameName: 'Juan',
        tagLine: 'EUW'
    })
}));

const { getAccountByRiotId } = require('../src/infra/riotApi');
const request = require('supertest');
const express = require('express');
const routes = require('../src/interfaces/routes');
const app = express();

app.use(express.json());
app.use('/api', routes);

describe('GET /api/account', () => {
    it('should return 400 if gameName or tagLine is missing', async () => {
        const res = await request(app).get('/api/account?gameName=Juan');
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Missing gameName or tagLine.');
    });
    it('should return 200 and account info with valid params', async () => {
        const res = await request(app).get('/api/account?gameName=Juan&tagLine=EUW');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('puuid', 'fake-puuid');
        expect(getAccountByRiotId).toHaveBeenCalledWith('Juan', 'EUW');
    });
});