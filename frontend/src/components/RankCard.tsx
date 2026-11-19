import type { AccountRank } from "@wikilol/contracts";
import { useI18n } from "../i18n/I18nProvider";

export function RankCard({ rank }: { rank: AccountRank }) {
  const { locale, t } = useI18n();
  const winRate = getWinRate(rank);

  return (
    <article className="rank-card">
      <RankIdentity rank={rank} />
      <dl>
        <div>
          <dt>{t("rank.wins")}</dt>
          <dd>{rank.wins.toLocaleString(locale)}</dd>
        </div>
        <div>
          <dt>{t("rank.losses")}</dt>
          <dd>{rank.losses.toLocaleString(locale)}</dd>
        </div>
        <div>
          <dt>{t("rank.winRate")}</dt>
          <dd>{formatWinRate(winRate)}</dd>
          {winRate !== null && <meter aria-hidden="true" min={0} max={100} value={winRate} />}
        </div>
      </dl>
    </article>
  );
}

export function RankComparison({ ranks }: { ranks: AccountRank[] }) {
  const { locale, t } = useI18n();

  return (
    <table className="rank-comparison" aria-labelledby="account-rank-title">
      <thead>
        <tr>
          <th scope="col">{t("rank.queue")}</th>
          <th scope="col">{t("rank.wins")}</th>
          <th scope="col">{t("rank.losses")}</th>
          <th scope="col">{t("rank.winRate")}</th>
        </tr>
      </thead>
      <tbody>
        {ranks.map((rank) => (
          <tr key={rank.queueType}>
            <th scope="row"><RankIdentity rank={rank} compact /></th>
            <td>{rank.wins.toLocaleString(locale)}</td>
            <td>{rank.losses.toLocaleString(locale)}</td>
            <td>{formatWinRate(getWinRate(rank))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RankIdentity({ rank, compact = false }: { rank: AccountRank; compact?: boolean }) {
  const { locale, t } = useI18n();
  const apexTier = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(rank.tier);
  const tierName = rank.tier.charAt(0) + rank.tier.slice(1).toLocaleLowerCase(locale);
  const tier = apexTier ? tierName : `${tierName} ${rank.rank}`;
  const Title = compact ? "strong" : "h3";

  return (
    <div className="rank-identity">
      <div className="rank-icon">
        <img src={rank.rankIconUrl} alt="" />
      </div>
      <div className="rank-copy">
        <span className="rank-queue-name">{t(rank.queueType === "RANKED_SOLO_5x5" ? "rank.solo" : "rank.flex")}</span>
        <Title>{tier}</Title>
        <p>{rank.leaguePoints.toLocaleString(locale)} LP</p>
      </div>
    </div>
  );
}

function getWinRate(rank: AccountRank): number | null {
  const games = rank.wins + rank.losses;
  return games ? Math.round((rank.wins / games) * 100) : null;
}

function formatWinRate(winRate: number | null): string {
  return winRate === null ? "—" : `${winRate}%`;
}
