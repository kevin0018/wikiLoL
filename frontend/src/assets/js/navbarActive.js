export function setActiveNavbarLink() {
    // Get the current normalized pathname
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

    // Select all navigation links with the 'nav-link' class inside any <nav>
    const navLinks = document.querySelectorAll('nav .nav-link');

    navLinks.forEach(link => {
        let url;
        try {
            url = new URL(link.href, window.location.origin);
        } catch {
            return;
        }
        // Only compare if the link is local
        if (url.origin === window.location.origin) {
            const linkPath = url.pathname.replace(/\/$/, '') || '/';
            link.removeAttribute('aria-current');
            if (linkPath === currentPath) {
                link.setAttribute('aria-current', 'page');
            }
        } else {
            link.removeAttribute('aria-current');
        }
    });
}