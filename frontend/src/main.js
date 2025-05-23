import { loadComponent } from './assets/js/componentLoader.js';

async function initializeFlowbite() {
    // Wait for Flowbite to be loaded
    if (window?.Flowbite) {
        // Initialize Flowbite for all elements
        window.Flowbite.init();
    } else if (window?.Dropdown && window?.Collapse) {
        // If Flowbite is not available, initialize Dropdown and Collapse manually
        document.querySelectorAll('[data-dropdown-toggle]').forEach(toggle => {
            new window.Dropdown(document.getElementById(toggle.dataset.dropdownToggle), toggle);
        });
        document.querySelectorAll('[data-collapse-toggle]').forEach(toggle => {
            new window.Collapse(document.getElementById(toggle.dataset.collapseToggle), toggle);
        });
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    await loadComponent('header', '/src/components/AppHeader.html');
    await import('flowbite');
    await initializeFlowbite();
});