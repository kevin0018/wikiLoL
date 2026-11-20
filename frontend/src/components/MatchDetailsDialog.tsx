import { useQuery } from "@tanstack/react-query";
import type { RecentMatch } from "@wikilol/contracts";
import { useEffect, useId, useRef } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../services/api";
import { CloseIcon } from "./Icons";
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
  const { dataDragonLocale, locale, t } = useI18n();
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

  const formatNumber = new Intl.NumberFormat(locale);
  const teams = details.data?.teams ?? [];
  const maxDamage = Math.max(1, ...teams.flatMap((team) => team.players.map((player) => player.damage ?? 0)));

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
          <button type="button" autoFocus aria-label={t("account.closeScoreboard")} onClick={dismiss}>
            <CloseIcon />
          </button>
        </header>

        {details.isPending ? (
          <LoadingState label={t("account.loadingMatches")} />
        ) : details.isError ? (
          <ErrorState retry={() => void details.refetch()} />
        ) : teams.length ? (
          <>
            <p className="scoreboard-scroll-hint">{t("account.scoreboardScroll")}</p>
            <div className="scoreboard-scroll" tabIndex={0} role="region" aria-label={t("account.scoreboard")}>
              <table className="scoreboard-table" aria-labelledby={titleId}>
                <colgroup>
                  <col className="scoreboard-player-column" />
                  <col className="scoreboard-kda-column" />
                  <col className="scoreboard-damage-column" />
                  <col className="scoreboard-gold-column" />
                  <col className="scoreboard-farm-column" />
                  <col className="scoreboard-items-column" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">{t("account.scoreboardPlayer")}</th>
                    <th scope="col">{t("account.kda")}</th>
                    <th scope="col">{t("account.damage")}</th>
                    <th scope="col">{t("account.gold")}</th>
                    <th scope="col">{t("account.farm")}</th>
                    <th scope="col">{t("account.items")}</th>
                  </tr>
                </thead>
                {teams.map((team) => (
                  <tbody className={`scoreboard-team${team.win ? " is-win" : ""}`} key={team.teamId}>
                    <tr className="scoreboard-team-heading">
                      <th scope="rowgroup" colSpan={6}>
                        <div>
                          <strong>
                            {team.teamId === 100 ? t("account.teamBlue") : team.teamId === 200
                              ? t("account.teamRed") : t("account.teamNumber", { number: team.teamId })}
                          </strong>
                          <span>{t("account.teamKills", { count: team.kills })}</span>
                          <span className="scoreboard-outcome">{t(team.win ? "account.matchWin" : "account.matchLoss")}</span>
                        </div>
                      </th>
                    </tr>
                    {team.players.map((player, index) => {
                      const isProfile = player.playerName.toLowerCase() === playerName.toLowerCase()
                        && player.tagLine.toLowerCase() === tagLine.toLowerCase();

                      return (
                        <tr className={isProfile ? "is-profile-player" : undefined} key={index}>
                          <th scope="row">
                            <span className="scoreboard-player">
                              {player.championImageUrl && <img src={player.championImageUrl} alt="" />}
                              <span>
                                <strong>{player.playerName}</strong>
                                <small>{player.championName}</small>
                              </span>
                            </span>
                          </th>
                          <td className="scoreboard-kda">
                            {player.kills}<span>/</span>{player.deaths}<span>/</span>{player.assists}
                          </td>
                          <td>
                            {player.damage === null ? "—" : formatNumber.format(player.damage)}
                            {player.damage !== null && (
                              <span className="scoreboard-damage" aria-hidden="true">
                                <span style={{ width: `${(player.damage / maxDamage) * 100}%` }} />
                              </span>
                            )}
                          </td>
                          <td>{player.gold === null ? "—" : formatNumber.format(player.gold)}</td>
                          <td>{player.farm === null ? "—" : formatNumber.format(player.farm)}</td>
                          <td>
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                ))}
              </table>
            </div>
          </>
        ) : (
          <p className="panel-empty">{t("account.noScoreboard")}</p>
        )}
      </div>
    </dialog>
  );
}
