import fetch from 'node-fetch';

export async function loadChampionStaticData(language = 'es_ES') {
    // Fetch latest version
    const versionsRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionsRes.json();
    const latestVersion = versions[0];

    // Fetch champion static data
    const url = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/${language}/champion.json`;
    const dataRes = await fetch(url);
    const data = await dataRes.json();

    // Build map: { idNum (string): championObject }
    const championMap = {};
    for (const champName in data.data) {
        const champ = data.data[champName];
        championMap[champ.key] = champ;
    }
    return championMap;
}