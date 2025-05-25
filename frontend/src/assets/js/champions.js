import {fetchChampionData} from "../../services/championService.js";

document.addEventListener("DOMContentLoaded", async function () {
	try {
		createFilterSidebar();
		createScrollToTopButton();

		const champions = await fetchChampionData();

		if (!champions || !champions.data) {
			showError("No se pudieron cargar los campeones (estructura inválida).");
			return;
		}

		const championList = Array.isArray(champions.data) ? champions.data : Object.values(champions.data);

		const groupedChampions = groupChampionsByLetter(championList);

		const mainContainer = document.createElement("main");
		mainContainer.id = "champions-main";
		mainContainer.className = `
            w-full min-h-screen bg-neutral-950 flex flex-col items-center pt-20 pb-8
        `;

		const gridWrapper = document.createElement("div");
		gridWrapper.className = `
            w-full max-w-7xl
            bg-neutral-900 border border-neutral-700 rounded-xl
            px-2 sm:px-4 py-6
            shadow-xl
        `;

		const gridContainer = document.createElement("div");
		gridContainer.id = "champions-grid";
		gridContainer.className = `
            grid grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            gap-4
        `;

		let addedCards = 0;

		for (const letter of Object.keys(groupedChampions)) {
			const letterHeader = document.createElement("div");
			letterHeader.id = `champion-group-${letter}`;
			letterHeader.className = "col-span-full flex flex-col mt-4 mb-4";
			const letterTitle = document.createElement("h2");
			letterTitle.textContent = letter;
			letterTitle.className = "text-2xl md:text-3xl font-bold text-white mb-1 px-2";
			const divider = document.createElement("hr");
			divider.className = "border-violet-700 mb-2 mx-2";
			letterHeader.appendChild(letterTitle);
			letterHeader.appendChild(divider);
			gridContainer.appendChild(letterHeader);

			groupedChampions[letter].forEach(champion => {
				const card = document.createElement("div");
				card.className = `
                    flex flex-col items-center justify-between
                    bg-neutral-800 rounded-xl shadow-lg
                    px-4 py-4
                    transition-transform hover:scale-105 hover:shadow-xl
                    h-full
                `;
				const img = document.createElement("img");
				const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
				img.src = `${baseUrl}${champion.imageUrl}`;
				img.alt = champion.name;
				img.className = "w-20 h-20 rounded-full border-2 border-neutral-700 object-cover shadow-md mb-2";

				const name = document.createElement("span");
				name.textContent = champion.name;
				name.className = "text-base sm:text-lg text-white font-semibold text-center mb-2";

				const lore = document.createElement("p");
				lore.textContent = champion.lore;
				lore.className = "text-xs text-neutral-300 text-center mb-4 line-clamp-3";

				const moreBtn = document.createElement("a");
				moreBtn.textContent = "Saber más";
				moreBtn.href = `/pages/champion.html?id=${encodeURIComponent(champion.id)}`;
				moreBtn.className = "bg-violet-600 hover:bg-violet-700 text-white font-bold py-1 px-4 rounded transition-colors mt-auto inline-block text-center";

				card.appendChild(img);
				card.appendChild(name);
				card.appendChild(lore);
				card.appendChild(moreBtn);
				gridContainer.appendChild(card);
				addedCards++;
			});
		}

		gridWrapper.appendChild(gridContainer);
		mainContainer.appendChild(gridWrapper);
		document.body.appendChild(mainContainer);

	} catch (error) {
		showError("No se pudieron cargar los campeones.");
	}
});

function showError(message) {
	const errorDiv = document.createElement("div");
	errorDiv.className = "text-red-500 text-center font-semibold mt-8";
	errorDiv.textContent = message;
	document.body.appendChild(errorDiv);
}

/**
 * Groups champions by their initial letter (A-Z).
 */
