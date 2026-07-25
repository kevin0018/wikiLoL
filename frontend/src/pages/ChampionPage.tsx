import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowIcon, ChevronIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

export function ChampionPage() {
  const { championId = "" } = useParams();
  const champion = useQuery({
    queryKey: ["champion", championId],
    queryFn: () => api.champion(championId),
    enabled: Boolean(championId),
  });
  const [skinIndex, setSkinIndex] = useState(0);

  useEffect(() => setSkinIndex(0), [championId]);

  if (champion.isPending) {
    return (
      <PageTransition className="champion-page">
        <LoadingState label="Consultando el expediente" />
      </PageTransition>
    );
  }

  if (champion.isError) {
    return (
      <PageTransition className="champion-page">
        <ErrorState
          title="Ese expediente no está disponible"
          message={champion.error.message}
          retry={() => void champion.refetch()}
        />
      </PageTransition>
    );
  }

  const data = champion.data;
  const activeSkin = data.skins[skinIndex];

  return (
    <PageTransition className="champion-page">
      <Link className="back-link" to="/champions">
        <ArrowIcon /> Volver al archivo
      </Link>

      <section className="champion-profile">
        <motion.div
          className="champion-emblem"
          initial={{ scale: 0.78, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        >
          <img src={data.imageUrl} alt={`Retrato de ${data.name}`} />
        </motion.div>
        <div className="champion-heading">
          <p className="eyebrow">{data.roles.join(" / ")}</p>
          <h1>{data.name}</h1>
          <h2>{data.title}</h2>
        </div>
        <div className="champion-lore">
          <span className="utility-label">LORE</span>
          <p>{data.lore}</p>
        </div>
      </section>

      {activeSkin && (
        <section className="skins-section">
          <header>
            <div>
              <span className="utility-label">GALERÍA DE ASPECTOS</span>
              <h2>{activeSkin.name}</h2>
            </div>
            <span>
              {String(skinIndex + 1).padStart(2, "0")} /{" "}
              {String(data.skins.length).padStart(2, "0")}
            </span>
          </header>

          <div className="skin-stage">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeSkin.imageUrl}
                src={activeSkin.imageUrl}
                alt={`${activeSkin.name} de ${data.name}`}
                initial={{ opacity: 0, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            </AnimatePresence>
            {data.skins.length > 1 && (
              <>
                <button
                  type="button"
                  className="skin-prev"
                  aria-label="Aspecto anterior"
                  onClick={() =>
                    setSkinIndex(
                      (current) =>
                        (current - 1 + data.skins.length) % data.skins.length,
                    )
                  }
                >
                  <ChevronIcon />
                </button>
                <button
                  type="button"
                  className="skin-next"
                  aria-label="Aspecto siguiente"
                  onClick={() =>
                    setSkinIndex(
                      (current) => (current + 1) % data.skins.length,
                    )
                  }
                >
                  <ChevronIcon />
                </button>
              </>
            )}
          </div>

          <div className="skin-strip" aria-label="Seleccionar aspecto">
            {data.skins.map((skin, index) => (
              <button
                type="button"
                key={`${skin.num}-${skin.name}`}
                className={index === skinIndex ? "is-active" : ""}
                onClick={() => setSkinIndex(index)}
                aria-label={skin.name}
                aria-current={index === skinIndex}
              >
                <img src={skin.imageUrl} alt="" loading="lazy" />
                <span>{skin.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  );
}
