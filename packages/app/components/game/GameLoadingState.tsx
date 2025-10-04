import Spinner from "../spinner";

interface GameLoadingStateProps {
  message: string;
  className?: string;
}

function GameLoadingState({ message, className = "" }: GameLoadingStateProps) {
  return (
    <div className={`flex content-center ${className}`}>
      <div className="flex flex-col items-center justify-center text-xl font-secondary py-16">
        <p className="pb-4 text-white">{message}</p>
        <Spinner size="large" />
      </div>
    </div>
  );
}

export default GameLoadingState;