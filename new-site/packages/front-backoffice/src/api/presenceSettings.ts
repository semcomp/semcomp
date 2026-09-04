import client from "./client";

export interface PresenceTypeWeight {
  id: number;
  type_name: string;
  weight: number;
  default_has_attendance: boolean;
}

export interface PresencesSettingsListResponse {
  weights: PresenceTypeWeight[];
}

/**
 * API para gerenciar os pesos de presença por tipo de evento.
 * Qualquer mutação dispara o recálculo automático das taxas no backend.
 */
export const presenceSettingsAPI = {
  getAll: async (): Promise<PresenceTypeWeight[]> => {
    const res = await client.get<PresencesSettingsListResponse>("/admin/presence-settings");
    return res.data.weights ?? [];
  },

  create: async (typeName: string, weight: number, defaultHasAttendance = false): Promise<PresenceTypeWeight> => {
    const res = await client.post<{ weight: PresenceTypeWeight }>("/admin/presence-settings", {
      type_name: typeName,
      weight,
      default_has_attendance: defaultHasAttendance,
    });
    return res.data.weight;
  },

  update: async (currentTypeName: string, typeName: string, weight: number, defaultHasAttendance = false): Promise<PresenceTypeWeight> => {
    const res = await client.put<{ weight: PresenceTypeWeight }>(
      `/admin/presence-settings/${encodeURIComponent(currentTypeName)}`,
      { type_name: typeName, weight, default_has_attendance: defaultHasAttendance }
    );
    return res.data.weight;
  },

  delete: async (typeName: string): Promise<void> => {
    await client.delete(`/admin/presence-settings/${encodeURIComponent(typeName)}`);
  },
};
