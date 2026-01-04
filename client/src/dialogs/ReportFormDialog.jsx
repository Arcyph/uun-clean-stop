import { useMemo, useState } from "react";
import { useReportList } from "../providers/ReportListProvider";
import { useStopList } from "../providers/StopListProvider";
import { useAppRefresh } from "../providers/AppRefreshProvider";
import Modal from "./Modal";

const STATUS_OPTIONS = ["Přijato", "V řešení", "Vyřešeno", "Zamítnuto"];
const DAMAGE_OPTIONS = ["Graffiti", "Rozbité sklo", "Poškozený panel", "Nečistota"];
const SEVERITY_OPTIONS = ["Nízká", "Střední", "Vysoká"];

function normalizeReportInitial(payload, mode) {
  const initial = payload?.initial ?? {};
  return {
    id: initial.id ?? "",
    stopId: initial.stopId ?? payload?.stopId ?? "",
    status: mode === "edit" ? (initial.status ?? "Přijato") : "Přijato",
    damageType: initial.damageType ?? "Graffiti",
    severity: initial.severity ?? "Nízká",
    description: initial.description ?? "",
    photoUrl: initial.photoUrl ?? "",
  };
}

export default function ReportFormDialog({ payload, onClose }) {
  const reportApi = useReportList();
  const stopApi = useStopList();
  const { bump } = useAppRefresh();

  const mode = payload?.mode ?? "create";
  const initial = useMemo(() => normalizeReportInitial(payload, mode), [payload, mode]);
  const [form, setForm] = useState(initial);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const dto = {
      ...(mode === "edit" ? { id: form.id } : {}),
      stopId: form.stopId,
      status: mode === "edit" ? form.status : "Přijato",
      damageType: form.damageType,
      severity: form.severity,
      description: form.description.trim() === "" ? null : form.description.trim(),
      photoUrl: form.photoUrl.trim() === "" ? null : form.photoUrl.trim(),
    };

    try {
      if (mode === "edit") await reportApi.handlerMap.update(dto);
      else await reportApi.handlerMap.create(dto);
      await stopApi.handlerMap.listWithReportStats();
      bump();

      onClose();
    } catch {
      // error by provider
    }
  };

  return (
    <Modal title={mode === "edit" ? "Upravit hlášení" : "Nahlásit poškození"} onClose={onClose} width={620}>
      <form onSubmit={onSubmit} className="formGrid">
        {mode === "edit" && <input type="hidden" name="id" value={form.id} />}
        <input type="hidden" name="stopId" value={form.stopId} />

        {mode === "edit" && (
          <div>
            <div className="fieldLabel">Stav</div>
            <select className="select" name="status" value={form.status} onChange={onChange}>
              {STATUS_OPTIONS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <div className="fieldLabel">Typ poškození</div>
          <select className="select" name="damageType" value={form.damageType} onChange={onChange}>
            {DAMAGE_OPTIONS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="fieldLabel">Závažnost</div>
          <select className="select" name="severity" value={form.severity} onChange={onChange}>
            {SEVERITY_OPTIONS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="fieldLabel">Popis (volitelné)</div>
          <textarea className="textarea" name="description" value={form.description} onChange={onChange} maxLength={5000} />
        </div>

        <div>
          <div className="fieldLabel">Odkaz na fotku (volitelné)</div>
          <input className="input" name="photoUrl" value={form.photoUrl} onChange={onChange} maxLength={2000} placeholder="https://..." />
        </div>

        <div className="actionsRow">
          <button className="btn btnPrimary" type="submit">
            Uložit
          </button>
          <button className="btn btnGhost" type="button" onClick={onClose}>
            Zrušit
          </button>
        </div>
      </form>
    </Modal>
  );
}
