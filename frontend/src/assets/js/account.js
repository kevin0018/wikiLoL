import { getAccount, fetchRank } from "../../services/accountService.js";
import "./components/AccountRankComponent.js";

const $rank = document.getElementById("rank");

function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) || "";
}

async function loadRank() {
    $rank.renderLoading();

    const gameName = getQueryParam("gameName");
    const tagLine = getQueryParam("tagLine");
    const region = getQueryParam("region");

    if (!gameName || !tagLine) {
        $rank.error = "Faltan datos del usuario.";
        return;
    }

    try {
        const account = await getAccount(gameName, tagLine);
        if (!account?.puuid) {
            $rank.error = "No se encontró la cuenta.";
            return;
        }

        const rank = await fetchRank(account.puuid, region);
        if (!rank) {
            $rank.error = "No se encontró información de rango.";
            return;
        }

        $rank.data = { ...rank, account };
    } catch (err) {
        $rank.error = err.message || "Error desconocido.";
    }
}

document.addEventListener("DOMContentLoaded", loadRank);