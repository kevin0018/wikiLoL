import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ArrowIcon } from "../components/Icons";
import { SkinGallery } from "../components/SkinGallery";
import { PageTransition } from "../components/PageTransition";
import { ErrorState, LoadingState } from "../components/States";
import { useI18n, type TranslationKey } from "../i18n/I18nProvider";
import { api } from "../services/api";

export function ChampionPage() {
  const { dataDragonLocale, t } = useI18n();
  const { championId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cameFromChampionArchive =
    typeof location.state === "object" &&
    location.state !== null &&
    "fromChampionArchive" in location.state &&
    location.state.fromChampionArchive === true;
  const champion = useQuery({
    queryKey: ["champion", championId, dataDragonLocale],
    queryFn: () => api.champion(championId, dataDragonLocale),
    enabled: Boolean(championId),
  });
  if (champion.isPending) {
    return (
      <PageTransition className="champion-page">
        <LoadingState label={t("champion.loading")} />
      </PageTransition>
    );
  }

  if (champion.isError) {
    return (
      <PageTransition className="champion-page">
        <ErrorState
          title={t("champion.error")}
          retry={() => void champion.refetch()}
        />
      </PageTransition>
    );
  }

  const data = champion.data;

  return (
    <PageTransition className="champion-page">
      <Link
        className="back-link"
        to="/champions"
        onClick={(event) => {
          if (cameFromChampionArchive) {
            event.preventDefault();
            navigate(-1);
          }
        }}
      >
        <ArrowIcon /> {t("champion.back")}
      </Link>

      <div className="champion-detail-layout">
        <section className="champion-profile">
          <motion.div
            className="champion-emblem"
            initial={{ scale: 0.78, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            <img
              src={data.imageUrl}
              alt={t("champion.portraitAlt", { name: data.name })}
            />
          </motion.div>
          <div className="champion-heading">
            <p className="eyebrow">
              {data.roles
                .map((role) =>
                  t(`common.role.${role}` as TranslationKey),
                )
                .join(" / ")}
            </p>
            <h1>{data.name}</h1>
            <h2>{data.title}</h2>
          </div>
          <div className="champion-lore">
            <span className="utility-label">{t("champion.lore")}</span>
            <p>{data.lore}</p>
          </div>
        </section>

        <SkinGallery key={data.id} championId={data.id} championName={data.name} skins={data.skins} />
      </div>
    </PageTransition>
  );
}
