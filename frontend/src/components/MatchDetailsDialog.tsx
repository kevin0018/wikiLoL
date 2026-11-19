import { useQuery } from "@tanstack/react-query";
import type { RecentMatch } from "@wikilol/contracts";
import { useEffect, useId, useRef } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../services/api";
import { ErrorState, LoadingState } from "./States";

export function MatchDetailsDialog({
  match,
  region,
  playerName,
  tagLine,
  queue,
  duration,
  onDismiss,
}: {
  match: RecentMatch;
  region: string;
  playerName: string;
  tagLine: string;
  queue: string;
  duration: string;
  onDismiss: () => void;
}) {
  const { dataDragonLocale, t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const details = useQuery({
    queryKey: ["match-details", match.matchId, region, dataDragonLocale],
    queryFn: () => api.matchDetails(match.matchId, region, dataDragonLocale),
    retry: false,
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  function dismiss() {
    dialogRef.current?.close();
    onDismiss();
  }

  return (
    <dialog
      className="match-dialog"
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="match-dialog-content">
        <header className="match-dialog-header">
          <div>
            <h2 id={titleId}>{t("account.scoreboard")}</h2>
            <p>{[queue, duration].filter(Boolean).join(" · ")}</p>
          </div>
          <button type="button" autoFocus aria-label={t("account.closeScoreboard")} onClick={dismiss}>×</button>
        </header>

        {details.isPending ? (
          <LoadingState label={t("account.loadingMatches")} />
        ) : details.isError ? (
          <ErrorState retry={() => void details.refetch()} />
        ) : details.data.teams.length ? (
          <div className="scoreboard-teams">
            {details.data.teams.map((team) => (
              <section className={`scoreboard-team ${team.win ? "is-win" : "is-loss"}`} key={team.teamId}>
                <header>
                  <h3>
                    {team.teamId === 100 ? t("account.teamBlue") : team.teamId === 200
                      ? t("account.teamRed") : t("account.teamNumber", { number: team.teamId })}
                  </h3>
                  <span>{t(team.win ? "account.matchWin" : "account.matchLoss")}</span>
                  <strong>{t("account.teamKills", { count: team.kills })}</strong>
                </header>
                <ul>
                  {team.players.map((player, index) => {
                    const isProfile = player.playerName.toLowerCase() === playerName.toLowerCase()
                      && player.tagLine.toLowerCase() === tagLine.toLowerCase();
                    return (
                      <li className={isProfile ? "is-profile-player" : undefined} key={index}>
                        <div className="scoreboard-player">
                          {player.championImageUrl && <img src={player.championImageUrl} alt="" />}
                          <span>
                            <strong>{player.playerName}</strong>
                            <small>{player.championName}</small>
                          </span>
                        </div>
                        <span className="scoreboard-kda">{player.kills} / {player.deaths} / {player.assists}</span>
                        <div className="scoreboard-items" role="group" aria-label={t("account.items")}>
                          {player.items.map((item, slot) => (
                            <span className="scoreboard-item" key={slot} tabIndex={item ? 0 : undefined}>
                              {item && (
                                <>
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    onError={(event) => {
                                      event.currentTarget.hidden = true;
                                    }}
                                  />
                                  <span className="scoreboard-item-label" aria-hidden="true">{item.name}</span>
                                </>
                              )}
                            </span>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="panel-empty">{t("account.noScoreboard")}</p>
        )}
      </div>
    </dialog>
  );
}
