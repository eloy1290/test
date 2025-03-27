import React, { useState } from 'react';
import { FiPlusCircle, FiX, FiAlertTriangle, FiInfo, FiArrowRight } from 'react-icons/fi';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Participante {
  id: number;
  nombre: string;
  email: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
}

interface Exclusion {
  id: number;
  participanteDeId: number;
  participanteAId: number;
  participanteDe?: { id: number; nombre: string };
  participanteA?: { id: number; nombre: string };
}

interface ExclusionesManagerProps {
  participantes: Participante[];
  exclusiones: Exclusion[];
  onAddExclusion: (participanteDeId: number, participanteAId: number) => Promise<void>;
  onDeleteExclusion: (participanteDeId: number, participanteAId: number) => Promise<void>;
}

const ExclusionesManager: React.FC<ExclusionesManagerProps> = ({
  participantes,
  exclusiones,
  onAddExclusion,
  onDeleteExclusion,
}) => {
  const [participanteDeId, setParticipanteDeId] = useState<number>(0);
  const [participanteAId, setParticipanteAId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await onDeleteExclusion(exclusion.participanteDeId, exclusion.participanteAId);
    } catch (error) {
      console.error('Error al eliminar exclusión:', error);
    }
  };

  // Obtener los nombres de los participantes para mostrar en las exclusiones
  const getNombreParticipante = (participanteId: number) => {
    const participante = participantes.find(p => p.id === participanteId);
    return participante ? participante.nombre : `Participante ${participanteId}`;
  };

  // Filtrar participantes confirmados para las exclusiones
  const participantesConfirmados = participantes.filter((p) => p.estado === 'CONFIRMADO');
  
  // Determinar si hay suficientes participantes para permitir exclusiones
  const minParticipantesParaSorteo = 3;
  const hayParticipantesSuficientes = participantes.length >= minParticipantesParaSorteo;
  const hayConfirmadosSuficientes = participantesConfirmados.length >= minParticipantesParaSorteo;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Exclusiones</h3>
        <p className="text-sm text-gray-500 mb-4">
          Las exclusiones permiten definir qué participantes no pueden regalarse entre sí.
          Por ejemplo, puedes excluir a parejas o familiares directos.
        </p>

        {/* Mensaje informativo sobre requisitos de participantes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start mb-6">
          <FiAlertTriangle className="text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Requisitos para gestionar exclusiones</h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>Este apartado estará disponible una vez los participantes hayan aceptado la invitación (mínimo {minParticipantesParaSorteo} participantes aceptados).</p>
              <p className="mt-1">
                {participantesConfirmados.length} de {minParticipantesParaSorteo} participantes han confirmado.
              </p>
            </div>
          </div>
        </div>

        {hayConfirmadosSuficientes && (
          <>
            {/* Notas y recomendaciones (movidas arriba) */}
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
                      {participantesConfirmados.map((participante) => (
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
                      {participantesConfirmados
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

        {/* Lista de exclusiones actuales */}
        <h4 className="text-md font-medium text-gray-900 mb-2">Exclusiones actuales</h4>
        
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
                
                return (
                  <li key={exclusion.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center ml-3">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <span className="font-medium text-gray-900">{nombreDe}</span>
                          <span className="text-gray-500 mx-2 text-sm">no puede regalar a</span>
                          <span className="font-medium text-gray-900">{nombreA}</span>
                        </div>
                      </div>
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