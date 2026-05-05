import Modal from "@/components/ui/Modal";

type TermsModalProps = {
  open: boolean;
  onClose: () => void;
  content?: string | null;
  title?: string;
};

export default function TermsModal({ open, onClose, content, title = "Termos de Serviço" }: TermsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="whitespace-pre-wrap">{content ?? "Carregando..."}</div>
    </Modal>
  );
}
