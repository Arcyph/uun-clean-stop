import Modal from "./Modal";
import { useAppRefresh } from "../providers/AppRefreshProvider";
import { useStopList } from "../providers/StopListProvider";

export default function ConfirmDialog({ payload, onClose }) {
  const title = payload?.title ?? "Potvrzení";
  const message = payload?.message ?? "Opravdu?";

  const { bump } = useAppRefresh();
  const stopApi = useStopList();

  const onConfirm = async () => {
    try {
      await payload?.onConfirm?.();

      try {
        await stopApi?.handlerMap?.listWithReportStats?.();
      } catch {}

      bump();
      onClose();
    } catch {
      // error by provider
    }
  };

  return (
    <Modal title={title} onClose={onClose} width={420}>
      <div style={{ marginTop: 12 }}>{message}</div>
      <div className="actionsRow">
        <button className="btn btnPrimary" onClick={onConfirm}>
          Ano
        </button>
        <button className="btn btnGhost" onClick={onClose}>
          Ne
        </button>
      </div>
    </Modal>
  );
}
