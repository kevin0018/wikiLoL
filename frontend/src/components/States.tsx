import { useI18n } from "../i18n/I18nProvider";

export function LoadingState({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="loading-state" role="status">
      <span className="loading-rune" aria-hidden="true" />
      <span>{label ?? t("common.loading")}</span>
    </div>
  );
}

export function ErrorState({
  title,
  message,
  retry,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="error-state" role="alert">
      <span className="utility-label">{t("common.error.eyebrow")}</span>
      <h2>{title ?? t("common.error.title")}</h2>
      <p>{message ?? t("common.error.message")}</p>
      {retry && (
        <button className="text-button" type="button" onClick={retry}>
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}
