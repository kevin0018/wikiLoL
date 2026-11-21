import { useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { ChevronIcon } from "./Icons";

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
  const coverRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (open && layout && first < 0) coverRef.current?.focus({ preventScroll: true });
  }, [first, layout, open]);

  function goTo(next: number) {
    if (!layout || next >= pages.length || next === first) return;
    const target = next < 0 ? -1 : next;
    setTurn(reduceMotion || target < 0 ? null : { previous: first, direction: target > first ? 1 : -1 });
    setPage(target);
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
  const reversePage = turn?.direction === -1 ? last - 1 : first;
  const restingPage = turn && turn.previous >= 0 && spread > 1
    ? turn.previous + (turn.direction < 0 ? spread - 1 : 0)
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
        <div className={`lore-book-frame ${first < 0 ? "is-closed" : ""}`}>
          <h2 id={titleId} className="sr-only">{t("champion.archiveLore")} · {name}</h2>
          <div className="lore-book-stage" onClick={(event) => {
            if (first < 0 && event.target === event.currentTarget) dialogRef.current?.close();
          }}>
            <div className="lore-book-page lore-book-probe" aria-hidden="true">
              <div ref={probeRef} className="lore-book-print" />
            </div>

            {first < 0 ? (
              <button className="lore-book-cover" type="button" ref={coverRef} disabled={!layout} onClick={() => {
                goTo(0);
                requestAnimationFrame(() => {
                  const navigation = pages.length > spread ? nextRef : previousRef;
                  navigation.current?.focus({ preventScroll: true });
                });
              }}>
                <BookCover name={name} url={coverUrl} />
                <span className="lore-book-open-label">{t("champion.openBook")} <ChevronIcon /></span>
              </button>
            ) : (
              <>
                <div className="lore-book-spread" role="region" aria-label={range}>
                  {Array.from({ length: spread }, (_, index) => (
                    <BookPage text={pages[first + index]} number={first + index + 1} key={index} />
                  ))}
                </div>
                {first === 0 && <span className="lore-book-ribbon" aria-hidden="true" />}
              </>
            )}

            {restingPage >= 0 && (
              <div aria-hidden="true" className={`lore-book-resting ${turn?.direction === -1 ? "is-right" : ""}`}>
                <BookPage text={pages[restingPage]} number={restingPage + 1} />
              </div>
            )}

            {turn && (
              <div
                aria-hidden="true"
                className={`lore-book-turn ${turn.previous < 0 ? "is-cover" : ""} ${turn.direction < 0 ? "is-back" : ""}`}
                key={`${turn.previous}:${first}`}
                onAnimationEnd={(event) => {
                  if (event.target === event.currentTarget) setTurn(null);
                }}
              >
                <div className="lore-book-turn-front">
                  {turn.previous < 0
                    ? <BookCover name={name} url={coverUrl} />
                    : <BookPage text={pages[turningPage]} number={turningPage + 1} />}
                </div>
                <div className="lore-book-turn-back">
                  <BookPage text={pages[reversePage]} number={reversePage + 1} />
                </div>
              </div>
            )}
          </div>

          {first >= 0 && (
            <nav className="lore-book-nav" aria-label={t("champion.archiveLore")}>
              <button type="button" ref={previousRef} onClick={() => goTo(first - spread)}>
                <ChevronIcon /> {t(first === 0 ? "champion.bookCover" : "champion.bookPrevious")}
              </button>
              <span role="status">{range}</span>
              <button type="button" ref={nextRef} aria-disabled={first + spread >= pages.length} onClick={() => goTo(first + spread)}>
                {t("champion.bookNext")} <ChevronIcon />
              </button>
            </nav>
          )}
          <button type="button" className="lore-book-close" onClick={() => dialogRef.current?.close()}>
            {t("champion.bookClose")}
          </button>
        </div>
      </dialog>
    </div>
  );
}

function BookCover({ name, url }: { name: string; url: string }) {
  return (
    <>
      <span className="lore-book-cover-art" aria-hidden="true">
        <img src={url} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
      </span>
      <span className="lore-book-cover-name">{name}</span>
    </>
  );
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
