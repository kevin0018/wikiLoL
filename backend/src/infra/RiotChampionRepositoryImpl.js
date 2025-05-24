import { Champion } from '../domain/Champion.js';
import { ChampionRepository } from '../domain/ChampionRepository.js';

export class RiotChampionRepositoryImpl extends ChampionRepository {
    async findById(championId, lang = "es_ES", version = "15.10.1") {
        const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${lang}/champion/${encodeURIComponent(championId)}.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("No se pudo obtener la información del campeón desde Riot.");
        const data = await res.json();
        const champData = data.data[name];
        if (!champData) throw new Error("No se encontró el campeón.");
        return new Champion({
            championId: champData.id,
            name: champData.name,
            title: champData.title,
            roles: champData.tags,
            lore: champData.lore,
            image: champData.image.full,
            version,
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champData.image.full}`
        });
    }
}