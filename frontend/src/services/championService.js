// Siempre usa variables de entorno frontend para la base de la API
const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function fetchChampionData(locale = "es_ES", version = "15.10.1") {
    const response = await fetch(`${baseUrl}/api/champion?locale=${locale}&version=${version}`);
    if (!response.ok) {
        throw new Error("Error al obtener los campeones");
    }
    return await response.json();
}