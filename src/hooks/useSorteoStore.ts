import { create } from 'zustand';
import { SorteoInfo, Participante, Exclusion, EstadoVerificacionSorteo } from '@/models/sorteo';

interface SorteoState {
  sorteo: SorteoInfo | null;
  participantes: Participante[];
  exclusiones: Exclusion[];
  puedeRealizar: boolean;
  estadoSorteo: EstadoVerificacionSorteo | null;
  isLoading: boolean;
  error: string | null;

  // Métodos
  fetchSorteo: (token: string) => Promise<void>;
  fetchParticipantes: (token: string) => Promise<void>;
  fetchExclusiones: (token: string) => Promise<void>;
  verificarEstadoSorteo: (token: string) => Promise<void>;
  addParticipante: (token: string, participante: { nombre: string; email: string }) => Promise<void>;
  editParticipante: (token: string, id: number, datos: { nombre: string; email: string }) => Promise<void>;
  deleteParticipante: (token: string, id: number) => Promise<void>;
  addExclusion: (token: string, participanteDeId: number, participanteAId: number) => Promise<void>;
  deleteExclusion: (token: string, participanteDeId: number, participanteAId: number) => Promise<void>;
  realizarSorteo: (token: string) => Promise<void>;
}

const useSorteoStore = create<SorteoState>((set, get) => ({
  sorteo: null,
  participantes: [],
  exclusiones: [],
  puedeRealizar: false,
  estadoSorteo: null,
  isLoading: false,
  error: null,

  fetchSorteo: async (token) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetcheando información del sorteo...');
      const response = await fetch(`/api/sorteos/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Respuesta de fetchSorteo:', response.status, response.statusText);

      if (!response.ok) {
        let errorMsg = 'Error al cargar el sorteo';
        try {
          const errorData = await response.json();
          console.error('Error en fetchSorteo:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en fetchSorteo');
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('Sorteo cargado correctamente');
      set({ sorteo: data, isLoading: false });
    } catch (error: any) {
      console.error('Error en fetchSorteo:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  fetchParticipantes: async (token) => {
    try {
      console.log('Fetcheando participantes...');
      const response = await fetch(`/api/sorteos/${token}/participantes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Respuesta de fetchParticipantes:', response.status, response.statusText);

      if (!response.ok) {
        let errorMsg = 'Error al cargar participantes';
        try {
          const errorData = await response.json();
          console.error('Error en fetchParticipantes:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en fetchParticipantes');
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log(`Participantes cargados: ${data.length}`);
      set({ participantes: data });
    } catch (error: any) {
      console.error('Error al cargar participantes:', error);
      // No establecemos error en el estado para no interrumpir la UI
    }
  },

  fetchExclusiones: async (token) => {
    try {
      console.log('Fetcheando exclusiones...');
      const response = await fetch(`/api/sorteos/${token}/exclusiones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Respuesta de fetchExclusiones:', response.status, response.statusText);

      if (!response.ok) {
        let errorMsg = 'Error al cargar exclusiones';
        try {
          const errorData = await response.json();
          console.error('Error en fetchExclusiones:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en fetchExclusiones');
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log(`Exclusiones cargadas: ${data.length}`);
      set({ exclusiones: data });
    } catch (error: any) {
      console.error('Error al cargar exclusiones:', error);
      // No establecemos error en el estado para no interrumpir la UI
    }
  },

  verificarEstadoSorteo: async (token) => {
    try {
      console.log('Verificando estado del sorteo con token:', token);
      
      let response;
      try {
        // Envolvemos el fetch en un try/catch adicional para capturar errores de red
        response = await fetch(`/api/sorteos/${token}/verificar`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Importante: asegurarnos de que el navegador no cachee esta petición
          cache: 'no-store'
        });
      } catch (fetchError) {
        console.log('Error de conexión al verificar estado del sorteo:', fetchError);
        // Creamos un objeto con valores por defecto para todas las propiedades requeridas
        set({ 
          estadoSorteo: {
            puedeRealizarse: false,
            estado: "PENDIENTE",
            participantesConfirmados: 0,
            participantesPendientes: 0,
            participantesRechazados: 0,
            suficientesParticipantes: false,
            error: "Error de conexión",
            razon: "No se pudo conectar con el servidor"
          },
          puedeRealizar: false
        });
        // Terminamos la ejecución aquí sin mostrar errores en consola
        return;
      }

      // Si llegamos aquí, la conexión se realizó pero podría haber error HTTP
      console.log('Respuesta del servidor (verificarEstadoSorteo):', response.status, response.statusText);
      
      // Si el estado es 500 o cualquier error, manejamos silenciosamente
      if (!response.ok) {
        console.log(`Estado de verificación no disponible: ${response.status} ${response.statusText}`);
        
        // Establecemos valores por defecto para todas las propiedades requeridas
        set({ 
          estadoSorteo: {
            puedeRealizarse: false,
            estado: "PENDIENTE",
            participantesConfirmados: 0,
            participantesPendientes: 0,
            participantesRechazados: 0,
            suficientesParticipantes: false,
            error: `Error HTTP ${response.status}`,
            razon: response.statusText
          },
          puedeRealizar: false
        });
        
        // No intentamos parsear la respuesta de error para evitar errores adicionales
        return;
      }

      // Intentar parsear la respuesta cautelosamente
      try {
        const data = await response.json();
        console.log('Datos recibidos de verificación:', data);
        
        // Verificar que data existe antes de actualizar el estado
        if (data) {
          set({ 
            estadoSorteo: data,
            puedeRealizar: data.puedeRealizarse === true // Aseguramos un booleano
          });
        } else {
          console.log('Respuesta vacía al verificar estado del sorteo');
          // Establecer valores por defecto para todas las propiedades
          set({ 
            estadoSorteo: {
              puedeRealizarse: false,
              estado: "PENDIENTE",
              participantesConfirmados: 0,
              participantesPendientes: 0,
              participantesRechazados: 0,
              suficientesParticipantes: false,
              error: "Respuesta vacía",
              razon: "El servidor devolvió una respuesta vacía"
            },
            puedeRealizar: false
          });
        }
      } catch (jsonError) {
        console.log('Error al parsear JSON en verificarEstadoSorteo:', jsonError);
        // Establecer valores por defecto para todas las propiedades
        set({ 
          estadoSorteo: {
            puedeRealizarse: false,
            estado: "PENDIENTE",
            participantesConfirmados: 0,
            participantesPendientes: 0,
            participantesRechazados: 0,
            suficientesParticipantes: false,
            error: "Error de formato",
            razon: "No se pudo procesar la respuesta del servidor"
          },
          puedeRealizar: false
        });
      }
    } catch (error: any) {
      // Este catch no debería ejecutarse nunca con los cambios anteriores,
      // pero lo mantenemos por seguridad
      console.log('Error inesperado en verificarEstadoSorteo:', error);
      // Establecer valores por defecto para todas las propiedades
      set({ 
        estadoSorteo: {
          puedeRealizarse: false,
          estado: "PENDIENTE",
          participantesConfirmados: 0,
          participantesPendientes: 0,
          participantesRechazados: 0,
          suficientesParticipantes: false,
          error: "Error inesperado",
          razon: error.message || "Ocurrió un error al verificar el estado"
        },
        puedeRealizar: false
      });
    }
  },

  addParticipante: async (token, participante) => {
    try {
      console.log('Añadiendo participante:', participante);
      const response = await fetch(`/api/sorteos/${token}/participantes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participante),
      });

      console.log('Respuesta de addParticipante:', response.status, response.statusText);

      if (!response.ok) {
        let errorMsg = 'Error al añadir participante';
        try {
          const errorData = await response.json();
          console.error('Error en addParticipante:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en addParticipante');
        }
        throw new Error(errorMsg);
      }

      try {
        const data = await response.json();
        console.log('Participante añadido - respuesta completa:', data);
        
        // CORRECCIÓN: Extraer el objeto participante de la respuesta
        // La estructura esperada es {message: string, participante: objeto}
        const nuevoParticipante = data.participante || data;
        
        console.log('Nuevo participante extraído:', nuevoParticipante);
        
        if (!nuevoParticipante || !nuevoParticipante.id) {
          console.error('Estructura de respuesta inesperada en addParticipante:', data);
          // Si no podemos extraer el participante, recargamos la lista
          await get().fetchParticipantes(token);
          return;
        }
        
        // Verificar que el participante ya no existe antes de añadirlo
        const existeParticipante = get().participantes.some(p => p.id === nuevoParticipante.id);
        if (!existeParticipante) {
          console.log('Añadiendo nuevo participante al estado:', nuevoParticipante);
          set({ participantes: [...get().participantes, nuevoParticipante] });
        } else {
          console.log('El participante ya existe, no se añade de nuevo');
          // Recargar la lista de participantes para actualizar
          await get().fetchParticipantes(token);
        }
      } catch (jsonError) {
        console.error('Error al parsear JSON en addParticipante:', jsonError);
        // Recargar la lista de participantes para asegurar consistencia
        await get().fetchParticipantes(token);
      }
    } catch (error: any) {
      console.error('Error en addParticipante:', error);
      throw error;
    }
  },

  editParticipante: async (token, id, datos) => {
    try {
      console.log('Editando participante:', id, datos);
      const response = await fetch(`/api/sorteos/${token}/participantes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });

      console.log('Respuesta de editParticipante:', response.status, response.statusText);

      if (!response.ok) {
        let errorMsg = 'Error al editar participante';
        try {
          const errorData = await response.json();
          console.error('Error en editParticipante:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en editParticipante');
        }
        throw new Error(errorMsg);
      }

      try {
        const data = await response.json();
        console.log('Participante editado:', data);
        set({
          participantes: get().participantes.map(p => p.id === id ? data : p)
        });
      } catch (jsonError) {
        console.error('Error al parsear JSON en editParticipante:', jsonError);
        // Recargar la lista de participantes para asegurar consistencia
        await get().fetchParticipantes(token);
      }
    } catch (error: any) {
      console.error('Error en editParticipante:', error);
      throw error;
    }
  },

  deleteParticipante: async (token, id) => {
    try {
      console.log('Eliminando participante:', id);
      const response = await fetch(`/api/sorteos/${token}/participantes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Respuesta de deleteParticipante:', response.status, response.statusText);

      if (!response.ok) {
        let errorMsg = 'Error al eliminar participante';
        try {
          const errorData = await response.json();
          console.error('Error en deleteParticipante:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en deleteParticipante');
        }
        throw new Error(errorMsg);
      }

      console.log('Participante eliminado correctamente');
      set({
        participantes: get().participantes.filter(p => p.id !== id)
      });
    } catch (error: any) {
      console.error('Error en deleteParticipante:', error);
      throw error;
    }
  },

  addExclusion: async (token, participanteDeId, participanteAId) => {
    try {
      console.log('Añadiendo exclusión:', {participanteDeId, participanteAId});
      const response = await fetch(`/api/sorteos/${token}/exclusiones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participanteDeId, participanteAId }),
      });
  
      console.log('Respuesta de addExclusion:', response.status, response.statusText);
  
      if (!response.ok) {
        let errorMsg = 'Error al añadir exclusión';
        try {
          const errorData = await response.json();
          console.error('Error en addExclusion:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en addExclusion');
        }
        throw new Error(errorMsg);
      }
  
      try {
        const data = await response.json();
        console.log('Exclusión añadida:', data);
        
        // CORRECCIÓN: Extraer la exclusión del objeto de respuesta
        const nuevaExclusion = data.exclusion || data;
        
        // CAMBIO: Verificar que la exclusión no existe ya
        const existeExclusion = get().exclusiones.some(
          e => e.participanteDeId === participanteDeId && e.participanteAId === participanteAId
        );
        
        if (!existeExclusion) {
          // Usar la exclusión extraída, no todo el objeto de respuesta
          set({ exclusiones: [...get().exclusiones, nuevaExclusion] });
        } else {
          console.log('La exclusión ya existe, no se añade de nuevo');
        }
      } catch (jsonError) {
        console.error('Error al parsear JSON en addExclusion:', jsonError);
        // Recargar exclusiones para asegurar consistencia
        await get().fetchExclusiones(token);
      }
    } catch (error: any) {
      console.error('Error en addExclusion:', error);
      throw error;
    }
  },

  deleteExclusion: async (token, participanteDeId, participanteAId) => {
    try {
      console.log('Eliminando exclusión:', {participanteDeId, participanteAId});
      
      // Uso de query parameters en lugar de body con una solicitud DELETE
      const url = `/api/sorteos/${token}/exclusiones?participanteDeId=${participanteDeId}&participanteAId=${participanteAId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
        // Sin body, los parámetros van en la URL
      });
  
      console.log('Respuesta de deleteExclusion:', response.status, response.statusText);
  
      if (!response.ok) {
        let errorMsg = 'Error al eliminar exclusión';
        try {
          const errorData = await response.json();
          console.error('Error en deleteExclusion:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en deleteExclusion');
        }
        throw new Error(errorMsg);
      }
  
      console.log('Exclusión eliminada correctamente');
      set({
        exclusiones: get().exclusiones.filter(
          e => !(e.participanteDeId === participanteDeId && e.participanteAId === participanteAId)
        )
      });
    } catch (error: any) {
      console.error('Error en deleteExclusion:', error);
      throw error;
    }
  },

  realizarSorteo: async (token) => {
    try {
      console.log('Realizando sorteo...');
      const response = await fetch(`/api/sorteos/${token}/realizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Respuesta de realizarSorteo:', response.status, response.statusText);

      if (!response.ok) {
        let errorMsg = 'Error al realizar el sorteo';
        try {
          const errorData = await response.json();
          console.error('Error en realizarSorteo:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error en realizarSorteo');
        }
        throw new Error(errorMsg);
      }

      console.log('Sorteo realizado correctamente');
      // Actualizar estado del sorteo tras realizarlo
      await get().fetchSorteo(token);
    } catch (error: any) {
      console.error('Error en realizarSorteo:', error);
      throw error;
    }
  },
}));

export default useSorteoStore;