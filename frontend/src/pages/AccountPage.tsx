import { useQuery } from "@tanstack/react-query";
import { playerLookupSchema } from "@wikilol/contracts";
import { useSearchParams } from "react-router-dom";
import { ChampionStatList } from "../components/ChampionStatList";
import { RefreshIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { PlayerSearch } from "../components/PlayerSearch";
import { RankCard } from "../components/RankCard";
import { RecentMatchHistory } from "../components/RecentMatchHistory";
import { ErrorState, LoadingState } from "../components/States";
import { api, ApiError } from "../services/api";
import { championSplashUrl } from "../lib/championAssets";
import { playerQueryKeys } from "../lib/playerQueryKeys";
import { useI18n } from "../i18n/I18nProvider";

export function AccountPage() {
  const { dataDragonLocale, locale, t } = useI18n();
  const [searchParams] = useSearchParams();
  const lookupResult = playerLookupSchema.safeParse({
    gameName: searchParams.get("gameName"),
    tagLine: searchParams.get("tagLine"),
    region: searchParams.get("region"),
  });
  const lookup = lookupResult.success ? lookupResult.data : null;

  const profile = useQuery({
    queryKey: playerQueryKeys.profile(lookup),
    queryFn: () => api.profile(lookup!),
    enabled: Boolean(lookup),
  });
  const ranks = useQuery({
    queryKey: playerQueryKeys.ranks(profile.data?.puuid, lookup?.region),
    queryFn: () => api.ranks(profile.data!.puuid, lookup!.region),
    enabled: Boolean(profile.data && lookup),
  });
  const mastery = useQuery({
    queryKey: playerQueryKeys.mastery(profile.data?.puuid, lookup?.region, dataDragonLocale),
    queryFn: () =>
      api.mastery(profile.data!.puuid, lookup!.region, dataDragonLocale),
    enabled: Boolean(profile.data && lookup),
  });
  const activity = useQuery({
    queryKey: [
      "account-activity",
      profile.data?.puuid,
      lookup?.region,
      dataDragonLocale,
    ],
    queryFn: () =>
      api.activity(profile.data!.puuid, lookup!.region, dataDragonLocale),
    enabled: Boolean(profile.data && lookup),
  });

  if (!lookup) {
    return (
      <PageTransition className="account-page">
        <section className="missing-profile">
          <p className="eyebrow">{t("account.new.eyebrow")}</p>
          <h1>{t("account.new.title")}</h1>
          <PlayerSearch compact />
        </section>
      </PageTransition>
    );
  }

  if (profile.isPending) {
    return (
      <PageTransition className="account-page">
        <LoadingState
          label={t("account.loading", {
            name: `${lookup.gameName}#${lookup.tagLine}`,
          })}
        />
      </PageTransition>
    );
  }

  if (profile.isError) {
    const notFound =
      profile.error instanceof ApiError && profile.error.status === 404;
    return (
      <PageTransition className="account-page">
        <ErrorState
          title={t(notFound ? "account.notFound" : "account.lookupUnavailable")}
          retry={() => void profile.refetch()}
        />
        <div className="retry-search">
          <PlayerSearch
            compact
            initialValue={`${lookup.gameName}#${lookup.tagLine}`}
          />
        </div>
      </PageTransition>
    );
  }

  const soloRank = ranks.data?.find(
    (rank) => rank.queueType === "RANKED_SOLO_5x5",
  );
  const flexRank = ranks.data?.find(
    (rank) => rank.queueType === "RANKED_FLEX_SR",
  );
  const visibleRanks = [
    soloRank && { rank: soloRank, queueType: "RANKED_SOLO_5x5" },
    flexRank && { rank: flexRank, queueType: "RANKED_FLEX_SR" },
  ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const splashUrl = championSplashUrl(mastery.data?.[0]?.championImageUrl);
  const refreshing = profile.isFetching || ranks.isFetching || mastery.isFetching || activity.isFetching;

  return (
    <PageTransition className="account-page">
      <header className="profile-header">
        {splashUrl && (
          <img
            key={splashUrl}
            className="profile-splash"
            src={splashUrl}
            alt=""
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        )}
        <div className="profile-identity">
          <img className="profile-icon" src={profile.data.iconUrl} alt="" />
          <div>
            <p className="profile-meta">
              {profile.data.region} · {t("common.level")} {profile.data.summonerLevel.toLocaleString(locale)}
            </p>
            <h1>{profile.data.gameName}</h1>
            <p className="profile-tag">#{profile.data.tagLine}</p>
          </div>
        </div>
        <div className="profile-actions">
          <button
            className="profile-refresh"
            type="button"
            disabled={refreshing}
            aria-busy={refreshing}
            onClick={() => {
              void profile.refetch();
              void ranks.refetch();
              void mastery.refetch();
              void activity.refetch();
            }}
          >
            <RefreshIcon />
            {t("account.refresh")}
          </button>
        </div>
      </header>

      <div className="account-layout">
        <RecentMatchHistory
          key={JSON.stringify([profile.data.puuid, profile.data.region, dataDragonLocale])}
          puuid={profile.data.puuid}
          nextStart={activity.data?.nextStart ?? null}
          matches={activity.data?.matches ?? []}
          region={profile.data.region}
          playerName={profile.data.gameName}
          tagLine={profile.data.tagLine}
          loading={activity.isPending}
          error={activity.isError}
          retry={() => void activity.refetch()}
        />
        <aside className="account-side">
          <section className="rank-section">
            <header>
              <div>
                <span className="utility-label">{t("account.season")}</span>
                <h2>{t("account.ranking")}</h2>
              </div>
            </header>
            {ranks.isPending ? (
              <LoadingState label={t("account.loadingRanks")} />
            ) : ranks.isError ? (
              <ErrorState retry={() => void ranks.refetch()} />
            ) : visibleRanks.length === 0 ? (
              <div className="rank-empty-state">
                <span className="utility-label">
                  {t("account.unrankedEyebrow")}
                </span>
                <h3>{t("account.unranked")}</h3>
                <p>{t("account.unrankedDescription")}</p>
              </div>
            ) : (
              <div className="rank-grid">
                {visibleRanks.map(({ rank, queueType }) => (
                  <RankCard
                    key={queueType}
                    rank={rank}
                    queueType={queueType}
                  />
                ))}
              </div>
            )}
          </section>
          <div className="account-activity-panel">
            {activity.isPending ? (
              <LoadingState label={t("account.loadingMatches")} />
            ) : (
              <ChampionStatList
                label={t("account.matchesEyebrow")}
                title={t("account.mostPlayed")}
                emptyMessage={t(activity.isError ? "common.error.message" : "account.matchesEmpty")}
                champions={(activity.data?.mostPlayed ?? []).map((champion) => ({
                  ...champion,
                  value: `${champion.gamesPlayed.toLocaleString(locale)} ${t("common.games")}`,
                }))}
              />
            )}
          </div>
          <div className="account-mastery-panel">
            {mastery.isPending ? (
              <LoadingState label={t("account.loadingMastery")} />
            ) : mastery.isError ? (
              <ErrorState retry={() => void mastery.refetch()} />
            ) : (
              <ChampionStatList
                label={t("account.masteryEyebrow")}
                title={t("account.masteries")}
                emptyMessage={t("account.masteriesEmpty")}
                champions={(mastery.data ?? []).map((champion) => ({
                  ...champion,
                  value: `${champion.masteryPoints.toLocaleString(locale)} ${t("common.points")}`,
                }))}
              />
            )}
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}
