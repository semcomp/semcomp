import { type CrudField } from "@/components/CrudTable";

export const fields: CrudField[] = [
  { value: "hint1", label: "Título", type: "textarea" },
  // Pré-visualização ao vivo do link da imagem (campo abaixo). Só existe nos
  // modais de criar/editar — hideInTable tira da tabela, já que não é um
  // valor de verdade em si (lê o valor de "imageUrl" via previewFrom).
  { value: "imagePreview", label: "Pré-visualização", type: "image-preview", previewFrom: "imageUrl", hideInTable: true },
  { value: "imageUrl", label: "Link da Imagem", type: "text" },
  { value: "hint2", label: "Subtítulo", type: "textarea" },
  { value: "answer", label: "Resposta", type: "text" },
  // Ativar/desativar só pelo switch dedicado na tabela (efeito imediato, ver
  // Riddles/index.tsx) — readonly tira do form de criação, hideInEdit tira do
  // modal de edição inteiramente (não aparece nem como somente leitura).
  { value: "isActive", label: "Ativo", type: "boolean", interactiveToggle: true, readonly: true, hideInEdit: true },
];
