import React from 'react';

const SimpleBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 w-full h-full"
      style={{
        background: `linear-gradient(135deg, #242d5c 0%, #5A6AC7 50%, #4A90E2 100%)`,
        zIndex: -1,
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      {/* Overlay sutil para suavizar o gradiente */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(248, 249, 250, 0.1) 0%, rgba(36, 45, 92, 0.3) 100%)',
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      />
    </div>
  );
};

export default SimpleBackground; 