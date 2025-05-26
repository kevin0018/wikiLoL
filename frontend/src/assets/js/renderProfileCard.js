/**
 * Renders the user profile card (image, name#tag, user icon, update button)
 * @param {Object} profileData - Data for the profile (name, tag, iconUrl, etc.)
 * @param {HTMLElement} container - Where to render the profile card
 * @param {Function} onUpdate - Callback when update button is clicked
 */
export function renderProfileCard(profileData, container, onUpdate) {
    container.innerHTML = "";

    const baseUrl = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3001";
    const card = document.createElement("section");
    card.className = `
        bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg
        w-full max-w-md mx-auto flex flex-col sm:flex-row items-center
        gap-4 px-5 py-6
    `;

    // Profile image (mobile first)
    const image = document.createElement("img");
    image.src = `${baseUrl}${profileData.iconUrl}`;
    image.alt = "Icono de perfil";
    image.className = `
        w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-violet-700 bg-neutral-800 shadow
        flex-shrink-0
    `;

    // Info container
    const info = document.createElement("div");
    info.className = "flex flex-col items-center sm:items-start flex-1 gap-2";

    // Name + tag + icon
    const nameRow = document.createElement("div");
    nameRow.className = "flex items-center gap-2";

    const nameTag = document.createElement("span");
    nameTag.className = "text-white font-bold text-base sm:text-xl";
    nameTag.textContent = `${profileData.name}#${profileData.tag}`;

    // User icon (SVG)
    const userIcon = document.createElement("span");
    userIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-5 h-5 text-gray-300">
            <circle cx="12" cy="8" r="4" fill="currentColor"/>
            <rect x="4" y="16" width="16" height="6" rx="3" fill="currentColor" class="opacity-60"/>
        </svg>
    `;

    nameRow.appendChild(nameTag);
    nameRow.appendChild(userIcon);

    // Update button
    const updateBtn = document.createElement("button");
    updateBtn.className = `
        mt-2 sm:mt-0 bg-violet-700 hover:bg-violet-800 transition-colors text-white font-semibold text-sm py-2 px-6 rounded shadow
    `;
    updateBtn.textContent = "Actualizar";
    updateBtn.onclick = () => onUpdate && onUpdate();

    info.appendChild(nameRow);
    info.appendChild(updateBtn);

    card.appendChild(image);
    card.appendChild(info);

    container.appendChild(card);
}