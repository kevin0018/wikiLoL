import { useQuery } from "@tanstack/react-query";
import {
  type AccountRank,
  type PlayerLookup,
  type Region,
} from "@wikilol/contracts";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { RegionSelect } from "../components/RegionSelect";
import { ErrorState, LoadingState } from "../components/States";
import {
  comparisonFromSearchParams,
  comparisonToSearchParams,
  lookupFromComparisonSide,
  type ComparisonDraft,
} from "../lib/compare";
import { api, ApiError } from "../services/api";
import { useI18n } from "../i18n/I18nProvider";

type ComparisonErrors = Record<"left" | "right", boolean>;

export function ComparePage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDraft = useMemo(
    () => comparisonFromSearchParams(searchParams),
    [searchParams],
  );
  const [draft, setDraft] = useState<ComparisonDraft>(initialDraft);
  const [errors, setErrors] = useState<ComparisonErrors>({
    left: false,
    right: false,
  });
  const leftLookup = lookupFromComparisonSide(initialDraft.left);
  const rightLookup = lookupFromComparisonSide(initialDraft.right);

  useEffect(() => {
    setDraft(initialDraft);
    setErrors({ left: false, right: false });
  }, [initialDraft]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ComparisonErrors = { left: false, right: false };

    if (!lookupFromComparisonSide(draft.left)) {
      nextErrors.left = true;
    }
    if (!lookupFromComparisonSide(draft.right)) {
      nextErrors.right = true;
    }

    setErrors(nextErrors);
    if (nextErrors.left || nextErrors.right) return;

    setSearchParams(comparisonToSearchParams(draft));
  }

  return (
    <PageTransition className="compare-page">
      <header className="compare-heading">
        <h1>{t("compare.title")}</h1>
        <p>{t("compare.intro")}</p>
      </header>

      <form className="compare-form" onSubmit={submit} noValidate>
        <ComparisonField
          side="left"
          legend={t("compare.first")}
          value={draft.left.riotId}
          region={draft.left.region}
          error={errors.left}
          onValueChange={(riotId) => {
            setDraft((current) => ({
              ...current,
              left: { ...current.left, riotId },
            }));
            setErrors((current) => ({ ...current, left: false }));
          }}
          onRegionChange={(region) =>
            setDraft((current) => ({
              ...current,
              left: { ...current.left, region },
            }))
          }
        />

        <ComparisonField
          side="right"
          legend={t("compare.second")}
          value={draft.right.riotId}
          region={draft.right.region}
          error={errors.right}
          onValueChange={(riotId) => {
            setDraft((current) => ({
              ...current,
              right: { ...current.right, riotId },
            }));
            setErrors((current) => ({ ...current, right: false }));
          }}
          onRegionChange={(region) =>
            setDraft((current) => ({
              ...current,
              right: { ...current.right, region },
            }))
          }
        />

        <button className="compare-submit" type="submit">
          {t("compare.submit")} <ArrowIcon />
        </button>
      </form>

      {leftLookup && rightLookup ? (
        <section className="comparison-stage" aria-live="polite">
          <PlayerDossier side="left" lookup={leftLookup} />
          <PlayerDossier side="right" lookup={rightLookup} />
        </section>
      ) : (
        <section className="comparison-empty">
          <strong>{t("compare.emptyTitle")}</strong>
        </section>
      )}
    </PageTransition>
  );
}

function ComparisonField({
  side,
  legend,
  value,
  region,
  error,
  onValueChange,
  onRegionChange,
}: {
  side: "left" | "right";
  legend: string;
  value: string;
  region: Region;
  error: boolean;
  onValueChange: (value: string) => void;
  onRegionChange: (region: Region) => void;
}) {
  const { t } = useI18n();
  const errorId = `${side}-comparison-error`;

  return (
    <fieldset className="comparison-fieldset">
      <legend>{legend}</legend>
      <div className="comparison-controls">
        <label>
          <span>{t("common.riotId")}</span>
          <input
            value={value}
            placeholder={t("search.placeholder")}
            aria-invalid={error}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => onValueChange(event.target.value)}
          />
        </label>
        <RegionSelect label={t("common.region")} value={region} onChange={onRegionChange} />
      </div>
      {error && (
        <p className="comparison-helper" id={errorId}>
          {t(side === "left" ? "compare.firstError" : "compare.secondError")}
        </p>
      )}
    </fieldset>
  );
}

