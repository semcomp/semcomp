import { useEffect, useRef, useState } from "react";

interface ModalProps {
  children: any;
  isOpen: boolean;
  hasCloseBtn?: boolean;
  onClose?: () => void;
}

export function Modal({ children, isOpen, hasCloseBtn, onClose }: ModalProps) {
  const [isModalOpen, setModalOpen] = useState(isOpen);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      if (isModalOpen) {
        modalElement.showModal();
      } else {
        modalElement.close();
      }
    }
  }, [isModalOpen]);

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    }
    setModalOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      handleCloseModal();
    }
  };

  return (
    <>
      <dialog ref={modalRef} className="backdrop:bg-gray-700 backdrop:opacity-50" onKeyDown={handleKeyDown}>
        <div className="modal-header">
          {hasCloseBtn && (
            <button className="bg-red-400" onClick={handleCloseModal}>
              Close
            </button>
          )}
        </div>
        {children}
      </dialog>
    </>
  )
}