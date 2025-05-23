/**
 * Module to populate and sync desktop/mobile region selects
 * and update the player search input placeholder accordingly.
 */

const regions = [
    { id: 'EUW', name: 'Europe West', tag: 'EUW' },
    { id: 'NA', name: 'North America', tag: 'NA' },
    { id: 'EUNE', name: 'Europe Nordic & East', tag: 'EUNE' },
    { id: 'LAN', name: 'Latin America North', tag: 'LAN' },
    { id: 'LAS', name: 'Latin America South', tag: 'LAS' },
    { id: 'KR', name: 'Korea', tag: 'KR' },
    { id: 'JP', name: 'Japan', tag: 'JP' }
];

/**
 * Initialises the player region selector,
 * populates both selecting and sets up all event listeners.
 */
export function initPlayerRegionSelector() {
    const desktopSelect = document.getElementById('region-select');
    const mobileSelect = document.getElementById('region-select-mobile');
    const playerSearchInput = document.getElementById('player-search');

    if (!desktopSelect || !mobileSelect || !playerSearchInput) return;

    // Populate desktop and mobile selects with region options
    regions.forEach(region => {
        const optionDesktop = document.createElement('option');
        optionDesktop.value = region.id;
        optionDesktop.textContent = region.name;
        optionDesktop.dataset.tag = region.tag;
        desktopSelect.appendChild(optionDesktop);

        const optionMobile = document.createElement('option');
        optionMobile.value = region.id;
        optionMobile.textContent = region.tag;
        optionMobile.dataset.tag = region.tag;
        mobileSelect.appendChild(optionMobile);
    });

    /**
     * Updates the placeholder of the player search input
     * according to the selected region.
     * @param {HTMLSelectElement} select
     */
    function updatePlaceholder(select) {
        const selected = select.selectedOptions[0];
        const tag = selected ? selected.dataset.tag : '';
        playerSearchInput.placeholder = `Nombre de invocador + #${tag}`;
    }

    // Syncs selects and updates placeholder on change
    desktopSelect.addEventListener('change', () => {
        mobileSelect.value = desktopSelect.value;
        updatePlaceholder(desktopSelect);
    });

    mobileSelect.addEventListener('change', () => {
        desktopSelect.value = mobileSelect.value;
        updatePlaceholder(mobileSelect);
    });

    // Set initial values and placeholder
    if (regions.length > 0) {
        desktopSelect.value = regions[0].id;
        mobileSelect.value = regions[0].id;
        playerSearchInput.placeholder = `Nombre de invocador + #${regions[0].tag}`;
    }
}