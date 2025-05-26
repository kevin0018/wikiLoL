export class Champion {
    /**
     * @param {string} id
     * @param {string} name
     * @param {string} title
     * @param {string[]} roles
     * @param {string} lore
     * @param {string} image
     * @param {string} version
     * @param {string} imageUrl
     * @param {array} skins
     */
    constructor({ id, name, title, roles, lore, image, version, imageUrl , skins }) {
        this.id = id;
        this.name = name;
        this.title = title;
        this.roles = roles;
        this.lore = lore;
        this.image = image;
        this.version = version;
        this.imageUrl = imageUrl;
        this.skins = skins || [];
    }
}