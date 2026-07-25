import type { AccountRank } from "@wikilol/contracts";

const queueNames: Record<string, string> = {
  RANKED_SOLO_5x5: "Solo / Dúo",
  RANKED_FLEX_SR: "Flexible",
};

export function RankCard({
  rank,
  queueType,
}: {
  rank: AccountRank;
  queueType: string;
}) {
  const games = rank.wins + rank.losses;
  const winRate = games ? Math.round((rank.wins / games) * 100) : 0;
  const tier = `${titleCase(rank.tier)} ${rank.rank}`;

  return (
    <article className="rank-card">
      <div className="rank-icon">
        <img src={rank.rankIconUrl} alt="" />
      </div>
      <div className="rank-copy">
        <span className="rank-queue-name">{queueNames[queueType]}</span>
        <h3>{tier}</h3>
        <p>{rank.leaguePoints} LP</p>
      </div>
      <dl>
        <div>
          <dt>Victorias</dt>
          <dd>{rank.wins}</dd>
        </div>
        <div>
          <dt>Derrotas</dt>
          <dd>{rank.losses}</dd>
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
