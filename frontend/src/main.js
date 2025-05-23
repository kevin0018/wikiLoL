import { loadComponent } from './assets/js/componentLoader.js';
import 'flowbite';

document.addEventListener("DOMContentLoaded", async () => {
    await loadComponent('header', '/src/components/AppHeader.html');
});