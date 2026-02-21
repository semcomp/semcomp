import React, { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const ButtonMenuHome: React.FC<ButtonProps> = ({ label, onClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150); // Reset após 150ms
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative w-48 h-12 max-w-full
        text-white font-secondary text-base font-medium
        rounded-full shadow-md
        transform transition-all duration-200 ease-in-out
        hover:scale-105 hover:shadow-lg
        active:scale-95
        border-2 border-transparent
        hover:border-secondary
        focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50
        overflow-hidden
        ${isClicked ? 'scale-95' : ''}
      `}
      style={{
        backgroundColor: isClicked ? '#4A90E2' : '#242d5c',
        overflow: 'hidden'
      }}
    >
      {label}
    </button>
  );
};

export default ButtonMenuHome;
