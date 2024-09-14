import React from 'react';

interface ModalProps {
  element: string;
  setButtonSelected: (buttonSelected: string) => void;
}

const Modal: React.FC<ModalProps> = ({ element, setButtonSelected }) => {
  return (
    <div className='w-full h-full'>
      <div
        className='absolute z-50 bg-white flex justify-center p-4'
        style={{
          width: 'calc(100% - 4rem)', // Subtraindo 8px de cada lado (total 16px)
          height: 'calc(100% - 4rem)', // Subtraindo 8px do topo e da base
          top: '2rem',
          left: '2rem',
          borderRadius: '1rem',
        }}
      >
        <button
          onClick={() => setButtonSelected('')}
          className='w-10 h-10 rounded-full flex justify-center items-center text-black absolute top-4 right-4 bg-black/20'
        >
          X
        </button>
        {
          element === 'cronograma' && <p className='text-black'>Cronograma</p>
        }
        {
          element === 'faq' && <p className='text-black'>FAQ</p>
        }
      </div>
    </div>
  );
};

export default Modal;
