import { loadComponent } from './assets/js/componentLoader.js';
import { setActiveNavbarLink } from './assets/js/navbarActive.js';
import { initNavbarHandler } from './assets/js/navbarHandler.js';

import 'flowbite';

document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('app-header-placeholder');
    const footerPlaceholder = document.getElementById('app-footer-placeholder');

    if (headerPlaceholder) {
        loadComponent('app-header-placeholder', '/components/AppHeader.html', initNavbarHandler);
        setActiveNavbarLink();
    }

    if (footerPlaceholder) {
        loadComponent('app-footer-placeholder', '/components/AppFooter.html');
    }
});