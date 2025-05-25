/**
 * Renders the ranked information card.
 * @param {Object} rankData - Data for the rank (tier, LP, wins, losses, icon, etc)
 * @param {HTMLElement} container - Where to render the rank card
 */
export function renderAccountRank(rankData, container) {
    container.innerHTML = "";

    // Utilities
    const winRate = rankData.wins + rankData.losses > 0
        ? Math.round((rankData.wins / (rankData.wins + rankData.losses)) * 100)
        : 0;
    const baseUrl = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3001";

    // Card
    const card = document.createElement("section");
    card.className = `
        bg-neutral-800 border-b-4 border-violet-700 rounded-t-2xl w-full max-w-xl mx-auto
        flex flex-col
        shadow-lg
    `;

    // Header: "Clasificatoria solo/dúo" with icon
    const header = document.createElement("div");
    header.className = "flex items-center gap-1 px-5 pt-4 pb-2";
    header.innerHTML = `
        <span class="text-gray-200 text-sm sm:text-base font-semibold flex items-center gap-1">
            Clasificatoria solo/dúo
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-gray-400 ml-1">
                <title>Información de clasificatoria</title>
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-2a1 1 0 112 0v1a1 1 0 01-2 0V8zm1 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
        </span>
    `;

    // Main row: icon + info + stats
    const row = document.createElement("div");
    row.className = "flex items-center px-5 py-4 gap-4";

    // Icon
    const icon = document.createElement("img");
    icon.src = `${baseUrl}${rankData.rankIconUrl}`;
    icon.alt = `Icono rango ${rankData.tier}`;
    icon.className = "w-24 h-24 sm:w-28 sm:h-28 object-contain bg-[#181826] rounded-full flex-shrink-0 border-2 border-violet-700 shadow-md";

    // Info (tier and LP)
    const info = document.createElement("div");
    info.className = "flex-1 min-w-0";
    info.innerHTML = `
        <div class="text-white font-bold text-xl sm:text-2xl leading-tight mb-0.5">
            ${rankData.tier.charAt(0) + rankData.tier.slice(1).toLowerCase()}
        </div>
        <div class="text-gray-200 text-base sm:text-lg font-medium mb-1">
            ${rankData.leaguePoints.toLocaleString()} LP
        </div>
    `;

    // Stats (wins, losses, winrate)
    const stats = document.createElement("div");
    stats.className = "flex flex-col items-end min-w-[88px]";
    stats.innerHTML = `
        <div class="text-gray-300 font-medium text-base sm:text-lg">
            <span class="mr-1">${rankData.wins}V</span>
            <span class="opacity-60">${rankData.losses}D</span>
        </div>
        <div class="text-sm text-gray-400">
            WinRate ${winRate}%
        </div>
    `;

    // Compose
    row.appendChild(icon);
    row.appendChild(info);
    row.appendChild(stats);

    card.appendChild(header);
    card.appendChild(row);

    container.appendChild(card);
}