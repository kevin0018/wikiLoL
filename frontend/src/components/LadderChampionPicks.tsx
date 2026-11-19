import type { MostPlayedChampion } from "@wikilol/contracts";
import { useState } from "react";
import { useI18n } from "../i18n/I18nProvider";

export function LadderChampionPicks({
  champions,
  loading,
}: {
  champions: MostPlayedChampion[] | null | undefined;
  loading: boolean;
}) {
  const { t } = useI18n();
  const [settled, setSettled] = useState<Record<number, "loaded" | "failed">>({});
  const busy = loading || (champions?.some(({ championId }) => !settled[championId]) ?? false);

  return (
    <div className="ladder-pick-icons" aria-busy={busy}>
      {busy && (
        <>
          <span className="sr-only">{t("home.ladder.picksLoading")}</span>
          {Array.from({ length: 3 }, (_, index) => (
            <span className="ladder-pick-skeleton" key={index} aria-hidden="true" />
          ))}
        </>
      )}
      {champions?.length ? (
        <div className="ladder-pick-portraits" aria-hidden={busy ? true : undefined}>
          {champions.map((champion) => {
            const { championId, championImageUrl, championName } = champion;

            return settled[championId] === "failed" ? (
              <span className="ladder-pick-missing" key={championId} role="img" aria-label={championName}>
                —
              </span>
            ) : (
              <img
                key={championId}
                src={championImageUrl}
                alt={championName}
                title={championName}
                onLoad={() => setSettled((current) => ({ ...current, [championId]: "loaded" }))}
                onError={() => setSettled((current) => ({ ...current, [championId]: "failed" }))}
              />
            );
          })}
        </div>
      ) : !busy && (
        <span className="ladder-picks-status" aria-label={t("home.ladder.picksUnavailable")}>—</span>
      )}
    </div>
  );
}
