/**
 * Renders the user profile card (image, name#tag, user icon, update button)
 * @param {Object} profileData - Data for the profile (name, tag, iconUrl, etc.)
 * @param {HTMLElement} container - Where to render the profile card
 * @param {Function} onUpdate - Callback when update button is clicked
 */
export function renderProfileCard(profileData, container, onUpdate) {
    container.innerHTML = "";

    const baseUrl = import.meta.env?.VITE_BACKEND_URL || "http://localhost:3001";

    const header = document.createElement("div");
    header.className = [
        "mb-2",
        "text-base",
        "text-violet-400",
        "font-semibold",
        "text-center"
    ].join(" ");
    header.textContent = "Perfil de usuario";

    // Card container
    const card = document.createElement("section");
    card.className = [
        "bg-neutral-900",
        "border", "border-neutral-700",
        "rounded-2xl", "shadow-lg",
        "w-full", "max-w-md", "mx-auto",
        "flex", "flex-col", "items-center", "gap-4",
        "sm:flex-row",
        "px-5", "py-6"
    ].join(" ");

    // Profile image
    const image = document.createElement("img");
    image.src = `${baseUrl}${profileData.iconUrl}`;
    image.alt = "Icono de perfil";
    image.className = [
        "w-20", "h-20",
        "sm:w-24", "sm:h-24",
        "rounded-full", "object-cover",
        "border-2", "border-violet-700",
        "bg-neutral-800", "shadow",
        "flex-shrink-0"
    ].join(" ");

    // Info container
    const info = document.createElement("div");
    info.className = [
        "flex", "flex-col",
        "items-center", "sm:items-start",
        "flex-1", "gap-2"
    ].join(" ");

    // Name + tag row
    const nameRow = document.createElement("div");
    nameRow.className = "flex items-center gap-2";

    const nameTag = document.createElement("span");
    nameTag.className = "text-white font-bold text-base sm:text-xl";
    nameTag.textContent = `${profileData.name}#${profileData.tag}`;

    nameRow.appendChild(nameTag);

    // Update button
    const updateBtn = document.createElement("button");
    updateBtn.className = [
        "mt-2", "sm:mt-0",
        "bg-violet-700", "hover:bg-violet-800", "transition-colors",
        "text-white", "font-semibold", "text-sm",
        "py-2", "px-6",
        "rounded", "shadow"
    ].join(" ");
    updateBtn.textContent = "Actualizar";
    updateBtn.onclick = () => onUpdate && onUpdate();

    info.appendChild(nameRow);
    info.appendChild(updateBtn);

    card.appendChild(image);
    card.appendChild(info);

    container.appendChild(header);
    container.appendChild(card);
}