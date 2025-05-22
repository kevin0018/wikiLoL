document.addEventListener("DOMContentLoaded", function() {
    // Load the components
    loadComponent('header', './src/components/AppHeader.html');

    // Function to load HTML components
    /**
     * Loads an HTML component into a specified element.
     * @param {string} elementId - The ID of the element where the component will be loaded.
     * @param {string} filePath - The path to the HTML file to be loaded.
     */
    function loadComponent(elementId, filePath) {
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
            })
            .catch(error => console.error('Error cargando el componente:', error));
    }
});
