import { create } from 'zustand';
import { SorteoInfo, Participante, Exclusion, EstadoSorteo, EstadoVerificacionSorteo } from '@/models/sorteo';

interface SorteoStore {
  // Estado
  sorteo: SorteoInfo | null;
  participantes: Participante[];
  exclusiones: Exclusion[];
  puedeRealizar: boolean;
  estadoSorteo: EstadoVerificacionSorteo | null;
  isLoading: boolean;
  error: string;
  
  // Acciones
  setSorteo: (sorteo: SorteoInfo) => void;
  setParticipantes: (participantes: Participante[]) => void;
  setExclusiones: (exclusiones: Exclusion[]) => void;
  setPuedeRealizar: (puedeRealizar: boolean) => void;
  setEstadoSorteo: (estadoSorteo: EstadoVerificacionSorteo) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  
  // Acciones asíncronas
  fetchSorteo: (token: string) => Promise<void>;
  fetchParticipantes: (token: string) => Promise<void>;
  fetchExclusiones: (token: string) => Promise<void>;
  verificarEstadoSorteo: (token: string) => Promise<void>;
  
  // Métodos para gestionar participantes
  addParticipante: (token: string, participante: { nombre: string; email: string }) => Promise<void>;
  editParticipante: (token: string, id: number, datos: { nombre: string; email: string }) => Promise<void>;
  deleteParticipante: (token: string, id: number) => Promise<void>;
  resendInvitation: (token: string, id: number) => Promise<void>;
  
  // Métodos para gestionar exclusiones
  addExclusion: (token: string, participanteDeId: number, participanteAId: number) => Promise<void>;
  deleteExclusion: (token: string, participanteDeId: number, participanteAId: number) => Promise<void>;
  
  // Método para realizar el sorteo
  realizarSorteo: (token: string) => Promise<void>;
}

const useSorteoStore = create<SorteoStore>((set, get) => ({
  // Estado inicial
  sorteo: null,
  participantes: [],
  exclusiones: [],
  puedeRealizar: false,
  estadoSorteo: null,
  isLoading: false,
  error: '',
  
  // Acciones síncronas
  setSorteo: (sorteo) => set({ sorteo }),
  setParticipantes: (participantes) => set({ participantes }),
  setExclusiones: (exclusiones) => set({ exclusiones }),
  setPuedeRealizar: (puedeRealizar) => set({ puedeRealizar }),
  setEstadoSorteo: (estadoSorteo) => set({ estadoSorteo }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Acciones asíncronas
  fetchSorteo: async (token) => {
    set({ isLoading: true, error: '' });
    try {
      const response = await fetch(`/api/sorteos/${token}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener la información del sorteo');
      }

      const data = await response.json();
      set({ 
        sorteo: data, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Error al cargar el sorteo', 
        isLoading: false 
      });
    }
  },
  
  fetchParticipantes: async (token) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/participantes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron obtener los participantes');
      }

      const data = await response.json();
      set({ participantes: data });
    } catch (error: any) {
      console.error('Error al cargar participantes:', error);
    }
  },
  
  fetchExclusiones: async (token) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/exclusiones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron obtener las exclusiones');
      }

      const data = await response.json();
      set({ exclusiones: data });
    } catch (error: any) {
      console.error('Error al cargar exclusiones:', error);
    }
  },
  
  verificarEstadoSorteo: async (token) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/realizar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo verificar el estado del sorteo');
      }

      const data = await response.json();
      set({ 
        estadoSorteo: data,
        puedeRealizar: data.puedeRealizarse 
      });
    } catch (error: any) {
      console.error('Error al verificar estado del sorteo:', error);
    }
  },
  
  addParticipante: async (token, participante) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/participantes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(participante),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al añadir participante');
      }

      // Actualizar lista de participantes
      await get().fetchParticipantes(token);
      await get().verificarEstadoSorteo(token);
    } catch (error: any) {
      throw error;
    }
  },
  
  editParticipante: async (token, id, datos) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/participantes-por-id/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al editar participante');
      }

      // Actualizar lista de participantes
      await get().fetchParticipantes(token);
    } catch (error: any) {
      throw error;
    }
  },
  
  deleteParticipante: async (token, id) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/participantes-por-id/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar participante');
      }

      // Actualizar lista de participantes
      await get().fetchParticipantes(token);
      // Actualizar exclusiones
      await get().fetchExclusiones(token);
      await get().verificarEstadoSorteo(token);
    } catch (error: any) {
      throw error;
    }
  },
  
  resendInvitation: async (token, id) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/participantes-por-id/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al reenviar invitación');
      }
    } catch (error: any) {
      throw error;
    }
  },
  
  addExclusion: async (token, participanteDeId, participanteAId) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/exclusiones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participanteDeId, participanteAId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al añadir exclusión');
      }

      // Actualizar exclusiones
      await get().fetchExclusiones(token);
      await get().verificarEstadoSorteo(token);
    } catch (error: any) {
      throw error;
    }
  },
  
  deleteExclusion: async (token, participanteDeId, participanteAId) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/exclusiones?participanteDeId=${participanteDeId}&participanteAId=${participanteAId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar exclusión');
      }

      // Actualizar exclusiones
      await get().fetchExclusiones(token);
      await get().verificarEstadoSorteo(token);
    } catch (error: any) {
      throw error;
    }
  },
  
  realizarSorteo: async (token) => {
    try {
      const response = await fetch(`/api/sorteos/${token}/realizar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al realizar el sorteo');
      }

      const data = await response.json();
      
      // Actualizar estado del sorteo
      const sorteo = get().sorteo;
      if (sorteo) {
        const sorteoActualizado: SorteoInfo = {
          ...sorteo,
          estado: 'COMPLETO' as EstadoSorteo,
          fechaSorteo: new Date().toISOString()
        };
        set({ 
          sorteo: sorteoActualizado,
          puedeRealizar: false 
        });
      }
      
      return data;
    } catch (error: any) {
      throw error;
    }
  },
}));

export default useSorteoStore;