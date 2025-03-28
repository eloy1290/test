import React, { useState, useEffect } from 'react';
import { FiPlusCircle, FiX, FiInfo, FiArrowRight, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { validarExclusiones } from '@/lib/exclusionValidator';

interface Participante {
  id: number;
  nombre: string;
  email: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
}

// Interfaz para las exclusiones recibidas como props
interface Exclusion {
  id: number;
  participanteDeId: number;
  participanteAId: number;
  sorteoId: number;
  participanteDe?: { id: number; nombre: string };
  participanteA?: { id: number; nombre: string };
}

// Interfaz simplificada para pasar al validador
interface ExclusionSimple {
  participanteDeId: number;
  participanteAId: number;
}

interface ExclusionesManagerProps {
  participantes: Participante[];
  exclusiones: Exclusion[];
  estadoSorteo: 'PENDIENTE' | 'COMPLETO' | 'CANCELADO'; // Nueva prop para verificar el estado
  onAddExclusion: (participanteDeId: number, participanteAId: number) => Promise<void>;
  onDeleteExclusion: (participanteDeId: number, participanteAId: number) => Promise<void>;
}

const ExclusionesManager: React.FC<ExclusionesManagerProps> = ({
  participantes,
  exclusiones,
  estadoSorteo,
  onAddExclusion,
  onDeleteExclusion,
}) => {
  const [participanteDeId, setParticipanteDeId] = useState<number>(0);
  const [participanteAId, setParticipanteAId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para monitorizar problemas con exclusiones
  const [exclusionesStatus, setExclusionesStatus] = useState<{
    hayProblema: boolean;
    mensaje: string;
    participantesProblema: string[];
    nivelAlerta: 'bajo' | 'medio' | 'alto';
  }>({
    hayProblema: false,
    mensaje: '',
    participantesProblema: [],
    nivelAlerta: 'bajo'
  });

  // Convertir exclusiones al formato simple para el validador
  const getExclusionesSimples = (excs: Exclusion[]): ExclusionSimple[] => {
    return excs.map(exc => ({
      participanteDeId: exc.participanteDeId,
      participanteAId: exc.participanteAId
    }));
  };

  // Monitorizar cambios en exclusiones para detectar problemas
  useEffect(() => {
    if (estadoSorteo === 'PENDIENTE' && participantes.length >= 3 && exclusiones.length > 0) {
      // Obtener participantes simples para el validador
      const participantesSimples = participantes.map(p => ({
        id: p.id,
        nombre: p.nombre
      }));
      
      // Convertir exclusiones al formato simple
      const exclusionesSimples = getExclusionesSimples(exclusiones);
      
      const validacion = validarExclusiones(participantesSimples, exclusionesSimples);
      
      setExclusionesStatus({
        hayProblema: !validacion.esValido,
        mensaje: validacion.mensaje,
        participantesProblema: validacion.participantesProblema || [],
        nivelAlerta: validacion.nivelAlerta || 'bajo'
      });
    } else {
      setExclusionesStatus({
        hayProblema: false,
        mensaje: '',
        participantesProblema: [],
        nivelAlerta: 'bajo'
      });
    }
  }, [participantes, exclusiones, estadoSorteo]);

  const handleAddExclusion = async () => {
    if (participanteDeId === 0 || participanteAId === 0) {
      alert('Debes seleccionar ambos participantes');
      return;
    }

    if (participanteDeId === participanteAId) {
      alert('No puedes excluir a un participante de sí mismo');
      return;
    }

    // Verificar si ya existe esta exclusión
    const exclusionExistente = exclusiones.find(
      (e) => e.participanteDeId === participanteDeId && e.participanteAId === participanteAId
    );

    if (exclusionExistente) {
      alert('Esta exclusión ya existe');
      return;
    }

    // Validar si esta exclusión haría imposible el sorteo
    // Obtener participantes simples para el validador
    const participantesSimples = participantes.map(p => ({
      id: p.id,
      nombre: p.nombre
    }));
    
    // Convertir exclusiones al formato simple
    const exclusionesSimples = getExclusionesSimples(exclusiones);
    
    const validacion = validarExclusiones(
      participantesSimples, 
      exclusionesSimples, 
      { participanteDeId, participanteAId }
    );
    
    if (!validacion.esValido) {
      // Mostrar advertencia con detalles del problema
      const mensajeDetallado = validacion.participantesProblema 
        ? `${validacion.mensaje}\n\nParticipantes afectados: ${validacion.participantesProblema.join(', ')}`
        : validacion.mensaje;
        
      if (!confirm(`⚠️ ADVERTENCIA: ${mensajeDetallado}\n\n¿Estás seguro de que quieres añadir esta exclusión de todas formas?`)) {
        return;
      }
    } else if (validacion.nivelAlerta === 'medio' && validacion.participantesProblema?.length) {
      // Advertencia para nivel medio de riesgo
      const mensajeAdvertencia = `Esta exclusión limita mucho las opciones para: ${validacion.participantesProblema.join(', ')}`;
      if (!confirm(`⚠️ PRECAUCIÓN: ${mensajeAdvertencia}\n\n¿Deseas continuar?`)) {
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onAddExclusion(participanteDeId, participanteAId);
      // Resetear selección
      setParticipanteDeId(0);
      setParticipanteAId(0);
    } catch (error) {
      console.error('Error al añadir exclusión:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExclusion = async (exclusion: Exclusion) => {
    try {
      // Confirmación antes de eliminar
      if (!confirm(`¿Estás seguro que deseas eliminar esta exclusión?`)) {
        return;
      }
      
      console.log('Eliminando exclusión:', {
        participanteDeId: exclusion.participanteDeId,
        participanteAId: exclusion.participanteAId
      });
      
      // Llamada al método recibido por props
      await onDeleteExclusion(exclusion.participanteDeId, exclusion.participanteAId);
      
    } catch (error) {
      console.error('Error al eliminar exclusión:', error);
      alert('No se pudo eliminar la exclusión. Por favor, inténtalo de nuevo.');
    }
  };

  // Obtener los nombres de los participantes para mostrar en las exclusiones
  const getNombreParticipante = (participanteId: number) => {
    const participante = participantes.find(p => p.id === participanteId);
    return participante ? participante.nombre : `Participante ${participanteId}`;
  };
  
  // Determinar si hay suficientes participantes para permitir exclusiones
  const minParticipantesParaSorteo = 3;
  const hayParticipantesSuficientes = participantes.length >= minParticipantesParaSorteo;

  // Obtener el color de fondo para el indicador de nivel de alerta
  const getBgColorForAlertLevel = (nivel: 'bajo' | 'medio' | 'alto') => {
    switch (nivel) {
      case 'alto': return 'bg-red-100 border-red-300 text-red-800';
      case 'medio': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'bajo': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Exclusiones</h3>
        <p className="text-sm text-gray-500 mb-4">
          Las exclusiones permiten definir qué participantes no pueden regalarse entre sí.
          Por ejemplo, puedes excluir a parejas o familiares directos.
        </p>

        {/* Mensaje cuando el sorteo está completado */}
        {estadoSorteo === 'COMPLETO' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start mb-6">
            <FiCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">El sorteo ya ha sido realizado</h3>
              <div className="mt-1 text-sm text-green-700">
                <p>No se pueden añadir o eliminar exclusiones porque el sorteo ya ha sido completado.</p>
                <p className="mt-1">A continuación puedes ver las exclusiones que se aplicaron en el sorteo.</p>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar el resto de los componentes solo si el sorteo está pendiente */}
        {estadoSorteo === 'PENDIENTE' && (
          <>
            {/* Indicador de Nivel de Restricción cuando hay exclusiones */}
            {exclusiones.length > 0 && (
              <div className={`mb-6 border rounded-md p-4 flex items-start ${getBgColorForAlertLevel(exclusionesStatus.nivelAlerta)}`}>
                <FiInfo className={`mt-0.5 mr-3 flex-shrink-0 ${exclusionesStatus.nivelAlerta === 'alto' ? 'text-red-500' : (exclusionesStatus.nivelAlerta === 'medio' ? 'text-yellow-500' : 'text-green-500')}`} />
                <div>
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium">
                      Nivel de restricción: 
                    </h3>
                    <div className="ml-2 text-sm font-bold">
                      {exclusionesStatus.nivelAlerta === 'alto' ? 'Alto' : (exclusionesStatus.nivelAlerta === 'medio' ? 'Medio' : 'Bajo')}
                    </div>
                  </div>
                  <div className="mt-1 text-sm">
                    <p>{exclusionesStatus.mensaje}</p>
                    {exclusionesStatus.participantesProblema.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium">Participantes con opciones limitadas:</span>
                        <ul className="list-disc pl-5 space-y-0.5 mt-1">
                          {exclusionesStatus.participantesProblema.map((nombre, idx) => (
                            <li key={idx}>{nombre}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notas y recomendaciones */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4 flex">
              <FiInfo className="text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Recomendaciones:</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Ten cuidado de no crear exclusiones que hagan imposible el sorteo.</li>
                    <li>Cuantas más exclusiones, más restricciones para el algoritmo.</li>
                    <li>Asegúrate de que siempre exista al menos una posible asignación para cada participante.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Formulario para añadir nuevas exclusiones */}
            <Card className="mb-6">
              <Card.Header>
                <Card.Title>Añadir nueva exclusión</Card.Title>
                <Card.Description>
                  Define qué participante no podrá regalar a otro participante específico
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div className="text-center text-sm text-gray-600 mb-2">
                    <strong>Ejemplo de cómo funciona:</strong>
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0">
                    <div className="font-medium text-gray-800">María</div>
                    <div className="mx-2 flex items-center">
                      <FiArrowRight className="h-4 w-4 text-red-500 mx-1" />
                      <span className="text-xs text-red-500">no podrá regalar a</span>
                      <FiArrowRight className="h-4 w-4 text-red-500 mx-1" />
                    </div>
                    <div className="font-medium text-gray-800">Juan</div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-2">
                    Al añadir esta restricción, el algoritmo nunca asignará a María como amigo invisible de Juan.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="participanteDe" className="block text-sm font-medium text-gray-700 mb-1">
                      Este participante:
                    </label>
                    <select
                      id="participanteDe"
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                      value={participanteDeId}
                      onChange={(e) => setParticipanteDeId(Number(e.target.value))}
                    >
                      <option value={0}>Seleccionar participante</option>
                      {participantes.map((participante) => (
                        <option key={`de-${participante.id}`} value={participante.id}>
                          {participante.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="participanteA" className="block text-sm font-medium text-gray-700 mb-1">
                      NO podrá regalar a:
                    </label>
                    <select
                      id="participanteA"
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                      value={participanteAId}
                      onChange={(e) => setParticipanteAId(Number(e.target.value))}
                      disabled={participanteDeId === 0}
                    >
                      <option value={0}>Seleccionar participante</option>
                      {participantes
                        .filter((p) => p.id !== participanteDeId)
                        .map((participante) => (
                          <option key={`a-${participante.id}`} value={participante.id}>
                            {participante.nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleAddExclusion}
                  leftIcon={<FiPlusCircle />}
                  disabled={isSubmitting || participanteDeId === 0 || participanteAId === 0}
                  isLoading={isSubmitting}
                >
                  Añadir exclusión
                </Button>
              </Card.Content>
            </Card>
          </>
        )}

        {/* Lista de exclusiones actuales - visible siempre */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-md font-medium text-gray-900">Exclusiones actuales</h4>
          {exclusiones.length > 0 && (
            <span className="text-sm text-gray-500">
              Total: {exclusiones.length} exclusion{exclusiones.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        
        {exclusiones.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
            <p className="text-gray-500">No hay exclusiones definidas</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {exclusiones.map((exclusion) => {
                // Buscar los nombres de los participantes en caso de que los objetos anidados no existan
                const nombreDe = exclusion.participanteDe?.nombre || getNombreParticipante(exclusion.participanteDeId);
                const nombreA = exclusion.participanteA?.nombre || getNombreParticipante(exclusion.participanteAId);
                
                // Crear una key única combinando los IDs de ambos participantes
                const uniqueKey = `${exclusion.participanteDeId}-${exclusion.participanteAId}`;
                
                return (
                  <li key={uniqueKey} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center ml-3">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <span className="font-medium text-gray-900">{nombreDe}</span>
                          <span className="text-gray-500 mx-2 text-sm">no puede regalar a</span>
                          <span className="font-medium text-gray-900">{nombreA}</span>
                        </div>
                      </div>
                      {estadoSorteo !== 'COMPLETO' && (
                        <Button
                          onClick={() => handleDeleteExclusion(exclusion)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          aria-label="Eliminar exclusión"
                          title="Eliminar exclusión"
                        >
                          <FiX />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExclusionesManager;