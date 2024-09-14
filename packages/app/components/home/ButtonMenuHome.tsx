import React from 'react';

interface ButtonProps {
  label: string;
  timeIndex: number;
  onClick: () => void;
}

function bgColorButton(timeIndex: number) {
  if (timeIndex <= 6) {
    return 'bg-black/30';
  } else {
    return 'bg-gray/30';
  }
}

const ButtonMenuHome: React.FC<ButtonProps> = ({ label, timeIndex, onClick }) => {
  return (
    <button
      style={{ textShadow: '1px 1px 2px black' }} // Corrigido para um objeto
      className={`rounded-lg hover:scale-110 transition-all max-w-full text-white text-medium sm:text-large md:text-superlarge font-bold py-2 flex justify-center w-80 ${bgColorButton(timeIndex)}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default ButtonMenuHome;
