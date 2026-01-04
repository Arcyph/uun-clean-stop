import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

import Modal from "./Modal";
import { useStopList } from "../providers/StopListProvider";

function extractStopCode(text) {
  if (!text) return null;
  const trimmed = String(text).trim();

  if (/^\d{3,10}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const qp = url.searchParams.get("code") || url.searchParams.get("stopCode");
    if (qp && /^\d{3,10}$/.test(qp)) return qp;
  } catch {}

  const m = trimmed.match(/\b(\d{3,10})\b/);
  return m ? m[1] : null;
}

export default function QrScanDialog({ onClose }) {
  const navigate = useNavigate();
  const stopApi = useStopList();

  const qrRef = useRef(null);
  const isRunningRef = useRef(false);
  const doneRef = useRef(false);

  const [statusText, setStatusText] = useState("Spouštím kameru…");
  const [lastDecoded, setLastDecoded] = useState("");

  const stopCamera = async () => {
    const qr = qrRef.current;
    qrRef.current = null;
    isRunningRef.current = false;

    if (!qr) return;

    try {
      await qr.stop();
    } catch {}

    try {
      await qr.clear();
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        await new Promise((r) => setTimeout(r, 0));
        if (cancelled) return;

        if (isRunningRef.current) return;
        isRunningRef.current = true;

        setStatusText("Žádám o přístup ke kameře…");

        const qr = new Html5Qrcode("qr-reader");
        qrRef.current = qr;

        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 260 },
          async (decodedText) => {
            if (cancelled) return;
            if (doneRef.current) return;
            doneRef.current = true;

            const raw = String(decodedText ?? "");
            setLastDecoded(raw);

            const code = extractStopCode(raw);
            if (!code) {
              setStatusText("QR přečten, ale nenašel jsem kód zastávky.");
              doneRef.current = false;
              return;
            }

            setStatusText(`Načteno: ${code}. Hledám zastávku…`);

            const fn =
              stopApi?.handlerMap?.getByCode ||
              stopApi?.handlerMap?.getStopByCode;

            if (!fn) {
              setStatusText("Chybí getByCode v StopListProvider (handlerMap).");
              doneRef.current = false;
              return;
            }

            try {
              const stop = await fn(code);

              if (!stop?.id) {
                setStatusText("Zastávku se nepodařilo načíst (chybí id).");
                doneRef.current = false;
                return;
              }

              await stopCamera();
              onClose();
              navigate(`/stops/${stop.id}`);
            } catch (e) {
              setStatusText(e?.message || "Chyba při načítání zastávky.");
              doneRef.current = false;
            }
          }
        );

        if (!cancelled) setStatusText("Namiřte kameru na QR kód…");
      } catch (e) {
        if (!cancelled) setStatusText(e?.message || "Nepodařilo se spustit kameru.");
        isRunningRef.current = false;
      }
    };

    start();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [navigate, onClose, stopApi]);

  const onCloseSafe = async () => {
    doneRef.current = false;
    await stopCamera();
    onClose();
  };

  return (
    <Modal title="Skenovat QR kód" onClose={onCloseSafe} width={560}>
      <div className="meta" style={{ marginTop: 8 }}>
        {statusText}
      </div>

      {lastDecoded ? (
        <div className="meta" style={{ marginTop: 6, opacity: 0.85 }}>
          <strong>Načteno:</strong> {lastDecoded}
        </div>
      ) : null}

      <div style={{ marginTop: 12 }}>
        <div
          id="qr-reader"
          style={{
            width: "100%",
            minHeight: 320,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#111",
          }}
        />
      </div>

      <div className="actionsRow">
        <button className="btn btnGhost" type="button" onClick={onCloseSafe}>
          Zavřít
        </button>
      </div>
    </Modal>
  );
}
