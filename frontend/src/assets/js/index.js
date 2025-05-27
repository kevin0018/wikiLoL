import { fetchChallengerLeague } from "../../services/accountService.js";
import { initPlayerRegionSelector } from "./playerRegionSelector.js";

/**
 * Displays the player ladder in the DOM.
 * Uses player.riotIdForDisplay for text content and for populating search on click.
 * @param {Array} players - An array of player objects from the backend.
 *                          Each object should have a 'riotIdForDisplay' property.
 * @param {number} [count=5] - The number of top players to display.
 */
function displayPlayerLadder(players, count = 5) {
    const ladderListElement = document.getElementById('player-ladder-list');
    const playerSearchInputElement = document.getElementById('player-search');

    if (!ladderListElement) {
        console.error('Player ladder list element (#player-ladder-list) not found.');
        return;
    }
    ladderListElement.innerHTML = '';

    if (!players || players.length === 0) {
        const listItem = document.createElement('li');
        listItem.className = 'p-3 bg-[#232332] rounded-lg shadow text-center text-gray-400';
        listItem.textContent = 'No hay jugadores en el ranking para mostrar.';
        ladderListElement.appendChild(listItem);
        return;
    }

    const topPlayers = players.slice(0, count);

    topPlayers.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'p-3 bg-[#232332] rounded-lg shadow text-center cursor-pointer hover:bg-[#303040] transition-colors duration-150';
        listItem.textContent = player.riotIdForDisplay || "Dato no disponible";

        // Add click listener to populate search bar
        listItem.addEventListener('click', () => {
            if (playerSearchInputElement) {
                if (player.riotIdForDisplay && !player.riotIdForDisplay.includes("no disponible")) {
                    playerSearchInputElement.value = player.riotIdForDisplay;
                } else if (player.gameName) {
                    playerSearchInputElement.value = player.gameName;
                } else {
                    playerSearchInputElement.value = ""; 
                }
                playerSearchInputElement.focus();
            }
        });
        ladderListElement.appendChild(listItem);
    });
}

async function initPlayerLadder() {
    const defaultLadderRegion = 'EUW';
    const defaultQueue = 'RANKED_SOLO_5x5';
    const ladderListElement = document.getElementById('player-ladder-list');

    try {
        const topPlayersData = await fetchChallengerLeague(defaultLadderRegion, defaultQueue);
        if (topPlayersData) {
            displayPlayerLadder(topPlayersData, 5);
        } else {
            if (ladderListElement) {
                ladderListElement.innerHTML = '';
                const listItem = document.createElement('li');
                listItem.className = 'p-3 bg-[#232332] rounded-lg shadow text-center text-gray-400';
                listItem.textContent = 'No se pudo obtener el ranking de jugadores en este momento.';
                ladderListElement.appendChild(listItem);
            }
        }
    } catch (error) {
        console.error('Failed to initialize player ladder:', error.message);
        if (ladderListElement) {
            ladderListElement.innerHTML = '';
            const listItem = document.createElement('li');
            listItem.className = 'p-3 bg-[#232332] rounded-lg shadow text-center text-red-400';
            listItem.textContent = error.message || 'Error al cargar el ranking de jugadores.';
            ladderListElement.appendChild(listItem);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initPlayerRegionSelector();
    initPlayerLadder();

    const searchForm = document.getElementById("player-search-form");
    if (!searchForm) {
        console.warn("Search form (#player-search-form) not found. Player search functionality will be disabled.");
        return;
    }

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const playerSearchInput = document.getElementById("player-search");
        const regionSelectDesktop = document.getElementById("region-select");
        const regionSelectMobile = document.getElementById("region-select-mobile");

        if (!playerSearchInput || !regionSelectDesktop || !regionSelectMobile) {
            console.error("One or more search form elements are missing from the DOM.");
            alert("Error en la configuración del formulario de búsqueda. Por favor, recarga la página.");
            return;
        }

        const playerInputRaw = playerSearchInput.value;
        const playerInput = playerInputRaw.trim();

        const isDesktopView = window.innerWidth >= 480; 
        const selectedRegion = (isDesktopView ? regionSelectDesktop.value : regionSelectMobile.value);

        if (!selectedRegion || selectedRegion === "Seleccione región" || selectedRegion === "") {
            alert("Por favor, selecciona una región válida.");
            return;
        }
        if (!playerInput) {
            alert("Por favor, introduce un nombre de invocador y, opcionalmente, un #Tag.");
            playerSearchInput.focus();
            return;
        }

        let gameName;
        let tagLine;
        const hashIndex = playerInput.indexOf("#");

        if (hashIndex > 0 && hashIndex < playerInput.length - 1) {
            gameName = playerInput.substring(0, hashIndex).trim();
            tagLine = playerInput.substring(hashIndex + 1).trim();
            if (!gameName) {
                 alert("El nombre de invocador antes del '#' no puede estar vacío.");
                 return;
            }
        } else if (hashIndex === -1) {
            gameName = playerInput;
            tagLine = selectedRegion; 
        } else {
            alert("Formato de nombre de invocador inválido. Usa Nombre#Tag o solo Nombre (se usará la región como tag).");
            return;
        }
        window.location.href = `../../pages/account.html?region=${encodeURIComponent(selectedRegion)}&gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`;
    });
});