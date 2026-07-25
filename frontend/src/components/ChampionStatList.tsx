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
  emptyMessage = "Todavía no hay datos suficientes.",
}: {
  title: string;
  label: string;
  champions: ChampionStat[];
  emptyMessage?: string;
}) {
  return (
    <section className="champion-stat-panel">
      <header>
        <span className="utility-label">{label}</span>
        <h2>{title}</h2>
      </header>
      {champions.length ? (
        <ol>
          {champions.map((champion, index) => (
            <li key={champion.championId}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <img src={champion.championImageUrl} alt="" loading="lazy" />
              <strong>{champion.championName}</strong>
              <small>{champion.value}</small>
            </li>
          ))}
        </ol>
      ) : (
        <p className="panel-empty">{emptyMessage}</p>
      )}
    </section>
  );
}
