import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Faq from './Faq';
import Schedule from './Schedule';
import About from './About';
import Sponsors from './Sponsors';
import Supporters from './Supporters';

interface ModalProps {
  element: string;
  setButtonSelected: (buttonSelected: string) => void;
}

const Modal: React.FC<ModalProps> = ({ element, setButtonSelected }) => {
  return (
    <div className="flex flex-col fixed inset-0 flex items-center justify-center w-full h-full z-[10000]">
      <div
        className="z-50 flex flex-col items-center justify-center p-2 bg-gray-900 shadow-xl md:w-[70%] md:w-[70%] mobile:w-[90%]"
        style={{
          // padding: '10rem',
          top: '2rem',
          left: '2rem',
          borderRadius: '1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <div className='flex flex-row h-full w-full justify-end align-end'>
          <button
            onClick={() => setButtonSelected('')}
            className="h-fit w-fit px-2 py-1 mx-6 mt-6 text-white bg-red-600 border-b-4 border-red-800 rounded-full outline-none focus:outline-none hover:bg-red-500 hover:border-red-700 active:translate-y-1 active:border-b-0 top-2 right-2 sm:px-3 sm:py-2 md:px-4 md:py-3"
          >
            <AiOutlineClose size={20} className="sm:size-24 md:size-30 lg:size-36" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full md:mx-32 md:mb-12 md:px-12 md:pb-12 mobile:p-4 text-white custom-scroll">
          {element === 'cronograma' && <Schedule />}
          {element === 'faq' && <Faq />}
          {element === 'sobre' && <About />}
          {element === 'sponsors' && <Sponsors />}
          {element === 'supporters' && <Supporters />}
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
