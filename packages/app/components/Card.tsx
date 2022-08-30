function Card({ children, className }: { children: any, className?: string }) {
  return (
    <div className={`backdrop-brightness-95 backdrop-blur shadow-md ${className}`}>
      {children}
    </div>
  );
}

export default Card;