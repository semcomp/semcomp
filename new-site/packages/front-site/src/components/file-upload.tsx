import { useRef, useState } from "react"
import type { DragEvent, KeyboardEvent } from "react"
import { AlertCircle, FileText, UploadCloud, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type FileUploadProps = {
  defaultFile?: File | null
  onChange?: (file: File | null) => void
  onError?: (message: string) => void
  accept?: string
  maxSizeMB?: number
  label?: string
  helperText?: string
  disabled?: boolean
  className?: string
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B"

  const units = ["B", "KB", "MB", "GB"]
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent

  const formatted = exponent === 0 ? `${value}` : value.toFixed(1).replace(".", ",")
  return `${formatted} ${units[exponent]}`
}

function isFileTypeAccepted(file: File, accept: string): boolean {
  const acceptedTypes = accept.split(",").map((type) => type.trim().toLowerCase())
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()

  return acceptedTypes.some((type) => {
    if (!type) return false
    if (type.startsWith(".")) return fileName.endsWith(type)
    if (type.endsWith("/*")) return fileType.startsWith(type.replace("/*", "/"))
    return fileType === type
  })
}

function validateFile(file: File, accept?: string, maxSizeMB?: number): string | null {
  if (accept && !isFileTypeAccepted(file, accept)) {
    return `Tipo de arquivo não permitido. Tipos aceitos: ${accept}`
  }

  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    return `O arquivo excede o tamanho máximo de ${maxSizeMB} MB.`
  }

  return null
}

export function FileUpload({
  defaultFile = null,
  onChange,
  onError,
  accept,
  maxSizeMB,
  label = "Arraste um arquivo aqui ou clique para selecionar",
  helperText,
  disabled = false,
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(defaultFile)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function processFile(candidate: File) {
    const validationError = validateFile(candidate, accept, maxSizeMB)

    if (validationError) {
      setError(validationError)
      setFile(null)
      onChange?.(null)
      onError?.(validationError)
      return
    }

    setError(null)
    setFile(candidate)
    onChange?.(candidate)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    event.target.value = ""
    if (selected) processFile(selected)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const dropped = event.dataTransfer.files?.[0]
    if (dropped) processFile(dropped)
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleClick()
    }
  }

  function handleRemove(event: React.MouseEvent) {
    event.stopPropagation()
    setFile(null)
    setError(null)
    onChange?.(null)
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragging && "border-primary bg-primary/5",
          error && "border-destructive bg-destructive/5",
          disabled && "pointer-events-none opacity-50",
          file && "py-4"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleInputChange}
          className="hidden"
        />

        {file ? (
          <div className="flex w-full items-center gap-3">
            <FileText className="size-8 shrink-0 text-primary" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">Tamanho: {formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remover arquivo"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{label}</p>
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export default FileUpload
