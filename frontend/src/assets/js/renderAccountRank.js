/**
 * Renders the ranked information card.
 * @param {Object} rankData - Data for the rank (tier, LP, wins, losses, icon, etc)
 * @param {HTMLElement} container - Where to render the rank card
 */
export function renderAccountRank(rankData, container) {
    container.innerHTML = "";

    // Calculate winrate
    const winRate = rankData.wins + rankData.losses > 0
        ? Math.round((rankData.wins / (rankData.wins + rankData.losses)) * 100)
        : 0;
    const baseUrl = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3001";

    // Card container (unified style)
    const card = document.createElement("section");
    card.className = [
        "flex flex-col sm:flex-row items-center sm:items-stretch justify-between",
        "bg-neutral-800",
        "rounded-xl",
        "shadow-md",
        "border-b-4 border-violet-700",
        "px-5 py-6",
        "w-full max-w-xl mx-auto mb-2"
    ].join(" ");

    // Left: Icon
    const icon = document.createElement("img");
    icon.src = `${baseUrl}${rankData.rankIconUrl}`;
    icon.alt = `Icono rango ${rankData.tier}`;
    icon.className = [
        "w-20 h-20 sm:w-24 sm:h-24",
        "object-contain",
        "bg-[#181826]",
        "rounded-full flex-shrink-0",
        "border-2 border-violet-700",
        "shadow-md",
        "mb-4 sm:mb-0"
    ].join(" ");

    // Middle: Info (tier, LP)
    const info = document.createElement("div");
    info.className = "flex-1 flex flex-col justify-center sm:pl-6 min-w-0";
    info.innerHTML = `
        <span class="text-violet-400 text-base font-semibold flex items-center gap-1 mb-2">
            Clasificatoria solo/dúo
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-gray-400 ml-1"><title>Información de clasificatoria</title><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-2a1 1 0 112 0v1a1 1 0 01-2 0V8zm1 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>
        </span>
        <span class="text-white font-bold text-xl sm:text-2xl leading-tight mb-0.5">
            ${rankData.tier.charAt(0) + rankData.tier.slice(1).toLowerCase()}
        </span>
        <span class="text-gray-200 text-base sm:text-lg font-medium mb-1">
            ${rankData.leaguePoints.toLocaleString()} LP
        </span>
    `;

    // Right: Stats
    const stats = document.createElement("div");
    stats.className = "flex flex-col items-end justify-center min-w-[88px]";
    stats.innerHTML = `
        <span class="text-gray-300 font-medium text-base sm:text-lg">
            <span class="mr-1">${rankData.wins}V</span>
            <span class="opacity-60">${rankData.losses}D</span>
        </span>
        <span class="text-sm text-gray-400">
            WinRate ${winRate}%
        </span>
    `;

    card.appendChild(icon);
    card.appendChild(info);
    card.appendChild(stats);

    container.appendChild(card);
}