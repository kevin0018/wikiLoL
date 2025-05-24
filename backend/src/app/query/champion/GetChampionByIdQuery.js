export class GetChampionByIdQuery {
    constructor(id, lang = "es_ES", version = "15.10.1") {
        this.id = id;
        this.lang = lang;
        this.version = version;
    }
}