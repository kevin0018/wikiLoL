/**
 * Renders the most played champions section (top 4) with Tailwind classes.
 * @param {HTMLElement} container
 * @param {Array} championsList - [{ championId, championName, championImageUrl, gamesPlayed }]
 */
export function renderMostPlayedChampion(container, championsList) {
    container.innerHTML = "";

    const baseUrl = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3001";

    const header = document.createElement("div");
    header.className = [
        "mb-2",
        "text-base",
        "text-violet-400",
        "font-semibold",
        "text-center"
    ].join(" ");
    header.textContent = "Más jugados";

    const grid = document.createElement("div");
    grid.className = [
        "grid",
        "grid-cols-2",
        "sm:grid-cols-4",
        "gap-3"
    ].join(" ");

    championsList.forEach(champ => {
        // Card for each champion
        const card = document.createElement("div");
        card.className = [
            "flex", "flex-col", "items-center", "justify-center",
            "bg-neutral-800",
            "rounded-xl",
            "shadow-md",
            "px-3", "py-4",
            "h-full",
            "border-b-4", "border-violet-700"
        ].join(" ");

        // Champion image
        const img = document.createElement("img");
        img.src = `${baseUrl}${champ.championImageUrl}`;
        img.alt = champ.championName;
        img.className = [
            "w-16", "h-16",
            "rounded-full",
            "border-2", "border-violet-700",
            "object-cover",
            "mb-2"
        ].join(" ");

        // Champion name
        const name = document.createElement("span");
        name.textContent = champ.championName;
        name.className = "text-sm text-white font-semibold text-center mb-1";

        // Games played
        const games = document.createElement("span");
        games.textContent = `${champ.gamesPlayed} partidas`;
        games.className = "text-xs text-violet-400 font-bold";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(games);
        grid.appendChild(card);
    });

    container.appendChild(header);
    container.appendChild(grid);
}