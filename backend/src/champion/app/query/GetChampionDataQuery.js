export class GetChampionDataQuery {
    /**
     * @param {string} locale
     * @param {string} version
     */
    constructor(locale = "es_ES", version = "15.10.1") {
        this.locale = locale;
        this.version = version;
    }
}