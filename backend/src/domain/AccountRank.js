export class AccountRank {
    /**
     * @param {string} queueType
     * @param {string} tier
     * @param {string} rank
     * @param {number} leaguePoints
     * @param {number} wins
     * @param {number} losses
     */
    constructor({ queueType, tier, rank, leaguePoints, wins, losses }) {
        this.queueType = queueType;
        this.tier = tier;
        this.rank = rank;
        this.leaguePoints = leaguePoints;
        this.wins = wins;
        this.losses = losses;
    }
}