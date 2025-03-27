// Tipos de estado para el sorteo
export type EstadoSorteo = "PENDIENTE" | "COMPLETO" | "CANCELADO";

// Tipo para el estado del participante
export type EstadoParticipante = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO";

// Información del sorteo
export interface SorteoInfo {
  id: number;
  nombre: string;
  descripcion?: string;
  presupuesto?: number;
  fechaLimite: string;
  fechaCreacion: string;
  fechaSorteo?: string;
  estado: EstadoSorteo;
  creadorEmail: string;
  creadorNombre: string;
  tokenAdmin?: string;
  tokenResultados?: string;
  fechaExpiracion?: string;
}

// Información de participante
export interface Participante {
  id: number;
  nombre: string;
  email: string;
  estado: EstadoParticipante;
  fechaRegistro: string;
  token: string;
  sorteoId: number;
}

// Información de exclusión
export interface Exclusion {
  id: number;
  participanteDeId: number;
  participanteAId: number;
  participanteDe: { id: number; nombre: string };
  participanteA: { id: number; nombre: string };
  sorteoId: number;
}

// Información de asignación
export interface Asignacion {
  id: number;
  participanteDeId: number;
  participanteAId: number;
  sorteoId: number;
  asignacionEncriptada: string;
}

// Información de deseo
export interface Deseo {
  id: number;
  nombre: string;
  descripcion?: string;
  url?: string;
  precioEstimado?: number;
  imagen?: string;
  amazonId?: string;
  amazonAfiliado?: string;
  participanteId: number;
  prioridad: number;
}

// Información de amigo invisible
export interface AmigoInvisible {
  id: number;
  nombre: string;
  email: string;
  token?: string;
}

// Estado para verificar si se puede realizar un sorteo
export interface EstadoVerificacionSorteo {
  puedeRealizarse: boolean;
  estado: EstadoSorteo;
  participantesConfirmados: number;
  participantesPendientes: number;
  participantesRechazados: number;
  suficientesParticipantes: boolean;
  error: string | null;
  razon?: string; 
}