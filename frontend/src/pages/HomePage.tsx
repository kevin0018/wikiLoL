import { useQueries, useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import heroImage from "../assets/images/hero.jpg";
import { ArrowIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { PlayerSearch } from "../components/PlayerSearch";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../services/api";

const recentMatchCount = 5;
const recentChampionCount = 3;
const recentRequestSpacingMs = 1_200;

export function HomePage() {
  const { dataDragonLocale, locale, t } = useI18n();
  const ladder = useQuery({
    queryKey: ["challenger", "EUW"],
    queryFn: () => api.challenger("EUW"),
    refetchInterval: (query) =>
      query.state.data?.some(
        (player) => !player.gameName || !player.tagLine,
      )
        ? 30_000
        : false,
  });

  const recentPicks = useQueries({
    queries: (ladder.data ?? []).map((player, index) => ({
      queryKey: ["ladder-recent-picks", player.puuid, "EUW", dataDragonLocale],
      queryFn: async () => {
        // Stagger match-history requests to stay within Riot's burst limits.
        const delay = index * recentRequestSpacingMs;
        if (delay > 0) await new Promise((resolve) => window.setTimeout(resolve, delay));
        return api.mostPlayed(player.puuid, "EUW", dataDragonLocale, {
          matchCount: recentMatchCount,
          top: recentChampionCount,
        });
      },
      retry: false,
    })),
  });

  return (
    <PageTransition className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">{t("home.eyebrow")}</p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.52 }}
          >
            {t("home.title.before")}
            <em>{t("home.title.emphasis")}</em>
            {t("home.title.after")}
          </motion.h1>
          <p className="hero-intro">
            {t("home.intro")}
          </p>
          <PlayerSearch />
          <div className="hero-links">
            <Link to="/champions">
              {t("home.openArchive")} <ArrowIcon />
            </Link>
            <span>{t("home.officialData")}</span>
          </div>
        </div>

        <motion.figure
          className="hero-art"
          initial={{
            opacity: 0,
            clipPath: "polygon(48% 0, 52% 0, 48% 100%, 44% 100%)",
          }}
          animate={{
            opacity: 1,
            clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)",
          }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={heroImage} alt={t("home.heroAlt")} />
          <figcaption>
            <span>CRONORRUPTURA</span>
            <strong>Ekko</strong>
          </figcaption>
        </motion.figure>
      </section>

      <section className="ladder-section" aria-labelledby="ladder-title">
        <header>
          <div>
            <span className="utility-label">{t("home.ladder.eyebrow")}</span>
            <h2 id="ladder-title">{t("home.ladder.title")}</h2>
          </div>
          <span className="live-marker">Riot API</span>
        </header>

        <ol className="ladder-list" aria-busy={ladder.isPending}>
          {ladder.isPending &&
            Array.from({ length: 5 }, (_, index) => (
              <li className={index === 0 ? "ladder-skeleton ladder-leader" : "ladder-skeleton"} key={index} />
            ))}
          {ladder.isError && (
            <li className="ladder-message">{t("home.ladder.error")}</li>
          )}
          {ladder.isSuccess && !ladder.data.length && (
            <li className="ladder-message">{t("home.ladder.empty")}</li>
          )}
          {ladder.data?.map((player, index) => {
            const picks = recentPicks[index];
            const games = player.wins + player.losses;
            const winRate = games ? Math.round((player.wins / games) * 100) : null;
            const hasRiotId = Boolean(player.gameName && player.tagLine);
            const search = new URLSearchParams({
              gameName: player.gameName ?? "",
              tagLine: player.tagLine ?? "",
              region: "EUW",
            });

            return (
              <li className={index === 0 ? "ladder-entry ladder-leader" : "ladder-entry"} key={player.puuid}>
                {index === 0 && (
                  <img className="ladder-crest" src="/api/assets/ranked/challenger.png" alt="" loading="lazy" />
                )}
                <span className="ladder-position">#{index + 1}</span>
                <div className="ladder-player">
                  {player.iconUrl && (
                    <img className="ladder-avatar" src={player.iconUrl} alt="" loading="lazy" />
                  )}
                  <div className="ladder-identity">
                    <strong>{hasRiotId ? player.gameName : t("home.ladder.unknownPlayer")}</strong>
                    {hasRiotId && <small>#{player.tagLine}</small>}
                  </div>
                </div>
                <div className="ladder-picks">
                  <span className={index === 0 ? "ladder-picks-label" : "sr-only"}>
                    {t("home.ladder.recentPicks", { count: recentMatchCount })}
                  </span>
                  <div className="ladder-pick-icons" aria-busy={picks?.isPending}>
                    {picks?.data?.length ? picks.data.map((champion) => (
                      <img
                        key={champion.championId}
                        src={champion.championImageUrl}
                        alt={champion.championName}
                        title={champion.championName}
                        loading="lazy"
                      />
                    )) : (
                      <span
                        className="ladder-picks-status"
                        aria-label={t(picks?.isPending ? "home.ladder.picksLoading" : "home.ladder.picksUnavailable")}
                      >
                        {picks?.isPending ? "…" : "—"}
                      </span>
                    )}
                  </div>
                </div>
                <span className="ladder-points">
                  {player.leaguePoints.toLocaleString(locale)} <small>LP</small>
                </span>
                <span className="ladder-winrate">
                  {winRate === null ? "—" : `${winRate}%`}{" "}
                  <small className="ladder-winrate-label">{t("rank.winRate")}</small>
                </span>
                {hasRiotId && (
                  <Link
                    className="ladder-profile"
                    to={`/account?${search.toString()}`}
                    aria-label={t("home.ladder.profileForPlayer", { player: player.riotIdForDisplay })}
                  >
                    <span>{t("home.ladder.profile")}</span> <ArrowIcon />
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </PageTransition>
  );
}
