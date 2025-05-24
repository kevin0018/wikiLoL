export class Champion {
    constructor({ id, name, title, roles, lore, image, version, imageUrl }) {
        this.id = id;
        this.name = name;
        this.title = title;
        this.roles = roles;
        this.lore = lore;
        this.image = image;
        this.version = version;
        this.imageUrl = imageUrl;
    }
}