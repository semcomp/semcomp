import React from 'react';
import Faq from './Faq';
import Schedule from './Schedule';
import About from './About';

interface ModalProps {
  element: string;
  setButtonSelected: (buttonSelected: string) => void;
}

const Modal: React.FC<ModalProps> = ({ element, setButtonSelected }) => {
  return (
    <div className="w-full h-full overflow-hidden">
      <div
        className="absolute z-50 bg-white/95 backdrop-blur shadow-xl flex justify-center p-4 overflow-auto custom-scroll mb-4"
        style={{
          width: 'calc(100% - 4rem)', 
          height: 'calc(100% - 4rem)', 
          top: '2rem',
          left: '2rem',
          borderRadius: '1rem',
        }}
      >
        <button
          onClick={() => setButtonSelected('')}
          className="w-10 h-10 rounded-full flex justify-center items-center text-black fixed top-12 right-12 bg-black/20"
        >
          X
        </button>
        <div className="w-full h-full">
          {element === 'cronograma' && <Schedule />}
          {element === 'faq' && <Faq />}
          {element === 'sobre' && <About /> }
        </div>
      </div>
      
      {/* CSS Inline para ocultar a barra de rolagem */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }

        .custom-scroll {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Modal;
