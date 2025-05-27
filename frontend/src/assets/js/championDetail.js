import { fetchChampionDetailFromAPI } from '../../services/championService.js';

const LOL_VERSION = "15.10.1";
const LOL_LANG = "es_ES";

/**
 * Gets the champion ID from the URL query parameters.
 * @returns {string|null} The champion ID or null if not found.
 */
function getChampionIdFromURL() {
	const params = new URLSearchParams(window.location.search);
	return params.get("id");
}

/**
 * Creates and returns the HTML element for the champion's skins carousel with indicators.
 * Handles overflow of indicators on mobile by making them scrollable.
 * @param {Object} champion - The champion data object.
 * @param {string} baseUrl - The base URL for API calls.
 * @returns {HTMLElement|null} The carousel element or null if no skins.
 */
function createSkinsCarouselWithIndicators(champion, baseUrl) {
	if (!champion.skins || champion.skins.length === 0) {
		return null;
	}

	const displaySkins = champion.skins.slice().sort((a, b) => a.num - b.num);

    if (displaySkins.length === 0) {
        return null;
    }

	const carouselId = `skins-carousel-${champion.id}`;

	const carouselContainer = document.createElement("div");
	carouselContainer.id = carouselId;
	carouselContainer.className = "relative w-full mt-8 md:mt-10";
	carouselContainer.setAttribute("data-carousel", "static");

	const carouselWrapper = document.createElement("div");
	carouselWrapper.className = "relative h-60 sm:h-72 md:h-96 lg:h-[500px] xl:h-[550px] overflow-hidden rounded-lg shadow-xl bg-neutral-800/50";

	const indicatorsContainer = document.createElement("div");
	indicatorsContainer.className = `
        absolute z-30 flex -translate-x-1/2 rtl:space-x-reverse bottom-5 left-1/2 
        overflow-x-auto whitespace-nowrap 
        pb-2 space-x-2 sm:space-x-3 
        max-w-[calc(100%-40px)] sm:max-w-[calc(100%-60px)] no-scrollbar
    `;

	displaySkins.forEach((skin, index) => {
		const item = document.createElement("div");
		item.className = "hidden duration-700 ease-in-out";
		item.setAttribute("data-carousel-item", index === 0 ? "active" : "");

		const img = document.createElement("img");
		img.src = `${baseUrl}/api/assets/skin/splash/${champion.id}/${skin.num}.jpg`;
		img.alt = skin.name === "default" || skin.name === champion.name
                    ? `Aspecto original de ${champion.name}`
                    : `Aspecto ${skin.name} de ${champion.name}`;
		img.className = "absolute block w-full h-full object-contain object-center";
		img.loading = "lazy";
		item.appendChild(img);
		carouselWrapper.appendChild(item);

		const indicatorButton = document.createElement("button");
		indicatorButton.type = "button";
		indicatorButton.className = "w-3 h-3 rounded-full flex-shrink-0";
		indicatorButton.setAttribute("aria-current", index === 0 ? "true" : "false");
		indicatorButton.setAttribute("aria-label", `Aspecto ${index + 1}: ${skin.name === "default" ? "Original" : skin.name}`);
		indicatorButton.setAttribute("data-carousel-slide-to", index.toString());
		indicatorsContainer.appendChild(indicatorButton);
	});

	carouselContainer.appendChild(carouselWrapper);

    if (displaySkins.length > 1) {
	    carouselContainer.appendChild(indicatorsContainer);

        const prevButton = document.createElement("button");
        prevButton.type = "button";
        prevButton.className = "absolute top-0 start-0 z-30 flex items-center justify-center h-full px-2 sm:px-4 cursor-pointer group focus:outline-none";
        prevButton.setAttribute("data-carousel-prev", "");
        prevButton.innerHTML = `
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/20 dark:bg-neutral-800/60 group-hover:bg-black/30 dark:group-hover:bg-neutral-700/80 group-focus:ring-2 group-focus:ring-violet-400 dark:group-focus:ring-violet-500/70 group-focus:outline-none">
                <svg class="w-4 h-4 text-white dark:text-neutral-200 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                </svg>
                <span class="sr-only">Anterior</span>
            </span>
        `;
        carouselContainer.appendChild(prevButton);

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "absolute top-0 end-0 z-30 flex items-center justify-center h-full px-2 sm:px-4 cursor-pointer group focus:outline-none";
        nextButton.setAttribute("data-carousel-next", "");
        nextButton.innerHTML = `
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/20 dark:bg-neutral-800/60 group-hover:bg-black/30 dark:group-hover:bg-neutral-700/80 group-focus:ring-2 group-focus:ring-violet-400 dark:group-focus:ring-violet-500/70 group-focus:outline-none">
                <svg class="w-4 h-4 text-white dark:text-neutral-200 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span class="sr-only">Siguiente</span>
            </span>
        `;
        carouselContainer.appendChild(nextButton);
    }
	return carouselContainer;
}

