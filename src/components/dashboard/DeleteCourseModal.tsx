import { AlertTriangle, FolderMinus } from 'lucide-react';

interface DeleteModalData {
  id: string;
  title: string;
  isRemoving?: boolean;
}

interface DeleteCourseModalProps {
  deleteModal: DeleteModalData | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCourseModal({
  deleteModal,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteCourseModalProps) {
  if (!deleteModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '420px', animation: 'scaleIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: deleteModal.isRemoving ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: deleteModal.isRemoving ? 'var(--primary)' : 'var(--danger)',
            }}
          >
            {deleteModal.isRemoving ? <FolderMinus size={20} /> : <AlertTriangle size={20} />}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>
            {deleteModal.isRemoving ? 'Remove from Catalog' : 'Confirm Unenrollment'}
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px', fontSize: '0.9rem' }}>
          {deleteModal.isRemoving
            ? `This will remove "${deleteModal.title}" from your account list. You can regenerate or re-discover it anytime.`
            : `Are you sure you want to unenroll from "${deleteModal.title}"? Progress will be saved and moved to available catalog.`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
            style={{ borderRadius: '8px' }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{
              background: deleteModal.isRemoving ? 'var(--text)' : 'var(--danger)',
              borderColor: deleteModal.isRemoving ? 'var(--text)' : 'var(--danger)',
              borderRadius: '8px',
            }}
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Processing...' : deleteModal.isRemoving ? 'Yes, Remove' : 'Yes, Unenroll'}
          </button>
        </div>
      </div>
    </div>
  );
}
