import { Link } from "react-router-dom";
import { ArrowIcon } from "../components/Icons";
import { PageTransition } from "../components/PageTransition";

export function NotFoundPage() {
  return (
    <PageTransition className="not-found-page">
      <span className="utility-label">ERROR 404</span>
      <h1>Esta ruta se ha perdido en la niebla de guerra.</h1>
      <Link className="text-button" to="/">
        Volver al buscador <ArrowIcon />
      </Link>
    </PageTransition>
  );
}
