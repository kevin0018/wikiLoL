import { regionSchema, type Region } from "@wikilol/contracts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseRiotId } from "../lib/player";
import { useI18n } from "../i18n/I18nProvider";
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
  const { t } = useI18n();
  const [region, setRegion] = useState<Region>("EUW");
  const [riotId, setRiotId] = useState(initialValue);
  const [hasError, setHasError] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseRiotId(riotId, region);
    if (!parsed) {
      setHasError(true);
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
        <span>{t("common.region")}</span>
        <select
          value={region}
          onChange={(event) => setRegion(event.target.value as Region)}
          aria-label={t("common.region")}
        >
          {regions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>

      <label className="search-name">
        <span>{t("common.riotId")}</span>
        <input
          value={riotId}
          onChange={(event) => {
            setRiotId(event.target.value);
            setHasError(false);
          }}
          placeholder={t("search.placeholder")}
          aria-invalid={hasError}
        />
      </label>

      <button type="submit">
        <SearchIcon />
        <span>{t("search.submit")}</span>
      </button>
      {hasError && <p className="field-error">{t("search.invalid")}</p>}
    </form>
  );
}
