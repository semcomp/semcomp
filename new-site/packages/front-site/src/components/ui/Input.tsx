import { useTheme } from "@/contexts/useTheme"

type InputProps = {
    label: string
    type?: string
    value: string
    isDarkMode?: boolean
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
    return (
      <div className="mb-3">
        <div className="text-sm mb-2">{label}</div>
        <input
          className={`w-full px-3 py-4 rounded-md border-2 ${ isDarkMode ? "border-semcompMidDarkBlue" : "border-semcompOffWhite bg-semcompMidDarkBlue"} text-sm focus:shadow-input focus:border-none transition`}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-label={label}
        />
      </div>
    )
  }