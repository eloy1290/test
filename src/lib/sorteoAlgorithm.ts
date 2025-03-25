import { PrismaClient, Participante, Exclusion } from '@prisma/client';
import { encrypt } from './encryption';

/**
 * Estructura para representar una asignación
 */
interface AsignacionProcesada {
  de: number;  // ID del participante que regala
  a: number;   // ID del participante que recibe
}

/**
 * Crea un grafo de posibles asignaciones respetando las exclusiones
 * @param participantes - Lista de participantes
 * @param exclusiones - Lista de exclusiones entre participantes
 */
function crearGrafoDeAsignaciones(
  participantes: Participante[],
  exclusiones: Exclusion[]
): Map<number, Set<number>> {
  // Inicializar grafo
  const grafo = new Map<number, Set<number>>();
  
  // Inicializar todos los nodos con todas las posibles conexiones
  // (excepto a sí mismos)
  participantes.forEach(p1 => {
    const conexiones = new Set<number>();
    participantes.forEach(p2 => {
      if (p1.id !== p2.id) {
        conexiones.add(p2.id);
      }
    });
    grafo.set(p1.id, conexiones);
  });
  
  // Aplicar exclusiones
  exclusiones.forEach(exclusion => {
    const conexiones = grafo.get(exclusion.participanteDeId);
    if (conexiones) {
      conexiones.delete(exclusion.participanteAId);
    }
  });
  
  return grafo;
}

/**
 * Verifica si es posible realizar un sorteo con las exclusiones dadas
 * @param grafo - Grafo de posibles asignaciones
 * @param numParticipantes - Número total de participantes
 */
