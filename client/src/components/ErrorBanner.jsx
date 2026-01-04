export default function ErrorBanner({ title, error, status }) {
  if (!error && status !== "error") return null;

  const msg = error?.message ?? String(error ?? "Unknown error");

  return (
    <div className="errorBanner" role="alert">
      <strong>{title}:</strong> {msg}
    </div>
  );
}
