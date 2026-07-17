import { useState } from "react"
import { useTheme } from "@/contexts/useTheme"
import { Eye, EyeOff } from "lucide-react"

type InputProps = {
    label: string
    type?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    required?: boolean
  }

  // Componente de input customizado que já com estilizações
  export default function Input({

    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
  }: InputProps) {
    const { isDarkMode } = useTheme()
    const isPassword = type === "password"
    const [showPassword, setShowPassword] = useState(false)
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div className="mb-3">
        <div className="text-sm mb-2">{label}</div>
        <div className="relative">
          <input
            className={`w-full px-3 py-4 rounded-md border-2 ${isPassword ? "pr-11" : ""} ${ isDarkMode ? "border-semcompMidDarkBlue" : "border-semcompOffWhite bg-semcompMidDarkBlue"} text-sm focus:shadow-input focus:border-none transition`}
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            aria-label={label}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-semcompMidDarkBlue opacity-70 hover:opacity-100 transition"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    )
  }
