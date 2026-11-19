import { useState } from "react";
import type { AccountRank } from "@wikilol/contracts";
import { useI18n } from "../i18n/I18nProvider";
import { ChevronIcon } from "./Icons";

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

export function RankQueueSwitcher({ solo, flex }: { solo: AccountRank; flex: AccountRank }) {
  const { t } = useI18n();
  const [showFlex, setShowFlex] = useState(false);
  const rank = showFlex ? flex : solo;
  const target = t(showFlex ? "rank.solo" : "rank.flex");

  return (
    <div className="rank-switcher">
      <div aria-live="polite">
        <RankCard key={rank.queueType} rank={rank} />
      </div>
      <button
        type="button"
        className={`rank-switch${showFlex ? " is-previous" : ""}`}
        aria-label={t("rank.showQueue", { queue: target })}
        onClick={() => setShowFlex(!showFlex)}
      >
        {target}
        <ChevronIcon />
      </button>
    </div>
  );
}

function RankIdentity({ rank }: { rank: AccountRank }) {
  const { locale, t } = useI18n();
  const apexTier = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(rank.tier);
  const tierName = rank.tier.charAt(0) + rank.tier.slice(1).toLocaleLowerCase(locale);
  const tier = apexTier ? tierName : `${tierName} ${rank.rank}`;

  return (
    <div className="rank-identity">
      <div className="rank-icon">
        <img src={rank.rankIconUrl} alt="" />
      </div>
      <div className="rank-copy">
        <span className="rank-queue-name">{t(rank.queueType === "RANKED_SOLO_5x5" ? "rank.solo" : "rank.flex")}</span>
        <h3>{tier}</h3>
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
