import client from "./client";
import type { ParticipationType } from "@/types/ParticipationType";

export interface ParticipationsListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string | null;
  search_value: string | null;
  total_records: number;
  filtered_records: number;
  presences: ParticipationType[];
}

// Mapeador para padronizar dados do backend
const mapBackendParticipation = (participation: any): ParticipationType => {
  return {
    id: `${participation.name}__${participation.event_name}__${participation.event_init_date}`,
    nameUser: participation.name,
    nameEvent: participation.event_name,
    dateEvent: participation.event_init_date,
    userBackoffice: participation.email_admin,
  };
};

// Helper para garantir formato RFC3339
const ensureRFC3339 = (dateValue: any): string => {
  if (!dateValue) throw new Error('Data não fornecida');
  
  // Se for Date object, converter para ISO string
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  
  // Se for string, garantir formato RFC3339
  const dateStr = String(dateValue).trim();
  if (dateStr.includes('T')) {
    // Já tem horário
    return dateStr;
  }
  
  // Só tem data (YYYY-MM-DD), adicionar hora padrão
  return `${dateStr}T09:00:00Z`;
};

export const participationsAPI = {
  // READ - Listar todas as participações
  getAll: async (
    page = 1,
    limit = 50,
    sortBy = "event_init_date",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<ParticipationsListResponse> => {
    let url = `/admin/presences?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;
    if (searchBy && searchValue) {
      url += `&search_by=${searchBy}&search_value=${searchValue}`;
    }
    const response = await client.get<any>(url);
    
    // Backend retorna 'Presences' com P maiúsculo
    const presencesList = response.data.Presences || response.data.presences || [];
    
    return {
      page: response.data.page || page,
      limit: response.data.limit || limit,
      sort_by: response.data.sort_by || sortBy,
      sort_order: response.data.sort_order || sortOrder,
      search_by: response.data.search_by || null,
      search_value: response.data.search_value || null,
      total_records: response.data.total_records || response.data.TotalRecords || 0,
      filtered_records: response.data.filtered_records || response.data.FilteredRecords || 0,
      presences: presencesList.map(mapBackendParticipation),
    };
  },

  // READ - Buscar uma participação específica
  getByNameEventDate: async (
    name: string,
    eventName: string,
    eventInitDate: string
  ): Promise<ParticipationType> => {
    // Converter data para RFC3339 se necessário
    let dateStr = eventInitDate;
    if (dateStr && !dateStr.includes("T")) {
      dateStr = `${dateStr}T09:00:00Z`;
    }
    
    // Codificar parâmetros para URLs com espaços e acentos
    const encodedName = encodeURIComponent(name);
    const encodedEventName = encodeURIComponent(eventName);
    const encodedDate = encodeURIComponent(dateStr);
    
    const response = await client.get<any>(
      `/admin/presences/${encodedName}/${encodedEventName}/${encodedDate}`
    );
    return mapBackendParticipation(response.data);
  },

  // CREATE - Criar nova participação
  create: async (
    data: Omit<ParticipationType, "id">
  ): Promise<ParticipationType> => {
    try {
      const payloadToSend = {
        name: data.nameUser,
        event_name: data.nameEvent,
        event_init_date: ensureRFC3339(data.dateEvent),
        email_admin: data.userBackoffice,
      }; 
      
      // Verificar se já existe
      try {
        await participationsAPI.getByNameEventDate(
          data.nameUser,
          data.nameEvent,
          data.dateEvent
        );
        // Se chegou aqui, já existe
        throw new Error("Esta participação já foi cadastrada para este evento e data.");
      } catch (checkError: any) {
        // Se foi erro 404, é ok (não existe ainda)
        if (checkError.response?.status === 404) {
        } else if (checkError.message?.includes("já foi cadastrada")) {
          throw checkError;
        } else {
          // Se foi outro erro, continuar mesmo assim
          console.warn("Aviso ao verificar existência:", checkError.message);
        }
      }
      
      const response = await client.post<{ message: string; presence: any }>(
        "/admin/presences",
        payloadToSend
      );
      
      return mapBackendParticipation(response.data.presence);
    } catch (error: any) {
      
      // Tratar erros específicos
      if (error.response?.status === 500) {
        const errorMsg = error.response?.data?.error || "";
        if (errorMsg.includes("duplicate key")) {
          throw new Error("Esta participação já existe! Não é possível cadastrar a mesma pessoa no mesmo evento na mesma data.");
        }
      }
      
      throw error;
    }
  },

  // UPDATE - Atualizar participação
  update: async (
    originalName: string,
    originalEventName: string,
    originalEventInitDate: string,
    data: ParticipationType
  ): Promise<ParticipationType> => {
    try {
      // Garantir ambas as datas em RFC3339
      let originalDate = originalEventInitDate;
      if (originalDate && !originalDate.includes("T")) {
        originalDate = `${originalDate}T09:00:00Z`;
      }
      
      const payloadToSend = {
        name: data.nameUser,
        event_name: data.nameEvent,
        event_init_date: ensureRFC3339(data.dateEvent),
        email_admin: data.userBackoffice,
      };
      
      // Codificar parâmetros para URLs com espaços e acentos
      const encodedOriginalName = encodeURIComponent(originalName);
      const encodedOriginalEventName = encodeURIComponent(originalEventName);
      const encodedOriginalDate = encodeURIComponent(originalDate);
      
      await client.put<{ message: string }>(
        `/admin/presences/${encodedOriginalName}/${encodedOriginalEventName}/${encodedOriginalDate}`,
        payloadToSend
      );
      
      // Backend retorna só a mensagem, não o objeto. Retornar os dados enviados
      return {
        id: `${data.nameUser}__${data.nameEvent}__${data.dateEvent}`,
        nameUser: data.nameUser,
        nameEvent: data.nameEvent,
        dateEvent: data.dateEvent,
        userBackoffice: data.userBackoffice,
      };
    } catch (error: any) {
      const errorMessage = 
        error.message || 
        error.response?.data?.message || 
        error.response?.data?.error ||
        "Erro ao editar participação";
      throw new Error(errorMessage);
    }
  },

  // DELETE - Deletar participação
  delete: async (
    name: string,
    eventName: string,
    eventInitDate: string
  ): Promise<{ message: string }> => {
    // Garantir data em RFC3339
    let dateStr = eventInitDate;
    if (dateStr && !dateStr.includes("T")) {
      dateStr = `${dateStr}T09:00:00Z`;
    }
    
    // Codificar parâmetros para URLs com espaços e acentos
    const encodedName = encodeURIComponent(name);
    const encodedEventName = encodeURIComponent(eventName);
    const encodedDate = encodeURIComponent(dateStr);
    
    return client
      .delete<{ message: string }>(
        `/admin/presences/${encodedName}/${encodedEventName}/${encodedDate}`
      )
      .then((res) => res.data);
  },
};
