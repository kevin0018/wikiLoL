import type { ChampionSummary } from "@wikilol/contracts";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowIcon } from "./Icons";

export function ChampionCard({
  champion,
  index,
}: {
  champion: ChampionSummary;
  index: number;
}) {
  return (
    <motion.article
      layout
      className="champion-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index, 12) * 0.025, duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Link
        to={`/champions/${champion.id}`}
        state={{ fromChampionArchive: true }}
        aria-label={`Ver a ${champion.name}`}
      >
        <div className="champion-card-head">
          <div className="champion-portrait">
            <img src={champion.imageUrl} alt="" loading="lazy" />
          </div>
          <div className="champion-card-identity">
            <small>Clase</small>
            <span className="champion-role">
              {champion.roles.join(" / ")}
            </span>
          </div>
        </div>
        <div className="champion-card-copy">
          <small>{champion.title}</small>
          <h2>{champion.name}</h2>
          <p>{champion.lore}</p>
          <span className="card-action">
            Abrir expediente <ArrowIcon />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
