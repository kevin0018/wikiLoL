import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import heroImage from "../assets/images/hero.jpg";
import { ArrowIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { PlayerSearch } from "../components/PlayerSearch";
import { api } from "../services/api";

export function HomePage() {
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

  return (
    <PageTransition className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">RUNATERRA / ARCHIVO COMPETITIVO</p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.52 }}
          >
            Todo jugador deja una <em>huella</em> en la Grieta.
          </motion.h1>
          <p className="hero-intro">
            Consulta rangos, maestrías y campeones recientes desde un único
            perfil.
          </p>
          <PlayerSearch />
          <div className="hero-links">
            <Link to="/champions">
              Abrir archivo de campeones <ArrowIcon />
            </Link>
            <span>Datos oficiales · Actualización dinámica</span>
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
          <img src={heroImage} alt="Ekko en una escena de energía temporal" />
          <figcaption>
            <span>CRONORRUPTURA</span>
            <strong>Ekko</strong>
          </figcaption>
        </motion.figure>
      </section>

      <section className="ladder-section">
        <header>
          <div>
            <span className="utility-label">CLASIFICATORIA SOLO/DÚO · EUW</span>
            <h2>La cima del servidor</h2>
          </div>
          <span className="live-marker">Riot API</span>
        </header>

        <ol className="ladder-list">
          {ladder.isPending &&
            Array.from({ length: 5 }, (_, index) => (
              <li className="ladder-skeleton" key={index} />
            ))}
          {ladder.isError && (
            <li className="ladder-message">
              El ranking necesita una API key de Riot activa.
            </li>
          )}
          {ladder.data?.map((player, index) => {
            const winRate =
              player.wins + player.losses > 0
                ? Math.round(
                    (player.wins / (player.wins + player.losses)) * 100,
                  )
                : 0;
            const search = new URLSearchParams({
              gameName: player.gameName ?? "",
              tagLine: player.tagLine ?? "",
              region: "EUW",
            });

            return (
              <motion.li
                key={player.puuid}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <span className="ladder-position">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>{player.riotIdForDisplay}</strong>
                  <small>{player.leaguePoints.toLocaleString()} LP</small>
                </div>
                <span className="ladder-winrate">{winRate}% WR</span>
                {player.gameName && player.tagLine ? (
                  <Link to={`/account?${search.toString()}`}>
                    Ver perfil <ArrowIcon />
                  </Link>
                ) : (
                  <span />
                )}
              </motion.li>
            );
          })}
        </ol>
      </section>
    </PageTransition>
  );
}
