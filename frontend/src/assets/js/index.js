import { initPlayerRegionSelector } from "./playerRegionSelector";

document.addEventListener("DOMContentLoaded", () => {
	initPlayerRegionSelector();

	const searchForm = document.getElementById("player-search-form");
	if (!searchForm) return;

	searchForm.addEventListener("submit", function (e) {
		e.preventDefault();

		const playerInput = document.getElementById("player-search").value.trim();
		const region = (window.innerWidth >= 480)
			? document.getElementById("region-select").value
			: document.getElementById("region-select-mobile").value;

		if (!region || region === "Seleccione región") {
			alert("Por favor, selecciona una región válida.");
			return;
		}
		if (!playerInput) {
			alert("Por favor, introduce un nombre de usuario.");
			return;
		}

		let gameName = playerInput, tagLine = "";
		if (playerInput.includes("#")) {
			[gameName, tagLine] = playerInput.split("#");
			gameName = gameName.trim();
			tagLine = tagLine.trim();
		} else {
			tagLine = region;
		}

		window.location.href = `/pages/account.html?region=${encodeURIComponent(region)}&gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`;
	});
});