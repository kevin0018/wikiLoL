import type { RecentMatch } from "@wikilol/contracts";
import { useI18n, type TranslationKey } from "../i18n/I18nProvider";
import { ErrorState } from "./States";

const queueLabels: Partial<Record<number, TranslationKey>> = {
  400: "account.matchDraft",
  420: "rank.solo",
  440: "rank.flex",
  450: "account.matchAram",
  490: "account.matchQuickplay",
  1700: "account.matchArena",
};

export function RecentMatchHistory({
  matches,
  loading,
  error,
  retry,
}: {
  matches: RecentMatch[];
  loading: boolean;
  error: boolean;
  retry: () => void;
}) {
  const { locale, t } = useI18n();
  const date = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  return (
    <section className="profile-history" aria-labelledby="recent-match-title">
      <h2 id="recent-match-title">{t("account.recentMatches")}</h2>
      {error ? (
        <ErrorState retry={retry} />
      ) : loading ? (
        <div className="match-strip" role="status">
          <span className="sr-only">{t("account.loadingMatches")}</span>
          {Array.from({ length: 5 }, (_, index) => (
            <span className="match-skeleton" key={index} aria-hidden="true" />
          ))}
        </div>
      ) : matches.length ? (
        <ol className="match-strip">
          {matches.map((match) => (
            <li className={`match-card ${match.win ? "is-win" : "is-loss"}`} key={match.matchId}>
              <div className="match-result">
                <strong>{t(match.win ? "account.matchWin" : "account.matchLoss")}</strong>
                <span>{t(queueLabels[match.queueId] ?? "account.matchOther")}</span>
              </div>
              <div className="match-champion">
                {match.championImageUrl && <img src={match.championImageUrl} alt="" />}
                <strong>{match.championName}</strong>
              </div>
              <div className="match-score">
                <span aria-label={t("account.kda")}>{match.kills} / {match.deaths} / {match.assists}</span>
                <span>{t("account.kda")}</span>
              </div>
              <p className="match-details">
                {match.startedAt > 0 && (
                  <time dateTime={new Date(match.startedAt).toISOString()}>{date.format(match.startedAt)}</time>
                )}
                {match.durationSeconds > 0 && (
                  <span>{formatDuration(match.durationSeconds)}</span>
                )}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="panel-empty">{t("account.matchesEmpty")}</p>
      )}
    </section>
  );
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
