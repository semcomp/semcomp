import React, { useEffect } from "react";

function Modal({ children, onRequestClose }) {
  function handleRootClick() {
    onRequestClose();
  }

  function handleCardClick(e) {
    e.stopPropagation();
  }

  function handleCloseClick(e) {
    e.stopPropagation();
    onRequestClose();
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
    <div
      className="fixed inset-0 flex items-center justify-center w-full h-full bg-black/25 z-50 mobile:mt-9 mobile:mx-2"
      onClick={handleRootClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex flex-col items-center w-full max-w-xl max-h-[90%] bg-white rounded-lg shadow-2xl relative"
        onClick={handleCardClick}
      >
        <button
          onClick={handleCloseClick}
          className="absolute top-6 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