function PlayerDossier({
  side,
  lookup,
}: {
  side: "left" | "right";
  lookup: PlayerLookup;
}) {
  const { dataDragonLocale, locale, t } = useI18n();
  const profile = useQuery({
    queryKey: ["compare-profile", lookup],
    queryFn: () => api.profile(lookup),
  });
  const ranks = useQuery({
    queryKey: ["compare-ranks", profile.data?.puuid, lookup.region],
    queryFn: () => api.ranks(profile.data!.puuid, lookup.region),
    enabled: Boolean(profile.data),
  });
  const mastery = useQuery({
    queryKey: [
      "compare-mastery",
      profile.data?.puuid,
      lookup.region,
      dataDragonLocale,
    ],
    queryFn: () =>
      api.mastery(profile.data!.puuid, lookup.region, dataDragonLocale),
    enabled: Boolean(profile.data),
  });

  if (profile.isPending) {
    return (
      <div className={`comparison-dossier is-${side}`}>
        <LoadingState
          label={t("compare.loading", { name: lookup.gameName })}
        />
      </div>
    );
  }

  if (profile.isError) {
    const notFound =
      profile.error instanceof ApiError && profile.error.status === 404;
    return (
      <div className={`comparison-dossier is-${side}`}>
        <ErrorState
          title={
            notFound
              ? t("compare.notFound", { name: lookup.gameName })
              : t("account.lookupUnavailable")
          }
          retry={() => void profile.refetch()}
        />
      </div>
    );
  }

  const primaryRank = selectPrimaryRank(ranks.data ?? []);
  const games = primaryRank ? primaryRank.wins + primaryRank.losses : 0;
  const winRate =
    primaryRank && games > 0 ? Math.round((primaryRank.wins / games) * 100) : 0;
  const profileSearch = new URLSearchParams({
    gameName: profile.data.gameName,
    tagLine: profile.data.tagLine,
    region: profile.data.region,
  });

  return (
    <article className={`comparison-dossier is-${side}`}>
      <header className="dossier-identity">
        <img src={profile.data.iconUrl} alt="" />
        <div>
          <h2>{profile.data.gameName}</h2>
          <p>
            #{profile.data.tagLine} · {profile.data.region} · {t("common.level")}{" "}
            {profile.data.summonerLevel.toLocaleString(locale)}
          </p>
        </div>
      </header>

      <dl className="dossier-rank">
        <div className="dossier-tier">
          <dt>{t("compare.ranking")}</dt>
          <dd>
            {primaryRank && <img src={primaryRank.rankIconUrl} alt="" />}
            {ranks.isPending
              ? t("compare.checking")
              : ranks.isError
                ? t("compare.unavailable")
                : primaryRank
                  ? `${titleCase(primaryRank.tier, locale)} ${primaryRank.rank}`
                  : t("compare.unranked")}
          </dd>
        </div>
        <div>
          <dt>{t("compare.leaguePoints")}</dt>
          <dd>{primaryRank ? `${primaryRank.leaguePoints.toLocaleString(locale)} LP` : "—"}</dd>
        </div>
        <div>
          <dt>{t("rank.winRate")}</dt>
          <dd>{primaryRank && games > 0 ? `${winRate}%` : "—"}</dd>
          {primaryRank && games > 0 && (
            <dd className="dossier-games">
              <meter aria-hidden="true" min={0} max={100} value={winRate} />
              {games.toLocaleString(locale)} {t("common.games")}
            </dd>
          )}
        </div>
      </dl>

      <section className="dossier-mastery">
        <h3>{t("compare.topMasteries")}</h3>
        {mastery.isPending ? (
          <p className="dossier-status">{t("compare.loadingMasteries")}</p>
        ) : mastery.isError ? (
          <p className="dossier-status is-error">
            {t("common.error.message")}
          </p>
        ) : mastery.data?.length ? (
          <ol>
            {mastery.data.slice(0, 3).map((champion) => (
              <li key={champion.championId}>
                <img src={champion.championImageUrl} alt="" loading="lazy" />
                <strong>{champion.championName}</strong>
                <small>
                  {champion.masteryPoints.toLocaleString(locale)}{" "}
                  {t("common.points")}
                </small>
              </li>
            ))}
          </ol>
        ) : (
          <p className="dossier-status">{t("compare.noMasteries")}</p>
        )}
      </section>

      <Link className="dossier-link" to={`/account?${profileSearch.toString()}`}>
        {t("compare.openProfile")} <ArrowIcon />
      </Link>
    </article>
  );
}

function selectPrimaryRank(ranks: AccountRank[]): AccountRank | undefined {
  return (
    ranks.find((rank) => rank.queueType === "RANKED_SOLO_5x5") ?? ranks[0]
  );
}

function titleCase(value: string, locale: string): string {
  return value.charAt(0) + value.slice(1).toLocaleLowerCase(locale);
}
