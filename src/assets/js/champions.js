import { fetchChampionData } from "../../api/riotService";
document.addEventListener("DOMContentLoaded", async function() {
    // Load the champions (object) data when the DOM is fully loaded
    const champions = await fetchChampionData();
    // Iterate over the object and create a new div for each champion
    for (const key in champions.data) {
        if ( champions.data[key].hasOwnProperty("id") ) {
            const championDiv = document.createElement("div");
            championDiv.classList.add("champion");
            // Create an image element for the champion
            const championImage = document.createElement("img");
            championImage.src = `https://ddragon.leagueoflegends.com/cdn/${champions.data[key].version}/img/champion/${champions.data[key].image.full}`; 
            championImage.alt = champions.data[key].name;
            // Append the image to the div
            championDiv.appendChild(championImage);
            // Append the div to the body or a specific container
            document.body.appendChild(championDiv);
        }        
    }
});