import { useQuery } from "@tanstack/react-query";
import type { ChampionRole } from "@wikilol/contracts";
import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { ChampionCard } from "../components/ChampionCard";
import { FilterIcon, SearchIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";
import { useI18n, type TranslationKey } from "../i18n/I18nProvider";

const roles: { value: ChampionRole | "All"; label: TranslationKey }[] = [
  { value: "All", label: "common.role.all" },
  { value: "Fighter", label: "common.role.Fighter" },
  { value: "Tank", label: "common.role.Tank" },
  { value: "Mage", label: "common.role.Mage" },
  { value: "Assassin", label: "common.role.Assassin" },
  { value: "Marksman", label: "common.role.Marksman" },
  { value: "Support", label: "common.role.Support" },
];

type ChampionEra = "current" | "classic";

export function ChampionsPage() {
  const { dataDragonLocale, locale, t } = useI18n();
  const champions = useQuery({
    queryKey: ["champions", dataDragonLocale],
    queryFn: () => api.champions(dataDragonLocale),
  });
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<ChampionRole | "All">("All");
  const [era, setEra] = useState<ChampionEra>("current");

  const filteredChampions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase(locale);
    const catalog =
      era === "classic" ? champions.data?.classic : champions.data?.data;

    return (catalog ?? []).filter(
      (champion) =>
        (role === "All" || champion.roles.includes(role)) &&
        (!normalizedSearch ||
          champion.name.toLocaleLowerCase(locale).includes(normalizedSearch)),
    );
  }, [champions.data, era, locale, role, search]);

  return (
    <PageTransition className="champions-page">
      <header className="archive-header">
        <div>
          <p className="eyebrow">{t("champions.eyebrow")}</p>
          <h1>{t("champions.title")}</h1>
        </div>
        <p>{t("champions.intro")}</p>
      </header>

      <div
        className="era-switcher"
        role="tablist"
        aria-label={t("champions.eraLabel")}
      >
        <button
          type="button"
          id="current-champions-tab"
          role="tab"
          aria-selected={era === "current"}
          aria-controls="champion-catalog"
          className={era === "current" ? "is-active" : ""}
          onClick={() => setEra("current")}
        >
          <span>{t("champions.current")}</span>
          <small>{champions.data?.data.length ?? "—"}</small>
        </button>
        <button
          type="button"
          id="classic-champions-tab"
          role="tab"
          aria-selected={era === "classic"}
          aria-controls="champion-catalog"
          className={era === "classic" ? "is-active is-classic" : "is-classic"}
          onClick={() => setEra("classic")}
        >
          <span>{t("champions.classic")}</span>
          <small>{champions.data?.classic.length ?? "—"}</small>
        </button>
        <p aria-live="polite">
          {era === "current"
            ? t("champions.currentDescription")
            : t("champions.classicDescription")}
        </p>
      </div>

      <section className="filter-bar" aria-label={t("champions.filters")}>
        <label className="champion-search">
          <SearchIcon />
          <span className="sr-only">{t("champions.search")}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("champions.searchPlaceholder")}
          />
        </label>
        <div className="role-filters">
          <FilterIcon />
          {roles.map((option) => (
            <button
              key={option.value}
              type="button"
              className={role === option.value ? "is-active" : ""}
              onClick={() => setRole(option.value)}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
        <span className="result-count">
          {t("champions.count", {
            count: String(filteredChampions.length).padStart(3, "0"),
          })}
          {champions.data?.patch
            ? ` · ${t("champions.patch", { patch: champions.data.patch })}`
            : ""}
        </span>
      </section>

      {champions.isPending && (
        <LoadingState label={t("champions.loading")} />
      )}
      {champions.isError && (
        <ErrorState
          retry={() => void champions.refetch()}
        />
      )}
      {champions.isSuccess && (
        <>
          <div
            className={`champion-grid ${era === "classic" ? "is-classic" : ""}`}
            id="champion-catalog"
            role="tabpanel"
            aria-labelledby={`${era}-champions-tab`}
          >
            <AnimatePresence mode="popLayout">
              {filteredChampions.map((champion, index) => (
                <ChampionCard
                  champion={champion}
                  index={index}
                  key={champion.id}
                />
              ))}
            </AnimatePresence>
          </div>
          {filteredChampions.length === 0 && (
            <div className="empty-state">
              <h2>{t("champions.empty")}</h2>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setSearch("");
                  setRole("All");
                }}
              >
                {t("champions.clear")}
              </button>
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}
