import type { ChampionSkin } from "@wikilol/contracts";
import { useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { ChevronIcon, CloseIcon, DownloadIcon, ExpandIcon } from "./Icons";

interface GalleryProps {
  championId: string;
  championName: string;
  skins: ChampionSkin[];
}

export function SkinGallery({ championId, championName, skins }: GalleryProps) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const expandRef = useRef<HTMLButtonElement>(null);
  const activeIndex = Math.min(index, skins.length - 1);
  const activeSkin = skins[activeIndex];
  if (!activeSkin) return null;

  function move(direction: number) {
    setIndex((current) => (Math.min(current, skins.length - 1) + direction + skins.length) % skins.length);
  }

  function navigate(event: KeyboardEvent) {
    if (skins.length < 2 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }

  return (
    <section className="skins-section" aria-label={t("champion.skins")} onKeyDown={navigate}>
      <header className="skin-gallery-heading">
        <div aria-live="polite">
          <span className="utility-label">{t("champion.skins")}</span>
          <h2>{activeSkin.name}</h2>
        </div>
        <button
          className="skin-expand"
          type="button"
          ref={expandRef}
          aria-label={t("champion.expand", { skin: activeSkin.name })}
          onClick={() => setViewerOpen(true)}
        >
          <ExpandIcon />
          <span>{t("champion.expandShort")}</span>
        </button>
      </header>

      <div className="skin-gallery-frame">
        <div className="skin-stage">
          <SkinArtwork key={activeSkin.imageUrl} skin={activeSkin} championName={championName} />
        </div>
        <div className="skin-gallery-controls">
          <SkinNavigation index={activeIndex} total={skins.length} move={move} />
        </div>
        {skins.length > 1 && <SkinFilmstrip skins={skins} index={activeIndex} select={setIndex} />}
      </div>

      {viewerOpen && (
        <SkinViewer
          championId={championId}
          championName={championName}
          skins={skins}
          index={activeIndex}
          select={setIndex}
          move={move}
          onClose={() => {
            setViewerOpen(false);
            expandRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </section>
  );
}

function SkinViewer({ championId, championName, skins, index, select, move, onClose }: GalleryProps & {
  index: number;
  select: (index: number) => void;
  move: (direction: number) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loadedAsset, setLoadedAsset] = useState<{ imageUrl: string; downloadUrl: string | null }>();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function dismiss() {
    dialogRef.current?.close();
    onClose();
  }

  const skin = skins[index];
  if (!skin) return null;
  const downloadUrl = loadedAsset?.imageUrl === skin.imageUrl ? loadedAsset.downloadUrl : skin.imageUrl;

  return (
    <dialog
      ref={dialogRef}
      className="skin-viewer"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className="skin-viewer-content">
        <header className="skin-viewer-bar">
          <div>
            <span className="utility-label">{championName}</span>
            <h2 id={titleId} aria-live="polite">{skin.name}</h2>
          </div>
          {downloadUrl === null ? (
            <button className="skin-viewer-action" type="button" aria-label={t("champion.download")} disabled>
              <DownloadIcon />
              <span>{t("champion.download")}</span>
            </button>
          ) : (
            <a
              className="skin-viewer-action"
              href={downloadUrl}
              download={`${championId}-${skin.num}.jpg`}
              aria-label={t("champion.download")}
            >
              <DownloadIcon />
              <span>{t("champion.download")}</span>
            </a>
          )}
          <button
            className="skin-viewer-action"
            type="button"
            ref={closeRef}
            aria-label={t("champion.close")}
            onClick={dismiss}
          >
            <CloseIcon />
            <span>{t("champion.close")}</span>
          </button>
        </header>
        <div className="skin-viewer-stage">
          <SkinArtwork
            key={skin.imageUrl}
            skin={skin}
            championName={championName}
            onSourceChange={(downloadUrl) => setLoadedAsset({ imageUrl: skin.imageUrl, downloadUrl })}
          />
        </div>
        <div className="skin-gallery-controls">
          <SkinNavigation index={index} total={skins.length} move={move} />
        </div>
        {skins.length > 1 && <SkinFilmstrip skins={skins} index={index} select={select} viewer />}
      </div>
    </dialog>
  );
}

function SkinNavigation({ index, total, move }: { index: number; total: number; move: (direction: number) => void }) {
  const { t } = useI18n();
  if (total < 2) return null;
  return (
    <>
      <button className="skin-prev" type="button" aria-label={t("champion.previous")} onClick={() => move(-1)}>
        <ChevronIcon />
      </button>
      <span className="skin-position">
        <span className="sr-only">{t("champion.skinPosition", { current: index + 1, total })}</span>
        <strong aria-hidden="true">{String(index + 1).padStart(2, "0")}</strong>
        <span aria-hidden="true">/</span>
        <span aria-hidden="true">{String(total).padStart(2, "0")}</span>
      </span>
      <button className="skin-next" type="button" aria-label={t("champion.next")} onClick={() => move(1)}>
        <ChevronIcon />
      </button>
    </>
  );
}

function SkinArtwork({ skin, championName, onSourceChange }: {
  skin: ChampionSkin;
  championName: string;
  onSourceChange?: (source: string | null) => void;
}) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const source = attempt ? `${skin.imageUrl}?retry=${attempt}` : skin.imageUrl;

  if (failed) {
    return (
      <div className="skin-artwork-error">
        <p role="status">{t("champion.skinUnavailable")}</p>
        <button type="button" className="skin-viewer-action" onClick={() => {
          setAttempt((next) => next + 1);
          setFailed(false);
        }}>{t("common.retry")}</button>
      </div>
    );
  }

  return (
    <img
      className="skin-artwork"
      src={source}
      alt={t("champion.skinAlt", { skin: skin.name, champion: championName })}
      onLoad={() => onSourceChange?.(source)}
      onError={() => {
        setFailed(true);
        onSourceChange?.(null);
      }}
    />
  );
}

function SkinFilmstrip({ skins, index, select, viewer = false }: {
  skins: ChampionSkin[];
  index: number;
  select: (index: number) => void;
  viewer?: boolean;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const stripRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const active = activeRef.current;
    if (!strip || !active) return;

    const reveal = (behavior: ScrollBehavior) => {
      const rail = strip.getBoundingClientRect();
      const thumbnail = active.getBoundingClientRect();
      if (thumbnail.left >= rail.left && thumbnail.right <= rail.right) return;
      strip.scrollBy({
        left: (thumbnail.left + thumbnail.right - rail.left - rail.right) / 2,
        behavior,
      });
    };

    let width = strip.clientWidth;
    const observer = new ResizeObserver(() => {
      if (width === strip.clientWidth) return;
      width = strip.clientWidth;
      reveal("instant");
    });
    observer.observe(strip);

    const frame = requestAnimationFrame(() => reveal(reduceMotion ? "instant" : "smooth"));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [index, reduceMotion]);

  return (
    <div
      className="skin-strip"
      ref={stripRef}
      role="group"
      aria-label={t(viewer ? "champion.viewerSelect" : "champion.select")}
    >
      {skins.map((skin, position) => (
        <button
          className="skin-thumbnail"
          key={skin.num}
          ref={position === index ? activeRef : undefined}
          type="button"
          aria-current={position === index ? "true" : undefined}
          aria-label={skin.name}
          onClick={() => select(position)}
        >
          <span className="skin-thumbnail-art">
            <img src={skin.imageUrl} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />
          </span>
          <span>{skin.name}</span>
        </button>
      ))}
    </div>
  );
}
