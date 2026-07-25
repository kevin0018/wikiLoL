export class GetChampionByIdQuery {
  constructor(
    public readonly id: string,
    public readonly locale = "es_ES",
  ) {}
}
