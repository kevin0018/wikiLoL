import { useId, useRef } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { ChevronIcon, CloseIcon } from "./Icons";

export function ChampionLoreBook({ name, lore, portraitUrl }: {
  name: string;
  lore: string;
  portraitUrl: string;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pages = splitLore(lore);

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
        <div className="lore-book-frame">
          <header className="lore-book-header">
            <img src={portraitUrl} alt="" loading="lazy" />
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

          <div className="lore-book-reading-area">
            <div className="lore-book-text" tabIndex={0} role="region" aria-label={t("champion.archiveLore")}>
              <div className="lore-book-spread">
                {pages.map((page, index) => (
                  <div className="lore-book-page" key={index}>
                    {page.split(/\n{2,}/).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                    <span className="lore-book-folio" aria-hidden="true">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="lore-book-ribbon" aria-hidden="true" />
          </div>
        </div>
      </dialog>
    </div>
  );
}

function splitLore(lore: string): string[] {
  const midpoint = lore.length / 2;
  const paragraphBreaks = [...lore.matchAll(/\n{2,}/g)]
    .map((match) => match.index)
    .filter((index) => Math.abs(index - midpoint) <= lore.length * 0.16);
  const sentenceBreaks = [...lore.matchAll(/[.!?…][»”"]?(?=\s)/g)]
    .map((match) => match.index + match[0].length);
  const wordBreaks = [...lore.matchAll(/\s+/g)].map((match) => match.index);
  const breaks = paragraphBreaks.length ? paragraphBreaks : sentenceBreaks.length ? sentenceBreaks : wordBreaks;
  const boundary = breaks.reduce(
    (closest, index) => closest === 0 || Math.abs(index - midpoint) < Math.abs(closest - midpoint) ? index : closest,
    0,
  );

  return boundary === 0 ? [lore] : [lore.slice(0, boundary).trim(), lore.slice(boundary).trim()];
}
