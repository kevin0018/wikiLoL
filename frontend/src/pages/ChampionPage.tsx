import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowIcon,
  ChevronIcon,
  CloseIcon,
  DownloadIcon,
  ExpandIcon,
} from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

export function ChampionPage() {
  const { championId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cameFromChampionArchive =
    typeof location.state === "object" &&
    location.state !== null &&
    "fromChampionArchive" in location.state &&
    location.state.fromChampionArchive === true;
  const champion = useQuery({
    queryKey: ["champion", championId],
    queryFn: () => api.champion(championId),
    enabled: Boolean(championId),
  });
  const [skinIndex, setSkinIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const skinStripRef = useRef<HTMLDivElement>(null);
  const viewerStripRef = useRef<HTMLDivElement>(null);
  const viewerCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSkinIndex(0);
    setIsViewerOpen(false);
  }, [championId]);

  useEffect(() => {
    if (!isViewerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsViewerOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    viewerCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isViewerOpen]);

  useEffect(() => {
    const strips = [skinStripRef.current, viewerStripRef.current].filter(
      (strip): strip is HTMLDivElement => Boolean(strip),
    );
    const listeners = strips.map((strip) => {
      const captureWheel = (event: WheelEvent) => {
        event.preventDefault();
        event.stopPropagation();
        strip.scrollLeft += event.deltaX + event.deltaY;
      };
      strip.addEventListener("wheel", captureWheel, { passive: false });
      return () => strip.removeEventListener("wheel", captureWheel);
    });

    return () => listeners.forEach((removeListener) => removeListener());
  }, [champion.data, isViewerOpen]);

  useEffect(() => {
    if (!isViewerOpen) {
      return;
    }
    const activeThumbnail = viewerStripRef.current?.querySelector(
      `[data-skin-index="${skinIndex}"]`,
    );
    activeThumbnail?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [isViewerOpen, skinIndex]);

  if (champion.isPending) {
    return (
      <PageTransition className="champion-page">
        <LoadingState label="Consultando el expediente" />
      </PageTransition>
    );
  }

  if (champion.isError) {
    return (
      <PageTransition className="champion-page">
        <ErrorState
          title="Ese expediente no está disponible"
          message={champion.error.message}
          retry={() => void champion.refetch()}
        />
      </PageTransition>
    );
  }

  const data = champion.data;
  const activeSkin = data.skins[skinIndex];

  return (
    <PageTransition className="champion-page">
      <Link
        className="back-link"
        to="/champions"
        onClick={(event) => {
          if (cameFromChampionArchive) {
            event.preventDefault();
            navigate(-1);
          }
        }}
      >
        <ArrowIcon /> Volver al archivo
      </Link>

      <div className="champion-detail-layout">
        <section className="champion-profile">
          <motion.div
            className="champion-emblem"
            initial={{ scale: 0.78, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            <img src={data.imageUrl} alt={`Retrato de ${data.name}`} />
          </motion.div>
          <div className="champion-heading">
            <p className="eyebrow">{data.roles.join(" / ")}</p>
            <h1>{data.name}</h1>
            <h2>{data.title}</h2>
          </div>
          <div className="champion-lore">
            <span className="utility-label">LORE</span>
            <p>{data.lore}</p>
          </div>
        </section>

        {activeSkin && (
          <section className="skins-section">
            <header>
              <div>
                <span className="utility-label">GALERÍA DE ASPECTOS</span>
                <h2 title={activeSkin.name}>{activeSkin.name}</h2>
              </div>
              <span>
                {String(skinIndex + 1).padStart(2, "0")} /{" "}
                {String(data.skins.length).padStart(2, "0")}
              </span>
            </header>

            <div className="skin-stage">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSkin.imageUrl}
                  src={activeSkin.imageUrl}
                  alt={`${activeSkin.name} de ${data.name}`}
                  initial={{ opacity: 0, scale: 1.025 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                />
              </AnimatePresence>
              <div className="skin-expand-control">
                <button
                  type="button"
                  className="skin-expand"
                  aria-label={`Ampliar imagen de ${activeSkin.name}`}
                  aria-describedby="skin-expand-tooltip"
                  onClick={() => setIsViewerOpen(true)}
                >
                  <ExpandIcon />
                </button>
                <span
                  id="skin-expand-tooltip"
                  className="skin-expand-tooltip"
                  role="tooltip"
                >
                  Ampliar imagen
                </span>
              </div>
              {data.skins.length > 1 && (
                <>
                  <button
                    type="button"
                    className="skin-prev"
                    aria-label="Aspecto anterior"
                    onClick={() =>
                      setSkinIndex(
                        (current) =>
                          (current - 1 + data.skins.length) %
                          data.skins.length,
                      )
                    }
                  >
                    <ChevronIcon />
                  </button>
                  <button
                    type="button"
                    className="skin-next"
                    aria-label="Aspecto siguiente"
                    onClick={() =>
                      setSkinIndex(
                        (current) => (current + 1) % data.skins.length,
                      )
                    }
                  >
                    <ChevronIcon />
                  </button>
                </>
              )}
            </div>

            <div
              ref={skinStripRef}
              className="skin-strip"
              aria-label="Seleccionar aspecto"
            >
              {data.skins.map((skin, index) => (
                <button
                  type="button"
                  key={`${skin.num}-${skin.name}`}
                  className={index === skinIndex ? "is-active" : ""}
                  onClick={() => setSkinIndex(index)}
                  onMouseEnter={() => setSkinIndex(index)}
                  onFocus={() => setSkinIndex(index)}
                  aria-label={skin.name}
                  aria-current={index === skinIndex}
                >
                  <img src={skin.imageUrl} alt="" loading="lazy" />
                  <span>{skin.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {isViewerOpen && activeSkin && (
          <motion.div
            className="skin-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeSkin.name} a pantalla completa`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsViewerOpen(false)}
          >
            <motion.div
              className="skin-viewer-content"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="skin-viewer-stage">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSkin.imageUrl}
                    src={activeSkin.imageUrl}
                    alt={`${activeSkin.name} de ${data.name}`}
                    initial={{ opacity: 0, scale: 1.035 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.28 }}
                  />
                </AnimatePresence>
                {data.skins.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="skin-prev"
                      aria-label="Aspecto anterior"
                      onClick={() =>
                        setSkinIndex(
                          (current) =>
                            (current - 1 + data.skins.length) %
                            data.skins.length,
                        )
                      }
                    >
                      <ChevronIcon />
                    </button>
                    <button
                      type="button"
                      className="skin-next"
                      aria-label="Aspecto siguiente"
                      onClick={() =>
                        setSkinIndex(
                          (current) => (current + 1) % data.skins.length,
                        )
                      }
                    >
                      <ChevronIcon />
                    </button>
                  </>
                )}
              </div>
              <div
                ref={viewerStripRef}
                className="skin-viewer-strip"
                aria-label="Seleccionar aspecto en el visor"
              >
                {data.skins.map((skin, index) => (
                  <motion.button
                    type="button"
                    key={`${skin.num}-${skin.name}-viewer`}
                    data-skin-index={index}
                    className={index === skinIndex ? "is-active" : ""}
                    aria-label={skin.name}
                    aria-current={index === skinIndex}
                    onClick={() => setSkinIndex(index)}
                    onMouseEnter={() => setSkinIndex(index)}
                    animate={{
                      opacity: index === skinIndex ? 1 : 0.38,
                      y: index === skinIndex ? -4 : 0,
                    }}
                    transition={{ duration: 0.18 }}
                  >
                    <img src={skin.imageUrl} alt="" loading="lazy" />
                  </motion.button>
                ))}
              </div>
              <div className="skin-viewer-bar">
                <div>
                  <span className="utility-label">{data.name}</span>
                  <strong>{activeSkin.name}</strong>
                </div>
                <a
                  href={activeSkin.imageUrl}
                  download={`${data.id}-${activeSkin.num}.jpg`}
                  className="skin-viewer-action"
                >
                  <DownloadIcon /> Descargar
                </a>
                <button
                  ref={viewerCloseRef}
                  type="button"
                  className="skin-viewer-action"
                  onClick={() => setIsViewerOpen(false)}
                >
                  <CloseIcon /> Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
