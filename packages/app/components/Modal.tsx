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
        className="flex items-center justify-center fixed w-full h-full left-0 top-0 bg-black/25 z-50"
        onClick={handleRootClick}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center w-full max-w-lg bg-white" onClick={handleCardClick}>
          {children}
        </div>
      </div>
    </FocusTrap>
  );
}

export default Modal;