/**
 * Riot Games API endpoints for League of Legends.
 */

export const riotApiEndpoints = {
    getSummonerByName: (platform, summonerName) =>
        `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
    getSummonerByPUUID: (platform, puuid) =>
        `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`,
    getMasteriesBySummonerId: (platform, summonerId) =>
        `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${encodeURIComponent(summonerId)}`,
    getRankBySummonerId: (platform, summonerId) =>
        `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`,
    getLadder: (platform, queue = "RANKED_SOLO_5x5", tier = "CHALLENGER", division = "") =>
        `https://${platform}.api.riotgames.com/lol/league/v4/${tier.toLowerCase()}leagues/by-queue/${queue}`,
    getChampionData: (locale = "es_ES") =>
        `https://ddragon.leagueoflegends.com/cdn/latest/data/${locale}/champion.json`
};