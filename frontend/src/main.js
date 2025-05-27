import { loadComponent } from './assets/js/componentLoader.js';
import { setActiveNavbarLink } from './assets/js/navbarActive.js';
import { initNavbarHandler } from './assets/js/navbarHandler.js';

import 'flowbite';

document.addEventListener('DOMContentLoaded', () => {
    const headerComponent = document.getElementById('header');
    const footerComponent = document.getElementById('footer');

    if (headerComponent) {
        loadComponent('header', '/components/AppHeader.html', initNavbarHandler);
        setActiveNavbarLink();
    }

    if (footerComponent) {
        loadComponent('footer', '/components/AppFooter.html');
    }
});