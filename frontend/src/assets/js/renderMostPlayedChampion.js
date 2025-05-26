/**
 * Renders the most played champions section (top 4)
 * @param {HTMLElement} container
 * @param {Array} championsList - [{ championId, championName, championImageUrl, gamesPlayed }]
 */
export function renderMostPlayedChampion(container, championsList) {
	container.innerHTML = "";

	const grid = document.createElement("div");
	grid.className = "grid grid-cols-2 sm:grid-cols-4 gap-3";

	championsList.forEach(champ => {
		const card = document.createElement("div");
		card.className = `
            flex flex-col items-center justify-center
            bg-neutral-800 rounded-xl shadow-md
            px-3 py-4
            h-full
            border-b-4 border-violet-700
        `;

		const img = document.createElement("img");
		img.src = champ.championImageUrl;
		img.alt = champ.championName;
		img.className = "w-16 h-16 rounded-full border-2 border-violet-700 object-cover mb-2";

		const name = document.createElement("span");
		name.textContent = champ.championName;
		name.className = "text-sm text-white font-semibold text-center mb-1";

		const games = document.createElement("span");
		games.textContent = `${champ.gamesPlayed} partidas`;
		games.className = "text-xs text-violet-400 font-bold";

		card.appendChild(img);
		card.appendChild(name);
		card.appendChild(games);
		grid.appendChild(card);
	});

	// Header
	const header = document.createElement("div");
	header.className = "mb-2 text-base text-gray-200 font-semibold text-center";
	header.textContent = "Más jugados";

	container.appendChild(header);
	container.appendChild(grid);
}