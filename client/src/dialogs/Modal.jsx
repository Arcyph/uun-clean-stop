export default function Modal({ title, children, onClose, width = 520 }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div
        className="modalBox"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modalHeader">
          <h3 className="modalTitle">{title}</h3>
          <button className="modalClose" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
