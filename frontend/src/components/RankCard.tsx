import type { AccountRank } from "@wikilol/contracts";

const queueNames: Record<string, string> = {
  RANKED_SOLO_5x5: "Solo / Dúo",
  RANKED_FLEX_SR: "Flexible",
};

const unranked: Omit<AccountRank, "queueType"> = {
  tier: "UNRANKED",
  rank: "",
  leaguePoints: 0,
  wins: 0,
  losses: 0,
  rankIconUrl: "/api/assets/ranked/unranked.png",
};

export function RankCard({
  rank,
  queueType,
}: {
  rank: AccountRank | undefined;
  queueType: string;
}) {
  const data: AccountRank = rank ?? { ...unranked, queueType };
  const games = data.wins + data.losses;
  const winRate = games ? Math.round((data.wins / games) * 100) : 0;
  const tier =
    data.tier === "UNRANKED"
      ? "Sin clasificar"
      : `${titleCase(data.tier)} ${data.rank}`;

  return (
    <article className="rank-card">
      <div className="rank-icon">
        <img src={data.rankIconUrl} alt="" />
      </div>
      <div className="rank-copy">
        <span className="utility-label">{queueNames[queueType]}</span>
        <h3>{tier}</h3>
        <p>{data.tier === "UNRANKED" ? "Sin partidas" : `${data.leaguePoints} LP`}</p>
      </div>
      <dl>
        <div>
          <dt>Victorias</dt>
          <dd>{data.wins}</dd>
        </div>
        <div>
          <dt>Derrotas</dt>
          <dd>{data.losses}</dd>
        </div>
        <div>
          <dt>Win rate</dt>
          <dd>{winRate}%</dd>
        </div>
      </dl>
    </article>
  );
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLocaleLowerCase("es");
}
