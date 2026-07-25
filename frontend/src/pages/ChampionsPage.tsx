import { useQuery } from "@tanstack/react-query";
import type { ChampionRole } from "@wikilol/contracts";
import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { ChampionCard } from "../components/ChampionCard";
import { FilterIcon, SearchIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

const roles: { value: ChampionRole | "All"; label: string }[] = [
  { value: "All", label: "Todos" },
  { value: "Fighter", label: "Luchadores" },
  { value: "Tank", label: "Tanques" },
  { value: "Mage", label: "Magos" },
  { value: "Assassin", label: "Asesinos" },
  { value: "Marksman", label: "Tiradores" },
  { value: "Support", label: "Soportes" },
];

export function ChampionsPage() {
  const champions = useQuery({
    queryKey: ["champions"],
    queryFn: api.champions,
  });
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<ChampionRole | "All">("All");

  const filteredChampions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return (champions.data?.data ?? []).filter(
      (champion) =>
        (role === "All" || champion.roles.includes(role)) &&
        (!normalizedSearch ||
          champion.name.toLocaleLowerCase("es").includes(normalizedSearch)),
    );
  }, [champions.data, role, search]);

  return (
    <PageTransition className="champions-page">
      <header className="archive-header">
        <div>
          <p className="eyebrow">ARCHIVO / CAMPEONES</p>
          <h1>Conoce a quienes dan forma a la Grieta.</h1>
        </div>
        <p>
          Lore, roles y aspectos de cada campeón, servidos directamente desde
          el archivo de Riot.
        </p>
      </header>

      <section className="filter-bar" aria-label="Filtros de campeones">
        <label className="champion-search">
          <SearchIcon />
          <span className="sr-only">Buscar campeón</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre"
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
              {option.label}
            </button>
          ))}
        </div>
        <span className="result-count">
          {String(filteredChampions.length).padStart(3, "0")} campeones
          {champions.data?.patch ? ` · parche ${champions.data.patch}` : ""}
        </span>
      </section>

      {champions.isPending && <LoadingState label="Abriendo el archivo" />}
      {champions.isError && (
        <ErrorState
          message={champions.error.message}
          retry={() => void champions.refetch()}
        />
      )}
      {champions.isSuccess && (
        <>
          <div className="champion-grid">
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
              <h2>No hay campeones con esos filtros.</h2>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setSearch("");
                  setRole("All");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}
