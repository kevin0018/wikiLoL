/**
 * Renders the user profile card (image, name#tag, user icon, update button)
 * @param {Object} profileData - Data for the profile (name, tag, iconUrl, etc.)
 * @param {HTMLElement} container - Where to render the profile card
 * @param {Function} onUpdate - Callback when update button is clicked
 */
export function renderProfileCard(profileData, container, onUpdate) {
    container.innerHTML = "";

    const baseUrl = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3001";

    // Card container (unified style)
    const card = document.createElement("section");
    card.className = [
        "flex flex-col sm:flex-row items-center sm:items-stretch justify-between",
        "bg-neutral-800",
        "rounded-xl",
        "shadow-md",
        "border-b-4 border-violet-700",
        "px-5 py-6",
        "w-full max-w-md mx-auto mb-2"
    ].join(" ");

    // Profile image
    const image = document.createElement("img");
    image.src = `${baseUrl}${profileData.iconUrl}`;
    image.alt = "Icono de perfil";
    image.className = [
        "w-20 h-20 sm:w-24 sm:h-24",
        "rounded-full object-cover",
        "border-2 border-violet-700",
        "bg-neutral-800 shadow",
        "flex-shrink-0",
        "mb-4 sm:mb-0"
    ].join(" ");

    // Info container
    const info = document.createElement("div");
    info.className = [
        "flex flex-col justify-center flex-1 min-w-0 items-center sm:items-start"
    ].join(" ");

    // Name + tag
    const nameTag = document.createElement("span");
    nameTag.className = "text-white font-bold text-lg sm:text-xl text-center sm:text-left mb-2";
    nameTag.textContent = `${profileData.name} #${profileData.tag}`;

    // Update button
    const updateBtn = document.createElement("button");
    updateBtn.className = [
        "bg-violet-700", "hover:bg-violet-800", "transition-colors",
        "text-white", "font-semibold", "text-sm",
        "py-2", "px-6",
        "rounded", "shadow"
    ].join(" ");
    updateBtn.textContent = "Actualizar";
    updateBtn.onclick = () => onUpdate && onUpdate();

    info.appendChild(nameTag);
    info.appendChild(updateBtn);

    card.appendChild(image);
    card.appendChild(info);

    container.appendChild(card);
}