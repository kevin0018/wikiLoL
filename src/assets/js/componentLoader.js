/**
 * Loads an HTML component into a specified element.
 * @param {string} elementId - The ID of the element where the component will be loaded.
 * @param {string} filePath - The path to the HTML file to be loaded.
 */
export async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Error en la respuesta de la red');
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Error cargando el componente:', error);
        document.getElementById(elementId).innerHTML = "<div>Error cargando el componente.</div>";
    }
}