/**
 * Renders the champion mastery section (top 4) with Tailwind CSS classes.
 * @param {HTMLElement} container
 * @param {Array} masteryList - [{ championId, championName, championImageUrl, masteryPoints }]
 */
export function renderChampionMastery(container, masteryList) {
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
    header.textContent = "Mejores maestrías";

    const grid = document.createElement("div");
    grid.className = [
        "grid",
        "grid-cols-2",
        "sm:grid-cols-4",
        "gap-3"
    ].join(" ");

    masteryList.forEach(mastery => {
        // Card for each champion mastery
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
        img.src = `${baseUrl}${mastery.championImageUrl}`;
        img.alt = mastery.championName;
        img.className = [
            "w-16", "h-16",
            "rounded-full",
            "border-2", "border-violet-700",
            "object-cover",
            "mb-2"
        ].join(" ");

        // Champion name
        const name = document.createElement("span");
        name.textContent = mastery.championName;
        name.className = "text-sm text-white font-semibold text-center mb-1";

        // Mastery points
        const points = document.createElement("span");
        points.textContent = `${mastery.masteryPoints.toLocaleString()} pts`;
        points.className = "text-xs text-violet-400 font-bold";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(points);
        grid.appendChild(card);
    });

    container.appendChild(header);
    container.appendChild(grid);
}