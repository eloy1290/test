import { create } from 'zustand';
import { SorteoInfo, Participante, Exclusion, EstadoVerificacionSorteo } from '@/models/sorteo';

// Define el tipo para el resultado de addParticipante
export interface AddParticipanteResult {
  success: boolean;
  isDuplicate?: boolean;
  message?: string;
}

// Tipo para el resultado de editParticipante
export interface EditParticipanteResult {
  success: boolean;
  isDuplicate?: boolean;
  notFound?: boolean;
  isAlternative?: boolean;
  validationErrors?: { [key: string]: string[] };
  message?: string;
}

// Define el tipo para el resultado de eliminar un participante
export interface DeleteParticipanteResult {
  success: boolean;
  notFound?: boolean;
  message?: string;
}

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
  addParticipante: (token: string, participante: { nombre: string; email: string }) => Promise<AddParticipanteResult>;
  editParticipante: (token: string, id: number, datos: { nombre: string; email: string }) => Promise<EditParticipanteResult>;
  deleteParticipante: (token: string, id: number) => Promise<DeleteParticipanteResult>;
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
  
      // Manejo específico para correo duplicado
      if (response.status === 400) {
        const errorData = await response.json();
        
        // Verificar si el error es de correo duplicado
        if (errorData.error && (
            errorData.error.includes('email') || 
            errorData.error.includes('correo') ||
            errorData.error.includes('duplicado') ||
            errorData.error.includes('ya existe')
          )) {
          // Retornamos un objeto con información sobre el caso de correo duplicado
          return {
            success: false,
            isDuplicate: true,
            message: `El correo ${participante.email} ya está registrado en este sorteo.`
          };
        }
        
        // Si es otro tipo de error 400
        throw new Error(errorData.error || 'Error al añadir participante');
      }
  
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
        
        // Extraer el objeto participante de la respuesta
        const nuevoParticipante = data.participante || data;
        
        console.log('Nuevo participante extraído:', nuevoParticipante);
        
        if (!nuevoParticipante || !nuevoParticipante.id) {
          console.error('Estructura de respuesta inesperada en addParticipante:', data);
          // Si no podemos extraer el participante, recargamos la lista
          await get().fetchParticipantes(token);
          return { success: true };
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
        
        return { success: true };
      } catch (jsonError) {
        console.error('Error al parsear JSON en addParticipante:', jsonError);
        // Recargar la lista de participantes para asegurar consistencia
        await get().fetchParticipantes(token);
        return { success: true };
      }
    } catch (error: any) {
      console.error('Error en addParticipante:', error);
      throw error;
    }
  },

  editParticipante: async (token, id, datos) => {
    try {
      // Convertir ID a número si es necesario para asegurar consistencia
      const participanteId = Number(id);
      
      // Construir la URL usando una plantilla consistente
      const url = `/api/sorteos/${token}/participantes-por-id/${id}`;
      
      console.log(`Editando participante ${participanteId}, URL: ${url}`);
      console.log('Datos a enviar:', datos);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
        // Desactivar la caché para evitar problemas
        cache: 'no-store'
      });
  
      console.log(`Respuesta de editParticipante: ${response.status} ${response.statusText}`);
      console.log(`URL completa: ${response.url}`);
  
      // Primero verificamos si la respuesta tiene contenido antes de intentar parsearla
      const contentType = response.headers.get("content-type");
      const hasJsonContent = contentType && contentType.includes("application/json");
      
      // Manejo específico para el error 404 (No encontrado)
      if (response.status === 404) {
        let mensaje = `El participante con ID ${participanteId} no puede ser editado. URL: ${url}`;
        
        if (hasJsonContent) {
          try {
            const errorData = await response.json();
            if (errorData.error) {
              mensaje = errorData.error;
            }
          } catch (e) {
            console.error('Error al parsear JSON en respuesta 404:', e);
          }
        }
        
        return {
          success: false,
          notFound: true,
          message: mensaje
        };
      }
  
      // Manejo específico para correo duplicado (400)
      if (response.status === 400) {
        let errorMessage = 'Error al editar participante';
        let validationErrors = undefined;
        
        if (hasJsonContent) {
          try {
            const errorData = await response.json();
            
            // Verificar si el error es de correo duplicado
            if (errorData.error && (
                errorData.error.includes('email') || 
                errorData.error.includes('correo') ||
                errorData.error.includes('duplicado') ||
                errorData.error.includes('ya existe')
              )) {
              return {
                success: false,
                isDuplicate: true,
                message: `El correo ${datos.email} ya está registrado en este sorteo.`
              };
            }
            
            // Si contiene detalles de validación del schema Zod
            if (errorData.details) {
              validationErrors = errorData.details;
              errorMessage = 'Los datos no cumplen con los requisitos';
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            console.error('No se pudo parsear la respuesta de error (400):', e);
            errorMessage = 'Error al editar participante: formato de respuesta inválido';
          }
        }
        
        return {
          success: false,
          validationErrors,
          message: errorMessage
        };
      }
  
      // Para cualquier otro error HTTP
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText || 'Error desconocido al editar participante'}`
        };
      }
  
      // Procesar respuesta exitosa
      if (hasJsonContent) {
        try {
          const data = await response.json();
          console.log('Participante editado - respuesta completa:', data);
          
          // Extraer el participante actualizado de la respuesta
          // La estructura esperada es {message: string, participante: objeto}
          const participanteActualizado = data.participante || data;
          
          console.log('Participante actualizado extraído:', participanteActualizado);
          
          if (!participanteActualizado || !participanteActualizado.id) {
            console.error('Estructura de respuesta inesperada en editParticipante:', data);
            // Si no podemos extraer el participante, recargamos la lista
            await get().fetchParticipantes(token);
            return { success: true };
          }
          
          // Actualizar el estado con el participante editado
          set({
            participantes: get().participantes.map(p => 
              p.id === participanteId ? participanteActualizado : p
            )
          });
          
          return { success: true };
        } catch (jsonError) {
          console.error('Error al parsear JSON en respuesta exitosa:', jsonError);
        }
      }
      
      // Si no pudimos parsear la respuesta JSON o no era JSON, recargamos la lista
      console.log('Recargando lista de participantes después de edición...');
      await get().fetchParticipantes(token);
      
      return { 
        success: true, 
        message: 'Cambios guardados, pero hubo un problema al procesar la respuesta. La lista ha sido recargada.' 
      };
    } catch (error: any) {
      console.error('Error en editParticipante:', error);
      // Error de red o excepción no controlada
      return {
        success: false,
        message: error.message || 'Error de conexión al editar participante'
      };
    }
  },

  deleteParticipante: async (token, id) => {
    try {
      console.log('Eliminando participante:', id);
      
      // Construir la URL correcta
      const url = `/api/sorteos/${token}/participantes-por-id/${id}`;
      console.log(`URL para eliminar: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
  
      console.log('Respuesta de deleteParticipante:', response.status, response.statusText);
  
      // Verificar si la respuesta tiene contenido JSON
      const contentType = response.headers.get("content-type");
      const hasJsonContent = contentType && contentType.includes("application/json");
  
      // Manejo específico para el error 404 (No encontrado)
      if (response.status === 404) {
        let mensaje = `El participante con ID ${id} no existe o ya ha sido eliminado.`;
        
        if (hasJsonContent) {
          try {
            const errorData = await response.json();
            if (errorData.error) {
              mensaje = errorData.error;
            }
          } catch (e) {
            console.error('Error al parsear JSON en respuesta 404:', e);
          }
        }
        
        return {
          success: false,
          notFound: true,
          message: mensaje
        };
      }
  
      // Para cualquier otro error HTTP
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText || 'Error desconocido al eliminar participante'}`;
        
        if (hasJsonContent) {
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMsg = errorData.error;
            }
          } catch (e) {
            // No hacer log del error para evitar ruido en la consola
            // Solo informar que no pudimos parsear la respuesta
          }
        }
        
        return {
          success: false,
          message: errorMsg
        };
      }
  
      // En caso de éxito
      console.log('Participante eliminado correctamente');
      
      // Actualizar el estado local eliminando el participante
      set({
        participantes: get().participantes.filter(p => p.id !== id)
      });
      
      return { 
        success: true,
        message: 'Participante eliminado correctamente' 
      };
    } catch (error: any) {
      console.error('Error en deleteParticipante:', error);
      
      // En lugar de lanzar un error, devolver un objeto con información
      return {
        success: false,
        message: error.message || 'Error de conexión al eliminar participante'
      };
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