import React, { useState } from 'react';
import { FiPlusCircle, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
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
  participanteDe: { id: number; nombre: string };
  participanteA: { id: number; nombre: string };
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

  // Filtrar participantes confirmados para las exclusiones
  const participantesConfirmados = participantes.filter((p) => p.estado === 'CONFIRMADO');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Exclusiones</h3>
        <p className="text-sm text-gray-500 mb-4">
          Las exclusiones permiten definir qué participantes no pueden regalarse entre sí.
          Por ejemplo, puedes excluir a parejas o familiares directos.
        </p>

        {participantesConfirmados.length < 2 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start mb-6">
            <FiAlertTriangle className="text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">No hay suficientes participantes confirmados</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>Se necesitan al menos 2 participantes confirmados para crear exclusiones.</p>
              </div>
            </div>
          </div>
        ) : (
          <Card className="mb-6">
            <Card.Header>
              <Card.Title>Añadir nueva exclusión</Card.Title>
              <Card.Description>
                Selecciona qué participante no puede regalar a quién
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="participanteDe" className="block text-sm font-medium text-gray-700 mb-1">
                    Participante que NO puede regalar a:
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
                    No puede regalar a:
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
              {exclusiones.map((exclusion) => (
                <li key={exclusion.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">{exclusion.participanteDe.nombre}</span>
                        <span className="text-gray-500 mx-2">no puede regalar a</span>
                        <span className="font-medium text-gray-900">{exclusion.participanteA.nombre}</span>
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
              ))}
            </ul>
          </div>
        )}
        
        {/* Notas y recomendaciones */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4 flex">
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
      </div>
    </div>
  );
};

export default ExclusionesManager;