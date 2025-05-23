import { fetchChampionData } from '../infra/championApi.js';

export async function getChampionData(locale, version) {
    return await fetchChampionData(locale, version);
}