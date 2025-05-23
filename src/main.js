import { loadComponent } from './assets/js/componentLoader.js';
async function initializeFlowbite() {
    if (window?.Flowbite) {
        window.Flowbite.init();
    } else if (window?.Dropdown && window?.Collapse) {
        document.querySelectorAll('[data-dropdown-toggle]').forEach(toggle => {
            new window.Dropdown(document.getElementById(toggle.dataset.dropdownToggle), toggle);
        });
        document.querySelectorAll('[data-collapse-toggle]').forEach(toggle => {
            new window.Collapse(document.getElementById(toggle.dataset.collapseToggle), toggle);
        });
    }
}
// This function gets the current page name from the URL
function getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1);
}
document.addEventListener("DOMContentLoaded", async function() {
    await loadComponent('header', './src/components/AppHeader.html');
    await import('flowbite');
    await initializeFlowbite();
    const page = getCurrentPage();
    switch (page) {
        case '':
        case 'index.html':
            // This section is for the home page
            import('./assets/js/playerRegionSelector.js').then(module => {
                module.initPlayerRegionSelector();
            });
            break;
        case 'champions.html':
            break;
        default:
            break;
    }
});