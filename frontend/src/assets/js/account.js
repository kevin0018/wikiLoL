import { getAccount, fetchRank } from "../../services/accountService.js";
import { renderAccountRank } from "./renderAccountRank.js";
import { renderProfileCard } from "./renderProfileCard.js";


const $rank = document.getElementById("rank");

function renderRankLoading() {
    $rank.innerHTML = `<div class="animate-pulse text-gray-400 text-center py-8">Cargando rango...</div>`;
}

function renderRankError(msg) {
    $rank.innerHTML = `<div class="text-red-600 p-2 text-center">${msg}</div>`;
}

function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) || "";
}

async function loadRank() {
    renderRankLoading();

    const gameName = getQueryParam("gameName");
    const tagLine = getQueryParam("tagLine");
    const region = getQueryParam("region");

    if (!gameName || !tagLine) {
        renderRankError("Faltan datos del usuario.");
        return;
    }

    try {
        console.log(gameName, tagLine, region);
        const account = await getAccount(gameName, tagLine);
        if (!account?.puuid) {
            renderRankError("No se encontró la cuenta.");
            return;
        }

        const rank = await fetchRank(account.puuid, region);
        if (!rank) {
            renderRankError("No se encontró información de rango.");
            return;
        }

        renderAccountRank({ ...rank, account }, $rank);
    } catch (err) {
        renderRankError(err.message || "Error desconocido.");
    }
}

document.addEventListener("DOMContentLoaded", loadRank);