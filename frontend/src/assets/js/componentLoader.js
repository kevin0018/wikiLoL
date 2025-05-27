/**
 * Loads an HTML component into a specified element.
 * @param {string} elementId - The ID of the element where the component will be loaded.
 * @param {string} filePath - The path to the HTML file to be loaded.
 * @param {function} [callback] - Optional callback function to execute after the component is successfully loaded.
 */
export async function loadComponent(elementId, filePath, callback) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Network response was not ok for ${filePath}`);
        const html = await response.text();
        const targetElement = document.getElementById(elementId);

        if (targetElement) {
            targetElement.innerHTML = html;
            if (typeof callback === 'function') {
                callback();
            }
        } else {
            console.warn(`Target element with ID '${elementId}' not found.`);
        }
    } catch (error) {
        console.error(`Component loading error for ${filePath}:`, error);
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            targetElement.innerHTML = "<div class='text-red-500 p-4'>Error cargando el componente.</div>";
        }
    }
}