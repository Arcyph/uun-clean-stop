import { useDialog } from "../dialogs/DialogProvider";

export default function QrScanButton() {
  const { openDialog } = useDialog();

  return (
    <button className="qrFab" onClick={() => {console.log("QR CLICK"); openDialog("qrScan")}}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 4h6v6H4V4Z" stroke="white" strokeWidth="2"/>
        <path d="M14 4h6v6h-6V4Z" stroke="white" strokeWidth="2"/>
        <path d="M4 14h6v6H4v-6Z" stroke="white" strokeWidth="2"/>
        <path d="M14 14h2v2h-2v-2Z" fill="white"/>
        <path d="M18 14h2v6h-6v-2h4v-4Z" fill="white"/>
      </svg>
    </button>
  );
}
