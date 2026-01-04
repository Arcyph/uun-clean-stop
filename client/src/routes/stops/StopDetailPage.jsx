import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useStopList } from "../../providers/StopListProvider";
import { useReportList } from "../../providers/ReportListProvider";
import { useDialog } from "../../dialogs/DialogProvider";
import { useAppRefresh } from "../../providers/AppRefreshProvider";

import ErrorBanner from "../../components/ErrorBanner";
import ReportsTable from "../../components/ReportsTable";

export default function StopDetailPage() {
  const { stopId } = useParams();
  const navigate = useNavigate();

  const { openDialog } = useDialog();
  const { revision } = useAppRefresh();

  const stopApi = useStopList();
  const reportApi = useReportList();

  const [stop, setStop] = useState(null);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        const getFn = stopApi?.handlerMap?.get ?? stopApi?.handlerMap?.getStop;
        const s = await getFn?.(stopId);
        setStop(s ?? null);
      } catch {}

      try {
        const listFn = reportApi?.handlerMap?.listByStopId ?? reportApi?.handlerMap?.listByStop;
        const list = await listFn?.(stopId);
        setReports(Array.isArray(list) ? list : []);
      } catch {}
    };

    run();
  }, [stopId, revision]);

  const onAddReport = () => openDialog("reportForm", { mode: "create", stopId });
  const onEditStop = () => openDialog("stopForm", { mode: "edit", initial: stop });

  const onDeleteStop = () =>
    openDialog("confirm", {
      title: "Smazat zastávku",
      message: "Opravdu chcete smazat tuto zastávku?",
      onConfirm: async () => {
        await stopApi.handlerMap.remove(stopId);
        navigate("/stops");
      },
    });

  const onEditReport = (report) => openDialog("reportForm", { mode: "edit", initial: report });
  const onDeleteReport = (report) =>
    openDialog("confirm", {
      title: "Smazat hlášení",
      message: "Opravdu chcete smazat toto hlášení?",
      onConfirm: async () => {
        await reportApi.handlerMap.remove(report.id);
      },
    });

  return (
    <section>
      <button className="btn btnGhost" onClick={() => navigate("/stops")}>
        ← Zpět na seznam
      </button>

      <div className="panelHeaderRow" style={{ marginTop: 10 }}>
        <h2 className="h2">Detail zastávky</h2>
        <button className="btn btnPrimary" onClick={onAddReport}>
          Nahlásit poškození
        </button>
      </div>

      <ErrorBanner title="Stop error" error={stopApi.error} status={stopApi.status} />
      <ErrorBanner title="Report error" error={reportApi.error} status={reportApi.status} />

      <div className="meta" style={{ marginTop: 8 }}>
        <div>
          <strong>Název:</strong> {stop?.name ?? "-"}
        </div>
        <div>
          <strong>Kód:</strong> {stop?.code ?? "-"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btnPrimary" onClick={onEditStop}>
          Upravit zastávku
        </button>
        <button className="btn btnPrimary" onClick={onDeleteStop}>
          Smazat zastávku
        </button>
      </div>

      <h3 className="h2" style={{ marginTop: 16 }}>
        Seznam hlášení
      </h3>

      <ReportsTable reports={reports} onEdit={onEditReport} onDelete={onDeleteReport} />
    </section>
  );
}
