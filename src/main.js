import { loadComponent } from './assets/js/componentLoader.js';
import 'flowbite';

document.addEventListener("DOMContentLoaded", function() {
    // Load the components
    loadComponent('header', './src/components/AppHeader.html');
});