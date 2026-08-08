import { Link } from "react-router-dom";
import { ArrowIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";
import { useI18n } from "../i18n/I18nProvider";

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <PageTransition className="not-found-page">
      <span className="utility-label">ERROR 404</span>
      <h1>{t("notFound.title")}</h1>
      <Link className="text-button" to="/">
        {t("notFound.back")} <ArrowIcon />
      </Link>
    </PageTransition>
  );
}
