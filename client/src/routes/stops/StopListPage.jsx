import { useNavigate } from "react-router-dom";
import { useStopList } from "../../providers/StopListProvider";
import { useDialog } from "../../dialogs/DialogProvider";
import ErrorBanner from "../../components/ErrorBanner";
import StopsTable from "../../components/StopsTable";

export default function StopListPage() {
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const { data, status, error, handlerMap } = useStopList();

  const onAddStop = () => openDialog("stopForm", { mode: "create" });
  const onTracking = () => openDialog("trackingCode");
  const onDetail = (stopId) => navigate(`/stops/${stopId}`);

  const onReload = async () => {
    try {
      await handlerMap.listWithReportStats();
    } catch {
      // error by provider
    }
  };

  const rows = Array.isArray(data) ? data : [];

  return (
    <section>
      <div className="panelHeaderRow">
        <h2 className="h2"></h2>

        <button className="btn btnPrimary" onClick={onTracking}>
          Mám sledovací kód
        </button>
      </div>

      <ErrorBanner title="Stop error" error={error} status={status} />

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn btnGhost" onClick={onReload}>
          Obnovit
        </button>
        <button className="btn btnPrimary" onClick={onAddStop}>
          Přidat zastávku
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <StopsTable rows={rows} onDetail={onDetail} />
      </div>
    </section>
  );
}
