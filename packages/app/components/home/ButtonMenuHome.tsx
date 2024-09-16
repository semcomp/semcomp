import React from 'react';

interface ButtonProps {
  label: string;
  timeIndex: number;
  onClick: () => void;
}

function bgColorButton(timeIndex: number) {
  if (timeIndex <= 6) {
    return 'bg-white';
  } else {
    return 'bg-white';
  }
}

const ButtonMenuHome: React.FC<ButtonProps> = ({ label, timeIndex, onClick }) => {
  return (
    <div style={ {position: 'relative', display: 'inline-block', zIndex: 2}}>
      <div className='pixelbutton hover:scale-110'>
      <button
        // style={{ textShadow: '1px 1px 2px black' }} // Corrigido para um objeto
        className={`transition-all max-w-full text-black text-medium sm:text-medium md:text-superlarge font-bold py-2 flex justify-center w-80 ${bgColorButton(timeIndex)}`}
        onClick={onClick}
      >
        {label}
      </button>
      </div>
    </div>
  );
};

export default ButtonMenuHome;
