import { useI18n } from "../i18n/I18nProvider";

interface ChampionStat {
  championId: number;
  championName: string;
  championImageUrl: string;
  value: string;
}

export function ChampionStatList({
  title,
  label,
  champions,
  emptyMessage,
  variant = "mastery",
}: {
  title: string;
  label: string;
  champions: ChampionStat[];
  emptyMessage?: string;
  variant?: "mastery" | "recent";
}) {
  const { t } = useI18n();
  return (
    <section className={`champion-stat-panel is-${variant}`}>
      <header>
        <span className="utility-label">{label}</span>
        <h2>{title}</h2>
      </header>
      {champions.length ? (
        <ol>
          {champions.map((champion, index) => (
            <li key={champion.championId}>
              <span className="champion-stat-position" aria-hidden="true">{index + 1}</span>
              <img src={champion.championImageUrl} alt="" loading="lazy" />
              <strong>{champion.championName}</strong>
              <small>{champion.value}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p className="panel-empty">{emptyMessage ?? t("stats.empty")}</p>
      )}
    </section>
  );
}
