import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type { MatchHistoryPage, RecentMatch } from "@wikilol/contracts";
import { useI18n, type TranslationKey } from "../i18n/I18nProvider";
import { api } from "../services/api";
import { ChevronIcon } from "./Icons";
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
  const [pageIndex, setPageIndex] = useState(0);
  const [lastPageIndex, setLastPageIndex] = useState<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const currentPage = olderPages[pageIndex - 1];
  const nextPage = currentPage ? currentPage.nextStart : nextStart;
  const canGoNext = nextPage !== null && lastPageIndex !== pageIndex;
  const visibleMatches = currentPage?.matches ?? matches;
  const moreMatches = useMutation({
    mutationFn: (start: number) => queryClient.fetchQuery({
      queryKey: ["activity-matches", puuid, region, dataDragonLocale, start],
      queryFn: () => api.activityMatches(puuid, region, dataDragonLocale, start),
      staleTime: 60_000,
      retry: false,
    }),
    onSuccess: (page) => {
      if (page.matches.length === 0 && page.nextStart === null) {
        setLastPageIndex(pageIndex);
        titleRef.current?.focus();
        return;
      }
      setOlderPages((previous) => [...previous, page]);
      showPage(pageIndex + 1);
    },
  });

  function showPage(index: number) {
    setPageIndex(index);
    titleRef.current?.focus();
  }

  function showNextPage() {
    if (olderPages[pageIndex]) {
      moreMatches.reset();
      showPage(pageIndex + 1);
    } else if (canGoNext) {
      moreMatches.mutate(nextPage);
    }
  }

  const [selectedMatch, setSelectedMatch] = useState<RecentMatch | null>(null);
  const selectedTrigger = useRef<HTMLButtonElement>(null);
  const wins = matches.filter((match) => match.win).length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;
  const date = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  return (
    <section className="profile-history" aria-labelledby="recent-match-title">
      <header className="match-feed-header">
        <h2 id="recent-match-title" ref={titleRef} tabIndex={-1}>{t("account.recentMatches")}</h2>
        {!loading && !error && matches.length > 0 && (
          <div className="match-overview">
            <div className="match-overview-rate">
              <strong>{winRate}%</strong>
              <span>{t("rank.winRate")}</span>
            </div>
            <div className="match-overview-record">
              <p>{t("account.matchRecord", { count: matches.length, wins, losses: matches.length - wins })}</p>
              <div className="match-form-chart" aria-hidden="true">
                {matches.map((match) => (
                  <span className={match.win ? "is-win" : "is-loss"} key={match.matchId} />
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
      {!loading && !error && (pageIndex > 0 || nextPage !== null) && (
        <nav className="match-pagination" aria-label={t("account.matchPagination")} aria-busy={moreMatches.isPending}>
          <span className="match-page-number" role="status">{t("account.matchPage", { page: pageIndex + 1 })}</span>
          <div className="match-page-actions">
            <button
              type="button"
              disabled={pageIndex === 0 || moreMatches.isPending}
              onClick={() => {
                moreMatches.reset();
                showPage(pageIndex - 1);
              }}
            >
              <ChevronIcon />
              {t("account.previousMatchPage")}
            </button>
            <button
              type="button"
              disabled={!canGoNext || moreMatches.isPending}
              onClick={showNextPage}
            >
              {t(moreMatches.isPending ? "account.loadingMatchPage" : "account.nextMatchPage")}
              <ChevronIcon />
            </button>
          </div>
          {moreMatches.isError && <p role="alert">{t("account.moreMatchesError")}</p>}
        </nav>
      )}
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
        <ol className="match-strip" key={pageIndex}>
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
                <span className="match-champion">
                  <span className="match-portrait">
                    {match.championImageUrl && <img src={match.championImageUrl} alt="" loading="lazy" />}
                  </span>
                  <span className="match-identity">
                    <strong>{match.championName}</strong>
                    <small>{t(queueLabels[match.queueId] ?? "account.matchOther")}</small>
                  </span>
                </span>
                <span className="match-result">{t(match.win ? "account.matchWin" : "account.matchLoss")}</span>
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
                <span className="match-open"><ChevronIcon /></span>
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
