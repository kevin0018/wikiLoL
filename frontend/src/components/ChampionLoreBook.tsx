import { useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { ChevronIcon, CloseIcon } from "./Icons";

export function ChampionLoreBook({ name, lore, coverUrl }: {
  name: string;
  lore: string;
  coverUrl: string;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(-1);
  const [layout, setLayout] = useState<{ pages: string[]; spread: number }>();
  const [turn, setTurn] = useState<{ previous: number; direction: number } | null>(null);
  const spread = layout?.spread ?? 1;
  const pages = layout?.pages ?? [];
  const first = page < 0 ? -1 : Math.min(
    Math.floor(page / spread) * spread,
    Math.max(0, Math.floor((pages.length - 1) / spread) * spread),
  );

  useEffect(() => {
    const probe = probeRef.current;
    if (!open || !probe) return;
    const measure = () => {
      if (!probe.clientHeight || !probe.clientWidth) return;
      setLayout({
        pages: paginate(lore, probe),
        spread: Number(getComputedStyle(probe).getPropertyValue("--book-spread-size")) || 1,
      });
      setTurn(null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(probe);
    return () => observer.disconnect();
  }, [lore, open]);

  function goTo(next: number) {
    if (!layout || next >= pages.length || next === first) return;
    const target = next < 0 ? -1 : next;
    setTurn(reduceMotion ? null : { previous: first, direction: target > first ? 1 : -1 });
    setPage(target);
    if (target === -1) dialogRef.current?.querySelector<HTMLButtonElement>(".lore-book-close")?.focus();
  }

  const last = Math.min(first + spread, pages.length);
  const range = first < 0 ? "" : t(first + 1 === last ? "champion.bookSinglePage" : "champion.bookPageRange", {
    first: first + 1,
    last,
    total: pages.length,
  });
  const turningPage = turn && turn.previous >= 0
    ? turn.previous + (turn.direction > 0 ? spread - 1 : 0)
    : -1;

  return (
    <div className="champion-archive-lore">
      <button
        type="button"
        className="lore-book-trigger utility-label"
        ref={triggerRef}
        aria-haspopup="dialog"
        onClick={() => {
          setPage(-1);
          setTurn(null);
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        {t("champion.archiveLore")} <ChevronIcon />
      </button>

      <dialog
        className="lore-book"
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        onKeyDown={(event) => {
          if (first < 0 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
          event.preventDefault();
          goTo(first + (event.key === "ArrowLeft" ? -spread : spread));
        }}
      >
        <div className="lore-book-frame">
          <header className="lore-book-header">
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

          <div className="lore-book-stage">
            <div className="lore-book-page lore-book-probe" aria-hidden="true">
              <div ref={probeRef} className="lore-book-print" />
            </div>

            {first < 0 ? (
              <button className="lore-book-cover" type="button" disabled={!layout} onClick={() => {
                goTo(0);
                dialogRef.current?.querySelector<HTMLButtonElement>(".lore-book-close")?.focus();
              }}>
                <BookCover url={coverUrl} />
                <span className="lore-book-open-label">{t("champion.openBook")} <ChevronIcon /></span>
              </button>
            ) : (
              <>
                <div className="lore-book-spread" role="region" aria-label={range}>
                  {Array.from({ length: spread }, (_, index) => (
                    <BookPage text={pages[first + index]} number={first + index + 1} key={index} />
                  ))}
                </div>
                <span className="lore-book-ribbon" aria-hidden="true" />
              </>
            )}

            {turn && (
              <div
                aria-hidden="true"
                className={`lore-book-turn ${turn.previous < 0 || first < 0 ? "is-cover" : ""} ${turn.direction < 0 ? "is-back" : ""}`}
                key={`${turn.previous}:${first}`}
                onAnimationEnd={() => setTurn(null)}
              >
                <div className="lore-book-turn-front">
                  {turn.previous < 0
                    ? <BookCover url={coverUrl} />
                    : <BookPage text={pages[turningPage]} number={turningPage + 1} />}
                </div>
                <div className="lore-book-turn-back">
                  <BookPage text={undefined} number={0} />
                </div>
              </div>
            )}
          </div>

          {first >= 0 && (
            <nav className="lore-book-nav" aria-label={t("champion.archiveLore")}>
              <button type="button" onClick={() => goTo(first - spread)}>
                <ChevronIcon /> {t(first === 0 ? "champion.bookCover" : "champion.bookPrevious")}
              </button>
              <span role="status">{range}</span>
              <button type="button" aria-disabled={first + spread >= pages.length} onClick={() => goTo(first + spread)}>
                {t("champion.bookNext")} <ChevronIcon />
              </button>
            </nav>
          )}
        </div>
      </dialog>
    </div>
  );
}

function BookCover({ url }: { url: string }) {
  return <img src={url} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />;
}

function BookPage({ text, number }: { text: string | undefined; number: number }) {
  return (
    <div className="lore-book-page">
      <div className="lore-book-print">{text}</div>
      {text && <span className="lore-book-folio" aria-hidden="true">{number}</span>}
    </div>
  );
}

function paginate(lore: string, probe: HTMLDivElement): string[] {
  const words = lore.match(/\S+\s*/gu) ?? [];
  const pages: string[] = [];

  for (let start = 0; start < words.length;) {
    let shortest = start + 1;
    let longest = words.length;
    let end = shortest;

    while (shortest <= longest) {
      const candidate = Math.floor((shortest + longest) / 2);
      probe.textContent = words.slice(start, candidate).join("").trimEnd();
      if (probe.scrollHeight <= probe.clientHeight) {
        end = candidate;
        shortest = candidate + 1;
      } else {
        longest = candidate - 1;
      }
    }

    pages.push(words.slice(start, end).join("").trimEnd());
    start = end;
  }

  probe.textContent = "";
  return pages;
}
