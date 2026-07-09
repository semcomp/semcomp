import { useState } from "react"
import { FileUpload } from "@/components/file-upload"

export default function FileUploadDemo() {
  const [file, setFile] = useState<File | null>(null)

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-lg font-semibold">Teste — FileUpload</h1>
      <FileUpload
        accept=".pdf,.png,.jpg"
        maxSizeMB={5}
        helperText="PDF, PNG ou JPG até 5MB"
        onChange={setFile}
      />
      <p className="mt-4 text-sm text-muted-foreground">
        Arquivo no estado pai: {file ? file.name : "nenhum"}
      </p>
    </div>
  )
}
