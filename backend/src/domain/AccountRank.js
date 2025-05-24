export class AccountRank {
    constructor({ queueType, tier, rank, leaguePoints, wins, losses }) {
        this.queueType = queueType; // Ej: "RANKED_SOLO_5x5"
        this.tier = tier;
        this.rank = rank;
        this.leaguePoints = leaguePoints;
        this.wins = wins;
        this.losses = losses;
    }
}