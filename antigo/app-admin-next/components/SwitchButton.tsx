import { InputHTMLAttributes } from "react";

//Aceita qualquer att do input e adiciona mais 3.
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  isChecked?: boolean,
  setIsChecked: (checked: boolean) => void;
  setIsCheckedDataBase?: (setSignup: boolean) => Promise<any>;
};

function SwitchButton({isChecked, setIsChecked, setIsCheckedDataBase, ...props}: InputProps) {
  //Função que alterar o estado do input e alterar o valor no bd.
  const toggleChecked = async () => {
    setIsChecked(!isChecked);//altera o estado do input
    try {
      await setIsCheckedDataBase(!isChecked);//altera no bd
    } catch (error) {
      console.error('Erro ao alterar o valor no Banco de dados(SwitchButton.tsx):', error);
    }
  };

  return (
    
    <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={toggleChecked}
          {...props} 
        />

        {/* Créditos: https://uiverse.io/Javierrocadev/swift-snake-43 */}
        <div 
          className="group peer ring-0 bg-red-500  rounded-full 
          outline-none duration-300 after:duration-300 w-24 h-12  
          shadow-md peer-checked:bg-emerald-500  peer-focus:outline-none  
          after:content-['✖️']  after:rounded-full after:absolute 
          after:bg-gray-50 after:outline-none after:h-10 after:w-10 
          after:top-1 after:left-1 after:flex after:justify-center 
          after:items-center peer-checked:after:translate-x-12 
          peer-checked:after:content-['✔️'] peer-hover:after:scale-95"
        >
        </div>
    </label>
  );
}

export default SwitchButton;
