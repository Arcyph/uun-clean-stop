import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReportList } from "../providers/ReportListProvider";
import Modal from "./Modal";

export default function TrackingCodeDialog({ onClose }) {
  const { handlerMap } = useReportList();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState(null);

  const onSearch = async () => {
    setLocalError(null);
    const trimmed = code.trim();

    if (!trimmed) {
      setLocalError("Zadejte sledovací kód.");
      return;
    }

    try {
      const report = await handlerMap.getByTrackingCode(trimmed);
      if (report?.stopId) {
        onClose();
        navigate(`/stops/${report.stopId}`);
        return;
      }
      setLocalError("Hlášení bylo nalezeno, ale neobsahuje stopId.");
    } catch (e) {
      setLocalError(e?.message ?? "Nepodařilo se vyhledat hlášení.");
    }
  };

  return (
    <Modal title="Vyhledat dle sledovacího kódu" onClose={onClose} width={520}>
      <div className="formGrid">
        <div>
          <div className="fieldLabel">Sledovací kód</div>
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="např. ABC123..." />
        </div>

        {localError && (
          <div className="meta">
            <strong>Chyba:</strong> {localError}
          </div>
        )}

        <div className="actionsRow">
          <button className="btn btnPrimary" onClick={onSearch}>Hledat</button>
          <button className="btn btnGhost" onClick={onClose}>Zrušit</button>
        </div>
      </div>
    </Modal>
  );
}
