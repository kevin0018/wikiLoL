const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function fetchChampionData(locale = "es_ES", version = "15.10.1") {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/champion.json`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`DataDragon API error: ${response.status}`);
    }
    return await response.json();
}

module.exports = { fetchChampionData };