import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlusCircle, FiX, FiSave, FiMail } from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { AddParticipanteResult, EditParticipanteResult } from '@/hooks/useSorteoStore';

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
  estadoSorteo: 'PENDIENTE' | 'COMPLETO' | 'CANCELADO'; // Añadido estado del sorteo
  onAdd: (participante: { nombre: string; email: string }) => Promise<AddParticipanteResult | void>;
  onEdit: (id: number, participante: { nombre: string; email: string }) => Promise<EditParticipanteResult | void>;
  onDelete: (id: number) => Promise<void>;
  onReenviarInvitacion?: (id: number) => Promise<void>;
}

const ParticipantesList: React.FC<ParticipantesListProps> = ({
  participantes,
  estadoSorteo,
  onAdd,
  onEdit,
  onDelete,
  onReenviarInvitacion,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reenvioEnProceso, setReenvioEnProceso] = useState<{[key: number]: boolean}>({});

  // Determinar si se debe mostrar la columna de reenvío
  const mostrarReenvio = estadoSorteo === 'COMPLETO' && onReenviarInvitacion !== undefined;

  const resetForm = () => {
    setFormData({ nombre: '', email: '' });
    setShowAddForm(false);
    setEditingId(null);
  };
  const validateNombre = (nombre: string): string | null => {
    if (!nombre.trim()) {
      return 'El nombre es obligatorio';
    }
    if (nombre.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return null;
  };
  
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'El email es obligatorio';
    }
    // Regex simple para validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'El email no es válido';
    }
    return null;
  };
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    const nombreError = validateNombre(formData.nombre);
    const emailError = validateEmail(formData.email);
    
    if (nombreError) {
      alert(nombreError);
      return;
    }
    
    if (emailError) {
      alert(emailError);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await onAdd(formData);
      
      // Verificar si la respuesta indica un caso de correo duplicado
      if (result && 'success' in result && !result.success && result.isDuplicate) {
        // Mostrar el mensaje de error pero mantener el formulario abierto para corrección
        alert(result.message || 'Este correo ya está registrado en el sorteo');
      } else {
        // En caso de éxito, resetear el formulario
        resetForm();
      }
    } catch (error: any) {
      console.error('Error al añadir participante:', error);
      
      // Mostrar mensaje de error amigable
      alert(error.message || 'Ha ocurrido un error al añadir el participante');
      
      // No reseteamos el formulario para que el usuario pueda corregir el error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos en el frontend
    const nombreError = validateNombre(formData.nombre);
    const emailError = validateEmail(formData.email);
    
    if (nombreError) {
      alert(nombreError);
      return;
    }
    
    if (emailError) {
      alert(emailError);
      return;
    }
    
    if (!editingId) return;
    
    setIsSubmitting(true);
    try {
      const result = await onEdit(editingId, formData);
      
      // Verificar si hay un resultado y si fue exitoso
      if (result && 'success' in result) {
        if (result.success) {
          // En caso de éxito, resetear el formulario
          resetForm();
        } else if (result.isDuplicate) {
          // Caso específico de correo duplicado
          alert(result.message || 'Este correo ya está registrado en el sorteo');
          // No reseteamos el formulario para que el usuario pueda corregirlo
        } else if (result.validationErrors) {
          // Errores de validación específicos
          let errorMessage = 'Errores de validación:\n';
          
          // Construir un mensaje con todos los errores de validación
          Object.entries(result.validationErrors).forEach(([field, errors]) => {
            if (Array.isArray(errors) && errors.length > 0) {
              errorMessage += `- ${field}: ${errors.join(', ')}\n`;
            }
          });
          
          alert(errorMessage);
        } else {
          // Otro tipo de error
          alert(result.message || 'Error al editar participante');
        }
        // No reseteamos el formulario para permitir correcciones en caso de error
      } else {
        // Si no hay un resultado definido o no tiene la propiedad success,
        // asumimos éxito y reseteamos
        resetForm();
      }
    } catch (error: any) {
      console.error('Error al editar participante:', error);
      
      // Mostrar mensaje de error amigable
      alert(error.message || 'Ha ocurrido un error al editar el participante');
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar el reenvío de invitación
  const handleReenviarInvitacion = async (id: number) => {
    if (!onReenviarInvitacion) return;
    
    setReenvioEnProceso(prev => ({ ...prev, [id]: true }));
    
    try {
      await onReenviarInvitacion(id);
      alert('Invitación reenviada correctamente');
    } catch (error: any) {
      console.error('Error al reenviar invitación:', error);
      alert(error.message || 'Ha ocurrido un error al reenviar la invitación');
    } finally {
      setReenvioEnProceso(prev => ({ ...prev, [id]: false }));
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
          {!showAddForm && estadoSorteo === 'PENDIENTE' && (
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
      {showAddForm && estadoSorteo === 'PENDIENTE' && (
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
          {!showAddForm && estadoSorteo === 'PENDIENTE' && (
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
                {mostrarReenvio && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reenviar Invitación
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {participantes.map((participante) => {
              // Usar una key compuesta para asegurar unicidad incluso durante edición
              const key = `participante-${participante.id}-${editingId === participante.id ? 'editing' : 'normal'}`;
              
              return (
                <tr key={key}>
                  {editingId === participante.id ? (
                    <td colSpan={mostrarReenvio ? 4 : 3} className="px-6 py-4">
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
                      {mostrarReenvio && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReenviarInvitacion(participante.id)}
                            disabled={reenvioEnProceso[participante.id]}
                            aria-label="Reenviar invitación"
                            title="Reenviar invitación"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {reenvioEnProceso[participante.id] ? (
                              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                            ) : (
                              <FiMail />
                            )}
                          </Button>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {/* Mostrar siempre los botones de acciones, independientemente del estado */}
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
              );
            })}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón para añadir más participantes (siempre visible al final) */}
      {participantes.length > 0 && !showAddForm && estadoSorteo === 'PENDIENTE' && (
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