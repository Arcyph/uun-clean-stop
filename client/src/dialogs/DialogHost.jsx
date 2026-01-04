import StopFormDialog from "./StopFormDialog";
import ReportFormDialog from "./ReportFormDialog";
import ConfirmDialog from "./ConfirmDialog";
import TrackingCodeDialog from "./TrackingCodeDialog";
import QrScanDialog from "./QrScanDialog";

import { useDialog } from "./DialogProvider";

export default function DialogHost() {
  const { activeDialog, closeDialog } = useDialog();

  if (!activeDialog) return null;

  const { key, payload } = activeDialog;

  const dialogMap = {
    stopForm: StopFormDialog,
    reportForm: ReportFormDialog,
    confirm: ConfirmDialog,
    trackingCode: TrackingCodeDialog,
    qrScan: QrScanDialog,
  };

  const DialogComponent = dialogMap[key];
  if (!DialogComponent) return null;

  return <DialogComponent payload={payload} onClose={closeDialog} />;
}
