const baseUrl = import.meta.env.VITE_API_BASE_URL;


/**
 * Fetches the account data for a given gameName and tagLine
 * @param {string} gameName
 * @param {string} tagLine
 * @returns {Promise<Object|null>} Account data or null if not found
 */
export async function getAccount(gameName, tagLine) {
    const res = await fetch(`${baseUrl}/api/account/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
    if (!res.ok) throw new Error('Error al obtener la cuenta');
    return await res.json();
}

/**
 * Fetches the ranked data for a given gameName and tagLine
 * @param {string} puuid
 * @param {string} region
 * @returns {Promise<Object|null>} Ranked data or null if not found
 */
export async function fetchRank(puuid, region)  {
    console.log(puuid);
    const res = await fetch(`${baseUrl}/api/account/rank/${encodeURIComponent(region)}/${encodeURIComponent(puuid)}`);
    console.log(res);
    if (!res.ok) throw new Error("No se pudo obtener el rango.");
    const { ranks } = await res.json();
    return ranks.find(r => r.queueType === "RANKED_SOLO_5x5") ?? ranks[0] ?? null;
}