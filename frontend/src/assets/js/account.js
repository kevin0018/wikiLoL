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

// Util function to get query params
function getQueryParam(param) {
	const params = new URLSearchParams(window.location.search);
	return params.get(param) || "";
}

function renderLoading(container, msg = "Cargando...") {
	container.innerHTML = `<div class='animate-pulse text-gray-400 text-center py-8'>${msg}</div>`;
}

function renderError(container, msg) {
	container.innerHTML = `<div class='text-red-600 p-2 text-center'>${msg}</div>`;
}

// Main load function
async function loadAccountPage() {
	const gameName = getQueryParam("gameName");
	const tagLine = getQueryParam("tagLine");
	const region = getQueryParam("region");

	renderLoading($profileCardContainer, "Cargando perfil...");
	renderLoading($rankSoloQ, "Cargando rango SoloQ...");
	renderLoading($rankFlexQ, "Cargando rango FlexQ...");
	renderLoading($masteryContainer, "Cargando maestrías...");
	renderLoading($mostPlayedContainer, "Cargando campeones más jugados...");

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
				name: profile.name,
				tag: profile.tagLine,
				iconUrl: iconUrl,
			},
			$profileCardContainer,
			() => window.location.reload()
		);

		// Fetch and render rank info
		const ranks = await fetchRank(profile.summonerId, region);

		const soloQ = ranks.find(q => q.queueType === "RANKED_SOLO_5x5");
		const flexQ = ranks.find(q => q.queueType === "RANKED_FLEX_SR");

		if (soloQ) {
			renderAccountRank({...soloQ, account: profile}, $rankSoloQ);
		} else {
			renderError($rankSoloQ, "No se encontró rango SoloQ.");
		}

		if (flexQ) {
			renderAccountRank({...flexQ, account: profile}, $rankFlexQ);
		} else {
			renderError($rankFlexQ, "No se encontró rango FlexQ.");
		}

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

document.addEventListener("DOMContentLoaded", loadAccountPage);