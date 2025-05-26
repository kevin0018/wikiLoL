import { Champion } from '../domain/Champion.js';
import { ChampionRepository } from '../domain/ChampionRepository.js';

export class RiotChampionRepositoryImpl extends ChampionRepository {
    /**
     * Fetches champion data from Riot API.
     * @param {string} id - The champion's key/ID (e.g., "Aatrox").
     * @param {string} lang - Language code (e.g., "es_ES").
     * @param {string} version - Game data version (e.g., "15.10.1").
     * @returns {Promise<Champion>} - A promise that resolves to a Champion instance.
     * @throws {Error} - If fetching or parsing data fails, or if the champion is not found.
     */
    async findById(id, lang = "es_ES", version = "15.10.1") {
        const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/champion/${encodeURIComponent(id)}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("No se pudo obtener la información del campeón desde Riot.");
        const data = await res.json();
        const champData = data.data[id];
        if (!champData) throw new Error("No se encontró el campeón.");

        // Extract skins information
        const championSkins = champData.skins ? champData.skins.map(skin => ({
            num: skin.num,
            name: skin.name
        })) : [];

        return new Champion({
            id: champData.id,
            name: champData.name,
            title: champData.title,
            roles: champData.tags,
            lore: champData.lore,
            image: champData.image.full,
            version,
            imageUrl: `/api/assets/champion/${version}/${champData.image.full}`,
            skins: championSkins
        });
    }
}