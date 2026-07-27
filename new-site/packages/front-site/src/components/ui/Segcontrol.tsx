import { useState } from "react";
import { useTheme } from "@/contexts/useTheme";

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
  const { isDarkMode } = useTheme();

  return (
    <div className="flex items-center justify-center pb-8 pt-2">
      <div className={`relative flex w-64 h-15 p-1 rounded-full overflow-hidden border ${
        isDarkMode
          ? "bg-semcompDarkBlue border-semcompOffWhite"
          : "bg-semcompMidDarkBlue border-semcompMidDarkBlue"
      }`}>

        <div
          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full transition-transform duration-300 ease-in-out ${
            isDarkMode ? "bg-semcompOffWhite" : "bg-semcompOffWhite"
          } ${!islogin ? 'translate-x-full' : 'translate-x-0'}`}
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
