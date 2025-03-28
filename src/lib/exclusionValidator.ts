// Función validadora para verificar si un conjunto de exclusiones permite un sorteo válido

// No importamos Exclusion del modelo para evitar problemas de tipos
// import { Exclusion } from '@/models/sorteo';

// Definimos nuestras propias interfaces simplificadas para uso local
interface ParticipanteSimple {
    id: number;
    nombre: string;
  }
  
  // Interfaz simplificada de exclusión para evitar problemas con propiedades requeridas
  interface ExclusionSimple {
    participanteDeId: number;
    participanteAId: number;
  }
  
  /**
   * Verifica si un conjunto de exclusiones permite realizar un sorteo válido
   * @param participantes Lista de participantes
   * @param exclusiones Lista de exclusiones actuales
   * @param nuevaExclusion Nueva exclusión a evaluar (opcional)
   * @returns Objeto con el resultado de la validación
   */
  export function validarExclusiones(
    participantes: ParticipanteSimple[],
    exclusiones: ExclusionSimple[],
    nuevaExclusion?: { participanteDeId: number; participanteAId: number }
  ): { 
    esValido: boolean; 
    mensaje: string;
    participantesProblema?: string[];
    nivelAlerta?: 'bajo' | 'medio' | 'alto';
  } {
    // Si no hay suficientes participantes, no se puede validar
    if (participantes.length < 3) {
      return {
        esValido: false,
        mensaje: "Se necesitan al menos 3 participantes para realizar el sorteo."
      };
    }
  
    // Crear una copia de las exclusiones para no modificar el original
    let todasLasExclusiones = [...exclusiones];
    
    // Añadir la nueva exclusión si existe
    if (nuevaExclusion) {
      todasLasExclusiones.push({
        participanteDeId: nuevaExclusion.participanteDeId,
        participanteAId: nuevaExclusion.participanteAId
      });
    }
  
    // Crear un mapa de exclusiones para cada participante
    const mapExclusiones = new Map<number, Set<number>>();
    
    // Inicializar el mapa para todos los participantes
    participantes.forEach(p => {
      mapExclusiones.set(p.id, new Set<number>());
    });
    
    // Añadir todas las exclusiones al mapa
    todasLasExclusiones.forEach(exc => {
      const exclusionesParticipante = mapExclusiones.get(exc.participanteDeId);
      if (exclusionesParticipante) {
        exclusionesParticipante.add(exc.participanteAId);
      }
    });
    
    // Lista para almacenar participantes con problemas
    const participantesProblema: string[] = [];
    const participantesAltoRiesgo: string[] = [];
    
    // Verificar la regla: cada participante debe poder regalar a al menos 1 persona
    for (const participante of participantes) {
      const exclusionesParticipante = mapExclusiones.get(participante.id);
      
      if (exclusionesParticipante) {
        // Este participante no puede regalar a nadie (caso crítico)
        if (exclusionesParticipante.size >= participantes.length - 1) {
          participantesProblema.push(participante.nombre);
        }
        // Este participante solo puede regalar a 1-2 personas (riesgo alto)
        else if (exclusionesParticipante.size >= participantes.length - 3) {
          participantesAltoRiesgo.push(participante.nombre);
        }
      }
    }
    
    // Calcular el nivel de restricción total (cuántas posibles asignaciones están bloqueadas)
    const totalPosiblesAsignaciones = participantes.length * (participantes.length - 1);
    const totalExclusiones = todasLasExclusiones.length;
    
    // Determinar nivel de alerta basado en porcentaje de restricción y problemas encontrados
    let nivelAlerta: 'bajo' | 'medio' | 'alto' = 'bajo';
    
    if (participantesProblema.length > 0) {
      nivelAlerta = 'alto';
    } else if (participantesAltoRiesgo.length > 0) {
      nivelAlerta = 'medio';
    } else if (totalExclusiones > totalPosiblesAsignaciones * 0.3) {
      nivelAlerta = 'medio';
    }
    
    // Si hay participantes que no pueden regalar a nadie, el sorteo es inválido
    if (participantesProblema.length > 0) {
      return {
        esValido: false,
        mensaje: "Las exclusiones hacen imposible el sorteo para algunos participantes.",
        participantesProblema,
        nivelAlerta: 'alto'
      };
    }
    
    // Si hay participantes con alto riesgo, advertir aunque sea técnicamente válido
    if (participantesAltoRiesgo.length > 0) {
      return {
        esValido: true,
        mensaje: "El sorteo es técnicamente posible, pero algunas personas tienen opciones muy limitadas.",
        participantesProblema: participantesAltoRiesgo,
        nivelAlerta: 'medio'
      };
    }
    
    // Verificación básica de ciclos problemáticos
    // Detectamos si hay grupos que solo pueden regalarse entre ellos
    if (participantes.length >= 6 && totalExclusiones > totalPosiblesAsignaciones * 0.4) {
      // Esta es una heurística simplificada - si hay muchas exclusiones en un grupo grande,
      // es probable que haya ciclos problemáticos
      return {
        esValido: true,
        mensaje: "El sorteo puede ser complicado debido al alto número de exclusiones.",
        nivelAlerta: 'medio'
      };
    }
    
    return {
      esValido: true,
      mensaje: "El sorteo es viable con estas exclusiones.",
      nivelAlerta: 'bajo'
    };
  }