/**
 * @module navbarHandler
 * @description Handles the mobile navbar toggle functionality including
 * click-outside and link-click to close.
 */

// Function to initialize the mobile navbar interactions
export function initNavbarHandler() {
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileMenuPanel = document.getElementById('main-navbar');
    console.log('Initializing mobile navbar handler');
    console.log('Hamburger button:', hamburgerButton);

    if (!hamburgerButton || !mobileMenuPanel) {
        return;
    }

    const toggleMenu = () => {
        console.log('Toggling mobile menu visibility');
        mobileMenuPanel.classList.toggle('hidden');
        const isExpanded = !mobileMenuPanel.classList.contains('hidden');
        hamburgerButton.setAttribute('aria-expanded', isExpanded.toString());
    };

    hamburgerButton.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    const menuLinks = mobileMenuPanel.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!mobileMenuPanel.classList.contains('hidden')) {
                toggleMenu();
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (
            !mobileMenuPanel.classList.contains('hidden') &&
            !mobileMenuPanel.contains(event.target) &&
            !hamburgerButton.contains(event.target)
        ) {
            toggleMenu();
        }
    });
}