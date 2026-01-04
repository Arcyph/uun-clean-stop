import { useMemo, useState } from "react";
import { useStopList } from "../providers/StopListProvider";
import { useAppRefresh } from "../providers/AppRefreshProvider";
import Modal from "./Modal";

function normalizeStopInitial(payload) {
  const initial = payload?.initial ?? {};
  return {
    id: initial.id ?? "",
    name: initial.name ?? "",
    code: initial.code ?? "",
    latitude: initial.latitude ?? "",
    longitude: initial.longitude ?? "",
    note: initial.note ?? "",
  };
}

export default function StopFormDialog({ payload, onClose }) {
  const stopApi = useStopList();
  const { bump } = useAppRefresh();
  const mode = payload?.mode ?? "create";

  const initial = useMemo(() => normalizeStopInitial(payload), [payload]);
  const [form, setForm] = useState(initial);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const dto = {
      ...(mode === "edit" ? { id: form.id } : {}),
      name: form.name.trim(),
      code: form.code === "" ? null : Number(form.code),
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude),
      note: form.note.trim() === "" ? null : form.note.trim(),
    };

    try {
      if (mode === "edit") await stopApi.handlerMap.update(dto);
      else await stopApi.handlerMap.create(dto);
      
      await stopApi.handlerMap.listWithReportStats();
      bump();

      onClose();
    } catch {
      // error by provider
    }
  };

  return (
    <Modal title={mode === "edit" ? "Upravit zastávku" : "Přidat zastávku"} onClose={onClose} width={560}>
      <form onSubmit={onSubmit} className="formGrid">
        {mode === "edit" && <input type="hidden" name="id" value={form.id} />}

        <div>
          <div className="fieldLabel">Název</div>
          <input className="input" name="name" value={form.name} onChange={onChange} required />
        </div>

        <div>
          <div className="fieldLabel">Kód</div>
          <input className="input" name="code" value={form.code} onChange={onChange} required inputMode="numeric" />
        </div>

        <div>
          <div className="fieldLabel">Latitude</div>
          <input className="input" name="latitude" value={form.latitude} onChange={onChange} inputMode="decimal" />
        </div>

        <div>
          <div className="fieldLabel">Longitude</div>
          <input className="input" name="longitude" value={form.longitude} onChange={onChange} inputMode="decimal" />
        </div>

        <div>
          <div className="fieldLabel">Poznámka</div>
          <input className="input" name="note" value={form.note} onChange={onChange} />
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
