import React, { useState } from 'react';
import Image from 'next/image';
import buttonNormal from "../../assets/27-imgs/button.png";
import buttonSelected from "../../assets/27-imgs/buttonSelected.png";

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const ButtonMenuHome: React.FC<ButtonProps> = ({ label, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick();
    setTimeout(() => setIsClicked(false), 200); // Retorna ao estado normal após 200ms
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        display: 'inline-block', 
        zIndex: 2,
        width: '250px',  
        height: '80px',  
        maxWidth: '100%', 
        transform: isClicked ? 'scale(0.95)' : 'scale(1)', // Animação de pressão
        transition: 'transform 0.1s ease', // Animação suave
      }} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick} // Usa a função handleClick
    >
      <Image
        src={isHovered ? buttonSelected : buttonNormal}
        alt="Botão de fundo"
        layout="fill" 
        objectFit="cover" 
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />

      <button
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent', 
          border: 'none',
          width: '100%',  
          height: '100%', 
          fontSize: '1.3em', 
          cursor: 'pointer',
          color: '#fff', 
          textAlign: 'center', 
          padding: '10px 20px',
          fontWeight: 'bold', 
          outline: 'none', // Remove o contorno
        }}
      >
        {label}
      </button>
    </div>
  );
};

export default ButtonMenuHome;
