const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function fetchChampionData(locale = "es_ES", version = "15.10.1") {
    const response = await fetch(`${baseUrl}/api/champions?locale=${locale}&version=${version}`);
    if (!response.ok) {
        throw new Error("Error al obtener los campeones");
    }
    return await response.json();
}

export async function fetchChampionDetailFromAPI(id, locale = "es_ES", version = "15.10.1") {
    const url = `${baseUrl}/api/champions/${encodeURIComponent(id)}?locale=${locale}&version=${version}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo obtener la información del campeón.");
    const data = await res.json();
    return data;
}