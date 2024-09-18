import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Faq from './Faq';
import Schedule from './Schedule';
import About from './About';
import Sponsors from './Sponsors';

interface ModalProps {
  element: string;
  setButtonSelected: (buttonSelected: string) => void;
}

const Modal: React.FC<ModalProps> = ({ element, setButtonSelected }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full z-[10000]">
      <div
        className="absolute z-50 flex flex-col items-center justify-center p-2 bg-gray-900 shadow-xl"
        style={{
          width: 'calc(100% - 4rem)',
          height: 'calc(100% - 4rem)',
          top: '2rem',
          left: '2rem',
          borderRadius: '1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <button
          onClick={() => setButtonSelected('')}
          className="absolute px-2 py-1 text-white bg-red-600 border-b-4 border-red-800 rounded-full outline-none focus:outline-none hover:bg-red-500 hover:border-red-700 active:translate-y-1 active:border-b-0 top-2 right-2 sm:px-3 sm:py-2 sm:top-4 sm:right-4 md:px-4 md:py-3 md:top-6 md:right-6 lg:top-8 lg:right-8"
        >
          <AiOutlineClose size={20} className="sm:size-24 md:size-30 lg:size-36" />
        </button>
        <div className="flex flex-col items-center justify-center w-full h-full p-4 text-white custom-scroll">
          {element === 'cronograma' && <Schedule />}
          {element === 'faq' && <Faq />}
          {element === 'sobre' && <About />}
          {element === 'sponsors' && <Sponsors />}
        </div>
      </div>

      {/* CSS Inline para ocultar a barra de rolagem */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }

        .custom-scroll {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
      `}</style>
    </div>
  );
};

export default Modal;
