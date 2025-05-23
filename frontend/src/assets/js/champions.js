import { fetchChampionData } from "../../services/championService.js";

document.addEventListener("DOMContentLoaded", async function() {
    try {
        const champions = await fetchChampionData();

        // Main container for the champions grid
        const mainContainer = document.createElement("main");
        mainContainer.className = "w-full min-h-screen bg-neutral-950 flex flex-col items-center pt-4";

        // Responsive grid container for cards
        const gridContainer = document.createElement("div");
        gridContainer.className = `
            grid grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-4
            w-full max-w-7xl px-2 pt-4 pb-20
            bg-neutral-900 rounded-xl border border-neutral-700
        `;

        Object.values(champions.data).forEach(champion => {
            // Card container for each champion
            const card = document.createElement("div");
            card.className = `
                flex flex-col items-center justify-between
                bg-neutral-800 rounded-xl shadow-lg
                px-4 py-4
                transition-transform hover:scale-105 hover:shadow-xl
                h-full
            `;

            // Champion portrait
            const img = document.createElement("img");
            img.src = `https://ddragon.leagueoflegends.com/cdn/${champion.version}/img/champion/${champion.image.full}`;
            img.alt = champion.name;
            img.className = "w-20 h-20 rounded-full border-2 border-neutral-700 object-cover shadow-md mb-2";

            // Champion name
            const name = document.createElement("span");
            name.textContent = champion.name;
            name.className = "text-base sm:text-lg text-white font-semibold text-center mb-2";

            // Champion short lore/summary
            const lore = document.createElement("p");
            lore.textContent = champion.blurb; // "blurb" is the summary field from Riot API
            lore.className = "text-xs text-neutral-300 text-center mb-4 line-clamp-3";

            // "Saber más" button
            const moreBtn = document.createElement("button");
            moreBtn.textContent = "Saber más";
            moreBtn.className = `
    bg-violet-600 hover:bg-violet-700 text-white font-bold py-1 px-4 rounded transition-colors mt-auto
`;
            // You can attach an event handler here for a modal or navigation

            card.appendChild(img);
            card.appendChild(name);
            card.appendChild(lore);
            card.appendChild(moreBtn);
            gridContainer.appendChild(card);
        });

        mainContainer.appendChild(gridContainer);
        document.body.appendChild(mainContainer);
    } catch (error) {
        // Error message for user
        const errorDiv = document.createElement("div");
        errorDiv.className = "text-red-500 text-center font-semibold mt-8";
        errorDiv.textContent = "No se pudieron cargar los campeones.";
        document.body.appendChild(errorDiv);
    }
});