import {
	getAccountProfile,
	fetchRank,
	fetchChampionMastery,
	fetchMostPlayedChampion
} from "../../services/accountService.js";
import {renderAccountRank} from "./renderAccountRank.js";
import {renderProfileCard} from "./renderProfileCard.js";
import {renderChampionMastery} from './renderChampionMastery.js';
import {renderMostPlayedChampion} from './renderMostPlayedChampion.js';

// DOM references
const $rankSoloQ = document.getElementById("rank-soloq");
const $rankFlexQ = document.getElementById("rank-flexq");
const $profileCardContainer = document.getElementById("profile-card-container");
const $masteryContainer = document.getElementById("mastery-container");
const $mostPlayedContainer = document.getElementById("mostplayed-container");

/**
 * Gets URL query parameter value
 * @param {string} param - Parameter name to retrieve
 * @returns {string} - Parameter value or empty string if not found
 */
function getQueryParam(param) {
	const params = new URLSearchParams(window.location.search);
	return params.get(param) || "";
}

/**
 * Renders loading state in a container
 * @param {HTMLElement} container - Element where loading state will be shown
 * @param {string} msg - Loading message to display
 */
function renderLoading(container, msg = "Cargando...") {
	container.innerHTML = `<div class='animate-pulse text-gray-400 text-center py-8'>${msg}</div>`;
}

/**
 * Renders error state in a container
 * @param {HTMLElement} container - Element where error state will be shown
 * @param {string} msg - Error message to display
 */
function renderError(container, msg) {
	container.innerHTML = `<div class='text-red-600 p-2 text-center'>${msg}</div>`;
}

/**
 * Main function to load and display account page data
 * Follows clean architecture principles separating data fetching from rendering
 */
async function loadAccountPage() {
	const gameName = getQueryParam("gameName");
	const tagLine = getQueryParam("tagLine");
	const region = getQueryParam("region");

	// Show loading states for all UI components
	renderLoading($profileCardContainer, "Cargando perfil...");
	renderLoading($rankSoloQ, "Cargando rango SoloQ...");
	renderLoading($rankFlexQ, "Cargando rango FlexQ...");
	renderLoading($masteryContainer, "Cargando maestrías...");
	renderLoading($mostPlayedContainer, "Cargando campeones más jugados...");

	// Early return if required query parameters are missing
	if (!gameName || !tagLine || !region) {
		const err = "Faltan datos del usuario.";
		renderError($profileCardContainer, err);
		renderError($rankSoloQ, err);
		renderError($rankFlexQ, err);
		renderError($masteryContainer, err);
		renderError($mostPlayedContainer, err);
		return;
	}

	try {
		// Fetch full profile
		const profile = await getAccountProfile(gameName, tagLine, region);

		// Compose icon URL
		const patchVersion = "15.10.1";
		const iconUrl = `/api/assets/profile-icon/${patchVersion}/${profile.profileIconId}.png`;

		// Render profile card
		renderProfileCard(
			{
				name: gameName,
				tag: profile.tagLine,
				iconUrl: iconUrl,
			},
			$profileCardContainer,
			() => window.location.reload()
		);

		// Fetch rank info
		const ranks = await fetchRank(profile.summonerId, region);

		// Find rank data for each queue type
		const soloQ = ranks.find(q => q.queueType === "RANKED_SOLO_5x5") || {
			queueType: "RANKED_SOLO_5x5",
			tier: "UNRANKED",
			rank: "",
			leaguePoints: 0,
			wins: 0,
			losses: 0,
			rankIconUrl: "/api/assets/ranked/unranked.png"
		};

		const flexQ = ranks.find(q => q.queueType === "RANKED_FLEX_SR") || {
			queueType: "RANKED_FLEX_SR",
			tier: "UNRANKED",
			rank: "",
			leaguePoints: 0,
			wins: 0,
			losses: 0,
			rankIconUrl: "/api/assets/ranked/unranked.png"
		};

		// Render rank cards
		renderAccountRank({...soloQ, account: profile}, $rankSoloQ);
		renderAccountRank({...flexQ, account: profile}, $rankFlexQ);

		// Fetch and render champion mastery
		const masteryList = await fetchChampionMastery(profile.puuid, region);
		if (masteryList && masteryList.length > 0) {
			renderChampionMastery($masteryContainer, masteryList);
		} else {
			renderError($masteryContainer, "No hay maestrías registradas.");
		}

		// Fetch and render most played champions
		const mostPlayed = await fetchMostPlayedChampion(profile.puuid, region);
		if (mostPlayed && mostPlayed.length > 0) {
			renderMostPlayedChampion($mostPlayedContainer, mostPlayed);
		} else {
			renderError($mostPlayedContainer, "No hay campeones jugados recientes.");
		}

	} catch (err) {
		const msg = err.message || "Error al cargar los datos del usuario.";
		renderError($profileCardContainer, msg);
		renderError($rankSoloQ, msg);
		renderError($rankFlexQ, msg);
		renderError($masteryContainer, msg);
		renderError($mostPlayedContainer, msg);
	}
}

// Initialize page when DOM is fully loaded
document.addEventListener("DOMContentLoaded", loadAccountPage);