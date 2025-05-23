const apiUrl = import.meta.env.VITE_API_URL;

export async function getChampionData(locale = "es_ES", version = "15.10.1") {
    const response = await fetch(`${apiUrl}/champion?locale=${locale}&version=${version}`);
    if (!response.ok) {
        throw new Error("Error al obtener los campeones");
    }
    return await response.json();
}
