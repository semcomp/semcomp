import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/contexts/useTheme";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "lg",
  closeOnBackdrop = true,
}: ModalProps) {
  // Sempre chamar hooks incondicionalmente (regra do React)
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;
  if (!open) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  const { isDarkMode } = useTheme();
  const mutedText = isDarkMode ? "text-semcompOffWhite/60" : "text-semcompDarkBlue/60";

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => {
          if (closeOnBackdrop) onClose();
        }}
      />

      <div role="dialog" aria-modal="true" className={`relative z-10 w-full ${sizeClass} mx-4`}>
        <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className={`p-2 rounded-full transition-colors ${mutedText} hover:bg-semcompMidDarkBlue/10 hover:text-semcompDarkBlue cursor-pointer`}
            >
              ✕
            </button>
          </div>

          <div className="p-4 max-h-[70vh] overflow-auto text-sm leading-relaxed text-gray-800 dark:text-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
