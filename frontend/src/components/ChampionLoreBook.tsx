import { useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
  const [turn, setTurn] = useState<{ previous: number; direction: number; closing?: boolean } | null>(null);
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
    if (!layout || turn || next >= pages.length || next === first) return;
    const target = next < 0 ? -1 : next;
    if (!reduceMotion && target < 0) {
      setTurn({ previous: first, direction: -1, closing: true });
      return;
    }
    setTurn(reduceMotion ? null : { previous: first, direction: target > first ? 1 : -1 });
    setPage(target);
  }

  function finishTurn() {
    if (turn?.closing) setPage(-1);
    setTurn(null);
  }

  const last = Math.min(first + spread, pages.length);
  const range = first < 0 ? "" : t(first + 1 === last ? "champion.bookSinglePage" : "champion.bookPageRange", {
    first: first + 1,
    last,
    total: pages.length,
  });
  const board = turn && (turn.previous < 0 || turn.closing);
  const turningPage = turn && !board
    ? turn.previous + (turn.direction > 0 ? spread - 1 : 0)
    : -1;
  const reversePage = turn?.direction === -1 ? last - 1 : first;
  const restingPage = turn && !board && spread > 1
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
        <div className={`lore-book-frame ${first < 0 ? "is-closed" : ""} ${board ? "is-moving-board" : ""} ${turn?.closing ? "is-closing" : ""}`}>
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
                <BookCover name={name} url={coverUrl} openLabel={t("champion.openBook")} />
              </button>
            ) : (
              <>
                <div className="lore-book-spread" role="region" aria-label={range}>
                  {Array.from({ length: spread }, (_, index) => (
                    <BookPage text={pages[first + index]} number={first + index + 1} key={index} />
                  ))}
                </div>
                {first === 0 && !turn && <span className="lore-book-ribbon" aria-hidden="true" />}
              </>
            )}

            {restingPage >= 0 && (
              <div aria-hidden="true" className={`lore-book-resting ${turn?.direction === -1 ? "is-right" : ""}`}>
                <BookPage text={pages[restingPage]} number={restingPage + 1} />
              </div>
            )}

            {board ? (
              <div
                aria-hidden="true"
                className="lore-book-board"
                onAnimationEnd={(event) => {
                  if (event.target === event.currentTarget) finishTurn();
                }}
              >
                <BookCover name={name} url={coverUrl} openLabel={t("champion.openBook")} />
                <div className="lore-book-board-lining" />
              </div>
            ) : turn ? (
              <TurningLeaf
                key={`${turn.previous}:${first}:${spread}`}
                front={{ text: pages[turningPage], number: turningPage + 1 }}
                back={{ text: pages[reversePage], number: reversePage + 1 }}
                reverse={turn.direction < 0}
                onFinish={finishTurn}
              />
            ) : null}
          </div>

          {first >= 0 && (
            <nav className="lore-book-nav" aria-label={t("champion.archiveLore")}>
              <button type="button" ref={previousRef} aria-disabled={!!turn} onClick={() => goTo(first - spread)}>
                <ChevronIcon /> {t(first === 0 ? "champion.bookCover" : "champion.bookPrevious")}
              </button>
              <span role="status">{range}</span>
              <button type="button" ref={nextRef} aria-disabled={!!turn || first + spread >= pages.length} onClick={() => goTo(first + spread)}>
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

function BookCover({ name, url, openLabel }: { name: string; url: string; openLabel: string }) {
  return (
    <>
      <span className="lore-book-binding" aria-hidden="true">
        <span className="lore-book-back-cover" />
        <span className="lore-book-edge is-fore-edge" />
        <span className="lore-book-edge is-tail" />
      </span>
      <span className="lore-book-board-face">
        <span className="lore-book-cover-art" aria-hidden="true">
          <img src={url} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
        </span>
        <span className="lore-book-cover-name">{name}</span>
        <span className="lore-book-open-label">{openLabel} <ChevronIcon /></span>
      </span>
    </>
  );
}

type PageContent = { text: string | undefined; number: number };

function BookPage({ text, number }: PageContent) {
  return (
    <div className="lore-book-page">
      <div className="lore-book-print">{text}</div>
      {text && <span className="lore-book-folio" aria-hidden="true">{number}</span>}
    </div>
  );
}

const leafSections = 16;
const leafDuration = 820;

function TurningLeaf({ front, back, reverse, onFinish }: {
  front: PageContent;
  back: PageContent;
  reverse: boolean;
  onFinish: () => void;
}) {
  const leafRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const leaf = leafRef.current;
    if (!leaf) return;
    const width = leaf.getBoundingClientRect().width;
    const sectionWidth = width / leafSections;
    leaf.style.setProperty("--leaf-width", `${width}px`);
    leaf.style.setProperty("--leaf-section-width", `${sectionWidth}px`);
    const direction = reverse ? -1 : 1;
    const sections = Array.from(leaf.children) as HTMLElement[];
    let frame = 0;
    let start: number | undefined;

    function render(progress: number) {
      const sweep = progress * progress * (3 - 2 * progress);
      const curl = 1.58 * Math.sin(Math.PI * progress);
      let x = 0;
      let depth = 0;

      sections.forEach((section, index) => {
        const across = (index + 0.5) / leafSections;
        const angle = Math.PI * sweep + curl * (across - 0.42);
        const lift = Math.max(0, depth);
        const heightScale = 1 - lift * 0.00035;
        section.style.transform = `translate3d(${direction * x}px, 0, ${lift}px) rotateY(${-direction * angle}rad) scaleY(${heightScale})`;
        section.style.setProperty("--leaf-shade", String(Math.max(0, Math.sin(angle)) * Math.sin(Math.PI * progress) * 0.29));
        x += sectionWidth * Math.cos(angle);
        depth += sectionWidth * Math.sin(angle);
      });
    }

    function tick(now: number) {
      start ??= now;
      const progress = Math.min((now - start) / leafDuration, 1);
      render(progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else onFinish();
    }

    render(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onFinish, reverse]);

  return (
    <div className={`lore-book-leaf ${reverse ? "is-back" : ""}`} ref={leafRef} aria-hidden="true">
      {Array.from({ length: leafSections }, (_, index) => {
        const frontIndex = reverse ? leafSections - index - 1 : index;
        const backIndex = leafSections - frontIndex - 1;
        return (
          <div className="lore-book-leaf-section" key={index}>
            <div className="lore-book-leaf-face">
              <div className="lore-book-leaf-page" style={{ left: `calc(${-frontIndex} * var(--leaf-section-width))` }}><BookPage {...front} /></div>
            </div>
            <div className="lore-book-leaf-face is-back">
              <div className="lore-book-leaf-page" style={{ left: `calc(${-backIndex} * var(--leaf-section-width))` }}><BookPage {...back} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function paginate(lore: string, probe: HTMLDivElement): string[] {
  const words = lore.match(/\S+\s*/gu) ?? [];
  const breaks = [0];
  const pageText = (start: number, end: number) => words.slice(start, end).join("").trimEnd();
  const fits = (start: number, end: number) => {
    probe.textContent = pageText(start, end);
    return probe.scrollHeight <= probe.clientHeight;
  };

  for (let start = 0; start < words.length;) {
    let shortest = start + 1;
    let longest = words.length;
    let end = shortest;

    while (shortest <= longest) {
      const candidate = Math.floor((shortest + longest) / 2);
      if (fits(start, candidate)) {
        end = candidate;
        shortest = candidate + 1;
      } else {
        longest = candidate - 1;
      }
    }

    breaks.push(end);
    start = end;
  }

  if (breaks.length >= 3) {
    const penultimate = breaks.at(-3)!;
    const last = breaks.at(-2)!;
    const end = words.length;
    const precedingWords = last - penultimate;
    const remainingWords = end - last;

    // Rebalance short endings without changing the total page count or overflowing either page.
    if (remainingWords < precedingWords / 3) {
      const middle = penultimate + Math.ceil((end - penultimate) / 2);
      const target = penultimate + Math.ceil((end - penultimate) * 0.62);
      const paragraphs: number[] = [];
      const sentences: number[] = [];
      for (let split = target; split >= middle; split--) {
        const word = words[split - 1]!;
        if (/\n\s*\n/u.test(word)) paragraphs.push(split);
        else if (/[.!?…]['"»”]?\s+$/u.test(word)) sentences.push(split);
      }
      const split = [...paragraphs, ...sentences, target]
        .find((candidate) => fits(penultimate, candidate) && fits(candidate, end));
      if (split !== undefined) breaks[breaks.length - 2] = split;
    }
  }

  probe.textContent = "";
  return breaks.slice(1).map((end, index) => pageText(breaks[index]!, end));
}
