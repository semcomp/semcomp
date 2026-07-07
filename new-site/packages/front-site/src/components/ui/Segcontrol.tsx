import { useState } from "react";

export function useSegmentedControl() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  return { isLogin, setIsLogin };
}

interface SegmentedControlProps {
  islogin: boolean;
  setIslogin: (value: boolean) => void;
  hook?: () => void
}

export default function SegmentedControl({ islogin, setIslogin, hook }: SegmentedControlProps){
  return (
    <div className="flex items-center justify-center pb-8 pt-2">
      <div className="relative flex w-64 h-15 p-1 bg-semcompDarkBlue dark:bg-semcompDarkBlue border border-semcompOffWhite rounded-full overflow-hidden">

        <div
          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-semcompOffWhite rounded-full transition-transform duration-300 ease-in-out ${
            !islogin ? 'translate-x-full' : 'translate-x-0'
          }`}
        />

        <button
          type="button"
          onClick={() => {
            setIslogin(true)
            if(hook) hook()
          }}
          className={`relative z-10 flex-1 text-sm font-medium transition-colors duration-300 ${
            islogin ? 'text-semcompDarkBlue' : 'text-semcompOffWhite'
          }`}
        >
          ENTRAR
        </button>

        <button
          type="button"
          onClick={() => {
            setIslogin(false)
            if(hook) hook()
          }}
          className={`relative z-10 flex-1 text-sm font-medium transition-colors duration-300 ${
            !islogin ? 'text-semcompDarkBlue' : 'text-semcompOffWhite'
          }`}
        >
          CADASTRAR
        </button>
      </div>
    </div>
  );
};
