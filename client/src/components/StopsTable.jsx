export default function StopsTable({ rows, onDetail }) {
  const list = Array.isArray(rows) ? rows : [];

  return (
    <div className="tableCard">
      <table className="table">
        <thead>
          <tr>
            <th>Zastávka</th>
            <th>Aktivních hlášení</th>
            <th>Hlášení celkem</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((row, idx) => {
            const stop = row?.stop ?? {};
            const stopId = stop?.id;

            const name = row?.stopName ?? stop?.name ?? "-";
            const active = row?.activeReports ?? 0;
            const total = row?.totalReports ?? 0;

            return (
              <tr key={stopId ?? idx}>
                <td>{name}</td>
                <td>{active}</td>
                <td>{total}</td>
                <td>
                  <button className="tableAction" onClick={() => stopId && onDetail?.(stopId)}>
                    Detail
                  </button>
                </td>
              </tr>
            );
          })}

          {list.length === 0 && (
            <tr>
              <td colSpan={4} style={{ opacity: 0.85 }}>
                Žádná data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
