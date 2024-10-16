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
        className="z-50 flex flex-col grow-0 items-center py-2 px-6 bg-gray-900 shadow-xl md:w-[75%] md:w-[70%] mobile:w-[90%]"
        style={{
          // padding: '10rem',
          top: '2rem',
          left: '2rem',
          borderRadius: '1rem',
          overflowY: 'hidden',
          overflowX: 'hidden',
          maxWidth: '100%',
          maxHeight: '95%',
        }}
      >
        <div className='flex flex-row w-full justify-end align-end max-h-fit'>
          <button
            onClick={() => setButtonSelected('')}
            className="h-fit w-fit my-4 text-white bg-red-600 border-b-4 border-red-800 rounded-full outline-none focus:outline-none hover:bg-red-500 hover:border-red-700 active:translate-y-1 active:border-b-0 top-2 right-2 sm:px-3 sm:py-2 md:px-4 md:py-3"
          >
            <AiOutlineClose size={20} className="sm:size-24 md:size-30 lg:size-36" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full md:mx-32 md:mb-12 text-white custom-scroll tablet:px-8 desktop:px-8 overflow-y-auto overflow-x-hidden">
          {element === 'cronograma' && <Schedule />}
          {element === 'faq' && <Faq />}
          {element === 'sobre' && <About />}
          {element === 'sponsors' && <Sponsors />}
          {element === 'supporters' && <Supporters />}
        </div>
      </div>

      {/* CSS Inline para ocultar a barra de rolagem */}
      <style jsx>{`
      
        .custom-scroll::-webkit-scrollbar-track
        {
          border-radius: 10px;
	        background-color: transparent; /* Tentar tornar a pista invisível */
          border: none;
        }

        .custom-scroll::-webkit-scrollbar {
          width: 2px;
	        background-color:rgb(31 41 55);
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background-color:  rgb(192 132 252);
        }

      `}</style>
    </div>
  );
};

export default Modal;
