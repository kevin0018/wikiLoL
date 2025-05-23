const apiUrl = import.meta.env.VITE_API_URL; // Vite

export async function getAccount(gameName, tagLine) {
    const response = await fetch(`${apiUrl}/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`);
    if (!response.ok) {
        throw new Error('Error al obtener la cuenta');
    }
    return await response.json();
}