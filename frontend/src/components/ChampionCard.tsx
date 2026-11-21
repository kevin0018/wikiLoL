import type { ChampionSummary } from "@wikilol/contracts";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowIcon } from "./Icons";
import { useI18n, type TranslationKey } from "../i18n/I18nProvider";

export function ChampionCard({
  champion,
  index,
  classic = false,
}: {
  champion: ChampionSummary;
  index: number;
  classic?: boolean;
}) {
  const { t } = useI18n();
  const roles = champion.roles
    .map((role) => t(`common.role.${role}` as TranslationKey))
    .join(" / ");
  return (
    <motion.article
      layout
      className={classic ? "classic-champion-card" : "champion-card"}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index, 12) * 0.025, duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Link
        to={`/champions/${champion.id}`}
        state={{ fromChampionArchive: true }}
        aria-label={t("champion.card.view", { name: champion.name })}
      >
        {classic ? (
          <>
            <div className="champion-portrait">
              <img src={champion.imageUrl} alt="" loading="lazy" />
            </div>
            <div className="classic-champion-copy">
              <h2>{champion.name}</h2>
              <span>{champion.title}</span>
              <span className="champion-role">{roles}</span>
            </div>
            <ArrowIcon className="classic-champion-arrow" />
          </>
        ) : (
          <>
            <div className="champion-card-head">
              <div className="champion-portrait">
                <img src={champion.imageUrl} alt="" loading="lazy" />
              </div>
              <div className="champion-card-identity">
                <small>{t("champion.card.class")}</small>
                <span className="champion-role">{roles}</span>
              </div>
            </div>
            <div className="champion-card-copy">
              <small>{champion.title}</small>
              <h2>{champion.name}</h2>
              <p>{champion.lore}</p>
              <span className="card-action">
                {t("champion.card.open")} <ArrowIcon />
              </span>
            </div>
          </>
        )}
      </Link>
    </motion.article>
  );
}
