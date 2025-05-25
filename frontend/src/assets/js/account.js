import { getAccountProfile, fetchRank } from "../../services/accountService.js";
import { renderAccountRank } from "./renderAccountRank.js";
import { renderProfileCard } from "./renderProfileCard.js";

// DOM references
const $rank = document.getElementById("rank");
const $profileCardContainer = document.getElementById("profile-card-container");

// Util function to get query params
function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) || "";
}

// Renders loading for rank
function renderRankLoading() {
    $rank.innerHTML = `<div class="animate-pulse text-gray-400 text-center py-8">Cargando rango...</div>`;
}

// Renders error for rank
function renderRankError(msg) {
    $rank.innerHTML = `<div class="text-red-600 p-2 text-center">${msg}</div>`;
}

// Renders loading for profile
function renderProfileLoading() {
    $profileCardContainer.innerHTML = `<div class="animate-pulse text-gray-400 text-center py-8">Cargando perfil...</div>`;
}

// Renders error for profile
function renderProfileError(msg) {
    $profileCardContainer.innerHTML = `<div class="text-red-600 p-2 text-center">${msg}</div>`;
}

// Main load function (mobile first)
async function loadAccountPage() {
    const gameName = getQueryParam("gameName");
    const tagLine = getQueryParam("tagLine");
    const region = getQueryParam("region");

    // Load profile card
    renderProfileLoading();

    if (!gameName || !tagLine || !region) {
        renderProfileError("Faltan datos del usuario.");
        renderRankError("Faltan datos del usuario.");
        return;
    }

    try {
        // Fetch full profile
        console.log("Voy a hacer fetch", gameName, tagLine, region);
        const profile = await getAccountProfile(gameName, tagLine, region);
        console.log("Perfil recibido:", profile);

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

        // Load rank info
        renderRankLoading();
        const rank = await fetchRank(profile.puuid, region);
        if (!rank) {
            renderRankError("No se encontró información de rango.");
            return;
        }
        renderAccountRank({ ...rank, account: profile }, $rank);

    } catch (err) {
        renderProfileError(err.message || "Error al cargar el perfil.");
        renderRankError(err.message || "Error al cargar el rango.");
    }
}

document.addEventListener("DOMContentLoaded", loadAccountPage);