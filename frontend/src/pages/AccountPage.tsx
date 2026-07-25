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
    queryKey: ["ranks", profile.data?.summonerId, lookup?.region],
    queryFn: () => api.ranks(profile.data!.summonerId, lookup!.region),
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
            <span className="utility-label">TEMPORADA ACTUAL</span>
            <h2>Clasificación</h2>
          </header>
          {ranks.isPending ? (
            <LoadingState label="Consultando ligas" />
          ) : ranks.isError ? (
            <ErrorState message={ranks.error.message} />
          ) : (
            <div className="rank-grid">
              <RankCard rank={soloRank} queueType="RANKED_SOLO_5x5" />
              <RankCard rank={flexRank} queueType="RANKED_FLEX_SR" />
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
