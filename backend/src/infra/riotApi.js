const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const RIOT_API_KEY = process.env.RIOT_API_KEY;

async function fetchAccountByRiotId(gameName, tagLine) {
    const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const response = await fetch(url, {
        headers: {
            "X-Riot-Token": RIOT_API_KEY
        }
    });
    if (!response.ok) {
        throw new Error(`Riot API error: ${response.status} - ${await response.text()}`);
    }
    return await response.json();
}

module.exports = { fetchAccountByRiotId };