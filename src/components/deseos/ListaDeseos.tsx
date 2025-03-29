import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlusCircle, FiX, FiSave, FiExternalLink, FiLink, FiShoppingBag } from 'react-icons/fi';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

export interface Deseo {
  id: number;
  nombre: string;
  descripcion?: string;
  url?: string;
  precioEstimado?: number;
  imagen?: string;
  amazonId?: string;
  amazonAfiliado?: string;
  prioridad: number;
}

interface ListaDeseosProps {
  deseos: Deseo[];
  readOnly?: boolean;
  esAmigo?: boolean;
  onAdd?: (deseo: Omit<Deseo, 'id'>) => Promise<void>;
  onEdit?: (id: number, deseo: Partial<Deseo>) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onBuscarProductos?: () => void;
}

const ListaDeseos: React.FC<ListaDeseosProps> = ({
  deseos,
  readOnly = false,
  esAmigo = false,
  onAdd,
  onEdit,
  onDelete,
  onBuscarProductos,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Deseo, 'id'>>({
    nombre: '',
    descripcion: '',
    url: '',
    precioEstimado: undefined,
    imagen: '',
    amazonId: '',
    amazonAfiliado: '',
    prioridad: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      url: '',
      precioEstimado: undefined,
      imagen: '',
      amazonId: '',
      amazonAfiliado: '',
      prioridad: 0,
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !onAdd) return;
    
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      resetForm();
    } catch (error) {
      console.error('Error al añadir deseo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formData.nombre || !onEdit) return;
    
    setIsSubmitting(true);
    try {
      await onEdit(editingId, formData);
      resetForm();
    } catch (error) {
      console.error('Error al editar deseo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (deseo: Deseo) => {
    setEditingId(deseo.id);
    setFormData({
      nombre: deseo.nombre,
      descripcion: deseo.descripcion || '',
      url: deseo.url || '',
      precioEstimado: deseo.precioEstimado,
      imagen: deseo.imagen || '',
      amazonId: deseo.amazonId || '',
      amazonAfiliado: deseo.amazonAfiliado || '',
      prioridad: deseo.prioridad,
    });
  };

  const cancelEditing = () => {
    resetForm();
  };

  const handlePrioridadChange = (id: number, newPrioridad: number) => {
    if (!onEdit) return;
    
    onEdit(id, { prioridad: newPrioridad });
  };

  const ordenarPorPrioridad = (a: Deseo, b: Deseo) => b.prioridad - a.prioridad;

  const renderDeseoForm = () => (
    <form onSubmit={editingId ? handleEdit : handleAdd} className="space-y-4">
      <Input
        label="Nombre del regalo"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        placeholder="Ej: Libro, Gadget, etc."
        required
      />
      
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          rows={3}
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Detalles adicionales, color, tamaño, etc."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="URL producto (opcional)"
          value={formData.url || ''}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://..."
          leftIcon={<FiLink />}
        />
        
        <Input
          label="Precio estimado (€, opcional)"
          type="number"
          value={formData.precioEstimado?.toString() || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            precioEstimado: e.target.value ? Number(e.target.value) : undefined 
          })}
          placeholder="Ej: 25"
        />
      </div>
      
      {/* <Input
        label="URL de imagen (opcional)"
        value={formData.imagen || ''}
        onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
        placeholder="https://..."
      /> */}
      
      {/* Campo oculto para prioridad */}
      <input 
        type="hidden" 
        value={formData.prioridad} 
      />
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={cancelEditing}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          leftIcon={editingId ? <FiSave /> : <FiPlusCircle />}
          isLoading={isSubmitting}
        >
          {editingId ? 'Guardar cambios' : 'Añadir a mi lista'}
        </Button>
      </div>
    </form>
  );

  // Función para abrir Amazon
  const handleOpenAmazon = () => {
    window.open('https://amzn.to/4hPsiYT', '_blank');
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Mi Lista de Deseos</h3>
          {!showAddForm && !editingId && (
            <div className="space-x-2">
              <Button
                onClick={handleOpenAmazon}
                variant="amazon"
                size="sm"
                leftIcon={<FiShoppingBag />}
              >
                Ver en Amazon
              </Button>
              {onBuscarProductos && (
                <Button
                  onClick={onBuscarProductos}
                  variant="outline"
                  size="sm"
                  leftIcon={<FiShoppingBag />}
                >
                  Buscar en Amazon
                </Button>
              )}
              <Button
                onClick={() => setShowAddForm(true)}
                leftIcon={<FiPlusCircle />}
                variant="primary"
                size="sm"
              >
                Añadir deseo
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Form para añadir o editar */}
      {!readOnly && (showAddForm || editingId !== null) && (
        <Card className="mb-6">
          <Card.Header>
            <Card.Title>{editingId ? 'Editar deseo' : 'Añadir nuevo deseo'}</Card.Title>
          </Card.Header>
          <Card.Content>
            {renderDeseoForm()}
          </Card.Content>
        </Card>
      )}

      {/* Lista de deseos */}
      {deseos.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">
            {readOnly 
              ? 'Esta persona aún no ha añadido nada a su lista de deseos.'
              : 'Aún no has añadido nada a tu lista de deseos.'}
          </p>
          {!readOnly && !showAddForm && (
            <div className="mt-4 space-x-2">
              <Button
                onClick={handleOpenAmazon}
                variant="amazon"
                leftIcon={<FiShoppingBag />}
              >
                Ver en Amazon
              </Button>
              {onBuscarProductos && (
                <Button
                  onClick={onBuscarProductos}
                  variant="outline"
                  leftIcon={<FiShoppingBag />}
                >
                  Buscar en Amazon
                </Button>
              )}
              <Button
                onClick={() => setShowAddForm(true)}
                leftIcon={<FiPlusCircle />}
                variant="outline"
              >
                Añadir mi primer deseo
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...deseos].sort(ordenarPorPrioridad).map((deseo) => (
            <Card key={deseo.id}>
              {deseo.imagen && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={deseo.imagen} 
                    alt={deseo.nombre} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Card.Content>
                <h4 className="font-medium text-gray-900 text-lg">{deseo.nombre}</h4>
                {deseo.descripcion && (
                  <p className="mt-1 text-sm text-gray-500">{deseo.descripcion}</p>
                )}
                {deseo.precioEstimado && (
                  <p className="mt-2 text-primary-600 font-medium">
                    Aprox. {deseo.precioEstimado.toFixed(2)} €
                  </p>
                )}
                
                
                <div className="mt-4 flex justify-between items-center">
  {deseo.url && (
    <div>
      <a 
        href={deseo.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="primary"
          leftIcon={<FiExternalLink />}
          size="sm"
        >
          Ver producto
        </Button>
      </a>
    </div>
  )}
  
  {!readOnly && (
    <div className="flex space-x-2">
      {onEdit && (
        <div className="flex space-x-1 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePrioridadChange(deseo.id, deseo.prioridad + 1)}
            aria-label="Aumentar prioridad"
            title="Aumentar prioridad"
            className="text-gray-500 hover:text-gray-700"
          >
            👍
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePrioridadChange(deseo.id, Math.max(0, deseo.prioridad - 1))}
            aria-label="Disminuir prioridad"
            title="Disminuir prioridad"
            className="text-gray-500 hover:text-gray-700"
            disabled={deseo.prioridad <= 0}
          >
            👎
          </Button>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => startEditing(deseo)}
        aria-label="Editar"
        title="Editar"
      >
        <FiEdit2 />
      </Button>
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(deseo.id)}
          aria-label="Eliminar"
          title="Eliminar"
          className="text-red-600 hover:text-red-800"
        >
          <FiTrash2 />
        </Button>
      )}
    </div>
  )}
</div>
                
                {!readOnly && deseo.amazonId && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Producto de Amazon
                    </p>
                  </div>
                )}
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaDeseos;