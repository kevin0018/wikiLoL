import { fetchChampionDetailFromAPI } from '../../services/championService.js';

const LOL_VERSION = "15.10.1";
const LOL_LANG = "es_ES";

function getChampionIdFromURL() {
	const params = new URLSearchParams(window.location.search);
	return params.get("id");
}

function renderChampionDetailMobile(champion) {
	const main = document.getElementById("champion-detail-main");
	main.innerHTML = "";

	// Main content
	main.className = `
		w-full min-h-[calc(100vh-80px)] flex items-center justify-center
		px-2 sm:px-4
		pt-10 md:pt-0
	`;

	const card = document.createElement("section");
	card.className = `
		bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg
		w-full max-w-4xl md:max-w-5xl
		flex flex-col md:flex-row gap-10 mx-auto
		px-6 md:px-10 py-8
	`;

	// Left column
	const left = document.createElement("div");
	left.className = "flex flex-col items-center md:items-start md:w-1/3";

	const img = document.createElement("img");
	img.src = champion.imageUrl;
	img.alt = champion.name;
	img.className = "w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-violet-700 shadow-lg bg-neutral-800";

	const name = document.createElement("h1");
	name.textContent = champion.name;
	name.className = "text-3xl md:text-4xl font-bold text-white mt-4 text-center md:text-left";

	const title = document.createElement("h2");
	title.textContent = champion.title;
	title.className = "text-lg md:text-xl text-violet-400 font-semibold mb-1 text-center md:text-left";

	const tags = document.createElement("div");
	tags.className = "flex flex-wrap gap-2 mt-1 justify-center md:justify-start";
	if (Array.isArray(champion.roles) && champion.roles.length > 0) {
		champion.roles.forEach(tag => {
			const span = document.createElement("span");
			span.textContent = tag;
			span.className = "bg-violet-700 text-white text-sm md:text-base px-3 py-1 rounded-full";
			tags.appendChild(span);
		});
	} else {
		const span = document.createElement("span");
		span.textContent = "Sin roles";
		span.className = "bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full";
		tags.appendChild(span);
	}

	left.appendChild(img);
	left.appendChild(name);
	left.appendChild(title);
	left.appendChild(tags);

	// Right column
	const right = document.createElement("div");
	right.className = "flex flex-col justify-between md:w-2/3";

	const loreBox = document.createElement("div");
	loreBox.className = "relative md:pl-8";
	loreBox.innerHTML = `
      <div class='absolute -left-3 top-0 h-full w-1 bg-violet-700 rounded-r-md hidden md:block'></div>
      <p class='text-base md:text-lg text-neutral-200 leading-relaxed'>${champion.lore}</p>
    `;

	const backBtn = document.createElement("a");
	backBtn.href = "/pages/champions.html";
	backBtn.textContent = "Volver a campeones";
	backBtn.className = "inline-block mt-8 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-8 rounded transition-colors text-center self-end md:self-start text-base md:text-lg";

	right.appendChild(loreBox);
	right.appendChild(backBtn);

	card.appendChild(left);
	card.appendChild(right);
	main.appendChild(card);
}

document.addEventListener("DOMContentLoaded", async () => {
	const id = getChampionIdFromURL();
	const main = document.getElementById("champion-detail-main");
	document.body.classList.add(
	    "bg-gradient-to-br",
	    "from-neutral-950",
	    "via-neutral-900/80",
	    "to-violet-950/60",
	    "min-h-screen"
	);
	if (!id) {
		main.innerHTML = `<p class='text-red-500 text-center'>No se ha especificado el id del campeón.</p>`;
		return;
	}
	try {
		const champion = await fetchChampionDetailFromAPI(id, LOL_LANG, LOL_VERSION);
		renderChampionDetailMobile(champion);
	} catch (e) {
		main.innerHTML = `<p class='text-red-500 text-center'>${e.message}</p>`;
	}
});