function groupChampionsByLetter(champions) {
	const groups = {};
	champions.forEach(champ => {
		const letter = champ.name[0].toUpperCase();
		if (!groups[letter]) groups[letter] = [];
		groups[letter].push(champ);
	});
	Object.keys(groups).forEach(ltr => groups[ltr].sort((a, b) => a.name.localeCompare(b.name)));
	return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Floating scroll-to-top button.
 */
function createScrollToTopButton() {
	const btn = document.createElement("button");
	btn.id = "scrollToTopBtn";
	btn.title = "Volver arriba";
	btn.className = `
        fixed bottom-8 right-8 z-50
        bg-violet-600 hover:bg-violet-700 text-white
        rounded-full shadow-lg
        w-12 h-12 flex items-center justify-center
        transition-colors
        focus:outline-none
    `;
	btn.innerHTML = `
        <svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 15l7-7 7 7'/>
        </svg>
    `;
	btn.addEventListener("click", () => {
		const main = document.getElementById("champions-main");
		if (main) {
			const y = main.getBoundingClientRect().top + window.scrollY - 80;
			window.scrollTo({top: y > 0 ? y : 0, behavior: "smooth"});
		} else {
			window.scrollTo({top: 0, behavior: "smooth"});
		}
	});
	document.body.appendChild(btn);
}

/**
 * Floating filter button.
 */
function createFilterSidebar() {
	// Floating filter button
	const filterBtn = document.createElement("button");
	filterBtn.id = "filterSidebarBtn";
	filterBtn.title = "Filtrar por letra";
	filterBtn.className = `
        fixed bottom-24 right-8 z-50
        bg-violet-600 hover:bg-violet-700 text-white
        rounded-full shadow-lg
        w-12 h-12 flex items-center justify-center
        transition-colors
        focus:outline-none
    `;
	filterBtn.innerHTML = `
        <svg xmlns='http://www.w3.org/2000/svg' class='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 7h18M6 12h12M9 17h6'/>
        </svg>
    `;

	// Sidebar
	const sidebar = document.createElement("aside");
	sidebar.id = "letterSidebar";
	sidebar.className = `
        fixed right-0 top-0 h-full w-64
        bg-neutral-900/85 border-l border-neutral-800
        shadow-2xl z-50 translate-x-full transition-transform duration-200
        flex flex-col
        p-6
        backdrop-blur-md
    `;

	// Title and close button
	const sidebarHeader = document.createElement("div");
	sidebarHeader.className = "flex items-center justify-between mb-6";
	const title = document.createElement("span");
	title.textContent = "Ir a la letra";
	title.className = "text-xl font-bold text-white";
	const closeBtn = document.createElement("button");
	closeBtn.className = "text-white text-2xl focus:outline-none";
	closeBtn.innerHTML = "&times;";
	sidebarHeader.appendChild(title);
	sidebarHeader.appendChild(closeBtn);

	sidebar.appendChild(sidebarHeader);

	// Letters nav
	const lettersNav = document.createElement("nav");
	lettersNav.className = "flex flex-wrap gap-2";
	sidebar.appendChild(lettersNav);

	document.body.appendChild(filterBtn);
	document.body.appendChild(sidebar);

	// --- Sidebar open/close ---
	let isSidebarOpen = false;

	function openSidebar() {
		// Build letters list from DOM
		lettersNav.innerHTML = "";
		const headers = document.querySelectorAll("div[id^='champion-group-']");
		headers.forEach(header => {
			const letter = header.id.replace("champion-group-", "");
			const link = document.createElement("button");
			link.textContent = letter;
			link.className = `
                w-10 h-10 rounded-lg text-lg font-bold
                bg-neutral-800 text-violet-400 hover:bg-violet-700 hover:text-white
                transition-colors
            `;
			link.addEventListener("click", () => {
				const y = header.getBoundingClientRect().top + window.scrollY - 80;
				window.scrollTo({top: y > 0 ? y : 0, behavior: "smooth"});
				closeSidebar();
			});
			lettersNav.appendChild(link);
		});
		sidebar.classList.remove("translate-x-full");
		isSidebarOpen = true;
	}

	function closeSidebar() {
		sidebar.classList.add("translate-x-full");
		isSidebarOpen = false;
	}

	filterBtn.addEventListener("click", () => {
		if (!isSidebarOpen) openSidebar();
	});
	closeBtn.addEventListener("click", closeSidebar);
	document.addEventListener("keydown", (e) => {
		if (isSidebarOpen && (e.key === "Escape" || e.key === "Esc")) {
			closeSidebar();
		}
	});
	// Click outside sidebar closes it
	document.addEventListener("mousedown", (e) => {
		if (isSidebarOpen && !sidebar.contains(e.target) && e.target !== filterBtn) {
			closeSidebar();
		}
	});
}