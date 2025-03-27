import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiCalendar, FiDollarSign, FiMail, FiUser } from 'react-icons/fi';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Schema de validación con Zod
const crearSorteoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  presupuesto: z.string().optional()
    .refine(val => !val || !isNaN(Number(val)), { message: 'El presupuesto debe ser un número' })
    .transform(val => val ? Number(val) : undefined),
  fechaLimite: z.string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'Fecha inválida' }),
  creadorNombre: z.string().min(2, 'Tu nombre debe tener al menos 2 caracteres'),
  creadorEmail: z.string().email('Email inválido'),
});

type CrearSorteoFormValues = z.infer<typeof crearSorteoSchema>;

interface CrearSorteoFormProps {
  onSubmit: (data: CrearSorteoFormValues) => Promise<void>;
}

const CrearSorteoForm: React.FC<CrearSorteoFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CrearSorteoFormValues>({
    resolver: zodResolver(crearSorteoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      presupuesto: '',
      // Fecha predeterminada: 1 mes a partir de hoy
      fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      creadorNombre: '',
      creadorEmail: '',
    }
  });

  const handleFormSubmit = async (data: CrearSorteoFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error al crear sorteo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-primary-50 p-4 rounded-lg mb-6">
        <h3 className="text-primary-700 font-medium mb-2">Información del Sorteo</h3>
        <p className="text-sm text-primary-600">
          Configura los detalles principales de tu Amigo Invisible
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Nombre del sorteo"
          id="nombre"
          placeholder="Ej: Amigo Invisible Navidad 2025"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            id="descripcion"
            rows={3}
            placeholder="Detalles adicionales o instrucciones para los participantes"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('descripcion')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Presupuesto aproximado (€)"
            id="presupuesto"
            type="number"
            placeholder="Ej: 20"
            // leftIcon={<FiDollarSign />}
            hint="Opcional. Ayuda a los participantes a saber cuánto gastar."
            error={errors.presupuesto?.message}
            {...register('presupuesto')}
          />

          <Input
            label="Fecha límite"
            id="fechaLimite"
            type="date"
            leftIcon={<FiCalendar />}
            error={errors.fechaLimite?.message}
            {...register('fechaLimite')}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-blue-700 font-medium mb-2">Información del organizador</h3>
          <p className="text-sm text-blue-600">
            Tus datos para gestionar el sorteo. Recibirás un enlace de administración.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tu nombre"
            id="creadorNombre"
            placeholder="Nombre completo"
            leftIcon={<FiUser />}
            error={errors.creadorNombre?.message}
            {...register('creadorNombre')}
          />

          <Input
            label="Tu email"
            id="creadorEmail"
            type="email"
            placeholder="tu@email.com"
            leftIcon={<FiMail />}
            error={errors.creadorEmail?.message}
            {...register('creadorEmail')}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
        >
          Crear Sorteo de Amigo Invisible
        </Button>
      </div>
    </form>
  );
};

export default CrearSorteoForm;