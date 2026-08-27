import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import FileUpload from "@/components/file-upload";
import { useNotification } from "@/contexts/NotificationContext";
import { papfeAPI } from "@/api";
import type { PapfeDocumentType } from "@/types/PapfeDocumentType";
import { papfeStatusOf } from "@/types/PapfeDocumentType";
import { PapfeStatusBadge } from "@/components/PapfeStatusBadge";

type PapfeUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (doc: PapfeDocumentType) => void;
};

export default function PapfeUploadModal({
  open,
  onClose,
  onSubmitted,
}: PapfeUploadModalProps) {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<PapfeDocumentType | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setSubmitted(false);
    setCurrentDoc(null);
    setNewFile(null);

    (async () => {
      try {
        const existing = await papfeAPI.getMine();
        if (cancelled) return;
        setCurrentDoc(existing);
      } catch {
        if (!cancelled) {
          showNotification("Erro ao carregar o comprovante PAPFE.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, showNotification]);

  const handleClose = () => {
    setLoading(false);
    setCurrentDoc(null);
    setNewFile(null);
    setSubmitting(false);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!newFile) {
      showNotification("Anexe o comprovante PAPFE.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await papfeAPI.update(newFile);
      const updated = await papfeAPI.getMine();
      showNotification(
        currentDoc
          ? "Comprovante PAPFE atualizado! Ficará em análise."
          : "Comprovante PAPFE enviado! Ficará em análise.",
        "success"
      );
      setSubmitted(true);
      if (updated) onSubmitted?.(updated);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })
        ?.response?.data;
      const msg =
        data?.error ||
        data?.message ||
        (err as { message?: string })?.message ||
        "Erro ao enviar o comprovante PAPFE";
      showNotification(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Comprovante PAPFE"
      size="md"
    >
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Carregando...
        </div>
      ) : submitted ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <PapfeStatusBadge status="pendente" />
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            Seu comprovante foi enviado e está em análise. Assim que a
            organização decidir, você poderá acompanhar o resultado aqui.
          </p>
          <button
            onClick={handleClose}
            className="mt-2 rounded-lg bg-semcompDarkBlue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semcompMidDarkBlue dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white"
          >
            Fechar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Envie seu comprovante do Programa de Apoio ao Estudante (PAPFE)
            para análise. Comprovantes aprovados dão direito a 50% de
            desconto nos produtos da loja.
          </p>

          {currentDoc && papfeStatusOf(currentDoc) === "rejeitado" && (
            <div className="flex items-center gap-2 rounded-md border border-orange-700/30 bg-orange-700/10 px-3 py-2">
              <PapfeStatusBadge status="rejeitado" />
              <p className="text-xs text-gray-600 dark:text-gray-300">
                O comprovante enviado foi considerado inválido
                {currentDoc.rejection_reason
                  ? `: ${currentDoc.rejection_reason}`
                  : "."}{" "}
                Anexe um documento válido abaixo para reenviar para análise.
              </p>
            </div>
          )}

          {currentDoc && papfeStatusOf(currentDoc) !== "rejeitado" && (
            <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 dark:border-white/20 dark:bg-gray-800">
              <PapfeStatusBadge status={papfeStatusOf(currentDoc)} />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Comprovante atual:{" "}
                <span className="font-medium">{currentDoc.filename}</span>
              </span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {currentDoc ? "Substituir comprovante" : "Comprovante PAPFE"} *
            </label>
            <FileUpload
              key={open ? "papfe-file-open" : "papfe-file-closed"}
              onChange={(file) => setNewFile(file)}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              maxSizeMB={10}
              label={
                currentDoc
                  ? "Clique para substituir o comprovante"
                  : "Arraste o comprovante ou clique para selecionar"
              }
              helperText="PDF, JPEG, PNG ou WebP · máx. 10 MB"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-2 rounded-lg bg-semcompDarkBlue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semcompMidDarkBlue disabled:cursor-not-allowed disabled:opacity-50 dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white"
          >
            {submitting
              ? "Enviando..."
              : currentDoc
                ? "Substituir Comprovante"
                : "Enviar Comprovante"}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            * O comprovante será avaliado pela organização. Enviar um novo
            arquivo reinicia a análise, mesmo que o anterior já tenha sido
            aprovado ou rejeitado.
          </p>
        </div>
      )}
    </Modal>
  );
}