/**
 * Renders the champion detail view with integrated skins carousel.
 * @param {Object} champion - The champion data object.
 */
function renderChampionDetailView(champion) {
	const mainPageContainer = document.getElementById("champion-detail-main");
	mainPageContainer.innerHTML = "";

	mainPageContainer.className = `
		w-full min-h-[calc(100vh-80px)] flex flex-col items-center 
		px-2 sm:px-4 
		pt-18 sm:pt-24 md:pt-20 lg:pt-24 pb-12 md:pb-16 lg:pb-20 
	`;

	const championInfoCard = document.createElement("section");
	championInfoCard.className = `
		bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/70 rounded-xl shadow-2xl
		w-full max-w-4xl md:max-w-5xl lg:max-w-6xl 
		flex flex-col 
		mx-auto p-4 sm:p-6 md:p-8 lg:p-10
	`;

	const topContentWrapper = document.createElement("div");
	topContentWrapper.className = "flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-10";

	const leftColumn = document.createElement("div");
	leftColumn.className = "flex flex-col items-center text-center md:items-start md:text-left md:w-1/3 lg:w-1/4 xl:w-1/5 shrink-0";

	const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
	const championImage = document.createElement("img");
	championImage.src = `${baseUrl}${champion.imageUrl}`;
	championImage.alt = `Retrato de ${champion.name}`;
	championImage.className = "aspect-square w-28 sm:w-32 md:w-36 rounded-full object-cover border-[3px] border-violet-500 shadow-xl bg-neutral-800";
	championImage.loading = "lazy";

	const championName = document.createElement("h1");
	championName.textContent = champion.name;
	championName.className = "text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white mt-3 sm:mt-4";

	const championTitle = document.createElement("h2");
	championTitle.textContent = champion.title;
	championTitle.className = "text-lg sm:text-xl md:text-xl lg:text-2xl text-violet-400 font-semibold mt-1 mb-1 sm:mb-2 capitalize";

	const tagsContainer = document.createElement("div");
	tagsContainer.className = "flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 justify-center md:justify-start";
	if (Array.isArray(champion.roles) && champion.roles.length > 0) {
		champion.roles.forEach(tag => {
			const span = document.createElement("span");
			span.textContent = tag;
			span.className = "bg-violet-700/80 text-white text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md";
			tagsContainer.appendChild(span);
		});
	} else {
		const span = document.createElement("span");
		span.textContent = "Sin Roles";
		span.className = "bg-neutral-700 text-neutral-300 text-xs px-3 py-1 rounded-full";
		tagsContainer.appendChild(span);
	}

	leftColumn.appendChild(championImage);
	leftColumn.appendChild(championName);
	leftColumn.appendChild(championTitle);
	leftColumn.appendChild(tagsContainer);

	const rightColumn = document.createElement("div");
	rightColumn.className = "flex flex-col justify-start md:w-2/3 lg:w-3/4 xl:w-4/5 mt-3 md:mt-0";

	const loreBox = document.createElement("div");
	loreBox.className = "relative md:pl-6 lg:pl-8";
	loreBox.innerHTML = `
      <div class='absolute -left-3 top-0 h-full w-1 bg-violet-500 rounded-r-md hidden md:block shadow'></div>
      <p class='text-sm sm:text-base md:text-lg text-neutral-200/90 leading-relaxed text-justify hyphens-auto'>${champion.lore}</p>
    `;
	rightColumn.appendChild(loreBox);

	topContentWrapper.appendChild(leftColumn);
	topContentWrapper.appendChild(rightColumn);
	championInfoCard.appendChild(topContentWrapper);

	const skinsCarouselElement = createSkinsCarouselWithIndicators(champion, baseUrl);
	if (skinsCarouselElement) {
		championInfoCard.appendChild(skinsCarouselElement);
	} else {
        const noSkinsMessage = document.createElement("p");
        noSkinsMessage.textContent = "Este campeón no tiene aspectos adicionales disponibles.";
        noSkinsMessage.className = "text-neutral-400 text-center mt-8 md:mt-10 text-base md:text-lg";
        championInfoCard.appendChild(noSkinsMessage);
    }

	const backButtonElement = document.createElement("a");
	backButtonElement.href = "/src/pages/champions.html";
	backButtonElement.textContent = "Volver a Campeones";
	backButtonElement.className = `
        block w-full max-w-md mx-auto mt-10 md:mt-12 bg-violet-600 hover:bg-violet-700 
        text-white font-semibold py-2.5 sm:py-3 px-6 rounded-lg 
        transition-colors duration-150 text-center text-base sm:text-lg shadow-md hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-75
    `;
	championInfoCard.appendChild(backButtonElement);

	mainPageContainer.appendChild(championInfoCard);

    // Initialize Flowbite Carousel
	if (skinsCarouselElement && typeof Carousel !== 'undefined') {
        const carouselItems = Array.from(skinsCarouselElement.querySelectorAll('[data-carousel-item]')).map((el, i) => ({ position: i, el: el }));
        const carouselIndicators = Array.from(skinsCarouselElement.querySelectorAll('[data-carousel-slide-to]')).map((el, i) => ({ position: i, el: el }));
        const carouselOptions = {
            defaultPosition: 0,
            indicators: {
                activeClasses: 'bg-violet-500 dark:bg-violet-400',
                inactiveClasses: 'bg-neutral-500/50 hover:bg-neutral-400/70 dark:bg-neutral-600/50 dark:hover:bg-neutral-500/70',
                items: carouselIndicators
            }
        };
        const carousel = new Carousel(skinsCarouselElement, carouselItems, carouselOptions);
        const prevButton = skinsCarouselElement.querySelector('[data-carousel-prev]');
        const nextButton = skinsCarouselElement.querySelector('[data-carousel-next]');
        if (prevButton) { prevButton.addEventListener('click', () => carousel.prev()); }
        if (nextButton) { nextButton.addEventListener('click', () => carousel.next()); }
        carouselIndicators.forEach(indicator => {
            indicator.el.addEventListener('click', () => carousel.slideTo(indicator.position));
        });
    } else if (typeof initFlowbite !== 'undefined') {
        initFlowbite();
    }
}

