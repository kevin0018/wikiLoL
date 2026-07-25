import { regionSchema, type Region } from "@wikilol/contracts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseRiotId } from "../lib/player";
import { SearchIcon } from "./Icons";

const regions = regionSchema.options;

export function PlayerSearch({
  initialValue = "",
  compact = false,
}: {
  initialValue?: string;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const [region, setRegion] = useState<Region>("EUW");
  const [riotId, setRiotId] = useState(initialValue);
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseRiotId(riotId, region);
    if (!parsed) {
      setError("Escribe un Riot ID como Nombre#TAG.");
      return;
    }

    const search = new URLSearchParams({
      ...parsed,
      region,
    });
    navigate(`/account?${search.toString()}`);
  }

  return (
    <form
      className={compact ? "player-search is-compact" : "player-search"}
      onSubmit={submit}
      noValidate
    >
      <label className="search-region">
        <span>Región</span>
        <select
          value={region}
          onChange={(event) => setRegion(event.target.value as Region)}
          aria-label="Región"
        >
          {regions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>

      <label className="search-name">
        <span>Riot ID</span>
        <input
          value={riotId}
          onChange={(event) => {
            setRiotId(event.target.value);
            setError("");
          }}
          placeholder="Nombre#TAG"
          aria-invalid={Boolean(error)}
        />
      </label>

      <button type="submit">
        <SearchIcon />
        <span>Buscar jugador</span>
      </button>
      {error && <p className="field-error">{error}</p>}
    </form>
  );
}
