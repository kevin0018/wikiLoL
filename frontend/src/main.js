import { loadComponent } from './assets/js/componentLoader.js';
import 'flowbite';
import { setActiveNavbarLink } from './assets/js/navbarActive.js';

document.addEventListener("DOMContentLoaded", async () => {
    await loadComponent('header', '/src/components/AppHeader.html');
    setActiveNavbarLink();
    await loadComponent('footer', '/src/components/AppFooter.html');
});