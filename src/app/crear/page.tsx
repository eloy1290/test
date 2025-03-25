'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiCheck } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CrearSorteoForm from '@/components/forms/CrearSorteoForm';

export default function CrearSorteoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adminUrl, setAdminUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/sorteos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el sorteo');
      }

      setSuccess(true);
      setAdminUrl(result.adminUrl);
      
      // Redirigir a la página de administración después de 5 segundos
      setTimeout(() => {
        router.push(result.adminUrl);
      }, 5000);
    } catch (error: any) {
      setError(error.message || 'Error al crear el sorteo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <FiChevronLeft className="mr-1" />
          Volver al inicio
        </Link>

        {!success ? (
          <Card>
            <Card.Header>
              <Card.Title>Crear nuevo sorteo de Amigo Invisible</Card.Title>
              <Card.Description>
                Configura tu sorteo y luego podrás invitar a los participantes.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
              <CrearSorteoForm onSubmit={handleSubmit} />
            </Card.Content>
          </Card>
        ) : (
          <Card>
            <Card.Header className="bg-green-50 border-green-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiCheck className="h-6 w-6 text-green-500" />
                </div>
                <Card.Title className="ml-3 text-green-800">¡Sorteo creado con éxito!</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="mb-4">
                Tu sorteo de Amigo Invisible ha sido creado correctamente. Hemos enviado un correo a tu dirección de email con el enlace para administrar tu sorteo.
              </p>
              <p className="mb-6">
                También puedes guardar el siguiente enlace para administrar tu sorteo:
              </p>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-6 break-all">
                <a href={adminUrl} className="text-primary-600 hover:text-primary-800">
                  {adminUrl}
                </a>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Este enlace es personal y único para ti. No lo compartas con nadie a menos que quieras que puedan administrar el sorteo.
              </p>
              <Button
                onClick={() => router.push(adminUrl)}
                fullWidth
              >
                Ir a la página de administración
              </Button>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}