import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlusCircle, FiX, FiSave } from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';

export interface Participante {
  id: number;
  nombre: string;
  email: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  fechaRegistro: string;
  token: string;
}

interface ParticipantesListProps {
  participantes: Participante[];
  onAdd: (participante: { nombre: string; email: string }) => Promise<void>;
  onEdit: (id: number, participante: { nombre: string; email: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ParticipantesList: React.FC<ParticipantesListProps> = ({
  participantes,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({ nombre: '', email: '' });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email) return;
    
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      resetForm();
    } catch (error) {
      console.error('Error al añadir participante:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formData.nombre || !formData.email) return;
    
    setIsSubmitting(true);
    try {
      await onEdit(editingId, formData);
      resetForm();
    } catch (error) {
      console.error('Error al editar participante:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (participante: Participante) => {
    setEditingId(participante.id);
    setFormData({ nombre: participante.nombre, email: participante.email });
  };

  const cancelEditing = () => {
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Botones de acción principales */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Participantes ({participantes.length})</h3>
        <div className="w-full md:w-auto">
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              leftIcon={<FiPlusCircle />}
              variant="primary"
              size="md"
              fullWidth
              className="sm:w-auto"
            >
              Añadir participante
            </Button>
          )}
        </div>
      </div>

      {/* Formulario de añadir participante */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium text-gray-700">Añadir nuevo participante</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Añadir
            </Button>
          </div>
        </form>
      )}

      {/* Lista de participantes */}
      {participantes.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">Aún no hay participantes en este sorteo.</p>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              leftIcon={<FiPlusCircle />}
              variant="outline"
              size="md"
              className="mt-4"
            >
              Añadir el primer participante
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participantes.map((participante) => (
                <tr key={participante.id}>
                  {editingId === participante.id ? (
                    <td colSpan={3} className="px-6 py-4">
                      <form onSubmit={handleEdit} className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            required
                          />
                          <Input
                            placeholder="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            leftIcon={<FiSave />}
                            isLoading={isSubmitting}
                          >
                            Guardar
                          </Button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{participante.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{participante.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(participante)}
                            aria-label="Editar"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(participante.id)}
                            aria-label="Eliminar"
                            title="Eliminar"
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón para añadir más participantes (siempre visible al final) */}
      {participantes.length > 0 && !showAddForm && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setShowAddForm(true)}
            leftIcon={<FiPlusCircle />}
            variant="outline"
            size="sm"
          >
            Añadir otro participante
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParticipantesList;