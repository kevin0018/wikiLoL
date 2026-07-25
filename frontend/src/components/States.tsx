export function LoadingState({ label = "Cargando datos" }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="loading-rune" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title = "No se han podido cargar los datos",
  message,
  retry,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <span className="utility-label">INTERRUPCIÓN EN LA GRIETA</span>
      <h2>{title}</h2>
      <p>{message ?? "Comprueba la conexión con el backend e inténtalo de nuevo."}</p>
      {retry && (
        <button className="text-button" type="button" onClick={retry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
