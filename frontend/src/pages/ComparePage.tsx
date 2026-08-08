import { useQuery } from "@tanstack/react-query";
import {
  regionSchema,
  type AccountRank,
  type PlayerLookup,
  type Region,
} from "@wikilol/contracts";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { ErrorState, LoadingState } from "../components/States";
import {
  comparisonFromSearchParams,
  comparisonToSearchParams,
  lookupFromComparisonSide,
  type ComparisonDraft,
} from "../lib/compare";
import { api } from "../services/api";

type ComparisonErrors = Record<"left" | "right", string>;

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDraft = useMemo(
    () => comparisonFromSearchParams(searchParams),
    [searchParams],
  );
  const [draft, setDraft] = useState<ComparisonDraft>(initialDraft);
  const [errors, setErrors] = useState<ComparisonErrors>({
    left: "",
    right: "",
  });
  const leftLookup = lookupFromComparisonSide(initialDraft.left);
  const rightLookup = lookupFromComparisonSide(initialDraft.right);
  const hasComparison = Boolean(leftLookup && rightLookup);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ComparisonErrors = { left: "", right: "" };

    if (!lookupFromComparisonSide(draft.left)) {
      nextErrors.left = "Completa el primer Riot ID con el formato Nombre#TAG.";
    }
    if (!lookupFromComparisonSide(draft.right)) {
      nextErrors.right = "Completa el segundo Riot ID con el formato Nombre#TAG.";
    }

    setErrors(nextErrors);
    if (nextErrors.left || nextErrors.right) return;

    setSearchParams(comparisonToSearchParams(draft));
  }

  return (
    <PageTransition className="compare-page">
      <header className="compare-heading">
        <h1>Pon dos perfiles frente a frente.</h1>
        <p>
          Contrasta clasificación, rendimiento y maestrías con datos oficiales
          de Riot. La URL conserva la comparación para que puedas compartirla.
        </p>
      </header>

      <form className="compare-form" onSubmit={submit} noValidate>
        <ComparisonField
          side="left"
          legend="Primer jugador"
          value={draft.left.riotId}
          region={draft.left.region}
          error={errors.left}
          onValueChange={(riotId) => {
            setDraft((current) => ({
              ...current,
              left: { ...current.left, riotId },
            }));
            setErrors((current) => ({ ...current, left: "" }));
          }}
          onRegionChange={(region) =>
            setDraft((current) => ({
              ...current,
              left: { ...current.left, region },
            }))
          }
        />

        <span className="compare-versus" aria-hidden="true">
          VS
        </span>

        <ComparisonField
          side="right"
          legend="Segundo jugador"
          value={draft.right.riotId}
          region={draft.right.region}
          error={errors.right}
          onValueChange={(riotId) => {
            setDraft((current) => ({
              ...current,
              right: { ...current.right, riotId },
            }));
            setErrors((current) => ({ ...current, right: "" }));
          }}
          onRegionChange={(region) =>
            setDraft((current) => ({
              ...current,
              right: { ...current.right, region },
            }))
          }
        />

        <button className="compare-submit" type="submit">
          Comparar perfiles <ArrowIcon />
        </button>
      </form>

      {hasComparison ? (
        <section className="comparison-stage" aria-live="polite">
          <PlayerDossier side="left" lookup={leftLookup!} />
          <PlayerDossier side="right" lookup={rightLookup!} />
        </section>
      ) : (
        <section className="comparison-empty">
          <strong>La comparación empieza con dos Riot IDs.</strong>
          <p>
            Puedes combinar regiones distintas. Cada expediente se consulta de
            forma independiente y muestra su estado sin bloquear al contrario.
          </p>
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
  error: string;
  onValueChange: (value: string) => void;
  onRegionChange: (region: Region) => void;
}) {
  const errorId = `${side}-comparison-error`;

  return (
    <fieldset className="comparison-fieldset">
      <legend>{legend}</legend>
      <div className="comparison-controls">
        <label>
          <span>Riot ID</span>
          <input
            value={value}
            placeholder="Nombre#TAG"
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            onChange={(event) => onValueChange(event.target.value)}
          />
        </label>
        <label>
          <span>Región</span>
          <select
            value={region}
            onChange={(event) => onRegionChange(event.target.value as Region)}
          >
            {regionSchema.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <span className="comparison-helper" id={errorId}>
        {error || "Incluye el identificador que aparece después de #."}
      </span>
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
    queryKey: ["compare-mastery", profile.data?.puuid, lookup.region],
    queryFn: () => api.mastery(profile.data!.puuid, lookup.region),
    enabled: Boolean(profile.data),
  });

  if (profile.isPending) {
    return (
      <div className={`comparison-dossier is-${side}`}>
        <LoadingState label={`Buscando a ${lookup.gameName}`} />
      </div>
    );
  }

  if (profile.isError) {
    return (
      <div className={`comparison-dossier is-${side}`}>
        <ErrorState
          title={`No encontramos a ${lookup.gameName}`}
          message={profile.error.message}
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
            #{profile.data.tagLine} · {profile.data.region} · nivel{" "}
            {profile.data.summonerLevel.toLocaleString("es-ES")}
          </p>
        </div>
      </header>

      <dl className="dossier-rank">
        <div>
          <dt>Clasificación</dt>
          <dd>
            {ranks.isPending
              ? "Consultando…"
              : ranks.isError
                ? "No disponible"
              : primaryRank
                ? `${titleCase(primaryRank.tier)} ${primaryRank.rank}`
                : "Sin rango"}
          </dd>
        </div>
        <div>
          <dt>Puntos de liga</dt>
          <dd>{primaryRank ? `${primaryRank.leaguePoints} LP` : "—"}</dd>
        </div>
        <div>
          <dt>Rendimiento</dt>
          <dd>{primaryRank ? `${winRate}% · ${games} partidas` : "—"}</dd>
        </div>
      </dl>

      <section className="dossier-mastery">
        <h3>Maestrías principales</h3>
        {mastery.isPending ? (
          <p className="dossier-status">Consultando maestrías…</p>
        ) : mastery.isError ? (
          <p className="dossier-status is-error">{mastery.error.message}</p>
        ) : mastery.data?.length ? (
          <ol>
            {mastery.data.slice(0, 3).map((champion, index) => (
              <li key={champion.championId}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <img src={champion.championImageUrl} alt="" loading="lazy" />
                <strong>{champion.championName}</strong>
                <small>
                  {champion.masteryPoints.toLocaleString("es-ES")} pts
                </small>
              </li>
            ))}
          </ol>
        ) : (
          <p className="dossier-status">No hay maestrías disponibles.</p>
        )}
      </section>

      <Link className="dossier-link" to={`/account?${profileSearch.toString()}`}>
        Abrir perfil completo <ArrowIcon />
      </Link>
    </article>
  );
}

function selectPrimaryRank(ranks: AccountRank[]): AccountRank | undefined {
  return (
    ranks.find((rank) => rank.queueType === "RANKED_SOLO_5x5") ?? ranks[0]
  );
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLocaleLowerCase("es");
}