/**
 * Initializes the champion detail page.
 */
document.addEventListener("DOMContentLoaded", async () => {
	const championKey = getChampionIdFromURL();
	const mainContentArea = document.getElementById("champion-detail-main");

	document.body.classList.add(
	    "bg-gradient-to-br", "from-neutral-950", "via-neutral-900",
	    "to-violet-950/80", "min-h-screen", "text-neutral-100", "antialiased"
	);

	if (!championKey) {
		mainContentArea.innerHTML = `<p class='text-red-400 text-center text-xl p-10'>No se ha especificado el ID del campeón.</p>`;
		return;
	}

	mainContentArea.innerHTML = `<div class="flex justify-center items-center min-h-[300px]"><p class='text-violet-400 text-center text-xl'>Cargando detalles del campeón...</p></div>`;

	try {
		const champion = await fetchChampionDetailFromAPI(championKey, LOL_LANG, LOL_VERSION);
		if (champion) {
		    renderChampionDetailView(champion);
        } else {
            mainContentArea.innerHTML = `<p class='text-red-400 text-center text-xl p-10'>No se pudo encontrar la información para el campeón "${championKey}".</p>`;
        }
	} catch (error) {
        console.error(`Error fetching champion details for ID "${championKey}":`, error);
		mainContentArea.innerHTML = `<p class='text-red-400 text-center text-xl p-10'>Error al cargar el campeón: ${error.message}</p>`;
	}
});