import { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;


function SwitchButton({...props}: InputProps) {
  return (
    /* Créditos: https://uiverse.io/Javierrocadev/swift-snake-43 */
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" {...props} />
        <div className="group peer ring-0 bg-red-500  rounded-full outline-none duration-300 after:duration-300 w-24 h-12  shadow-md peer-checked:bg-emerald-500  peer-focus:outline-none  after:content-['✖️']  after:rounded-full after:absolute after:bg-gray-50 after:outline-none after:h-10 after:w-10 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-checked:after:translate-x-12 peer-checked:after:content-['✔️'] peer-hover:after:scale-95">
        </div>
    </label>
  );
}

export default SwitchButton;
