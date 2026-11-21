import { useId, useRef } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { ChevronIcon, CloseIcon } from "./Icons";

export function ChampionLoreBook({ name, lore, coverUrl }: {
  name: string;
  lore: string;
  coverUrl: string | undefined;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="champion-archive-lore">
      <button
        type="button"
        className="lore-book-trigger utility-label"
        ref={triggerRef}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        {t("champion.archiveLore")} <ChevronIcon />
      </button>

      <dialog
        className="lore-book"
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => triggerRef.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="lore-book-spread">
          <div className="lore-book-cover" aria-hidden="true">
            {coverUrl && (
              <img
                src={coverUrl}
                alt=""
                loading="lazy"
                onError={(event) => { event.currentTarget.hidden = true; }}
              />
            )}
          </div>

          <div className="lore-book-page">
            <header>
              <div>
                <span>{t("champion.archiveLore")}</span>
                <h2 id={titleId}>{name}</h2>
              </div>
              <button
                type="button"
                className="lore-book-close"
                aria-label={t("champion.close")}
                onClick={() => dialogRef.current?.close()}
              >
                <CloseIcon />
              </button>
            </header>
            <div className="lore-book-text" tabIndex={0} role="region" aria-label={t("champion.archiveLore")}>
              {lore.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
