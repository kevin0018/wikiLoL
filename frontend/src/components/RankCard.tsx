import type { AccountRank } from "@wikilol/contracts";
import { useI18n } from "../i18n/I18nProvider";

export function RankCard({
  rank,
  queueType,
}: {
  rank: AccountRank;
  queueType: string;
}) {
  const { locale, t } = useI18n();
  const games = rank.wins + rank.losses;
  const winRate = games ? Math.round((rank.wins / games) * 100) : 0;
  const tier = `${titleCase(rank.tier, locale)} ${rank.rank}`;
  const queueName =
    queueType === "RANKED_SOLO_5x5" ? t("rank.solo") : t("rank.flex");

  return (
    <article className="rank-card">
      <div className="rank-icon">
        <img src={rank.rankIconUrl} alt="" />
      </div>
      <div className="rank-copy">
        <span className="rank-queue-name">{queueName}</span>
        <h3>{tier}</h3>
        <p>{rank.leaguePoints} LP</p>
      </div>
      <dl>
        <div>
          <dt>{t("rank.wins")}</dt>
          <dd>{rank.wins}</dd>
        </div>
        <div>
          <dt>{t("rank.losses")}</dt>
          <dd>{rank.losses}</dd>
        </div>
        <div>
          <dt>{t("rank.winRate")}</dt>
          <dd>{winRate}%</dd>
        </div>
      </dl>
    </article>
  );
}

function titleCase(value: string, locale: string) {
  return value.charAt(0) + value.slice(1).toLocaleLowerCase(locale);
}
