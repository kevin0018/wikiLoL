export class GetChampionByIdQuery {
    constructor(championId, lang = "es_ES", version = "15.10.1") {
        this.championId = championId;
        this.lang = lang;
        this.version = version;
    }
}