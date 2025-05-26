const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

/**
 * Fetches the account profile by gameName, tagLine and region.
 * @param {string} gameName
 * @param {string} tagLine
 * @param {string} region
 * @returns {Promise<Object>} AccountProfile data
 */
export async function getAccountProfile(gameName, tagLine, region) {
	const url = `${baseUrl}/api/account/profile?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(region)}`;
	const response = await fetch(url);
	if (!response.ok) {
		const errorText = await response.text();
		console.error('Respuesta del servidor:', errorText);
		throw new Error("No se pudo cargar el perfil");
	}
	return await response.json();
}

/**
 * Fetches all ranked data for a summoner by summonerId and region.
 * @param {string} summonerId
 * @param {string} region
 * @returns {Promise<Array>} Ranked data array
 */
export async function fetchRank(summonerId, region) {
	const url = `${baseUrl}/api/account/rank?summonerId=${encodeURIComponent(summonerId)}&region=${encodeURIComponent(region)}`;
	const response = await fetch(url);
	if (!response.ok) throw new Error("No se pudo obtener el rango.");
	// Devuelve array con todos los queues (soloQ y flexQ por separado)
	return await response.json();
}

/**
 * Fetches top 4 champion masteries for a user by puuid and region.
 * @param {string} puuid
 * @param {string} region
 * @returns {Promise<Array>} Champion mastery array
 */
export async function fetchChampionMastery(puuid, region) {
	const url = `${baseUrl}/api/account/mastery?puuid=${encodeURIComponent(puuid)}&region=${encodeURIComponent(region)}&top=4`;
	const response = await fetch(url);
	if (!response.ok) {
		const errorText = await response.text();
		console.error('Respuesta del servidor:', errorText);
		throw new Error("No se pudieron obtener las maestrías.");
	}
	if (!response.ok) throw new Error("No se pudo obtener la maestría.");
	return await response.json();
}

/**
 * Fetches top 4 most played champions for a user by puuid and region.
 * @param {string} puuid
 * @param {string} region
 * @returns {Promise<Array>} Most played champion array
 */
export async function fetchMostPlayedChampion(puuid, region) {
	const url = `${baseUrl}/api/account/most-played?puuid=${encodeURIComponent(puuid)}&region=${encodeURIComponent(region)}&matchCount=20&top=4`;
	const response = await fetch(url);
	if (!response.ok) throw new Error("No se pudieron obtener los campeones más jugados.");
	return await response.json();
}