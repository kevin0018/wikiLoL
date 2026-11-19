import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type { MatchHistoryPage, RecentMatch } from "@wikilol/contracts";
import { useI18n, type TranslationKey } from "../i18n/I18nProvider";
import { api } from "../services/api";
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
  nextStart,
  puuid,
  region,
  playerName,
  tagLine,
  loading,
  error,
  retry,
}: {
  matches: RecentMatch[];
  nextStart: number | null;
  puuid: string;
  region: string;
  playerName: string;
  tagLine: string;
  loading: boolean;
  error: boolean;
  retry: () => void;
}) {
  const { dataDragonLocale, locale, t } = useI18n();
  const queryClient = useQueryClient();
  const [olderPages, setOlderPages] = useState<MatchHistoryPage[]>([]);
  const lastPage = olderPages.at(-1);
  const nextPage = lastPage ? lastPage.nextStart : nextStart;
  const moreMatches = useMutation({
    mutationFn: (start: number) => queryClient.fetchQuery({
      queryKey: ["activity-matches", puuid, region, dataDragonLocale, start],
      queryFn: () => api.activityMatches(puuid, region, dataDragonLocale, start),
      staleTime: 60_000,
      retry: false,
    }),
    onSuccess: (page) => setOlderPages((previous) => [...previous, page]),
  });
  const seenMatches = new Set<string>();
  const visibleMatches = [...matches, ...olderPages.flatMap((page) => page.matches)].filter(({ matchId }) => {
    if (seenMatches.has(matchId)) return false;
    seenMatches.add(matchId);
    return true;
  });
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
      ) : visibleMatches.length ? (
        <ol className="match-strip">
          {visibleMatches.map((match) => (
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
      {!loading && !error && nextPage !== null && (
        <div className="match-pagination">
          <button
            type="button"
            className="text-button"
            disabled={moreMatches.isPending}
            onClick={() => moreMatches.mutate(nextPage)}
          >
            {t(moreMatches.isPending ? "account.loadingMatches" : "account.showMoreMatches")}
          </button>
          {moreMatches.isError && <p role="alert">{t("account.moreMatchesError")}</p>}
        </div>
      )}
      <span className="sr-only" role="status">
        {olderPages.length > 0 && t("account.matchesShown", { count: visibleMatches.length })}
      </span>
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
