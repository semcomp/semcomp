import React, { useEffect } from "react";

import FocusTrap from "focus-trap-react";

function Modal({ children, onRequestClose }) {
  function handleRootClick() {
    onRequestClose();
  }

  function handleCardClick(e) {
    e.stopPropagation();
  }

  useEffect(() => {
    // quando modal esta aberto e clica na tecla 'esc', ele fecha
    const close = (e) => {
      if (e.key === "Escape") {
        onRequestClose();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  });

  return (
    <FocusTrap>
      <div
        className="modal-component"
        onClick={handleRootClick}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        // aria-hidden="true"
      >
        <div className="card" onClick={handleCardClick}>
          {children}
        </div>
      </div>
    </FocusTrap>
  );
}

export default Modal;
