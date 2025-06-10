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

		// Store all champions globally for filtering
		window.allChampions = Array.isArray(champions.data) ? champions.data : Object.values(champions.data);

		const mainContainer = document.getElementById("champions-container");
		mainContainer.className = `
            w-full min-h-screen bg-neutral-950 flex flex-col items-center pt-20 pb-8
        `;

		// Create main container
		const gridWrapper = document.createElement("div");
		gridWrapper.className = `
            w-full max-w-7xl
            bg-neutral-900 border border-neutral-700 rounded-xl
            px-2 sm:px-4 py-6
            shadow-xl
        `;

        // Add search bar only (filters moved to sidebar)
        const searchContainer = document.createElement("div");
        searchContainer.className = "mb-6 px-2";

        const searchBar = document.createElement("div");
        searchBar.className = "flex items-center gap-2 mb-2";

        const searchInput = document.createElement("input");
        searchInput.id = "champion-search";
        searchInput.type = "text";
        searchInput.placeholder = "Buscar campeón...";
        searchInput.className = `
            w-full py-2 px-4 rounded-lg
            bg-neutral-800 text-white
            border border-neutral-700
            focus:outline-none focus:border-violet-500
            transition-colors
        `;

        const searchButton = document.createElement("button");
        searchButton.className = `
            bg-violet-600 hover:bg-violet-700
            p-2 rounded-lg
            flex items-center justify-center
            text-white
            transition-colors
        `;
        searchButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        `;
        searchButton.addEventListener("click", function() {
            const searchTerm = searchInput.value.toLowerCase();
            const filtered = window.allChampions.filter(champ =>
                champ.name.toLowerCase().includes(searchTerm)
            );
            renderChampions(filtered);
        });

        searchBar.appendChild(searchInput);
        searchBar.appendChild(searchButton);
        searchContainer.appendChild(searchBar);

        gridWrapper.appendChild(searchContainer);

		// Create grid for champions
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

        gridWrapper.appendChild(gridContainer);
		mainContainer.appendChild(gridWrapper);

		// Render all champions initially
		renderChampions(window.allChampions);

		// Configure real-time search
		searchInput.addEventListener("input", function() {
		    const searchTerm = this.value.toLowerCase();
		    const filtered = window.allChampions.filter(champ =>
		        champ.name.toLowerCase().includes(searchTerm)
		    );
		    renderChampions(filtered);
		});

		// Add keyboard event listener for search
        searchInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                const searchTerm = this.value.toLowerCase();
                const filtered = window.allChampions.filter(champ =>
                    champ.name.toLowerCase().includes(searchTerm)
                );
                renderChampions(filtered);
            }
        });

	} catch (error) {
		showError("No se pudieron cargar los campeones.");
		console.error(error);
	}
});

/**
 * Renders champions in the grid
 * @param {Array} champions - Array of champions to display
 * @param {String} filterLetter - Letter being filtered (optional)
 */
function renderChampions(champions, filterLetter = null) {
    const gridContainer = document.getElementById("champions-grid");

    // Clear container
    gridContainer.innerHTML = "";

    // Show message if no results
    if (champions.length === 0) {
        const noResults = document.createElement("div");
        noResults.className = "col-span-full text-center py-8";
        noResults.innerHTML = `
            <p class="text-neutral-400 text-lg">No se encontraron campeones</p>
        `;
        gridContainer.appendChild(noResults);
        return;
    }

    // If there's a filter letter, show header
    if (filterLetter) {
        const letterHeader = document.createElement("div");
        letterHeader.className = "col-span-full flex flex-col mt-2 mb-4";
        const letterTitle = document.createElement("h2");
        letterTitle.textContent = filterLetter;
        letterTitle.className = "text-2xl md:text-3xl font-bold text-white mb-1 px-2";
        const divider = document.createElement("hr");
        divider.className = "border-violet-700 mb-2 mx-2";
        letterHeader.appendChild(letterTitle);
        letterHeader.appendChild(divider);
        gridContainer.appendChild(letterHeader);
    }

    // Render each champion
    champions.forEach(champion => {
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
        moreBtn.href = `/src/pages/champion.html?id=${encodeURIComponent(champion.id)}`;
        moreBtn.className = "bg-violet-600 hover:bg-violet-700 text-white font-bold py-1 px-4 rounded transition-colors mt-auto inline-block text-center";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(lore);
        card.appendChild(moreBtn);
        gridContainer.appendChild(card);
    });
}

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
 * Floating filter button with sidebar.
 */
function createFilterSidebar() {
	// Floating filter button with funnel icon
	const filterBtn = document.createElement("button");
	filterBtn.id = "filterSidebarBtn";
	filterBtn.title = "Filtrar campeones";
	filterBtn.className = `
        fixed bottom-24 right-8 z-50
        bg-violet-600 hover:bg-violet-700 text-white
        rounded-full shadow-lg
        w-12 h-12 flex items-center justify-center
        transition-colors
        focus:outline-none
    `;
	// Using funnel/filter icon
	filterBtn.innerHTML = `
        <svg xmlns='http://www.w3.org/2000/svg' class='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'/>
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
	title.textContent = "Filtros";
	title.className = "text-xl font-bold text-white";
	const closeBtn = document.createElement("button");
	closeBtn.className = "text-white text-2xl focus:outline-none";
	closeBtn.innerHTML = "&times;";
	sidebarHeader.appendChild(title);
	sidebarHeader.appendChild(closeBtn);

	sidebar.appendChild(sidebarHeader);

	// Search in sidebar
	const searchContainer = document.createElement("div");
	searchContainer.className = "mb-6";

	const searchLabel = document.createElement("p");
	searchLabel.className = "text-sm text-neutral-400 mb-2";
	searchLabel.textContent = "Buscar por nombre:";

	const searchInput = document.createElement("input");
	searchInput.type = "text";
	searchInput.placeholder = "Nombre del campeón...";
	searchInput.className = `
        w-full py-2 px-4 rounded-lg mb-2
        bg-neutral-800 text-white
        border border-neutral-700
        focus:outline-none focus:border-violet-500
        transition-colors
    `;

	const applySearchBtn = document.createElement("button");
	applySearchBtn.textContent = "Buscar";
	applySearchBtn.className = `
        w-full bg-violet-600 hover:bg-violet-700 text-white
        py-2 px-4 rounded-lg
        transition-colors font-medium
    `;

	searchContainer.appendChild(searchLabel);
	searchContainer.appendChild(searchInput);
	searchContainer.appendChild(applySearchBtn);

	applySearchBtn.addEventListener("click", function() {
	    const searchTerm = searchInput.value.toLowerCase();
	    const filtered = window.allChampions.filter(champ =>
	        champ.name.toLowerCase().includes(searchTerm)
	    );
	    renderChampions(filtered);
	    closeSidebar();
	});

	// Add keyboard event listener for search
	searchInput.addEventListener("keydown", function(event) {
	    if (event.key === "Enter") {
	        const searchTerm = this.value.toLowerCase();
	        const filtered = window.allChampions.filter(champ =>
	            champ.name.toLowerCase().includes(searchTerm)
	        );
	        renderChampions(filtered);
	        closeSidebar();
	    }
	});

	sidebar.appendChild(searchContainer);

	// Filter by letter section
	const letterSection = document.createElement("div");
	letterSection.className = "mb-6";

	const letterLabel = document.createElement("p");
	letterLabel.className = "text-sm text-neutral-400 mb-2";
	letterLabel.textContent = "Filtrar por letra:";

	letterSection.appendChild(letterLabel);

	// Letters container
	const lettersNav = document.createElement("div");
	lettersNav.className = "flex flex-wrap gap-2";
	letterSection.appendChild(lettersNav);

	sidebar.appendChild(letterSection);

	// Show all champions button
	const showAllContainer = document.createElement("div");
	showAllContainer.className = "mt-auto";

	const showAllButton = document.createElement("button");
	showAllButton.textContent = "Ver todos los campeones";
	showAllButton.className = `
        w-full bg-violet-600 hover:bg-violet-700 text-white
        py-2 px-4 rounded-lg
        transition-colors font-medium
    `;
	showAllButton.addEventListener("click", () => {
	    renderChampions(window.allChampions);
	    closeSidebar();
	});

	showAllContainer.appendChild(showAllButton);
	sidebar.appendChild(showAllContainer);

	document.body.appendChild(filterBtn);
	document.body.appendChild(sidebar);

	// --- Sidebar open/close ---
	let isSidebarOpen = false;

	function openSidebar() {
		// Build letters list from champions
		lettersNav.innerHTML = "";

		// Add "all" letter button
        const allButton = document.createElement("button");
        allButton.textContent = "Todos";
        allButton.className = `
            bg-violet-600 text-white hover:bg-violet-700
            py-1 px-3 rounded-lg
            transition-colors font-medium text-sm
        `;
        allButton.addEventListener("click", () => {
            renderChampions(window.allChampions);
            closeSidebar();
        });
        lettersNav.appendChild(allButton);

        // Get available letters from champions
        const availableLetters = [...new Set(window.allChampions.map(champ => champ.name[0].toUpperCase()))].sort();

		availableLetters.forEach(letter => {
			const link = document.createElement("button");
			link.textContent = letter;
			link.className = `
                w-8 h-8 rounded-lg text-sm font-bold
                bg-neutral-800 text-violet-400 hover:bg-violet-700 hover:text-white
                transition-colors
                flex items-center justify-center
            `;
			link.addEventListener("click", () => {
			    const filtered = window.allChampions.filter(champ =>
                    champ.name.toUpperCase().startsWith(letter)
                );
                renderChampions(filtered, letter);
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