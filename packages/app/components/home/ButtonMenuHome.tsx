import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const ButtonMenuHome: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block', zIndex: 2 }}>
      <div className="md:hover:scale-110">
        <button
          className={`pixelbutton transition-all max-w-full text-black text-xl font-bold py-2 flex justify-center w-72`}
          onClick={onClick}
          style={{
            boxShadow: `
              inset -2px 2px 1px 1px grey,
              inset -2px -2px 1px 1px lightgray,
              inset 2px 0px 1px 1px lightgray
            `,
            outline: 'none' // Adiciona essa propriedade para remover o contorno
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,0.2)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = `
              inset -2px 2px 1px 1px grey,
              inset -2px -2px 1px 1px lightgray,
              inset 2px 0px 1px 1px lightgray
            `;
          }}
        >
          {label}
        </button>
      </div>
    </div>
  );
};

export default ButtonMenuHome;
