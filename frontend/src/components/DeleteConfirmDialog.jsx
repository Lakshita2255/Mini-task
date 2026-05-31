import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmDialog({ open, onClose, taskTitle, onConfirm, isDeleting }) {
  if (!open) return null;

  return (
    <div className="dialog">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="dialog-panel">
        <div className="dialog-header">
          <div>
            <p className="eyebrow">Danger Zone</p>
            <h2>Delete this task?</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close delete dialog">
            <X size={18} />
          </button>
        </div>
        <div className="delete-confirm-content">
          <AlertTriangle size={32} color="#f97316" />
          <p>
            Are you sure you want to remove <strong>{taskTitle}</strong> permanently? This action cannot be undone.
          </p>
        </div>
        <div className="dialog-actions">
          <button className="soft-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
