import { useQuery } from "@tanstack/react-query";
import { playerLookupSchema } from "@wikilol/contracts";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";
import { ChampionStatList } from "../components/ChampionStatList";
import { PageTransition } from "../components/PageTransition";
import { PlayerSearch } from "../components/PlayerSearch";
import { RankCard } from "../components/RankCard";
import { ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

export function AccountPage() {
  const [searchParams] = useSearchParams();
  const lookupResult = playerLookupSchema.safeParse({
    gameName: searchParams.get("gameName"),
    tagLine: searchParams.get("tagLine"),
    region: searchParams.get("region"),
  });
  const lookup = lookupResult.success ? lookupResult.data : null;

  const profile = useQuery({
    queryKey: ["profile", lookup],
    queryFn: () => api.profile(lookup!),
    enabled: Boolean(lookup),
  });
  const ranks = useQuery({
    queryKey: ["ranks", profile.data?.puuid, lookup?.region],
    queryFn: () => api.ranks(profile.data!.puuid, lookup!.region),
    enabled: Boolean(profile.data && lookup),
  });
  const mastery = useQuery({
    queryKey: ["mastery", profile.data?.puuid, lookup?.region],
    queryFn: () => api.mastery(profile.data!.puuid, lookup!.region),
    enabled: Boolean(profile.data && lookup),
  });
  const mostPlayed = useQuery({
    queryKey: ["most-played", profile.data?.puuid, lookup?.region],
    queryFn: () => api.mostPlayed(profile.data!.puuid, lookup!.region),
    enabled: Boolean(profile.data && lookup),
  });

  if (!lookup) {
    return (
      <PageTransition className="account-page">
        <section className="missing-profile">
          <p className="eyebrow">PERFIL / NUEVA CONSULTA</p>
          <h1>Busca un jugador para abrir su historial.</h1>
          <PlayerSearch compact />
        </section>
      </PageTransition>
    );
  }

  if (profile.isPending) {
    return (
      <PageTransition className="account-page">
        <LoadingState label={`Buscando a ${lookup.gameName}#${lookup.tagLine}`} />
      </PageTransition>
    );
  }

  if (profile.isError) {
    return (
      <PageTransition className="account-page">
        <ErrorState
          title="No hemos encontrado ese jugador"
          message={profile.error.message}
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

  return (
    <PageTransition className="account-page">
      <section className="profile-header">
        <motion.div
          className="profile-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
        >
          <img src={profile.data.iconUrl} alt="" />
          <span>{profile.data.summonerLevel}</span>
        </motion.div>
        <div>
          <p className="eyebrow">
            PERFIL / {profile.data.region} / NIVEL {profile.data.summonerLevel}
          </p>
          <h1>
            {profile.data.gameName}
            <small>#{profile.data.tagLine}</small>
          </h1>
        </div>
        <button
          className="text-button profile-refresh"
          type="button"
          onClick={() => {
            void profile.refetch();
            void ranks.refetch();
            void mastery.refetch();
            void mostPlayed.refetch();
          }}
        >
          Actualizar datos
        </button>
      </section>

      <div className="account-layout">
        <section className="rank-section">
          <header>
            <div>
              <span className="utility-label">TEMPORADA ACTUAL</span>
              <h2>Clasificación</h2>
            </div>
            {!ranks.isPending && !ranks.isError && visibleRanks.length > 0 && (
              <span className="rank-queue-count">
                {visibleRanks.length}{" "}
                {visibleRanks.length === 1 ? "cola activa" : "colas activas"}
              </span>
            )}
          </header>
          {ranks.isPending ? (
            <LoadingState label="Consultando ligas" />
          ) : ranks.isError ? (
            <ErrorState message={ranks.error.message} />
          ) : visibleRanks.length === 0 ? (
            <div className="rank-empty-state">
              <span className="utility-label">SIN ACTIVIDAD CLASIFICATORIA</span>
              <h3>Sin rango esta temporada</h3>
              <p>
                Este jugador todavía no ha disputado clasificatorias en la
                temporada actual.
              </p>
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

        <aside className="account-side">
          {mastery.isPending ? (
            <LoadingState label="Leyendo maestrías" />
          ) : mastery.isError ? (
            <ErrorState message={mastery.error.message} />
          ) : (
            <ChampionStatList
              label="EXPERIENCIA TOTAL"
              title="Maestrías"
              emptyMessage="Este jugador todavía no tiene maestrías registradas."
              champions={(mastery.data ?? []).map((champion) => ({
                ...champion,
                value: `${champion.masteryPoints.toLocaleString()} pts`,
              }))}
            />
          )}
          {mostPlayed.isPending ? (
            <LoadingState label="Analizando partidas" />
          ) : mostPlayed.isError ? (
            <ErrorState message={mostPlayed.error.message} />
          ) : (
            <ChampionStatList
              label="ÚLTIMAS 20 PARTIDAS"
              title="Más jugados"
              emptyMessage="No hay partidas disponibles en el historial reciente."
              champions={(mostPlayed.data ?? []).map((champion) => ({
                ...champion,
                value: `${champion.gamesPlayed} partidas`,
              }))}
            />
          )}
        </aside>
      </div>
    </PageTransition>
  );
}
