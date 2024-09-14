import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const ButtonMenuHome: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button
      className="bg-black/30 hover:bg-black/40 text-white text-superlarge font-bold py-2 flex justify-center w-80"
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default ButtonMenuHome;