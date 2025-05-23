import { riotApiEndpoints } from "./riotEndpoints.js";

/**
 * Fetches summoner data by name.
 */
export async function fetchSummonerByName(platform, summonerName, apiKey) {
    const url = riotApiEndpoints.getSummonerByName(platform, summonerName);
    const response = await fetch(url, {
        headers: { "X-Riot-Token": apiKey }
    });
    if (!response.ok) throw new Error("No se pudo obtener el invocador");
    return await response.json();
}

/**
 * Fetches champion masteries by summonerId.
 */
export async function fetchChampionMasteries(platform, summonerId, apiKey) {
    const url = riotApiEndpoints.getMasteriesBySummonerId(platform, summonerId);
    const response = await fetch(url, {
        headers: { "X-Riot-Token": apiKey }
    });
    if (!response.ok) throw new Error("No se pudieron obtener las maestrías");
    return await response.json();
}

/**
 * Fetches champions data.
 */
export async function fetchChampionData(locale, version) {
    const url = riotApiEndpoints.getChampionData(locale, version);
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudieron obtener los campeones");
    return await response.json();
}