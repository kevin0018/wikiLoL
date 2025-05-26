export class GetMostPlayedChampionQuery {
  constructor({ puuid, region, matchCount, top }) {
    this.puuid = puuid;
    this.region = region;
    this.matchCount = matchCount ?? 10;
    this.top = top ?? 4;
  }
}