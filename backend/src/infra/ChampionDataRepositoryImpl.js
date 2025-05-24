import { Champion } from '../domain/Champion.js';
import { ChampionDataRepository } from '../domain/ChampionDataRepository.js';

export class ChampionDataRepositoryImpl extends ChampionDataRepository {
    /**
     * Fetches all champions from the DataDragon API.
     * @param {string} locale - The locale for the data (default: "es_ES").
     * @param {string} version - The version of the data (default: "15.10.1").
     * @returns {Promise<Champion[]>} - A promise that resolves to an array of Champion entities.
     */
    async fetchAll(locale = "es_ES", version = "15.10.1") {
        const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/champion.json`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`DataDragon API error: ${response.status}`);
        }
        const data = await response.json();
        // Map to Champion entity with correct fields
        return Object.values(data.data).map(champData =>
            new Champion({
                id: champData.id,
                name: champData.name,
                title: champData.title,
                roles: champData.tags,
                lore: champData.blurb,
                image: champData.image.full,
                version,
                imageUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champData.image.full}`
            })
        );
    }
}