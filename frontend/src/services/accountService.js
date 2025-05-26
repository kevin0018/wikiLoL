// Base URL for the backend API.
// It attempts to use an environment variable VITE_BACKEND_URL,
// otherwise defaults to http://localhost:3001.
const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

/**
 * Fetches the account profile by gameName, tagLine, and region.
 * @param {string} gameName - The player's game name.
 * @param {string} tagLine - The player's tag line.
 * @param {string} region - The server region (e.g., 'EUW', 'NA').
 * @returns {Promise<Object>} A promise that resolves to the account profile data.
 * @throws {Error} If the network response is not ok.
 */
export async function getAccountProfile(gameName, tagLine, region) {
	const url = `${baseUrl}/api/account/profile?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${encodeURIComponent(region)}`;
	const response = await fetch(url);
	if (!response.ok) {
		const errorText = await response.text(); // Attempt to get more error detail
		console.error('Server response on getAccountProfile error:', errorText);
		throw new Error("No se pudo cargar el perfil del jugador."); // User-friendly message
	}
	return await response.json();
}

/**
 * Fetches all ranked data for a summoner by summonerId and region.
 * @param {string} summonerId - The summoner's unique ID.
 * @param {string} region - The server region.
 * @returns {Promise<Array>} A promise that resolves to an array of ranked data.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchRank(summonerId, region) {
	const url = `${baseUrl}/api/account/rank?summonerId=${encodeURIComponent(summonerId)}&region=${encodeURIComponent(region)}`;
	const response = await fetch(url);
	if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response on fetchRank error:', errorText);
        throw new Error("No se pudo obtener la información de clasificación.");
    }
	return await response.json(); // Returns an array with separate entries for SoloQ, FlexQ, etc.
}

/**
 * Fetches top champion masteries for a user by PUUID and region.
 * @param {string} puuid - The player's unique PUUID.
 * @param {string} region - The server region.
 * @param {number} [top=4] - The number of top masteries to fetch.
 * @returns {Promise<Array>} A promise that resolves to an array of champion mastery data.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchChampionMastery(puuid, region, top = 4) {
	const url = `${baseUrl}/api/account/mastery?puuid=${encodeURIComponent(puuid)}&region=${encodeURIComponent(region)}&top=${top}`;
	const response = await fetch(url);
	if (!response.ok) {
		const errorText = await response.text();
		console.error('Server response on fetchChampionMastery error:', errorText);
		// Corrected the duplicated error throw.
		throw new Error("No se pudieron obtener las maestrías de campeón.");
	}
	return await response.json();
}

/**
 * Fetches top most played champions for a user by PUUID and region, based on recent matches.
 * @param {string} puuid - The player's unique PUUID.
 * @param {string} region - The server region.
 * @param {number} [matchCount=20] - The number of recent matches to analyze.
 * @param {number} [top=4] - The number of top played champions to return.
 * @returns {Promise<Array>} A promise that resolves to an array of most played champion data.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchMostPlayedChampion(puuid, region, matchCount = 20, top = 4) {
	const url = `${baseUrl}/api/account/most-played?puuid=${encodeURIComponent(puuid)}&region=${encodeURIComponent(region)}&matchCount=${matchCount}&top=${top}`;
	const response = await fetch(url);
	if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response on fetchMostPlayedChampion error:', errorText);
        throw new Error("No se pudieron obtener los campeones más jugados.");
    }
	return await response.json();
}

/**
 * Fetches the Challenger league players for a given region and queue.
 * @param {string} region - The platform routing value for the region (e.g., 'EUW', 'NA').
 * @param {string} queue - The queue type (e.g., 'RANKED_SOLO_5x5').
 * @returns {Promise<Array|null>} A promise that resolves to an array of player entries, or null if a non-critical error occurs.
 * @throws {Error} If the network response is not ok (critical error).
 */
export async function fetchChallengerLeague(region = 'EUW', queue = 'RANKED_SOLO_5x5') {
    const url = `${baseUrl}/api/league/challenger?region=${encodeURIComponent(region)}&queue=${encodeURIComponent(queue)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            let errorMessage = "No se pudo cargar el ranking de jugadores.";
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMessage = `Error al cargar ranking: ${errorData.error}`;
                } else {
                    const errorText = await response.text();
                    console.error(`Server response on fetchChallengerLeague error (${response.status}):`, errorText);
                    if (response.status >= 500) {
                         errorMessage = "Error del servidor al cargar el ranking. Inténtalo más tarde.";
                    } else if (response.status >= 400) {
                         errorMessage = "Error en la solicitud al cargar el ranking. Verifica los parámetros.";
                    }
                }
            } catch (e) {
                console.error(`Failed to parse error response from fetchChallengerLeague (${response.status}). Response was not JSON or empty.`);
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Network or parsing error in fetchChallengerLeague:', error.message);
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw new Error("Error de red al cargar el ranking. Verifica tu conexión.");
        }
        throw error;
    }
}