function esFactible(grafo: Map<number, Set<number>>, numParticipantes: number): boolean {
  // Si algún participante no tiene posibles destinos, no es factible
  for (const [_, destinos] of grafo.entries()) {
    if (destinos.size === 0) {
      return false;
    }
  }
  
  // Algoritmo de Hall para verificar si existe un emparejamiento perfecto
  // (Aplicación del teorema de Hall)
  function verificarSubconjunto(subset: number[]): boolean {
    const union = new Set<number>();
    
    subset.forEach(id => {
      const destinos = grafo.get(id);
      if (destinos) {
        destinos.forEach(destino => union.add(destino));
      }
    });
    
    return union.size >= subset.length;
  }
  
  // Comprobar para todos los posibles subconjuntos (forma simplificada)
  // Para cada tamaño de subconjunto
  const participantesIds = Array.from(grafo.keys());
  
  // Verificar subconjuntos de tamaño crítico (donde es más probable fallar)
  // y algunos aleatorios para hacer la comprobación más eficiente
  const tamañosMuestra = [1, 2, 3, Math.floor(numParticipantes / 2), numParticipantes - 1];
  
  for (const tamaño of tamañosMuestra) {
    if (tamaño > numParticipantes) continue;
    
    // Tomamos algunos subconjuntos aleatorios para verificar
    const numPruebas = Math.min(10, Math.pow(2, tamaño));
    
    for (let i = 0; i < numPruebas; i++) {
      // Crear un subconjunto aleatorio de tamaño específico
      const subset: number[] = [];
      const idsCopia = [...participantesIds];
      
      while (subset.length < tamaño && idsCopia.length > 0) {
        const randomIndex = Math.floor(Math.random() * idsCopia.length);
        subset.push(idsCopia[randomIndex]);
        idsCopia.splice(randomIndex, 1);
      }
      
      if (!verificarSubconjunto(subset)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Genera asignaciones aleatorias usando el algoritmo modificado
 * @param grafo - Grafo de posibles asignaciones
 * @param participantes - Lista de participantes
 */
function generarAsignacionesAleatorias(
  grafo: Map<number, Set<number>>,
  participantes: Participante[]
): AsignacionProcesada[] {
  const asignaciones: AsignacionProcesada[] = [];
  const participantesIds = participantes.map(p => p.id);
  
  // Copia del grafo para manipular
  const grafoTrabajo = new Map<number, Set<number>>();
  grafo.forEach((destinos, origen) => {
    grafoTrabajo.set(origen, new Set(destinos));
  });
  
  // Conjunto de participantes disponibles para recibir regalo
  const disponibles = new Set(participantesIds);
  
  // Para cada participante, elegir aleatoriamente a quién regalar
  for (const participanteId of participantesIds) {
    const posiblesDestinos = [...grafoTrabajo.get(participanteId) || []].filter(
      id => disponibles.has(id)
    );
    
    if (posiblesDestinos.length === 0) {
      // Si llegamos a un callejón sin salida, reiniciamos
      return generarAsignacionesAleatorias(grafo, participantes);
    }
    
    // Elegir un destino aleatorio
    const destinoIndex = Math.floor(Math.random() * posiblesDestinos.length);
    const destinoId = posiblesDestinos[destinoIndex];
    
    // Registrar asignación
    asignaciones.push({ de: participanteId, a: destinoId });
    
    // Marcar como no disponible
    disponibles.delete(destinoId);
  }
  
  return asignaciones;
}

/**
 * Verifica si hay un ciclo completo (todos los participantes conectados)
 * @param asignaciones - Lista de asignaciones generadas
 */
function verificarCicloCompleto(asignaciones: AsignacionProcesada[]): boolean {
  if (asignaciones.length === 0) return false;
  
  // Construir mapa de "a quién regala cada uno"
  const mapaAsignaciones = new Map<number, number>();
  asignaciones.forEach(a => {
    mapaAsignaciones.set(a.de, a.a);
  });
  
  // Elegir un participante de inicio
  const inicio = asignaciones[0].de;
  let actual = inicio;
  const visitados = new Set<number>();
  
  // Seguir la cadena de asignaciones
  do {
    visitados.add(actual);
    actual = mapaAsignaciones.get(actual) || -1;
    
    // Si llegamos a un participante ya visitado que no es el inicio,
    // tenemos un ciclo pero no es completo
    if (actual !== inicio && visitados.has(actual)) {
      return false;
    }
    
    // Si no encontramos siguiente, no hay ciclo
    if (actual === -1) {
      return false;
    }
  } while (actual !== inicio);
  
  // Verificar que todos los participantes están en el ciclo
  return visitados.size === asignaciones.length;
}

/**
 * Encripta las asignaciones para guardarlas
 * @param asignaciones - Lista de asignaciones generadas
 */
function encriptarAsignaciones(asignaciones: AsignacionProcesada[]): {
  participanteDeId: number;
  participanteAId: number;
  asignacionEncriptada: string;
}[] {
  return asignaciones.map(asignacion => ({
    participanteDeId: asignacion.de,
    participanteAId: asignacion.a,
    asignacionEncriptada: encrypt(asignacion)
  }));
}

/**
 * Realiza el sorteo de amigo invisible
 * @param prisma - Instancia de Prisma Client
 * @param sorteoId - ID del sorteo a realizar
 */
export async function realizarSorteo(
  prisma: PrismaClient,
  sorteoId: number
): Promise<boolean> {
  try {
    // Obtener participantes
    const participantes = await prisma.participante.findMany({
      where: {
        sorteoId,
        estado: 'CONFIRMADO' // Solo participantes confirmados
      }
    });
    
    if (participantes.length < 3) {
      throw new Error('Se necesitan al menos 3 participantes confirmados para realizar el sorteo');
    }
    
    // Obtener exclusiones
    const exclusiones = await prisma.exclusion.findMany({
      where: { sorteoId }
    });
    
    // Crear grafo de posibles asignaciones
    const grafo = crearGrafoDeAsignaciones(participantes, exclusiones);
    
    // Verificar que el sorteo es posible
    if (!esFactible(grafo, participantes.length)) {
      throw new Error('No es posible realizar el sorteo con las exclusiones indicadas');
    }
    
    // Generar asignaciones
    const asignaciones = generarAsignacionesAleatorias(grafo, participantes);
    
    // Verificar ciclo completo
    if (!verificarCicloCompleto(asignaciones)) {
      // Reintentar si no hay ciclo completo
      return realizarSorteo(prisma, sorteoId);
    }
    
    // Encriptar asignaciones
    const asignacionesEncriptadas = encriptarAsignaciones(asignaciones);
    
    // Guardar asignaciones en la base de datos
    await prisma.$transaction(async (tx) => {
      // Eliminar asignaciones anteriores si existen
      await tx.asignacion.deleteMany({
        where: { sorteoId }
      });
      
      // Insertar nuevas asignaciones
      for (const asignacion of asignacionesEncriptadas) {
        await tx.asignacion.create({
          data: {
            participanteDeId: asignacion.participanteDeId,
            participanteAId: asignacion.participanteAId,
            asignacionEncriptada: asignacion.asignacionEncriptada,
            sorteoId
          }
        });
      }
      
      // Actualizar estado del sorteo
      await tx.sorteo.update({
        where: { id: sorteoId },
        data: {
          estado: 'COMPLETO',
          fechaSorteo: new Date()
        }
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error al realizar el sorteo:', error);
    return false;
  }
}