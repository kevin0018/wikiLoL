import { useRef, useState } from "react";
import type { RecentMatch } from "@wikilol/contracts";
import { useI18n, type TranslationKey } from "../i18n/I18nProvider";
import { ArrowIcon } from "./Icons";
import { MatchDetailsDialog } from "./MatchDetailsDialog";
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
  region,
  playerName,
  tagLine,
  loading,
  error,
  retry,
}: {
  matches: RecentMatch[];
  region: string;
  playerName: string;
  tagLine: string;
  loading: boolean;
  error: boolean;
  retry: () => void;
}) {
  const { locale, t } = useI18n();
  const [selectedMatch, setSelectedMatch] = useState<RecentMatch | null>(null);
  const selectedTrigger = useRef<HTMLButtonElement>(null);
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
              <button
                className="match-row"
                type="button"
                aria-haspopup="dialog"
                aria-label={t("account.openMatch", {
                  champion: match.championName,
                  date: match.startedAt ? date.format(match.startedAt) : "",
                })}
                onClick={(event) => {
                  selectedTrigger.current = event.currentTarget;
                  setSelectedMatch(match);
                }}
              >
                <span className="match-result">
                  <strong>{t(match.win ? "account.matchWin" : "account.matchLoss")}</strong>
                  <small>{t(queueLabels[match.queueId] ?? "account.matchOther")}</small>
                </span>
                <span className="match-champion">
                  {match.championImageUrl && <img src={match.championImageUrl} alt="" />}
                  <strong>{match.championName}</strong>
                </span>
                <span className="match-score">
                  <span>{match.kills} / {match.deaths} / {match.assists}</span>
                  <small>{t("account.kda")}</small>
                </span>
                <span className="match-details">
                  {match.startedAt > 0 && (
                    <time dateTime={new Date(match.startedAt).toISOString()}>{date.format(match.startedAt)}</time>
                  )}
                  {match.durationSeconds > 0 && (
                    <span>{formatDuration(match.durationSeconds)}</span>
                  )}
                </span>
                <span className="match-open" aria-hidden="true"><ArrowIcon /></span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="panel-empty">{t("account.matchesEmpty")}</p>
      )}
      {selectedMatch && (
        <MatchDetailsDialog
          match={selectedMatch}
          region={region}
          playerName={playerName}
          tagLine={tagLine}
          queue={t(queueLabels[selectedMatch.queueId] ?? "account.matchOther")}
          duration={selectedMatch.durationSeconds ? formatDuration(selectedMatch.durationSeconds) : ""}
          onDismiss={() => {
            setSelectedMatch(null);
            selectedTrigger.current?.focus();
          }}
        />
      )}
    </section>
  );
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
