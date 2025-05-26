/**
 * Query to get Challenger league players.
 */
export class GetChallengerLeagueQuery {
    /**
     * @param {string} region - The region (e.g., 'EUW', 'NA').
     * @param {string} queue - The queue type (e.g., 'RANKED_SOLO_5x5').
     */
    constructor(region, queue) {
        this.region = region;
        this.queue = queue;

        if (!region) {
            throw new Error("Region is required for GetChallengerLeagueQuery.");
        }
        if (!queue) {
            throw new Error("Queue is required for GetChallengerLeagueQuery.");
        }
    }
}