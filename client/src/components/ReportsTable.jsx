function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default function ReportsTable({ reports, onEdit, onDelete }) {
  const list = Array.isArray(reports) ? reports : [];

  return (
    <div className="tableCard">
      <table className="table">
        <thead>
          <tr>
            <th>Vytvořeno</th>
            <th>Stav</th>
            <th>Typ poškození</th>
            <th>Závažnost</th>
            <th>Popis</th>
            <th>Foto</th>
            <th>Naposledy upraveno</th>
            <th></th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {list.map((r, idx) => (
            <tr key={r?.id ?? idx}>
              <td>{formatDateTime(r?.createdAt ?? r?.created)}</td>
              <td>{r?.status ?? "-"}</td>
              <td>{r?.damageType ?? "-"}</td>
              <td>{r?.severity ?? "-"}</td>
              <td>{r?.description ?? "-"}</td>
              <td>
                {r?.photoUrl ? (
                  <a
                    href={r.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "white" }}
                  >
                    link
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td>{formatDateTime(r?.updatedAt ?? r?.updated)}</td>
              <td>
                <button className="tableAction" onClick={() => onEdit?.(r)}>Upravit</button>
              </td>
              <td>
                <button className="tableActionDanger" onClick={() => onDelete?.(r)}>Smazat</button>
              </td>
            </tr>
          ))}

          {list.length === 0 && (
            <tr>
              <td colSpan={9} style={{ opacity: 0.85 }}>
                Žádná hlášení
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
