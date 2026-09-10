import { useCallback, useEffect, useState } from "react";
import { absenceJustificationsAPI } from "@/api/absenceJustifications";
import { useNotification } from "@/contexts/NotificationContext";
import type {
  AbsenceJustificationType,
  AbsenceJustificationStatus,
} from "@/types/AbsenceJustificationType";

/**
 * Isola a integração com a API de Justificativa de Ausência para
 * facilitar a troca/ajuste dos endpoints quando o backend for implementado.
 */
export function useAbsenceJustifications() {
  const { showNotification } = useNotification();
  const [justifications, setJustifications] = useState<
    AbsenceJustificationType[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchJustifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await absenceJustificationsAPI.getAll();
      setJustifications(data);
    } catch {
      showNotification("Erro ao carregar justificativas de ausência", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchJustifications();
  }, [fetchJustifications]);

  const updateStatus = useCallback(
    async (
      id: number,
      status: AbsenceJustificationStatus,
      rejectionReason?: string
    ) => {
      await absenceJustificationsAPI.updateStatus(id, status, rejectionReason);
      setJustifications((prev) =>
        prev.map((j) =>
          j.id === id
            ? {
                ...j,
                status,
                rejection_reason: rejectionReason ?? null,
              }
            : j
        )
      );
    },
    []
  );

  const getAttachmentUrl = useCallback(async (id: number) => {
    const blob = await absenceJustificationsAPI.getAttachment(id);
    return URL.createObjectURL(blob);
  }, []);

  return {
    justifications,
    loading,
    refetch: fetchJustifications,
    updateStatus,
    getAttachmentUrl,
  };
}
