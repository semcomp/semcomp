import { useTheme } from "@/contexts/useTheme"
import type { ReactNode, ChangeEvent } from "react"

type SelectProps = {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  required?: boolean
  children: ReactNode
}

export default function Select({
  label,
  value,
  onChange,
  placeholder = "Selecione...",
  required = false,
  children,
}: SelectProps) {
  const { isDarkMode } = useTheme()

  return (
    <div className="mb-3">
      <div className="text-sm mb-2">{label}</div>
      <select
        className={`w-full px-3 py-4 rounded-md border-2 ${
          isDarkMode
            ? "border-semcompMidDarkBlue"
            : "border-semcompOffWhite bg-semcompMidDarkBlue"
        } text-sm text-white focus:shadow-input focus:border-none transition cursor-pointer outline-none`}
        value={value}
        onChange={onChange}
        required={required}
        aria-label={label}
      >
        {placeholder && (
          <option value="" disabled className="bg-semcompDarkBlue text-gray-300">
            {placeholder}
          </option>
        )}
        
        {children}
      </select>
    </div>
  )
}