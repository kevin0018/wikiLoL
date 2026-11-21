import { useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import archiveCover from "../assets/images/classic-book-cover.webp";
import { useI18n } from "../i18n/I18nProvider";
import { ChevronIcon } from "./Icons";

export function ChampionLoreBook({ name, lore, illustrationUrl }: {
  name: string;
  lore: string;
  illustrationUrl: string;
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
  const probeTitleRef = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(-1);
  const [layout, setLayout] = useState<{ pages: string[]; spread: number }>();
  const [turn, setTurn] = useState<{ previous: number; direction: number; closing?: boolean } | null>(null);
  const [introLeaves, setIntroLeaves] = useState(0);
  const searching = introLeaves > 0;
  const opening = turn?.previous === -1;
  const busy = Boolean(turn) || searching;
  const showChapter = !opening && introLeaves < 2;
  const history = (["launch", "worlds", "runes", "rift"] as const).map((entry): PageContent => ({
    title: t(`champion.bookHistory.${entry}.title`),
    text: t(`champion.bookHistory.${entry}.text`),
    number: 0,
  }));
  const introSpread = searching ? 2 : 0;
  const spread = layout?.spread ?? 1;
  const pages = layout?.pages ?? [];
  const total = pages.length + 1;
  const first = page < 0 ? -1 : Math.min(
    Math.floor(page / spread) * spread,
    Math.floor((total - 1) / spread) * spread,
  );

  useEffect(() => {
    const probe = probeRef.current;
    const heading = probeTitleRef.current;
    const copy = probe?.parentElement;
    if (!open || !probe || !heading || !copy) return;
    const measure = () => {
      if (!probe.clientHeight || !probe.clientWidth) return;
      setLayout({
        pages: paginate(lore, probe, heading),
        spread: Number(getComputedStyle(probe).getPropertyValue("--book-spread-size")) || 1,
      });
      setTurn(null);
      setIntroLeaves(0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(copy);
    return () => observer.disconnect();
  }, [lore, name, open]);

  useEffect(() => {
    if (open && layout && first < 0) coverRef.current?.focus({ preventScroll: true });
  }, [first, layout, open]);

  function goTo(next: number) {
    if (!layout || busy || next >= total || next === first) return;
    const target = next < 0 ? -1 : next;
    if (!reduceMotion && target < 0) {
      setTurn({ previous: first, direction: -1, closing: true });
      return;
    }
    setTurn(reduceMotion ? null : { previous: first, direction: target > first ? 1 : -1 });
    setPage(target);
  }

  function finishTurn() {
    if (searching) {
      setIntroLeaves((remaining) => remaining - 1);
      return;
    }
    if (turn?.closing) setPage(-1);
    if (turn?.previous === -1 && !reduceMotion) setIntroLeaves(2);
    setTurn(null);
  }

  function getPage(index: number): PageContent {
    const content = { text: pages[index], number: index + 1 };
    if (index === pages.length) return { ...content, illustration: { url: illustrationUrl, name } };
    if (index === 0) return { ...content, title: name, bookmark: true };
    return content;
  }

  const last = Math.min(first + spread, total);
  const range = first < 0 ? "" : t(first + 1 === last ? "champion.bookSinglePage" : "champion.bookPageRange", {
    first: first + 1,
    last,
    total,
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
          setTurn(null);
          setIntroLeaves(0);
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
              <div className="lore-book-copy">
                <h3 ref={probeTitleRef} className="lore-book-page-title">{name}</h3>
                <div ref={probeRef} className="lore-book-print" />
              </div>
            </div>

            {first < 0 ? (
              <button className="lore-book-cover" type="button" ref={coverRef} disabled={!layout} onClick={() => {
                goTo(0);
                requestAnimationFrame(() => {
                  const navigation = total > spread ? nextRef : previousRef;
                  navigation.current?.focus({ preventScroll: true });
                });
              }}>
                <BookCover name={name} openLabel={t("champion.openBook")} />
              </button>
            ) : (
              <div className="lore-book-spread" role="region" aria-label={range} aria-busy={busy || undefined}>
                {Array.from({ length: spread }, (_, index) => (
                  <BookStack
                    key={index}
                    page={showChapter ? getPage(first + index) : history[introSpread + index]!}
                    right={index === 1}
                  />
                ))}
              </div>
            )}

            {board && spread > 1 && <BookStack page={showChapter ? getPage(1) : history[1]!} right moving />}

            {(restingPage >= 0 || (searching && spread > 1)) && (
              <div aria-hidden="true" className={`lore-book-resting ${turn?.direction === -1 ? "is-right" : ""}`}>
                <BookPage {...(searching ? history[introLeaves === 2 ? 0 : 2]! : getPage(restingPage))} />
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
                <BookCover name={name} openLabel={t("champion.openBook")} />
                <div className="lore-book-board-lining">
                  {spread > 1 && <BookPage {...(showChapter ? getPage(0) : history[0]!)} />}
                </div>
              </div>
            ) : busy ? (
              <TurningLeaf
                key={searching ? `intro:${introLeaves}` : `${turn?.previous}:${first}:${spread}`}
                front={searching ? history[(introLeaves === 2 ? 0 : 2) + spread - 1]! : getPage(turningPage)}
                back={introLeaves === 2 ? history[2]! : getPage(reversePage)}
                reverse={turn?.direction === -1}
                speed={searching ? 3 : 1}
                onFinish={finishTurn}
              />
            ) : null}
          </div>

          {first >= 0 && (
            <nav className="lore-book-nav" aria-label={t("champion.archiveLore")}>
              <button type="button" ref={previousRef} aria-disabled={busy} onClick={() => goTo(first - spread)}>
                <ChevronIcon /> {t(first === 0 ? "champion.bookCover" : "champion.bookPrevious")}
              </button>
              <span role="status">{opening || searching ? "" : range}</span>
              <button type="button" ref={nextRef} aria-disabled={busy || first + spread >= total} onClick={() => goTo(first + spread)}>
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

function BookCover({ name, openLabel }: { name: string; openLabel: string }) {
  return (
    <>
      <span className="lore-book-binding" aria-hidden="true">
        <span className="lore-book-back-cover" />
        <span className="lore-book-edge is-fore-edge" />
        <span className="lore-book-edge is-tail" />
      </span>
      <span className="lore-book-board-face">
        <span className="lore-book-cover-art" aria-hidden="true">
          <img src={archiveCover} alt="" />
        </span>
        <span className="lore-book-cover-name">{name}</span>
        <span className="lore-book-open-label">{openLabel} <ChevronIcon /></span>
      </span>
    </>
  );
}

type PageContent = {
  text: string | undefined;
  number: number;
  title?: string;
  bookmark?: boolean;
  illustration?: { url: string; name: string };
};

function BookStack({ page, right, moving = false }: {
  page: PageContent;
  right: boolean;
  moving?: boolean;
}) {
  return (
    <div className={`lore-book-stack ${right ? "is-right" : ""} ${moving ? "is-moving" : ""}`} aria-hidden={moving || undefined}>
      <BookPage {...page} />
    </div>
  );
}

function BookPage({ text, number, title, bookmark, illustration }: PageContent) {
  return (
    <div className="lore-book-page">
      {illustration ? (
        <figure className="lore-book-plate">
          <img src={illustration.url} alt={illustration.name} decoding="async" />
        </figure>
      ) : (
        <div className="lore-book-copy">
          {title && <h3 className="lore-book-page-title">{title}</h3>}
          <div className="lore-book-print">{text}</div>
        </div>
      )}
      {bookmark && <span className="lore-book-ribbon" aria-hidden="true" />}
      {number > 0 && (text || illustration) && <span className="lore-book-folio" aria-hidden="true">{number}</span>}
    </div>
  );
}

const leafSections = 16;
const leafDuration = 820;

function TurningLeaf({ front, back, reverse, speed, onFinish }: {
  front: PageContent;
  back: PageContent;
  reverse: boolean;
  speed: number;
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
      const progress = Math.min(((now - start) * speed) / leafDuration, 1);
      render(progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else onFinish();
    }

    render(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onFinish, reverse, speed]);

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

function paginate(lore: string, probe: HTMLDivElement, heading: HTMLHeadingElement): string[] {
  const words = lore.match(/\S+\s*/gu) ?? [];
  const breaks = [0];
  const pageText = (start: number, end: number) => words.slice(start, end).join("").trimEnd();
  const fits = (start: number, end: number) => {
    heading.hidden = start !== 0;
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
  heading.hidden = false;
  return breaks.slice(1).map((end, index) => pageText(breaks[index]!, end));
}
